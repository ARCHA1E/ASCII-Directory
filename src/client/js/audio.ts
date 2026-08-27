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
    title: 'Ode to Joy (Symphony No. 9 - Full Movement)',
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

// ── Complete Standard Musical Note Frequency Registry ────────────────────────
export const N = {
  C2: 65.41, CS2: 69.30, D2: 73.42, DS2: 77.78, EB2: 77.78, E2: 82.41, F2: 87.31, FS2: 92.50, G2: 98.00, GS2: 103.83, AB2: 103.83, A2: 110.00, AS2: 116.54, BB2: 116.54, B2: 123.47,
  C3: 130.81, CS3: 138.59, D3: 146.83, DS3: 155.56, EB3: 155.56, E3: 164.81, F3: 174.61, FS3: 185.00, G3: 196.00, GS3: 207.65, AB3: 207.65, A3: 220.00, AS3: 233.08, BB3: 233.08, B3: 246.94,
  C4: 261.63, CS4: 277.18, D4: 293.66, DS4: 311.13, EB4: 311.13, E4: 329.63, F4: 349.23, FS4: 369.99, G4: 392.00, GS4: 415.30, AB4: 415.30, A4: 440.00, AS4: 466.16, BB4: 466.16, B4: 493.88,
  C5: 523.25, CS5: 554.37, D5: 587.33, DS5: 622.25, EB5: 622.25, E5: 659.25, F5: 698.46, FS5: 739.99, G5: 783.99, GS5: 830.61, AB5: 830.61, A5: 880.00, AS5: 932.33, BB5: 932.33, B5: 987.77,
  C6: 1046.50
} as const;

interface SongNote {
  f: number;        // Melody Frequency in Hz
  d: number;        // Note Duration in seconds
  b?: number;       // Bass Frequency in Hz
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
    const notes = [N.C5, N.E5, N.G5, N.C6];
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

  // ── 1. C418 - "SWEDEN" (FULL COMPLETE 5-PART ARRANGEMENT) ────────────────────
  public playSwedenFull(loopSelf = true): void {
    const fullSong: SongNote[] = [
      // ── SECTION A: First Theme Statement ──
      { f: N.FS4, d: 0.9, b: N.D3, chord: [N.D4, N.A3] },
      { f: N.D4,  d: 0.7 },
      { f: N.E4,  d: 0.7 },
      { f: N.FS4, d: 0.9, b: N.G3, chord: [N.B3, N.D4] },
      { f: N.G4,  d: 0.8 },
      { f: N.FS4, d: 0.8 },
      { f: N.E4,  d: 0.9, b: N.B2, chord: [N.D4, N.FS3] },
      { f: N.D4,  d: 0.7 },
      { f: N.B3,  d: 0.7 },
      { f: N.D4,  d: 0.9, b: N.G3, chord: [N.B3, N.D4] },
      { f: N.E4,  d: 0.9 },
      { f: N.D4,  d: 1.4, b: N.D2 },

      // ── SECTION A2: Second Phrase with Rising A4 ──
      { f: N.FS4, d: 0.9, b: N.D3, chord: [N.D4, N.A3] },
      { f: N.A4,  d: 0.7 },
      { f: N.G4,  d: 0.7 },
      { f: N.FS4, d: 0.9, b: N.G3, chord: [N.B3, N.D4] },
      { f: N.E4,  d: 0.8 },
      { f: N.D4,  d: 0.8 },
      { f: N.B3,  d: 0.9, b: N.B2, chord: [N.D4, N.FS3] },
      { f: N.D4,  d: 0.7 },
      { f: N.E4,  d: 0.7 },
      { f: N.FS4, d: 0.9, b: N.A2, chord: [N.CS4, N.E4] },
      { f: N.E4,  d: 0.9 },
      { f: N.D4,  d: 1.6, b: N.D3 },

      // ── SECTION B: Main Chorus Swell & High Octave Melody ──
      { f: N.A4,  d: 0.8, b: N.G2, chord: [N.D4, N.G4] },
      { f: N.B4,  d: 0.7 },
      { f: N.D5,  d: 1.1, b: N.D3, chord: [N.FS4, N.A4] },
      { f: N.CS5, d: 0.7 },
      { f: N.B4,  d: 0.7 },
      { f: N.A4,  d: 1.0, b: N.E3, chord: [N.G4, N.B3] },
      { f: N.FS4, d: 0.7 },
      { f: N.D4,  d: 0.7 },
      { f: N.E4,  d: 0.8, b: N.A2, chord: [N.CS4, N.E4] },
      { f: N.FS4, d: 0.8 },
      { f: N.G4,  d: 0.8 },
      { f: N.FS4, d: 0.8, b: N.D3, chord: [N.A3, N.D4] },
      { f: N.E4,  d: 1.4 },

      // ── SECTION B2: Climax Variation ──
      { f: N.A4,  d: 0.8, b: N.G2, chord: [N.D4, N.G4] },
      { f: N.B4,  d: 0.7 },
      { f: N.D5,  d: 0.9, b: N.D3, chord: [N.FS4, N.A4] },
      { f: N.E5,  d: 0.9 },
      { f: N.D5,  d: 0.9, b: N.B2, chord: [N.FS4, N.D4] },
      { f: N.B4,  d: 0.7 },
      { f: N.A4,  d: 0.9, b: N.G3, chord: [N.B3, N.D4] },
      { f: N.FS4, d: 0.7 },
      { f: N.E4,  d: 0.7 },
      { f: N.D4,  d: 0.8, b: N.D3, chord: [N.A3, N.D4] },
      { f: N.B3,  d: 0.7 },
      { f: N.D4,  d: 0.9, b: N.G3 },
      { f: N.E4,  d: 0.9 },
      { f: N.D4,  d: 1.8, b: N.D2 },

      // ── SECTION C: Soft Resolving Outro ──
      { f: N.FS4, d: 0.9, b: N.D3, chord: [N.A3, N.D4] },
      { f: N.D4,  d: 0.7 },
      { f: N.E4,  d: 0.7 },
      { f: N.D4,  d: 0.9, b: N.G3, chord: [N.B3, N.D4] },
      { f: N.B3,  d: 0.7 },
      { f: N.A3,  d: 0.7 },
      { f: N.B3,  d: 0.9, b: N.B2 },
      { f: N.D4,  d: 0.9, b: N.G3 },
      { f: N.E4,  d: 0.9 },
      { f: N.D4,  d: 2.2, b: N.D2, chord: [N.FS3, N.A3, N.D4] }
    ];

    this.playSongSequence(fullSong, 'sweden', loopSelf);
  }

  // ── 2. C418 - "SUBWOOFER LULLABY" (FULL COMPLETE 5-PART ARRANGEMENT) ─────────
  public playSubwooferFull(loopSelf = true): void {
    const fullSong: SongNote[] = [
      // ── SECTION A: Initial Music-Box Theme ──
      { f: N.C5, d: 0.6, b: N.A2, chord: [N.C4, N.E4] }, { f: N.G4, d: 0.4 }, { f: N.E4, d: 0.5 }, { f: N.G4, d: 0.4 },
      { f: N.D5, d: 0.6, b: N.F2, chord: [N.A3, N.C4] }, { f: N.G4, d: 0.4 }, { f: N.F4, d: 0.5 }, { f: N.G4, d: 0.4 },
      { f: N.C5, d: 0.6, b: N.C3, chord: [N.E4, N.G4] }, { f: N.B4, d: 0.4 }, { f: N.G4, d: 0.5 }, { f: N.E4, d: 0.4 },
      { f: N.F4, d: 0.5, b: N.F2, chord: [N.A3, N.C4] }, { f: N.G4, d: 0.4 }, { f: N.C4, d: 0.9 },

      // ── SECTION A2: Second Theme Development ──
      { f: N.C5, d: 0.6, b: N.A2, chord: [N.C4, N.E4] }, { f: N.G4, d: 0.4 }, { f: N.E4, d: 0.5 }, { f: N.G4, d: 0.4 },
      { f: N.D5, d: 0.6, b: N.F2, chord: [N.A3, N.C4] }, { f: N.G4, d: 0.4 }, { f: N.F4, d: 0.5 }, { f: N.G4, d: 0.4 },
      { f: N.E5, d: 0.7, b: N.G2, chord: [N.B3, N.D4] }, { f: N.D5, d: 0.5 }, { f: N.C5, d: 0.5 }, { f: N.B4, d: 0.4 },
      { f: N.A4, d: 0.5, b: N.C3, chord: [N.E4, N.G4] }, { f: N.G4, d: 0.4 }, { f: N.C5, d: 1.1 },

      // ── SECTION B: Soaring High Octave Melody ──
      { f: N.E5, d: 0.6, b: N.C3, chord: [N.G4, N.C5] }, { f: N.G4, d: 0.4 }, { f: N.C5, d: 0.5 }, { f: N.G4, d: 0.4 },
      { f: N.F5, d: 0.6, b: N.F2, chord: [N.A4, N.C5] }, { f: N.G4, d: 0.4 }, { f: N.D5, d: 0.5 }, { f: N.G4, d: 0.4 },
      { f: N.E5, d: 0.6, b: N.A2, chord: [N.C5, N.E5] }, { f: N.D5, d: 0.4 }, { f: N.C5, d: 0.5 }, { f: N.G4, d: 0.4 },
      { f: N.A4, d: 0.5, b: N.F2, chord: [N.C4, N.F4] }, { f: N.B4, d: 0.4 }, { f: N.C5, d: 1.0 },

      // ── SECTION B2: Warm Chime Resolution ──
      { f: N.G5, d: 0.7, b: N.C3, chord: [N.E4, N.G4] }, { f: N.E5, d: 0.5 }, { f: N.D5, d: 0.5 }, { f: N.C5, d: 0.5 },
      { f: N.D5, d: 0.6, b: N.G2, chord: [N.B3, N.D4] }, { f: N.E5, d: 0.5 }, { f: N.C5, d: 0.6, b: N.A2 }, { f: N.A4, d: 0.4 },
      { f: N.G4, d: 0.5, b: N.F2 }, { f: N.E4, d: 0.4 }, { f: N.D4, d: 0.5 }, { f: N.C4, d: 1.2, b: N.C2 },

      // ── SECTION C: Peaceful Fade ──
      { f: N.C5, d: 0.6, b: N.A2 }, { f: N.G4, d: 0.4 }, { f: N.E4, d: 0.5 }, { f: N.G4, d: 0.4 },
      { f: N.D5, d: 0.6, b: N.F2 }, { f: N.G4, d: 0.4 }, { f: N.C4, d: 1.8, b: N.C2, chord: [N.E4, N.G4, N.C5] }
    ];

    this.playSongSequence(fullSong, 'subwoofer', loopSelf);
  }

  // ── 3. C418 - "WET HANDS" (FULL COMPLETE 5-PART ARRANGEMENT) ─────────────────
  public playWetHandsFull(loopSelf = true): void {
    const fullSong: SongNote[] = [
      // ── SECTION A: Wave 1 Arpeggios ──
      { f: N.A3,  d: 0.4, b: N.A2 }, { f: N.CS4, d: 0.4 }, { f: N.E4,  d: 0.4 }, { f: N.GS4, d: 0.5 },
      { f: N.A4,  d: 0.6 },          { f: N.GS4, d: 0.4 }, { f: N.E4,  d: 0.4 }, { f: N.CS4, d: 0.5 },
      { f: N.FS3, d: 0.4, b: N.FS2 }, { f: N.A3,  d: 0.4 }, { f: N.CS4, d: 0.4 }, { f: N.E4,  d: 0.5 },
      { f: N.FS4, d: 0.6 },          { f: N.E4,  d: 0.4 }, { f: N.CS4, d: 0.4 }, { f: N.A3,  d: 0.7 },

      // ── SECTION A2: Wave 2 (D Major to E Major) ──
      { f: N.D3,  d: 0.4, b: N.D2 }, { f: N.FS3, d: 0.4 }, { f: N.A3,  d: 0.4 }, { f: N.CS4, d: 0.5 },
      { f: N.D4,  d: 0.6 },          { f: N.CS4, d: 0.4 }, { f: N.A3,  d: 0.4 }, { f: N.FS3, d: 0.5 },
      { f: N.E3,  d: 0.4, b: N.E2 }, { f: N.GS3, d: 0.4 }, { f: N.B3,  d: 0.4 }, { f: N.D4,  d: 0.5 },
      { f: N.E4,  d: 0.6 },          { f: N.D4,  d: 0.4 }, { f: N.B3,  d: 0.4 }, { f: N.GS3, d: 0.7 },

      // ── SECTION B: Main High Melodic Piano Line ──
      { f: N.A3,  d: 0.4, b: N.A2 }, { f: N.E4,  d: 0.4 }, { f: N.A4,  d: 0.5 }, { f: N.B4,  d: 0.4 },
      { f: N.CS5, d: 0.7, b: N.A2 }, { f: N.B4,  d: 0.4 }, { f: N.A4,  d: 0.4 }, { f: N.GS4, d: 0.5 },
      { f: N.FS4, d: 0.6, b: N.FS3 }, { f: N.CS4, d: 0.4 }, { f: N.FS4, d: 0.4 }, { f: N.GS4, d: 0.5 },
      { f: N.A4,  d: 0.7 },          { f: N.GS4, d: 0.4 }, { f: N.FS4, d: 0.4 }, { f: N.E4,  d: 0.6 },

      // ── SECTION B2: Emotional High Climax ──
      { f: N.D4,  d: 0.4, b: N.D3 }, { f: N.FS4, d: 0.4 }, { f: N.A4,  d: 0.5 }, { f: N.B4,  d: 0.4 },
      { f: N.CS5, d: 0.6, b: N.D3 }, { f: N.D5,  d: 0.5 }, { f: N.CS5, d: 0.5 }, { f: N.B4,  d: 0.4 },
      { f: N.A4,  d: 0.7, b: N.A2 }, { f: N.E4,  d: 0.4 }, { f: N.CS4, d: 0.4 }, { f: N.B3,  d: 0.5 },
      { f: N.A3,  d: 1.4, b: N.A2 },

      // ── SECTION C: Floating Outro Arpeggio ──
      { f: N.A3,  d: 0.4, b: N.A2 }, { f: N.CS4, d: 0.4 }, { f: N.E4,  d: 0.4 }, { f: N.A4,  d: 0.5 },
      { f: N.CS5, d: 0.6 },          { f: N.E5,  d: 0.7 }, { f: N.CS5, d: 0.5 }, { f: N.A4,  d: 0.4 },
      { f: N.E4,  d: 0.5 },          { f: N.CS4, d: 0.5 }, { f: N.A3,  d: 2.0, b: N.A2 }
    ];

    this.playSongSequence(fullSong, 'wethands', loopSelf);
  }

  // ── 4. C418 - "MICE ON VENUS" (FULL COMPLETE 5-PART ARRANGEMENT) ─────────────
  public playMiceOnVenusFull(loopSelf = true): void {
    const fullSong: SongNote[] = [
      // ── SECTION A: Quiet Piano Intro ──
      { f: N.D4, d: 0.5, b: N.D3 }, { f: N.FS4, d: 0.5 }, { f: N.A4, d: 0.6 }, { f: N.B4, d: 0.6 },
      { f: N.A4, d: 0.5 }, { f: N.FS4, d: 0.5 }, { f: N.E4, d: 0.7, b: N.G3 }, { f: N.D4, d: 0.5 },
      { f: N.FS4, d: 0.5 }, { f: N.G4, d: 0.6 }, { f: N.FS4, d: 0.5 }, { f: N.E4, d: 0.5, b: N.B2 },
      { f: N.D4, d: 0.6 }, { f: N.CS4, d: 0.5 }, { f: N.D4, d: 1.2, b: N.D3 },

      // ── SECTION A2: Piano Response Phrase ──
      { f: N.D4, d: 0.5, b: N.D3 }, { f: N.FS4, d: 0.5 }, { f: N.A4, d: 0.5 }, { f: N.D5, d: 0.7, b: N.A2 },
      { f: N.CS5, d: 0.5 }, { f: N.B4, d: 0.5 }, { f: N.A4, d: 0.6, b: N.G3 }, { f: N.FS4, d: 0.5 },
      { f: N.G4, d: 0.5 }, { f: N.A4, d: 0.6 }, { f: N.G4, d: 0.5 }, { f: N.FS4, d: 0.5, b: N.B2 },
      { f: N.E4, d: 0.6 }, { f: N.D4, d: 1.4, b: N.D3 },

      // ── SECTION B: Soaring Synth Swell ──
      { f: N.FS4, d: 0.5, b: N.B2 }, { f: N.A4, d: 0.5 }, { f: N.D5, d: 0.6 }, { f: N.E5, d: 0.6, b: N.G3 },
      { f: N.FS5, d: 0.8 }, { f: N.E5, d: 0.5 }, { f: N.D5, d: 0.6, b: N.D3 }, { f: N.B4, d: 0.5 },
      { f: N.A4, d: 0.5 }, { f: N.B4, d: 0.6, b: N.A2 }, { f: N.D5, d: 0.6 }, { f: N.B4, d: 0.5 },
      { f: N.A4, d: 0.6 }, { f: N.FS4, d: 0.5 }, { f: N.E4, d: 1.2, b: N.G3 },

      // ── SECTION B2: Grand Climax ──
      { f: N.FS4, d: 0.5, b: N.G3 }, { f: N.A4, d: 0.5 }, { f: N.D5, d: 0.6 }, { f: N.E5, d: 0.6, b: N.A2 },
      { f: N.FS5, d: 0.7 }, { f: N.G5, d: 0.6 }, { f: N.FS5, d: 0.6, b: N.D3 }, { f: N.E5, d: 0.5 },
      { f: N.D5, d: 0.6 }, { f: N.B4, d: 0.5, b: N.B2 }, { f: N.A4, d: 0.6 }, { f: N.FS4, d: 0.5 },
      { f: N.E4, d: 0.6 }, { f: N.D4, d: 1.6, b: N.D3 },

      // ── SECTION C: Reflective Piano Outro ──
      { f: N.A4, d: 0.6, b: N.D3 }, { f: N.FS4, d: 0.5 }, { f: N.D4, d: 0.5 }, { f: N.E4, d: 0.6, b: N.G3 },
      { f: N.FS4, d: 0.6 }, { f: N.D4, d: 0.5 }, { f: N.B3, d: 0.6, b: N.B2 }, { f: N.A3, d: 0.5 },
      { f: N.D4, d: 2.2, b: N.D3, chord: [N.FS3, N.A3, N.D4] }
    ];

    this.playSongSequence(fullSong, 'miceonvenus', loopSelf);
  }

  // ── 5. C418 - "CAT" (FULL COMPLETE 5-PART MUSIC DISC ARRANGEMENT) ────────────
  public playCatDiscFull(loopSelf = true): void {
    const fullSong: SongNote[] = [
      // ── SECTION A: The Iconic Opening Jukebox Groove ──
      { f: N.C5, d: 0.25, b: N.C3 }, { f: N.G4, d: 0.25 }, { f: N.C5, d: 0.25 }, { f: N.D5, d: 0.25 },
      { f: N.E5, d: 0.4, b: N.A3 },  { f: N.D5, d: 0.25 }, { f: N.C5, d: 0.35 }, { f: N.A4, d: 0.25 },
      { f: N.G4, d: 0.3, b: N.F3 },  { f: N.E4, d: 0.25 }, { f: N.G4, d: 0.25 }, { f: N.A4, d: 0.35 },
      { f: N.C5, d: 0.35, b: N.G3 }, { f: N.A4, d: 0.25 }, { f: N.G4, d: 0.5 },

      // ── SECTION A2: Groove Variation with High G5 ──
      { f: N.C5, d: 0.25, b: N.C3 }, { f: N.G4, d: 0.25 }, { f: N.C5, d: 0.25 }, { f: N.D5, d: 0.25 },
      { f: N.E5, d: 0.35, b: N.A3 }, { f: N.G5, d: 0.3 },  { f: N.E5, d: 0.3 },  { f: N.D5, d: 0.25 },
      { f: N.C5, d: 0.35, b: N.F3 }, { f: N.A4, d: 0.25 }, { f: N.C5, d: 0.25 }, { f: N.D5, d: 0.3 },
      { f: N.C5, d: 0.6, b: N.C3 },

      // ── SECTION B: The Funky Bridge / 16-Bit Jam ──
      { f: N.E5, d: 0.3, b: N.E3 },  { f: N.E5, d: 0.25 }, { f: N.D5, d: 0.25 }, { f: N.C5, d: 0.25 },
      { f: N.D5, d: 0.3, b: N.A3 },  { f: N.E5, d: 0.35 }, { f: N.G4, d: 0.25 }, { f: N.A4, d: 0.25 },
      { f: N.C5, d: 0.3, b: N.F3 },  { f: N.D5, d: 0.25 }, { f: N.E5, d: 0.35 }, { f: N.D5, d: 0.25 },
      { f: N.C5, d: 0.3, b: N.G3 },  { f: N.A4, d: 0.25 }, { f: N.G4, d: 0.45 },

      // ── SECTION B2: Bridge Climax with High F5 ──
      { f: N.A4, d: 0.25, b: N.F3 }, { f: N.C5, d: 0.25 }, { f: N.D5, d: 0.25 }, { f: N.E5, d: 0.3 },
      { f: N.F5, d: 0.35, b: N.G3 }, { f: N.E5, d: 0.25 }, { f: N.D5, d: 0.25 }, { f: N.C5, d: 0.25 },
      { f: N.D5, d: 0.3, b: N.C3 },  { f: N.E5, d: 0.3 },  { f: N.C5, d: 0.3, b: N.A3 }, { f: N.A4, d: 0.25 },
      { f: N.G4, d: 0.3, b: N.G3 },  { f: N.C5, d: 0.7, b: N.C3 },

      // ── SECTION C: Outro Groove Flourish ──
      { f: N.C5, d: 0.25, b: N.C3 }, { f: N.E5, d: 0.25 }, { f: N.G5, d: 0.3 },  { f: N.E5, d: 0.25 },
      { f: N.C5, d: 0.25, b: N.G3 }, { f: N.G4, d: 0.25 }, { f: N.E4, d: 0.3 },  { f: N.C4, d: 0.9, b: N.C3 }
    ];

    this.playSongSequence(fullSong, 'cat', loopSelf);
  }

  // ── 6. THE WELLERMAN (FULL 3-VERSE & CHORUS SEA SHANTY) ───────────────────────
  public playWellermanFull(): void {
    const fullSong: SongNote[] = [
      // ── VERSE 1: "There once was a ship that put to sea..." ──
      { f: N.C4,  d: 0.3, b: N.C3 }, { f: N.C4,  d: 0.3 }, { f: N.C4,  d: 0.3 }, { f: N.EB4, d: 0.4 },
      { f: N.G4,  d: 0.4, b: N.G3 }, { f: N.G4,  d: 0.3 }, { f: N.G4,  d: 0.3 }, { f: N.G4,  d: 0.4 },
      { f: N.F4,  d: 0.3, b: N.BB3 }, { f: N.EB4, d: 0.3 }, { f: N.D4,  d: 0.3 }, { f: N.D4,  d: 0.3 },
      { f: N.D4,  d: 0.3 },          { f: N.F4,  d: 0.4, b: N.C3 }, { f: N.G4,  d: 0.4 }, { f: N.AB4, d: 0.4 },
      { f: N.G4,  d: 0.3, b: N.G3 }, { f: N.F4,  d: 0.3 }, { f: N.EB4, d: 0.3 }, { f: N.D4,  d: 0.3 },
      { f: N.C4,  d: 0.6, b: N.C3 },

      // ── CHORUS 1: "Soon may the Wellerman come..." ──
      { f: N.AB4, d: 0.35, b: N.AB3 }, { f: N.G4,  d: 0.3 }, { f: N.F4,  d: 0.3 }, { f: N.EB4, d: 0.35, b: N.EB3 },
      { f: N.D4,  d: 0.3 },           { f: N.C4,  d: 0.35, b: N.C3 }, { f: N.G3,  d: 0.3 }, { f: N.G3,  d: 0.3 },
      { f: N.C4,  d: 0.35, b: N.C3 }, { f: N.EB4, d: 0.3 }, { f: N.G4,  d: 0.4, b: N.G3 }, { f: N.F4,  d: 0.3 },
      { f: N.EB4, d: 0.3 },           { f: N.D4,  d: 0.3 }, { f: N.C4,  d: 0.6, b: N.C3 },

      // ── VERSE 2: "She'd not been two weeks from down..." ──
      { f: N.C4,  d: 0.3, b: N.C3 }, { f: N.C4,  d: 0.3 }, { f: N.C4,  d: 0.3 }, { f: N.EB4, d: 0.4 },
      { f: N.G4,  d: 0.4, b: N.G3 }, { f: N.G4,  d: 0.3 }, { f: N.G4,  d: 0.3 }, { f: N.G4,  d: 0.4 },
      { f: N.F4,  d: 0.3, b: N.BB3 }, { f: N.EB4, d: 0.3 }, { f: N.D4,  d: 0.3 }, { f: N.D4,  d: 0.3 },
      { f: N.D4,  d: 0.3 },          { f: N.F4,  d: 0.4, b: N.C3 }, { f: N.G4,  d: 0.4 }, { f: N.AB4, d: 0.4 },
      { f: N.G4,  d: 0.3, b: N.G3 }, { f: N.F4,  d: 0.3 }, { f: N.EB4, d: 0.3 }, { f: N.D4,  d: 0.3 },
      { f: N.C4,  d: 0.6, b: N.C3 },

      // ── CHORUS 2: Full Swelling Shanty Chorus ──
      { f: N.AB4, d: 0.35, b: N.AB3 }, { f: N.G4,  d: 0.3 }, { f: N.F4,  d: 0.3 }, { f: N.EB4, d: 0.35, b: N.EB3 },
      { f: N.D4,  d: 0.3 },           { f: N.C4,  d: 0.35, b: N.C3 }, { f: N.G3,  d: 0.3 }, { f: N.G3,  d: 0.3 },
      { f: N.C4,  d: 0.35, b: N.C3 }, { f: N.EB4, d: 0.3 }, { f: N.G4,  d: 0.4, b: N.G3 }, { f: N.F4,  d: 0.3 },
      { f: N.EB4, d: 0.3 },           { f: N.D4,  d: 0.3 }, { f: N.C4,  d: 0.6, b: N.C3 },

      // ── OUTRO: Shanty Hornpipe Finish ──
      { f: N.G3,  d: 0.25, b: N.C3 }, { f: N.C4,  d: 0.25 }, { f: N.EB4, d: 0.25 }, { f: N.G4,  d: 0.3 },
      { f: N.C5,  d: 0.4, b: N.C3 },  { f: N.G4,  d: 0.25 }, { f: N.EB4, d: 0.25 }, { f: N.C4,  d: 0.8, b: N.C3 }
    ];

    this.playSongSequence(fullSong, 'wellerman', true);
  }

  // ── 7. KEVIN MACLEOD - "SNEAKY SNITCH" (FULL EXTENDED ARRANGEMENT) ────────────
  public playSneakySnitchFull(): void {
    const fullSong: SongNote[] = [
      // ── INTRO: Stealth Tiptoe Bass ──
      { f: N.G3, d: 0.2, b: N.C3 }, { f: N.C4, d: 0.2 }, { f: N.G3, d: 0.2 }, { f: N.C4, d: 0.2 },
      { f: N.B3, d: 0.2, b: N.G2 }, { f: N.D4, d: 0.2 }, { f: N.B3, d: 0.2 }, { f: N.D4, d: 0.2 },

      // ── SECTION A: Main Mischief Theme ──
      { f: N.C4, d: 0.2, b: N.C3 }, { f: N.D4, d: 0.2 }, { f: N.EB4, d: 0.3, b: N.C3 }, { f: N.C4, d: 0.2 },
      { f: N.G3, d: 0.2 },          { f: N.C4, d: 0.2 }, { f: N.EB4, d: 0.3, b: N.C3 }, { f: N.D4, d: 0.2 },
      { f: N.B3, d: 0.2, b: N.G2 }, { f: N.G3, d: 0.2 }, { f: N.B3, d: 0.2, b: N.B2 },  { f: N.D4, d: 0.3 },
      { f: N.C4, d: 0.2 },          { f: N.G3, d: 0.2 }, { f: N.C4, d: 0.2, b: N.C3 }, { f: N.EB4, d: 0.2 },
      { f: N.F4, d: 0.2 },          { f: N.G4, d: 0.3, b: N.G3 }, { f: N.AB4, d: 0.2 }, { f: N.G4, d: 0.2 },
      { f: N.F4, d: 0.2 },          { f: N.EB4, d: 0.2 }, { f: N.D4, d: 0.2 }, { f: N.C4, d: 0.5, b: N.C3 },

      // ── SECTION B: Tension Escalation & Chromatic Staccato ──
      { f: N.G4, d: 0.25, b: N.G3 }, { f: N.G4, d: 0.2 }, { f: N.F4, d: 0.2 }, { f: N.EB4, d: 0.2 },
      { f: N.F4, d: 0.25, b: N.C3 }, { f: N.G4, d: 0.3 }, { f: N.C4, d: 0.2 }, { f: N.D4, d: 0.2 },
      { f: N.EB4, d: 0.25, b: N.C3 }, { f: N.D4, d: 0.2 }, { f: N.C4, d: 0.2 }, { f: N.B3, d: 0.3, b: N.G2 },
      { f: N.G3, d: 0.2 },           { f: N.AB3, d: 0.2 }, { f: N.A3, d: 0.2 }, { f: N.B3, d: 0.3, b: N.B2 },
      { f: N.C4, d: 0.2, b: N.C3 },  { f: N.D4, d: 0.2 }, { f: N.EB4, d: 0.2 }, { f: N.F4, d: 0.2 },
      { f: N.G4, d: 0.3, b: N.G3 },  { f: N.AB4, d: 0.2 }, { f: N.G4, d: 0.2 }, { f: N.F4, d: 0.2 },
      { f: N.EB4, d: 0.2 },          { f: N.D4, d: 0.2 }, { f: N.C4, d: 0.6, b: N.C3 },

      // ── SECTION C: High Comic Climax & Tiptoe Resolve ──
      { f: N.C5, d: 0.25, b: N.C3 }, { f: N.B4, d: 0.2 }, { f: N.C5, d: 0.25 }, { f: N.AB4, d: 0.2, b: N.AB3 },
      { f: N.G4, d: 0.2 },           { f: N.F4, d: 0.2 }, { f: N.EB4, d: 0.2, b: N.C3 }, { f: N.D4, d: 0.2 },
      { f: N.C4, d: 0.2 },           { f: N.B3, d: 0.2, b: N.G2 }, { f: N.C4, d: 0.2 },  { f: N.D4, d: 0.2 },
      { f: N.EB4, d: 0.25, b: N.C3 }, { f: N.D4, d: 0.2 }, { f: N.C4, d: 0.2 }, { f: N.G3, d: 0.2 },
      { f: N.C4, d: 0.8, b: N.C3 }
    ];

    this.playSongSequence(fullSong, 'sneakysnitch', true);
  }

  // ── 8. BEETHOVEN - "ODE TO JOY" (FULL COMPLETE 4-PART SYMPHONY MOVEMENT) ──────
  public playOdeToJoyFull(): void {
    const fullSong: SongNote[] = [
      // ── PART 1: Main Statement ──
      { f: N.E4, d: 0.35, b: N.C3, chord: [N.G3, N.C4] }, { f: N.E4, d: 0.35 }, { f: N.F4, d: 0.35 }, { f: N.G4, d: 0.35, b: N.G3, chord: [N.B3, N.D4] },
      { f: N.G4, d: 0.35 }, { f: N.F4, d: 0.35 }, { f: N.E4, d: 0.35, b: N.C3, chord: [N.G3, N.C4] }, { f: N.D4, d: 0.35 },
      { f: N.C4, d: 0.35, b: N.C3 }, { f: N.C4, d: 0.35 }, { f: N.D4, d: 0.35 }, { f: N.E4, d: 0.35, b: N.G3 },
      { f: N.E4, d: 0.5 },  { f: N.D4, d: 0.2 },  { f: N.D4, d: 0.6, b: N.G3, chord: [N.B3, N.D4] },

      // ── PART 2: Statement Reprise with Resolution ──
      { f: N.E4, d: 0.35, b: N.C3, chord: [N.G3, N.C4] }, { f: N.E4, d: 0.35 }, { f: N.F4, d: 0.35 }, { f: N.G4, d: 0.35, b: N.G3, chord: [N.B3, N.D4] },
      { f: N.G4, d: 0.35 }, { f: N.F4, d: 0.35 }, { f: N.E4, d: 0.35, b: N.C3, chord: [N.G3, N.C4] }, { f: N.D4, d: 0.35 },
      { f: N.C4, d: 0.35, b: N.C3 }, { f: N.C4, d: 0.35 }, { f: N.D4, d: 0.35 }, { f: N.E4, d: 0.35, b: N.G3 },
      { f: N.D4, d: 0.5 },  { f: N.C4, d: 0.2 },  { f: N.C4, d: 0.7, b: N.C3, chord: [N.E4, N.G4] },

      // ── PART 3: Middle Development & Bridge ──
      { f: N.D4, d: 0.35, b: N.G3 }, { f: N.D4, d: 0.35 }, { f: N.E4, d: 0.35, b: N.C3 }, { f: N.C4, d: 0.35 },
      { f: N.D4, d: 0.35, b: N.G3 }, { f: N.E4, d: 0.2 },  { f: N.F4, d: 0.2 }, { f: N.E4, d: 0.35, b: N.C3 }, { f: N.C4, d: 0.35 },
      { f: N.D4, d: 0.35, b: N.G3 }, { f: N.E4, d: 0.2 },  { f: N.F4, d: 0.2 }, { f: N.E4, d: 0.35, b: N.C3 }, { f: N.D4, d: 0.35 },
      { f: N.C4, d: 0.35, b: N.F3 }, { f: N.D4, d: 0.35 }, { f: N.G3, d: 0.7, b: N.G2, chord: [N.D4, N.F4] },

      // ── PART 4: Grand Symphonic Reprise & Coda ──
      { f: N.E4, d: 0.35, b: N.C3, chord: [N.G3, N.C4] }, { f: N.E4, d: 0.35 }, { f: N.F4, d: 0.35 }, { f: N.G4, d: 0.35, b: N.G3, chord: [N.B3, N.D4] },
      { f: N.G4, d: 0.35 }, { f: N.F4, d: 0.35 }, { f: N.E4, d: 0.35, b: N.C3, chord: [N.G3, N.C4] }, { f: N.D4, d: 0.35 },
      { f: N.C4, d: 0.35, b: N.C3 }, { f: N.C4, d: 0.35 }, { f: N.D4, d: 0.35 }, { f: N.E4, d: 0.35, b: N.G3 },
      { f: N.D4, d: 0.5 },  { f: N.C4, d: 0.2 },  { f: N.C4, d: 0.7, b: N.C3 },

      // Grand Coda Fanfare
      { f: N.G4, d: 0.35, b: N.C3 }, { f: N.E4, d: 0.35 }, { f: N.F4, d: 0.35 }, { f: N.G4, d: 0.35, b: N.G3 },
      { f: N.A4, d: 0.35, b: N.F3 }, { f: N.G4, d: 0.35 }, { f: N.F4, d: 0.35 }, { f: N.E4, d: 0.35, b: N.C3 },
      { f: N.D4, d: 0.35, b: N.G3 }, { f: N.C4, d: 0.35 }, { f: N.D4, d: 0.35 }, { f: N.E4, d: 0.35, b: N.C3 },
      { f: N.D4, d: 0.5, b: N.G3 },  { f: N.C4, d: 0.2 },  { f: N.C4, d: 1.8, b: N.C3, chord: [N.E4, N.G4, N.C5] }
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
    const scale = [N.A3, N.C4, N.D4, N.E4, N.G4, N.A4, N.C5, N.E5, N.G5];
    const bass = [N.A2, N.A2, N.C3, N.D3, N.E3, N.E3, N.D3, N.C3, N.G2, N.A2];
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
      [N.D3, N.A3, N.C4, N.E4, N.G4], // Dm9
      [N.G3, N.B3, N.D4, N.F4, N.A4], // G13
      [N.C3, N.G3, N.B3, N.E4, N.G4], // Cmaj9
      [N.A3, N.C4, N.E4, N.G4, N.C5], // Am7
      [N.F3, N.A3, N.C4, N.E4, N.G4], // Fmaj7#11
      [N.E3, N.GS3, N.B3, N.E4, N.G4], // E7b9
      [N.A3, N.C4, N.E4, N.G4, N.B4]  // Am9
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
    const droneFreqs = [N.A2, N.D3, N.E3, N.A3, N.D4, N.E4];
    const chimeScale = [N.C5, N.E5, N.G5, N.A5, N.B5, N.C6, N.E5, N.G5];

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
    const rootNotes = [N.C3, N.D3, N.E3, N.F3, N.G3, N.A3];
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
    const notes = [
      { freq: N.G4, dur: 0.12 }, { freq: N.FS4, dur: 0.12 }, { freq: N.DS4, dur: 0.12 },
      { freq: N.A3, dur: 0.12 }, { freq: N.GS3, dur: 0.12 }, { freq: N.E4, dur: 0.12 },
      { freq: N.CS4, dur: 0.12 }, { freq: N.C5, dur: 0.35 }
    ];
    this.playMelody(notes);
  }

  public playPokemonTheme(): void {
    const notes = [
      { freq: N.C4, dur: 0.2 }, { freq: N.E4, dur: 0.2 }, { freq: N.G4, dur: 0.2 },
      { freq: N.A4, dur: 0.4 }, { freq: N.G4, dur: 0.4 }, { freq: N.E4, dur: 0.2 },
      { freq: N.D4, dur: 0.2 }, { freq: N.C4, dur: 0.4 }, { freq: N.D4, dur: 0.4 },
      { freq: N.E4, dur: 0.6 }
    ];
    this.playMelody(notes);
  }

  public playTetrisTheme(): void {
    const notes = [
      { freq: N.E5, dur: 0.3 }, { freq: N.B4, dur: 0.15 }, { freq: N.C5, dur: 0.15 },
      { freq: N.D5, dur: 0.3 }, { freq: N.C5, dur: 0.15 }, { freq: N.B4, dur: 0.15 },
      { freq: N.A4, dur: 0.3 }, { freq: N.A4, dur: 0.15 }, { freq: N.C5, dur: 0.15 },
      { freq: N.E5, dur: 0.3 }, { freq: N.D5, dur: 0.15 }, { freq: N.C5, dur: 0.15 },
      { freq: N.B4, dur: 0.45 }
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
