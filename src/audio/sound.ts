class SoundSystem {
  private ctx: AudioContext | null = null;
  public muted = false;
  public bgmMuted = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmVolume = 0.28;
  private inCatacombs = false;
  private currentChapter = 1;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('rome_bgm_muted');
      if (savedMute !== null) this.bgmMuted = savedMute === 'true';
      const savedVol = localStorage.getItem('rome_bgm_vol');
      if (savedVol !== null) {
        const v = parseFloat(savedVol);
        if (!isNaN(v)) this.bgmVolume = Math.max(0, Math.min(1, v));
      }
    }
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getVolume(): number {
    return this.bgmVolume;
  }

  public setVolume(val: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (typeof window !== 'undefined') {
      localStorage.setItem('rome_bgm_vol', String(this.bgmVolume));
    }
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmMuted ? 0 : this.bgmVolume;
    }
  }

  public getChapterTrackInfo(chapter = 1): { path: string; title: string; subtitle: string } {
    const map: Record<number, { path: string; title: string; subtitle: string }> = {
      1: {
        path: '/assets/audio/bgm/bgm_warmth.mp3',
        title: 'Die Wiege am Palatin',
        subtitle: 'Hirtenidylle & Lupa Romana (753 v. Chr.)',
      },
      2: {
        path: '/assets/audio/bgm/bgm_patterns.mp3',
        title: 'Der Bürgereid der Republik',
        subtitle: 'Curia Hostilia & Senat (509 v. Chr.)',
      },
      3: {
        path: '/assets/audio/bgm/bgm_heart.mp3',
        title: 'Der Geist des Cincinnatus',
        subtitle: 'Mos Maiorum & Zwölftafeln (458 v. Chr.)',
      },
      4: {
        path: '/assets/audio/bgm/bgm_desert_battle.mp3',
        title: 'Der Schatten von Karthago',
        subtitle: 'Cannae, Flotte von Ostia & Zama (216 v. Chr.)',
      },
      5: {
        path: '/assets/audio/bgm/bgm_desert_whispers.mp3',
        title: 'Das Flüstern der Reformer',
        subtitle: 'Tiberius Gracchus & Ackerreform (133 v. Chr.)',
      },
      6: {
        path: '/assets/audio/bgm/bgm_desert_epic.mp3',
        title: 'Der Ruf nach Freiheit',
        subtitle: 'Spartacus & der Vesuv-Aufstand (73 v. Chr.)',
      },
      7: {
        path: '/assets/audio/bgm/bgm_patterns.mp3',
        title: 'Alea Iacta Est – Rubikon',
        subtitle: 'Caesars Triumph & Dictator Perpetuo (49 v. Chr.)',
      },
      8: {
        path: '/assets/audio/bgm/bgm_warmth.mp3',
        title: 'Pax Romana & Goldene Ära',
        subtitle: 'Augustus, Marmor & Aquädukte (27 v. Chr.)',
      },
      9: {
        path: '/assets/audio/bgm/bgm_mist.mp3',
        title: 'Rauch über den Insulae',
        subtitle: 'Der Brand Roms unter Nero (64 n. Chr.)',
      },
      10: {
        path: '/assets/audio/bgm/bgm_desert_canyon.mp3',
        title: 'Das Weite Weltreich Trajans',
        subtitle: 'Größte Ausdehnung, Kolosseum & Limes (117 n. Chr.)',
      },
      11: {
        path: '/assets/audio/bgm/bgm_oracle.mp3',
        title: 'In Hoc Signo Vinces',
        subtitle: 'Konstantinische Wende & Basilika (312 n. Chr.)',
      },
      12: {
        path: '/assets/audio/bgm/bgm_mist.mp3',
        title: 'Der Letzte Kaiser & Vivarium',
        subtitle: '476 n. Chr. & Rettung des Wissens',
      },
    };
    return map[chapter] || map[1];
  }

  public getCurrentTrackDisplay(): { title: string; subtitle: string } {
    if (this.inCatacombs) {
      return {
        title: 'Katakomben & Mithräum',
        subtitle: 'Unterirdische Andacht & Mysterienkult',
      };
    }
    return this.getChapterTrackInfo(this.currentChapter);
  }

  public startBGM(chapter = 1) {
    this.inCatacombs = false;
    this.currentChapter = chapter;
    const track = this.getChapterTrackInfo(chapter);
    this.playAudioFile(track.path);
  }

  public playCatacombBGM() {
    this.inCatacombs = true;
    this.playAudioFile('/assets/audio/bgm/bgm_oracle.mp3');
  }

  public resumeChapterBGM() {
    this.inCatacombs = false;
    this.startBGM(this.currentChapter);
  }

  private playAudioFile(targetSrc: string) {
    if (typeof window === 'undefined') return;

    if (this.bgmAudio) {
      if (!this.bgmAudio.src.endsWith(targetSrc)) {
        this.bgmAudio.src = targetSrc;
      }
      this.bgmAudio.volume = this.bgmMuted || this.muted ? 0 : this.bgmVolume;
      if (!this.bgmMuted && !this.muted) {
        this.bgmAudio.play().catch(() => {});
      }
      return;
    }

    this.bgmAudio = new Audio(targetSrc);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this.bgmMuted || this.muted ? 0 : this.bgmVolume;
    if (!this.bgmMuted && !this.muted) {
      const p = this.bgmAudio.play();
      if (p) p.catch(() => {});
    }
  }

  public toggleBGM(): boolean {
    this.bgmMuted = !this.bgmMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rome_bgm_muted', String(this.bgmMuted));
    }
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmMuted || this.muted ? 0 : this.bgmVolume;
      if (this.bgmMuted) {
        this.bgmAudio.pause();
      } else if (!this.muted) {
        this.bgmAudio.play().catch(() => {});
      }
    } else if (!this.bgmMuted) {
      if (this.inCatacombs) {
        this.playCatacombBGM();
      } else {
        this.startBGM(this.currentChapter);
      }
    }
    return !this.bgmMuted;
  }

  public playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.08, delay = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  public click() {
    this.playTone(620, 0.05, 'square', 0.06);
  }

  public pickup() {
    this.playTone(440, 0.07, 'triangle', 0.09, 0);
    this.playTone(660, 0.1, 'triangle', 0.09, 0.06);
  }

  public craft() {
    this.playTone(330, 0.08, 'square', 0.07, 0);
    this.playTone(440, 0.08, 'square', 0.07, 0.08);
    this.playTone(554, 0.12, 'square', 0.08, 0.16);
    this.playTone(660, 0.18, 'triangle', 0.1, 0.24);
  }

  public build() {
    this.playTone(196, 0.1, 'sawtooth', 0.08, 0);
    this.playTone(261, 0.1, 'sawtooth', 0.08, 0.1);
    this.playTone(329, 0.12, 'square', 0.09, 0.2);
    this.playTone(392, 0.22, 'triangle', 0.1, 0.32);
  }

  public success() {
    this.playTone(523.25, 0.1, 'triangle', 0.1, 0);
    this.playTone(659.25, 0.1, 'triangle', 0.1, 0.1);
    this.playTone(783.99, 0.12, 'triangle', 0.1, 0.2);
    this.playTone(1046.5, 0.28, 'square', 0.09, 0.32);
  }

  public error() {
    this.playTone(220, 0.12, 'sawtooth', 0.08, 0);
    this.playTone(165, 0.2, 'sawtooth', 0.08, 0.12);
  }

  public step() {
    this.playTone(130 + Math.random() * 35, 0.03, 'triangle', 0.025);
  }
}

export const sound = new SoundSystem();
