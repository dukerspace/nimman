import * as fs from 'fs-extra';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { DeploymentConfig } from './types';

export type { DeploymentConfig };

export async function loadConfig(configPath: string): Promise<DeploymentConfig> {
  const fullPath = path.resolve(configPath);
  
  if (!(await fs.pathExists(fullPath))) {
    throw new Error(`Config file not found: ${fullPath}`);
  }

  const content = await fs.readFile(fullPath, 'utf-8');
  const config = yaml.load(content) as DeploymentConfig;

  // Validate required fields
  if (!config.project) {
    throw new Error('Config must have a "project" section');
  }
  if (!config.project.name || !config.project.domain) {
    throw new Error('Project must have "name" and "domain" fields');
  }
  if (!config.services || config.services.length === 0) {
    throw new Error('Config must have at least one service');
  }

  // Set defaults
  config.nginx = config.nginx || { enabled: true };
  config.ssl = config.ssl || { enabled: true, provider: 'certbot' };
  config.pm2 = config.pm2 || { instances: 1 };

  return config;
}

export async function saveConfig(config: DeploymentConfig, configPath: string): Promise<void> {
  const fullPath = path.resolve(configPath);
  const content = yaml.dump(config, { indent: 2 });
  await fs.writeFile(fullPath, content, 'utf-8');
}

