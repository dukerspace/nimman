# Nimman CLI Documentation

Complete guide to using the Nimman CLI for zero-downtime deployment of Node.js and Bun applications.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands Reference](#commands-reference)
  - [init](#init-command)
  - [setup](#setup-command)
  - [deploy](#deploy-command)
- [Configuration Guide](#configuration-guide)
- [Examples](#examples)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

---

## Overview

Nimman is a zero-downtime deployment tool designed for Node.js and Bun applications. It automates:

- **Nginx reverse proxy configuration** - Automatic setup and routing
- **SSL certificate management** - Let's Encrypt integration via Certbot
- **PM2 process management** - Zero-downtime reloads and clustering
- **Multi-service deployments** - Frontend, backend, and worker services

### Key Features

- ✅ Zero-downtime deployments using PM2 reload
- ✅ Automatic Nginx configuration
- ✅ Automatic HTTPS setup with Let's Encrypt
- ✅ Support for multiple services (frontend, backend, workers)
- ✅ Node.js and Bun runtime support
- ✅ Simple YAML-based configuration

---

## Installation

### Prerequisites

- Node.js 16+ or Bun installed
- Ubuntu/Debian or CentOS/RHEL Linux server
- Root/sudo access for initial setup

### Install Nimman

```bash
# Using npm
npm install -g nimman

# Using yarn
yarn global add nimman

# Using pnpm
pnpm add -g nimman
```

### Verify Installation

```bash
nimman --version
```

### Install Server Dependencies

Before first use, ensure these are installed on your server:

```bash
# Install Nginx
sudo apt-get update
sudo apt-get install nginx  # Ubuntu/Debian
# OR
sudo yum install nginx      # CentOS/RHEL

# Install Certbot (for SSL)
sudo apt-get install certbot python3-certbot-nginx  # Ubuntu/Debian
# OR
sudo yum install certbot python3-certbot-nginx      # CentOS/RHEL

# Install PM2 globally
npm install -g pm2
```

---

## Quick Start

### Step 1: Initialize Your Project

Navigate to your project directory and run:

```bash
nimman init
```

This interactive command will:
- Ask for project name, domain, and email
- Detect if you have frontend/backend services
- Generate a `nimman.yml` configuration file

**Example session:**

```bash
$ nimman init

? Project name: my-awesome-app
? Domain name: myapp.com
? Email for Let's Encrypt: admin@myapp.com
? Do you have a frontend service? Yes
? Frontend service name: frontend
? Frontend path (relative to project): frontend
? Frontend runtime: (Use arrow keys)
  ❯ node
    bun
? Build command: npm run build
? Build output directory: dist
? Do you have a backend service? Yes
? Backend service name: backend
? Backend path (relative to project): backend
? Backend runtime: (Use arrow keys)
  ❯ node
    bun
? Backend port: 3001
? Start command: npm start
? Does backend need building? Yes
? Build command: npm run build

✓ Configuration saved to /path/to/project/nimman.yml
You can now run: nimman setup && nimman deploy
```

### Step 2: Setup Server (First Time Only)

Run the setup command with sudo to configure Nginx and SSL:

```bash
sudo nimman setup
```

This will:
- Generate and install Nginx configuration
- Set up SSL certificates with Certbot (if enabled)
- Configure automatic certificate renewal
- Enable HTTPS in Nginx

**Example output:**

```bash
$ sudo nimman setup

📋 Loading configuration...
ℹ️  Setting up: my-awesome-app (myapp.com)
📋 Setting up Nginx...
✓ Nginx configuration created at /etc/nginx/sites-available/my-awesome-app.conf
✓ Nginx configuration enabled
✓ Nginx configuration tested successfully
✓ Nginx reloaded
📋 Setting up SSL with Certbot...
✓ SSL certificate obtained for myapp.com
✓ HTTPS enabled in Nginx
✓ Setup completed!
Next step: Run "nimman deploy" to deploy your services
```

### Step 3: Deploy Your Application

Deploy your services with zero-downtime:

```bash
nimman deploy
```

This will:
- Build all services that have build commands
- Create PM2 ecosystem configuration
- Deploy services with zero-downtime reload
- Ensure all services are running

**Example output:**

```bash
$ nimman deploy

📋 Loading configuration...
ℹ️  Deploying: my-awesome-app (myapp.com)
ℹ️  Environment: production
📋 Building services...
  Building frontend...
  ✓ Frontend built successfully
  Building backend...
  ✓ Backend built successfully
📋 Setting up PM2...
✓ PM2 ecosystem config created
📋 Deploying services with zero-downtime...
✓ Services deployed successfully
✓ Deployment completed!
Your services are running at: https://myapp.com
Check status with: pm2 status
View logs with: pm2 logs
```

---

## Commands Reference

### init Command

Initialize a new Nimman configuration file for your project.

#### Usage

```bash
nimman init [options]
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --path <path>` | Project path to initialize | Current directory |

#### Examples

**Initialize in current directory:**

```bash
nimman init
```

**Initialize in specific directory:**

```bash
nimman init --path /var/www/myapp
```

**What it does:**

1. Checks if `nimman.yml` already exists (prompts to overwrite if found)
2. Interactively collects:
   - Project name
   - Domain name
   - Email for Let's Encrypt
   - Frontend service details (if applicable)
   - Backend service details (if applicable)
3. Generates `nimman.yml` configuration file

**Generated Configuration Example:**

```yaml
project:
  name: my-awesome-app
  domain: myapp.com
  email: admin@myapp.com

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
      command: npm start
    instances: 1

nginx:
  enabled: true

ssl:
  enabled: true
  provider: certbot

pm2:
  instances: 1
```

---

### setup Command

Configure Nginx and SSL certificates on your server. **Run with sudo for first-time setup.**

#### Usage

```bash
sudo nimman setup [options]
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-c, --config <path>` | Path to configuration file | `nimman.yml` |

#### Examples

**Basic setup:**

```bash
sudo nimman setup
```

**Custom config file:**

```bash
sudo nimman setup --config /path/to/custom-config.yml
```

**What it does:**

1. Loads configuration from `nimman.yml`
2. **Nginx Setup:**
   - Generates Nginx configuration file
   - Creates upstream blocks for backend services
   - Configures reverse proxy routing
   - Enables the site configuration
   - Tests and reloads Nginx
3. **SSL Setup (if enabled):**
   - Runs Certbot to obtain Let's Encrypt certificates
   - Configures automatic renewal
   - Enables HTTPS in Nginx configuration
   - Reloads Nginx

**Nginx Configuration Generated:**

The setup command creates an Nginx configuration at `/etc/nginx/sites-available/<project-name>.conf` with:

- Upstream definitions for each backend service
- Reverse proxy configuration for API routes
- Static file serving for frontend
- SSL/HTTPS configuration (if enabled)
- Security headers and optimizations

**SSL Certificate Setup:**

If SSL is enabled, Certbot will:
- Obtain certificates from Let's Encrypt
- Configure automatic renewal via cron
- Update Nginx to use HTTPS

**Note:** SSL setup requires:
- Domain pointing to your server's IP
- Port 80 and 443 open in firewall
- Valid email address

---

### deploy Command

Deploy your application with zero-downtime reload using PM2.

#### Usage

```bash
nimman deploy [options]
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-c, --config <path>` | Path to configuration file | `nimman.yml` |
| `-e, --env <env>` | Environment name (production, staging) | `production` |
| `--skip-ssl` | Skip SSL certificate setup | `false` |

#### Examples

**Basic deployment:**

```bash
nimman deploy
```

**Deploy to staging environment:**

```bash
nimman deploy --env staging
```

**Deploy with custom config:**

```bash
nimman deploy --config production.yml
```

**Deploy without SSL setup:**

```bash
nimman deploy --skip-ssl
```

**What it does:**

1. **Load Configuration:**
   - Reads `nimman.yml` (or specified config file)
   - Validates configuration structure

2. **Build Services:**
   - Executes build commands for services that have them
   - Builds in order: frontend first, then backend/services
   - Uses the specified runtime (node/bun) for each service

3. **Create PM2 Ecosystem:**
   - Generates `ecosystem.config.js` in project root
   - Configures apps for each service
   - Sets up clustering, environment variables, and logging

4. **Deploy with Zero-Downtime:**
   - Uses PM2's reload strategy for zero-downtime updates
   - Starts new instances before stopping old ones
   - Ensures all services are running and healthy

**PM2 Ecosystem Generated:**

The deploy command creates an `ecosystem.config.js` file with:

```javascript
module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
    // ... more services
  ]
}
```

**Zero-Downtime Deployment:**

Nimman uses PM2's `reload` command which:
- Starts new instances with updated code
- Waits for new instances to be ready
- Gracefully stops old instances
- Maintains service availability throughout

---

## Configuration Guide

### Configuration File Structure

The `nimman.yml` file uses YAML format and contains the following sections:

```yaml
project:
  name: string          # Project name
  domain: string        # Domain name (e.g., example.com)
  email: string         # Email for Let's Encrypt notifications

services:               # Array of service configurations
  - name: string
    type: string        # 'frontend' | 'backend' | 'service'
    runtime: string     # 'node' | 'bun'
    port: number
    path: string        # Relative path to service directory
    build:              # Optional build configuration
      command: string
      output: string    # Only for frontend
    start:
      command: string
    instances: number   # Optional, default: 1
    env:                # Optional environment variables
      KEY: value

nginx:                  # Optional Nginx configuration
  enabled: boolean      # Default: true
  configPath: string    # Default: /etc/nginx/sites-available

ssl:                    # Optional SSL configuration
  enabled: boolean      # Default: true
  provider: string      # 'certbot' | 'manual'

pm2:                    # Optional PM2 configuration
  instances: number     # Default: 1
  maxMemory: string     # e.g., '500M'
```

### Project Configuration

```yaml
project:
  name: my-app          # Used for PM2 app names and Nginx config filename
  domain: example.com   # Your domain name (must point to server IP)
  email: admin@example.com  # Email for Let's Encrypt certificate notifications
```

### Service Configuration

#### Frontend Service

Frontend services are served as static files by Nginx.

```yaml
services:
  - name: frontend
    type: frontend
    runtime: node       # or 'bun'
    port: 3000          # Not used for frontend, but required
    path: frontend      # Relative path to frontend directory
    build:
      command: npm run build
      output: dist      # Build output directory (served by Nginx)
    start:
      command: echo "Frontend served by Nginx"  # Not executed
```

**Key Points:**
- `type: frontend` - Tells Nimman to serve as static files
- `build.output` - Directory that Nginx will serve
- `start.command` - Not actually executed (frontend is static)

#### Backend Service

Backend services run as PM2 processes and are proxied through Nginx.

```yaml
services:
  - name: backend
    type: backend
    runtime: bun        # or 'node'
    port: 3001          # Port the service listens on
    path: backend       # Relative path to backend directory
    build:              # Optional
      command: bun run build
    start:
      command: bun run index.ts
    instances: 2        # Number of PM2 instances (cluster mode)
    env:                # Environment variables
      NODE_ENV: production
      DATABASE_URL: postgresql://localhost/mydb
      PORT: 3001
```

**Key Points:**
- `type: backend` - Runs as PM2 process
- `port` - Service listens on this port (Nginx proxies to it)
- `instances` - Number of PM2 cluster instances
- `env` - Environment variables passed to the process

#### Generic Service

For worker processes or other services:

```yaml
services:
  - name: worker
    type: service       # Generic service type
    runtime: node
    port: 3002
    path: worker
    start:
      command: node worker.js
    instances: 1
```

### Nginx Configuration

```yaml
nginx:
  enabled: true                    # Enable/disable Nginx setup
  configPath: /etc/nginx/sites-available  # Custom config path (optional)
```

### SSL Configuration

```yaml
ssl:
  enabled: true        # Enable SSL certificate setup
  provider: certbot    # 'certbot' (Let's Encrypt) or 'manual'
```

**Requirements for SSL:**
- Domain must point to server IP
- Ports 80 and 443 must be open
- Valid email address

### PM2 Configuration

```yaml
pm2:
  instances: 1         # Default number of instances (can be overridden per service)
  maxMemory: 500M      # Memory limit per instance
```

---

## Examples

### Example 1: Simple Full-Stack App

**Project Structure:**
```
my-app/
├── frontend/
│   ├── package.json
│   └── src/
├── backend/
│   ├── package.json
│   └── src/
└── nimman.yml
```

**Configuration (`nimman.yml`):**

```yaml
project:
  name: my-app
  domain: myapp.com
  email: admin@myapp.com

services:
  # React/Vue frontend
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

  # Express.js backend
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

**Deployment:**

```bash
# 1. Initialize (if not done)
nimman init

# 2. Setup server (first time only)
sudo nimman setup

# 3. Deploy
nimman deploy
```

### Example 2: Bun Backend with TypeScript

**Configuration:**

```yaml
project:
  name: api-server
  domain: api.example.com
  email: admin@example.com

services:
  - name: backend
    type: backend
    runtime: bun
    port: 3001
    path: .
    build:
      command: bun run build
    start:
      command: bun run src/index.ts
    instances: 4
    env:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://localhost/mydb

nginx:
  enabled: true

ssl:
  enabled: true
  provider: certbot

pm2:
  instances: 1
```

### Example 3: Multiple Services (Frontend + Backend + Worker)

**Configuration:**

```yaml
project:
  name: complex-app
  domain: app.example.com
  email: admin@example.com

services:
  # Frontend
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

  # API Backend
  - name: api
    type: backend
    runtime: node
    port: 3001
    path: api
    build:
      command: npm run build
    start:
      command: node dist/index.js
    instances: 2
    env:
      NODE_ENV: production
      PORT: 3001

  # Background Worker
  - name: worker
    type: service
    runtime: node
    port: 3002
    path: worker
    start:
      command: node worker.js
    instances: 1
    env:
      NODE_ENV: production
      REDIS_URL: redis://localhost:6379

nginx:
  enabled: true

ssl:
  enabled: true
  provider: certbot

pm2:
  instances: 1
```

### Example 4: Development/Staging Environment

**Configuration (`nimman.staging.yml`):**

```yaml
project:
  name: my-app-staging
  domain: staging.myapp.com
  email: dev@myapp.com

services:
  - name: frontend
    type: frontend
    runtime: node
    port: 3000
    path: frontend
    build:
      command: npm run build:staging
      output: dist
    start:
      command: echo "Frontend served by Nginx"

  - name: backend
    type: backend
    runtime: node
    port: 3001
    path: backend
    start:
      command: npm run dev
    instances: 1
    env:
      NODE_ENV: staging
      PORT: 3001
      DATABASE_URL: postgresql://localhost/mydb_staging

nginx:
  enabled: true

ssl:
  enabled: true
  provider: certbot

pm2:
  instances: 1
```

**Deploy to staging:**

```bash
nimman deploy --config nimman.staging.yml --env staging
```

---

## Advanced Usage

### Custom Build Scripts

You can use custom build scripts in your `package.json`:

```json
{
  "scripts": {
    "build": "tsc && npm run bundle",
    "build:production": "NODE_ENV=production npm run build",
    "build:staging": "NODE_ENV=staging npm run build"
  }
}
```

Then reference in `nimman.yml`:

```yaml
services:
  - name: backend
    build:
      command: npm run build:production
```

### Environment-Specific Configurations

Create separate config files for different environments:

```bash
nimman.yml              # Production
nimman.staging.yml      # Staging
nimman.development.yml  # Development
```

Deploy with:

```bash
nimman deploy --config nimman.staging.yml --env staging
```

### Health Checks

Configure health check endpoints (if your service supports them):

```yaml
services:
  - name: backend
    type: backend
    healthCheck:
      path: /health
      port: 3001
```

### Manual SSL Setup

If you want to set up SSL manually:

```yaml
ssl:
  enabled: true
  provider: manual
```

Then run Certbot manually:

```bash
sudo certbot --nginx -d example.com
```

### PM2 Management

After deployment, manage services with PM2:

```bash
# Check status
pm2 status

# View logs
pm2 logs

# View logs for specific service
pm2 logs backend

# Restart service
pm2 restart backend

# Stop service
pm2 stop backend

# Monitor resources
pm2 monit

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
pm2 save
```

### Nginx Customization

The generated Nginx config can be customized. After `nimman setup`, edit:

```bash
sudo nano /etc/nginx/sites-available/my-app.conf
```

Then test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Zero-Downtime Deployment Workflow

1. **Make code changes** in your project
2. **Commit and push** to your repository
3. **Pull changes** on server: `git pull`
4. **Deploy**: `nimman deploy`
5. **Verify**: Check `pm2 status` and visit your domain

The deployment process:
- Builds new code
- Starts new PM2 instances
- Waits for new instances to be ready
- Stops old instances
- No downtime during the process

---

## Troubleshooting

### Common Issues

#### 1. "Config file not found"

**Problem:** Nimman can't find `nimman.yml`

**Solution:**
```bash
# Make sure you're in the project directory
cd /path/to/your/project

# Or specify the config path
nimman deploy --config /path/to/nimman.yml
```

#### 2. "Nginx not found"

**Problem:** Nginx is not installed

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx

# Verify installation
nginx -v
```

#### 3. "Certbot not found"

**Problem:** Certbot is not installed

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx

# Verify installation
certbot --version
```

#### 4. "PM2 not found"

**Problem:** PM2 is not installed globally

**Solution:**
```bash
npm install -g pm2

# Verify installation
pm2 --version
```

#### 5. SSL Certificate Setup Fails

**Common causes:**
- Domain doesn't point to server IP
- Ports 80/443 are blocked by firewall
- Invalid email address

**Solution:**
```bash
# Check DNS
nslookup yourdomain.com

# Check firewall
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443

# Try manual SSL setup
sudo certbot --nginx -d yourdomain.com
```

#### 6. Services Not Starting

**Check PM2 status:**
```bash
pm2 status
pm2 logs
```

**Check Nginx:**
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

**Check service logs:**
```bash
pm2 logs backend
pm2 logs frontend
```

#### 7. Port Already in Use

**Problem:** Port is already occupied

**Solution:**
```bash
# Find process using port
sudo lsof -i :3001

# Kill the process or change port in nimman.yml
```

#### 8. Build Failures

**Check build logs:**
```bash
# Run build manually to see errors
cd frontend
npm run build

cd ../backend
npm run build
```

**Common issues:**
- Missing dependencies: Run `npm install`
- TypeScript errors: Fix type errors
- Environment variables: Check `.env` files

#### 9. Nginx Configuration Errors

**Test configuration:**
```bash
sudo nginx -t
```

**View error logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Reload Nginx:**
```bash
sudo systemctl reload nginx
```

#### 10. PM2 Reload Issues

**Manual reload:**
```bash
pm2 reload all
# Or specific service
pm2 reload backend
```

**Restart if reload fails:**
```bash
pm2 restart all
```

### Getting Help

**Check service status:**
```bash
pm2 status
pm2 logs
pm2 monit
```

**Check Nginx:**
```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Check system resources:**
```bash
htop
df -h
free -h
```

**View Nimman logs:**
Nimman outputs detailed logs during execution. If issues persist, check:
- PM2 logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/`
- System logs: `journalctl -xe`

---

## Best Practices

### 1. Version Control

Always commit your `nimman.yml` to version control:

```bash
git add nimman.yml
git commit -m "Add Nimman deployment configuration"
```

### 2. Environment Variables

Use environment variables for sensitive data:

```yaml
services:
  - name: backend
    env:
      DATABASE_URL: ${DATABASE_URL}  # Set in .env or system
      API_KEY: ${API_KEY}
```

Or use PM2 ecosystem file to inject from `.env`:

```javascript
// ecosystem.config.js (generated, but you can customize)
require('dotenv').config()
module.exports = {
  apps: [{
    env: process.env
  }]
}
```

### 3. Backup Before Deploy

```bash
# Backup current deployment
pm2 save
cp -r /var/www/myapp /var/www/myapp.backup

# Deploy
nimman deploy

# If issues, restore
pm2 delete all
pm2 resurrect
```

### 4. Test Locally First

Test your build and start commands locally before deploying:

```bash
cd frontend && npm run build
cd ../backend && npm run build && npm start
```

### 5. Monitor After Deployment

```bash
# Check immediately after deploy
pm2 status
pm2 logs --lines 50

# Monitor for a few minutes
pm2 monit
```

### 6. Use Health Checks

Implement health check endpoints in your services:

```javascript
// Express.js example
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})
```

Then configure in `nimman.yml`:

```yaml
services:
  - name: backend
    healthCheck:
      path: /health
```

### 7. Gradual Rollout

For production, consider:
1. Deploy to staging first
2. Test thoroughly
3. Deploy to production during low-traffic hours
4. Monitor closely after deployment

---

## Additional Resources

- **PM2 Documentation:** https://pm2.keymetrics.io/docs/
- **Nginx Documentation:** https://nginx.org/en/docs/
- **Certbot Documentation:** https://certbot.eff.org/docs/
- **Let's Encrypt:** https://letsencrypt.org/

---

## Summary

Nimman provides a simple, automated way to deploy Node.js and Bun applications with:

1. **Initialize:** `nimman init` - Create configuration
2. **Setup:** `sudo nimman setup` - Configure server (first time)
3. **Deploy:** `nimman deploy` - Deploy with zero-downtime

The tool handles Nginx, SSL, and PM2 configuration automatically, allowing you to focus on your application code.

For questions or issues, check the troubleshooting section or review the logs from PM2 and Nginx.

