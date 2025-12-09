import * as path from 'path';
import { loadConfig } from '../config';
import { PM2Service } from '../services/pm2';
import { BuildService } from '../services/build';
import { logger } from '../utils/logger';

export async function deployCommand(options: { config: string; env: string; skipSsl: boolean }) {
  const configPath = path.resolve(options.config);
  const projectPath = path.dirname(configPath);

  logger.step('Loading configuration...');
  const config = await loadConfig(configPath);

  logger.info(`Deploying: ${config.project.name} (${config.project.domain})`);
  logger.info(`Environment: ${options.env}`);

  // Build services
  logger.step('Building services...');
  const buildService = new BuildService();
  await buildService.buildAll(config.services, projectPath);

  // Setup PM2
  logger.step('Setting up PM2...');
  const pm2 = new PM2Service(projectPath);
  await pm2.createEcosystemConfig(config);

  // Deploy with zero-downtime
  logger.step('Deploying services with zero-downtime...');
  await pm2.deploy();

  logger.success('Deployment completed!');
  logger.info(`Your services are running at: https://${config.project.domain}`);
  logger.info('Check status with: pm2 status');
  logger.info('View logs with: pm2 logs');
}

