import Phaser from 'phaser';

interface Critter {
  sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
  type: 'butterfly' | 'fish' | 'goat' | 'cow';
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  timer: number;
  phase: number;
}

interface LeafParticle {
  dot: Phaser.GameObjects.Rectangle;
  vx: number;
  vy: number;
  phase: number;
}

export class WildlifeManager {
  private scene: Phaser.Scene;
  private critters: Critter[] = [];
  private leaves: LeafParticle[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public init(mapW: number, mapH: number) {
    this.createAnimations();

    // 1. Butterflies near Palatine gardens & olive groves
    const butterflySpots = [
      { x: 28, y: 38 },
      { x: 38, y: 44 },
      { x: 54, y: 34 },
      { x: 66, y: 26 },
      { x: 42, y: 24 },
      { x: 74, y: 38 },
    ];
    butterflySpots.forEach((spot) => {
      const spr = this.scene.add
        .image(spot.x * 16, spot.y * 16, 'critter_butterfly')
        .setDepth(9000);
      this.critters.push({
        sprite: spr,
        type: 'butterfly',
        baseX: spot.x * 16,
        baseY: spot.y * 16,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
        timer: 1500 + Math.random() * 2000,
        phase: Math.random() * Math.PI * 2,
      });
    });

    // 2. Goats & Cattle grazing on the Palatine / Aventine pasture
    const goatSpots = [
      { x: 25, y: 50 },
      { x: 27, y: 51 },
    ];
    goatSpots.forEach((spot) => {
      const spr = this.scene.add
        .sprite(spot.x * 16, spot.y * 16, 'animal_goat', 0)
        .setScale(0.45)
        .setDepth(spot.y * 16);
      spr.play('goat_idle');
      this.critters.push({
        sprite: spr,
        type: 'goat',
        baseX: spot.x * 16,
        baseY: spot.y * 16,
        vx: 0,
        vy: 0,
        timer: 2000 + Math.random() * 2500,
        phase: Math.random() * Math.PI * 2,
      });
    });

    const cowSpr = this.scene.add
      .sprite(29 * 16, 49 * 16, 'animal_cow', 0)
      .setScale(0.45)
      .setDepth(49 * 16);
    cowSpr.play('cow_idle');
    this.critters.push({
      sprite: cowSpr,
      type: 'cow',
      baseX: 29 * 16,
      baseY: 49 * 16,
      vx: 0,
      vy: 0,
      timer: 2400,
      phase: 0,
    });

    // 3. Fish swimming in the Tiber River & Ostia Sea
    const fishSpots = [
      { x: 14, y: 42 },
      { x: 15, y: 52 },
      { x: 12, y: 62 },
      { x: 8, y: 58 },
    ];
    fishSpots.forEach((spot) => {
      const spr = this.scene.add
        .image(spot.x * 16, spot.y * 16, 'critter_fish')
        .setAlpha(0.75)
        .setDepth(15);
      this.critters.push({
        sprite: spr,
        type: 'fish',
        baseX: spot.x * 16,
        baseY: spot.y * 16,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        timer: 2000 + Math.random() * 2000,
        phase: Math.random() * Math.PI * 2,
      });
    });

    // 4. Drifting Mediterranean golden & olive leaves
    for (let i = 0; i < 22; i++) {
      const color = i % 2 === 0 ? 0xd97706 : 0x65a30d;
      const dot = this.scene.add
        .rectangle(
          Math.random() * mapW * 16,
          Math.random() * mapH * 16,
          2,
          2,
          color,
          0.65
        )
        .setDepth(9200);
      this.leaves.push({
        dot,
        vx: 6 + Math.random() * 6,
        vy: 3 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  private createAnimations() {
    const anims = this.scene.anims;
    if (!anims.exists('goat_idle')) {
      anims.create({
        key: 'goat_idle',
        frames: anims.generateFrameNumbers('animal_goat', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1,
      });
    }
    if (!anims.exists('cow_idle')) {
      anims.create({
        key: 'cow_idle',
        frames: anims.generateFrameNumbers('animal_cow', { start: 0, end: 3 }),
        frameRate: 3,
        repeat: -1,
      });
    }
  }

  public update(time: number, delta: number) {
    const dt = delta / 1000;

    for (const c of this.critters) {
      c.timer -= delta;
      if (c.timer <= 0) {
        c.timer = 1800 + Math.random() * 2400;
        if (c.type === 'butterfly') {
          c.vx = (Math.random() - 0.5) * 18;
          c.vy = (Math.random() - 0.5) * 18;
        } else if (c.type === 'goat' || c.type === 'cow') {
          if (Math.random() < 0.5) {
            c.vx = 0;
            c.vy = 0;
          } else {
            c.vx = (Math.random() - 0.5) * 8;
            c.vy = (Math.random() - 0.5) * 8;
          }
        } else if (c.type === 'fish') {
          c.vx = (Math.random() - 0.5) * 10;
          c.vy = (Math.random() - 0.5) * 10;
        }
      }

      c.sprite.x += c.vx * dt;
      c.sprite.y += c.vy * dt;

      const maxDist = c.type === 'butterfly' ? 42 : 20;
      if (Math.hypot(c.sprite.x - c.baseX, c.sprite.y - c.baseY) > maxDist) {
        c.vx = (c.baseX - c.sprite.x) * 0.4;
        c.vy = (c.baseY - c.sprite.y) * 0.4;
      }

      if (c.type === 'goat' || c.type === 'cow') {
        c.sprite.setDepth(c.sprite.y);
      }
    }

    for (const l of this.leaves) {
      l.dot.x += (l.vx + Math.sin(time * 0.002 + l.phase) * 4) * dt;
      l.dot.y += l.vy * dt;
      if (l.dot.x > 100 * 16) l.dot.x = 0;
      if (l.dot.y > 75 * 16) l.dot.y = 0;
    }
  }
}
