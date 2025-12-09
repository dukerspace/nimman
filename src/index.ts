#!/usr/bin/env node

import { Command } from 'commander'
import * as fs from 'fs-extra'
import * as path from 'path'
import { deployCommand } from './commands/deploy'
import { initCommand } from './commands/init'
import { setupCommand } from './commands/setup'

// Get version from package.json
let version = '1.0.0'
try {
  const packageJsonPath = path.resolve(__dirname || process.cwd(), '../package.json')
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    version = packageJson.version || version
  }
} catch {
  // Use default version if package.json can't be read
}

const program = new Command()

program
  .name('nimman')
  .description('Zero-downtime deployment tool for Node.js/Bun projects')
  .version(version)

program
  .command('init')
  .description('Initialize a new deployment configuration')
  .option('-p, --path <path>', 'Project path', process.cwd())
  .action(initCommand)

program
  .command('setup')
  .description('Setup Nginx and Certbot on the server')
  .option('-c, --config <path>', 'Config file path', 'nimman.yml')
  .action(setupCommand)

program
  .command('deploy')
  .description('Deploy project with zero-downtime')
  .option('-c, --config <path>', 'Config file path', 'nimman.yml')
  .option('-e, --env <env>', 'Environment (production, staging)', 'production')
  .option('--skip-ssl', 'Skip SSL certificate setup')
  .action(deployCommand)

program.parse()
