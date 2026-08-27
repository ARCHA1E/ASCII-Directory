import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from './config.js';
import { DirectoryData, Category, DirectoryEntry, defaultDirectoryData } from './defaultData.js';

export interface TagInfo {
  tag: string;
  count: number;
}

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
      const parsed = JSON.parse(raw) as DirectoryData;
      if (parsed.showCategoryNumbers === undefined) parsed.showCategoryNumbers = true;
      if (parsed.showEntryNumbers === undefined) parsed.showEntryNumbers = true;
      if (!Array.isArray(parsed.customTags)) parsed.customTags = [];
      return parsed;
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
        title: (entryData.title || 'Untitled').trim().slice(0, 100),
        url: (entryData.url || 'https://').trim().slice(0, 500),
        description: (entryData.description || '').trim().slice(0, 300),
        target: entryData.target || '_blank',
        tags: Array.isArray(entryData.tags) 
          ? entryData.tags.map(t => String(t).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '')).filter(Boolean).slice(0, 20)
          : [],
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

  public async updateEntry(entryId: string, updates: Partial<DirectoryEntry> & { categoryId?: string }): Promise<DirectoryEntry | null> {
    return this.serialize(() => {
      const data = this.readRaw();
      let currentCat: Category | null = null;
      let entryIdx = -1;
      let existingEntry: DirectoryEntry | null = null;

      for (const cat of data.categories) {
        const idx = cat.entries.findIndex(e => e.id === entryId);
        if (idx !== -1) {
          currentCat = cat;
          entryIdx = idx;
          existingEntry = cat.entries[idx];
          break;
        }
      }

      if (!currentCat || !existingEntry || entryIdx === -1) return null;

      const sanitizedUpdates: Partial<DirectoryEntry> = {};
      if (updates.title !== undefined) sanitizedUpdates.title = String(updates.title).trim().slice(0, 100);
      if (updates.url !== undefined) sanitizedUpdates.url = String(updates.url).trim().slice(0, 500);
      if (updates.description !== undefined) sanitizedUpdates.description = String(updates.description).trim().slice(0, 300);
      if (updates.target !== undefined) sanitizedUpdates.target = updates.target;
      if (Array.isArray(updates.tags)) {
        sanitizedUpdates.tags = updates.tags
          .map(t => String(t).toLowerCase().trim().replace(/[^a-z0-9_-]/g, ''))
          .filter(Boolean)
          .slice(0, 20);
      }

      const targetCategoryId = updates.categoryId;
      const isMovingCategory = targetCategoryId && targetCategoryId !== currentCat.id;

      if (isMovingCategory) {
        const targetCat = data.categories.find(c => c.id === targetCategoryId);
        if (!targetCat) return null;

        // Remove from current category
        currentCat.entries.splice(entryIdx, 1);
        currentCat.entries.forEach((e, i) => { e.order = i + 1; });

        // Update fields
        Object.assign(existingEntry, sanitizedUpdates, {
          id: existingEntry.id,
          order: targetCat.entries.length + 1,
          updatedAt: new Date().toISOString()
        });

        // Add to new category
        targetCat.entries.push(existingEntry);
      } else {
        // In-place update
        Object.assign(existingEntry, sanitizedUpdates, {
          id: existingEntry.id,
          updatedAt: new Date().toISOString()
        });
      }

      data.updatedAt = new Date().toISOString();
      this.createBackup(data);
      this.writeAtomic(data);
      return existingEntry;
    });
  }

  public async moveEntry(entryId: string, direction: 'up' | 'down'): Promise<DirectoryData | null> {
    return this.serialize(() => {
      const data = this.readRaw();
      let found = false;

      for (const cat of data.categories) {
        const entries = cat.entries.sort((a, b) => a.order - b.order);
        const idx = entries.findIndex(e => e.id === entryId);
        if (idx !== -1) {
          const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (targetIdx >= 0 && targetIdx < entries.length) {
            const temp = entries[idx];
            entries[idx] = entries[targetIdx];
            entries[targetIdx] = temp;
            entries.forEach((e, i) => { e.order = i + 1; });
            cat.entries = entries;
            found = true;
          }
          break;
        }
      }

      if (found) {
        data.updatedAt = new Date().toISOString();
        this.createBackup(data);
        this.writeAtomic(data);
      }
      return data;
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
        name: name.trim().toUpperCase().slice(0, 60),
        icon: icon.trim().slice(0, 15) || '[DIR]',
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

      if (updates.name) cat.name = updates.name.trim().toUpperCase().slice(0, 60);
      if (updates.icon) cat.icon = updates.icon.trim().slice(0, 15);
      if (typeof updates.order === 'number') cat.order = updates.order;

      data.updatedAt = new Date().toISOString();
      this.createBackup(data);
      this.writeAtomic(data);
      return cat;
    });
  }

  public async moveCategory(categoryId: string, direction: 'up' | 'down'): Promise<DirectoryData | null> {
    return this.serialize(() => {
      const data = this.readRaw();
      const categories = data.categories.sort((a, b) => a.order - b.order);
      const idx = categories.findIndex(c => c.id === categoryId);
      if (idx === -1) return null;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx >= 0 && targetIdx < categories.length) {
        const temp = categories[idx];
        categories[idx] = categories[targetIdx];
        categories[targetIdx] = temp;
        categories.forEach((c, i) => { c.order = i + 1; });
        data.categories = categories;

        data.updatedAt = new Date().toISOString();
        this.createBackup(data);
        this.writeAtomic(data);
      }
      return data;
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
      if (settings.title) data.title = String(settings.title).trim().slice(0, 80);
      if (settings.subtitle) data.subtitle = String(settings.subtitle).trim().slice(0, 120);
      if (settings.motd) data.motd = String(settings.motd).trim().slice(0, 300);
      if (settings.systemName) data.systemName = String(settings.systemName).trim().slice(0, 40);
      if (settings.defaultTheme) data.defaultTheme = settings.defaultTheme;
      if (typeof settings.scanlines === 'boolean') data.scanlines = settings.scanlines;
      if (typeof settings.audio === 'boolean') data.audio = settings.audio;
      if (typeof settings.showCategoryNumbers === 'boolean') data.showCategoryNumbers = settings.showCategoryNumbers;
      if (typeof settings.showEntryNumbers === 'boolean') data.showEntryNumbers = settings.showEntryNumbers;

      data.updatedAt = new Date().toISOString();
      this.createBackup(data);
      this.writeAtomic(data);
      return data;
    });
  }

  // ── Tag Management Methods ─────────────────────────────────────────────────
  public async getAllTags(): Promise<TagInfo[]> {
    return this.serialize(() => {
      const data = this.readRaw();
      const tagCounts = new Map<string, number>();

      // Count occurrences across all entries
      for (const cat of data.categories) {
        for (const entry of cat.entries) {
          for (const rawTag of entry.tags || []) {
            const tag = rawTag.toLowerCase().trim();
            if (tag) {
              tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            }
          }
        }
      }

      // Include standalone custom tags (count = 0 if not used yet)
      for (const rawCustom of data.customTags || []) {
        const tag = rawCustom.toLowerCase().trim();
        if (tag && !tagCounts.has(tag)) {
          tagCounts.set(tag, 0);
        }
      }

      const list: TagInfo[] = [];
      for (const [tag, count] of tagCounts.entries()) {
        list.push({ tag, count });
      }

      return list.sort((a, b) => a.tag.localeCompare(b.tag));
    });
  }

  public async addCustomTag(rawTag: string): Promise<TagInfo[]> {
    return this.serialize(() => {
      const data = this.readRaw();
      const tag = String(rawTag).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '').slice(0, 50);
      if (!tag) return this.getAllTags();

      if (!Array.isArray(data.customTags)) data.customTags = [];
      if (!data.customTags.includes(tag)) {
        data.customTags.push(tag);
        data.updatedAt = new Date().toISOString();
        this.createBackup(data);
        this.writeAtomic(data);
      }

      const counts = new Map<string, number>();
      for (const cat of data.categories) {
        for (const entry of cat.entries) {
          for (const t of entry.tags || []) {
            counts.set(t, (counts.get(t) || 0) + 1);
          }
        }
      }
      for (const t of data.customTags) {
        if (!counts.has(t)) counts.set(t, 0);
      }

      const list: TagInfo[] = [];
      for (const [t, count] of counts.entries()) {
        list.push({ tag: t, count });
      }
      return list.sort((a, b) => a.tag.localeCompare(b.tag));
    });
  }

  public async renameTag(oldRaw: string, newRaw: string): Promise<DirectoryData> {
    return this.serialize(() => {
      const data = this.readRaw();
      const oldTag = String(oldRaw).toLowerCase().trim();
      const newTag = String(newRaw).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '').slice(0, 50);

      if (!oldTag || !newTag || oldTag === newTag) return data;

      // Update customTags pool
      if (Array.isArray(data.customTags)) {
        const cIdx = data.customTags.indexOf(oldTag);
        if (cIdx !== -1) {
          data.customTags.splice(cIdx, 1);
        }
        if (!data.customTags.includes(newTag)) {
          data.customTags.push(newTag);
        }
      }

      // Update all entries in all categories
      for (const cat of data.categories) {
        for (const entry of cat.entries) {
          if (Array.isArray(entry.tags) && entry.tags.includes(oldTag)) {
            const updated = entry.tags.map(t => t === oldTag ? newTag : t);
            entry.tags = Array.from(new Set(updated));
            entry.updatedAt = new Date().toISOString();
          }
        }
      }

      data.updatedAt = new Date().toISOString();
      this.createBackup(data);
      this.writeAtomic(data);
      return data;
    });
  }

  public async deleteTag(rawTag: string): Promise<DirectoryData> {
    return this.serialize(() => {
      const data = this.readRaw();
      const tag = String(rawTag).toLowerCase().trim();
      if (!tag) return data;

      // Remove from customTags pool
      if (Array.isArray(data.customTags)) {
        const idx = data.customTags.indexOf(tag);
        if (idx !== -1) {
          data.customTags.splice(idx, 1);
        }
      }

      // Remove from all entries
      for (const cat of data.categories) {
        for (const entry of cat.entries) {
          if (Array.isArray(entry.tags) && entry.tags.includes(tag)) {
            entry.tags = entry.tags.filter(t => t !== tag);
            entry.updatedAt = new Date().toISOString();
          }
        }
      }

      data.updatedAt = new Date().toISOString();
      this.createBackup(data);
      this.writeAtomic(data);
      return data;
    });
  }
}

export const storage = new StorageService();
