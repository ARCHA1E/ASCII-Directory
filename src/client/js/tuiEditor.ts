import { state, Category, DirectoryEntry } from './state.js';
import { sound } from './audio.js';

export class TuiEditor {
  private modalEl: HTMLElement | null = null;
  private windowBoxEl: HTMLElement | null = null;
  private activePanel: 'categories' | 'entries' = 'categories';
  private selectedCategoryIdx: number = 0;
  private selectedEntryIdx: number = 0;
  private onDataChangedCallback: (() => void) | null = null;

  constructor(onDataChanged: () => void) {
    this.modalEl = document.getElementById('tui-modal');
    this.windowBoxEl = document.getElementById('tui-window-box');
    this.onDataChangedCallback = onDataChanged;
    this.setupListeners();
  }

  public open(): void {
    if (!this.modalEl) return;
    this.modalEl.classList.remove('hidden');
    this.selectedCategoryIdx = 0;
    this.selectedEntryIdx = 0;
    this.activePanel = 'categories';
    this.render();
    sound.playSuccessChime();
  }

  public close(): void {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
    sound.playBeep(440, 0.08, 'sine');
  }

  public isOpen(): boolean {
    return !!(this.modalEl && !this.modalEl.classList.contains('hidden'));
  }

  private setupListeners(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!this.isOpen()) return;

      // If a dialog form input is open and focused, do not intercept navigation keys
      if (document.querySelector('.tui-dialog-overlay')) {
        if (e.key === 'Escape') {
          this.closeDialog();
        }
        return;
      }

      sound.playKeyClick();

      if (e.key === 'Escape' || e.key.toLowerCase() === 'q') {
        e.preventDefault();
        this.close();
        return;
      }

      const categories = state.data?.categories || [];
      const currentCategory = categories[this.selectedCategoryIdx];
      const entries = currentCategory?.entries || [];

      // Panel Switching
      if (e.key === 'Tab' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.activePanel = this.activePanel === 'categories' ? 'entries' : 'categories';
        this.render();
        return;
      }

      // Up / Down Navigation
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        if (e.shiftKey) {
          this.moveSelectedItem('down');
          return;
        }
        if (this.activePanel === 'categories') {
          if (this.selectedCategoryIdx < categories.length - 1) {
            this.selectedCategoryIdx++;
            this.selectedEntryIdx = 0;
          }
        } else {
          if (this.selectedEntryIdx < entries.length - 1) {
            this.selectedEntryIdx++;
          }
        }
        this.render();
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        if (e.shiftKey) {
          this.moveSelectedItem('up');
          return;
        }
        if (this.activePanel === 'categories') {
          if (this.selectedCategoryIdx > 0) {
            this.selectedCategoryIdx--;
            this.selectedEntryIdx = 0;
          }
        } else {
          if (this.selectedEntryIdx > 0) {
            this.selectedEntryIdx--;
          }
        }
        this.render();
        return;
      }

      // Reorganize shortcuts (U = move up, N = move down)
      if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        this.moveSelectedItem('up');
        return;
      }
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        this.moveSelectedItem('down');
        return;
      }

      // Numbering Toggles (1 = Cat Num, 2 = Ent Num)
      if (e.key === '1') {
        e.preventDefault();
        this.toggleCategoryNumbers();
        return;
      }
      if (e.key === '2') {
        e.preventDefault();
        this.toggleEntryNumbers();
        return;
      }

      // Actions: Add / Edit / Delete
      if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        this.promptAddEntry();
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (this.activePanel === 'categories') {
          this.promptEditCategory();
        } else {
          this.promptEditEntry();
        }
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        this.promptEditCategory();
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (this.activePanel === 'categories') {
          this.promptDeleteCategory();
        } else {
          this.promptDeleteEntry();
        }
      } else if (e.key === '+' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        this.promptAddCategory();
      } else if (e.key === '-' || e.key.toLowerCase() === 'x') {
        e.preventDefault();
        this.promptDeleteCategory();
      }
    });
  }

  public render(): void {
    if (!this.windowBoxEl || !state.data) return;

    const categories = state.data.categories.sort((a, b) => a.order - b.order);
    if (this.selectedCategoryIdx >= categories.length) {
      this.selectedCategoryIdx = Math.max(0, categories.length - 1);
    }
    const currentCategory = categories[this.selectedCategoryIdx];
    const entries = currentCategory ? currentCategory.entries.sort((a, b) => a.order - b.order) : [];
    if (this.selectedEntryIdx >= entries.length) {
      this.selectedEntryIdx = Math.max(0, entries.length - 1);
    }

    const showCatNum = state.data.showCategoryNumbers !== false;
    const showEntNum = state.data.showEntryNumbers !== false;

    const categoriesListHtml = categories.map((cat, idx) => {
      const isSelected = idx === this.selectedCategoryIdx;
      const activeCls = isSelected ? 'active' : '';
      const prefix = showCatNum ? `[${String(idx + 1).padStart(2, '0')}] ` : '';
      return `
        <div class="tui-list-item ${activeCls}" data-cat-idx="${idx}">
          <span>${prefix}${cat.name}</span>
          <span style="font-size: 11px; opacity: 0.7; margin-left: auto;">${cat.icon || '[DIR]'} (${cat.entries.length})</span>
        </div>
      `;
    }).join('');

    const entriesListHtml = entries.length === 0 
      ? `<div style="padding: 12px; color: var(--term-fg-dim);">&lt; No entries in this category &gt;</div>`
      : entries.map((ent, idx) => {
          const isSelected = idx === this.selectedEntryIdx;
          const activeCls = isSelected ? 'active' : '';
          const prefix = showEntNum ? `[${String(idx + 1).padStart(2, '0')}] ` : '';
          return `
            <div class="tui-list-item ${activeCls}" data-ent-idx="${idx}">
              <span>${prefix}<strong>${ent.title}</strong></span>
              <span style="font-size: 12px; color: var(--term-fg-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-left: auto;">${ent.url}</span>
            </div>
          `;
        }).join('');

    this.windowBoxEl.innerHTML = `
      <div class="tui-header">
        <span>╔══════════════════════ ASCII DIRECTORY TUI MANAGER ══════════════════════╗</span>
        <button id="tui-btn-close" class="btn-retro-sm">[Q CLOSE]</button>
      </div>

      <div class="tui-toolbar">
        <div class="tui-toggles">
          <button id="tui-btn-toggle-cat-num" class="btn-retro-sm">
            <span class="tui-key-badge">[1]</span> Cat Numbers: <span class="${showCatNum ? 'tui-badge-on' : 'tui-badge-off'}">[${showCatNum ? 'ON' : 'OFF'}]</span>
          </button>
          <button id="tui-btn-toggle-ent-num" class="btn-retro-sm">
            <span class="tui-key-badge">[2]</span> Entry Numbers: <span class="${showEntNum ? 'tui-badge-on' : 'tui-badge-off'}">[${showEntNum ? 'ON' : 'OFF'}]</span>
          </button>
        </div>
        <div class="tui-move-controls">
          <span style="color: var(--term-fg-dim); font-size: 11px; margin-right: 6px;">Reorder Selected:</span>
          <button id="tui-btn-move-up" class="btn-retro-sm"><span class="tui-key-badge">[U]</span> ▲ Move Up</button>
          <button id="tui-btn-move-down" class="btn-retro-sm"><span class="tui-key-badge">[N]</span> ▼ Move Down</button>
        </div>
      </div>

      <div class="tui-body">
        <div class="tui-panel">
          <div class="tui-panel-header">
            <span>CATEGORIES ${this.activePanel === 'categories' ? '◄ [ACTIVE]' : ''}</span>
          </div>
          <div class="tui-panel-list" id="tui-cat-list">
            ${categoriesListHtml}
          </div>
        </div>

        <div class="tui-panel">
          <div class="tui-panel-header">
            <span>ENTRIES (${currentCategory ? currentCategory.name : 'NONE'}) ${this.activePanel === 'entries' ? '◄ [ACTIVE]' : ''}</span>
          </div>
          <div class="tui-panel-list" id="tui-ent-list">
            ${entriesListHtml}
          </div>
        </div>
      </div>

      <div class="tui-footer">
        <div class="tui-keys">
          <button id="tui-btn-add-ent" class="btn-retro-sm"><span class="tui-key-badge">[A]</span> Add Entry</button>
          <button id="tui-btn-edit-ent" class="btn-retro-sm"><span class="tui-key-badge">[E]</span> Edit Entry</button>
          <button id="tui-btn-del-ent" class="btn-retro-sm"><span class="tui-key-badge">[D]</span> Del Entry</button>
          <button id="tui-btn-add-cat" class="btn-retro-sm"><span class="tui-key-badge">[+]</span> Add Cat</button>
          <button id="tui-btn-edit-cat" class="btn-retro-sm"><span class="tui-key-badge">[R]</span> Edit Cat</button>
          <button id="tui-btn-del-cat" class="btn-retro-sm"><span class="tui-key-badge">[-]</span> Del Cat</button>
        </div>
        <div>
          <span style="color: var(--term-fg-dim); font-size: 11px;">[Tab/Arrows] Switch • [U/N] Move • [1/2] Toggle # • [Q] Close</span>
        </div>
      </div>
    `;

    // Bind click events
    this.bindClickEvents();
  }

  private bindClickEvents(): void {
    const closeBtn = document.getElementById('tui-btn-close');
    if (closeBtn) closeBtn.onclick = () => this.close();

    const toggleCatNumBtn = document.getElementById('tui-btn-toggle-cat-num');
    if (toggleCatNumBtn) toggleCatNumBtn.onclick = () => this.toggleCategoryNumbers();

    const toggleEntNumBtn = document.getElementById('tui-btn-toggle-ent-num');
    if (toggleEntNumBtn) toggleEntNumBtn.onclick = () => this.toggleEntryNumbers();

    const moveUpBtn = document.getElementById('tui-btn-move-up');
    if (moveUpBtn) moveUpBtn.onclick = () => this.moveSelectedItem('up');

    const moveDownBtn = document.getElementById('tui-btn-move-down');
    if (moveDownBtn) moveDownBtn.onclick = () => this.moveSelectedItem('down');

    const addEntBtn = document.getElementById('tui-btn-add-ent');
    if (addEntBtn) addEntBtn.onclick = () => this.promptAddEntry();

    const editEntBtn = document.getElementById('tui-btn-edit-ent');
    if (editEntBtn) editEntBtn.onclick = () => this.promptEditEntry();

    const delEntBtn = document.getElementById('tui-btn-del-ent');
    if (delEntBtn) delEntBtn.onclick = () => this.promptDeleteEntry();

    const addCatBtn = document.getElementById('tui-btn-add-cat');
    if (addCatBtn) addCatBtn.onclick = () => this.promptAddCategory();

    const editCatBtn = document.getElementById('tui-btn-edit-cat');
    if (editCatBtn) editCatBtn.onclick = () => this.promptEditCategory();

    const delCatBtn = document.getElementById('tui-btn-del-cat');
    if (delCatBtn) delCatBtn.onclick = () => this.promptDeleteCategory();

    // Cat list items
    document.querySelectorAll('#tui-cat-list .tui-list-item').forEach(el => {
      el.addEventListener('click', () => {
        this.activePanel = 'categories';
        this.selectedCategoryIdx = parseInt((el as HTMLElement).dataset.catIdx || '0', 10);
        this.selectedEntryIdx = 0;
        this.render();
      });
    });

    // Ent list items
    document.querySelectorAll('#tui-ent-list .tui-list-item').forEach(el => {
      el.addEventListener('click', () => {
        this.activePanel = 'entries';
        this.selectedEntryIdx = parseInt((el as HTMLElement).dataset.entIdx || '0', 10);
        this.render();
      });
    });
  }

  private closeDialog(): void {
    const overlay = document.querySelector('.tui-dialog-overlay');
    if (overlay) overlay.remove();
  }

  public async toggleCategoryNumbers(): Promise<void> {
    const current = state.data?.showCategoryNumbers !== false;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showCategoryNumbers: !current })
      });
      if (res.ok) {
        const data = await res.json();
        state.setData(data.data);
        sound.playSuccessChime();
        this.render();
        if (this.onDataChangedCallback) this.onDataChangedCallback();
      }
    } catch (err) {
      sound.playErrorBuzz();
      console.error(err);
    }
  }

  public async toggleEntryNumbers(): Promise<void> {
    const current = state.data?.showEntryNumbers !== false;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showEntryNumbers: !current })
      });
      if (res.ok) {
        const data = await res.json();
        state.setData(data.data);
        sound.playSuccessChime();
        this.render();
        if (this.onDataChangedCallback) this.onDataChangedCallback();
      }
    } catch (err) {
      sound.playErrorBuzz();
      console.error(err);
    }
  }

  public async moveSelectedItem(direction: 'up' | 'down'): Promise<void> {
    const categories = state.data?.categories || [];
    if (categories.length === 0) return;

    if (this.activePanel === 'categories') {
      const cat = categories[this.selectedCategoryIdx];
      if (!cat) return;

      if (direction === 'up' && this.selectedCategoryIdx === 0) return;
      if (direction === 'down' && this.selectedCategoryIdx === categories.length - 1) return;

      try {
        const res = await fetch(`/api/categories/${cat.id}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ direction })
        });
        if (res.ok) {
          const data = await res.json();
          state.setData(data.data);
          if (direction === 'up' && this.selectedCategoryIdx > 0) this.selectedCategoryIdx--;
          if (direction === 'down' && this.selectedCategoryIdx < categories.length - 1) this.selectedCategoryIdx++;
          sound.playKeyClick();
          this.render();
          if (this.onDataChangedCallback) this.onDataChangedCallback();
        }
      } catch (err) {
        sound.playErrorBuzz();
        console.error(err);
      }
    } else {
      const currentCategory = categories[this.selectedCategoryIdx];
      const entries = currentCategory?.entries || [];
      const entry = entries[this.selectedEntryIdx];
      if (!entry) return;

      if (direction === 'up' && this.selectedEntryIdx === 0) return;
      if (direction === 'down' && this.selectedEntryIdx === entries.length - 1) return;

      try {
        const res = await fetch(`/api/entries/${entry.id}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ direction })
        });
        if (res.ok) {
          const data = await res.json();
          state.setData(data.data);
          if (direction === 'up' && this.selectedEntryIdx > 0) this.selectedEntryIdx--;
          if (direction === 'down' && this.selectedEntryIdx < entries.length - 1) this.selectedEntryIdx++;
          sound.playKeyClick();
          this.render();
          if (this.onDataChangedCallback) this.onDataChangedCallback();
        }
      } catch (err) {
        sound.playErrorBuzz();
        console.error(err);
      }
    }
  }

  private promptAddCategory(): void {
    this.showCategoryDialog('ADD NEW CATEGORY', { name: '', icon: '[DIR]' }, async (formData) => {
      try {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, icon: formData.icon })
        });
        if (res.ok) {
          const data = await res.json();
          state.setData(data.data);
          this.selectedCategoryIdx = state.data.categories.length - 1;
          sound.playSuccessChime();
          this.closeDialog();
          this.render();
          if (this.onDataChangedCallback) this.onDataChangedCallback();
        }
      } catch (err) {
        sound.playErrorBuzz();
        console.error(err);
      }
    });
  }

  private promptEditCategory(): void {
    const categories = state.data?.categories || [];
    const cat = categories[this.selectedCategoryIdx];
    if (!cat) return;

    this.showCategoryDialog('EDIT CATEGORY', { name: cat.name, icon: cat.icon || '[DIR]' }, async (formData) => {
      try {
        const res = await fetch(`/api/categories/${cat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, icon: formData.icon })
        });
        if (res.ok) {
          const data = await res.json();
          state.setData(data.data);
          sound.playSuccessChime();
          this.closeDialog();
          this.render();
          if (this.onDataChangedCallback) this.onDataChangedCallback();
        }
      } catch (err) {
        sound.playErrorBuzz();
        console.error(err);
      }
    });
  }

  private async promptDeleteCategory(): Promise<void> {
    const categories = state.data?.categories || [];
    const cat = categories[this.selectedCategoryIdx];
    if (!cat) return;

    if (confirm(`Delete category "${cat.name}" and all its ${cat.entries.length} entries?`)) {
      try {
        const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
        if (res.ok) {
          const data = await res.json();
          state.setData(data.data);
          this.selectedCategoryIdx = Math.max(0, this.selectedCategoryIdx - 1);
          sound.playBeep(300, 0.15, 'sawtooth');
          this.render();
          if (this.onDataChangedCallback) this.onDataChangedCallback();
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  private promptAddEntry(): void {
    const categories = state.data?.categories || [];
    const currentCategory = categories[this.selectedCategoryIdx];
    if (!currentCategory) return;

    this.showEntryDialog('ADD NEW DIRECTORY ENTRY', {
      title: '',
      url: 'https://',
      description: '',
      tags: '',
      categoryId: currentCategory.id
    }, async (formData) => {
      try {
        const res = await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryId: formData.categoryId,
            title: formData.title,
            url: formData.url,
            description: formData.description,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
          })
        });
        if (res.ok) {
          const data = await res.json();
          state.setData(data.data);
          sound.playSuccessChime();
          this.closeDialog();
          this.render();
          if (this.onDataChangedCallback) this.onDataChangedCallback();
        } else {
          sound.playErrorBuzz();
          alert('Failed to add entry. Check authentication.');
        }
      } catch (err) {
        sound.playErrorBuzz();
        console.error(err);
      }
    });
  }

  private promptEditEntry(): void {
    const categories = state.data?.categories || [];
    const currentCategory = categories[this.selectedCategoryIdx];
    const entry = currentCategory?.entries[this.selectedEntryIdx];
    if (!entry) return;

    this.showEntryDialog('EDIT DIRECTORY ENTRY', {
      title: entry.title,
      url: entry.url,
      description: entry.description,
      tags: (entry.tags || []).join(', '),
      categoryId: currentCategory.id
    }, async (formData) => {
      try {
        const res = await fetch(`/api/entries/${entry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryId: formData.categoryId,
            title: formData.title,
            url: formData.url,
            description: formData.description,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
          })
        });
        if (res.ok) {
          const data = await res.json();
          state.setData(data.data);
          
          // If moved to a different category, switch active category to the new target
          const newCatIdx = state.data?.categories.findIndex(c => c.id === formData.categoryId);
          if (newCatIdx !== undefined && newCatIdx !== -1) {
            this.selectedCategoryIdx = newCatIdx;
            const targetCat = state.data?.categories[newCatIdx];
            const newEntIdx = targetCat?.entries.findIndex(e => e.id === entry.id);
            this.selectedEntryIdx = newEntIdx !== undefined && newEntIdx !== -1 ? newEntIdx : 0;
          }

          sound.playSuccessChime();
          this.closeDialog();
          this.render();
          if (this.onDataChangedCallback) this.onDataChangedCallback();
        } else {
          sound.playErrorBuzz();
          alert('Failed to update entry.');
        }
      } catch (err) {
        sound.playErrorBuzz();
        console.error(err);
      }
    });
  }

  private async promptDeleteEntry(): Promise<void> {
    const categories = state.data?.categories || [];
    const currentCategory = categories[this.selectedCategoryIdx];
    const entry = currentCategory?.entries[this.selectedEntryIdx];
    if (!entry) return;

    if (confirm(`Delete entry "${entry.title}"?`)) {
      try {
        const res = await fetch(`/api/entries/${entry.id}`, { method: 'DELETE' });
        if (res.ok) {
          const data = await res.json();
          state.setData(data.data);
          if (this.selectedEntryIdx >= (currentCategory.entries.length - 1)) {
            this.selectedEntryIdx = Math.max(0, currentCategory.entries.length - 2);
          }
          sound.playBeep(320, 0.1, 'sawtooth');
          this.render();
          if (this.onDataChangedCallback) this.onDataChangedCallback();
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  private showCategoryDialog(
    title: string,
    initial: { name: string; icon: string },
    onSubmit: (data: typeof initial) => void
  ): void {
    this.closeDialog();

    const overlay = document.createElement('div');
    overlay.className = 'tui-dialog-overlay';

    overlay.innerHTML = `
      <div class="tui-dialog-box">
        <div class="tui-dialog-title">+--[ ${title} ]--+</div>
        <form id="tui-cat-form">
          <div class="tui-form-group">
            <label>Category Name:</label>
            <input type="text" id="form-cat-name" value="${escapeHtml(initial.name)}" required placeholder="e.g. HOMELAB & INFRASTRUCTURE" />
          </div>
          <div class="tui-form-group">
            <label>Tag / Icon (e.g. [SYS], [MEDIA], [DEV], [DIR]):</label>
            <input type="text" id="form-cat-icon" value="${escapeHtml(initial.icon)}" placeholder="[DIR]" />
          </div>
          <div class="tui-dialog-actions">
            <button type="button" id="form-cat-cancel" class="btn-retro">[CANCEL]</button>
            <button type="submit" class="btn-retro">[SAVE CATEGORY]</button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('tui-modal')?.appendChild(overlay);

    const form = overlay.querySelector('#tui-cat-form') as HTMLFormElement;
    const cancelBtn = overlay.querySelector('#form-cat-cancel') as HTMLButtonElement;
    const nameInput = overlay.querySelector('#form-cat-name') as HTMLInputElement;

    setTimeout(() => nameInput?.focus(), 50);

    cancelBtn.onclick = () => this.closeDialog();

    form.onsubmit = (e) => {
      e.preventDefault();
      const iconInput = overlay.querySelector('#form-cat-icon') as HTMLInputElement;
      onSubmit({
        name: nameInput.value.trim().toUpperCase(),
        icon: iconInput.value.trim() || '[DIR]'
      });
    };
  }

  private showEntryDialog(
    title: string, 
    initial: { title: string; url: string; description: string; tags: string; categoryId: string },
    onSubmit: (data: typeof initial) => void
  ): void {
    this.closeDialog();

    const overlay = document.createElement('div');
    overlay.className = 'tui-dialog-overlay';

    const catOptions = (state.data?.categories || [])
      .map(c => `<option value="${c.id}" ${c.id === initial.categoryId ? 'selected' : ''}>${c.name}</option>`)
      .join('');

    overlay.innerHTML = `
      <div class="tui-dialog-box">
        <div class="tui-dialog-title">+--[ ${title} ]--+</div>
        <form id="tui-entry-form">
          <div class="tui-form-group">
            <label>Target Category:</label>
            <select id="form-cat-id">${catOptions}</select>
          </div>
          <div class="tui-form-group">
            <label>Title / Label:</label>
            <input type="text" id="form-title" value="${escapeHtml(initial.title)}" required placeholder="e.g. Proxmox VE" />
          </div>
          <div class="tui-form-group">
            <label>Target URL:</label>
            <input type="url" id="form-url" value="${escapeHtml(initial.url)}" required placeholder="https://..." />
          </div>
          <div class="tui-form-group">
            <label>Description:</label>
            <input type="text" id="form-desc" value="${escapeHtml(initial.description)}" placeholder="Brief note / subtitle" />
          </div>
          <div class="tui-form-group">
            <label>Tags (comma separated):</label>
            <input type="text" id="form-tags" value="${escapeHtml(initial.tags)}" placeholder="homelab, infra, pve" />
          </div>
          <div class="tui-dialog-actions">
            <button type="button" id="form-btn-cancel" class="btn-retro">[CANCEL]</button>
            <button type="submit" class="btn-retro">[SUBMIT & SAVE]</button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('tui-modal')?.appendChild(overlay);

    const form = overlay.querySelector('#tui-entry-form') as HTMLFormElement;
    const cancelBtn = overlay.querySelector('#form-btn-cancel') as HTMLButtonElement;
    const titleInput = overlay.querySelector('#form-title') as HTMLInputElement;

    setTimeout(() => titleInput?.focus(), 50);

    cancelBtn.onclick = () => this.closeDialog();

    form.onsubmit = (e) => {
      e.preventDefault();
      const catSelect = overlay.querySelector('#form-cat-id') as HTMLSelectElement;
      const urlInput = overlay.querySelector('#form-url') as HTMLInputElement;
      const descInput = overlay.querySelector('#form-desc') as HTMLInputElement;
      const tagsInput = overlay.querySelector('#form-tags') as HTMLInputElement;

      onSubmit({
        categoryId: catSelect.value,
        title: titleInput.value.trim(),
        url: urlInput.value.trim(),
        description: descInput.value.trim(),
        tags: tagsInput.value.trim()
      });
    };
  }
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
