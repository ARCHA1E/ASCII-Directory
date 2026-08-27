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
|  :  :         '--'.     /  '   | '/  : '   :  | '   :  |         |   | '` ,/   |  | '.'| |  , ;    '   |  / | '   | '.'|   ;  :    ;  \   \  /  |  , ;      \\  ;   :  
|  | ,'           `--'---'   |   :    /  ;   |.'  ;   |.'          ;   :  .'     ;  :    ;  ---'     |   :    | |   :    :   |  ,   /    `----'    ---'        \\  \\  ;  
`--''                         \\   \\ .'   '---'    '---'            |   ,.'       |  ,   /             \\   \\  /   \\   \\  /     ---`-'                            :  \\  \\ 
                               `---`                               '---'          ---`-'               `----'     `----'                                         \\  ' ; 
                                                                                                                                                                  `--`  
====================================================================================================================================================
```

---

## ⚡ 1-Line Proxmox LXC Installer (Helper Script)

Run this single command in your **Proxmox VE Host Shell** to automatically download the Debian 12 template, create a lightweight unprivileged LXC container, install Node.js 22 LTS, clone this repository, build the app, and start the systemd service on boot:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/ARCHA1E/ASCII-Directory/main/proxmox.sh)
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

## 🚀 Manual Deployment

### Local Machine
```bash
git clone https://github.com/ARCHA1E/ASCII-Directory.git
cd ASCII-Directory
npm install
npm run build
npm start
```

### Docker / Docker Compose
```bash
git clone https://github.com/ARCHA1E/ASCII-Directory.git
cd ASCII-Directory
docker compose up -d --build
```

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

## 📜 License

MIT License. Designed with retro love for homelab enthusiasts and vintage computing fans.
