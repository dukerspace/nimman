import * as fs from 'fs-extra'
import inquirer from 'inquirer'
import * as path from 'path'
import { DeploymentConfig, saveConfig } from '../config'
import { logger } from '../utils/logger'

export async function initCommand(options: { path: string }) {
  const projectPath = path.resolve(options.path)
  const configPath = path.join(projectPath, 'nimman.yml')

  if (await fs.pathExists(configPath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'nimman.yml already exists. Overwrite?',
        default: false,
      },
    ])

    if (!overwrite) {
      logger.info('Cancelled')
      return
    }
  }

  logger.step('Initializing Nimman configuration...')

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: path.basename(projectPath),
    },
    {
      type: 'input',
      name: 'domain',
      message: 'Domain name:',
      validate: (input) => input.length > 0 || 'Domain is required',
    },
    {
      type: 'input',
      name: 'email',
      message: "Email for Let's Encrypt:",
      validate: (input) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(input) || 'Valid email is required'
      },
    },
    {
      type: 'confirm',
      name: 'hasFrontend',
      message: 'Do you have a frontend service?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'hasBackend',
      message: 'Do you have a backend service?',
      default: true,
    },
  ])

  const services: any[] = []

  if (answers.hasFrontend) {
    const frontendAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Frontend service name:',
        default: 'frontend',
      },
      {
        type: 'input',
        name: 'path',
        message: 'Frontend path (relative to project):',
        default: 'frontend',
      },
      {
        type: 'list',
        name: 'runtime',
        message: 'Frontend runtime:',
        choices: ['node', 'bun'],
        default: 'node',
      },
      {
        type: 'input',
        name: 'buildCommand',
        message: 'Build command:',
        default: 'npm run build',
      },
      {
        type: 'input',
        name: 'buildOutput',
        message: 'Build output directory:',
        default: 'dist',
      },
    ])

    services.push({
      name: frontendAnswers.name,
      type: 'frontend',
      runtime: frontendAnswers.runtime,
      port: 3000,
      path: frontendAnswers.path,
      build: {
        command: frontendAnswers.buildCommand,
        output: frontendAnswers.buildOutput,
      },
      start: {
        command: 'echo "Frontend served by Nginx"',
      },
    })
  }

  if (answers.hasBackend) {
    const backendAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Backend service name:',
        default: 'backend',
      },
      {
        type: 'input',
        name: 'path',
        message: 'Backend path (relative to project):',
        default: 'backend',
      },
      {
        type: 'list',
        name: 'runtime',
        message: 'Backend runtime:',
        choices: ['node', 'bun'],
        default: 'node',
      },
      {
        type: 'input',
        name: 'port',
        message: 'Backend port:',
        default: 3001,
        validate: (input) => {
          const port = parseInt(input)
          return (!isNaN(port) && port > 0 && port < 65536) || 'Valid port required'
        },
      },
      {
        type: 'input',
        name: 'startCommand',
        message: 'Start command:',
        default: 'npm start',
      },
      {
        type: 'confirm',
        name: 'hasBuild',
        message: 'Does backend need building?',
        default: false,
      },
      {
        type: 'input',
        name: 'buildCommand',
        message: 'Build command:',
        default: 'npm run build',
        when: (answers) => answers.hasBuild,
      },
    ])

    const backendService: any = {
      name: backendAnswers.name,
      type: 'backend',
      runtime: backendAnswers.runtime,
      port: parseInt(backendAnswers.port),
      path: backendAnswers.path,
      start: {
        command: backendAnswers.startCommand,
      },
    }

    if (backendAnswers.hasBuild) {
      backendService.build = {
        command: backendAnswers.buildCommand,
      }
    }

    services.push(backendService)
  }

  const config: DeploymentConfig = {
    project: {
      name: answers.projectName,
      domain: answers.domain,
      email: answers.email,
    },
    services,
    nginx: {
      enabled: true,
    },
    ssl: {
      enabled: true,
      provider: 'certbot',
    },
    pm2: {
      instances: 1,
    },
  }

  await saveConfig(config, configPath)
  logger.success(`Configuration saved to ${configPath}`)
  logger.info('You can now run: nimman setup && nimman deploy')
}
