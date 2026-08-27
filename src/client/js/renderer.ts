import { state } from './state.js';

export class DirectoryRenderer {
  private bannerEl: HTMLElement | null = null;
  private listEl: HTMLElement | null = null;
  private motdEl: HTMLElement | null = null;
  private hostEl: HTMLElement | null = null;

  constructor() {
    this.bannerEl = document.getElementById('ascii-banner');
    this.listEl = document.getElementById('directory-list');
    this.motdEl = document.getElementById('system-motd');
    this.hostEl = document.getElementById('status-host');
  }

  public getAsciiBanner(title: string, subtitle: string): string {
    const rawAscii = [
      "   ,---,          .--.--.      ,----..      ,---,    ,---,             ,---,                                                   ___                                      ",
      "  '  .' \\        /  /    '.   /   /   \\  ,`--.' | ,`--.' |           .'  .' `\\     ,--,                                      ,--.'|_                                    ",
      " /  ;    '.     |  :  /`. /  |   :     : |   :  : |   :  :         ,---.'     \\  ,--.'|      __  ,-.                         |  | :,'     ,---.     __  ,-.             ",
      ":  :       \\    ;  |  |--`   .   |  ;. / :   |  ' :   |  '         |   |  .`\\  | |  |,     ,' ,'/ /|                         :  : ' :    '   ,'\\  ,' ,'/ /|             ",
      ":  |   /\\   \\   |  :  ;_     .   ; /--`  |   :  | |   :  |         :   : |  '  | `--'_     '  | |' |    ,---.      ,---.   .;__,'  /    /   /   | '  | |' |       .--,  ",
      "|  :  ' ;.   :   \\  \\    `.  ;   | ;     '   '  ; '   '  ;         |   ' '  ;  : ,' ,'|    |  |   ,'   /     \\    /     \\  |  |   |    .   ; ,. : |  |   ,'     /_ ./|  ",
      "|  |  ;/  \\   \\   `----.   \\ |   : |     |   |  | |   |  |         '   | ;  .  | '  | |    '  :  /    /    /  |  /    / '  :__,'| :    '   | |: : '  :  /    , ' , ' :  ",
      "'  :  | \\  \\ ,'   __ \\  \\  | .   | '___  '   :  ; '   :  ;         |   | :  |  ' |  | :    |  | '    .    ' / | .    ' /     '  : |__  '   | .; : |  | '    /___/ \\: |  ",
      "|  |  '  '--'    /  /`--'  / '   ; : .'| |   |  ' |   |  '         '   : | /  ;  '  : |__  ;  : |    '   ;   /| '   ; :__    |  | '.'| |   :    | ;  : |     .  \\  ' |  ",
      "|  :  :         '--'.     /  '   | '/  : '   :  | '   :  |         |   | '` ,/   |  | '.'| |  , ;    '   |  / | '   | '.'|   ;  :    ;  \\   \\  /  |  , ;      \\  ;   :  ",
      "|  | ,'           `--'---'   |   :    /  ;   |.'  ;   |.'          ;   :  .'     ;  :    ;  ---'     |   :    | |   :    :   |  ,   /    `----'    ---'        \\  \\  ;  ",
      "`--''                         \\   \\ .'   '---'    '---'            |   ,.'       |  ,   /             \\   \\  /   \\   \\  /     ---`-'                            :  \\  \\ ",
      "                               `---`                               '---'          ---`-'               `----'     `----'                                         \\  ' ; ",
      "                                                                                                                                                                  `--`  "
    ].join('\n');

    const sep = '='.repeat(148);
    return `${rawAscii}\n${sep}\n ${title}  •  [${subtitle}]\n${sep}`;
  }

  public render(): void {
    if (!state.data) return;

    if (this.bannerEl) {
      this.bannerEl.textContent = this.getAsciiBanner(state.data.title, state.data.subtitle);
    }

    if (this.hostEl) {
      this.hostEl.textContent = state.data.systemName || 'RETRO-GW-01';
    }

    if (this.motdEl) {
      const displayMotd = state.authenticated 
        ? `[ADMIN MODE ACTIVE] Type 'tui' to open editor or run directory commands.`
        : (state.data.motd || 'SYSTEM READY.');
      this.motdEl.textContent = displayMotd;
    }

    if (!this.listEl) return;
    this.listEl.innerHTML = '';

    const showCatNumbers = state.data.showCategoryNumbers !== false;
    const showEntryNumbers = state.data.showEntryNumbers !== false;

    const categories = state.data.categories.sort((a, b) => a.order - b.order);

    let globalCounter = 1;

    categories.forEach((cat, catIdx) => {
      const catBlock = document.createElement('div');
      catBlock.className = 'category-block';

      const frame = document.createElement('div');
      frame.className = 'ascii-frame';

      const header = document.createElement('div');
      header.className = 'category-header';
      const catNum = String(catIdx + 1).padStart(2, '0');
      const catTitle = showCatNumbers ? `${catNum}: ${cat.name}` : cat.name;

      header.innerHTML = `
        <span>+--[ ${catTitle} ]</span>
        <span>${cat.icon || '[DIR]'} (${cat.entries.length} items)</span>
      `;
      frame.appendChild(header);

      const entriesContainer = document.createElement('div');
      entriesContainer.className = 'category-entries';

      if (cat.entries.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-entries-msg';
        emptyMsg.textContent = '|  < No entries in this directory section >';
        entriesContainer.appendChild(emptyMsg);
      } else {
        cat.entries
          .sort((a, b) => a.order - b.order)
          .forEach((entry) => {
            const entryIndex = globalCounter++;
            const entryEl = document.createElement('a');
            entryEl.className = `directory-entry ${showEntryNumbers ? '' : 'no-idx'}`;
            entryEl.href = entry.url;
            entryEl.target = entry.target || '_blank';
            entryEl.rel = 'noopener noreferrer';
            entryEl.dataset.index = String(entryIndex);
            entryEl.dataset.entryId = entry.id;

            if (state.selectedEntryIndex === entryIndex) {
              entryEl.classList.add('selected');
            }

            const formattedIdx = String(entryIndex).padStart(2, '0');
            const idxHtml = showEntryNumbers ? `<span class="entry-idx">[${formattedIdx}]</span>` : '';
            const tagsHtml = (entry.tags || [])
              .map(t => `<span class="tag-badge">#${t}</span>`)
              .join('');

            entryEl.innerHTML = `
              ${idxHtml}
              <span class="entry-title">${escapeHtml(entry.title)}</span>
              <span class="entry-url">${escapeHtml(entry.url)}</span>
              <span class="entry-desc">${escapeHtml(entry.description || '')}</span>
              <div class="entry-tags">${tagsHtml}</div>
            `;

            entriesContainer.appendChild(entryEl);
          });
      }

      frame.appendChild(entriesContainer);
      catBlock.appendChild(frame);
      this.listEl.appendChild(catBlock);
    });
  }

  public updateSelection(index: number): void {
    state.selectedEntryIndex = index;
    const all = document.querySelectorAll('.directory-entry');
    all.forEach(el => {
      const idx = parseInt((el as HTMLElement).dataset.index || '-1', 10);
      if (idx === index) {
        el.classList.add('selected');
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        el.classList.remove('selected');
      }
    });
  }
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
