import * as path from 'path'
import { loadConfig } from '../config'
import { CertbotService } from '../services/certbot'
import { NginxService } from '../services/nginx'
import { logger } from '../utils/logger'

export async function setupCommand(options: { config: string }) {
  const configPath = path.resolve(options.config)
  const projectPath = path.dirname(configPath)

  logger.step('Loading configuration...')
  const config = await loadConfig(configPath)

  logger.info(`Setting up: ${config.project.name} (${config.project.domain})`)

  // Setup Nginx
  if (config.nginx?.enabled) {
    logger.step('Setting up Nginx...')
    const nginx = new NginxService(config, projectPath)
    await nginx.setup()
  }

  // Setup SSL (optional, can be done later)
  if (config.ssl?.enabled && config.ssl.provider === 'certbot') {
    logger.step('Setting up SSL with Certbot...')
    try {
      const certbot = new CertbotService(config)
      await certbot.setupSSL()

      // Enable HTTPS in Nginx after SSL is set up
      const nginx = new NginxService(config, projectPath)
      await nginx.enableHTTPS()
    } catch (error: any) {
      logger.warn(`SSL setup failed: ${error.message}`)
      logger.info('You can set up SSL later by running: sudo certbot --nginx -d yourdomain.com')
    }
  }

  logger.success('Setup completed!')
  logger.info('Next step: Run "nimman deploy" to deploy your services')
}
