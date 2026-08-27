import { state } from './state.js';
import { sound } from './audio.js';
import { DirectoryRenderer } from './renderer.js';

export class NavigationManager {
  private renderer: DirectoryRenderer;
  private numberBuffer: string = '';
  private numberTimer: any = null;

  constructor(renderer: DirectoryRenderer) {
    this.renderer = renderer;
    this.setupListeners();
  }

  private setupListeners(): void {
    const inputEl = document.getElementById('terminal-input') as HTMLInputElement;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      sound.playKeyClick();

      // If active element is inside an open modal or input dialog, let it handle its own keys
      const modal = document.getElementById('tui-modal');
      if (modal && !modal.classList.contains('hidden')) {
        return;
      }

      const isInputFocused = document.activeElement === inputEl;

      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        document.body.classList.add('terminal-typing-mode');
        inputEl.focus();
        return;
      }

      if (e.key === 'Escape') {
        if (isInputFocused || document.body.classList.contains('terminal-typing-mode')) {
          inputEl.blur();
          document.body.classList.remove('terminal-typing-mode');
          return;
        }
      }

      if (isInputFocused) {
        return; // Terminal input handles its own commands
      }

      // Keyboard navigation for main directory list
      const totalEntries = state.flattenedEntries.length;
      if (totalEntries === 0) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        document.body.classList.remove('terminal-typing-mode');
        let next = state.selectedEntryIndex + 1;
        if (next > totalEntries) next = 1;
        this.renderer.updateSelection(next);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        document.body.classList.remove('terminal-typing-mode');
        let prev = state.selectedEntryIndex - 1;
        if (prev < 1) prev = totalEntries;
        this.renderer.updateSelection(prev);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (state.selectedEntryIndex > 0) {
          const item = state.flattenedEntries.find(i => i.globalIndex === state.selectedEntryIndex);
          if (item) {
            sound.playBeep(920, 0.08, 'sine');
            window.open(item.entry.url, item.entry.target || '_blank');
          }
        }
      } else if (/^[0-9]$/.test(e.key)) {
        // Quick numeric jump
        this.numberBuffer += e.key;
        clearTimeout(this.numberTimer);
        this.numberTimer = setTimeout(() => {
          const targetIdx = parseInt(this.numberBuffer, 10);
          this.numberBuffer = '';
          if (targetIdx >= 1 && targetIdx <= totalEntries) {
            this.renderer.updateSelection(targetIdx);
          }
        }, 350);
      }
    });

    // Clicking an entry selects it
    document.addEventListener('click', (e) => {
      const termSection = (e.target as HTMLElement).closest('#terminal-section');
      if (!termSection) {
        document.body.classList.remove('terminal-typing-mode');
      }

      const target = (e.target as HTMLElement).closest('.directory-entry') as HTMLElement;
      if (target && target.dataset.index) {
        const idx = parseInt(target.dataset.index, 10);
        this.renderer.updateSelection(idx);
      }
    });
  }
}
