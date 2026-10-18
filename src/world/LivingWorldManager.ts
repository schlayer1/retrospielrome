import Phaser from 'phaser';

export interface FireSource {
  x: number;
  y: number;
  hasSmoke: boolean;
  smokeRate?: number;
  glowRadius?: number;
  glowColor?: number;
}

export interface ResourceHotspot {
  x: number;
  y: number;
  lastSparkle?: number;
  sparkleInterval?: number;
}

export class LivingWorldManager {
  private scene: Phaser.Scene;
  private floraSprites: Phaser.GameObjects.Sprite[] = [];
  private bannerSprites: Phaser.GameObjects.Image[] = [];
  private mysticalSprites: Phaser.GameObjects.Image[] = [];
  private fireSources: FireSource[] = [];
  private fireGlows: Phaser.GameObjects.Arc[] = [];
  private waterRipples: Phaser.GameObjects.Rectangle[] = [];
  private resourceSpots: ResourceHotspot[] = [];

  // Wind state
  private windTime = 0;
  private smokeTimer = 0;
  private waterTimer = 0;

  // Mentors & Player Idle
  private mentorSprites: Phaser.GameObjects.Sprite[] = [];
  private mentorLookTimers: Map<Phaser.GameObjects.Sprite, number> = new Map();
  private playerSprite: Phaser.GameObjects.Sprite | null = null;
  private playerIdleTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // ---------------------------------------------------------------------------
  // 1. FLORA & WIND (Sinus-Schwung mit individuellem Phasen-Offset)
  // ---------------------------------------------------------------------------
  public registerFlora(sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | null): void {
    if (!sprite) return;
    if (sprite instanceof Phaser.GameObjects.Sprite) {
      this.floraSprites.push(sprite);
    }

    const delay = Math.random() * 2500;
    const duration = 2400 + Math.random() * 1200;
    const maxAngle = 1.0 + Math.random() * 0.8;

    this.scene.tweens.add({
      targets: sprite,
      angle: { from: -maxAngle, to: maxAngle },
      duration,
      delay,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // ---------------------------------------------------------------------------
  // 2. MEHRSCHICHTIGE FEUER- & RAUCH-SIMULATION (Vesta-Herd, Altäre)
  // ---------------------------------------------------------------------------
  public registerFireSource(
    x: number,
    y: number,
    hasSmoke = true,
    glowRadius = 36,
    glowColor = 0xffa533
  ): void {
    const glow = this.scene.add
      .circle(x, y - 6, glowRadius, glowColor, 0.22)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(y - 2);

    this.fireGlows.push(glow);

    // Warmes Flackern
    this.scene.tweens.add({
      targets: glow,
      scaleX: { from: 0.94, to: 1.06 },
      scaleY: { from: 0.92, to: 1.08 },
      alpha: { from: 0.16, to: 0.28 },
      duration: 130 + Math.random() * 80,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.fireSources.push({
      x,
      y,
      hasSmoke,
      smokeRate: 500 + Math.random() * 300,
      glowRadius,
      glowColor,
    });
  }

  public addTorchGlow(x: number, y: number, radius = 32, color = 0xf97316): void {
    this.registerFireSource(x, y, false, radius, color);
  }

  public addCampfire(x: number, y: number): void {
    this.registerFireSource(x, y, true, 38, 0xf59e0b);
  }

  // ---------------------------------------------------------------------------
  // 3. FLIESSENDE WASSER-DYNAMIK (Tiber & Küste von Ostia)
  // ---------------------------------------------------------------------------
  public initWaterEffects(): void {
    // Schmale, transluzente Glanz-Streifen entlang des Tiber-Flussverlaufs
    for (let i = 0; i < 20; i++) {
      const ty = (5 + Math.random() * 68) * 16;
      const riverCenter = 16 + Math.round(Math.sin((ty / 16) * 0.11) * 2);
      const rx = (riverCenter - 1.2 + Math.random() * 2.4) * 16;
      const w = 10 + Math.random() * 16;
      const h = 2;

      const ripple = this.scene.add
        .rectangle(rx, ty, w, h, 0xe0f2fe, 0.28)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(15);

      this.scene.tweens.add({
        targets: ripple,
        y: ty + 20,
        alpha: { from: 0, to: 0.38 },
        duration: 2200 + Math.random() * 1200,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000,
        ease: 'Sine.easeInOut',
      });

      this.waterRipples.push(ripple);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. TEXTILE BANNER (Vexilla, Feldzeichen) & ROHSTOFF-SPARKLES (✦)
  // ---------------------------------------------------------------------------
  public registerBanner(img: Phaser.GameObjects.Image | null): void {
    if (!img) return;
    this.bannerSprites.push(img);

    this.scene.tweens.add({
      targets: img,
      angle: { from: -0.6, to: 0.6 },
      scaleX: { from: 0.99, to: 1.01 },
      duration: 1800 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public registerMysticalProp(img: Phaser.GameObjects.Image | null): void {
    if (!img) return;
    this.mysticalSprites.push(img);

    this.scene.tweens.add({
      targets: img,
      alpha: { from: 0.82, to: 1.0 },
      duration: 2200 + Math.random() * 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public registerResourceHotspot(x: number, y: number): void {
    this.resourceSpots.push({
      x,
      y,
      lastSparkle: 0,
      sparkleInterval: 3500 + Math.random() * 2500,
    });
  }

  private triggerSparkle(spot: ResourceHotspot): void {
    const star = this.scene.add
      .star(spot.x, spot.y - 12, 4, 2, 5, 0xfffbeb, 0.9)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(spot.y + 10)
      .setScale(0);

    this.scene.tweens.add({
      targets: star,
      scale: 1.2,
      angle: 90,
      alpha: { from: 0.9, to: 0 },
      duration: 550,
      ease: 'Cubic.easeOut',
      onComplete: () => star.destroy(),
    });
  }

  // ---------------------------------------------------------------------------
  // 5. NPCS & MENTOREN-DYNAMIK (Atmung & Spieler-Awareness)
  // ---------------------------------------------------------------------------
  public registerMentor(sprite: Phaser.GameObjects.Sprite | null): void {
    if (!sprite) return;
    this.mentorSprites.push(sprite);
    this.mentorLookTimers.set(sprite, 4000 + Math.random() * 4000);

    // Sanfte 1-Pixel-Atmung
    this.scene.tweens.add({
      targets: sprite,
      scaleY: { from: 0.985, to: 1.0 },
      duration: 1400 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public registerPlayer(player: Phaser.GameObjects.Sprite): void {
    this.playerSprite = player;
  }

  public clearMentors(): void {
    this.mentorSprites = [];
    this.mentorLookTimers.clear();
  }

  // ---------------------------------------------------------------------------
  // 6. MAIN UPDATE CYCLE
  // ---------------------------------------------------------------------------
  public update(delta: number, playerX: number, playerY: number, _playerMoving: boolean): void {
    this.windTime += delta;
    this.smokeTimer += delta;
    this.waterTimer += delta;

    // Aufsteigende Rauchwölkchen aus aktiven Feuerquellen
    if (this.smokeTimer > 280) {
      this.smokeTimer = 0;
      for (const fire of this.fireSources) {
        if (!fire.hasSmoke) continue;
        if (Math.random() > 0.45) continue;

        const puffX = fire.x + (Math.random() * 6 - 3);
        const puffY = fire.y - 10;
        const puffRadius = 3 + Math.random() * 2.5;

        const puff = this.scene.add
          .circle(puffX, puffY, puffRadius, 0x94a3b8, 0.45)
          .setDepth(fire.y + 20);

        this.scene.tweens.add({
          targets: puff,
          x: puffX + 16 + Math.random() * 12,
          y: puffY - 36 - Math.random() * 18,
          scale: 1.8,
          alpha: 0,
          duration: 1800 + Math.random() * 600,
          ease: 'Quad.easeOut',
          onComplete: () => puff.destroy(),
        });
      }
    }

    // Rohstoff-Sparkles in periodischen Intervallen
    for (const spot of this.resourceSpots) {
      spot.lastSparkle = (spot.lastSparkle || 0) + delta;
      if (spot.lastSparkle >= (spot.sparkleInterval || 4000)) {
        spot.lastSparkle = 0;
        spot.sparkleInterval = 3000 + Math.random() * 3000;
        this.triggerSparkle(spot);
      }
    }

    // Mentoren wenden sich bei Annäherung (< 44px) automatisch dem Spieler zu
    for (const mentor of this.mentorSprites) {
      const dist = Math.hypot(playerX - mentor.x, playerY - mentor.y);
      if (dist < 44) {
        if (playerX < mentor.x - 6) {
          mentor.setFlipX(true);
        } else if (playerX > mentor.x + 6) {
          mentor.setFlipX(false);
        }
      }
    }
  }
}
