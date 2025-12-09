import * as fs from 'fs-extra'
import * as path from 'path'
import { DeploymentConfig } from '../types'
import { logger } from '../utils/logger'
import { requireCommand, runCommand } from '../utils/shell'

export class PM2Service {
  private configPath: string

  constructor(private projectPath: string) {
    this.configPath = path.join(projectPath, 'ecosystem.config.js')
  }

  async ensureInstalled(): Promise<void> {
    await requireCommand('pm2', 'Install with: npm install -g pm2')
  }

  private async findInterpreterPath(interpreter: string): Promise<string> {
    try {
      const { stdout } = await runCommand('which', [interpreter], { silent: true })
      const path = stdout.trim()
      if (path && path.length > 0) {
        return path
      }
      throw new Error(`Interpreter ${interpreter} not found`)
    } catch (error) {
      // Try to find it in common locations
      const commonPaths = [
        '/usr/local/bin/bun',
        '/opt/homebrew/bin/bun',
        process.env.HOME ? `${process.env.HOME}/.bun/bin/bun` : null,
      ].filter(Boolean) as string[]

      for (const commonPath of commonPaths) {
        try {
          await fs.access(commonPath)
          return commonPath
        } catch {
          continue
        }
      }

      // If all else fails, throw an error
      throw new Error(
        `Could not find ${interpreter} interpreter. Please ensure it's installed and in your PATH.`
      )
    }
  }

  async createEcosystemConfig(config: DeploymentConfig): Promise<void> {
    const apps = await Promise.all(
      config.services.map(async (service) => {
        // Use script/args if provided, otherwise split command
        let script: string
        let args: string[] | undefined

        if (service.start.script) {
          script = service.start.script
          args = service.start.args
        } else if (service.start.command) {
          // Split command into script and args
          const commandParts = service.start.command.trim().split(/\s+/)
          script = commandParts[0]
          args = commandParts.length > 1 ? commandParts.slice(1) : undefined
        } else {
          throw new Error(
            `Service ${service.name} must have either 'command' or 'script' in start config`
          )
        }

        const appConfig: any = {
          name: service.name,
          script: script,
          // instances: service.instances || config.pm2?.instances || 1,
          // exec_mode: 'cluster',
          env: {
            NODE_ENV: 'production',
            PORT: service.port,
            ...service.env,
          },
        }

        if (args && args.length > 0) {
          appConfig.args = args
        }

        if (service.start.cwd) {
          appConfig.cwd = path.resolve(this.projectPath, service.start.cwd)
        } else {
          // Use service path if no explicit cwd
          appConfig.cwd = path.resolve(this.projectPath, service.path)
        }

        if (config.pm2?.maxMemory) {
          appConfig.max_memory_restart = config.pm2.maxMemory
        }

        // Runtime-specific settings
        if (service.runtime === 'bun') {
          const bunPath = await this.findInterpreterPath('bun')

          // When script is "bun" itself (e.g., "bun run start"), don't set interpreter
          // because PM2 would execute: /path/to/bun bun run start (wrong)
          // Instead, let it run as: bun run start
          // When script is a file (e.g., "index.ts"), set interpreter to bun
          if (script !== 'bun') {
            appConfig.interpreter = bunPath
          }
          // Note: If script is "bun", we don't set interpreter to avoid double execution
        }

        return appConfig
      })
    )

    const ecosystemConfig = `module.exports = {
  apps: ${JSON.stringify(apps, null, 2)}
};`

    await fs.writeFile(this.configPath, ecosystemConfig, 'utf-8')
    logger.success(`Created PM2 ecosystem config: ${this.configPath}`)
  }

  async deploy(serviceName?: string): Promise<void> {
    await this.ensureInstalled()

    if (serviceName) {
      // Reload specific service (zero-downtime)
      logger.step(`Reloading service: ${serviceName}`)
      await runCommand('pm2', ['reload', serviceName], { cwd: this.projectPath })
      logger.success(`Service ${serviceName} reloaded`)
    } else {
      // Deploy all services
      logger.step('Deploying all services with PM2')

      // Check if services are already running
      const { stdout } = await runCommand('pm2', ['list'], { silent: true })
      const isRunning = stdout.includes('online')

      if (isRunning) {
        // Zero-downtime reload
        logger.step('Performing zero-downtime reload...')
        await runCommand('pm2', ['reload', 'all'], { cwd: this.projectPath })
        logger.success('All services reloaded with zero-downtime')
      } else {
        // First time deployment
        logger.step('Starting services for the first time...')
        await runCommand('pm2', ['start', this.configPath], { cwd: this.projectPath })
        await runCommand('pm2', ['save'], { cwd: this.projectPath })
        await runCommand('pm2', ['startup'], { cwd: this.projectPath })
        logger.success('All services started')
      }
    }
  }

  async stop(serviceName?: string): Promise<void> {
    await this.ensureInstalled()
    if (serviceName) {
      await runCommand('pm2', ['stop', serviceName], { cwd: this.projectPath })
    } else {
      await runCommand('pm2', ['stop', 'all'], { cwd: this.projectPath })
    }
  }

  async restart(serviceName?: string): Promise<void> {
    await this.ensureInstalled()
    if (serviceName) {
      await runCommand('pm2', ['restart', serviceName], { cwd: this.projectPath })
    } else {
      await runCommand('pm2', ['restart', 'all'], { cwd: this.projectPath })
    }
  }
}
