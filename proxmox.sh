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
    --yesno "Container $CT_ID found (status: $CT_STATUS).\n\nThis will:\n  • Pull latest code from GitHub\n  • Rebuild the client and server\n  • Restart the ascii-directory service\n\nYour data/directory.json is preserved and never lost. Proceed?" \
    14 64 || exit 0

  if [[ "$CT_STATUS" != "running" ]]; then
    msg_info "Starting container $CT_ID"
    pct start "$CT_ID"
    sleep 3
    msg_ok "Container started"
  fi

  msg_info "Updating ASCII Directory in container $CT_ID"
  pct exec "$CT_ID" -- bash -c "
    set -e
    cd /opt/ascii-directory
    if [ -f /opt/ascii-directory/data/directory.json ]; then
      cp /opt/ascii-directory/data/directory.json /tmp/dir_backup.json
    fi
    git fetch origin main
    git reset --hard origin/main
    if [ -f /tmp/dir_backup.json ]; then
      mkdir -p /opt/ascii-directory/data
      cp /tmp/dir_backup.json /opt/ascii-directory/data/directory.json
    fi
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
  --inputbox "Enter Proxmox storage pool for root disk (e.g. local-lvm, local-zfs, local):" \
  9 64 "$DEF_STORAGE" 3>&1 1>&2 2>&3) || exit 1

DISK_SIZE=$(whiptail --backtitle "ASCII Directory // Proxmox Installer" \
  --title "Disk Size (GB)" \
  --inputbox "Enter container disk size in GB:" \
  9 64 "4" 3>&1 1>&2 2>&3) || exit 1

RAM=$(whiptail --backtitle "ASCII Directory // Proxmox Installer" \
  --title "RAM (MB)" \
  --inputbox "Enter memory allocation in MB (512MB recommended):" \
  9 64 "512" 3>&1 1>&2 2>&3) || exit 1

CORES=$(whiptail --backtitle "ASCII Directory // Proxmox Installer" \
  --title "CPU Cores" \
  --inputbox "Enter number of CPU cores:" \
  9 64 "1" 3>&1 1>&2 2>&3) || exit 1

NET_BRIDGE=$(whiptail --backtitle "ASCII Directory // Proxmox Installer" \
  --title "Network Bridge" \
  --inputbox "Enter network bridge (e.g. vmbr0):" \
  9 64 "vmbr0" 3>&1 1>&2 2>&3) || exit 1

IP_TYPE=$(whiptail --backtitle "ASCII Directory // Proxmox Installer" \
  --title "Network IP Assignment" \
  --radiolist "Select IP assignment type:" \
  10 64 2 \
  "dhcp"   "Automatic DHCP (Recommended)" ON \
  "static" "Manual Static IP Address"     OFF \
  3>&1 1>&2 2>&3) || exit 1

NET_CONFIG="name=eth0,bridge=${NET_BRIDGE},ip=dhcp"
if [[ "$IP_TYPE" == "static" ]]; then
  STATIC_IP=$(whiptail --backtitle "ASCII Directory // Proxmox Installer" \
    --title "Static IP Address" \
    --inputbox "Enter IP with CIDR (e.g. 192.168.1.50/24):" \
    9 64 "" 3>&1 1>&2 2>&3) || exit 1
  
  STATIC_GW=$(whiptail --backtitle "ASCII Directory // Proxmox Installer" \
    --title "Gateway IP" \
    --inputbox "Enter default gateway IP (e.g. 192.168.1.1):" \
    9 64 "" 3>&1 1>&2 2>&3) || exit 1

  NET_CONFIG="name=eth0,bridge=${NET_BRIDGE},ip=${STATIC_IP},gw=${STATIC_GW}"
fi

ADMIN_PASS=$(whiptail --backtitle "ASCII Directory // Proxmox Installer" \
  --title "Admin Password" \
  --inputbox "Set Admin password for TUI editor (login <password>):" \
  9 64 "admin123" 3>&1 1>&2 2>&3) || exit 1

# ── Summary Confirmation ───────────────────────────────────────────────────────
whiptail --backtitle "ASCII Directory // Proxmox Installer" \
  --title "Ready to Install" \
  --yesno "Container ID:    $CT_ID\nHostname:        $CT_HOSTNAME\nStorage:         $STORAGE (${DISK_SIZE}GB)\nRAM:             ${RAM}MB / ${CORES} Core(s)\nNetwork:         $NET_CONFIG\nAdmin Pass:      $ADMIN_PASS\n\nProceed with automated LXC creation and deployment?" \
  15 64 || exit 0

# ── Debian 12 Template Acquisition ───────────────────────────────────────────
msg_info "Updating Proxmox appliance template database"
pveam update &>/dev/null || true
msg_ok "Template database updated"

TEMPLATE="debian-12-standard_12.7-1_amd64.tar.zst"
# Find latest available debian-12 template in pveam
LATEST_DEBIAN=$(pveam available -section system 2>/dev/null | grep 'debian-12-standard' | awk '{print $2}' | tail -1 || true)
[[ -n "$LATEST_DEBIAN" ]] && TEMPLATE="$LATEST_DEBIAN"

TEMPLATE_STORAGE="local"
TEMPLATE_PATH="/var/lib/vz/template/cache/${TEMPLATE}"

if [[ ! -f "$TEMPLATE_PATH" ]]; then
  msg_info "Downloading $TEMPLATE into $TEMPLATE_STORAGE"
  pveam download "$TEMPLATE_STORAGE" "$TEMPLATE" || msg_error "Failed to download Debian template."
  msg_ok "Template downloaded"
else
  msg_ok "Template $TEMPLATE found in local cache"
fi

# ── Container Creation ────────────────────────────────────────────────────────
msg_info "Creating LXC container $CT_ID ($CT_HOSTNAME)"
pct create "$CT_ID" "${TEMPLATE_STORAGE}:vztmpl/${TEMPLATE}" \
  -hostname "$CT_HOSTNAME" \
  -cores "$CORES" \
  -memory "$RAM" \
  -swap 512 \
  -storage "$STORAGE" \
  -rootfs "${STORAGE}:${DISK_SIZE}" \
  -net0 "$NET_CONFIG" \
  -unprivileged 1 \
  -features nesting=1 \
  -onboot 1 \
  -start 0 || msg_error "Failed to create LXC container."
msg_ok "LXC container created"

msg_info "Starting container $CT_ID"
pct start "$CT_ID" || msg_error "Failed to start container."
msg_ok "Container running"

# ── Wait for Network / DNS ───────────────────────────────────────────────────
msg_info "Waiting for container network initialization"
CT_IP=""
for i in {1..30}; do
  sleep 1
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
