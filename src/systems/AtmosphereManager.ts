import Phaser from 'phaser';

export interface AtmospherePreset {
  tintColor: number;
  baseAlpha: number;
  blendMode: Phaser.BlendModes;
  label: string;
}

export class AtmosphereManager {
  private scene: Phaser.Scene;
  private lightOverlay: Phaser.GameObjects.Rectangle | null = null;
  private currentChapter = 1;
  private timeAccumulator = 0;

  private presets: Record<number, AtmospherePreset> = {
    1: {
      tintColor: 0xfde68a,
      baseAlpha: 0.08,
      blendMode: Phaser.BlendModes.ADD,
      label: 'Morgensonne über den Hügeln Roms (753 v. Chr.)',
    },
    2: {
      tintColor: 0xfffbeb,
      baseAlpha: 0.04,
      blendMode: Phaser.BlendModes.ADD,
      label: 'Klares Licht der jungen Republik (509 v. Chr.)',
    },
    3: {
      tintColor: 0xfef3c7,
      baseAlpha: 0.05,
      blendMode: Phaser.BlendModes.ADD,
      label: 'Sonniger Vormittag auf den Feldern des Cincinnatus',
    },
    4: {
      tintColor: 0x334155,
      baseAlpha: 0.28,
      blendMode: Phaser.BlendModes.MULTIPLY,
      label: 'Düstere Gewitterfront über Italien – Hannibal steht vor den Toren',
    },
    5: {
      tintColor: 0xf59e0b,
      baseAlpha: 0.09,
      blendMode: Phaser.BlendModes.ADD,
      label: 'Schwüle Sommerhitze auf dem Forum Romanum (Gracchen-Krise)',
    },
    6: {
      tintColor: 0xfbbf24,
      baseAlpha: 0.07,
      blendMode: Phaser.BlendModes.ADD,
      label: 'Heißer Nachmittag über der Arena',
    },
    7: {
      tintColor: 0xfffdf5,
      baseAlpha: 0.03,
      blendMode: Phaser.BlendModes.ADD,
      label: 'Strahlender Sommermittag – Caesar überschreitet den Rubikon',
    },
    8: {
      tintColor: 0xfef08a,
      baseAlpha: 0.06,
      blendMode: Phaser.BlendModes.ADD,
      label: 'Goldene Ära der Pax Augusta – Glanz auf den Marmorforen',
    },
    9: {
      tintColor: 0x78716c,
      baseAlpha: 0.22,
      blendMode: Phaser.BlendModes.MULTIPLY,
      label: 'Rauch und Dunst über den Ruinen nach dem Brand Roms 64 n. Chr.',
    },
    10: {
      tintColor: 0xfef9c3,
      baseAlpha: 0.05,
      blendMode: Phaser.BlendModes.ADD,
      label: 'Reichsweite Blütezeit unter Kaiser Trajan',
    },
    11: {
      tintColor: 0x1e293b,
      baseAlpha: 0.26,
      blendMode: Phaser.BlendModes.MULTIPLY,
      label: 'Kühle Abenddämmerung – Christenversammlung im Untergrund',
    },
    12: {
      tintColor: 0x475569,
      baseAlpha: 0.25,
      blendMode: Phaser.BlendModes.MULTIPLY,
      label: 'Melancholische Abenddämmerung des Weströmischen Reiches (476 n. Chr.)',
    },
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public init(mapW: number, mapH: number, chapter = 1): void {
    this.currentChapter = chapter;
    const preset = this.presets[chapter] || this.presets[1];

    if (this.lightOverlay) {
      this.lightOverlay.destroy();
    }

    this.lightOverlay = this.scene.add
      .rectangle(0, 0, mapW * 16, mapH * 16, preset.tintColor, preset.baseAlpha)
      .setOrigin(0, 0)
      .setBlendMode(preset.blendMode)
      .setDepth(8500);
  }

  public setChapter(chapter: number, mapW: number, mapH: number): void {
    this.currentChapter = chapter;
    const preset = this.presets[chapter] || this.presets[1];

    if (!this.lightOverlay) {
      this.init(mapW, mapH, chapter);
      return;
    }

    this.lightOverlay.setFillStyle(preset.tintColor, preset.baseAlpha);
    this.lightOverlay.setBlendMode(preset.blendMode);
    this.timeAccumulator = 0;
  }

  public update(delta: number): void {
    if (!this.lightOverlay) return;
    this.timeAccumulator += delta;

    // Subtiler Diurnal-Drift (±10% Helligkeits-Atmung über 5 Minuten)
    const preset = this.presets[this.currentChapter] || this.presets[1];
    const wave = Math.sin((this.timeAccumulator * 0.0003) % (Math.PI * 2)) * 0.015;
    this.lightOverlay.setAlpha(Math.max(0.02, preset.baseAlpha + wave));
  }
}
