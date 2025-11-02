#!/bin/bash
set -euo pipefail

echo "🐳 Docker setup script"

# Idempotence: skip if docker already installed unless FORCE_DOCKER_REINSTALL is set
if command -v docker >/dev/null 2>&1 && [ -z "${FORCE_DOCKER_REINSTALL:-}" ]; then
	echo "Docker already installed. Set FORCE_DOCKER_REINSTALL=1 to force reinstall."
else
	echo "Installing Docker engine"
	sudo apt update -y
	sudo apt install -y docker.io
	# Add current user to docker group (may require re-login to take effect)
	sudo usermod -aG docker "$USER" || true
fi

echo "Installing Docker Compose plugin"
mkdir -p ~/.docker/cli-plugins/
if [ ! -f ~/.docker/cli-plugins/docker-compose ] || [ -n "${FORCE_DOCKER_REINSTALL:-}" ]; then
	curl -SL https://github.com/docker/compose/releases/download/v2.3.3/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
	chmod +x ~/.docker/cli-plugins/docker-compose
else
	echo "Docker Compose already present."
fi

# Display versions of installed software
docker --version
docker compose version
