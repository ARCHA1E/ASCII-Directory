import { state } from './state.js';
import { sound } from './audio.js';
import { commands, CommandResult } from './commands.js';
import { TuiEditor } from './tuiEditor.js';

export class TerminalManager {
  private inputEl: HTMLInputElement | null = null;
  private cursorEl: HTMLElement | null = null;
  private outputContainerEl: HTMLElement | null = null;
  private outputLogEl: HTMLElement | null = null;
  private promptLabelEl: HTMLElement | null = null;
  private tuiEditor: TuiEditor;
  
  private actualInput: string = '';
  private history: string[] = [];
  private historyIdx: number = -1;
  private activeAsyncSignal: { stopped: boolean } | null = null;

  constructor(tuiEditor: TuiEditor) {
    this.tuiEditor = tuiEditor;
    this.inputEl = document.getElementById('terminal-input') as HTMLInputElement;
    this.cursorEl = document.querySelector('.custom-cursor');
    this.outputContainerEl = document.getElementById('terminal-output-container');
    this.outputLogEl = document.getElementById('terminal-output');
    this.promptLabelEl = document.getElementById('term-prompt');

    this.setupListeners();
    this.updatePrompt();
  }

  public updatePrompt(): void {
    if (this.promptLabelEl) {
      this.promptLabelEl.textContent = state.authenticated 
        ? 'root@gateway:~# ' 
        : 'guest@gateway:~$ ';
    }
  }

  private setupListeners(): void {
    if (!this.inputEl) return;

    // Focus & Blur toggle for hiding directory list
    this.inputEl.addEventListener('focus', () => {
      document.body.classList.add('terminal-typing-mode');
      if (window.innerWidth <= 860) {
        document.body.classList.add('mobile-terminal-active');
      }
    });

    this.inputEl.addEventListener('blur', () => {
      if (this.inputEl?.value === '' && (!this.outputContainerEl || this.outputContainerEl.classList.contains('collapsed'))) {
        document.body.classList.remove('terminal-typing-mode', 'mobile-terminal-active');
      }
    });

    // Handle typing and dynamic password obfuscation
    this.inputEl.addEventListener('input', () => {
      document.body.classList.add('terminal-typing-mode');
      if (window.innerWidth <= 860) {
        document.body.classList.add('mobile-terminal-active');
      }
      this.handleInputMasking();
      this.updateCursor();
    });
    this.inputEl.addEventListener('click', () => this.updateCursor());
    this.inputEl.addEventListener('keyup', () => this.updateCursor());

    // Enter & History navigation
    this.inputEl.addEventListener('keydown', async (e: KeyboardEvent) => {
      sound.playKeyClick();

      if (e.key === 'Enter') {
        e.preventDefault();
        const line = (this.actualInput || this.inputEl!.value).trim();
        const displayLine = this.inputEl!.value.trim();
        if (!line) return;

        this.history.push(displayLine);
        this.historyIdx = this.history.length;
        this.inputEl!.value = '';
        this.actualInput = '';
        this.updateCursor();

        await this.executeLine(line, displayLine);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.history.length > 0) {
          if (this.historyIdx > 0) this.historyIdx--;
          const histVal = this.history[this.historyIdx] || '';
          this.inputEl!.value = histVal;
          this.actualInput = histVal;
          this.updateCursor();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIdx < this.history.length - 1) {
          this.historyIdx++;
          const histVal = this.history[this.historyIdx] || '';
          this.inputEl!.value = histVal;
          this.actualInput = histVal;
        } else {
          this.historyIdx = this.history.length;
          this.inputEl!.value = '';
          this.actualInput = '';
        }
        this.updateCursor();
      }
    });

    // Clear and close buttons
    const clearBtn = document.getElementById('btn-clear-term');
    if (clearBtn) {
      clearBtn.onclick = () => {
        if (this.outputLogEl) this.outputLogEl.innerHTML = '';
      };
    }

    const closeBtn = document.getElementById('btn-close-term');
    if (closeBtn) {
      closeBtn.onclick = () => {
        this.outputContainerEl?.classList.add('collapsed');
        document.body.classList.remove('terminal-typing-mode', 'mobile-terminal-active');
        this.inputEl?.blur();
      };
    }
  }

  private handleInputMasking(): void {
    if (!this.inputEl) return;
    const currentVal = this.inputEl.value;
    const loginPrefixRegex = /^(login\s+)/i;

    if (!loginPrefixRegex.test(this.actualInput) && !loginPrefixRegex.test(currentVal)) {
      this.actualInput = currentVal;
      return;
    }

    const match = currentVal.match(loginPrefixRegex);
    if (!match) {
      this.actualInput = currentVal;
      return;
    }

    const prefix = match[1];
    const prefixLen = prefix.length;

    if (!loginPrefixRegex.test(this.actualInput)) {
      const rawPass = currentVal.slice(prefixLen);
      this.actualInput = prefix + rawPass;
      this.inputEl.value = prefix + '*'.repeat(rawPass.length);
      const pos = this.inputEl.value.length;
      this.inputEl.setSelectionRange(pos, pos);
      return;
    }

    const oldMatch = this.actualInput.match(loginPrefixRegex)!;
    const oldPrefix = oldMatch[1];
    const oldPass = this.actualInput.slice(oldPrefix.length);
    const newAfterPrefix = currentVal.slice(prefixLen);

    if (newAfterPrefix.length > oldPass.length) {
      const addedChars = newAfterPrefix.slice(oldPass.length);
      const updatedPass = oldPass + addedChars;
      this.actualInput = prefix + updatedPass;
      this.inputEl.value = prefix + '*'.repeat(updatedPass.length);
    } else if (newAfterPrefix.length < oldPass.length) {
      const updatedPass = oldPass.slice(0, newAfterPrefix.length);
      this.actualInput = prefix + updatedPass;
      this.inputEl.value = prefix + '*'.repeat(updatedPass.length);
    } else {
      let updatedPass = '';
      for (let i = 0; i < newAfterPrefix.length; i++) {
        if (newAfterPrefix[i] === '*') {
          updatedPass += oldPass[i] || '*';
        } else {
          updatedPass += newAfterPrefix[i];
        }
      }
      this.actualInput = prefix + updatedPass;
      this.inputEl.value = prefix + '*'.repeat(updatedPass.length);
    }

    const pos = this.inputEl.value.length;
    this.inputEl.setSelectionRange(pos, pos);
  }

  private updateCursor(): void {
    if (!this.inputEl || !this.cursorEl) return;
    const len = this.inputEl.value.length;
    this.cursorEl.style.left = `${len * 9.1}px`;
  }

  public showOutputContainer(): void {
    if (this.outputContainerEl) {
      this.outputContainerEl.classList.remove('collapsed');
    }
    if (window.innerWidth <= 860) {
      document.body.classList.add('mobile-terminal-active');
    }
  }

  public log(text: string, cls = 'log-res'): void {
    if (!this.outputLogEl) return;
    this.showOutputContainer();

    const line = document.createElement('div');
    line.className = cls;
    line.textContent = text;
    this.outputLogEl.appendChild(line);
    this.outputLogEl.scrollTop = this.outputLogEl.scrollHeight;
  }

  private async executeLine(rawLine: string, displayLine?: string): Promise<void> {
    if (this.activeAsyncSignal) {
      this.activeAsyncSignal.stopped = true;
      this.activeAsyncSignal = null;
    }

    const parts = rawLine.trim().split(/\s+/);
    const cmdName = (parts[0] || '').toLowerCase();
    const args = parts.slice(1);

    // If login command, log masked version to terminal output
    const loggedText = (cmdName === 'login')
      ? `${this.promptLabelEl?.textContent || '> '}login ${'*'.repeat(args.join(' ').length)}`
      : `${this.promptLabelEl?.textContent || '> '}${displayLine || rawLine}`;

    this.log(loggedText, 'log-cmd');

    // 1. Direct Number Shortcut to launch URL
    if (/^\d+$/.test(cmdName)) {
      const idx = parseInt(cmdName, 10);
      const item = state.flattenedEntries.find(i => i.globalIndex === idx);
      if (item) {
        this.log(`[LAUNCHING URL]: [${idx}] ${item.entry.title} (${item.entry.url})`, 'log-ok');
        window.open(item.entry.url, item.entry.target || '_blank');
        return;
      } else {
        this.log(`No entry with index [${idx}] found.`, 'log-err');
        return;
      }
    }

    // 2. Authentication Login Command (Undocumented)
    if (cmdName === 'login') {
      const password = args.join(' ');
      if (!password) {
        this.log('Usage: login <password>', 'log-err');
        return;
      }

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          state.setAuthenticated(true);
          this.updatePrompt();
          this.log(`>>> ${data.message}`, 'log-ok');
          this.log(`>>> Initializing Interactive Retro TUI Editor...`, 'log-ok');
          this.tuiEditor.open();
        } else {
          sound.playErrorBuzz();
          this.log(`>>> ${data.error || 'Authentication failed.'}`, 'log-err');
        }
      } catch (err: any) {
        sound.playErrorBuzz();
        this.log(`Connection error: ${err.message}`, 'log-err');
      }
      return;
    }

    // 3. Logout Command
    if (cmdName === 'logout') {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        state.setAuthenticated(false);
        this.updatePrompt();
        this.log('>>> Session terminated.', 'log-ok');
      } catch (err: any) {
        this.log(`Logout error: ${err.message}`, 'log-err');
      }
      return;
    }

    // 4. Open TUI Editor directly if authenticated
    if (cmdName === 'tui' || cmdName === 'edit' || cmdName === 'manage') {
      if (state.authenticated) {
        this.tuiEditor.open();
      } else {
        this.log(`bash: ${cmdName}: command not found. Type 'help' for commands.`, 'log-err');
      }
      return;
    }

    // 5. Check Built-in & Easter Egg Commands
    const handler = commands[cmdName];
    if (handler) {
      try {
        const res: CommandResult = await handler(args, rawLine);
        if (res.clear) {
          if (this.outputLogEl) this.outputLogEl.innerHTML = '';
          return;
        }
        if (res.text) {
          const cls = res.isError ? 'log-err' : (res.isSuccess ? 'log-ok' : 'log-res');
          this.log(res.text, cls);
        }
        if (res.asyncRunner) {
          const signal = { stopped: false };
          this.activeAsyncSignal = signal;
          const frameEl = document.createElement('div');
          frameEl.className = 'log-res';
          this.outputLogEl?.appendChild(frameEl);
          const updateFrame = (txt: string, cls = 'log-res') => {
            frameEl.className = cls;
            frameEl.textContent = txt;
            if (this.outputLogEl) this.outputLogEl.scrollTop = this.outputLogEl.scrollHeight;
          };
          await res.asyncRunner(
            (txt, cls) => this.log(txt, cls || 'log-res'), 
            signal, 
            updateFrame
          );
        }
      } catch (err: any) {
        this.log(`Command execution error: ${err.message}`, 'log-err');
      }
      return;
    }

    // Unrecognized command
    this.log(`bash: ${cmdName}: command not found. Type 'help' for commands.`, 'log-err');
    sound.playErrorBuzz();
  }
}
