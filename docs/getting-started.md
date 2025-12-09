# Getting Started with Nimman

A quick start guide to get your application deployed in minutes.

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js 16+ or Bun installed
- [ ] A Linux server (Ubuntu/Debian or CentOS/RHEL)
- [ ] Root/sudo access on the server
- [ ] Domain name pointing to your server's IP address (for SSL)
- [ ] Your application code ready to deploy

## Installation

### 1. Install Nimman

```bash
npm install -g nimman
```

### 2. Install Server Dependencies

On your server, install required tools:

```bash
# Nginx
sudo apt-get update
sudo apt-get install nginx

# Certbot (for SSL)
sudo apt-get install certbot python3-certbot-nginx

# PM2
npm install -g pm2
```

## Quick Start (3 Steps)

### Step 1: Initialize Configuration

In your project directory:

```bash
nimman init
```

Follow the interactive prompts. This creates `nimman.yml`.

### Step 2: Setup Server (First Time Only)

```bash
sudo nimman setup
```

This configures Nginx and SSL certificates.

### Step 3: Deploy

```bash
nimman deploy
```

Your application is now live! 🎉

## What Happens During Setup?

### `nimman init`
- Creates `nimman.yml` configuration file
- Asks about your project structure
- Configures frontend/backend services

### `sudo nimman setup`
- Generates Nginx reverse proxy configuration
- Obtains SSL certificates from Let's Encrypt
- Configures automatic certificate renewal
- Enables HTTPS

### `nimman deploy`
- Builds your services
- Creates PM2 ecosystem configuration
- Deploys with zero-downtime reload
- Ensures all services are running

## Verify Deployment

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs

# Visit your domain
curl https://yourdomain.com
```

## Next Steps

- Read the [Full Documentation](./document.md) for detailed information
- Check [Examples](./examples/) for configuration samples
- Review [Troubleshooting](./document.md#troubleshooting) if you encounter issues

## Common First-Time Issues

**"Nginx not found"**
```bash
sudo apt-get install nginx
```

**"Certbot not found"**
```bash
sudo apt-get install certbot python3-certbot-nginx
```

**"PM2 not found"**
```bash
npm install -g pm2
```

**SSL setup fails**
- Ensure domain points to server IP
- Check ports 80/443 are open: `sudo ufw allow 80 && sudo ufw allow 443`

## Need Help?

See the [Full Documentation](./document.md) or check the [Troubleshooting Guide](./document.md#troubleshooting).

