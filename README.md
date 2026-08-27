# 📟 ASCII DIRECTORY // RETRO GATEWAY

> A 1980s CRT terminal-themed web directory and homelab gateway designed for self-hosting on **Proxmox** (LXC/Docker).

```text
   ,---,          .--.--.      ,----..      ,---,    ,---,             ,---,                                                   ___                                      
  '  .' \        /  /    '.   /   /   \  ,`--.' | ,`--.' |           .'  .' `\     ,--,                                      ,--.'|_                                    
 /  ;    '.     |  :  /`. /  |   :     : |   :  : |   :  :         ,---.'     \  ,--.'|      __  ,-.                         |  | :,'     ,---.     __  ,-.             
:  :       \    ;  |  |--`   .   |  ;. / :   |  ' :   |  '         |   |  .`\  | |  |,     ,' ,'/ /|                         :  : ' :    '   ,'\  ,' ,'/ /|             
:  |   /\   \   |  :  ;_     .   ; /--`  |   :  | |   :  |         :   : |  '  | `--'_     '  | |' |    ,---.      ,---.   .;__,'  /    /   /   | '  | |' |       .--,  
|  :  ' ;.   :   \  \    `.  ;   | ;     '   '  ; '   '  ;         |   ' '  ;  : ,' ,'|    |  |   ,'   /     \    /     \  |  |   |    .   ; ,. : |  |   ,'     /_ ./|  
|  |  ;/  \   \   `----.   \ |   : |     |   |  | |   |  |         '   | ;  .  | '  | |    '  :  /    /    /  |  /    / '  :__,'| :    '   | |: : '  :  /    , ' , ' :  
'  :  | \  \ ,'   __ \  \  | .   | '___  '   :  ; '   :  ;         |   | :  |  ' |  | :    |  | '    .    ' / | .    ' /     '  : |__  '   | .; : |  | '    /___/ \: |  
|  |  '  '--'    /  /`--'  / '   ; : .'| |   |  ' |   |  '         '   : | /  ;  '  : |__  ;  : |    '   ;   /| '   ; :__    |  | '.'| |   :    | ;  : |     .  \\  ' |  
|  :  :         '--'.     /  '   | '/  : '   :  | '   :  |         |   | '` ,/   |  | '.'| |  , ;    '   |  / | '   | '.'|   ;  :    ;  \   \  /  |  , ;      \  ;   :  
|  | ,'           `--'---'   |   :    /  ;   |.'  ;   |.'          ;   :  .'     ;  :    ;  ---'     |   :    | |   :    :   |  ,   /    `----'    ---'        \  \  ;  
`--''                         \   \ .'   '---'    '---'            |   ,.'       |  ,   /             \   \  /   \   \  /     ---`-'                            :  \\  \\ 
                               `---`                               '---'          ---`-'               `----'     `----'                                         \\  ' ; 
                                                                                                                                                                  `--`  
====================================================================================================================================================
```

---

## ✨ Features

- **1980s CRT Visual Suite**:
  - Phosphor Color Palettes: **P1 Green**, **P3 Amber**, **P4 Cyan**, **P45 Monochrome White**, and **Matrix Glow**.
  - Toggleable CRT scanline overlays, phosphor bloom/glow, subtle flicker, and power-on/reboot degauss animations.
- **Synthesized Web Audio Engine**:
  - Zero external audio files required — synthesizes authentic IBM Model M mechanical keyboard key-clacks, 8-bit PC speaker beeps, error buzzes, and arpeggiated login chimes using HTML5 Web Audio API.
- **Categorized ASCII Directory Layout**:
  - Beautiful ASCII box frames (`+---+`, `|`, `+---+`) with dynamic padding and responsive wrapping.
  - Quick Index Numbers `[01]`, `[02]`, domain URLs, descriptions, and hashtags.
- **Dual Keyboard & Mouse Navigation**:
  - Click any link directly to open in a new tab.
  - Keyboard navigation: Arrow keys (`↑`/`↓`), `j`/`k` to navigate, `Enter` to open URL, `Tab` to cycle categories, `/` to focus the terminal, and typing index numbers (e.g. `1`, `02`) to quick-jump.
- **Unobtrusive Command Bar & Secret Admin Login**:
  - Constantly visible terminal prompt positioned above the directory (`guest@gateway:~$ `).
  - Automatically hides the directory list when typing to give a clean terminal view (`Escape` returns to directory).
  - Type `login <password>` to authenticate. Password verification is performed **100% on the server side** with secure HTTP-only session cookies and brute-force rate limiting.
- **Interactive Retro TUI Editor (Curses-style)**:
  - Logging in as admin launches a full-screen retro curses modal editor.
  - Manage categories and entries directly from the keyboard:
    - `[A]` Add Entry &nbsp;•&nbsp; `[E]` Edit Entry &nbsp;•&nbsp; `[D]` Delete Entry
    - `[+]` Add Category &nbsp;•&nbsp; `[-]` Delete Category &nbsp;•&nbsp; `[R]` Rename
    - `[Tab/Arrows]` Switch panels &nbsp;•&nbsp; `[Q]` Close Editor
- **60 Terminal Utilities & Easter Eggs**:
  - Rich collection of terminal commands and simulations (`starwars`, `cmatrix`, `sl`, `pipes`, `cowsay`, `neofetch`, `snake`, `tetris`, `pong`, `zork`, `weather`, `rickroll`, `sudo`, `hack`, `top`, `fire`, `donut`, `tux`, etc.).
- **Zero-Dependency Atomic Storage**:
  - Stores data in `data/directory.json` with thread-safe atomic writes and automatic timestamped rolling backups (`data/backups/`).

---

## 🚀 Quick Start (Local)

```bash
# 1. Clone the repository
git clone https://github.com/ARCHA1E/ASCII-Directory.git
cd ASCII-Directory

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional)
cp .env.example .env

# 4. Build and start server
npm run build
npm start
```

Access the web interface at `http://localhost:3000`.

---

## 🖥️ Proxmox Deployment

### Option A: Proxmox LXC Container (Debian / Ubuntu)

1. Create a standard Debian 12 or Ubuntu 22.04+ LXC container in Proxmox.
2. Inside your LXC container console, clone this repository and run the setup script:
   ```bash
   git clone https://github.com/ARCHA1E/ASCII-Directory.git /opt/ascii-directory
   cd /opt/ascii-directory
   chmod +x deployment/proxmox-lxc.sh
   ./deployment/proxmox-lxc.sh
   ```
3. The script automatically installs Node.js 22 LTS (if missing), builds the assets, prompts for your desired admin password, and starts the `ascii-directory` systemd service configured to auto-start on boot.

Manage the service:
```bash
systemctl status ascii-directory
systemctl restart ascii-directory
```

### Option B: Docker / Docker Compose in Proxmox

1. In your Docker-enabled LXC container or VM:
   ```bash
   git clone https://github.com/ARCHA1E/ASCII-Directory.git
   cd ASCII-Directory
   docker compose up -d --build
   ```
2. The directory will be available on port `3000` (or `PORT` configured in `.env`).

---

## ⚙️ Configuration (.env)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | HTTP port for the web application |
| `HOST` | `0.0.0.0` | Network binding interface |
| `ADMIN_PASSWORD` | `admin123` | Master password for admin authentication (`login <password>`) |
| `JWT_SECRET` | *(auto-generated)* | 32-character secret for signing session cookies |
| `DATA_DIR` | `./data` | Path to persistent storage directory for `directory.json` |

---

## ⌨️ Navigation & Controls

| Key / Action | Function |
| :--- | :--- |
| **Mouse Click** | Click any link to open destination URL |
| **`↓` / `j`** | Select next entry |
| **`↑` / `k`** | Select previous entry |
| **`Enter`** | Open highlighted entry in browser |
| **`Tab`** | Cycle focus across category sections |
| **`01`, `02`, `1..N`** | Quick-jump to entry by index number |
| **`/`** | Focus terminal command bar (hides directory list while typing) |
| **`Escape`** | Unfocus terminal & return to directory view |
| **`[THEME]`** | Cycle CRT Phosphor theme (Green, Amber, Cyan, White, Matrix) |
| **`[CRT]`** | Toggle CRT scanlines and phosphor shaders on/off |
| **`[AUDIO]`** | Toggle synthesized mechanical keyclacks & PC beeps |

---

## 💻 Terminal Commands & Easter Eggs

Type any of the following into the command line:

| Command | Description |
| :--- | :--- |
| `login <password>` | Authenticate as admin and launch the Interactive Retro TUI Editor |
| `logout` | Terminate admin session |
| `tui` / `edit` | Open the curses-style directory manager (when authenticated) |
| `theme <green\|amber\|cyan\|white\|matrix>` | Change CRT color palette |
| `audio <on\|off>` | Toggle sound synthesizer |
| `scanlines <on\|off>` | Toggle CRT scanlines and bloom shaders |
| `grep <keyword>` | Search directory entries by name, URL, or tag |
| `starwars` / `telnet` | ASCII Star Wars Episode IV scene animation player |
| `matrix` / `cmatrix` | Falling digital rain screen effect |
| `cowsay <text>` | ASCII talking cow speech bubble |
| `cowthink <text>` | ASCII thinking cow |
| `sl` | Animated Steam Locomotive train chugging across screen |
| `pipes` | Multi-color retro pipe screensaver |
| `neofetch` / `fastfetch` | Arch Linux system specs and ASCII logo |
| `fortune` | Classic UNIX fortune cookie quotes |
| `hollywood` | Cyberpunk mainframe hacking simulation |
| `snake`, `tetris`, `pong` | Playable mini ASCII arcade games |
| `zork` / `adventure` | Interactive text dungeon room explorer |
| `weather [city]` / `wttr` | ASCII weather report card |
| `rickroll` | ASCII Rick Astley animation |
| `sudo <command>` | Humorous UNIX privilege responses |
| `top` / `htop` | Live ASCII CPU, memory, and process monitor |
| `fire`, `donut`, `dvd`, `life` | Retro demoscene ASCII animations |
| `whoami`, `uptime`, `date`, `cal` | Standard system information utilities |
| `ping <host>`, `traceroute <host>` | Network diagnostics |
| `help` / `man` | Full command reference list |

---

## 🔒 Security & Data Integrity

- **Server-Side Authentication**: Master password is never transmitted to client JS bundles or exposed in responses.
- **HTTP-Only Cookies & Rate Limiting**: Brute-force protection blocks suspicious IPs after consecutive failed login attempts.
- **Atomic Persistence**: Directory data is written atomically using temporary swap files (`fs.renameSync`) to prevent file corruption during sudden power losses.
- **Rolling Backups**: Automatically stores the last 10 versions in `data/backups/` every time a change is saved.

---

## 📜 License

MIT License. Designed with retro love for homelab enthusiasts and vintage computing fans.
