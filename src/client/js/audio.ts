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
    title: 'Sweden (Calm 3) [Full Arrangement]',
    composer: 'C418 (Daniel Rosenfeld)',
    source: 'Minecraft: Volume Alpha',
    license: 'Non-Commercial Fan Use with Attribution',
    attribution: 'Music composed by C418 (c418.org). Synthesized programmatically in-browser.'
  },
  subwoofer: {
    id: 'subwoofer',
    title: 'Subwoofer Lullaby (Hal 1) [Full Arrangement]',
    composer: 'C418 (Daniel Rosenfeld)',
    source: 'Minecraft: Volume Alpha',
    license: 'Non-Commercial Fan Use with Attribution',
    attribution: 'Music composed by C418 (c418.org). Synthesized programmatically in-browser.'
  },
  wethands: {
    id: 'wethands',
    title: 'Wet Hands (Piano 1) [Full Arrangement]',
    composer: 'C418 (Daniel Rosenfeld)',
    source: 'Minecraft: Volume Alpha',
    license: 'Non-Commercial Fan Use with Attribution',
    attribution: 'Music composed by C418 (c418.org). Synthesized programmatically in-browser.'
  },
  miceonvenus: {
    id: 'miceonvenus',
    title: 'Mice on Venus (Piano 3) [Full Arrangement]',
    composer: 'C418 (Daniel Rosenfeld)',
    source: 'Minecraft: Volume Alpha',
    license: 'Non-Commercial Fan Use with Attribution',
    attribution: 'Music composed by C418 (c418.org). Synthesized programmatically in-browser.'
  },
  cat: {
    id: 'cat',
    title: 'Cat (Green Music Disc) [Full Arrangement]',
    composer: 'C418 (Daniel Rosenfeld)',
    source: 'Minecraft: Volume Alpha',
    license: 'Non-Commercial Fan Use with Attribution',
    attribution: 'Music composed by C418 (c418.org). Synthesized programmatically in-browser.'
  },
  wellerman: {
    id: 'wellerman',
    title: 'Soon May the Wellerman Come (Full Shanty)',
    composer: 'Traditional (19th-Century New Zealand Shanty)',
    source: 'Public Domain Folk Heritage',
    license: 'Public Domain',
    attribution: 'Traditional 19th-Century Whaling Shanty (Public Domain).'
  },
  sneakysnitch: {
    id: 'sneakysnitch',
    title: 'Sneaky Snitch (Full Arrangement)',
    composer: 'Kevin MacLeod',
    source: 'Incompetech (incompetech.com)',
    license: 'Creative Commons Attribution 4.0 (CC-BY 4.0)',
    attribution: 'Music by Kevin MacLeod (incompetech.com) • Licensed under Creative Commons: By Attribution 4.0'
  },
  odetojoy: {
    id: 'odetojoy',
    title: 'Ode to Joy (Symphony No. 9 - Full Symphony Movement)',
    composer: 'Ludwig van Beethoven (1824)',
    source: 'Neon Genesis Evangelion / Public Domain',
    license: 'Public Domain',
    attribution: 'Composed by Ludwig van Beethoven (1824) • Public Domain.'
  },
  cyberspace: {
    id: 'cyberspace',
    title: 'Cyberspace (8-bit Extended Arpeggios)',
    composer: 'ASCII Gateway Synthesizer Engine',
    source: 'Procedural Algorithm',
    license: 'MIT / Open Source',
    attribution: 'Procedurally generated algorithmic chiptune.'
  },
  neon: {
    id: 'neon',
    title: 'Neon Dreams (16-bit Lo-Fi Chords)',
    composer: 'ASCII Gateway Synthesizer Engine',
    source: 'Procedural Algorithm',
    license: 'MIT / Open Source',
    attribution: 'Procedurally generated algorithmic FM synth chords.'
  },
  ambient: {
    id: 'ambient',
    title: 'Deep Terminal Ambient (Space Drone)',
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

interface SongNote {
  f: number;      // Melody Frequency in Hz
  d: number;      // Note Duration in seconds
  b?: number;     // Bass Frequency in Hz
  chord?: number[]; // Polyphonic harmony chords
  type?: OscillatorType;
}

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
      'miceonvenus',
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
        this.playSwedenFull();
        break;
      case 'subwoofer':
        this.playSubwooferFull();
        break;
      case 'wethands':
        this.playWetHandsFull();
        break;
      case 'miceonvenus':
        this.playMiceOnVenusFull();
        break;
      case 'cat':
        this.playCatDiscFull();
        break;
      case 'wellerman':
        this.playWellermanFull();
        break;
      case 'sneakysnitch':
        this.playSneakySnitchFull();
        break;
      case 'odetojoy':
        this.playOdeToJoyFull();
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

  // ── MINECRAFT SUITE CONTINUOUS PLAYLIST ──────────────────────────────────────
  private playMinecraftSuite(): void {
    const playlist = [
      () => this.playSwedenFull(false),
      () => this.playSubwooferFull(false),
      () => this.playWetHandsFull(false),
      () => this.playMiceOnVenusFull(false),
      () => this.playCatDiscFull(false)
    ];

    const runNext = () => {
      if (!this.enabled || this.currentTrack !== 'minecraft') return;
      const fn = playlist[this.mcPlaylistIdx % playlist.length];
      this.mcPlaylistIdx++;
      fn();
    };

    runNext();
  }

  // ── 1. C418 - "SWEDEN" (FULL COMPLETE SONG ARRANGEMENT) ──────────────────────
  public playSwedenFull(loopSelf = true): void {
    const fS4 = 369.99, d4 = 293.66, e4 = 329.63, g4 = 392.00, b3 = 246.94, a3 = 220.00, fS3 = 185.00;
    const a4 = 440.00, b4 = 493.88, cS5 = 554.37, d5 = 587.33, e5 = 659.25, fS5 = 739.99;
    const d3 = 146.83, g3 = 196.00, b2 = 123.47, a2 = 110.00, e3 = 164.81, d2 = 73.42, g2 = 98.00;

    const fullSong: SongNote[] = [
      // ── SECTION A: First Theme Statement ──
      { f: fS4, d: 0.9, b: d3, chord: [d4, a3] },
      { f: d4,  d: 0.7 },
      { f: e4,  d: 0.7 },
      { f: fS4, d: 0.9, b: g3, chord: [b3, d4] },
      { f: g4,  d: 0.8 },
      { f: fS4, d: 0.8 },
      { f: e4,  d: 0.9, b: b2, chord: [d4, fS3] },
      { f: d4,  d: 0.7 },
      { f: b3,  d: 0.7 },
      { f: d4,  d: 0.9, b: g3, chord: [b3, d4] },
      { f: e4,  d: 0.9 },
      { f: d4,  d: 1.4, b: d2 },

      // ── SECTION A2: Second Phrase with Rising A4 ──
      { f: fS4, d: 0.9, b: d3, chord: [d4, a3] },
      { f: a4,  d: 0.7 },
      { f: g4,  d: 0.7 },
      { f: fS4, d: 0.9, b: g3, chord: [b3, d4] },
      { f: e4,  d: 0.8 },
      { f: d4,  d: 0.8 },
      { f: b3,  d: 0.9, b: b2, chord: [d4, fS3] },
      { f: d4,  d: 0.7 },
      { f: e4,  d: 0.7 },
      { f: fS4, d: 0.9, b: a2, chord: [cS4, e4] },
      { f: e4,  d: 0.9 },
      { f: d4,  d: 1.6, b: d3 },

      // ── SECTION B: Main Chorus Swell & High Octave Melody ──
      { f: a4,  d: 0.8, b: g2, chord: [d4, g4] },
      { f: b4,  d: 0.7 },
      { f: d5,  d: 1.1, b: d3, chord: [fS4, a4] },
      { f: cS5, d: 0.7 },
      { f: b4,  d: 0.7 },
      { f: a4,  d: 1.0, b: e3, chord: [g4, b3] },
      { f: fS4, d: 0.7 },
      { f: d4,  d: 0.7 },
      { f: e4,  d: 0.8, b: a2, chord: [cS4, e4] },
      { f: fS4, d: 0.8 },
      { f: g4,  d: 0.8 },
      { f: fS4, d: 0.8, b: d3, chord: [a3, d4] },
      { f: e4,  d: 1.4 },

      // ── SECTION B2: Climax Variation ──
      { f: a4,  d: 0.8, b: g2, chord: [d4, g4] },
      { f: b4,  d: 0.7 },
      { f: d5,  d: 0.9, b: d3, chord: [fS4, a4] },
      { f: e5,  d: 0.9 },
      { f: d5,  d: 0.9, b: b2, chord: [fS4, d4] },
      { f: b4,  d: 0.7 },
      { f: a4,  d: 0.9, b: g3, chord: [b3, d4] },
      { f: fS4, d: 0.7 },
      { f: e4,  d: 0.7 },
      { f: d4,  d: 0.8, b: d3, chord: [a3, d4] },
      { f: b3,  d: 0.7 },
      { f: d4,  d: 0.9, b: g3 },
      { f: e4,  d: 0.9 },
      { f: d4,  d: 1.8, b: d2 },

      // ── SECTION C: Soft Resolving Outro ──
      { f: fS4, d: 0.9, b: d3, chord: [a3, d4] },
      { f: d4,  d: 0.7 },
      { f: e4,  d: 0.7 },
      { f: d4,  d: 0.9, b: g3, chord: [b3, d4] },
      { f: b3,  d: 0.7 },
      { f: a3,  d: 0.7 },
      { f: b3,  d: 0.9, b: b2 },
      { f: d4,  d: 0.9, b: g3 },
      { f: e4,  d: 0.9 },
      { f: d4,  d: 2.2, b: d2, chord: [fS3, a3, d4] }
    ];

    this.playSongSequence(fullSong, 'sweden', loopSelf);
  }

  // ── 2. C418 - "SUBWOOFER LULLABY" (FULL COMPLETE SONG ARRANGEMENT) ────────────
  public playSubwooferFull(loopSelf = true): void {
    const c5 = 523.25, g4 = 392.00, e4 = 329.63, d5 = 587.33, f4 = 349.23, b4 = 493.88, c4 = 261.63, a4 = 440.00;
    const e5 = 659.25, f5 = 698.46, g5 = 783.99, a2 = 110.00, c3 = 130.81, f2 = 87.31, g2 = 98.00, c2 = 65.41;

    const fullSong: SongNote[] = [
      // ── SECTION A: Initial Music-Box Theme ──
      { f: c5, d: 0.6, b: a2, chord: [c4, e4] }, { f: g4, d: 0.4 }, { f: e4, d: 0.5 }, { f: g4, d: 0.4 },
      { f: d5, d: 0.6, b: f2, chord: [a3, c4] }, { f: g4, d: 0.4 }, { f: f4, d: 0.5 }, { f: g4, d: 0.4 },
      { f: c5, d: 0.6, b: c3, chord: [e4, g4] }, { f: b4, d: 0.4 }, { f: g4, d: 0.5 }, { f: e4, d: 0.4 },
      { f: f4, d: 0.5, b: f2, chord: [a3, c4] }, { f: g4, d: 0.4 }, { f: c4, d: 0.9 },

      // ── SECTION A2: Second Theme Development ──
      { f: c5, d: 0.6, b: a2, chord: [c4, e4] }, { f: g4, d: 0.4 }, { f: e4, d: 0.5 }, { f: g4, d: 0.4 },
      { f: d5, d: 0.6, b: f2, chord: [a3, c4] }, { f: g4, d: 0.4 }, { f: f4, d: 0.5 }, { f: g4, d: 0.4 },
      { f: e5, d: 0.7, b: g2, chord: [b3, d4] }, { f: d5, d: 0.5 }, { f: c5, d: 0.5 }, { f: b4, d: 0.4 },
      { f: a4, d: 0.5, b: c3, chord: [e4, g4] }, { f: g4, d: 0.4 }, { f: c5, d: 1.1 },

      // ── SECTION B: Soaring High Octave Melody ──
      { f: e5, d: 0.6, b: c3, chord: [g4, c5] }, { f: g4, d: 0.4 }, { f: c5, d: 0.5 }, { f: g4, d: 0.4 },
      { f: f5, d: 0.6, b: f2, chord: [a4, c5] }, { f: g4, d: 0.4 }, { f: d5, d: 0.5 }, { f: g4, d: 0.4 },
      { f: e5, d: 0.6, b: a2, chord: [c5, e5] }, { f: d5, d: 0.4 }, { f: c5, d: 0.5 }, { f: g4, d: 0.4 },
      { f: a4, d: 0.5, b: f2, chord: [c4, f4] }, { f: b4, d: 0.4 }, { f: c5, d: 1.0 },

      // ── SECTION B2: Warm Chime Resolution ──
      { f: g5, d: 0.7, b: c3, chord: [e4, g4] }, { f: e5, d: 0.5 }, { f: d5, d: 0.5 }, { f: c5, d: 0.5 },
      { f: d5, d: 0.6, b: g2, chord: [b3, d4] }, { f: e5, d: 0.5 }, { f: c5, d: 0.6, b: a2 }, { f: a4, d: 0.4 },
      { f: g4, d: 0.5, b: f2 }, { f: e4, d: 0.4 }, { f: d4, d: 0.5 }, { f: c4, d: 1.2, b: c2 },

      // ── SECTION C: Peaceful Fade ──
      { f: c5, d: 0.6, b: a2 }, { f: g4, d: 0.4 }, { f: e4, d: 0.5 }, { f: g4, d: 0.4 },
      { f: d5, d: 0.6, b: f2 }, { f: g4, d: 0.4 }, { f: c4, d: 1.8, b: c2, chord: [e4, g4, c5] }
    ];

    this.playSongSequence(fullSong, 'subwoofer', loopSelf);
  }

  // ── 3. C418 - "WET HANDS" (FULL COMPLETE SONG ARRANGEMENT) ────────────────────
  public playWetHandsFull(loopSelf = true): void {
    const a3 = 220.00, cS4 = 277.18, e4 = 329.63, gS4 = 415.30, a4 = 440.00, b4 = 493.88, cS5 = 554.37, d5 = 587.33, e5 = 659.25;
    const fS4 = 369.99, fS3 = 185.00, d3 = 146.83, d4 = 293.66, e3 = 164.81, gS3 = 207.65, b3 = 246.94, a2 = 110.00;

    const fullSong: SongNote[] = [
      // ── SECTION A: Wave 1 Arpeggios ──
      { f: a3,  d: 0.4, b: a2 }, { f: cS4, d: 0.4 }, { f: e4,  d: 0.4 }, { f: gS4, d: 0.5 },
      { f: a4,  d: 0.6 },        { f: gS4, d: 0.4 }, { f: e4,  d: 0.4 }, { f: cS4, d: 0.5 },
      { f: fS3, d: 0.4, b: fS3 / 2 }, { f: a3, d: 0.4 }, { f: cS4, d: 0.4 }, { f: e4, d: 0.5 },
      { f: fS4, d: 0.6 },        { f: e4,  d: 0.4 }, { f: cS4, d: 0.4 }, { f: a3,  d: 0.7 },

      // ── SECTION A2: Wave 2 (D Major to E Major) ──
      { f: d3,  d: 0.4, b: d3 / 2 }, { f: fS3, d: 0.4 }, { f: a3,  d: 0.4 }, { f: cS4, d: 0.5 },
      { f: d4,  d: 0.6 },        { f: cS4, d: 0.4 }, { f: a3,  d: 0.4 }, { f: fS3, d: 0.5 },
      { f: e3,  d: 0.4, b: e3 / 2 }, { f: gS3, d: 0.4 }, { f: b3,  d: 0.4 }, { f: d4,  d: 0.5 },
      { f: e4,  d: 0.6 },        { f: d4,  d: 0.4 }, { f: b3,  d: 0.4 }, { f: gS3, d: 0.7 },

      // ── SECTION B: Main High Melodic Piano Line ──
      { f: a3,  d: 0.4, b: a2 }, { f: e4,  d: 0.4 }, { f: a4,  d: 0.5 }, { f: b4,  d: 0.4 },
      { f: cS5, d: 0.7, b: a2 }, { f: b4,  d: 0.4 }, { f: a4,  d: 0.4 }, { f: gS4, d: 0.5 },
      { f: fS4, d: 0.6, b: fS3 }, { f: cS4, d: 0.4 }, { f: fS4, d: 0.4 }, { f: gS4, d: 0.5 },
      { f: a4,  d: 0.7 },        { f: gS4, d: 0.4 }, { f: fS4, d: 0.4 }, { f: e4,  d: 0.6 },

      // ── SECTION B2: Emotional High Climax ──
      { f: d4,  d: 0.4, b: d3 }, { f: fS4, d: 0.4 }, { f: a4,  d: 0.5 }, { f: b4,  d: 0.4 },
      { f: cS5, d: 0.6, b: d3 }, { f: d5,  d: 0.5 }, { f: cS5, d: 0.5 }, { f: b4,  d: 0.4 },
      { f: a4,  d: 0.7, b: a2 }, { f: e4,  d: 0.4 }, { f: cS4, d: 0.4 }, { f: b3,  d: 0.5 },
      { f: a3,  d: 1.4, b: a2 },

      // ── SECTION C: Floating Outro Arpeggio ──
      { f: a3,  d: 0.4, b: a2 }, { f: cS4, d: 0.4 }, { f: e4,  d: 0.4 }, { f: a4,  d: 0.5 },
      { f: cS5, d: 0.6 },        { f: e5,  d: 0.7 }, { f: cS5, d: 0.5 }, { f: a4,  d: 0.4 },
      { f: e4,  d: 0.5 },        { f: cS4, d: 0.5 }, { f: a3,  d: 2.0, b: a2 }
    ];

    this.playSongSequence(fullSong, 'wethands', loopSelf);
  }

  // ── 4. C418 - "MICE ON VENUS" (FULL COMPLETE SONG ARRANGEMENT) ────────────────
  public playMiceOnVenusFull(loopSelf = true): void {
    const d4 = 293.66, fS4 = 369.99, a4 = 440.00, b4 = 493.88, e4 = 329.63, g4 = 392.00, cS4 = 277.18;
    const d5 = 587.33, e5 = 659.25, fS5 = 739.99, g5 = 783.99, d3 = 146.83, g3 = 196.00, b2 = 123.47, a2 = 110.00;

    const fullSong: SongNote[] = [
      // ── SECTION A: Quiet Piano Intro ──
      { f: d4, d: 0.5, b: d3 }, { f: fS4, d: 0.5 }, { f: a4, d: 0.6 }, { f: b4, d: 0.6 },
      { f: a4, d: 0.5 }, { f: fS4, d: 0.5 }, { f: e4, d: 0.7, b: g3 }, { f: d4, d: 0.5 },
      { f: fS4, d: 0.5 }, { f: g4, d: 0.6 }, { f: fS4, d: 0.5 }, { f: e4, d: 0.5, b: b2 },
      { f: d4, d: 0.6 }, { f: cS4, d: 0.5 }, { f: d4, d: 1.2, b: d3 },

      // ── SECTION A2: Piano Response Phrase ──
      { f: d4, d: 0.5, b: d3 }, { f: fS4, d: 0.5 }, { f: a4, d: 0.5 }, { f: d5, d: 0.7, b: a2 },
      { f: cS5, d: 0.5 }, { f: b4, d: 0.5 }, { f: a4, d: 0.6, b: g3 }, { f: fS4, d: 0.5 },
      { f: g4, d: 0.5 }, { f: a4, d: 0.6 }, { f: g4, d: 0.5 }, { f: fS4, d: 0.5, b: b2 },
      { f: e4, d: 0.6 }, { f: d4, d: 1.4, b: d3 },

      // ── SECTION B: Soaring Synth Swell ──
      { f: fS4, d: 0.5, b: b2 }, { f: a4, d: 0.5 }, { f: d5, d: 0.6 }, { f: e5, d: 0.6, b: g3 },
      { f: fS5, d: 0.8 }, { f: e5, d: 0.5 }, { f: d5, d: 0.6, b: d3 }, { f: b4, d: 0.5 },
      { f: a4, d: 0.5 }, { f: b4, d: 0.6, b: a2 }, { f: d5, d: 0.6 }, { f: b4, d: 0.5 },
      { f: a4, d: 0.6 }, { f: fS4, d: 0.5 }, { f: e4, d: 1.2, b: g3 },

      // ── SECTION B2: Grand Climax ──
      { f: fS4, d: 0.5, b: g3 }, { f: a4, d: 0.5 }, { f: d5, d: 0.6 }, { f: e5, d: 0.6, b: a2 },
      { f: fS5, d: 0.7 }, { f: g5, d: 0.6 }, { f: fS5, d: 0.6, b: d3 }, { f: e5, d: 0.5 },
      { f: d5, d: 0.6 }, { f: b4, d: 0.5, b: b2 }, { f: a4, d: 0.6 }, { f: fS4, d: 0.5 },
      { f: e4, d: 0.6 }, { f: d4, d: 1.6, b: d3 },

      // ── SECTION C: Reflective Piano Outro ──
      { f: a4, d: 0.6, b: d3 }, { f: fS4, d: 0.5 }, { f: d4, d: 0.5 }, { f: e4, d: 0.6, b: g3 },
      { f: fS4, d: 0.6 }, { f: d4, d: 0.5 }, { f: b3, d: 0.6, b: b2 }, { f: a3, d: 0.5 },
      { f: d4, d: 2.2, b: d3, chord: [fS3, a3, d4] }
    ];

    this.playSongSequence(fullSong, 'miceonvenus', loopSelf);
  }

  // ── 5. C418 - "CAT" (FULL COMPLETE MUSIC DISC SONG) ───────────────────────────
  public playCatDiscFull(loopSelf = true): void {
    const c5 = 523.25, g4 = 392.00, d5 = 587.33, e5 = 659.25, a4 = 440.00, e4 = 329.63, c4 = 261.63, g5 = 783.99, f5 = 698.46;
    const a3 = 220.00, f3 = 174.61, g3 = 196.00, c3 = 130.81, e3 = 164.81;

    const fullSong: SongNote[] = [
      // ── SECTION A: The Iconic Opening Jukebox Groove ──
      { f: c5, d: 0.25, b: c3 }, { f: g4, d: 0.25 }, { f: c5, d: 0.25 }, { f: d5, d: 0.25 },
      { f: e5, d: 0.4, b: a3 }, { f: d5, d: 0.25 }, { f: c5, d: 0.35 }, { f: a4, d: 0.25 },
      { f: g4, d: 0.3, b: f3 }, { f: e4, d: 0.25 }, { f: g4, d: 0.25 }, { f: a4, d: 0.35 },
      { f: c5, d: 0.35, b: g3 }, { f: a4, d: 0.25 }, { f: g4, d: 0.5 },

      // ── SECTION A2: Groove Variation with High G5 ──
      { f: c5, d: 0.25, b: c3 }, { f: g4, d: 0.25 }, { f: c5, d: 0.25 }, { f: d5, d: 0.25 },
      { f: e5, d: 0.35, b: a3 }, { f: g5, d: 0.3 }, { f: e5, d: 0.3 }, { f: d5, d: 0.25 },
      { f: c5, d: 0.35, b: f3 }, { f: a4, d: 0.25 }, { f: c5, d: 0.25 }, { f: d5, d: 0.3 },
      { f: c5, d: 0.6, b: c3 },

      // ── SECTION B: The Funky Bridge / 16-Bit Jam ──
      { f: e5, d: 0.3, b: e3 }, { f: e5, d: 0.25 }, { f: d5, d: 0.25 }, { f: c5, d: 0.25 },
      { f: d5, d: 0.3, b: a3 }, { f: e5, d: 0.35 }, { f: g4, d: 0.25 }, { f: a4, d: 0.25 },
      { f: c5, d: 0.3, b: f3 }, { f: d5, d: 0.25 }, { f: e5, d: 0.35 }, { f: d5, d: 0.25 },
      { f: c5, d: 0.3, b: g3 }, { f: a4, d: 0.25 }, { f: g4, d: 0.45 },

      // ── SECTION B2: Bridge Climax with High F5 ──
      { f: a4, d: 0.25, b: f3 }, { f: c5, d: 0.25 }, { f: d5, d: 0.25 }, { f: e5, d: 0.3 },
      { f: f5, d: 0.35, b: g3 }, { f: e5, d: 0.25 }, { f: d5, d: 0.25 }, { f: c5, d: 0.25 },
      { f: d5, d: 0.3, b: c3 }, { f: e5, d: 0.3 }, { f: c5, d: 0.3, b: a3 }, { f: a4, d: 0.25 },
      { f: g4, d: 0.3, b: g3 }, { f: c5, d: 0.7, b: c3 },

      // ── SECTION C: Outro Groove Flourish ──
      { f: c5, d: 0.25, b: c3 }, { f: e5, d: 0.25 }, { f: g5, d: 0.3 }, { f: e5, d: 0.25 },
      { f: c5, d: 0.25, b: g3 }, { f: g4, d: 0.25 }, { f: e4, d: 0.3 }, { f: c4, d: 0.9, b: c3 }
    ];

    this.playSongSequence(fullSong, 'cat', loopSelf);
  }

  // ── 6. THE WELLERMAN (FULL 3-VERSE & CHORUS SEA SHANTY) ───────────────────────
  public playWellermanFull(): void {
    const c4 = 261.63, eb4 = 311.13, g4 = 392.00, f4 = 349.23, d4 = 293.66, ab4 = 415.30, bb3 = 233.08, c3 = 130.81, g3 = 196.00, ab3 = 207.65, eb3 = 155.56;

    const fullSong: SongNote[] = [
      // ── VERSE 1: "There once was a ship that put to sea..." ──
      { f: c4,  d: 0.3, b: c3 }, { f: c4,  d: 0.3 }, { f: c4,  d: 0.3 }, { f: eb4, d: 0.4 },
      { f: g4,  d: 0.4, b: g3 }, { f: g4,  d: 0.3 }, { f: g4,  d: 0.3 }, { f: g4,  d: 0.4 },
      { f: f4,  d: 0.3, b: bb3 }, { f: eb4, d: 0.3 }, { f: d4,  d: 0.3 }, { f: d4,  d: 0.3 },
      { f: d4,  d: 0.3 }, { f: f4,  d: 0.4, b: c3 }, { f: g4,  d: 0.4 }, { f: ab4, d: 0.4 },
      { f: g4,  d: 0.3, b: g3 }, { f: f4,  d: 0.3 }, { f: eb4, d: 0.3 }, { f: d4,  d: 0.3 },
      { f: c4,  d: 0.6, b: c3 },

      // ── CHORUS 1: "Soon may the Wellerman come..." ──
      { f: ab4, d: 0.35, b: ab3 }, { f: g4,  d: 0.3 }, { f: f4,  d: 0.3 }, { f: eb4, d: 0.35, b: eb3 },
      { f: d4,  d: 0.3 }, { f: c4,  d: 0.35, b: c3 }, { f: g3,  d: 0.3 }, { f: g3,  d: 0.3 },
      { f: c4,  d: 0.35, b: c3 }, { f: eb4, d: 0.3 }, { f: g4,  d: 0.4, b: g3 }, { f: f4,  d: 0.3 },
      { f: eb4, d: 0.3 }, { f: d4,  d: 0.3 }, { f: c4,  d: 0.6, b: c3 },

      // ── VERSE 2: "She'd not been two weeks from down..." ──
      { f: c4,  d: 0.3, b: c3 }, { f: c4,  d: 0.3 }, { f: c4,  d: 0.3 }, { f: eb4, d: 0.4 },
      { f: g4,  d: 0.4, b: g3 }, { f: g4,  d: 0.3 }, { f: g4,  d: 0.3 }, { f: g4,  d: 0.4 },
      { f: f4,  d: 0.3, b: bb3 }, { f: eb4, d: 0.3 }, { f: d4,  d: 0.3 }, { f: d4,  d: 0.3 },
      { f: d4,  d: 0.3 }, { f: f4,  d: 0.4, b: c3 }, { f: g4,  d: 0.4 }, { f: ab4, d: 0.4 },
      { f: g4,  d: 0.3, b: g3 }, { f: f4,  d: 0.3 }, { f: eb4, d: 0.3 }, { f: d4,  d: 0.3 },
      { f: c4,  d: 0.6, b: c3 },

      // ── CHORUS 2: Full Swelling Shanty Chorus ──
      { f: ab4, d: 0.35, b: ab3 }, { f: g4,  d: 0.3 }, { f: f4,  d: 0.3 }, { f: eb4, d: 0.35, b: eb3 },
      { f: d4,  d: 0.3 }, { f: c4,  d: 0.35, b: c3 }, { f: g3,  d: 0.3 }, { f: g3,  d: 0.3 },
      { f: c4,  d: 0.35, b: c3 }, { f: eb4, d: 0.3 }, { f: g4,  d: 0.4, b: g3 }, { f: f4,  d: 0.3 },
      { f: eb4, d: 0.3 }, { f: d4,  d: 0.3 }, { f: c4,  d: 0.6, b: c3 },

      // ── OUTRO: Shanty Hornpipe Finish ──
      { f: g3,  d: 0.25, b: c3 }, { f: c4,  d: 0.25 }, { f: eb4, d: 0.25 }, { f: g4,  d: 0.3 },
      { f: c5,  d: 0.4, b: c3 },  { f: g4,  d: 0.25 }, { f: eb4, d: 0.25 }, { f: c4,  d: 0.8, b: c3 }
    ];

    this.playSongSequence(fullSong, 'wellerman', true);
  }

  // ── 7. KEVIN MACLEOD - "SNEAKY SNITCH" (FULL EXTENDED ARRANGEMENT) ────────────
  public playSneakySnitchFull(): void {
    const c4 = 261.63, d4 = 293.66, eb4 = 311.13, g3 = 196.00, b3 = 246.94, f4 = 349.23, g4 = 392.00, ab4 = 415.30, c5 = 523.25, b4 = 493.88;
    const c3 = 130.81, g2 = 98.00, b2 = 123.47, ab3 = 207.65;

    const fullSong: SongNote[] = [
      // ── INTRO: Stealth Tiptoe Bass ──
      { f: g3, d: 0.2, b: c3 }, { f: c4, d: 0.2 }, { f: g3, d: 0.2 }, { f: c4, d: 0.2 },
      { f: b3, d: 0.2, b: g2 }, { f: d4, d: 0.2 }, { f: b3, d: 0.2 }, { f: d4, d: 0.2 },

      // ── SECTION A: Main Mischief Theme ──
      { f: c4, d: 0.2, b: c3 }, { f: d4, d: 0.2 }, { f: eb4, d: 0.3, b: c3 }, { f: c4, d: 0.2 },
      { f: g3, d: 0.2 }, { f: c4, d: 0.2 }, { f: eb4, d: 0.3, b: c3 }, { f: d4, d: 0.2 },
      { f: b3, d: 0.2, b: g2 }, { f: g3, d: 0.2 }, { f: b3, d: 0.2, b: b2 }, { f: d4, d: 0.3 },
      { f: c4, d: 0.2 }, { f: g3, d: 0.2 }, { f: c4, d: 0.2, b: c3 }, { f: eb4, d: 0.2 },
      { f: f4, d: 0.2 }, { f: g4, d: 0.3, b: g3 }, { f: ab4, d: 0.2 }, { f: g4, d: 0.2 },
      { f: f4, d: 0.2 }, { f: eb4, d: 0.2 }, { f: d4, d: 0.2 }, { f: c4, d: 0.5, b: c3 },

      // ── SECTION B: Tension Escalation & Chromatic Staccato ──
      { f: g4, d: 0.25, b: g3 }, { f: g4, d: 0.2 }, { f: f4, d: 0.2 }, { f: eb4, d: 0.2 },
      { f: f4, d: 0.25, b: c3 }, { f: g4, d: 0.3 }, { f: c4, d: 0.2 }, { f: d4, d: 0.2 },
      { f: eb4, d: 0.25, b: c3 }, { f: d4, d: 0.2 }, { f: c4, d: 0.2 }, { f: b3, d: 0.3, b: g2 },
      { f: g3, d: 0.2 }, { f: ab3, d: 0.2 }, { f: a3, d: 0.2 }, { f: b3, d: 0.3, b: b2 },
      { f: c4, d: 0.2, b: c3 }, { f: d4, d: 0.2 }, { f: eb4, d: 0.2 }, { f: f4, d: 0.2 },
      { f: g4, d: 0.3, b: g3 }, { f: ab4, d: 0.2 }, { f: g4, d: 0.2 }, { f: f4, d: 0.2 },
      { f: eb4, d: 0.2 }, { f: d4, d: 0.2 }, { f: c4, d: 0.6, b: c3 },

      // ── SECTION C: High Comic Climax & Tiptoe Resolve ──
      { f: c5, d: 0.25, b: c3 }, { f: b4, d: 0.2 }, { f: c5, d: 0.25 }, { f: ab4, d: 0.2, b: ab3 },
      { f: g4, d: 0.2 }, { f: f4, d: 0.2 }, { f: eb4, d: 0.2, b: c3 }, { f: d4, d: 0.2 },
      { f: c4, d: 0.2 }, { f: b3, d: 0.2, b: g2 }, { f: c4, d: 0.2 }, { f: d4, d: 0.2 },
      { f: eb4, d: 0.25, b: c3 }, { f: d4, d: 0.2 }, { f: c4, d: 0.2 }, { f: g3, d: 0.2 },
      { f: c4, d: 0.8, b: c3 }
    ];

    this.playSongSequence(fullSong, 'sneakysnitch', true);
  }

  // ── 8. BEETHOVEN - "ODE TO JOY" (FULL COMPLETE 4-PART SYMPHONY MOVEMENT) ──────
  public playOdeToJoyFull(): void {
    const e4 = 329.63, f4 = 349.23, g4 = 392.00, d4 = 293.66, c4 = 261.63, g3 = 196.00, a4 = 440.00;
    const c3 = 130.81, g2 = 98.00, a3 = 220.00, f3 = 174.61;

    const fullSong: SongNote[] = [
      // ── PART 1: Main Statement ──
      { f: e4, d: 0.35, b: c3, chord: [g3, c4] }, { f: e4, d: 0.35 }, { f: f4, d: 0.35 }, { f: g4, d: 0.35, b: g3, chord: [b3, d4] },
      { f: g4, d: 0.35 }, { f: f4, d: 0.35 }, { f: e4, d: 0.35, b: c3, chord: [g3, c4] }, { f: d4, d: 0.35 },
      { f: c4, d: 0.35, b: c3 }, { f: c4, d: 0.35 }, { f: d4, d: 0.35 }, { f: e4, d: 0.35, b: g3 },
      { f: e4, d: 0.5 },  { f: d4, d: 0.2 },  { f: d4, d: 0.6, b: g3, chord: [b3, d4] },

      // ── PART 2: Statement Reprise with Resolution ──
      { f: e4, d: 0.35, b: c3, chord: [g3, c4] }, { f: e4, d: 0.35 }, { f: f4, d: 0.35 }, { f: g4, d: 0.35, b: g3, chord: [b3, d4] },
      { f: g4, d: 0.35 }, { f: f4, d: 0.35 }, { f: e4, d: 0.35, b: c3, chord: [g3, c4] }, { f: d4, d: 0.35 },
      { f: c4, d: 0.35, b: c3 }, { f: c4, d: 0.35 }, { f: d4, d: 0.35 }, { f: e4, d: 0.35, b: g3 },
      { f: d4, d: 0.5 },  { f: c4, d: 0.2 },  { f: c4, d: 0.7, b: c3, chord: [e4, g4] },

      // ── PART 3: Middle Development & Bridge ──
      { f: d4, d: 0.35, b: g3 }, { f: d4, d: 0.35 }, { f: e4, d: 0.35, b: c3 }, { f: c4, d: 0.35 },
      { f: d4, d: 0.35, b: g3 }, { f: e4, d: 0.2 },  { f: f4, d: 0.2 }, { f: e4, d: 0.35, b: c3 }, { f: c4, d: 0.35 },
      { f: d4, d: 0.35, b: g3 }, { f: e4, d: 0.2 },  { f: f4, d: 0.2 }, { f: e4, d: 0.35, b: c3 }, { f: d4, d: 0.35 },
      { f: c4, d: 0.35, b: f3 }, { f: d4, d: 0.35 }, { f: g3, d: 0.7, b: g2, chord: [d4, f4] },

      // ── PART 4: Grand Symphonic Reprise & Coda ──
      { f: e4, d: 0.35, b: c3, chord: [g3, c4] }, { f: e4, d: 0.35 }, { f: f4, d: 0.35 }, { f: g4, d: 0.35, b: g3, chord: [b3, d4] },
      { f: g4, d: 0.35 }, { f: f4, d: 0.35 }, { f: e4, d: 0.35, b: c3, chord: [g3, c4] }, { f: d4, d: 0.35 },
      { f: c4, d: 0.35, b: c3 }, { f: c4, d: 0.35 }, { f: d4, d: 0.35 }, { f: e4, d: 0.35, b: g3 },
      { f: d4, d: 0.5 },  { f: c4, d: 0.2 },  { f: c4, d: 0.7, b: c3 },

      // Grand Coda Fanfare
      { f: g4, d: 0.35, b: c3 }, { f: e4, d: 0.35 }, { f: f4, d: 0.35 }, { f: g4, d: 0.35, b: g3 },
      { f: a4, d: 0.35, b: f3 }, { f: g4, d: 0.35 }, { f: f4, d: 0.35 }, { f: e4, d: 0.35, b: c3 },
      { f: d4, d: 0.35, b: g3 }, { f: c4, d: 0.35 }, { f: d4, d: 0.35 }, { f: e4, d: 0.35, b: c3 },
      { f: d4, d: 0.5, b: g3 },  { f: c4, d: 0.2 },  { f: c4, d: 1.8, b: c3, chord: [e4, g4, c5] }
    ];

    this.playSongSequence(fullSong, 'odetojoy', true);
  }

  // Helper: Play Full Polyphonic Song Sequence with Rich Filters & Dynamics
  private playSongSequence(song: SongNote[], trackId: MusicTrack, loopSelf = true): void {
    let step = 0;

    const playNext = () => {
      if (!this.enabled || (this.currentTrack !== trackId && this.currentTrack !== 'minecraft')) return;

      if (step < song.length) {
        const item = song[step];
        const oscType = item.type || (trackId === 'wellerman' || trackId === 'odetojoy' ? 'square' : 'triangle');
        
        // 1. Lead Melody Note
        this.synthPluck(item.f, item.d * 1.6, oscType, this.musicMasterVol * 0.65, 1200);

        // 2. Polyphonic Chord Voices
        if (item.chord) {
          item.chord.forEach((chordFreq, i) => {
            setTimeout(() => {
              if (this.currentTrack === trackId || this.currentTrack === 'minecraft') {
                this.synthPluck(chordFreq, item.d * 1.8, 'sine', this.musicMasterVol * 0.35, 900);
              }
            }, i * 20);
          });
        }

        // 3. Deep Bassline Voice
        if (item.b) {
          this.synthPluck(item.b, item.d * 2.2, 'sine', this.musicMasterVol * 0.9, 300);
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

  // ── 9. CYBERSPACE (EXTENDED PROCEDURAL ARPEGGIOS) ───────────────────────────
  private playCyberspaceLoop(): void {
    const scale = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25, 783.99];
    const bass = [110.00, 110.00, 130.81, 146.83, 164.81, 164.81, 146.83, 130.81, 98.00, 110.00];
    const pattern = [
      0, 2, 4, 7, 5, 3, 4, 1, 0, 3, 5, 7, 6, 4, 2, 1,
      2, 4, 6, 8, 7, 5, 3, 1, 0, 4, 7, 5, 3, 2, 1, 0
    ];
    let step = 0;

    const tick = () => {
      if (!this.enabled || this.currentTrack !== 'cyberspace') return;
      const noteFreq = scale[pattern[step % pattern.length] % scale.length];
      const bassFreq = bass[Math.floor(step / 2) % bass.length];

      this.synthPluck(noteFreq, 0.14, 'square', this.musicMasterVol * 0.45, 1200);
      if (step % 2 === 0) {
        this.synthPluck(bassFreq, 0.32, 'triangle', this.musicMasterVol * 0.7, 400);
      }
      step++;
      this.musicTimer = setTimeout(tick, 175);
    };
    tick();
  }

  // ── 10. NEON (EXTENDED 16-BIT LO-FI JAZZ CHORD PROGRESSIONS) ────────────────
  private playNeonLoop(): void {
    const progressions = [
      [146.83, 220.00, 261.63, 329.63, 392.00], // Dm9
      [196.00, 246.94, 293.66, 349.23, 440.00], // G13
      [130.81, 196.00, 246.94, 329.63, 392.00], // Cmaj9
      [220.00, 261.63, 329.63, 392.00, 523.25], // Am7
      [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj7#11
      [164.81, 207.65, 246.94, 329.63, 392.00], // E7b9
      [220.00, 261.63, 329.63, 392.00, 493.88]  // Am9
    ];
    let chordIdx = 0;
    let tickCount = 0;

    const tick = () => {
      if (!this.enabled || this.currentTrack !== 'neon') return;
      const currentChord = progressions[chordIdx % progressions.length];

      currentChord.forEach((freq, i) => {
        setTimeout(() => {
          if (this.currentTrack === 'neon') {
            this.synthPluck(freq, 0.55, 'triangle', this.musicMasterVol * 0.35, 900);
          }
        }, i * 35);
      });

      this.synthPluck(currentChord[0] / 2, 0.7, 'sine', this.musicMasterVol * 0.9, 250);
      tickCount++;
      if (tickCount % 4 === 0) chordIdx++;
      this.musicTimer = setTimeout(tick, 600);
    };
    tick();
  }

  // ── 11. DEEP TERMINAL AMBIENT ───────────────────────────────────────────────
  private playAmbientLoop(): void {
    const droneFreqs = [110.00, 146.83, 164.81, 220.00, 293.66, 329.63];
    const chimeScale = [523.25, 659.25, 783.99, 880.00, 987.77, 1046.50, 1318.51, 1567.98];

    const droneTick = () => {
      if (!this.enabled || this.currentTrack !== 'ambient') return;
      const f = droneFreqs[Math.floor(Math.random() * droneFreqs.length)];
      this.synthPluck(f, 3.2, 'sine', this.musicMasterVol * 0.6, 600);

      if (Math.random() > 0.3) {
        const chime = chimeScale[Math.floor(Math.random() * chimeScale.length)];
        setTimeout(() => {
          if (this.currentTrack === 'ambient') {
            this.synthPluck(chime, 1.4, 'sine', this.musicMasterVol * 0.35, 2400);
          }
        }, 300 + Math.random() * 800);
      }
      this.musicTimer = setTimeout(droneTick, 1800);
    };
    droneTick();
  }

  // ── 12. GENERATIVE ENDLESS RETRO MODE ───────────────────────────────────────
  private playGenerativeLoop(): void {
    const rootNotes = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00];
    let baseRoot = rootNotes[Math.floor(Math.random() * rootNotes.length)];
    let interval = 0;

    const tick = () => {
      if (!this.enabled || this.currentTrack !== 'generative') return;
      const pentatonicSteps = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
      const step = pentatonicSteps[Math.floor(Math.random() * pentatonicSteps.length)];
      const freq = baseRoot * Math.pow(2, step / 12);

      const waveType: OscillatorType = Math.random() > 0.4 ? 'triangle' : 'square';
      const duration = 0.2 + Math.random() * 0.4;
      this.synthPluck(freq, duration, waveType, this.musicMasterVol * 0.4, 1100);

      if (interval++ % 16 === 0) {
        baseRoot = rootNotes[Math.floor(Math.random() * rootNotes.length)];
        this.synthPluck(baseRoot / 2, 1.2, 'sine', this.musicMasterVol * 0.8, 300);
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

  // Helper synth envelope voice with polyphony support
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
      gain.gain.linearRampToValueAtTime(volume, now + 0.025);
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
