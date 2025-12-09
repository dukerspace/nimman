import * as path from 'path';
import { ServiceConfig } from '../types';
import { runCommand } from '../utils/shell';
import { logger } from '../utils/logger';
import * as fs from 'fs-extra';

export class BuildService {
  async buildService(service: ServiceConfig, projectPath: string): Promise<void> {
    const servicePath = path.resolve(projectPath, service.path);

    if (!(await fs.pathExists(servicePath))) {
      throw new Error(`Service path does not exist: ${servicePath}`);
    }

    // Check if build is needed
    if (!service.build?.command) {
      logger.info(`No build command for ${service.name}, skipping build`);
      return;
    }

    logger.step(`Building ${service.name}...`);

    // Parse build command (support npm, yarn, pnpm, bun)
    const buildCmd = service.build.command;
    const [cmd, ...args] = buildCmd.split(' ');

    try {
      await runCommand(cmd, args, { cwd: servicePath });
      logger.success(`${service.name} built successfully`);
    } catch (error) {
      logger.error(`Build failed for ${service.name}`);
      throw error;
    }
  }

  async buildAll(services: ServiceConfig[], projectPath: string): Promise<void> {
    for (const service of services) {
      if (service.build?.command) {
        await this.buildService(service, projectPath);
      }
    }
  }
}

