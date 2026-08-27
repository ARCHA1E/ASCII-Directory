#!/usr/bin/env bash
# ==============================================================================
# Proxmox LXC Automated Setup Script for ASCII Directory
# Compatible with Debian 12 / Ubuntu 22.04+ LXC Containers
# ==============================================================================

set -e

APP_DIR="/opt/ascii-directory"
SERVICE_NAME="ascii-directory"

echo -e "\x1b[32m[+] Starting ASCII Directory setup in Proxmox LXC...\x1b[0m"

# 1. Update package list & install Node.js 22 LTS if not present
if ! command -v node &> /dev/null; then
    echo -e "\x1b[34m[*] Installing Node.js 22 LTS & prerequisites...\x1b[0m"
    apt-get update && apt-get install -y curl ca-certificates gnupg
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs git
fi

echo -e "\x1b[32m[+] Node.js version: $(node -v)\x1b[0m"
echo -e "\x1b[32m[+] NPM version:     $(npm -v)\x1b[0m"

# 2. Setup destination folder
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# 3. Prompt for Admin Password if not set
if [ -z "$ADMIN_PASSWORD" ]; then
    read -sp "Enter desired Admin Password for directory management: " ADMIN_PASSWORD
    echo ""
fi

# 4. Create .env file
cat << ENV_EOF > "$APP_DIR/.env"
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
ADMIN_PASSWORD=${ADMIN_PASSWORD}
JWT_SECRET=$(openssl rand -hex 24)
DATA_DIR=${APP_DIR}/data
ENV_EOF

echo -e "\x1b[32m[+] Created .env configuration.\x1b[0m"

# 5. Build application
npm install
npm run build

# 6. Create systemd service
cat << SERVICE_EOF > /etc/systemd/system/${SERVICE_NAME}.service
[Unit]
Description=ASCII Retro Directory Web Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}
EnvironmentFile=${APP_DIR}/.env
ExecStart=$(which node) ${APP_DIR}/dist/server/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE_EOF

# 7. Reload and start systemd service
systemctl daemon-reload
systemctl enable --now ${SERVICE_NAME}

echo -e "\x1b[32m╔════════════════════════════════════════════════════════════════╗\x1b[0m"
echo -e "\x1b[32m║  ASCII Directory successfully deployed and running!            ║\x1b[0m"
echo -e "\x1b[32m║  Access URL: http://$(hostname -I | awk '{print $1}'):3000                 ║\x1b[0m"
echo -e "\x1b[32m║  Service:    systemctl status ${SERVICE_NAME}               ║\x1b[0m"
echo -e "\x1b[32m╚════════════════════════════════════════════════════════════════╝\x1b[0m"
