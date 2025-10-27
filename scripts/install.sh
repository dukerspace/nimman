#!/bin/bash
set -e

# Update package lists
sudo apt update
sudo apt install unzip -y

# Install Docker
echo "🐳 Install Docker"
sudo apt install -y docker.io

# Add your user to the docker group
sudo usermod -aG docker $USER

# Install Docker Compose
echo "🐳 Install Docker Compose"
mkdir -p ~/.docker/cli-plugins/
curl -SL https://github.com/docker/compose/releases/download/v2.3.3/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

# Install Nginx
echo "💻 Install Nginx"
sudo sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Node.js version 24
echo "💻 Install Node.js version 24"
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install Bun
echo "💻 Install Bun"
curl -fsSL https://bun.sh/install | bash

# Install node module
echo "💻 Install node module"
npm install pm2@latest -g
npm install -g pnpm


# Display versions of installed software
docker --version
docker compose version
nginx -v
node --version
bun --version
pm2 --version
pnpm --version
