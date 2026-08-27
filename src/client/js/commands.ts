import { state, ThemeType } from './state.js';
import { sound, MusicTrack, TRACK_REGISTRY } from './audio.js';

export interface CommandResult {
  text?: string;
  isError?: boolean;
  isSuccess?: boolean;
  clear?: boolean;
  asyncRunner?: (
    append: (txt: string, cls?: string) => void, 
    signal: { stopped: boolean },
    updateFrame?: (txt: string, cls?: string) => void
  ) => Promise<void>;
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

// ── 1. Star Wars ASCII Player ────────────────────────────────────────────────
commands['starwars'] = commands['telnet'] = () => {
  return {
    text: "Connecting to towel.blinkenlights.nl...",
    asyncRunner: async (append, signal, updateFrame) => {
      const frames = [
        `\n       A long time ago, in a galaxy far,\n            far away...`,
        `\n\n         ================================\n              STAR WARS: EPISODE IV\n                 A NEW HOPE\n         ================================`,
        `\n             .          .                  .\n      .           .               .          .\n                  /---\\                      \n                 | o o |   BEEP BOOP!\n                 \\_-_/  /                  \n                 /| |\\ /                   \n                / |_| |                    \n               /  | |  \\                   `,
        `\n           .        .               .        .\n                 ___             /---\\       \n               /     \\          | o o |      \n              | () () |   R2?   \\_-_/        \n               \\  _  /           /| |\\       \n               /|---|\\          / |_| |      \n              / |   | \\        /  | |  \\     `,
        `\n         ================================\n         [ TRANSMISSION COMPLETE / END ]\n         ================================`
      ];

      for (const frame of frames) {
        if (signal.stopped) break;
        if (updateFrame) {
          updateFrame(frame, 'log-ok');
        } else {
          append(frame, 'log-ok');
        }
        await new Promise(r => setTimeout(r, 1400));
      }
    }
  };
};

// ── 2. Matrix Digital Rain ───────────────────────────────────────────────────
commands['matrix'] = commands['cmatrix'] = () => {
  return {
    text: "[MATRIX STREAM INITIALIZED - PRESS ANY KEY TO STOP]",
    asyncRunner: async (append, signal) => {
      const chars = "0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ";
      for (let i = 0; i < 40; i++) {
        if (signal.stopped) break;
        let line = "";
        for (let j = 0; j < 55; j++) {
          line += Math.random() > 0.6 ? chars[Math.floor(Math.random() * chars.length)] : " ";
        }
        append(line, "log-ok");
        await new Promise(r => setTimeout(r, 80));
      }
      append("[MATRIX STREAM TERMINATED]");
    }
  };
};

// ── 3. Cowsay ────────────────────────────────────────────────────────────────
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

// ── 4. Cowthink ──────────────────────────────────────────────────────────────
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

// ── 5. SL (Steam Locomotive) ─────────────────────────────────────────────────
commands['sl'] = () => {
  return {
    text: "[STEAM LOCOMOTIVE INCOMING]",
    asyncRunner: async (append, signal, updateFrame) => {
      const train = `
      ====        ________                ___________
  _D _|  |_______/        \\__I_I_____===__|_________|
   |(_)---  |   H\\________/ _____ |   (|) |       |
   /     |  |   H  |  |   | |___| |     | |       |
  |      |  |   H  |__--------------------|_______|
  | ________|___H__/__|_____/[][]~\\_______|       |
  |/ |   |_____I_____I_____/________\\_____|_______|
   \\_/                  \\_/                  \\_/
      `;
      for (let i = 0; i < 8; i++) {
        if (signal.stopped) break;
        const offset = ' '.repeat(i * 4);
        const frame = train.split('\n').map(l => offset + l).join('\n');
        if (updateFrame) {
          updateFrame(frame, 'log-ok');
        } else {
          append(frame, 'log-ok');
        }
        await new Promise(r => setTimeout(r, 200));
      }
      append("[CHOO CHOO! TRAIN DEPARTED]");
    }
  };
};

// ── 6. Pipes Screensaver ─────────────────────────────────────────────────────
commands['pipes'] = () => {
  return {
    text: "[RETRO PIPES ACTIVATED]",
    asyncRunner: async (append, signal) => {
      const glyphs = ["┌", "┐", "└", "┘", "─", "│", "┼", "├", "┤", "┬", "┴"];
      for (let i = 0; i < 20; i++) {
        if (signal.stopped) break;
        let line = "";
        for (let j = 0; j < 45; j++) {
          line += Math.random() > 0.4 ? glyphs[Math.floor(Math.random() * glyphs.length)] : " ";
        }
        append(line, "log-ok");
        await new Promise(r => setTimeout(r, 120));
      }
    }
  };
};

// ── 7. Neofetch ──────────────────────────────────────────────────────────────
commands['neofetch'] = commands['fastfetch'] = () => {
  const isCrt = state.crtEnabled ? 'Enabled' : 'Disabled';
  const music = sound.getCurrentTrack().toUpperCase();
  return {
    text: `
    /\\         guest@ascii-gateway
   /  \\        -------------------
  /\\   \\       OS: Retro Gateway OS x86_64
 /      \\      Host: Proxmox VE Cluster Node
/   ,,   \\     Kernel: 6.8.4-pve
/   |  |  \\    Uptime: 42 days, 13 hours
/_-'' ''-_\\    Packages: 42 (npm)
               Shell: retro-sh 1.0
               Terminal: CRT VT-220 Monospace
               Theme: ${state.currentTheme.toUpperCase()} (Phosphor)
               CRT Scanlines: ${isCrt}
               Synthesizer: ${music}
               Memory: 16.2GiB / 64.0GiB
    `.trim()
  };
};

// ── 8. Fortune ───────────────────────────────────────────────────────────────
commands['fortune'] = () => {
  const quotes = [
    "“There is no place like 127.0.0.1.”",
    "“To err is human, but to really foul things up you need a computer.”",
    "“Unix is simple. It just takes a genius to understand its simplicity.”",
    "“The quieter you become, the more you are able to hear.”",
    "“Simplicity is prerequisite for reliability.” — Edsger W. Dijkstra",
    "“There are 10 types of people in the world: those who understand binary, and those who don't.”",
    "“A good programmer is someone who always looks both ways before crossing a one-way street.”"
  ];
  return { text: quotes[Math.floor(Math.random() * quotes.length)] };
};

// ── 9. Hollywood Mainframe Hack ──────────────────────────────────────────────
commands['hollywood'] = () => {
  return {
    text: "[ACCESSING MAINFRAME BACKDOOR...]",
    asyncRunner: async (append, signal) => {
      const logs = [
        "[*] Probing port 22/ssh on satellite gateway 10.0.4.1...",
        "[+] Handshake acknowledged. Injecting memory payload...",
        "[!] Overriding RSA-4096 cryptokey with quantum bypass...",
        "[*] Bypassing secondary firewall checksums...",
        "[+] Buffer overflow triggered in root daemon (0xDEADBEEF)...",
        "[+] Root shell acquired on mainframe node #4!",
        "--------------------------------------------------",
        "ACCESS GRANTED: WELCOME TO PROXMOX CORE HYPERVISOR"
      ];
      for (const log of logs) {
        if (signal.stopped) break;
        append(log, "log-ok");
        await new Promise(r => setTimeout(r, 220));
      }
    }
  };
};

// ── 10. Nyan Cat ─────────────────────────────────────────────────────────────
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

// ── 11. PLAYABLE INTERACTIVE SNAKE GAME ───────────────────────────────────────
commands['snake'] = () => {
  return {
    text: "[RETRO SNAKE INITIALIZED - USE ARROW KEYS / WASD TO MOVE, Q TO QUIT]",
    asyncRunner: async (append, signal, updateFrame) => {
      state.activeGame = true;
      const width = 24;
      const height = 10;
      let snake: [number, number][] = [[10, 5], [9, 5], [8, 5]];
      let dir: [number, number] = [1, 0];
      let nextDir: [number, number] = [1, 0];
      let food: [number, number] = [16, 5];
      let score = 0;
      let gameOver = false;

      function spawnFood() {
        while (true) {
          const fx = Math.floor(Math.random() * width);
          const fy = Math.floor(Math.random() * height);
          if (!snake.some(([x, y]) => x === fx && y === fy)) {
            food = [fx, fy];
            break;
          }
        }
      }

      const keyHandler = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase();
        if (k === 'arrowup' || k === 'w') {
          if (dir[1] !== 1) nextDir = [0, -1];
          e.preventDefault();
          e.stopPropagation();
        } else if (k === 'arrowdown' || k === 's') {
          if (dir[1] !== -1) nextDir = [0, 1];
          e.preventDefault();
          e.stopPropagation();
        } else if (k === 'arrowleft' || k === 'a') {
          if (dir[0] !== 1) nextDir = [-1, 0];
          e.preventDefault();
          e.stopPropagation();
        } else if (k === 'arrowright' || k === 'd') {
          if (dir[0] !== -1) nextDir = [1, 0];
          e.preventDefault();
          e.stopPropagation();
        } else if (k === 'q' || k === 'escape') {
          signal.stopped = true;
          e.preventDefault();
          e.stopPropagation();
        }
      };

      window.addEventListener('keydown', keyHandler, true);

      try {
        while (!signal.stopped && !gameOver) {
          dir = nextDir;
          const head = snake[0];
          const newHead: [number, number] = [head[0] + dir[0], head[1] + dir[1]];

          // Wall collision
          if (newHead[0] < 0 || newHead[0] >= width || newHead[1] < 0 || newHead[1] >= height) {
            gameOver = true;
            break;
          }

          // Self collision
          if (snake.some(([x, y]) => x === newHead[0] && y === newHead[1])) {
            gameOver = true;
            break;
          }

          snake.unshift(newHead);

          // Eat food
          if (newHead[0] === food[0] && newHead[1] === food[1]) {
            score += 100;
            sound.playBeep(980, 0.06, 'triangle');
            spawnFood();
          } else {
            snake.pop();
          }

          // Render board
          let board = `+--[ RETRO SNAKE | SCORE: ${String(score).padStart(5, '0')} ]--+\n`;
          for (let y = 0; y < height; y++) {
            let row = '|';
            for (let x = 0; x < width; x++) {
              if (x === snake[0][0] && y === snake[0][1]) {
                row += 'O'; // Head
              } else if (snake.some(([sx, sy]) => sx === x && sy === y)) {
                row += 'o'; // Body
              } else if (x === food[0] && y === food[1]) {
                row += '*'; // Food
              } else {
                row += ' ';
              }
            }
            row += '|\n';
            board += row;
          }
          board += `+---------------------------------------+\n Controls: [Arrows / WASD] Move • [Q] Quit`;

          if (updateFrame) {
            updateFrame(board, 'log-ok');
          }

          // Relaxed tick speed for comfortable gameplay (~175ms)
          await new Promise(r => setTimeout(r, 175));
        }

        if (gameOver) {
          sound.playErrorBuzz();
          const overScreen = `\n=========================================\n       GAME OVER! FINAL SCORE: ${score}\n=========================================\nType 'snake' to play again!`;
          if (updateFrame) {
            updateFrame(overScreen, 'log-err');
          } else {
            append(overScreen, 'log-err');
          }
        }
      } finally {
        state.activeGame = false;
        window.removeEventListener('keydown', keyHandler, true);
      }
    }
  };
};

// ── 12. PLAYABLE INTERACTIVE PONG GAME (FULL 5-POINT MATCH) ───────────────────
commands['pong'] = () => {
  return {
    text: "[RETRO PONG: FIRST TO 5 POINTS - USE W/S OR UP/DOWN KEYS, Q TO QUIT]",
    asyncRunner: async (append, signal, updateFrame) => {
      state.activeGame = true;
      const width = 32;
      const height = 10;
      let pY = 4;
      let cpuY = 4;
      let bX = 16;
      let bY = 5;
      let vX = 0.9;
      let vY = 0.45;
      let pScore = 0;
      let cpuScore = 0;
      const maxScore = 5;

      const keyHandler = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase();
        if (k === 'arrowup' || k === 'w') {
          if (pY > 1) pY--;
          e.preventDefault();
          e.stopPropagation();
        } else if (k === 'arrowdown' || k === 's') {
          if (pY < height - 3) pY++;
          e.preventDefault();
          e.stopPropagation();
        } else if (k === 'q' || k === 'escape') {
          signal.stopped = true;
          e.preventDefault();
          e.stopPropagation();
        }
      };

      window.addEventListener('keydown', keyHandler, true);

      try {
        while (!signal.stopped && pScore < maxScore && cpuScore < maxScore) {
          // Move ball
          bX += vX;
          bY += vY;

          // Top/bottom bounce
          if (bY <= 0 || bY >= height - 1) {
            vY = -vY;
            sound.playBeep(440, 0.03, 'sine');
          }

          // Player paddle bounce (x = 1)
          if (bX <= 2 && bX >= 1) {
            if (bY >= pY - 1 && bY <= pY + 2) {
              vX = Math.abs(vX);
              sound.playBeep(720, 0.04, 'triangle');
            }
          }

          // CPU paddle bounce (x = width - 2)
          if (bX >= width - 3) {
            if (bY >= cpuY - 1 && bY <= cpuY + 2) {
              vX = -Math.abs(vX);
              sound.playBeep(620, 0.04, 'triangle');
            }
          }

          // Point scored
          if (bX < 0) {
            cpuScore++;
            sound.playErrorBuzz();
            bX = 16; bY = 5; vX = 0.9; vY = (Math.random() > 0.5 ? 1 : -1) * 0.45;
            await new Promise(r => setTimeout(r, 600));
          } else if (bX > width) {
            pScore++;
            sound.playSuccessChime();
            bX = 16; bY = 5; vX = -0.9; vY = (Math.random() > 0.5 ? 1 : -1) * 0.45;
            await new Promise(r => setTimeout(r, 600));
          }

          // CPU AI paddle tracking
          if (Math.random() > 0.28) {
            if (cpuY + 1 < bY && cpuY < height - 3) cpuY++;
            if (cpuY + 1 > bY && cpuY > 1) cpuY--;
          }

          // Render board
          let board = `+--[ PONG (MATCH TO 5) | YOU: ${pScore}  CPU: ${cpuScore} ]---------+\n`;
          for (let y = 0; y < height; y++) {
            let row = '|';
            for (let x = 0; x < width; x++) {
              if (x === 1 && (y >= pY && y <= pY + 2)) {
                row += ']'; // Player
              } else if (x === width - 2 && (y >= cpuY && y <= cpuY + 2)) {
                row += '['; // CPU
              } else if (Math.round(x) === Math.round(bX) && Math.round(y) === Math.round(bY)) {
                row += 'O'; // Ball
              } else if (x === Math.floor(width / 2)) {
                row += ':'; // Net
              } else {
                row += ' ';
              }
            }
            row += '|\n';
            board += row;
          }
          board += `+---------------------------------------+\n Controls: [W / S / Arrows] Move • [Q] Quit`;

          if (updateFrame) {
            updateFrame(board, 'log-ok');
          }

          await new Promise(r => setTimeout(r, 85));
        }

        if (pScore >= maxScore) {
          sound.playSuccessChime();
          const winScreen = `\n=========================================\n       VICTORY! YOU DEFEATED THE CPU!\n               SCORE: ${pScore} - ${cpuScore}\n=========================================\nType 'pong' to play again!`;
          if (updateFrame) updateFrame(winScreen, 'log-ok');
        } else if (cpuScore >= maxScore) {
          sound.playErrorBuzz();
          const loseScreen = `\n=========================================\n       MATCH OVER: CPU WON THE MATCH!\n               SCORE: ${pScore} - ${cpuScore}\n=========================================\nType 'pong' to play again!`;
          if (updateFrame) updateFrame(loseScreen, 'log-err');
        }
      } finally {
        state.activeGame = false;
        window.removeEventListener('keydown', keyHandler, true);
      }
    }
  };
};

// ── 13. Tetris ───────────────────────────────────────────────────────────────
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
Type 'snake' or 'pong' for interactive playable arcade games!
    `
  };
};

// ── 14. STATEFUL ZORK DUNGEON ADVENTURE ───────────────────────────────────────
const zorkState = {
  room: 'west_of_house',
  mailboxOpen: false,
  windowOpen: false,
  trapDoorOpen: false,
  lanternLit: false,
  trollDefeated: false,
  inventory: [] as string[]
};

commands['zork'] = commands['adventure'] = (args) => {
  const act = args.join(' ').toLowerCase().trim();

  if (!act || act === 'look' || act === 'l') {
    if (zorkState.room === 'west_of_house') {
      const mbStatus = zorkState.mailboxOpen 
        ? (!zorkState.inventory.includes('leaflet') ? "The mailbox contains a leaflet." : "The mailbox is empty.")
        : "There is a small mailbox here.";
      return {
        text: `WEST OF HOUSE\nYou are standing in an open field west of a white house, with a boarded front door.\n${mbStatus}\n(Exits: north, south, east)`
      };
    }
    if (zorkState.room === 'north_of_house') {
      return {
        text: `NORTH OF HOUSE\nYou are facing the north side of a white house. All windows are boarded up.\n(Exits: west, east)`
      };
    }
    if (zorkState.room === 'behind_house') {
      const winStatus = zorkState.windowOpen ? "The kitchen window is wide open." : "A small kitchen window is slightly ajar.";
      return {
        text: `BEHIND HOUSE\nYou are behind the white house.\n${winStatus}\n(Exits: west, enter window)`
      };
    }
    if (zorkState.room === 'kitchen') {
      const items: string[] = [];
      if (!zorkState.inventory.includes('lantern')) items.push("a brass lantern");
      if (!zorkState.inventory.includes('sack')) items.push("an elongated brown sack");
      const itemStr = items.length ? `On the table is ${items.join(' and ')}.` : '';
      return {
        text: `KITCHEN\nYou are in the kitchen of the white house. A dark doorway leads west.\n${itemStr}\n(Exits: west, exit window)`
      };
    }
    if (zorkState.room === 'living_room') {
      const swordStr = !zorkState.inventory.includes('sword') ? "A glowing elvish sword hangs in a trophy case." : "";
      const trapStr = zorkState.trapDoorOpen ? "A dark trap door leads down into the depths." : "A heavy Oriental rug lies on the floor.";
      return {
        text: `LIVING ROOM\nYou are in the living room.\n${swordStr}\n${trapStr}\n(Exits: east, down)`
      };
    }
    if (zorkState.room === 'cellar') {
      if (!zorkState.lanternLit) {
        return { text: "It is pitch black. You are likely to be eaten by a Grue.\n(Try: 'zork light lantern' or 'zork up')", isError: true };
      }
      const trollStr = zorkState.trollDefeated ? "The unconscious Troll lies in the corner." : "A menacing Troll brandishing an axe blocks the northern path!";
      return {
        text: `CELLAR\nYou are in a cold stone cellar illuminated by your lantern.\n${trollStr}\n(Exits: up, north)`
      };
    }
    if (zorkState.room === 'treasure_room') {
      return {
        text: `TREASURE VAULT OF ZORK!\nYou have discovered the legendary treasure vaults of the Great Underground Empire!\nA jeweled chest overflows with gold and ancient relics!\n\n*** CONGRATULATIONS! YOU HAVE WON ZORK! ***`,
        isSuccess: true
      };
    }
  }

  // Navigation
  if (act === 'go north' || act === 'n' || act === 'north') {
    if (zorkState.room === 'west_of_house') { zorkState.room = 'north_of_house'; return commands['zork'](['look'], ''); }
    if (zorkState.room === 'north_of_house') { return { text: "The forest is too dense to enter." }; }
    if (zorkState.room === 'cellar') {
      if (!zorkState.trollDefeated) return { text: "The Troll swings his axe and blocks your path! Defeat him first!", isError: true };
      zorkState.room = 'treasure_room';
      return commands['zork'](['look'], '');
    }
    return { text: "You cannot go that way." };
  }

  if (act === 'go east' || act === 'e' || act === 'east') {
    if (zorkState.room === 'west_of_house') { return { text: "The front door is securely boarded up." }; }
    if (zorkState.room === 'north_of_house') { zorkState.room = 'behind_house'; return commands['zork'](['look'], ''); }
    if (zorkState.room === 'living_room') { zorkState.room = 'kitchen'; return commands['zork'](['look'], ''); }
    return { text: "You cannot go that way." };
  }

  if (act === 'go west' || act === 'w' || act === 'west') {
    if (zorkState.room === 'north_of_house') { zorkState.room = 'west_of_house'; return commands['zork'](['look'], ''); }
    if (zorkState.room === 'behind_house') { zorkState.room = 'north_of_house'; return commands['zork'](['look'], ''); }
    if (zorkState.room === 'kitchen') { zorkState.room = 'living_room'; return commands['zork'](['look'], ''); }
    return { text: "You cannot go that way." };
  }

  if (act === 'go down' || act === 'd' || act === 'down') {
    if (zorkState.room === 'living_room') {
      if (!zorkState.trapDoorOpen) return { text: "The trap door is closed." };
      zorkState.room = 'cellar';
      return commands['zork'](['look'], '');
    }
    return { text: "You can't go down here." };
  }

  if (act === 'go up' || act === 'u' || act === 'up') {
    if (zorkState.room === 'cellar') { zorkState.room = 'living_room'; return commands['zork'](['look'], ''); }
    return { text: "You can't go up here." };
  }

  // Interactions
  if (act.includes('open mailbox')) {
    zorkState.mailboxOpen = true;
    return { text: "You open the small mailbox. Inside is a leaflet." };
  }

  if (act.includes('read leaflet')) {
    return { text: '"WELCOME TO ZORK! Your gateway to an ancient underground empire."' };
  }

  if (act.includes('open window') || act.includes('enter window')) {
    if (zorkState.room === 'behind_house') {
      zorkState.windowOpen = true;
      zorkState.room = 'kitchen';
      return { text: "With great effort, you pry open the window and climb into the kitchen." };
    }
    return { text: "No open window here." };
  }

  if (act.includes('move rug') || act.includes('open rug') || act.includes('open trapdoor') || act.includes('open trap door')) {
    if (zorkState.room === 'living_room') {
      zorkState.trapDoorOpen = true;
      return { text: "You move the heavy rug aside, revealing a trap door! You open it to reveal a dark descent." };
    }
  }

  if (act.includes('take') || act.includes('get')) {
    if (act.includes('leaflet') && zorkState.room === 'west_of_house' && zorkState.mailboxOpen) {
      zorkState.inventory.push('leaflet');
      return { text: "Taken: leaflet." };
    }
    if (act.includes('lantern') && zorkState.room === 'kitchen') {
      zorkState.inventory.push('lantern');
      return { text: "Taken: brass lantern." };
    }
    if (act.includes('sack') && zorkState.room === 'kitchen') {
      zorkState.inventory.push('sack');
      return { text: "Taken: brown sack." };
    }
    if (act.includes('sword') && zorkState.room === 'living_room') {
      zorkState.inventory.push('sword');
      return { text: "Taken: elvish sword." };
    }
    return { text: "You can't see that here." };
  }

  if (act.includes('light lantern') || act.includes('turn on lantern')) {
    if (zorkState.inventory.includes('lantern')) {
      zorkState.lanternLit = true;
      return { text: "The brass lantern emits a bright golden beam!", isSuccess: true };
    }
    return { text: "You don't have a lantern." };
  }

  if (act.includes('attack') || act.includes('kill') || act.includes('fight')) {
    if (zorkState.room === 'cellar' && !zorkState.trollDefeated) {
      if (zorkState.inventory.includes('sword')) {
        zorkState.trollDefeated = true;
        sound.playSuccessChime();
        return { text: "You strike the Troll with your elvish sword! The Troll falls unconscious to the stone floor!", isSuccess: true };
      }
      return { text: "You attack the Troll with your bare hands, but the Troll is far too strong!", isError: true };
    }
  }

  if (act === 'inventory' || act === 'i') {
    if (zorkState.inventory.length === 0) return { text: "Your inventory is currently empty." };
    return { text: `You are carrying:\n  • ${zorkState.inventory.join('\n  • ')}` };
  }

  if (act === 'restart' || act === 'reset') {
    zorkState.room = 'west_of_house';
    zorkState.mailboxOpen = false;
    zorkState.windowOpen = false;
    zorkState.trapDoorOpen = false;
    zorkState.lanternLit = false;
    zorkState.trollDefeated = false;
    zorkState.inventory = [];
    return { text: "Zork game reset to beginning." };
  }

  return { text: `I don't know how to "${act}". Try: 'look', 'n', 's', 'e', 'w', 'take <item>', 'inventory', or 'restart'.` };
};

// ── 15. Procedural Music Synthesizer & Easter Egg Melodies ────────────────────
commands['music'] = (args) => {
  const target = (args[0] || '').toLowerCase() as MusicTrack | 'status' | 'list' | 'stop' | 'mute';
  if (!target || target === 'status' || target === 'list') {
    const currentMeta = sound.getTrackMetadata();
    return {
      text: `
=======================[ ♪ MUSIC SYNTHESIZER ]========================
CURRENT TRACK: ${currentMeta.title.toUpperCase()}
COMPOSER:      ${currentMeta.composer}
SOURCE:        ${currentMeta.source}
LICENSE:       ${currentMeta.license}
ATTRIBUTION:   ${currentMeta.attribution}

AVAILABLE TRACKS & PLAYLISTS:
  • minecraft   - Full C418 Minecraft Suite (Continuous Playlist)
  • sweden      - C418 - Sweden (Calm 3)
  • subwoofer   - C418 - Subwoofer Lullaby (Hal 1)
  • wethands    - C418 - Wet Hands (Piano 1)
  • miceonvenus - C418 - Mice on Venus (Piano 3)
  • cat         - C418 - Cat (Green Music Disc)
  • wellerman   - Traditional - Soon May the Wellerman Come (Sea Shanty)
  • sneakysnitch- Kevin MacLeod - Sneaky Snitch (CC-BY 4.0)
  • odetojoy    - Beethoven - Ode to Joy (Neon Genesis Evangelion)
  • cyberspace  - 8-bit Arpeggios & Bassline
  • neon        - 16-bit Lo-Fi FM Chords & Sub-Bass
  • ambient     - Deep Space Drone & Celestial Chimes
  • generative  - Infinite Self-Evolving Algorithmic Melody
  • off / stop  - Stop Background Synthesizer

USAGE: music <track_name> | Type 'credits' for full legal licenses.
======================================================================
      `.trim()
    };
  }

  if (target === 'off' || target === 'stop' || target === 'mute') {
    sound.setTrack('off');
    return { text: "[SYNTHESIZER] Background music STOPPED.", isSuccess: true };
  }

  if (TRACK_REGISTRY[target as MusicTrack]) {
    const meta = sound.setTrack(target as MusicTrack);
    sound.playSuccessChime();
    return {
      text: `[♪ NOW PLAYING]: ${meta.title}\n[COMPOSER]:    ${meta.composer}\n[ATTRIBUTION]: ${meta.attribution}`,
      isSuccess: true
    };
  }

  return { text: `Unknown track: "${target}". Type 'music' or 'music list' for available tracks.`, isError: true };
};

// Direct Music Shortcuts with Attribution
commands['minecraft'] = () => {
  const meta = sound.setTrack('minecraft');
  sound.playSuccessChime();
  return {
    text: `[♪ NOW PLAYING]: ${meta.title}\n[COMPOSER]:    ${meta.composer}\n[ATTRIBUTION]: ${meta.attribution}`,
    isSuccess: true
  };
};

commands['sweden'] = () => {
  const meta = sound.setTrack('sweden');
  sound.playSuccessChime();
  return {
    text: `[♪ NOW PLAYING]: ${meta.title}\n[COMPOSER]:    ${meta.composer}\n[ATTRIBUTION]: ${meta.attribution}`,
    isSuccess: true
  };
};

commands['subwoofer'] = () => {
  const meta = sound.setTrack('subwoofer');
  sound.playSuccessChime();
  return {
    text: `[♪ NOW PLAYING]: ${meta.title}\n[COMPOSER]:    ${meta.composer}\n[ATTRIBUTION]: ${meta.attribution}`,
    isSuccess: true
  };
};

commands['wethands'] = () => {
  const meta = sound.setTrack('wethands');
  sound.playSuccessChime();
  return {
    text: `[♪ NOW PLAYING]: ${meta.title}\n[COMPOSER]:    ${meta.composer}\n[ATTRIBUTION]: ${meta.attribution}`,
    isSuccess: true
  };
};

commands['miceonvenus'] = () => {
  const meta = sound.setTrack('miceonvenus');
  sound.playSuccessChime();
  return {
    text: `[♪ NOW PLAYING]: ${meta.title}\n[COMPOSER]:    ${meta.composer}\n[ATTRIBUTION]: ${meta.attribution}`,
    isSuccess: true
  };
};

commands['catdisc'] = () => {
  const meta = sound.setTrack('cat');
  sound.playSuccessChime();
  return {
    text: `[♪ NOW PLAYING]: ${meta.title}\n[COMPOSER]:    ${meta.composer}\n[ATTRIBUTION]: ${meta.attribution}`,
    isSuccess: true
  };
};

commands['wellerman'] = () => {
  const meta = sound.setTrack('wellerman');
  sound.playSuccessChime();
  return {
    text: `[♪ NOW PLAYING]: ${meta.title}\n[COMPOSER]:    ${meta.composer}\n[ATTRIBUTION]: ${meta.attribution}`,
    isSuccess: true
  };
};

commands['sneakysnitch'] = commands['sneaky'] = () => {
  const meta = sound.setTrack('sneakysnitch');
  sound.playSuccessChime();
  return {
    text: `[♪ NOW PLAYING]: ${meta.title}\n[COMPOSER]:    ${meta.composer}\n[ATTRIBUTION]: ${meta.attribution}`,
    isSuccess: true
  };
};

commands['odetojoy'] = commands['evangelion'] = () => {
  const meta = sound.setTrack('odetojoy');
  sound.playSuccessChime();
  return {
    text: `[♪ NOW PLAYING]: ${meta.title}\n[COMPOSER]:    ${meta.composer}\n[ATTRIBUTION]: ${meta.attribution}`,
    isSuccess: true
  };
};

// Dedicated Full Legal Credits & Attributions
commands['credits'] = commands['attribution'] = commands['license'] = () => {
  return {
    text: `
╔════════════════════════════════════════════════════════════════════════════╗
║                ASCII GATEWAY // MUSIC CREDITS & ATTRIBUTIONS               ║
╚════════════════════════════════════════════════════════════════════════════╝

All music in this application is 100% programmatically synthesized in real-time
via Web Audio API code. Zero media files, MP3s, or recordings are stored.

1. MINECRAFT SOUNDTRACK SUITE
   • Tracks: Sweden, Subwoofer Lullaby, Wet Hands, Mice on Venus, Cat
   • Composer: C418 (Daniel Rosenfeld) - https://c418.org
   • License: Non-Commercial Fan Use with Attribution (C418 Terms)
   • Attribution: "Music composed by C418 (Daniel Rosenfeld)"

2. SNEAKY SNITCH
   • Composer: Kevin MacLeod - https://incompetech.com
   • License: Creative Commons Attribution 4.0 International (CC-BY 4.0)
   • Attribution: "Sneaky Snitch by Kevin MacLeod (incompetech.com), licensed under CC-BY 4.0"

3. SOON MAY THE WELLERMAN COME
   • Origin: Traditional 19th-Century New Zealand Sea Shanty
   • License: Public Domain

4. ODE TO JOY (SYMPHONY NO. 9)
   • Composer: Ludwig van Beethoven (1824)
   • Featured In: Neon Genesis Evangelion
   • License: Public Domain

5. PROCEDURAL RETRO ENGINE
   • Tracks: Cyberspace, Neon Dreams, Deep Ambient, Generative Mode
   • Composer: ASCII Directory Web Synthesizer Engine
   • License: MIT Open Source

Type 'music <track>' to play any piece.
══════════════════════════════════════════════════════════════════════════════
    `.trim(),
    isSuccess: true
  };
};

commands['zelda'] = () => {
  sound.playZeldaTheme();
  return { text: "[♪ CHIPTUNE] Playing Zelda Secret & Lullaby melody...", isSuccess: true };
};

commands['pokemon'] = () => {
  sound.playPokemonTheme();
  return { text: "[♪ CHIPTUNE] Playing Pokémon Pallet Town theme...", isSuccess: true };
};

commands['tetristheme'] = commands['tetris_theme'] = () => {
  sound.playTetrisTheme();
  return { text: "[♪ CHIPTUNE] Playing Tetris Korobeiniki 8-bit theme...", isSuccess: true };
};

// ── 16. Weather ──────────────────────────────────────────────────────────────
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

// ── 17. Rickroll ─────────────────────────────────────────────────────────────
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

// ── 18. Sudo ─────────────────────────────────────────────────────────────────
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

// ── 19. Hack / Nmap ──────────────────────────────────────────────────────────
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

// ── 20. BSOD ─────────────────────────────────────────────────────────────────
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

// ── 21. Top / Htop ───────────────────────────────────────────────────────────
commands['top'] = commands['htop'] = () => {
  return {
    text: `
top - ${new Date().toLocaleTimeString()} up 42 days, 1 user, load average: 0.12, 0.08, 0.05
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

// ── 22. Whoami ───────────────────────────────────────────────────────────────
commands['whoami'] = () => {
  return {
    text: state.authenticated ? "root (authorized system administrator)" : "guest (unprivileged visitor)"
  };
};

// ── 23. Uname ────────────────────────────────────────────────────────────────
commands['uname'] = (args) => {
  if (args.includes('-a')) {
    return { text: "Linux arch-gateway 6.8.4-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux" };
  }
  return { text: "Linux" };
};

// ── 24. Uptime ───────────────────────────────────────────────────────────────
commands['uptime'] = () => {
  return { text: `${new Date().toLocaleTimeString()} up 42 days, 13:37, 1 user, load average: 0.08, 0.04, 0.01` };
};

// ── 25. Date & Cal ───────────────────────────────────────────────────────────
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

// ── 26. Help / Man ───────────────────────────────────────────────────────────
commands['help'] = commands['man'] = () => {
  const adminSection = state.authenticated ? `
ADMINISTRATION:
  tui / edit                             Open directory management editor
  logout                                 Terminate admin session
` : '';

  return {
    text: `
=====================[ RETRO TERMINAL UTILITIES ]======================
SYSTEM & DIRECTORY:
  theme <green|amber|cyan|white|matrix>  Change CRT phosphor palette
  audio <on|off>                         Toggle keyclicks and PC beeps
  music <cyberspace|neon|ambient|gen|off> Procedural chiptune music
  scanlines <on|off>                     Toggle CRT scanlines
  grep <search_term>                     Search directory links
  clear / cls                            Clear terminal log
  motd                                   Display system message of the day
  whoami, uptime, date, cal, top, ps     System diagnostic commands
  ping <host>, traceroute <host>         Network diagnostics

UTILITIES & RECREATION:
  snake, pong, tetris, zork              Playable ASCII games
  zelda, pokemon, tetristheme            Iconic chiptune melody easter eggs
  cowsay, cowthink, neofetch, fortune    Fun UNIX tools
  starwars, matrix, sl, pipes, hollywood Demoscene animations
  roll, flip, 8ball, quote, joke, weather Classic mini-utilities
${adminSection}========================================================================
    `.trim()
  };
};

// ── 27. Ls / Dir ─────────────────────────────────────────────────────────────
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

// ── 28. Cat ──────────────────────────────────────────────────────────────────
commands['cat'] = (args) => {
  const file = (args[0] || '').toLowerCase();
  if (file.includes('motd')) {
    return { text: state.data?.motd || "SYSTEM READY." };
  }
  if (file.includes('directory') || file.includes('json')) {
    return { text: JSON.stringify(state.data, null, 2) };
  }
  return { text: `cat: ${file || 'file'}: No such file or directory`, isError: true };
};

// ── 29. Ping ─────────────────────────────────────────────────────────────────
commands['ping'] = (args) => {
  const host = args[0] || '1.1.1.1';
  return {
    text: `PING ${host} (192.168.1.1): 56 data bytes
64 bytes from 192.168.1.1: icmp_seq=0 ttl=64 time=0.421 ms
64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=0.388 ms
64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=0.412 ms
--- ${host} ping statistics ---
3 packets transmitted, 3 packets received, 0.0% packet loss`
  };
};

// ── 30. Traceroute ───────────────────────────────────────────────────────────
commands['traceroute'] = (args) => {
  const host = args[0] || 'cloudflare.com';
  return {
    text: `traceroute to ${host} (104.16.132.229), 30 hops max
 1  192.168.1.1 (router.local)  0.452 ms
 2  10.0.0.1 (gateway.isp)  4.120 ms
 3  172.68.0.1 (cloudflare-edge)  8.341 ms`
  };
};

// ── 31. Theme ────────────────────────────────────────────────────────────────
commands['theme'] = (args) => {
  const target = (args[0] || '').toLowerCase() as ThemeType;
  if (['green', 'amber', 'cyan', 'white', 'matrix'].includes(target)) {
    state.setTheme(target);
    sound.playBeep(780, 0.1, 'triangle');
    return { text: `[THEME] CRT palette switched to ${target.toUpperCase()}`, isSuccess: true };
  }
  return { text: `Usage: theme <green|amber|cyan|white|matrix> (Current: ${state.currentTheme})` };
};

// ── 32. Audio / Sound ────────────────────────────────────────────────────────
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

// ── 33. Scanlines / CRT ──────────────────────────────────────────────────────
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

// ── 34. Clear / Cls ──────────────────────────────────────────────────────────
commands['clear'] = commands['cls'] = () => ({ clear: true });

// ── 35. History ──────────────────────────────────────────────────────────────
commands['history'] = () => ({ text: "Command history buffer active. Use Up/Down arrows in command bar." });

// ── 36. Echo ─────────────────────────────────────────────────────────────────
commands['echo'] = (args) => ({ text: args.join(' ') });

// ── 37. Motd ─────────────────────────────────────────────────────────────────
commands['motd'] = () => ({ text: state.data?.motd || "SYSTEM READY." });

// ── 38. Ps & Kill ────────────────────────────────────────────────────────────
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

// ── 39. Df -h ────────────────────────────────────────────────────────────────
commands['df'] = () => ({
  text: `
Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p2  938G  142G  749G  16% /
tmpfs            32G  1.2M   32G   1% /dev/shm
  `
});

// ── 40. Free -m ──────────────────────────────────────────────────────────────
commands['free'] = () => ({
  text: `
               total        used        free      shared  buff/cache   available
Mem:           64380       16259       44880         212        3240       47908
Swap:           8192           0        8192
  `
});

// ── 41. Ifconfig / Ip ────────────────────────────────────────────────────────
commands['ifconfig'] = commands['ip'] = () => ({
  text: `
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
      inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
cf0:  flags=4099<UP,BROADCAST,MULTICAST>  mtu 1280
      inet 10.0.4.2  netmask 255.255.255.255 (Cloudflare Secure Route)
  `
});

// ── 42. Netstat ──────────────────────────────────────────────────────────────
commands['netstat'] = () => ({
  text: `
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:3000            0.0.0.0:*               LISTEN
tcp        0      0 192.168.1.100:3000      192.168.1.50:54321      ESTABLISHED
  `
});

// ── 43. Grep ─────────────────────────────────────────────────────────────────
commands['grep'] = (args) => {
  const query = args.join(' ').toLowerCase();
  if (!query) return { text: "Usage: grep <keyword>" };
  const matches: string[] = [];
  state.flattenedEntries.forEach(item => {
    const inTitle = item.entry.title.toLowerCase().includes(query);
    const inUrl = item.entry.url.toLowerCase().includes(query);
    const inDesc = (item.entry.description || '').toLowerCase().includes(query);
    const inTag = (item.entry.tags || []).some(t => t.toLowerCase().includes(query));
    if (inTitle || inUrl || inDesc || inTag) {
      matches.push(`[${String(item.globalIndex).padStart(2, '0')}] ${item.entry.title} - ${item.entry.url} (${item.category.name})`);
    }
  });
  if (matches.length === 0) return { text: `No directory matches found for "${query}".` };
  return { text: `Grep results for "${query}":\n${matches.join('\n')}`, isSuccess: true };
};

// ── 44. Roll / Dice ──────────────────────────────────────────────────────────
commands['roll'] = commands['dice'] = (args) => {
  const sides = parseInt(args[0] || '6', 10) || 6;
  const result = Math.floor(Math.random() * sides) + 1;
  return { text: `Rolling d${sides}... Result: [ ${result} ]`, isSuccess: true };
};

// ── 45. Flip Coin ────────────────────────────────────────────────────────────
commands['flip'] = commands['coin'] = () => {
  const res = Math.random() > 0.5 ? "HEADS" : "TAILS";
  return { text: `Flipping coin... Result: [ ${res} ]` };
};

// ── 46. 8ball ────────────────────────────────────────────────────────────────
commands['8ball'] = () => {
  const answers = [
    "It is certain.", "Without a doubt.", "You may rely on it.",
    "Ask again later.", "Cannot predict now.", "Don't count on it.",
    "My sources say no.", "Outlook very good.", "Signs point to yes."
  ];
  return { text: `Magic 8-Ball says: “${answers[Math.floor(Math.random() * answers.length)]}”` };
};

// ── 47. Quote ────────────────────────────────────────────────────────────────
commands['quote'] = () => {
  return { text: "“The only true wisdom is in knowing you know nothing.” — Socrates" };
};

// ── 48. Joke ─────────────────────────────────────────────────────────────────
commands['joke'] = () => {
  const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs.",
    "There are 10 types of people: those who understand binary, and 9 who didn't expect this base 3 joke.",
    "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'"
  ];
  return { text: jokes[Math.floor(Math.random() * jokes.length)] };
};

// ── 49. DVD Screensaver ──────────────────────────────────────────────────────
commands['dvd'] = () => {
  return {
    text: `
+---------------------------------------+
|                                       |
|          [ DVD ]                      |
|                                       |
|                                       |
+---------------------------------------+
(Will it hit the corner? Only time will tell.)
    `
  };
};

// ── 50. Fire ─────────────────────────────────────────────────────────────────
commands['fire'] = () => {
  return {
    text: `
       (  .      )
   )           (              )
         .  '   .   '  .  '  .
(    , )       (.   )  (   ',    )
  .' ) ( . )    ,  ( ,     )   ( .
  ). , ( .   (  ) ( , ) '. ( ,  )
 (_/ (_/ (_/ (_/ (_/ (_/ (_/ (_/
    `
  };
};

// ── 51. Tux ──────────────────────────────────────────────────────────────────
commands['tux'] = () => {
  return {
    text: `
   .--.
  |o_o |
  |:_/ |
 //   \\ \\
(|     | )
/'\\_   _/\`\\
\\___)=(___/
Linux Forever!
    `
  };
};

// ── 52. Clock ────────────────────────────────────────────────────────────────
commands['clock'] = () => {
  return { text: `CURRENT SYSTEM TIME: [ ${new Date().toLocaleTimeString()} ]` };
};
