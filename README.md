# Nimman

Zero-downtime deployment tool for Node.js, Bun projects with automatic Nginx reverse proxy and HTTPS setup.

## Features

- ✅ **Automatic Nginx reverse proxy setup** - Configures Nginx for your services automatically
- ✅ **Automatic HTTPS with Certbot** - Sets up Let's Encrypt SSL certificates
- ✅ **Zero-downtime deployment** - Uses PM2 reload for seamless updates
- ✅ **Multi-service support** - Deploy frontend, backend, and multiple services
- ✅ **Cost-effective** - Optimized for small VM deployments
- ✅ **YAML configuration** - Simple, declarative config files

## Installation

```bash
npm install -g nimman
# or
yarn global add nimman
# or
pnpm add -g nimman
```

## Quick Start

### 1. Initialize Configuration

```bash
nimman init
```

This will create a `nimman.yml` configuration file in your project directory.

### 2. Setup Server (First Time Only)

```bash
sudo nimman setup
```

This will:
- Configure Nginx reverse proxy
- Set up SSL certificates with Certbot
- Configure automatic certificate renewal

### 3. Deploy

```bash
nimman deploy
```

This will:
- Build your services
- Deploy with PM2 (zero-downtime reload)
- Ensure all services are running

## Configuration

Example `nimman.yml`:

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
      DATABASE_URL: postgresql://localhost/mydb

nginx:
  enabled: true

ssl:
  enabled: true
  provider: certbot

pm2:
  instances: 1
  maxMemory: 500M
```

## Commands

### `nimman init`

Initialize a new deployment configuration. Creates `nimman.yml` in your project.

**Options:**
- `-p, --path <path>` - Project path (default: current directory)

### `nimman setup`

Setup Nginx and Certbot on the server. Run with `sudo` for first-time setup.

**Options:**
- `-c, --config <path>` - Config file path (default: `nimman.yml`)

### `nimman deploy`

Deploy your project with zero-downtime reload.

**Options:**
- `-c, --config <path>` - Config file path (default: `nimman.yml`)
- `-e, --env <env>` - Environment (production, staging) (default: `production`)
- `--skip-ssl` - Skip SSL certificate setup

## Service Types

### Frontend

Frontend services are served directly by Nginx as static files. The build output is configured to be served.

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

Backend services run with PM2 and are proxied through Nginx.

```yaml
- name: backend
  type: backend
  runtime: node
  port: 3001
  path: backend
  start:
    command: node dist/index.js
  instances: 2
```

## Runtime Support

- **Node.js**: Standard Node.js applications
- **Bun**: Bun runtime applications

## Requirements

### Server Requirements

- Ubuntu/Debian or CentOS/RHEL Linux
- Node.js 16+ (or Bun)
- Nginx
- Certbot (for SSL)
- PM2 (installed globally: `npm install -g pm2`)

### Permissions

- `setup` command requires `sudo` for Nginx and Certbot configuration
- `deploy` command can run as regular user (PM2 manages processes)

## Cost Optimization

Nimman is designed for cost-effective VM deployments:

- **PM2 cluster mode** - Efficiently uses available CPU cores
- **Nginx reverse proxy** - Single entry point, efficient resource usage
- **Zero-downtime reloads** - No service interruption during updates
- **Automatic SSL renewal** - No manual certificate management

## Troubleshooting

### Nginx not found

```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx
```

### Certbot not found

```bash
# Ubuntu/Debian
sudo apt-get install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

### PM2 not found

```bash
npm install -g pm2
```

### Check service status

```bash
pm2 status
pm2 logs
```

### Manual Nginx reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## License

[MIT](LICENSE)

