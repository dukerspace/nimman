#!/bin/bash
set -euo pipefail

# Update package lists
sudo apt update
sudo apt install unzip -y

# Install Nginx
echo "💻 Install Nginx"
sudo sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Node.js (using NodeSource setup script for v22.x)
echo "💻 Install Node.js version 24"
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

# Install Bun
echo "💻 Install Bun"
curl -fsSL https://bun.sh/install | bash

# Install node module
echo "💻 Install node module"
npm install pm2@latest -g
npm install -g pnpm

exec $SHELL

# Display versions of installed software
nginx -v
node --version
bun --version
pm2 --version
pnpm --version
