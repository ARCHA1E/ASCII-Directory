import { state, DirectoryData } from './state.js';
import { sound } from './audio.js';
import { DirectoryRenderer } from './renderer.js';
import { NavigationManager } from './navigation.js';
import { TuiEditor } from './tuiEditor.js';
import { TerminalManager } from './terminal.js';

class RetroApp {
  private renderer: DirectoryRenderer;
  private navigation: NavigationManager;
  private tuiEditor: TuiEditor;
  private terminal: TerminalManager;
  private startTime: number = Date.now();

  constructor() {
    this.renderer = new DirectoryRenderer();
    this.navigation = new NavigationManager(this.renderer);
    this.tuiEditor = new TuiEditor(() => {
      this.renderer.render();
    });
    this.terminal = new TerminalManager(this.tuiEditor);

    this.initThemeAndCrt();
    this.setupHeaderControls();
    this.startUptimeTicker();
    this.fetchData();
    this.checkAuth();

    state.subscribe(() => {
      this.renderer.render();
      this.updateHeaderLabels();
      this.terminal.updatePrompt();
    });
  }

  private initThemeAndCrt(): void {
    document.documentElement.setAttribute('data-theme', state.currentTheme);
    if (state.crtEnabled) {
      document.body.classList.add('crt-enabled');
    } else {
      document.body.classList.remove('crt-enabled');
    }
    this.updateHeaderLabels();
  }

  private updateHeaderLabels(): void {
    const themeLabel = document.getElementById('current-theme-label');
    if (themeLabel) {
      themeLabel.textContent = state.currentTheme.toUpperCase();
    }

    const crtLabel = document.getElementById('crt-status-label');
    if (crtLabel) {
      crtLabel.textContent = state.crtEnabled ? 'ON' : 'OFF';
    }

    const audioLabel = document.getElementById('audio-status-label');
    if (audioLabel) {
      audioLabel.textContent = sound.isEnabled() ? 'ON' : 'MUTED';
    }
  }

  private setupHeaderControls(): void {
    const themeBtn = document.getElementById('btn-theme-cycle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        state.cycleTheme();
        sound.playBeep(600, 0.08, 'triangle');
      });
    }

    const crtBtn = document.getElementById('btn-crt-toggle');
    if (crtBtn) {
      crtBtn.addEventListener('click', () => {
        state.toggleCrt();
        sound.playBeep(520, 0.08, 'sine');
      });
    }

    const audioBtn = document.getElementById('btn-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        sound.toggle();
        this.updateHeaderLabels();
      });
    }
  }

  private startUptimeTicker(): void {
    const uptimeEl = document.getElementById('status-uptime');
    setInterval(() => {
      if (!uptimeEl) return;
      const diffSec = Math.floor((Date.now() - this.startTime) / 1000);
      const hrs = String(Math.floor(diffSec / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
      const secs = String(diffSec % 60).padStart(2, '0');
      uptimeEl.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);
  }

  private async fetchData(): Promise<void> {
    try {
      const res = await fetch('/api/directory');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DirectoryData = await res.json();
      state.setData(data);
      this.renderer.render();
    } catch (err: any) {
      console.error('Failed to load directory data', err);
    }
  }

  private async checkAuth(): Promise<void> {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const data = await res.json();
        state.setAuthenticated(data.authenticated);
      }
    } catch (err) {
      console.error('Auth check error', err);
    }
  }
}

// Boot application
window.addEventListener('DOMContentLoaded', () => {
  new RetroApp();
});
