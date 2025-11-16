#!/bin/bash

# Exit immediately if a command fails
set -e

###############################################
# Environment Variable Expectations
#
# Required:
#   DOMAIN_NAME   -> Your domain, e.g. example.com
#   EMAIL         -> Email for Let's Encrypt notifications
#
# Modes (set MODE):
#   static (default) -> Serve files from STATIC_ROOT (default /var/www/public)
#   node             -> Proxy frontend (FRONTEND_PORT) and backend (BACKEND_PORT)
#   go               -> Same as node; uses ports to proxy services
#
# Ports (for node/go modes):
#   FRONTEND_PORT -> e.g. 3000 (frontend dev/server)
#   BACKEND_PORT  -> e.g. 3001 (API service)
#   API_PORT      -> Backward compatibility (treated as BACKEND_PORT if BACKEND_PORT unset)
#
# Optional:
#   STATIC_ROOT   -> Directory for static assets (default /var/www/public)
#
# Example .env:
#   DOMAIN_NAME=example.com
#   EMAIL=admin@example.com
#   MODE=node
#   FRONTEND_PORT=3000
#   BACKEND_PORT=3001
###############################################

# Load environment variables from .env file (current working directory)
if [ -f .env ]; then
    # shellcheck disable=SC2046
    export $(grep -v '^#' .env | xargs)
else
    echo "❌ Error: .env file not found!"
    exit 1
fi

# Defaults / backward compatibility
MODE=${MODE:-static}
STATIC_ROOT=${STATIC_ROOT:-/var/www/public}
if [[ -n "$API_PORT" && -z "$BACKEND_PORT" ]]; then
  BACKEND_PORT="$API_PORT" # backward compatibility
fi

# Validate required base vars
if [[ -z "$DOMAIN_NAME" || -z "$EMAIL" ]]; then
    echo "❌ Error: Missing DOMAIN_NAME or EMAIL in .env"
    exit 1
fi

case "$MODE" in
  static)
    # STATIC_ROOT already set; no port requirements
    ;;
  node|go)
    if [[ -z "$FRONTEND_PORT" || -z "$BACKEND_PORT" ]]; then
      echo "❌ Error: MODE=$MODE requires FRONTEND_PORT and BACKEND_PORT (or API_PORT)."
      exit 1
    fi
    ;;
  *)
    echo "❌ Error: Invalid MODE '$MODE'. Use static, node, or go."
    exit 1
    ;;
esac

# Update system and install required packages
echo "🚀 Installing Nginx and Certbot..."
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Allow HTTP and HTTPS traffic
echo "🌍 Allowing Nginx in firewall..."
sudo ufw allow 'Nginx Full'

NGINX_CONF="/etc/nginx/sites-available/$DOMAIN_NAME"
echo "🌐 Creating initial HTTP Nginx config for $DOMAIN_NAME (mode=$MODE)..."

if [[ "$MODE" == "static" ]]; then
  sudo bash -c "cat > $NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    root $STATIC_ROOT;
    index index.html;

    location / {
      try_files \\$uri \\$uri/ /index.html;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
EOF
else
  # node / go: proxy frontend (SPA/SSR) + backend on /api
  sudo bash -c "cat > $NGINX_CONF" <<EOF
upstream frontend_upstream { server localhost:$FRONTEND_PORT; }
upstream backend_upstream { server localhost:$BACKEND_PORT; }

server {
    listen 80;
    server_name $DOMAIN_NAME;

    # Redirect to HTTPS will be added after cert issuance
    location / {
        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
    }

    location /api {
        proxy_pass http://backend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_cache_bypass \\$http_upgrade;
    }
}
EOF
fi

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
echo "🔐 Configuring Nginx for SSL (mode=$MODE)..."
if [[ "$MODE" == "static" ]]; then
  sudo bash -c "cat > $NGINX_CONF" <<EOF
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

    root $STATIC_ROOT;
    index index.html;

    location / {
      try_files $uri $uri/ /index.html;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }
}
EOF
else
  sudo bash -c "cat > $NGINX_CONF" <<EOF
upstream frontend_upstream { server localhost:$FRONTEND_PORT; }
upstream backend_upstream { server localhost:$BACKEND_PORT; }

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

    # Frontend (SPA/SSR) root path is proxied to frontend service
    location / {
        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
    }

    # Backend API
    location /api {
        proxy_pass http://backend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_cache_bypass \\$http_upgrade;
    }
}
EOF
fi

# Restart Nginx to apply SSL
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Nginx & SSL setup complete! Visit https://$DOMAIN_NAME"
