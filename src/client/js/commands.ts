import { state, ThemeType } from './state.js';
import { sound } from './audio.js';

export interface CommandResult {
  text?: string;
  isError?: boolean;
  isSuccess?: boolean;
  clear?: boolean;
  asyncRunner?: (append: (txt: string, cls?: string) => void, stopSignal: { stopped: boolean }) => Promise<void>;
}

export type CommandHandler = (args: string[], rawLine: string) => CommandResult | Promise<CommandResult>;

export const commands: Record<string, CommandHandler> = {};

// Helper: Word wrap for ASCII speech bubbles
function createSpeechBubble(text: string, isThink = false): string {
  const words = text.trim() || 'Moo!';
  const len = Math.min(words.length, 40);
  const top = ' ' + '_'.repeat(len + 2);
  const bottom = ' ' + '-'.repeat(len + 2);
  const bubble = isThink ? '( ' + words.padEnd(len, ' ') + ' )' : '< ' + words.padEnd(len, ' ') + ' >';
  const stem = isThink ? '        o\n         o' : '        \\\n         \\';
  return `${top}\n${bubble}\n${bottom}\n${stem}`;
}

// 1. Star Wars ASCII Player
commands['starwars'] = commands['telnet'] = () => {
  return {
    text: "Connecting to towel.blinkenlights.nl...",
    asyncRunner: async (append, signal) => {
      const frames = [
        `\n       A long time ago, in a galaxy far,\n            far away...`,
        `\n\n         ================================\n              STAR WARS: EPISODE IV\n                 A NEW HOPE\n         ================================`,
        `\n             .          .                  .\n      .           .               .          .\n                  /---\\                      \n                 | o o |   BEEP BOOP!\n                 \\_-_/  /                  \n                 /| |\\ /                   \n                / |_| |                    \n               /  | |  \\                   `,
        `\n           .        .               .        .\n                 ___             /---\\       \n               /     \\          | o o |      \n              | () () |   R2?   \\_-_/        \n               \\  _  /           /| |\\       \n               /|---|\\          / |_| |      \n              / |   | \\        /  | |  \\     `,
        `\n         ================================\n         [ TRANSMISSION COMPLETE / END ]\n         ================================`
      ];

      for (const frame of frames) {
        if (signal.stopped) break;
        append(frame);
        await new Promise(r => setTimeout(r, 1400));
      }
    }
  };
};

// 2. Matrix Digital Rain
commands['matrix'] = commands['cmatrix'] = () => {
  return {
    text: "[MATRIX STREAM INITIALIZED - PRESS ANY KEY OR ENTER TO STOP]",
    asyncRunner: async (append, signal) => {
      const chars = "0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ";
      for (let i = 0; i < 30; i++) {
        if (signal.stopped) break;
        let line = "";
        for (let j = 0; j < 60; j++) {
          line += Math.random() > 0.6 ? chars[Math.floor(Math.random() * chars.length)] : " ";
        }
        append(line, "log-ok");
        await new Promise(r => setTimeout(r, 100));
      }
      append("[MATRIX STREAM TERMINATED]");
    }
  };
};

// 3. Cowsay
commands['cowsay'] = (args) => {
  const msg = args.join(' ') || 'Welcome to the ASCII directory!';
  const bubble = createSpeechBubble(msg, false);
  const cow = `
            ^__^
            (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
  return { text: `${bubble}${cow}` };
};

// 4. Cowthink
commands['cowthink'] = (args) => {
  const msg = args.join(' ') || 'I wonder what domain I should visit next...';
  const bubble = createSpeechBubble(msg, true);
  const cow = `
            ^__^
            (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
  return { text: `${bubble}${cow}` };
};

// 5. SL (Steam Locomotive)
commands['sl'] = () => {
  return {
    text: "[STEAM LOCOMOTIVE INCOMING]",
    asyncRunner: async (append, signal) => {
      const train = `
      ====        ________                ___________ 
  _D _|  |_______/        \\__I_I_____===__|_________| 
   |(_)---  |   H\\________/ _____ |   | | |   ___   | 
   /     |  |   H  |  |     |   | |   | | |  |   |  | 
  |      |  |   H  |__--------------------|  |___|  | 
  | ________|___H__/__|_____/[][]~\\_______|_________| 
  |/ |   |_____/ \\_____/    \\_____/      \\_____/    \\ 
__/  '-----------------------------------------------'
    (O)       (O) (O)      (O) (O)        (O) (O)   `;
      append(train, "log-ok");
      sound.playBeep(220, 0.4, 'triangle');
      await new Promise(r => setTimeout(r, 800));
      sound.playBeep(440, 0.4, 'triangle');
    }
  };
};

// 6. Pipes Screen Saver
commands['pipes'] = () => {
  return {
    text: "[PIPES GENERATOR RUNNING]",
    asyncRunner: async (append, signal) => {
      const glyphs = ["╋", "┳", "┻", "┣", "┫", "┏", "┓", "┗", "┛", "━", "┃"];
      for (let i = 0; i < 15; i++) {
        if (signal.stopped) break;
        let line = "";
        for (let j = 0; j < 45; j++) {
          line += glyphs[Math.floor(Math.random() * glyphs.length)];
        }
        append(line);
        await new Promise(r => setTimeout(r, 120));
      }
      append("[PIPES END]");
    }
  };
};

// 7. Neofetch / Fastfetch (Arch Linux Edition)
commands['neofetch'] = commands['fastfetch'] = () => {
  return {
    text: `
      /\\         user@arch-system
     /  \\        ----------------
    /\\   \\       OS: I use Arch btw.
   /      \\      Kernel: I use Arch btw.
  /   ,,   \\     Uptime: Been using it forever now.
 /   |  |  -\\    Shell: I use Arch btw.
/_-''    ''-_\\   Terminal: I use Arch btw.
                 Memory: 1kb (In this economy?!)
                 Theme: ${state.currentTheme.toUpperCase()}
                 Status: Sweaty, I use Arch btw.
    `
  };
};

// 8. Fortune
commands['fortune'] = () => {
  const fortunes = [
    "\"There are 10 types of people in the world: those who understand binary, and those who don't.\"",
    "\"It works on my machine.\" — Unknown Developer",
    "\"If at first you don't succeed, call it version 1.0.\"",
    "\"Walking on water and developing software from a specification are easy if both are frozen.\" — Edward V. Berard",
    "\"To understand recursion, one must first understand recursion.\"",
    "\"The best thing about a boolean is even if you are wrong, you are only off by a bit.\"",
    "\"There is no cloud, it's just someone else's computer.\"",
    "\"Computers are fast; programmers keep it slow.\""
  ];
  return { text: fortunes[Math.floor(Math.random() * fortunes.length)] };
};

// 9. Hollywood
commands['hollywood'] = () => {
  return {
    text: "[INITIALIZING MAINFRAME CYBER SECURITY BYPASS...]",
    asyncRunner: async (append, signal) => {
      const logs = [
        ">> Scanning subnet 192.168.1.0/24...",
        ">> Port 22/SSH [OPEN] - OpenSSH 8.9p1",
        ">> Port 8006/HTTPS [OPEN] - Gateway Web GUI",
        ">> Bypassing RSA 4096-bit handshake...",
        ">> Injecting memory payload to 0x7FFF004B...",
        ">> Escalating privilege to ring 0...",
        ">> ACCESS GRANTED. Welcome, Operator."
      ];
      for (const log of logs) {
        if (signal.stopped) break;
        append(log, "log-ok");
        await new Promise(r => setTimeout(r, 250));
      }
    }
  };
};

// 10. Figlet / Banner
commands['figlet'] = commands['banner'] = (args) => {
  const str = args.join(' ') || 'ASCII';
  return { text: `[ FIGLET RENDER ]\n\n  ___ _      _     _   \n | __(_)__ _| |___| |_ \n | _|| / _\` | / -_)  _|\n |_| |_\\__, |_\\___|\\__|\n       |___/           \n\n>> Text: "${str.toUpperCase()}"` };
};

// 11. Nyan Cat
commands['nyan'] = commands['nyancat'] = () => {
  return {
    text: `
+-------------------------------------------------------------+
| ~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~ |
| =_=_=_=_=_=_=_=_=_=_=_=_=_=_=[,,_,,]:3_=_=_=_=_=_=_=_=_=_=_ |
| ~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~ |
+-------------------------------------------------------------+
 NYAN NYAN NYAN NYAN NYAN NYAN NYAN!
    `
  };
};

// 12. Snake (Mini ASCII Game)
commands['snake'] = () => {
  return {
    text: `
+--[ RETRO SNAKE ]--------------------+
|                                     |
|     OOOO                            |
|        O       * (FOOD)             |
|        OOOO>                        |
|                                     |
|  SCORE: 00420  | HIGH: 01337        |
+-------------------------------------+
(Use arrow keys to move)
    `
  };
};

// 13. Tetris
commands['tetris'] = () => {
  return {
    text: `
+--[ TETRIS v1.0 ]----+
| . . . . . . . . . . |  NEXT:
| . . . . [][][][] . |  [][]
| . . . . . . . . . . |  [][]
| . . . [][]. . . . . |
| . [][][][]. . . . . |  LINES: 24
| [][][][][][][][][]. |  SCORE: 8400
+---------------------+
    `
  };
};

// 14. Pong
commands['pong'] = () => {
  return {
    text: `
+--[ PONG 1972 ]----------------------+
| |                                 | |
| |              o                  | |
| |                                 | |
|                                   | |
| CPU: 2                   PLAYER: 3  |
+-------------------------------------+
    `
  };
};

// 15. Zork / Adventure
commands['zork'] = commands['adventure'] = (args) => {
  const act = args.join(' ').toLowerCase();
  if (act === 'look' || !act) {
    return {
      text: `WEST OF HOUSE\nYou are standing in an open field west of a white house, with a boarded front door.\nThere is a small mailbox here.\n(Try: 'zork open mailbox' or 'zork go north')`
    };
  }
  if (act.includes('mailbox')) {
    return {
      text: `Opening the small mailbox reveals a leaflet:\n"WELCOME TO ZORK! Your gateway to an ancient underground empire."`
    };
  }
  if (act.includes('north')) {
    return {
      text: `NORTH OF HOUSE\nYou are facing the north side of a white house. There is no door here, and all the windows are boarded up.`
    };
  }
  return { text: `I don't know how to "${act}". You are likely to be eaten by a Grue.` };
};

// 16. Weather / Wttr
commands['weather'] = commands['wttr'] = (args) => {
  const city = args.join(' ') || 'Local Gateway';
  return {
    text: `
Weather report: ${city}

     \\  /       Clear / Retro Sunshine
   _ /""\\ _    +22°C (72°F)
     \\__/      Wind: 5 km/h ENE
     /  \\      Humidity: 45%
               Barometer: 1013 hPa
    `
  };
};

// 17. Rickroll
commands['rickroll'] = () => {
  return {
    text: `
  ♪ NEVER GONNA GIVE YOU UP
  ♪ NEVER GONNA LET YOU DOWN
  ♪ NEVER GONNA RUN AROUND AND DESERT YOU!
  
        o /
       /|
       / \\   [RICK ASTLEY ASCII 1987]
    `
  };
};

// 18. Sudo
commands['sudo'] = (args) => {
  const cmd = args.join(' ').toLowerCase();
  if (cmd.includes('make me a sandwich') || cmd.includes('sandwich')) {
    return { text: "Okay. [A delicious ASCII BLT sandwich appears: [===🥪===]]", isSuccess: true };
  }
  if (cmd.includes('rm -rf /')) {
    return { text: "Nice try! Incident reported to local FBI honeypot.", isError: true };
  }
  return { text: `[sudo] password for guest: \nUser 'guest' is not in the sudoers file. This incident will be reported.`, isError: true };
};

// 19. Hack / Nmap
commands['hack'] = commands['nmap'] = (args) => {
  const target = args[0] || '127.0.0.1';
  return {
    text: `Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toLocaleTimeString()}
Nmap scan report for ${target}
Host is up (0.00021s latency).
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https
Nmap done: 1 IP address scanned in 0.04 seconds.`
  };
};

// 20. BSOD
commands['bsod'] = () => {
  return {
    text: `
*** STOP: 0x000000D1 (0x0000000C, 0x00000002, 0x00000000, 0xF86B5A89)
*** RETRO_DIRECTORY.SYS - Address F86B5A89 base at F86B5000, DateStamp 3d6dd67c

Beginning dump of physical memory...
Physical memory dump complete.
Contact your system administrator or restart terminal with 'clear'.
    `,
    isError: true
  };
};

// 21. Top / Htop
commands['top'] = commands['htop'] = () => {
  return {
    text: `
top - ${new Date().toLocaleTimeString()} up 42 days, 1 user,  load average: 0.12, 0.08, 0.05
Tasks:  84 total,   1 running,  83 sleeping,   0 stopped,   0 zombie
%Cpu(s):  1.2 us,  0.4 sy,  0.0 ni, 98.2 id,  0.1 wa,  0.0 hi,  0.1 si
MiB Mem :  64380.2 total,  48120.4 free,  16259.8 used,   3240.1 buff/cache

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1248 root      20   0  324.5m  84.2m  18.4m S   1.2   0.1  14:22.10 systemd
 1892 guest     20   0  182.1m  42.0m  12.1m S   0.8   0.1   8:14.33 cloudflared
 2410 guest     20   0   94.2m  28.6m   9.8m S   0.4   0.0   0:01.45 node
 3012 guest     20   0   12.4m   4.2m   2.1m R   0.1   0.0   0:00.02 top
    `
  };
};

// 22. Whoami
commands['whoami'] = () => {
  return {
    text: state.authenticated ? "root (authorized system administrator)" : "guest (unprivileged visitor)"
  };
};

// 23. Uname
commands['uname'] = (args) => {
  if (args.includes('-a')) {
    return { text: "Linux arch-gateway 6.8.4-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux" };
  }
  return { text: "Linux" };
};

// 24. Uptime
commands['uptime'] = () => {
  return { text: `${new Date().toLocaleTimeString()} up 42 days, 13:37, 1 user, load average: 0.08, 0.04, 0.01` };
};

// 25. Date & Cal
commands['date'] = () => ({ text: new Date().toString() });
commands['cal'] = () => {
  const d = new Date();
  const monthName = d.toLocaleString('default', { month: 'long', year: 'numeric' });
  return {
    text: `
   ${monthName}
Su Mo Tu We Th Fr Sa
       1  2  3  4  5
 6  7  8  9 10 11 12
13 14 15 16 17 18 19
20 21 22 23 24 25 26
27 28 29 30 31
    `
  };
};

// 26. Help / Man (Completely clean - no admin/login hints)
commands['help'] = commands['man'] = () => {
  const adminSection = state.authenticated ? `
ADMINISTRATION:
  tui / edit                             Open directory management editor
  logout                                 Terminate admin session
` : '';

  return {
    text: `
======================[ RETRO TERMINAL UTILITIES ]======================
SYSTEM & DIRECTORY:
  theme <green|amber|cyan|white|matrix>  Change CRT phosphor palette
  audio <on|off>                         Toggle keyclicks and PC beeps
  scanlines <on|off>                     Toggle CRT scanlines
  grep <search_term>                     Search directory links
  clear / cls                            Clear terminal log
  motd                                   Display system message of the day
  whoami, uptime, date, cal, top, ps     System diagnostic commands
  ping <host>, traceroute <host>         Network diagnostics

UTILITIES & RECREATION:
  cowsay, cowthink, neofetch, fortune, starwars, matrix, sl, pipes,
  hollywood, snake, tetris, pong, zork, weather, rickroll, bsod,
  roll, flip, 8ball, quote, joke, dvd, fire, life, clock, donut, tux
${adminSection}========================================================================
    `.trim()
  };
};

// 27. Ls / Dir
commands['ls'] = commands['dir'] = () => {
  return {
    text: `
drwxr-xr-x 4 root root  4096 Aug 26 00:00 bin/
drwxr-xr-x 2 root root  4096 Aug 26 00:00 etc/
drwxr-xr-x 2 root root  4096 Aug 26 00:00 data/
-rw-r--r-- 1 root root  2048 Aug 26 00:00 directory.json
-rw-r--r-- 1 root root   512 Aug 26 00:00 motd.txt
    `
  };
};

// 28. Cat
commands['cat'] = (args) => {
  const file = args[0] || '';
  if (file.includes('motd') || file.includes('issue')) {
    return { text: state.data?.motd || "ASCII DIRECTORY GATEWAY v1.0" };
  }
  if (file.includes('hosts')) {
    return { text: "127.0.0.1 localhost\n192.168.1.1 gateway.local" };
  }
  return { text: `cat: ${file || 'file'}: No such file or directory`, isError: true };
};

// 29. Ping
commands['ping'] = (args) => {
  const host = args[0] || 'gateway.local';
  return {
    text: `PING ${host} (192.168.1.1): 56 data bytes
64 bytes from 192.168.1.1: icmp_seq=0 ttl=64 time=0.421 ms
64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=0.388 ms
64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=0.412 ms
--- ${host} ping statistics ---
3 packets transmitted, 3 packets received, 0.0% packet loss`
  };
};

// 30. Traceroute
commands['traceroute'] = (args) => {
  const host = args[0] || 'cloudflare.com';
  return {
    text: `traceroute to ${host} (104.16.132.229), 30 hops max
 1  192.168.1.1 (router.local)  0.452 ms
 2  10.0.0.1 (gateway.isp)  4.120 ms
 3  172.68.0.1 (cloudflare-edge)  8.341 ms`
  };
};

// 31. Theme
commands['theme'] = (args) => {
  const target = (args[0] || '').toLowerCase() as ThemeType;
  if (['green', 'amber', 'cyan', 'white', 'matrix'].includes(target)) {
    state.setTheme(target);
    sound.playBeep(780, 0.1, 'triangle');
    return { text: `[THEME] CRT palette switched to ${target.toUpperCase()}`, isSuccess: true };
  }
  return { text: `Usage: theme <green|amber|cyan|white|matrix> (Current: ${state.currentTheme})` };
};

// 32. Audio / Sound
commands['audio'] = commands['sound'] = (args) => {
  const target = (args[0] || '').toLowerCase();
  if (target === 'on') {
    sound.setEnabled(true);
    return { text: "[AUDIO] Sound synthesizer ENABLED.", isSuccess: true };
  }
  if (target === 'off') {
    sound.setEnabled(false);
    return { text: "[AUDIO] Sound synthesizer MUTED.", isSuccess: true };
  }
  const status = sound.toggle();
  return { text: `[AUDIO] Sound is now ${status ? 'ON' : 'MUTED'}.` };
};

// 33. Scanlines / CRT
commands['scanlines'] = commands['crt'] = (args) => {
  const target = (args[0] || '').toLowerCase();
  if (target === 'on') {
    state.setCrtEnabled(true);
    return { text: "[CRT] Scanlines and phosphor shaders ENABLED.", isSuccess: true };
  }
  if (target === 'off') {
    state.setCrtEnabled(false);
    return { text: "[CRT] Scanlines and shaders DISABLED.", isSuccess: true };
  }
  const current = state.toggleCrt();
  return { text: `[CRT] Shaders are now ${current ? 'ENABLED' : 'DISABLED'}.` };
};

// 34. Clear / Cls
commands['clear'] = commands['cls'] = () => ({ clear: true });

// 35. History
commands['history'] = () => ({ text: "Command history buffer active." });

// 36. Echo
commands['echo'] = (args) => ({ text: args.join(' ') });

// 37. Motd
commands['motd'] = () => ({ text: state.data?.motd || "SYSTEM READY." });

// 38. Ps & Kill
commands['ps'] = () => ({
  text: `
  PID TTY          TIME CMD
    1 ?        00:00:02 systemd
  812 ?        00:00:14 init
 1024 ?        00:00:08 cloudflared
 2048 pts/0    00:00:01 node
 2049 pts/0    00:00:00 bash
  `
});
commands['kill'] = (args) => ({ text: `kill: (${args[0] || 'pid'}): Operation not permitted for guest user`, isError: true });

// 39. Df -h
commands['df'] = () => ({
  text: `
Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p2  938G  142G  749G  16% /
tmpfs            32G  1.2M   32G   1% /dev/shm
  `
});

// 40. Free -m
commands['free'] = () => ({
  text: `
               total        used        free      shared  buff/cache   available
Mem:           64380       16259       44880         212        3240       47908
Swap:           8192           0        8192
  `
});

// 41. Ifconfig / Ip
commands['ifconfig'] = commands['ip'] = () => ({
  text: `
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
      inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
cf0:  flags=4099<UP,BROADCAST,MULTICAST>  mtu 1280
      inet 10.0.4.2  netmask 255.255.255.255 (Cloudflare Tunnel)
  `
});

// 42. Netstat
commands['netstat'] = () => ({
  text: `
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:3000            0.0.0.0:*               LISTEN
tcp        0      0 192.168.1.100:3000      192.168.1.50:54321      ESTABLISHED
  `
});

// 43. Grep
commands['grep'] = (args) => {
  const query = args.join(' ').toLowerCase();
  if (!query) return { text: "Usage: grep <keyword>" };
  const matches: string[] = [];
  state.flattenedEntries.forEach(item => {
    if (item.entry.title.toLowerCase().includes(query) || 
        item.entry.url.toLowerCase().includes(query) || 
        item.entry.description.toLowerCase().includes(query)) {
      matches.push(`[${String(item.globalIndex).padStart(2, '0')}] ${item.entry.title} -> ${item.entry.url}`);
    }
  });
  return {
    text: matches.length > 0 
      ? `Matches for "${query}":\n${matches.join('\n')}` 
      : `No directory matches for "${query}".`
  };
};

// 44. Wc
commands['wc'] = (args) => {
  const text = args.join(' ');
  const lines = text ? text.split('\n').length : 0;
  const words = text ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  return { text: `  ${lines}  ${words}  ${chars}` };
};

// 45. Rev
commands['rev'] = (args) => ({ text: args.join(' ').split('').reverse().join('') });

// 46. Rot13
commands['rot13'] = (args) => {
  const str = args.join(' ');
  return {
    text: str.replace(/[a-zA-Z]/g, (c) => {
      const code = c.charCodeAt(0);
      const base = code >= 97 ? 97 : 65;
      return String.fromCharCode(((code - base + 13) % 26) + base);
    })
  };
};

// 47. Base64
commands['base64'] = (args) => {
  const mode = args[0];
  const payload = args.slice(1).join(' ');
  if (mode === '-d' || mode === '--decode') {
    try {
      return { text: atob(payload) };
    } catch {
      return { text: "base64: invalid input data", isError: true };
    }
  }
  return { text: btoa(payload || mode || '') };
};

// 48. Md5
commands['md5'] = (args) => {
  const str = args.join(' ') || 'retro';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return { text: `md5 (${str}) = ${Math.abs(hash).toString(16).padStart(32, '0')}` };
};

// 49. Roll
commands['roll'] = (args) => {
  const dice = args[0] || '1d6';
  const match = dice.match(/^(\d+)d(\d+)$/i);
  if (!match) return { text: "Usage: roll 2d6, roll 1d20" };
  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  let total = 0;
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * sides) + 1;
    rolls.push(r);
    total += r;
  }
  return { text: `Rolling ${dice}: [${rolls.join(', ')}] => Total: ${total}`, isSuccess: true };
};

// 50. Flip
commands['flip'] = () => {
  const heads = Math.random() > 0.5;
  return {
    text: `
   .-----.
  /       \\   Coin Result:
 |   ${heads ? 'HEADS' : 'TAILS'}  |
  \\       /
   '-----'
    `,
    isSuccess: true
  };
};

// 51. 8ball
commands['8ball'] = (args) => {
  const answers = [
    "It is certain.", "Without a doubt.", "You may rely on it.",
    "Ask again later.", "Cannot predict now.", "Don't count on it.",
    "My sources say no.", "Outlook not so good.", "Very doubtful."
  ];
  return {
    text: `[MAGIC 8-BALL]: ${answers[Math.floor(Math.random() * answers.length)]}`
  };
};

// 52. Quote
commands['quote'] = () => {
  const quotes = [
    "\"The only way to do great work is to love what you do.\" — Steve Jobs",
    "\"Talk is cheap. Show me the code.\" — Linus Torvalds",
    "\"Simplicity is prerequisite for reliability.\" — Edsger W. Dijkstra",
    "\"Computers are useless. They can only give you answers.\" — Pablo Picasso"
  ];
  return { text: quotes[Math.floor(Math.random() * quotes.length)] };
};

// 53. Joke
commands['joke'] = () => {
  const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs.",
    "There are 2 hard problems in computer science: cache invalidation, naming things, and off-by-one errors.",
    "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'",
    "Why did the JavaScript developer wear glasses? Because they didn't C#."
  ];
  return { text: jokes[Math.floor(Math.random() * jokes.length)] };
};

// 54. DVD Screensaver
commands['dvd'] = () => {
  return {
    text: `
+------------------------------------+
|                                    |
|         [  D V D  ]                |
|                                    |
+------------------------------------+
* BOUNCE! It hit the corner! *
    `
  };
};

// 55. Fire (Demoscene ASCII Fire)
commands['fire'] = () => {
  return {
    text: `
         (  .      )
     )           (              )
           .  ___   .        .
      ( .   (   )    . )
    .....:::(...)::::.....
   :::::::::::::::::::::::::
  W W W W W W W W W W W W W W
    `
  };
};

// 56. Life (Game of Life)
commands['life'] = commands['conway'] = () => {
  return {
    text: `
Conway's Game of Life (Glider Gun Generation 42):
  . . . . . . . . . . . . . . . . . . . . . . . .
  . . . . . . . . . . . . . . . . . . . . . . . .
  . . . . . . . . . . . . O O . . . . . . . . . .
  . . . . . . . . . . . O . . . O . . . . . . . .
  . . O O . . . . . . O . . . . . O . . O O . . .
  . . O O . . . . . . O . . . O . O . . O O . . .
  . . . . . . . . . . O . . . . . O . . . . . . .
    `
  };
};

// 57. Clock
commands['clock'] = () => {
  const d = new Date();
  const time = d.toTimeString().split(' ')[0];
  return {
    text: `
+--[ RETRO DIGITAL CLOCK ]------------+
|                                     |
|           ${time}                  |
|                                     |
+-------------------------------------+
    `
  };
};

// 58. Donut (3D Spinning Donut ASCII)
commands['donut'] = () => {
  return {
    text: `
             k!;yurzaao=
          !eN@@@@@@@@@@@@8e:
        $@@@@@@@@@@@@@@@@@@@@$
      8@@@@@@@$!:    :!$@@@@@@@8
     &@@@@@$              $@@@@@&
    $@@@@@                  @@@@@$
    @@@@@8                  8@@@@@
    &@@@@@$                $@@@@@&
     8@@@@@@$!:        :!$@@@@@@8
      $@@@@@@@@@@@@@@@@@@@@@@@@$
        !eN@@@@@@@@@@@@@@@@8e:
             k!;yurzaao=
    `
  };
};

// 59. Tux / Mascot
commands['tux'] = commands['mascot'] = () => {
  return {
    text: `
         .---.
        /     \\
       | () () |
        \\  _  /
        /     \\
       /|     |\\
      / |     | \\
     /  |     |  \\
    (   |     |   )
   /    |     |    \\
  (____/       \\____)
    `
  };
};

// 60. Reboot / Exit
commands['reboot'] = commands['exit'] = () => {
  document.body.classList.add('crt-reboot-flash');
  sound.playBeep(320, 0.4, 'sawtooth');
  setTimeout(() => {
    document.body.classList.remove('crt-reboot-flash');
  }, 1300);
  return {
    text: `[SYSTEM] REBOOT SEQUENCE INITIATED... DEGAUSSING CRT TUBE... OK.`,
    isSuccess: true
  };
};
