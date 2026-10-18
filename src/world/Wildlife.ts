import Phaser from 'phaser';

interface GrazingAnimal {
  sprite: Phaser.GameObjects.Sprite;
  kind: 'goat' | 'cow';
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  timer: number;
  baseScale: number;
  state: 'idle' | 'walk';
}

interface AmbientFlier {
  sprite: Phaser.GameObjects.Image;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  phase: number;
  changeTimer: number;
}

interface SwimmingFish {
  sprite: Phaser.GameObjects.Image;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  timer: number;
}

export class WildlifeManager {
  private scene: Phaser.Scene;
  private animals: GrazingAnimal[] = [];
  private fliers: AmbientFlier[] = [];
  private fishes: SwimmingFish[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public init(_mapW: number, _mapH: number) {
    this.animals = [];
    this.fliers = [];
    this.fishes = [];

    // 1. Ziegen & Rinder nach Proportionsmatrix (SKILL 1.1: Ziege 0.24, Rind 0.35 relative zu 16x32 Spieler)
    const goatSpawns = [
      { x: 25 * 16, y: 49 * 16 },
      { x: 27 * 16, y: 51 * 16 },
      { x: 24 * 16, y: 52 * 16 },
      { x: 37 * 16, y: 48 * 16 },
      { x: 40 * 16, y: 50 * 16 },
      { x: 29 * 16, y: 36 * 16 },
    ];
    for (const sp of goatSpawns) {
      const spr = this.scene.add
        .sprite(sp.x, sp.y, 'goat', 0)
        .setScale(0.24)
        .setDepth(sp.y);
      spr.play('goat-idle');
      this.animals.push({
        sprite: spr,
        kind: 'goat',
        homeX: sp.x,
        homeY: sp.y,
        vx: 0,
        vy: 0,
        timer: 800 + Math.random() * 1800,
        baseScale: 0.24,
        state: 'idle',
      });
    }

    const cowSpawns = [
      { x: 28 * 16, y: 48 * 16 },
      { x: 34 * 16, y: 55 * 16 },
      { x: 43 * 16, y: 54 * 16 },
    ];
    for (const sp of cowSpawns) {
      const spr = this.scene.add
        .sprite(sp.x, sp.y, 'cow', 0)
        .setScale(0.35)
        .setDepth(sp.y);
      spr.play('cow-idle');
      this.animals.push({
        sprite: spr,
        kind: 'cow',
        homeX: sp.x,
        homeY: sp.y,
        vx: 0,
        vy: 0,
        timer: 1100 + Math.random() * 2000,
        baseScale: 0.35,
        state: 'idle',
      });
    }

    // 2. Flatternde Schmetterlinge über Wiesen, Olivenhainen und Gärten (Steinzeit spawnAmbientFliers-Logik)
    const butterflyHomes = [
      [27 * 16, 42 * 16],
      [33 * 16, 45 * 16],
      [39 * 16, 48 * 16],
      [44 * 16, 50 * 16],
      [31 * 16, 52 * 16],
      [49 * 16, 35 * 16],
      [58 * 16, 33 * 16],
      [66 * 16, 26 * 16],
      [72 * 16, 42 * 16],
      [24 * 16, 38 * 16],
    ];
    butterflyHomes.forEach(([hx, hy], idx) => {
      const s = this.scene.add
        .image(hx, hy, 'butterfly')
        .setDepth(9000)
        .setScale(0.95);
      if (idx % 3 === 1) s.setTint(0x7dd3fc);
      else if (idx % 3 === 2) s.setTint(0xfda4af);
      this.fliers.push({
        sprite: s,
        homeX: hx,
        homeY: hy,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.5) * 14,
        phase: Math.random() * Math.PI * 2,
        changeTimer: 900 + Math.random() * 1400,
      });
    });

    // 3. Schwimmende Fische im Tiber und im Hafen von Ostia
    const fishHomes = [
      { x: 16 * 16, y: 34 * 16 },
      { x: 15 * 16, y: 46 * 16 },
      { x: 14 * 16, y: 56 * 16 },
      { x: 10 * 16, y: 60 * 16 },
    ];
    for (const fh of fishHomes) {
      const spr = this.scene.add
        .image(fh.x, fh.y, 'critter_fish')
        .setAlpha(0.75)
        .setDepth(8);
      this.fishes.push({
        sprite: spr,
        homeX: fh.x,
        homeY: fh.y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 10,
        timer: 1500 + Math.random() * 1800,
      });
    }
  }

  public update(time: number, delta: number) {
    const dt = delta / 1000;

    // 1. Ziegen & Rinder: echtes Umschalten zwischen Walk- und Idle-Animation + Richtungs-Flip!
    for (const a of this.animals) {
      a.timer -= delta;
      if (a.timer <= 0) {
        if (a.state === 'walk') {
          a.state = 'idle';
          a.vx = 0;
          a.vy = 0;
          a.timer = 1800 + Math.random() * 2400;
          a.sprite.play(a.kind === 'goat' ? 'goat-idle' : 'cow-idle', true);
        } else {
          a.state = 'walk';
          const dx = a.homeX - a.sprite.x;
          const dy = a.homeY - a.sprite.y;
          const distHome = Math.hypot(dx, dy);
          const angle =
            distHome > 42
              ? Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.6
              : Math.random() * Math.PI * 2;
          const speed = a.kind === 'goat' ? 18 : 13;
          a.vx = Math.cos(angle) * speed;
          a.vy = Math.sin(angle) * speed;
          a.timer = 1100 + Math.random() * 1500;
          a.sprite.setFlipX(a.vx < 0);
          a.sprite.play(a.kind === 'goat' ? 'goat-walk' : 'cow-walk', true);
        }
      }

      if (a.state === 'walk') {
        a.sprite.x += a.vx * dt;
        a.sprite.y += a.vy * dt;
        a.sprite.setDepth(a.sprite.y);
      } else {
        const breathe = 1 + Math.sin(time * 0.003 + a.homeX) * 0.025;
        a.sprite.setScale(a.baseScale, a.baseScale * breathe);
      }
    }

    // 2. Schmetterlinge mit sanftem Flügelschlag (Steinzeit-Standard)
    for (const f of this.fliers) {
      f.changeTimer -= delta;
      if (f.changeTimer <= 0) {
        f.changeTimer = 900 + Math.random() * 1500;
        const dx = f.homeX - f.sprite.x;
        const dy = f.homeY - f.sprite.y;
        f.vx = (Math.random() - 0.5) * 22 + dx * 0.25;
        f.vy = (Math.random() - 0.5) * 18 + dy * 0.25;
      }
      f.sprite.x += f.vx * dt;
      f.sprite.y += f.vy * dt + Math.sin(time * 0.008 + f.phase) * 0.14;
      f.sprite.scaleY = 0.55 + Math.abs(Math.sin(time * 0.018 + f.phase)) * 0.55;
      f.sprite.setFlipX(f.vx < 0);
      f.sprite.setDepth(f.sprite.y + 24);
    }

    // 3. Fische im Tiber
    for (const fish of this.fishes) {
      fish.timer -= delta;
      if (fish.timer <= 0) {
        fish.timer = 1600 + Math.random() * 1800;
        const dx = fish.homeX - fish.sprite.x;
        const dy = fish.homeY - fish.sprite.y;
        fish.vx = (Math.random() - 0.5) * 14 + dx * 0.2;
        fish.vy = (Math.random() - 0.5) * 10 + dy * 0.2;
        fish.sprite.setFlipX(fish.vx < 0);
      }
      fish.sprite.x += fish.vx * dt;
      fish.sprite.y += fish.vy * dt;
    }
  }
}
