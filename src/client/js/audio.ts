export type MusicTrack = 'off' | 'cyberspace' | 'neon' | 'ambient' | 'generative';

export class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private currentTrack: MusicTrack = 'off';
  private musicTimer: any = null;
  private musicGainNode: GainNode | null = null;
  private musicMasterVol: number = 0.08;

  constructor() {
    this.enabled = localStorage.getItem('ascii_audio_enabled') !== 'false';
    const savedTrack = localStorage.getItem('ascii_music_track') as MusicTrack;
    if (savedTrack && ['cyberspace', 'neon', 'ambient', 'generative'].includes(savedTrack)) {
      this.currentTrack = savedTrack;
    }

    // Ensure audio context wakes up on the very first user gesture anywhere
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

  public setTrack(track: MusicTrack): void {
    this.currentTrack = track;
    localStorage.setItem('ascii_music_track', track);
    this.stopMusic();

    if (track !== 'off' && this.enabled) {
      this.startMusic();
    }
  }

  public cycleTrack(): MusicTrack {
    const tracks: MusicTrack[] = ['off', 'cyberspace', 'neon', 'ambient', 'generative'];
    const idx = tracks.indexOf(this.currentTrack);
    const next = tracks[(idx + 1) % tracks.length];
    this.setTrack(next);
    return next;
  }

  public stopMusic(): void {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public startMusic(): void {
    this.stopMusic();
    if (!this.enabled || this.currentTrack === 'off') return;

    this.initContext();

    if (this.currentTrack === 'cyberspace') {
      this.playCyberspaceLoop();
    } else if (this.currentTrack === 'neon') {
      this.playNeonLoop();
    } else if (this.currentTrack === 'ambient') {
      this.playAmbientLoop();
    } else if (this.currentTrack === 'generative') {
      this.playGenerativeLoop();
    }
  }

  // Track 1: Cyberspace (Calm 8-bit Minor Pentatonic Arpeggio)
  private playCyberspaceLoop(): void {
    // A minor pentatonic: A3, C4, D4, E4, G4, A4, C5, E5
    const scale = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25];
    const bass = [110.00, 110.00, 130.81, 146.83, 164.81, 164.81, 146.83, 130.81];
    const pattern = [0, 2, 4, 7, 5, 3, 4, 1, 0, 3, 5, 7, 6, 4, 2, 1];
    let step = 0;

    const tick = () => {
      if (!this.enabled || this.currentTrack !== 'cyberspace') return;
      const noteFreq = scale[pattern[step % pattern.length] % scale.length];
      const bassFreq = bass[Math.floor(step / 2) % bass.length];

      // Arp note
      this.synthPluck(noteFreq, 0.12, 'square', this.musicMasterVol * 0.45, 1200);

      // Bass note every 2 steps
      if (step % 2 === 0) {
        this.synthPluck(bassFreq, 0.28, 'triangle', this.musicMasterVol * 0.7, 400);
      }

      step++;
      this.musicTimer = setTimeout(tick, 180);
    };

    tick();
  }

  // Track 2: Neon (16-bit Lo-Fi Chill Chords & Sub-Bass Pulse)
  private playNeonLoop(): void {
    // Chord progressions: Dm9 -> G13 -> Cmaj9 -> Am7
    const chords = [
      [146.83, 220.00, 261.63, 329.63, 392.00], // Dm9
      [196.00, 246.94, 293.66, 349.23, 440.00], // G13
      [130.81, 196.00, 246.94, 329.63, 392.00], // Cmaj9
      [220.00, 261.63, 329.63, 392.00, 523.25]  // Am7
    ];
    let chordIdx = 0;
    let tickCount = 0;

    const tick = () => {
      if (!this.enabled || this.currentTrack !== 'neon') return;
      const currentChord = chords[chordIdx % chords.length];

      // Strum chord notes softly
      currentChord.forEach((freq, i) => {
        setTimeout(() => {
          if (this.currentTrack === 'neon') {
            this.synthPluck(freq, 0.45, 'triangle', this.musicMasterVol * 0.35, 900);
          }
        }, i * 35);
      });

      // Sub-bass pulse
      this.synthPluck(currentChord[0] / 2, 0.6, 'sine', this.musicMasterVol * 0.9, 250);

      tickCount++;
      if (tickCount % 4 === 0) {
        chordIdx++;
      }

      this.musicTimer = setTimeout(tick, 600);
    };

    tick();
  }

  // Track 3: Ambient (Deep Space Drone & Celestial Chimes)
  private playAmbientLoop(): void {
    const droneFreqs = [110.00, 164.81, 220.00, 329.63]; // A drone
    const chimeScale = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98];

    const droneTick = () => {
      if (!this.enabled || this.currentTrack !== 'ambient') return;
      // Soft drone swell
      const f = droneFreqs[Math.floor(Math.random() * droneFreqs.length)];
      this.synthPluck(f, 2.5, 'sine', this.musicMasterVol * 0.6, 600);

      // Sparkling chime
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

  // Track 4: Generative Endless Mode (Self-evolving procedural pentatonic loop)
  private playGenerativeLoop(): void {
    const rootNotes = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00]; // C3 to A3
    let baseRoot = rootNotes[Math.floor(Math.random() * rootNotes.length)];
    let interval = 0;

    const tick = () => {
      if (!this.enabled || this.currentTrack !== 'generative') return;

      // Pentatonic steps: 0, 2, 4, 7, 9, 12, 14, 16
      const pentatonicSteps = [0, 2, 4, 7, 9, 12, 14, 16, 19];
      const step = pentatonicSteps[Math.floor(Math.random() * pentatonicSteps.length)];
      const freq = baseRoot * Math.pow(2, step / 12);

      const waveType: OscillatorType = Math.random() > 0.4 ? 'triangle' : 'square';
      const duration = 0.2 + Math.random() * 0.4;
      this.synthPluck(freq, duration, waveType, this.musicMasterVol * 0.4, 1100);

      // Periodically shift root note
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

  // Zelda Secret & Lullaby Chiptune
  public playZeldaTheme(): void {
    const g4 = 392.00, fs4 = 369.99, ds4 = 311.13, a3 = 220.00, gs3 = 207.65, e4 = 329.63, cs4 = 277.18, c5 = 523.25;
    const notes = [
      { freq: g4, dur: 0.12 }, { freq: fs4, dur: 0.12 }, { freq: ds4, dur: 0.12 },
      { freq: a3, dur: 0.12 }, { freq: gs3, dur: 0.12 }, { freq: e4, dur: 0.12 },
      { freq: cs4, dur: 0.12 }, { freq: c5, dur: 0.35 }
    ];
    this.playMelody(notes);
  }

  // Pokemon Pallet Town Theme
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

  // Tetris Theme (Korobeiniki)
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
