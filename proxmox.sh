#!/usr/bin/env bash
# =============================================================================
#  ASCII DIRECTORY // 1980s CRT Terminal Directory
#  Automated Proxmox LXC Installer & Updater
#  Run directly on your Proxmox Host shell:
#    bash <(curl -fsSL https://raw.githubusercontent.com/ARCHA1E/ASCII-Directory/main/proxmox.sh)
# =============================================================================
set -euo pipefail

# ── Color Palette (TTeck Helper Style) ───────────────────────────────────────
YW='\033[33m'
BL='\033[36m'
RD='\033[01;31m'
GN='\033[1;92m'
DGN='\033[32m'
CL='\033[m'
CM="${GN}✓${CL}"
CROSS="${RD}✗${CL}"
BFR="\\r\\033[K"

msg_info()  { echo -ne " ${YW}…${CL} $1"; }
msg_ok()    { echo -e  "${BFR} ${CM} $1"; }
msg_error() { echo -e  "${BFR} ${CROSS} $1"; exit 1; }

# ── Must run on Proxmox host ──────────────────────────────────────────────────
command -v pct    &>/dev/null || msg_error "pct not found — run this on the Proxmox host shell."
command -v pvesh  &>/dev/null || msg_error "pvesh not found — run this on the Proxmox host shell."
command -v whiptail &>/dev/null || apt-get install -y -qq whiptail

# ── Header Banner ─────────────────────────────────────────────────────────────
clear
echo -e "${BL}"
cat << 'EOF_BANNER'
  ╔══════════════════════════════════════════════════════════════════════════╗
  ║                                                                          ║
  ║       █████╗ ███████╗ ██████╗██╗██╗    ██████╗ ██╗██████╗                ║
  ║      ██╔══██╗██╔════╝██╔════╝██║██║    ██╔══██╗██║██╔══██╗               ║
  ║      ███████║███████╗██║     ██║██║    ██║  ██║██║██████╔╝               ║
  ║      ██╔══██║╚════██║██║     ██║██║    ██║  ██║██║██╔══██╗               ║
  ║      ██║  ██║███████║╚██████╗██║██║    ██████╔╝██║██║  ██║               ║
  ║      ╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝╚═╝    ╚═════╝ ╚═╝╚═╝  ╚═╝               ║
  ║                                                                          ║
  ║                     1980s RETRO CRT HOMELAB GATEWAY                      ║
  ║                 PROXMOX VE AUTOMATED HELPER INSTALLER                    ║
  ╚══════════════════════════════════════════════════════════════════════════╝
EOF_BANNER
echo -e "${CL}"

whiptail --backtitle "ASCII Directory // Proxmox Installer" \
  --title "ASCII Directory LXC Installer" \
  --msgbox "This script will automatically set up a lightweight Debian 12 LXC container on this Proxmox node and deploy the ASCII Directory web application.\n\nSupports both Fresh Install and In-Place Container Updates." \
  14 68

# ── Container ID Selection ────────────────────────────────────────────────────
NEXT_ID=$(pvesh get /cluster/nextid 2>/dev/null | tr -d '"' | tr -d '[:space:]')
[[ -z "$NEXT_ID" ]] && NEXT_ID="100"

ID_CHOICE=$(whiptail --backtitle "ASCII Directory // Proxmox Installer" \
  --title "Container ID Selection" \
  --menu "Select how to assign the Container ID:" \
  12 64 2 \
  "1" "Use Next Available ID ($NEXT_ID)" \
  "2" "Specify Custom Container ID" \
  3>&1 1>&2 2>&3) || exit 1

if [[ "$ID_CHOICE" == "1" ]]; then
  CT_ID="$NEXT_ID"
else
  while true; do
    CT_ID=$(whiptail --backtitle "ASCII Directory // Proxmox Installer" \
      --title "Custom Container ID" \
      --inputbox "Enter custom container ID (e.g. 100-999999999):\n\n• Existing ID: updates that container in-place\n• Unused ID: creates a fresh container" \
      12 64 "$NEXT_ID" 3>&1 1>&2 2>&3) || exit 1

    if [[ -z "$CT_ID" ]] || [[ ! "$CT_ID" =~ ^[0-9]+$ ]] || [[ "$CT_ID" -lt 100 ]]; then
      whiptail --backtitle "ASCII Directory // Proxmox Installer" \
        --title "Invalid ID" \
        --msgbox "Container ID must be a numeric value >= 100." 8 50
      continue
    fi
    break
  done
fi

CT_EXISTS=false
if pct status "$CT_ID" &>/dev/null; then
  CT_EXISTS=true
fi

REPO_URL="https://github.com/ARCHA1E/ASCII-Directory.git"

# =============================================================================
#  UPGRADE PATH (Container Exists)
# =============================================================================
if [[ "$CT_EXISTS" == "true" ]]; then
  CT_STATUS=$(pct status "$CT_ID" | awk '{print $2}')
  whiptail --backtitle "ASCII Directory // Proxmox Installer" \
    --title "Update Existing Container" \
    --yesno "Container $CT_ID found (status: $CT_STATUS).\n\nThis will:\n  • Pull latest code from GitHub\n  • Rebuild the client and server\n  • Restart the ascii-directory service\n\nYour data/directory.json is never overwritten. Proceed?" \
    14 64 || exit 0

  if [[ "$CT_STATUS" != "running" ]]; then
    msg_info "Starting container $CT_ID"
    pct start "$CT_ID"
    sleep 3
    msg_ok "Container started"
  fi

  msg_info "Updating ASCII Directory in container $CT_ID"
  pct exec "$CT_ID" -- bash -c "
    cd /opt/ascii-directory
    git pull origin main
    npm install
    npm run build
    systemctl restart ascii-directory
  "
  msg_ok "Update complete"

  CT_IP=$(pct exec "$CT_ID" -- bash -c "ip -4 addr show eth0 2>/dev/null | grep -oP '(?<=inet )[^/]+'" 2>/dev/null || echo "unknown")
  echo -e "\n${GN}====================================================\n ASCII Directory upgraded successfully!\n App URL: http://${CT_IP}:3000\n Container ID: $CT_ID\n====================================================${CL}\n"
  exit 0
fi

# =============================================================================
#  FRESH INSTALL PATH
# =============================================================================

# ── Container Configuration Prompts ───────────────────────────────────────────
CT_HOSTNAME=$(whiptail --backtitle "ASCII Directory // Proxmox Installer" \
  --title "Container Hostname" \
  --inputbox "Enter container hostname:" \
  9 64 "ascii-directory" 3>&1 1>&2 2>&3) || exit 1

# Detect default storage pool
DEF_STORAGE="local-lvm"
DETECTED_STORAGE=$(pvesm status -content rootdir 2>/dev/null | awk 'NR>1 {print $1}' | head -1)
[[ -n "$DETECTED_STORAGE" ]] && DEF_STORAGE="$DETECTED_STORAGE"

STORAGE=$(whiptail --backtitle "ASCII Directory // Proxmox Installer" \
  --title "Storage Pool" \
  --inputbox "Proxmox storage pool for container rootfs:" \
  9 64 "$DEF_STORAGE" 3>&1 1>&2 2>&3) || exit 1

BRIDGE=$(whiptail --backtitle "ASCII Directory // Proxmox Installer" \
  --title "Network Bridge" \
  --inputbox "Network bridge interface:" \
  9 64 "vmbr0" 3>&1 1>&2 2>&3) || exit 1

ADMIN_PASS=$(whiptail --backtitle "ASCII Directory // Proxmox Installer" \
  --title "Admin Password" \
  --inputbox "Enter master Admin Password for directory management:\n(Used for 'login <password>' in terminal)" \
  10 64 "admin123" 3>&1 1>&2 2>&3) || exit 1

whiptail --backtitle "ASCII Directory // Proxmox Installer" \
  --title "Confirm Deployment" \
  --yesno "Ready to create and deploy:\n
  Container ID : $CT_ID
  Hostname     : $CT_HOSTNAME
  Storage      : $STORAGE
  Bridge       : $BRIDGE
  App Port     : 3000\n
Proceed with automatic installation?" \
  15 64 || exit 0

# ── Debian 12 Template ────────────────────────────────────────────────────────
msg_info "Locating Debian 12 template"
TEMPLATE=$(pveam list local 2>/dev/null | awk '/debian-12/{print $1}' | tail -1)

if [[ -z "$TEMPLATE" ]]; then
  msg_info "Downloading Debian 12 template from Proxmox repository"
  pveam update &>/dev/null
  TEMPLATE_NAME=$(pveam available --section system 2>/dev/null | awk '/debian-12-standard/{print $2}' | tail -1)
  [[ -z "$TEMPLATE_NAME" ]] && msg_error "No Debian 12 template found. Run 'pveam update' manually."
  pveam download local "$TEMPLATE_NAME" &>/dev/null
  TEMPLATE="local:vztmpl/$TEMPLATE_NAME"
fi
msg_ok "Template ready ($TEMPLATE)"

# ── Create Container ──────────────────────────────────────────────────────────
CT_PASSWORD=$(openssl rand -base64 16)
msg_info "Creating unprivileged LXC container $CT_ID"
pct create "$CT_ID" "$TEMPLATE" \
  --hostname  "$CT_HOSTNAME" \
  --ostype    debian \
  --cores     1 \
  --memory    512 \
  --swap      512 \
  --rootfs    "${STORAGE}:4" \
  --net0      "name=eth0,bridge=${BRIDGE},ip=dhcp" \
  --unprivileged 1 \
  --password  "$CT_PASSWORD" \
  --start     1 &>/dev/null
msg_ok "Container $CT_ID created and started"

# ── Wait for IP ───────────────────────────────────────────────────────────────
msg_info "Waiting for container to acquire network IP"
CT_IP=""
for i in $(seq 1 30); do
  sleep 2
  CT_IP=$(pct exec "$CT_ID" -- bash -c "ip -4 addr show eth0 2>/dev/null | grep -oP '(?<=inet )[^/]+'" 2>/dev/null || true)
  [[ -n "$CT_IP" ]] && break
  [[ $i -eq 30 ]] && msg_error "Container did not acquire IP via DHCP. Check your bridge/DHCP server."
done
msg_ok "Container IP: $CT_IP"

# ── Setup inside container ────────────────────────────────────────────────────
msg_info "Installing prerequisites (curl, git, nodejs 22 LTS)"
pct exec "$CT_ID" -- bash -c "
  apt-get update -qq && apt-get install -y -qq curl git ca-certificates gnupg
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
" &>/dev/null
msg_ok "Prerequisites installed"

msg_info "Cloning ASCII Directory repository"
pct exec "$CT_ID" -- bash -c "
  rm -rf /opt/ascii-directory
  git clone '${REPO_URL}' /opt/ascii-directory
" &>/dev/null || msg_error "Failed to clone repository from GitHub."
msg_ok "Repository cloned"

msg_info "Installing dependencies and building application"
pct exec "$CT_ID" -- bash -c "
  cd /opt/ascii-directory
  cat << ENV_EOF > .env
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
ADMIN_PASSWORD=${ADMIN_PASS}
JWT_SECRET=$(openssl rand -hex 24)
DATA_DIR=/opt/ascii-directory/data
ENV_EOF
  npm install --silent
  npm run build
" &>/dev/null
msg_ok "Build finished"

msg_info "Setting up systemd service (auto-start on boot)"
pct exec "$CT_ID" -- bash -c "
cat << SERVICE_EOF > /etc/systemd/system/ascii-directory.service
[Unit]
Description=ASCII Directory Web Gateway
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/ascii-directory
EnvironmentFile=/opt/ascii-directory/.env
ExecStart=\$(which node) /opt/ascii-directory/dist/server/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE_EOF

systemctl daemon-reload
systemctl enable --now ascii-directory
" &>/dev/null
msg_ok "Service started & enabled on boot"

# ── Final Summary Box ─────────────────────────────────────────────────────────
echo -e "\n${GN}
╔════════════════════════════════════════════════════════════════════╗
║             ASCII DIRECTORY INSTALLED SUCCESSFULLY!                ║
╠════════════════════════════════════════════════════════════════════╣
║  • Access URL:    http://${CT_IP}:3000
║  • Container ID:  ${CT_ID} (${CT_HOSTNAME})
║  • Container IP:  ${CT_IP}
║  • Admin Pass:    ${ADMIN_PASS}
║  • Service:       systemctl status ascii-directory
╚════════════════════════════════════════════════════════════════════╝
${CL}\n"
