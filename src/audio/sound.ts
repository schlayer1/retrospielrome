class SoundSystem {
  private ctx: AudioContext | null = null;
  public muted = false;
  public bgmMuted = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private currentChapter = 1;

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

  public startBGM(chapter = 1) {
    this.currentChapter = chapter;
    const tracks = [
      '/assets/audio/bgm/ch1_dunes.ogg',
      '/assets/audio/bgm/ch2_scorchlight.ogg',
      '/assets/audio/bgm/ch3_whispers.ogg',
      '/assets/audio/bgm/ch4_canyon.ogg',
      '/assets/audio/bgm/ch5_sunblade.ogg',
      '/assets/audio/bgm/ch6_oasis.ogg',
      '/assets/audio/bgm/desert_loop.ogg',
      '/assets/audio/bgm/oasis_loop.ogg',
    ];
    const targetSrc = tracks[(chapter - 1) % tracks.length];

    if (this.bgmAudio) {
      if (!this.bgmAudio.src.endsWith(targetSrc)) {
        this.bgmAudio.src = targetSrc;
      }
      if (!this.bgmMuted && !this.muted) {
        this.bgmAudio.play().catch(() => {});
      }
      return;
    }

    this.bgmAudio = new Audio(targetSrc);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = 0.22;
    if (!this.bgmMuted && !this.muted) {
      this.bgmAudio.play().catch(() => {});
    }
  }

  public toggleBGM(): boolean {
    this.bgmMuted = !this.bgmMuted;
    if (this.bgmAudio) {
      if (this.bgmMuted) {
        this.bgmAudio.pause();
      } else if (!this.muted) {
        this.bgmAudio.play().catch(() => {});
      }
    } else if (!this.bgmMuted) {
      this.startBGM(this.currentChapter);
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
