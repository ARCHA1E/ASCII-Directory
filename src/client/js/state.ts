export interface DirectoryEntry {
  id: string;
  title: string;
  url: string;
  description: string;
  target?: string;
  tags?: string[];
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  order: number;
  entries: DirectoryEntry[];
}

export interface DirectoryData {
  version: string;
  title: string;
  subtitle: string;
  motd: string;
  systemName: string;
  defaultTheme: 'green' | 'amber' | 'cyan' | 'white' | 'matrix';
  scanlines: boolean;
  audio: boolean;
  categories: Category[];
  updatedAt: string;
}

export type ThemeType = 'green' | 'amber' | 'cyan' | 'white' | 'matrix';

export class AppState {
  public data: DirectoryData | null = null;
  public authenticated: boolean = false;
  public currentTheme: ThemeType = 'green';
  public crtEnabled: boolean = true;
  public selectedEntryIndex: number = -1;
  public flattenedEntries: { entry: DirectoryEntry; category: Category; globalIndex: number }[] = [];
  public listeners: Set<() => void> = new Set();

  constructor() {
    const savedTheme = localStorage.getItem('ascii_theme') as ThemeType;
    if (savedTheme && ['green', 'amber', 'cyan', 'white', 'matrix'].includes(savedTheme)) {
      this.currentTheme = savedTheme;
    }
    const savedCrt = localStorage.getItem('ascii_crt_enabled');
    if (savedCrt !== null) {
      this.crtEnabled = savedCrt === 'true';
    }
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public notify(): void {
    this.rebuildFlattenedEntries();
    this.listeners.forEach(fn => fn());
  }

  public setData(data: DirectoryData): void {
    this.data = data;
    this.notify();
  }

  public setAuthenticated(auth: boolean): void {
    this.authenticated = auth;
    this.notify();
  }

  public setTheme(theme: ThemeType): void {
    this.currentTheme = theme;
    localStorage.setItem('ascii_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.notify();
  }

  public cycleTheme(): ThemeType {
    const themes: ThemeType[] = ['green', 'amber', 'cyan', 'white', 'matrix'];
    const idx = themes.indexOf(this.currentTheme);
    const nextTheme = themes[(idx + 1) % themes.length];
    this.setTheme(nextTheme);
    return nextTheme;
  }

  public setCrtEnabled(enabled: boolean): void {
    this.crtEnabled = enabled;
    localStorage.setItem('ascii_crt_enabled', String(enabled));
    if (enabled) {
      document.body.classList.add('crt-enabled');
    } else {
      document.body.classList.remove('crt-enabled');
    }
    this.notify();
  }

  public toggleCrt(): boolean {
    this.setCrtEnabled(!this.crtEnabled);
    return this.crtEnabled;
  }

  private rebuildFlattenedEntries(): void {
    if (!this.data) {
      this.flattenedEntries = [];
      return;
    }
    const list: { entry: DirectoryEntry; category: Category; globalIndex: number }[] = [];
    let idx = 1;
    this.data.categories
      .sort((a, b) => a.order - b.order)
      .forEach(cat => {
        cat.entries
          .sort((a, b) => a.order - b.order)
          .forEach(entry => {
            list.push({ entry, category: cat, globalIndex: idx++ });
          });
      });
    this.flattenedEntries = list;
  }
}

export const state = new AppState();
