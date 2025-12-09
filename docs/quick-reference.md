# Nimman CLI Quick Reference

Quick reference card for common Nimman commands and configurations.

## Commands

### Initialize
```bash
nimman init                    # Initialize in current directory
nimman init --path /path/to/app  # Initialize in specific directory
```

### Setup
```bash
sudo nimman setup              # Setup Nginx and SSL
sudo nimman setup --config custom.yml  # Use custom config
```

### Deploy
```bash
nimman deploy                 # Deploy to production
nimman deploy --env staging   # Deploy to staging
nimman deploy --skip-ssl      # Skip SSL setup
nimman deploy --config staging.yml  # Use custom config
```

## Configuration File Structure

```yaml
project:
  name: my-app
  domain: example.com
  email: admin@example.com

services:
  - name: frontend
    type: frontend
    runtime: node
    port: 3000
    path: frontend
    build:
      command: npm run build
      output: dist
    start:
      command: echo "Frontend served by Nginx"

  - name: backend
    type: backend
    runtime: node
    port: 3001
    path: backend
    build:
      command: npm run build
    start:
      command: node dist/index.js
    instances: 2
    env:
      NODE_ENV: production
      PORT: 3001

nginx:
  enabled: true

ssl:
  enabled: true
  provider: certbot

pm2:
  instances: 1
  maxMemory: 500M
```

## Service Types

### Frontend
```yaml
- name: frontend
  type: frontend
  runtime: node
  port: 3000
  path: frontend
  build:
    command: npm run build
    output: dist
```

### Backend
```yaml
- name: backend
  type: backend
  runtime: node  # or 'bun'
  port: 3001
  path: backend
  build:
    command: npm run build
  start:
    command: node dist/index.js
  instances: 2
  env:
    NODE_ENV: production
```

### Worker/Service
```yaml
- name: worker
  type: service
  runtime: node
  port: 3002
  path: worker
  start:
    command: node worker.js
```

## Runtime Options

- `node` - Node.js runtime
- `bun` - Bun runtime

## PM2 Management

```bash
pm2 status              # Check status
pm2 logs                # View logs
pm2 logs backend        # View specific service logs
pm2 restart backend     # Restart service
pm2 reload backend      # Zero-downtime reload
pm2 stop backend        # Stop service
pm2 monit               # Monitor resources
pm2 save                # Save process list
pm2 startup             # Setup auto-start on boot
```

## Nginx Management

```bash
sudo nginx -t                    # Test configuration
sudo systemctl reload nginx      # Reload Nginx
sudo systemctl status nginx      # Check status
sudo tail -f /var/log/nginx/error.log  # View error logs
```

## Common Workflows

### First Time Setup
```bash
nimman init
sudo nimman setup
nimman deploy
```

### Update Deployment
```bash
git pull
nimman deploy
```

### Deploy to Staging
```bash
nimman deploy --config nimman.staging.yml --env staging
```

### Check Status
```bash
pm2 status
pm2 logs
curl https://yourdomain.com
```

## Troubleshooting Commands

```bash
# Check if services are installed
which nginx
which certbot
which pm2

# Check ports
sudo lsof -i :3001

# Check DNS
nslookup yourdomain.com

# Check firewall
sudo ufw status

# View logs
pm2 logs
sudo tail -f /var/log/nginx/error.log
journalctl -xe
```

## File Locations

- Configuration: `nimman.yml` (project root)
- PM2 Config: `ecosystem.config.js` (project root, auto-generated)
- Nginx Config: `/etc/nginx/sites-available/<project-name>.conf`
- Nginx Enabled: `/etc/nginx/sites-enabled/<project-name>.conf`
- SSL Certificates: `/etc/letsencrypt/live/<domain>/`

## Environment Variables

Set in `nimman.yml`:
```yaml
services:
  - name: backend
    env:
      NODE_ENV: production
      DATABASE_URL: postgresql://localhost/mydb
      API_KEY: your-api-key
```

Or use system environment variables and reference in config.

## Best Practices

1. **Version Control**: Commit `nimman.yml` to git
2. **Test Locally**: Test builds before deploying
3. **Backup**: Backup before major deployments
4. **Monitor**: Check `pm2 status` after deployment
5. **Health Checks**: Implement `/health` endpoints
6. **Gradual Rollout**: Test in staging first

## Quick Links

- [Full Documentation](./document.md)
- [Getting Started](./getting-started.md)
- [Examples](./examples/)

