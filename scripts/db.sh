#!/bin/bash
set -e

docker compose --env-file .env -f ./docker/docker-compose.yml up -d
