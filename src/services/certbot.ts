import { DeploymentConfig } from '../types';
import { runCommand, requireCommand } from '../utils/shell';
import { logger } from '../utils/logger';

export class CertbotService {
  constructor(private config: DeploymentConfig) {}

  async ensureInstalled(): Promise<void> {
    await requireCommand('certbot', 'Install with: sudo apt-get install certbot python3-certbot-nginx (Ubuntu/Debian)');
  }

  async setupSSL(): Promise<void> {
    await this.ensureInstalled();

    const { domain, email } = this.config.project;

    logger.step(`Setting up SSL certificate for ${domain}...`);

    // Check if running as root
    const { stdout: whoami } = await runCommand('whoami', [], { silent: true });
    const isRoot = whoami.trim() === 'root';

    if (!isRoot) {
      throw new Error('Certbot requires root privileges. Run with sudo.');
    }

    try {
      // Run certbot with nginx plugin for automatic configuration
      await runCommand('certbot', [
        '--nginx',
        '-d', domain,
        '-d', `www.${domain}`,
        '--non-interactive',
        '--agree-tos',
        '--email', email,
        '--redirect', // Automatically redirect HTTP to HTTPS
      ]);

      logger.success(`SSL certificate installed for ${domain}`);
      
      // Setup auto-renewal
      logger.step('Setting up auto-renewal...');
      await runCommand('systemctl', ['enable', 'certbot.timer']);
      await runCommand('systemctl', ['start', 'certbot.timer']);
      logger.success('Auto-renewal configured');
    } catch (error: any) {
      // If certificate already exists, that's okay
      if (error.message?.includes('already exists') || error.stderr?.includes('already exists')) {
        logger.warn('SSL certificate already exists');
        return;
      }
      throw error;
    }
  }

  async renew(): Promise<void> {
    await this.ensureInstalled();
    logger.step('Renewing SSL certificates...');
    await runCommand('certbot', ['renew', '--quiet']);
    logger.success('SSL certificates renewed');
  }
}

