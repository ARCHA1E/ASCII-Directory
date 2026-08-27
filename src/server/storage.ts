import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from './config.js';
import { DirectoryData, Category, DirectoryEntry, defaultDirectoryData } from './defaultData.js';

export class StorageService {
  private dataFile: string;
  private backupDir: string;
  private queue: Promise<any> = Promise.resolve();

  constructor() {
    this.dataFile = config.dataFile;
    this.backupDir = config.backupDir;
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    const dir = path.dirname(this.dataFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    if (!fs.existsSync(this.dataFile)) {
      this.writeAtomic(defaultDirectoryData);
      console.log(`[STORAGE] Initialized directory data at ${this.dataFile}`);
    }
  }

  private readRaw(): DirectoryData {
    try {
      const raw = fs.readFileSync(this.dataFile, 'utf-8');
      return JSON.parse(raw) as DirectoryData;
    } catch (err) {
      console.error('[STORAGE READ ERROR]', err);
      return defaultDirectoryData;
    }
  }

  private createBackup(data: DirectoryData): void {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `directory-${timestamp}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf-8');

      const files = fs.readdirSync(this.backupDir)
        .filter(f => f.startsWith('directory-') && f.endsWith('.json'))
        .sort()
        .reverse();

      if (files.length > 10) {
        for (let i = 10; i < files.length; i++) {
          try {
            fs.unlinkSync(path.join(this.backupDir, files[i]));
          } catch {}
        }
      }
    } catch (err) {
      console.error('[STORAGE BACKUP ERROR]', err);
    }
  }

  private writeAtomic(data: DirectoryData): void {
    const tempFile = `${this.dataFile}.tmp.${crypto.randomBytes(6).toString('hex')}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, this.dataFile);
  }

  private serialize<T>(fn: () => T | Promise<T>): Promise<T> {
    const result = this.queue.then(() => fn());
    this.queue = result.catch(() => {});
    return result;
  }

  public async getData(): Promise<DirectoryData> {
    return this.serialize(() => this.readRaw());
  }

  public async saveData(data: DirectoryData): Promise<DirectoryData> {
    return this.serialize(() => {
      data.updatedAt = new Date().toISOString();
      this.createBackup(data);
      this.writeAtomic(data);
      return data;
    });
  }

  public async addEntry(categoryId: string, entryData: Partial<DirectoryEntry>): Promise<DirectoryEntry | null> {
    return this.serialize(() => {
      const data = this.readRaw();
      const category = data.categories.find(c => c.id === categoryId);
      if (!category) return null;

      const newEntry: DirectoryEntry = {
        id: `ent_${crypto.randomBytes(4).toString('hex')}`,
        title: entryData.title || 'Untitled',
        url: entryData.url || 'https://',
        description: entryData.description || '',
        target: entryData.target || '_blank',
        tags: entryData.tags || [],
        order: category.entries.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      category.entries.push(newEntry);
      data.updatedAt = new Date().toISOString();
      this.createBackup(data);
      this.writeAtomic(data);
      return newEntry;
    });
  }

  public async updateEntry(entryId: string, updates: Partial<DirectoryEntry>): Promise<DirectoryEntry | null> {
    return this.serialize(() => {
      const data = this.readRaw();
      for (const cat of data.categories) {
        const entry = cat.entries.find(e => e.id === entryId);
        if (entry) {
          Object.assign(entry, updates, {
            id: entry.id,
            updatedAt: new Date().toISOString()
          });
          data.updatedAt = new Date().toISOString();
          this.createBackup(data);
          this.writeAtomic(data);
          return entry;
        }
      }
      return null;
    });
  }

  public async deleteEntry(entryId: string): Promise<boolean> {
    return this.serialize(() => {
      const data = this.readRaw();
      let found = false;
      for (const cat of data.categories) {
        const idx = cat.entries.findIndex(e => e.id === entryId);
        if (idx !== -1) {
          cat.entries.splice(idx, 1);
          cat.entries.forEach((e, i) => { e.order = i + 1; });
          found = true;
          break;
        }
      }
      if (found) {
        data.updatedAt = new Date().toISOString();
        this.createBackup(data);
        this.writeAtomic(data);
      }
      return found;
    });
  }

  public async addCategory(name: string, icon = '[DIR]'): Promise<Category> {
    return this.serialize(() => {
      const data = this.readRaw();
      const newCategory: Category = {
        id: `cat_${crypto.randomBytes(4).toString('hex')}`,
        name: name.toUpperCase(),
        icon: icon,
        order: data.categories.length + 1,
        entries: []
      };
      data.categories.push(newCategory);
      data.updatedAt = new Date().toISOString();
      this.createBackup(data);
      this.writeAtomic(data);
      return newCategory;
    });
  }

  public async updateCategory(categoryId: string, updates: Partial<Category>): Promise<Category | null> {
    return this.serialize(() => {
      const data = this.readRaw();
      const cat = data.categories.find(c => c.id === categoryId);
      if (!cat) return null;

      if (updates.name) cat.name = updates.name.toUpperCase();
      if (updates.icon) cat.icon = updates.icon;
      if (typeof updates.order === 'number') cat.order = updates.order;

      data.updatedAt = new Date().toISOString();
      this.createBackup(data);
      this.writeAtomic(data);
      return cat;
    });
  }

  public async deleteCategory(categoryId: string): Promise<boolean> {
    return this.serialize(() => {
      const data = this.readRaw();
      const idx = data.categories.findIndex(c => c.id === categoryId);
      if (idx === -1) return false;

      data.categories.splice(idx, 1);
      data.categories.forEach((c, i) => { c.order = i + 1; });
      data.updatedAt = new Date().toISOString();
      this.createBackup(data);
      this.writeAtomic(data);
      return true;
    });
  }

  public async updateSettings(settings: Partial<DirectoryData>): Promise<DirectoryData> {
    return this.serialize(() => {
      const data = this.readRaw();
      if (settings.title) data.title = settings.title;
      if (settings.subtitle) data.subtitle = settings.subtitle;
      if (settings.motd) data.motd = settings.motd;
      if (settings.systemName) data.systemName = settings.systemName;
      if (settings.defaultTheme) data.defaultTheme = settings.defaultTheme;
      if (typeof settings.scanlines === 'boolean') data.scanlines = settings.scanlines;
      if (typeof settings.audio === 'boolean') data.audio = settings.audio;

      data.updatedAt = new Date().toISOString();
      this.createBackup(data);
      this.writeAtomic(data);
      return data;
    });
  }
}

export const storage = new StorageService();
