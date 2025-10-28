#!/bin/bash

# Exit immediately if a command fails
set -e

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "❌ Error: .env file not found!"
    exit 1
fi

# Check if required variables are set
if [[ -z "$DOMAIN_NAME" || -z "$EMAIL" || -z "$API_PORT" ]]; then
    echo "❌ Error: Missing environment variables (DOMAIN, EMAIL, API_PORT). Check your .env file."
    exit 1
fi

# Update system and install required packages
echo "🚀 Installing Nginx and Certbot..."
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Allow HTTP and HTTPS traffic
echo "🌍 Allowing Nginx in firewall..."
sudo ufw allow 'Nginx Full'

# Create Nginx config for your domain
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN_NAME"

echo "🌐 Creating Nginx config for $DOMAIN_NAME..."

sudo bash -c "cat > $NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    root /var/www/frontend;
    index index.html;

    # Handle client-side routing
    location / {
      try_files \\\$uri \\\$uri/ /index.html;
    }

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  }
}
EOF

# Enable the site
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Obtain SSL certificate using Let's Encrypt
echo "🔒 Requesting SSL certificate from Let's Encrypt..."
sudo certbot --nginx -d $DOMAIN_NAME --email $EMAIL --agree-tos --non-interactive

# Set up automatic renewal
echo "🔄 Setting up automatic SSL renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Modify Nginx config for SSL
echo "🔐 Configuring Nginx for SSL..."
sudo bash -c "cat > $NGINX_CONF" <<EOF
upstream frontend {
    server localhost;
}

upstream backend {
    server localhost:$API_PORT;
}

server {
    listen 80;
    server_name $DOMAIN_NAME;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN_NAME;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Restart Nginx to apply SSL
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Nginx & SSL setup complete! Visit https://$DOMAIN_NAME"
