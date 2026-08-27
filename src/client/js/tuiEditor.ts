import { state, Category, DirectoryEntry } from './state.js';
import { sound } from './audio.js';

export interface TagInfo {
  tag: string;
  count: number;
}

export class TuiEditor {
  private modalEl: HTMLElement | null = null;
  private windowBoxEl: HTMLElement | null = null;
  private activePanel: 'categories' | 'entries' = 'categories';
  private selectedCategoryIdx: number = 0;
  private selectedEntryIdx: number = 0;
  private onDataChangedCallback: (() => void) | null = null;
  private tagSortMode: 'alpha' | 'count' = 'alpha';

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

      const categories = [...(state.data?.categories || [])].sort((a, b) => a.order - b.order);
      const currentCategory = categories[this.selectedCategoryIdx];
      const entries = currentCategory ? [...currentCategory.entries].sort((a, b) => a.order - b.order) : [];

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

      // Tag Management Shortcut (T = Tags)
      if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        this.promptManageTags();
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

    const categories = [...state.data.categories].sort((a, b) => a.order - b.order);
    if (this.selectedCategoryIdx >= categories.length) {
      this.selectedCategoryIdx = Math.max(0, categories.length - 1);
    }
    const currentCategory = categories[this.selectedCategoryIdx];
    const entries = currentCategory ? [...currentCategory.entries].sort((a, b) => a.order - b.order) : [];
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
          <span>${prefix}${escapeHtml(cat.name)}</span>
          <span style="font-size: 11px; opacity: 0.7; margin-left: auto;">${escapeHtml(cat.icon || '[DIR]')} (${cat.entries.length})</span>
        </div>
      `;
    }).join('');

    const entriesListHtml = entries.length === 0 
      ? `<div style="padding: 12px; color: var(--term-fg-dim);">&lt; No entries in this category &gt;</div>`
      : entries.map((ent, idx) => {
          const isSelected = idx === this.selectedEntryIdx;
          const activeCls = isSelected ? 'active' : '';
          const prefix = showEntNum ? `[${String(idx + 1).padStart(2, '0')}] ` : '';
          const tagsStr = (ent.tags || []).length ? ` (${(ent.tags || []).map(t => '#' + t).join(' ')})` : '';
          return `
            <div class="tui-list-item ${activeCls}" data-ent-idx="${idx}">
              <span>${prefix}<strong>${escapeHtml(ent.title)}</strong><span style="font-size: 11px; opacity: 0.6; margin-left: 4px;">${escapeHtml(tagsStr)}</span></span>
              <span style="font-size: 12px; color: var(--term-fg-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-left: auto;">${escapeHtml(ent.url)}</span>
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
          <button id="tui-btn-manage-tags" class="btn-retro-sm">
            <span class="tui-key-badge">[T]</span> Tag Library
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
            <span>ENTRIES (${currentCategory ? escapeHtml(currentCategory.name) : 'NONE'}) ${this.activePanel === 'entries' ? '◄ [ACTIVE]' : ''}</span>
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
          <span style="color: var(--term-fg-dim); font-size: 11px;">[Tab/Arrows] Switch • [U/N] Move • [T] Tags • [1/2] Toggle # • [Q] Close</span>
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

    const manageTagsBtn = document.getElementById('tui-btn-manage-tags');
    if (manageTagsBtn) manageTagsBtn.onclick = () => this.promptManageTags();

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
    const categories = [...(state.data?.categories || [])].sort((a, b) => a.order - b.order);
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
      const entries = currentCategory ? [...currentCategory.entries].sort((a, b) => a.order - b.order) : [];
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

  // ── Tag Management Modal View ──────────────────────────────────────────────
  public async promptManageTags(): Promise<void> {
    this.closeDialog();

    let tagsList: TagInfo[] = [];
    try {
      const res = await fetch('/api/tags');
      const data = await res.json();
      tagsList = data.tags || [];
    } catch {
      tagsList = [];
    }

    const overlay = document.createElement('div');
    overlay.className = 'tui-dialog-overlay';

    const renderTagModal = () => {
      const sortedTags = [...tagsList].sort((a, b) => {
        if (this.tagSortMode === 'count') {
          return b.count - a.count || a.tag.localeCompare(b.tag);
        }
        return a.tag.localeCompare(b.tag);
      });

      const rowsHtml = sortedTags.length === 0
        ? `<tr><td colspan="4" style="color: var(--term-fg-dim); text-align: center; padding: 16px;">&lt; No tags in library &gt;</td></tr>`
        : sortedTags.map((t, idx) => `
            <tr>
              <td style="font-weight: bold; color: var(--term-fg-bright);">#${escapeHtml(t.tag)}</td>
              <td style="color: var(--term-fg-dim);">${t.count} entries</td>
              <td style="text-align: right;">
                <button type="button" class="btn-retro-sm btn-rename-tag" data-tag="${escapeHtml(t.tag)}">[R RENAME]</button>
                <button type="button" class="btn-retro-sm btn-delete-tag" data-tag="${escapeHtml(t.tag)}">[D DELETE]</button>
              </td>
            </tr>
          `).join('');

      overlay.innerHTML = `
        <div class="tui-dialog-box" style="max-width: 680px;">
          <div class="tui-dialog-title">+--[ GLOBAL TAG MANAGEMENT LIBRARY ]--+</div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
            <div style="display: flex; gap: 6px; align-items: center;">
              <input type="text" id="tui-new-tag-input" placeholder="New tag name (e.g. storage)..." style="width: 200px; padding: 4px 8px; font-size: 12px;" />
              <button type="button" id="tui-btn-create-tag" class="btn-retro-sm">[+] Add Tag</button>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <button type="button" id="tui-btn-sort-tags" class="btn-retro-sm">
                Sort: [${this.tagSortMode === 'alpha' ? 'Name A-Z' : 'Usage Count'}]
              </button>
            </div>
          </div>

          <div style="max-height: 320px; overflow-y: auto; border: 1px solid var(--term-border); background: rgba(0,0,0,0.3);">
            <table class="tui-tag-manager-table">
              <thead>
                <tr>
                  <th>Tag Name</th>
                  <th>Usage Count</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>

          <div class="tui-dialog-actions" style="margin-top: 14px;">
            <button type="button" id="tui-tag-modal-close" class="btn-retro">[CLOSE & RETURN]</button>
          </div>
        </div>
      `;

      // Bind events
      const closeBtn = overlay.querySelector('#tui-tag-modal-close') as HTMLButtonElement;
      if (closeBtn) closeBtn.onclick = () => this.closeDialog();

      const sortBtn = overlay.querySelector('#tui-btn-sort-tags') as HTMLButtonElement;
      if (sortBtn) {
        sortBtn.onclick = () => {
          this.tagSortMode = this.tagSortMode === 'alpha' ? 'count' : 'alpha';
          renderTagModal();
        };
      }

      const createBtn = overlay.querySelector('#tui-btn-create-tag') as HTMLButtonElement;
      const newTagInput = overlay.querySelector('#tui-new-tag-input') as HTMLInputElement;

      const handleAddTag = async () => {
        const val = newTagInput?.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (!val) return;
        try {
          const res = await fetch('/api/tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tag: val })
          });
          if (res.ok) {
            const data = await res.json();
            tagsList = data.tags || [];
            if (data.data) state.setData(data.data);
            sound.playSuccessChime();
            renderTagModal();
          }
        } catch (err) {
          console.error(err);
        }
      };

      if (createBtn) createBtn.onclick = handleAddTag;
      if (newTagInput) {
        newTagInput.onkeydown = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
          }
        };
      }

      // Rename handlers
      overlay.querySelectorAll('.btn-rename-tag').forEach(btn => {
        btn.addEventListener('click', async () => {
          const oldTag = (btn as HTMLElement).dataset.tag;
          if (!oldTag) return;
          const newTag = prompt(`Enter new name for #${oldTag}:`, oldTag);
          if (!newTag || newTag.trim() === oldTag) return;
          try {
            const res = await fetch(`/api/tags/${encodeURIComponent(oldTag)}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ newTag: newTag.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') })
            });
            if (res.ok) {
              const data = await res.json();
              tagsList = data.tags || [];
              if (data.data) state.setData(data.data);
              sound.playSuccessChime();
              renderTagModal();
              this.render();
              if (this.onDataChangedCallback) this.onDataChangedCallback();
            }
          } catch (err) {
            console.error(err);
          }
        });
      });

      // Delete handlers
      overlay.querySelectorAll('.btn-delete-tag').forEach(btn => {
        btn.addEventListener('click', async () => {
          const tag = (btn as HTMLElement).dataset.tag;
          if (!tag) return;
          if (confirm(`Remove tag #${tag} from all directory entries?`)) {
            try {
              const res = await fetch(`/api/tags/${encodeURIComponent(tag)}`, { method: 'DELETE' });
              if (res.ok) {
                const data = await res.json();
                tagsList = data.tags || [];
                if (data.data) state.setData(data.data);
                sound.playBeep(320, 0.1, 'sawtooth');
                renderTagModal();
                this.render();
                if (this.onDataChangedCallback) this.onDataChangedCallback();
              }
            } catch (err) {
              console.error(err);
            }
          }
        });
      });
    };

    renderTagModal();
    document.getElementById('tui-modal')?.appendChild(overlay);
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
    const categories = [...(state.data?.categories || [])].sort((a, b) => a.order - b.order);
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
    const categories = [...(state.data?.categories || [])].sort((a, b) => a.order - b.order);
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

  private async promptAddEntry(): Promise<void> {
    const categories = [...(state.data?.categories || [])].sort((a, b) => a.order - b.order);
    const currentCategory = categories[this.selectedCategoryIdx];
    if (!currentCategory) return;

    this.showEntryDialog('ADD NEW DIRECTORY ENTRY', {
      title: '',
      url: 'https://',
      description: '',
      tags: [],
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
            tags: formData.tags
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
          alert('Failed to add entry.');
        }
      } catch (err) {
        sound.playErrorBuzz();
        console.error(err);
      }
    });
  }

  private async promptEditEntry(): Promise<void> {
    const categories = [...(state.data?.categories || [])].sort((a, b) => a.order - b.order);
    const currentCategory = categories[this.selectedCategoryIdx];
    const entries = currentCategory ? [...currentCategory.entries].sort((a, b) => a.order - b.order) : [];
    const entry = entries[this.selectedEntryIdx];
    if (!entry) return;

    this.showEntryDialog('EDIT DIRECTORY ENTRY', {
      title: entry.title,
      url: entry.url,
      description: entry.description,
      tags: entry.tags || [],
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
            tags: formData.tags
          })
        });
        if (res.ok) {
          const data = await res.json();
          state.setData(data.data);
          
          // Re-sort to find new index of destination category and entry
          const updatedCategories = [...(state.data?.categories || [])].sort((a, b) => a.order - b.order);
          const newCatIdx = updatedCategories.findIndex(c => c.id === formData.categoryId);
          if (newCatIdx !== -1) {
            this.selectedCategoryIdx = newCatIdx;
            const targetCat = updatedCategories[newCatIdx];
            const targetEntries = [...(targetCat.entries || [])].sort((a, b) => a.order - b.order);
            const newEntIdx = targetEntries.findIndex(e => e.id === entry.id);
            this.selectedEntryIdx = newEntIdx !== -1 ? newEntIdx : 0;
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
    const categories = [...(state.data?.categories || [])].sort((a, b) => a.order - b.order);
    const currentCategory = categories[this.selectedCategoryIdx];
    const entries = currentCategory ? [...currentCategory.entries].sort((a, b) => a.order - b.order) : [];
    const entry = entries[this.selectedEntryIdx];
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

  private async showEntryDialog(
    title: string, 
    initial: { title: string; url: string; description: string; tags: string[]; categoryId: string },
    onSubmit: (data: { title: string; url: string; description: string; tags: string[]; categoryId: string }) => void
  ): Promise<void> {
    this.closeDialog();

    // Fetch available tags from library
    let availableTags: TagInfo[] = [];
    try {
      const res = await fetch('/api/tags');
      const data = await res.json();
      availableTags = data.tags || [];
    } catch {
      availableTags = [];
    }

    let selectedTags: string[] = [...(initial.tags || [])];

    const overlay = document.createElement('div');
    overlay.className = 'tui-dialog-overlay';

    const categories = [...(state.data?.categories || [])].sort((a, b) => a.order - b.order);
    const catOptions = categories
      .map(c => `<option value="${c.id}" ${c.id === initial.categoryId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`)
      .join('');

    const renderChips = () => {
      const wrapper = overlay.querySelector('#tui-chips-list');
      if (!wrapper) return;

      const allTagNames = Array.from(new Set([...availableTags.map(t => t.tag), ...selectedTags])).sort();

      wrapper.innerHTML = allTagNames.map(tag => {
        const selIdx = selectedTags.indexOf(tag);
        const isSelected = selIdx !== -1;
        const badge = isSelected ? `<span class="tui-tag-chip-order">${selIdx + 1}</span>` : '';
        return `
          <button type="button" class="tui-tag-chip ${isSelected ? 'selected' : ''}" data-tag="${escapeHtml(tag)}">
            #${escapeHtml(tag)} ${badge}
          </button>
        `;
      }).join('');

      // Chip click events
      wrapper.querySelectorAll('.tui-tag-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const t = (btn as HTMLElement).dataset.tag;
          if (!t) return;
          const idx = selectedTags.indexOf(t);
          if (idx !== -1) {
            selectedTags.splice(idx, 1);
          } else {
            selectedTags.push(t);
          }
          sound.playKeyClick();
          renderChips();
        });
      });
    };

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
            <label>Tags (Select from library or add new):</label>
            <div class="tui-tag-picker-container">
              <div class="tui-tag-chips-wrapper" id="tui-chips-list"></div>
              <div class="tui-tag-quick-add">
                <input type="text" id="form-quick-tag-input" placeholder="+ Add custom tag..." />
                <button type="button" id="form-btn-add-quick-tag" class="btn-retro-sm">[ADD TAG]</button>
              </div>
            </div>
          </div>

          <div class="tui-dialog-actions">
            <button type="button" id="form-btn-cancel" class="btn-retro">[CANCEL]</button>
            <button type="submit" class="btn-retro">[SUBMIT & SAVE]</button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('tui-modal')?.appendChild(overlay);

    renderChips();

    const form = overlay.querySelector('#tui-entry-form') as HTMLFormElement;
    const cancelBtn = overlay.querySelector('#form-btn-cancel') as HTMLButtonElement;
    const titleInput = overlay.querySelector('#form-title') as HTMLInputElement;
    const quickTagInput = overlay.querySelector('#form-quick-tag-input') as HTMLInputElement;
    const quickTagBtn = overlay.querySelector('#form-btn-add-quick-tag') as HTMLButtonElement;

    setTimeout(() => titleInput?.focus(), 50);

    const handleQuickAdd = async () => {
      const val = quickTagInput?.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (!val) return;
      if (!selectedTags.includes(val)) {
        selectedTags.push(val);
      }
      quickTagInput.value = '';
      try {
        const res = await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag: val })
        });
        if (res.ok) {
          const data = await res.json();
          availableTags = data.tags || [];
        }
      } catch (err) {
        console.error(err);
      }
      renderChips();
    };

    if (quickTagBtn) quickTagBtn.onclick = handleQuickAdd;
    if (quickTagInput) {
      quickTagInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleQuickAdd();
        }
      };
    }

    cancelBtn.onclick = () => this.closeDialog();

    form.onsubmit = (e) => {
      e.preventDefault();
      const catSelect = overlay.querySelector('#form-cat-id') as HTMLSelectElement;
      const urlInput = overlay.querySelector('#form-url') as HTMLInputElement;
      const descInput = overlay.querySelector('#form-desc') as HTMLInputElement;

      onSubmit({
        categoryId: catSelect.value,
        title: titleInput.value.trim(),
        url: urlInput.value.trim(),
        description: descInput.value.trim(),
        tags: selectedTags
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
