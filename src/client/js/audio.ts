export type MusicTrack = 
  | 'off' 
  | 'minecraft' 
  | 'sweden' 
  | 'subwoofer' 
  | 'wethands' 
  | 'miceonvenus'
  | 'cat' 
  | 'wellerman' 
  | 'sneakysnitch' 
  | 'odetojoy' 
  | 'cyberspace' 
  | 'neon' 
  | 'ambient' 
  | 'generative';

export interface TrackMetadata {
  id: MusicTrack;
  title: string;
  composer: string;
  source: string;
  license: string;
  attribution: string;
}

export const TRACK_REGISTRY: Record<MusicTrack, TrackMetadata> = {
  off: {
    id: 'off',
    title: 'Muted / Off',
    composer: 'None',
    source: 'System',
    license: 'N/A',
    attribution: 'Sound Synthesizer Muted'
  },
  minecraft: {
    id: 'minecraft',
    title: 'Minecraft Suite (Full Playlist)',
    composer: 'C418 (Daniel Rosenfeld)',
    source: 'Minecraft: Volume Alpha / Beta',
    license: 'Non-Commercial Fan Use with Attribution',
    attribution: 'Music composed by C418 (Daniel Rosenfeld - c418.org). Synthesized programmatically in-browser.'
  },
  sweden: {
    id: 'sweden',
    title: 'Sweden (Calm 3)',
    composer: 'C418 (Daniel Rosenfeld)',
    source: 'Minecraft: Volume Alpha',
    license: 'Non-Commercial Fan Use with Attribution',
    attribution: 'Music composed by C418 (c418.org). Synthesized programmatically in-browser.'
  },
  subwoofer: {
    id: 'subwoofer',
    title: 'Subwoofer Lullaby (Hal 1)',
    composer: 'C418 (Daniel Rosenfeld)',
    source: 'Minecraft: Volume Alpha',
    license: 'Non-Commercial Fan Use with Attribution',
    attribution: 'Music composed by C418 (c418.org). Synthesized programmatically in-browser.'
  },
  wethands: {
    id: 'wethands',
    title: 'Wet Hands (Piano 1)',
    composer: 'C418 (Daniel Rosenfeld)',
    source: 'Minecraft: Volume Alpha',
    license: 'Non-Commercial Fan Use with Attribution',
    attribution: 'Music composed by C418 (c418.org). Synthesized programmatically in-browser.'
  },
  miceonvenus: {
    id: 'miceonvenus',
    title: 'Mice on Venus (Piano 3)',
    composer: 'C418 (Daniel Rosenfeld)',
    source: 'Minecraft: Volume Alpha',
    license: 'Non-Commercial Fan Use with Attribution',
    attribution: 'Music composed by C418 (c418.org). Synthesized programmatically in-browser.'
  },
  cat: {
    id: 'cat',
    title: 'Cat (Green Music Disc)',
    composer: 'C418 (Daniel Rosenfeld)',
    source: 'Minecraft: Volume Alpha',
    license: 'Non-Commercial Fan Use with Attribution',
    attribution: 'Music composed by C418 (c418.org). Synthesized programmatically in-browser.'
  },
  wellerman: {
    id: 'wellerman',
    title: 'Soon May the Wellerman Come',
    composer: 'Traditional (19th-Century New Zealand Shanty)',
    source: 'Public Domain Folk Heritage',
    license: 'Public Domain',
    attribution: 'Traditional 19th-Century Whaling Shanty (Public Domain).'
  },
  sneakysnitch: {
    id: 'sneakysnitch',
    title: 'Sneaky Snitch',
    composer: 'Kevin MacLeod',
    source: 'Incompetech (incompetech.com)',
    license: 'Creative Commons Attribution 4.0 (CC-BY 4.0)',
    attribution: 'Music by Kevin MacLeod (incompetech.com) • Licensed under Creative Commons: By Attribution 4.0'
  },
  odetojoy: {
    id: 'odetojoy',
    title: 'Ode to Joy (Symphony No. 9)',
    composer: 'Ludwig van Beethoven (1824)',
    source: 'Neon Genesis Evangelion / Public Domain',
    license: 'Public Domain',
    attribution: 'Composed by Ludwig van Beethoven (1824) • Public Domain.'
  },
  cyberspace: {
    id: 'cyberspace',
    title: 'Cyberspace (8-bit Arpeggios)',
    composer: 'ASCII Gateway Synthesizer Engine',
    source: 'Procedural Algorithm',
    license: 'MIT / Open Source',
    attribution: 'Procedurally generated algorithmic chiptune.'
  },
  neon: {
    id: 'neon',
    title: 'Neon Dreams (16-bit Lo-Fi)',
    composer: 'ASCII Gateway Synthesizer Engine',
    source: 'Procedural Algorithm',
    license: 'MIT / Open Source',
    attribution: 'Procedurally generated algorithmic FM synth chords.'
  },
  ambient: {
    id: 'ambient',
    title: 'Deep Terminal Ambient',
    composer: 'ASCII Gateway Synthesizer Engine',
    source: 'Procedural Algorithm',
    license: 'MIT / Open Source',
    attribution: 'Procedurally generated space drone and celestial chimes.'
  },
  generative: {
    id: 'generative',
    title: 'Generative Endless Mode',
    composer: 'ASCII Gateway Synthesizer Engine',
    source: 'Procedural Algorithm',
    license: 'MIT / Open Source',
    attribution: 'Infinite self-evolving algorithmic pentatonic loop.'
  }
};

export class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private currentTrack: MusicTrack = 'off';
  private musicTimer: any = null;
  private musicMasterVol: number = 0.085;
  private mcPlaylistIdx: number = 0;

  constructor() {
    this.enabled = localStorage.getItem('ascii_audio_enabled') !== 'false';
    const savedTrack = localStorage.getItem('ascii_music_track') as MusicTrack;
    if (savedTrack && TRACK_REGISTRY[savedTrack]) {
      this.currentTrack = savedTrack;
    }

    // Unlock audio context on the very first user gesture anywhere
    const unlockAudio = () => {
      this.initContext();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('pointerdown', unlockAudio, { once: true });
  }

  public initContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    localStorage.setItem('ascii_audio_enabled', String(val));
    if (!val) {
      this.stopMusic();
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    if (this.enabled) {
      this.playBeep(880, 0.08, 'sine');
    }
    return this.enabled;
  }

  // Synthesize crisp mechanical keyboard key-clack
  public playKeyClick(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const baseFreq = 340 + Math.random() * 140;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.035);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600 + Math.random() * 400, now);
      filter.Q.setValueAtTime(3.5, now);

      gain.gain.setValueAtTime(0.065, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio fallback
    }
  }

  // Synthesize 8-bit PC speaker beep
  public playBeep(freq = 640, duration = 0.1, type: OscillatorType = 'square', vol = 0.08): void {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio fallback
    }
  }

  // Synthesize retro login success chime
  public playSuccessChime(): void {
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 0.14, 'triangle', 0.09);
      }, idx * 75);
    });
  }

  // Synthesize error buzz
  public playErrorBuzz(): void {
    if (!this.enabled) return;
    this.playBeep(160, 0.18, 'sawtooth', 0.09);
  }

  // ── Procedural Music Synthesizer Engine ─────────────────────────────────────
  public getCurrentTrack(): MusicTrack {
    return this.currentTrack;
  }

  public getTrackMetadata(track = this.currentTrack): TrackMetadata {
    return TRACK_REGISTRY[track] || TRACK_REGISTRY.off;
  }

  public setTrack(track: MusicTrack): TrackMetadata {
    this.currentTrack = track;
    localStorage.setItem('ascii_music_track', track);
    this.stopMusic();

    if (track !== 'off' && this.enabled) {
      this.startMusic();
    }
    return this.getTrackMetadata(track);
  }

  public cycleTrack(): TrackMetadata {
    const tracks: MusicTrack[] = [
      'off', 
      'minecraft', 
      'sweden', 
      'subwoofer', 
      'wethands', 
      'cat', 
      'wellerman', 
      'sneakysnitch', 
      'odetojoy', 
      'cyberspace', 
      'neon', 
      'ambient', 
      'generative'
    ];
    const idx = tracks.indexOf(this.currentTrack);
    const next = tracks[(idx + 1) % tracks.length];
    return this.setTrack(next);
  }

  public stopMusic(): void {
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public startMusic(): void {
    this.stopMusic();
    if (!this.enabled || this.currentTrack === 'off') return;

    this.initContext();

    switch (this.currentTrack) {
      case 'minecraft':
        this.playMinecraftSuite();
        break;
      case 'sweden':
        this.playSwedenLoop();
        break;
      case 'subwoofer':
        this.playSubwooferLoop();
        break;
      case 'wethands':
        this.playWetHandsLoop();
        break;
      case 'miceonvenus':
        this.playMiceOnVenusLoop();
        break;
      case 'cat':
        this.playCatDiscLoop();
        break;
      case 'wellerman':
        this.playWellermanLoop();
        break;
      case 'sneakysnitch':
        this.playSneakySnitchLoop();
        break;
      case 'odetojoy':
        this.playOdeToJoyLoop();
        break;
      case 'cyberspace':
        this.playCyberspaceLoop();
        break;
      case 'neon':
        this.playNeonLoop();
        break;
      case 'ambient':
        this.playAmbientLoop();
        break;
      case 'generative':
        this.playGenerativeLoop();
        break;
    }
  }

  // ── MINECRAFT SUITE PLAYLIST ────────────────────────────────────────────────
  private playMinecraftSuite(): void {
    const playlist = [
      () => this.playSwedenLoop(false),
      () => this.playSubwooferLoop(false),
      () => this.playWetHandsLoop(false),
      () => this.playMiceOnVenusLoop(false),
      () => this.playCatDiscLoop(false)
    ];

    const runNext = () => {
      if (!this.enabled || this.currentTrack !== 'minecraft') return;
      const fn = playlist[this.mcPlaylistIdx % playlist.length];
      this.mcPlaylistIdx++;
      fn();
    };

    runNext();
  }

  // 1. C418 - "Sweden"
  public playSwedenLoop(loopSelf = true): void {
    // D Major / G Major chords & melody
    const fS4 = 369.99, d4 = 293.66, e4 = 329.63, g4 = 392.00, b3 = 246.94, a3 = 220.00, fS3 = 185.00, d3 = 146.83, g3 = 196.00, b2 = 123.47;
    const notes: { f: number; d: number; b?: number }[] = [
      { f: fS4, d: 0.9, b: d3 },
      { f: d4,  d: 0.7 },
      { f: e4,  d: 0.7 },
      { f: fS4, d: 0.9, b: g3 },
      { f: g4,  d: 0.8 },
      { f: fS4, d: 0.8 },
      { f: e4,  d: 0.9, b: b2 },
      { f: d4,  d: 0.7 },
      { f: b3,  d: 0.7 },
      { f: d4,  d: 0.9, b: g3 },
      { f: e4,  d: 0.9 },
      { f: d4,  d: 1.4 }
    ];

    let step = 0;
    const playNext = () => {
      if (!this.enabled || (this.currentTrack !== 'sweden' && this.currentTrack !== 'minecraft')) return;

      if (step < notes.length) {
        const item = notes[step];
        this.synthPluck(item.f, item.d * 1.8, 'triangle', this.musicMasterVol * 0.7, 950);
        if (item.b) {
          this.synthPluck(item.b, item.d * 2.5, 'sine', this.musicMasterVol * 0.9, 350);
        }
        step++;
        this.musicTimer = setTimeout(playNext, item.d * 900);
      } else {
        if (loopSelf) {
          step = 0;
          this.musicTimer = setTimeout(playNext, 2000);
        } else {
          this.musicTimer = setTimeout(() => this.playMinecraftSuite(), 2000);
        }
      }
    };

    playNext();
  }

  // 2. C418 - "Subwoofer Lullaby"
  public playSubwooferLoop(loopSelf = true): void {
    const c5 = 523.25, g4 = 392.00, e4 = 329.63, d5 = 587.33, f4 = 349.23, b4 = 493.88, c4 = 261.63, a2 = 110.00, c3 = 130.81, f2 = 87.31;
    const sequence: { f: number; d: number; b?: number }[] = [
      { f: c5, d: 0.6, b: a2 }, { f: g4, d: 0.4 }, { f: e4, d: 0.5 }, { f: g4, d: 0.4 },
      { f: d5, d: 0.6, b: f2 }, { f: g4, d: 0.4 }, { f: f4, d: 0.5 }, { f: g4, d: 0.4 },
      { f: c5, d: 0.6, b: c3 }, { f: b4, d: 0.4 }, { f: g4, d: 0.5 }, { f: e4, d: 0.4 },
      { f: f4, d: 0.5, b: f2 }, { f: g4, d: 0.4 }, { f: c4, d: 0.9 }
    ];

    let step = 0;
    const playNext = () => {
      if (!this.enabled || (this.currentTrack !== 'subwoofer' && this.currentTrack !== 'minecraft')) return;

      if (step < sequence.length) {
        const item = sequence[step];
        this.synthPluck(item.f, item.d * 1.6, 'sine', this.musicMasterVol * 0.65, 1400);
        if (item.b) {
          this.synthPluck(item.b, 2.2, 'sine', this.musicMasterVol * 0.95, 220);
        }
        step++;
        this.musicTimer = setTimeout(playNext, item.d * 850);
      } else {
        if (loopSelf) {
          step = 0;
          this.musicTimer = setTimeout(playNext, 2200);
        } else {
          this.musicTimer = setTimeout(() => this.playMinecraftSuite(), 2200);
        }
      }
    };

    playNext();
  }

  // 3. C418 - "Wet Hands"
  public playWetHandsLoop(loopSelf = true): void {
    const a3 = 220.00, cS4 = 277.18, e4 = 329.63, gS4 = 415.30, a4 = 440.00, fS4 = 369.99, fS3 = 185.00, d3 = 146.83;
    const arp = [
      { f: a3, d: 0.4, b: a3 / 2 }, { f: cS4, d: 0.4 }, { f: e4, d: 0.4 }, { f: gS4, d: 0.5 },
      { f: a4, d: 0.6 }, { f: gS4, d: 0.4 }, { f: e4, d: 0.4 }, { f: cS4, d: 0.5 },
      { f: fS3, d: 0.4, b: fS3 / 2 }, { f: a3, d: 0.4 }, { f: cS4, d: 0.4 }, { f: e4, d: 0.5 },
      { f: fS4, d: 0.6 }, { f: e4, d: 0.4 }, { f: cS4, d: 0.4 }, { f: a3, d: 0.7 }
    ];

    let step = 0;
    const playNext = () => {
      if (!this.enabled || (this.currentTrack !== 'wethands' && this.currentTrack !== 'minecraft')) return;

      if (step < arp.length) {
        const item = arp[step];
        this.synthPluck(item.f, item.d * 1.5, 'triangle', this.musicMasterVol * 0.6, 1100);
        if (item.b) {
          this.synthPluck(item.b, 2.5, 'sine', this.musicMasterVol * 0.8, 300);
        }
        step++;
        this.musicTimer = setTimeout(playNext, item.d * 750);
      } else {
        if (loopSelf) {
          step = 0;
          this.musicTimer = setTimeout(playNext, 1800);
        } else {
          this.musicTimer = setTimeout(() => this.playMinecraftSuite(), 1800);
        }
      }
    };

    playNext();
  }

  // 4. C418 - "Mice on Venus"
  public playMiceOnVenusLoop(loopSelf = true): void {
    const d4 = 293.66, fS4 = 369.99, a4 = 440.00, b4 = 493.88, e4 = 329.63, g4 = 392.00, cS4 = 277.18;
    const melody = [
      { f: d4, d: 0.5, b: 146.83 }, { f: fS4, d: 0.5 }, { f: a4, d: 0.6 }, { f: b4, d: 0.6 },
      { f: a4, d: 0.5 }, { f: fS4, d: 0.5 }, { f: e4, d: 0.7, b: 196.00 }, { f: d4, d: 0.5 },
      { f: fS4, d: 0.5 }, { f: g4, d: 0.6 }, { f: fS4, d: 0.5 }, { f: e4, d: 0.5, b: 123.47 },
      { f: d4, d: 0.6 }, { f: cS4, d: 0.5 }, { f: d4, d: 1.0, b: 146.83 }
    ];

    let step = 0;
    const playNext = () => {
      if (!this.enabled || (this.currentTrack !== 'miceonvenus' && this.currentTrack !== 'minecraft')) return;

      if (step < melody.length) {
        const item = melody[step];
        this.synthPluck(item.f, item.d * 1.5, 'sine', this.musicMasterVol * 0.7, 1200);
        if (item.b) {
          this.synthPluck(item.b, 2.2, 'triangle', this.musicMasterVol * 0.8, 400);
        }
        step++;
        this.musicTimer = setTimeout(playNext, item.d * 800);
      } else {
        if (loopSelf) {
          step = 0;
          this.musicTimer = setTimeout(playNext, 2000);
        } else {
          this.musicTimer = setTimeout(() => this.playMinecraftSuite(), 2000);
        }
      }
    };

    playNext();
  }

  // 5. C418 - "Cat" (Green Music Disc)
  public playCatDiscLoop(loopSelf = true): void {
    const c5 = 523.25, g4 = 392.00, d5 = 587.33, e5 = 659.25, a4 = 440.00, e4 = 329.63, c4 = 261.63;
    const groove = [
      { f: c5, d: 0.25, b: c4 }, { f: g4, d: 0.25 }, { f: c5, d: 0.25 }, { f: d5, d: 0.25 },
      { f: e5, d: 0.4, b: a4 / 2 }, { f: d5, d: 0.25 }, { f: c5, d: 0.35 }, { f: a4, d: 0.25 },
      { f: g4, d: 0.3, b: e4 }, { f: e4, d: 0.25 }, { f: g4, d: 0.25 }, { f: a4, d: 0.35 },
      { f: c5, d: 0.35, b: c4 }, { f: a4, d: 0.25 }, { f: g4, d: 0.5 }
    ];

    let step = 0;
    const playNext = () => {
      if (!this.enabled || (this.currentTrack !== 'cat' && this.currentTrack !== 'minecraft')) return;

      if (step < groove.length) {
        const item = groove[step];
        this.synthPluck(item.f, 0.2, 'square', this.musicMasterVol * 0.5, 1600);
        if (item.b) {
          this.synthPluck(item.b, 0.3, 'triangle', this.musicMasterVol * 0.75, 500);
        }
        step++;
        this.musicTimer = setTimeout(playNext, item.d * 600);
      } else {
        if (loopSelf) {
          step = 0;
          this.musicTimer = setTimeout(playNext, 1200);
        } else {
          this.musicTimer = setTimeout(() => this.playMinecraftSuite(), 1200);
        }
      }
    };

    playNext();
  }

  // 6. The Wellerman (19th-Century Sea Shanty)
  public playWellermanLoop(): void {
    const c4 = 261.63, eb4 = 311.13, g4 = 392.00, f4 = 349.23, d4 = 293.66, ab4 = 415.30, bb3 = 233.08, c3 = 130.81;
    const melody = [
      { f: c4, d: 0.3, b: c3 }, { f: c4, d: 0.3 }, { f: c4, d: 0.3 }, { f: eb4, d: 0.4 },
      { f: g4, d: 0.4, b: g4 / 2 }, { f: g4, d: 0.3 }, { f: g4, d: 0.3 }, { f: g4, d: 0.4 },
      { f: f4, d: 0.3, b: bb3 }, { f: eb4, d: 0.3 }, { f: d4, d: 0.3 }, { f: d4, d: 0.3 },
      { f: d4, d: 0.3 }, { f: f4, d: 0.4, b: c3 }, { f: g4, d: 0.4 }, { f: ab4, d: 0.4 },
      { f: g4, d: 0.3, b: g4 / 2 }, { f: f4, d: 0.3 }, { f: eb4, d: 0.3 }, { f: d4, d: 0.3 },
      { f: c4, d: 0.6, b: c3 }
    ];

    let step = 0;
    const playNext = () => {
      if (!this.enabled || this.currentTrack !== 'wellerman') return;
      if (step < melody.length) {
        const item = melody[step];
        this.synthPluck(item.f, item.d * 1.1, 'square', this.musicMasterVol * 0.55, 1400);
        if (item.b) {
          this.synthPluck(item.b, item.d * 1.5, 'triangle', this.musicMasterVol * 0.8, 450);
        }
        step++;
        this.musicTimer = setTimeout(playNext, item.d * 600);
      } else {
        step = 0;
        this.musicTimer = setTimeout(playNext, 1200);
      }
    };
    playNext();
  }

  // 7. Kevin MacLeod - "Sneaky Snitch" (CC-BY 4.0)
  public playSneakySnitchLoop(): void {
    const c4 = 261.63, d4 = 293.66, eb4 = 311.13, g3 = 196.00, b3 = 246.94, f4 = 349.23, g4 = 392.00, ab4 = 415.30;
    const notes = [
      { f: c4, d: 0.2 }, { f: d4, d: 0.2 }, { f: eb4, d: 0.3, b: 130.81 }, { f: c4, d: 0.2 },
      { f: g3, d: 0.2 }, { f: c4, d: 0.2 }, { f: eb4, d: 0.3, b: 130.81 }, { f: d4, d: 0.2 },
      { f: b3, d: 0.2 }, { f: g3, d: 0.2 }, { f: b3, d: 0.2, b: 123.47 }, { f: d4, d: 0.3 },
      { f: c4, d: 0.2 }, { f: g3, d: 0.2 }, { f: c4, d: 0.2, b: 130.81 }, { f: eb4, d: 0.2 },
      { f: f4, d: 0.2 }, { f: g4, d: 0.3, b: 196.00 }, { f: ab4, d: 0.2 }, { f: g4, d: 0.2 },
      { f: f4, d: 0.2 }, { f: eb4, d: 0.2 }, { f: d4, d: 0.2 }, { f: c4, d: 0.5, b: 130.81 }
    ];

    let step = 0;
    const playNext = () => {
      if (!this.enabled || this.currentTrack !== 'sneakysnitch') return;
      if (step < notes.length) {
        const item = notes[step];
        this.synthPluck(item.f, 0.16, 'triangle', this.musicMasterVol * 0.65, 1500);
        if (item.b) {
          this.synthPluck(item.b, 0.25, 'sine', this.musicMasterVol * 0.7, 300);
        }
        step++;
        this.musicTimer = setTimeout(playNext, item.d * 650);
      } else {
        step = 0;
        this.musicTimer = setTimeout(playNext, 1000);
      }
    };
    playNext();
  }

  // 8. Beethoven - "Ode to Joy"
  public playOdeToJoyLoop(): void {
    const e4 = 329.63, f4 = 349.23, g4 = 392.00, d4 = 293.66, c4 = 261.63, g3 = 196.00, c3 = 130.81;
    const theme = [
      { f: e4, d: 0.35, b: c3 }, { f: e4, d: 0.35 }, { f: f4, d: 0.35 }, { f: g4, d: 0.35, b: g3 },
      { f: g4, d: 0.35 }, { f: f4, d: 0.35 }, { f: e4, d: 0.35, b: c3 }, { f: d4, d: 0.35 },
      { f: c4, d: 0.35, b: c3 }, { f: c4, d: 0.35 }, { f: d4, d: 0.35 }, { f: e4, d: 0.35, b: g3 },
      { f: e4, d: 0.5 },  { f: d4, d: 0.2 },  { f: d4, d: 0.6, b: g3 },
      { f: e4, d: 0.35, b: c3 }, { f: e4, d: 0.35 }, { f: f4, d: 0.35 }, { f: g4, d: 0.35, b: g3 },
      { f: g4, d: 0.35 }, { f: f4, d: 0.35 }, { f: e4, d: 0.35, b: c3 }, { f: d4, d: 0.35 },
      { f: c4, d: 0.35, b: c3 }, { f: c4, d: 0.35 }, { f: d4, d: 0.35 }, { f: e4, d: 0.35, b: g3 },
      { f: d4, d: 0.5 },  { f: c4, d: 0.2 },  { f: c4, d: 0.7, b: c3 }
    ];

    let step = 0;
    const playNext = () => {
      if (!this.enabled || this.currentTrack !== 'odetojoy') return;
      if (step < theme.length) {
        const item = theme[step];
        this.synthPluck(item.f, item.d * 1.3, 'square', this.musicMasterVol * 0.5, 1200);
        if (item.b) {
          this.synthPluck(item.b, item.d * 1.6, 'triangle', this.musicMasterVol * 0.8, 400);
        }
        step++;
        this.musicTimer = setTimeout(playNext, item.d * 700);
      } else {
        step = 0;
        this.musicTimer = setTimeout(playNext, 1500);
      }
    };
    playNext();
  }

  // 9. Cyberspace
  private playCyberspaceLoop(): void {
    const scale = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25];
    const bass = [110.00, 110.00, 130.81, 146.83, 164.81, 164.81, 146.83, 130.81];
    const pattern = [0, 2, 4, 7, 5, 3, 4, 1, 0, 3, 5, 7, 6, 4, 2, 1];
    let step = 0;

    const tick = () => {
      if (!this.enabled || this.currentTrack !== 'cyberspace') return;
      const noteFreq = scale[pattern[step % pattern.length] % scale.length];
      const bassFreq = bass[Math.floor(step / 2) % bass.length];

      this.synthPluck(noteFreq, 0.12, 'square', this.musicMasterVol * 0.45, 1200);
      if (step % 2 === 0) {
        this.synthPluck(bassFreq, 0.28, 'triangle', this.musicMasterVol * 0.7, 400);
      }
      step++;
      this.musicTimer = setTimeout(tick, 180);
    };
    tick();
  }

  // 10. Neon
  private playNeonLoop(): void {
    const chords = [
      [146.83, 220.00, 261.63, 329.63, 392.00],
      [196.00, 246.94, 293.66, 349.23, 440.00],
      [130.81, 196.00, 246.94, 329.63, 392.00],
      [220.00, 261.63, 329.63, 392.00, 523.25]
    ];
    let chordIdx = 0;
    let tickCount = 0;

    const tick = () => {
      if (!this.enabled || this.currentTrack !== 'neon') return;
      const currentChord = chords[chordIdx % chords.length];

      currentChord.forEach((freq, i) => {
        setTimeout(() => {
          if (this.currentTrack === 'neon') {
            this.synthPluck(freq, 0.45, 'triangle', this.musicMasterVol * 0.35, 900);
          }
        }, i * 35);
      });

      this.synthPluck(currentChord[0] / 2, 0.6, 'sine', this.musicMasterVol * 0.9, 250);
      tickCount++;
      if (tickCount % 4 === 0) chordIdx++;
      this.musicTimer = setTimeout(tick, 600);
    };
    tick();
  }

  // 11. Ambient
  private playAmbientLoop(): void {
    const droneFreqs = [110.00, 164.81, 220.00, 329.63];
    const chimeScale = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98];

    const droneTick = () => {
      if (!this.enabled || this.currentTrack !== 'ambient') return;
      const f = droneFreqs[Math.floor(Math.random() * droneFreqs.length)];
      this.synthPluck(f, 2.5, 'sine', this.musicMasterVol * 0.6, 600);

      if (Math.random() > 0.35) {
        const chime = chimeScale[Math.floor(Math.random() * chimeScale.length)];
        setTimeout(() => {
          if (this.currentTrack === 'ambient') {
            this.synthPluck(chime, 1.2, 'sine', this.musicMasterVol * 0.35, 2400);
          }
        }, 300 + Math.random() * 800);
      }
      this.musicTimer = setTimeout(droneTick, 1800);
    };
    droneTick();
  }

  // 12. Generative Endless Mode
  private playGenerativeLoop(): void {
    const rootNotes = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00];
    let baseRoot = rootNotes[Math.floor(Math.random() * rootNotes.length)];
    let interval = 0;

    const tick = () => {
      if (!this.enabled || this.currentTrack !== 'generative') return;
      const pentatonicSteps = [0, 2, 4, 7, 9, 12, 14, 16, 19];
      const step = pentatonicSteps[Math.floor(Math.random() * pentatonicSteps.length)];
      const freq = baseRoot * Math.pow(2, step / 12);

      const waveType: OscillatorType = Math.random() > 0.4 ? 'triangle' : 'square';
      const duration = 0.2 + Math.random() * 0.4;
      this.synthPluck(freq, duration, waveType, this.musicMasterVol * 0.4, 1100);

      if (interval++ % 16 === 0) {
        baseRoot = rootNotes[Math.floor(Math.random() * rootNotes.length)];
        this.synthPluck(baseRoot / 2, 1.0, 'sine', this.musicMasterVol * 0.8, 300);
      }
      const nextDelay = [160, 240, 320, 480][Math.floor(Math.random() * 4)];
      this.musicTimer = setTimeout(tick, nextDelay);
    };
    tick();
  }

  // ── Chiptune Melody Easter Eggs ───────────────────────────────────────────
  public playMelody(notes: { freq: number; dur: number; type?: OscillatorType }[]): void {
    if (!this.enabled) return;
    this.initContext();

    let offset = 0;
    notes.forEach(note => {
      setTimeout(() => {
        this.synthPluck(note.freq, note.dur * 0.9, note.type || 'square', this.musicMasterVol * 0.85, 1800);
      }, offset);
      offset += note.dur * 1000;
    });
  }

  public playZeldaTheme(): void {
    const g4 = 392.00, fs4 = 369.99, ds4 = 311.13, a3 = 220.00, gs3 = 207.65, e4 = 329.63, cs4 = 277.18, c5 = 523.25;
    const notes = [
      { freq: g4, dur: 0.12 }, { freq: fs4, dur: 0.12 }, { freq: ds4, dur: 0.12 },
      { freq: a3, dur: 0.12 }, { freq: gs3, dur: 0.12 }, { freq: e4, dur: 0.12 },
      { freq: cs4, dur: 0.12 }, { freq: c5, dur: 0.35 }
    ];
    this.playMelody(notes);
  }

  public playPokemonTheme(): void {
    const c4 = 261.63, d4 = 293.66, e4 = 329.63, g4 = 392.00, a4 = 440.00, b4 = 493.88, c5 = 523.25;
    const notes = [
      { freq: c4, dur: 0.2 }, { freq: e4, dur: 0.2 }, { freq: g4, dur: 0.2 },
      { freq: a4, dur: 0.4 }, { freq: g4, dur: 0.4 }, { freq: e4, dur: 0.2 },
      { freq: d4, dur: 0.2 }, { freq: c4, dur: 0.4 }, { freq: d4, dur: 0.4 },
      { freq: e4, dur: 0.6 }
    ];
    this.playMelody(notes);
  }

  public playTetrisTheme(): void {
    const e5 = 659.25, b4 = 493.88, c5 = 523.25, d5 = 587.33, a4 = 440.00;
    const notes = [
      { freq: e5, dur: 0.3 }, { freq: b4, dur: 0.15 }, { freq: c5, dur: 0.15 },
      { freq: d5, dur: 0.3 }, { freq: c5, dur: 0.15 }, { freq: b4, dur: 0.15 },
      { freq: a4, dur: 0.3 }, { freq: a4, dur: 0.15 }, { freq: c5, dur: 0.15 },
      { freq: e5, dur: 0.3 }, { freq: d5, dur: 0.15 }, { freq: c5, dur: 0.15 },
      { freq: b4, dur: 0.45 }
    ];
    this.playMelody(notes);
  }

  // Helper synth envelope voice
  private synthPluck(freq: number, dur: number, type: OscillatorType, volume: number, cutoff = 1200): void {
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoff, now);
      filter.Q.setValueAtTime(2.0, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + dur + 0.05);
    } catch {
      // Audio fallback
    }
  }
}

export const sound = new SoundSynthesizer();
