import { state } from './state.js';
import { sound } from './audio.js';
import { DirectoryRenderer } from './renderer.js';

export class NavigationManager {
  private renderer: DirectoryRenderer;

  constructor(renderer: DirectoryRenderer) {
    this.renderer = renderer;
    this.setupListeners();
  }

  private setupListeners(): void {
    const inputEl = document.getElementById('terminal-input') as HTMLInputElement;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // 1. If inside an open modal or input dialog, ignore global navigation
      const modal = document.getElementById('tui-modal');
      if (modal && !modal.classList.contains('hidden')) {
        return;
      }
      if (document.querySelector('.tui-dialog-overlay')) {
        return;
      }

      // 2. If a mini-game is actively running, lock focus to the game
      if (state.activeGame) {
        return;
      }

      const isInputFocused = document.activeElement === inputEl;

      // Escape key clears selection or blurs input
      if (e.key === 'Escape') {
        if (isInputFocused || document.body.classList.contains('terminal-typing-mode')) {
          inputEl?.blur();
          document.body.classList.remove('terminal-typing-mode');
        }
        this.renderer.updateSelection(-1);
        return;
      }

      const totalEntries = state.flattenedEntries.length;

      // 3. Arrow Keys Navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (isInputFocused) {
          // If at end of input or empty, shift to list navigation
          if (inputEl.value === '') {
            inputEl.blur();
            document.body.classList.remove('terminal-typing-mode');
          } else {
            return; // Let terminal history handle it
          }
        }
        let next = state.selectedEntryIndex + 1;
        if (next > totalEntries || next < 1) next = 1;
        this.renderer.updateSelection(next);
        sound.playKeyClick();
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (isInputFocused) {
          if (inputEl.value === '') {
            inputEl.blur();
            document.body.classList.remove('terminal-typing-mode');
          } else {
            return; // Let terminal history handle it
          }
        }
        let prev = state.selectedEntryIndex - 1;
        if (prev < 1) prev = totalEntries;
        this.renderer.updateSelection(prev);
        sound.playKeyClick();
        return;
      }

      if (e.key === 'ArrowRight') {
        if (!isInputFocused && state.selectedEntryIndex > 0) {
          e.preventDefault();
          const item = state.flattenedEntries.find(i => i.globalIndex === state.selectedEntryIndex);
          if (item) {
            sound.playBeep(920, 0.08, 'sine');
            window.open(item.entry.url, item.entry.target || '_blank');
          }
          return;
        }
      }

      if (e.key === 'ArrowLeft') {
        if (!isInputFocused) {
          e.preventDefault();
          this.renderer.updateSelection(-1);
          if (inputEl) {
            document.body.classList.add('terminal-typing-mode');
            inputEl.focus();
          }
          sound.playKeyClick();
          return;
        }
      }

      // Enter on selected entry when input is not focused
      if (e.key === 'Enter' && !isInputFocused) {
        e.preventDefault();
        if (state.selectedEntryIndex > 0) {
          const item = state.flattenedEntries.find(i => i.globalIndex === state.selectedEntryIndex);
          if (item) {
            sound.playBeep(920, 0.08, 'sine');
            window.open(item.entry.url, item.entry.target || '_blank');
          }
        }
        return;
      }

      // 4. Any other alphanumeric / symbol keypress routes directly to terminal input
      if (!isInputFocused && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (e.key.length === 1 || e.key === 'Backspace') {
          if (inputEl) {
            this.renderer.updateSelection(-1);
            document.body.classList.add('terminal-typing-mode');
            inputEl.focus();
            // Let the event flow into the focused inputEl
          }
        }
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
