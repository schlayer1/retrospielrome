import Phaser from 'phaser';

export interface RoamingAnimal {
  kind: 'goat' | 'goat_baby' | 'cow' | 'calf' | 'wolf' | 'dog' | 'rabbit' | 'pig' | 'horse';
  sprite: Phaser.GameObjects.Sprite;
  homeX: number;
  homeY: number;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  speed: number;
  state: 'idle' | 'walk' | 'special';
  timer: number;
  animPrefix: string;
  idleAnim: string;
  walkAnim: string;
  specialAnim?: string;
}

interface LakeDuck {
  sprite: Phaser.GameObjects.Sprite;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  speed: number;
  state: 'swim' | 'idle' | 'dive' | 'flap';
  timer: number;
  targetX: number;
  targetY: number;
}

interface LakeFrog {
  sprite: Phaser.GameObjects.Sprite;
  startX: number;
  startY: number;
  state: 'sit' | 'jump' | 'underwater';
  timer: number;
}

interface TreeSquirrel {
  sprite: Phaser.GameObjects.Sprite;
  groundX: number;
  groundY: number;
  treeTopY: number;
  state: 'ground' | 'climb' | 'perched';
  timer: number;
}

interface AmbientButterfly {
  sprite: Phaser.GameObjects.Sprite;
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

/**
 * WildlifeManager - Steuert die gesamte lebendige römische Tierwelt & Ökologie:
 * - 4-Richtungs-animierte Nutz- & Wildtiere (Ziegen, Zicklein, Rinder, Kälber, Wölfe, Wachhunde, Schweine, Hasen, Pferde)
 * - Tiber-Ökosystem: Schwimmende Wildenten, Fische & reaktive Uferfrösche
 * - Reaktiv kletternde Baum-Eichhörnchen an römischen Zypressen
 * - Sanft flatternde Schmetterlinge über Wiesen, Olivenhainen & Gärten
 */
export class WildlifeManager {
  private scene: Phaser.Scene;
  private animals: RoamingAnimal[] = [];
  private ducks: LakeDuck[] = [];
  private frogs: LakeFrog[] = [];
  private squirrels: TreeSquirrel[] = [];
  private butterflies: AmbientButterfly[] = [];
  private fishes: SwimmingFish[] = [];
  private rng = new Phaser.Math.RandomDataGenerator(['rome_wildlife_v2']);

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public init(_mapW: number, _mapH: number): void {
    this.animals = [];
    this.ducks = [];
    this.frogs = [];
    this.squirrels = [];
    this.butterflies = [];
    this.fishes = [];

    // =========================================================================
    // 1. NUTZTIERE DER VILLA RUSTICA & HIRTENWEIDEN
    // =========================================================================
    // Ziegen (sdv_goat, 32x32)
    const goatSpawns = [
      { x: 25 * 16, y: 49 * 16, bounds: { minX: 22 * 16, maxX: 29 * 16, minY: 46 * 16, maxY: 53 * 16 } },
      { x: 27 * 16, y: 51 * 16, bounds: { minX: 23 * 16, maxX: 30 * 16, minY: 47 * 16, maxY: 54 * 16 } },
      { x: 39 * 16, y: 48 * 16, bounds: { minX: 36 * 16, maxX: 43 * 16, minY: 45 * 16, maxY: 52 * 16 } },
      { x: 41 * 16, y: 50 * 16, bounds: { minX: 38 * 16, maxX: 45 * 16, minY: 47 * 16, maxY: 54 * 16 } },
    ];
    for (const sp of goatSpawns) {
      const spr = this.scene.add.sprite(sp.x, sp.y, 'sdv_goat', 4).setDepth(sp.y);
      if (this.scene.anims.exists('goat-idle')) spr.play('goat-idle');
      this.animals.push({
        kind: 'goat',
        sprite: spr,
        homeX: sp.x,
        homeY: sp.y,
        bounds: sp.bounds,
        speed: 15,
        state: 'idle',
        timer: this.rng.realInRange(1.5, 3.5),
        animPrefix: 'goat',
        idleAnim: 'goat-idle',
        walkAnim: 'goat-walk',
        specialAnim: 'goat-graze',
      });
    }

    // Verspieltes Zicklein (sdv_goat_baby, 32x32, Skalierung 0.85)
    const babyGoatSpawns = [
      { x: 28 * 16, y: 50 * 16, bounds: { minX: 24 * 16, maxX: 31 * 16, minY: 48 * 16, maxY: 53 * 16 } },
    ];
    for (const sp of babyGoatSpawns) {
      const spr = this.scene.add.sprite(sp.x, sp.y, 'sdv_goat_baby', 4).setScale(0.85).setDepth(sp.y);
      if (this.scene.anims.exists('goat-baby-idle')) spr.play('goat-baby-idle');
      this.animals.push({
        kind: 'goat_baby',
        sprite: spr,
        homeX: sp.x,
        homeY: sp.y,
        bounds: sp.bounds,
        speed: 18,
        state: 'idle',
        timer: this.rng.realInRange(1.0, 2.5),
        animPrefix: 'goat-baby',
        idleAnim: 'goat-baby-idle',
        walkAnim: 'goat-baby-walk',
        specialAnim: 'goat-baby-play',
      });
    }

    // Rinder / Ochsen (sdv_cow, 32x32)
    const cowSpawns = [
      { x: 29 * 16, y: 48 * 16, bounds: { minX: 25 * 16, maxX: 33 * 16, minY: 45 * 16, maxY: 52 * 16 } },
      { x: 35 * 16, y: 55 * 16, bounds: { minX: 32 * 16, maxX: 40 * 16, minY: 52 * 16, maxY: 58 * 16 } },
      { x: 44 * 16, y: 54 * 16, bounds: { minX: 41 * 16, maxX: 48 * 16, minY: 51 * 16, maxY: 57 * 16 } },
    ];
    for (const sp of cowSpawns) {
      const spr = this.scene.add.sprite(sp.x, sp.y, 'sdv_cow', 4).setDepth(sp.y);
      if (this.scene.anims.exists('cow-idle')) spr.play('cow-idle');
      this.animals.push({
        kind: 'cow',
        sprite: spr,
        homeX: sp.x,
        homeY: sp.y,
        bounds: sp.bounds,
        speed: 12,
        state: 'idle',
        timer: this.rng.realInRange(2.0, 4.0),
        animPrefix: 'cow',
        idleAnim: 'cow-idle',
        walkAnim: 'cow-walk',
        specialAnim: 'cow-graze',
      });
    }

    // Jungkalb (sdv_calf, 32x32)
    const calfSpawns = [
      { x: 33 * 16, y: 54 * 16, bounds: { minX: 30 * 16, maxX: 37 * 16, minY: 51 * 16, maxY: 57 * 16 } },
    ];
    for (const sp of calfSpawns) {
      const spr = this.scene.add.sprite(sp.x, sp.y, 'sdv_calf', 4).setScale(0.88).setDepth(sp.y);
      if (this.scene.anims.exists('calf-idle')) spr.play('calf-idle');
      this.animals.push({
        kind: 'calf',
        sprite: spr,
        homeX: sp.x,
        homeY: sp.y,
        bounds: sp.bounds,
        speed: 14,
        state: 'idle',
        timer: this.rng.realInRange(1.8, 3.2),
        animPrefix: 'calf',
        idleAnim: 'calf-idle',
        walkAnim: 'calf-walk',
      });
    }

    // Weideschweine (sdv_pig, 32x32) an der Villa Rustica
    const pigSpawns = [
      { x: 36 * 16, y: 57 * 16, bounds: { minX: 33 * 16, maxX: 40 * 16, minY: 54 * 16, maxY: 60 * 16 } },
      { x: 38 * 16, y: 58 * 16, bounds: { minX: 35 * 16, maxX: 42 * 16, minY: 55 * 16, maxY: 61 * 16 } },
    ];
    for (const sp of pigSpawns) {
      const spr = this.scene.add.sprite(sp.x, sp.y, 'sdv_pig', 4).setDepth(sp.y);
      if (this.scene.anims.exists('pig-idle')) spr.play('pig-idle');
      this.animals.push({
        kind: 'pig',
        sprite: spr,
        homeX: sp.x,
        homeY: sp.y,
        bounds: sp.bounds,
        speed: 13,
        state: 'idle',
        timer: this.rng.realInRange(1.8, 3.8),
        animPrefix: 'pig',
        idleAnim: 'pig-idle',
        walkAnim: 'pig-walk',
        specialAnim: 'pig-forage',
      });
    }

    // Hofhund Lupo (sdv_dog_lupo, 32x32) – wacht an der Villa Rustica
    const dogSpawn = { x: 40 * 16, y: 51 * 16, bounds: { minX: 37 * 16, maxX: 43 * 16, minY: 49 * 16, maxY: 53 * 16 } };
    const dogSpr = this.scene.add.sprite(dogSpawn.x, dogSpawn.y, 'sdv_dog_lupo', 4).setDepth(dogSpawn.y);
    if (this.scene.anims.exists('dog-idle')) dogSpr.play('dog-idle');
    this.animals.push({
      kind: 'dog',
      sprite: dogSpr,
      homeX: dogSpawn.x,
      homeY: dogSpawn.y,
      bounds: dogSpawn.bounds,
      speed: 16,
      state: 'idle',
      timer: 3.5,
      animPrefix: 'dog',
      idleAnim: 'dog-idle',
      walkAnim: 'dog-walk',
      specialAnim: 'dog-wag',
    });

    // Feldhasen (sdv_rabbit, 16x16) in den Olivenhainen
    const rabbitSpawns = [
      { x: 43 * 16, y: 47 * 16, bounds: { minX: 40 * 16, maxX: 47 * 16, minY: 45 * 16, maxY: 49 * 16 } },
      { x: 47 * 16, y: 51 * 16, bounds: { minX: 44 * 16, maxX: 51 * 16, minY: 49 * 16, maxY: 53 * 16 } },
    ];
    for (const sp of rabbitSpawns) {
      const spr = this.scene.add.sprite(sp.x, sp.y, 'sdv_rabbit', 4).setDepth(sp.y);
      if (this.scene.anims.exists('rabbit-idle')) spr.play('rabbit-idle');
      this.animals.push({
        kind: 'rabbit',
        sprite: spr,
        homeX: sp.x,
        homeY: sp.y,
        bounds: sp.bounds,
        speed: 22,
        state: 'idle',
        timer: this.rng.realInRange(1.2, 2.8),
        animPrefix: 'rabbit',
        idleAnim: 'rabbit-idle',
        walkAnim: 'rabbit-walk',
        specialAnim: 'rabbit-sniff',
      });
    }

    // =========================================================================
    // 2. DAS LUPERCAL-WOLFSRUDEL AM PALATIN-HÜGEL (Lupa Romana Hommage)
    // =========================================================================
    const wolfSpawns = [
      { x: 23 * 16, y: 42 * 16, bounds: { minX: 20 * 16, maxX: 26 * 16, minY: 40 * 16, maxY: 45 * 16 } },
      { x: 26 * 16, y: 44 * 16, bounds: { minX: 23 * 16, maxX: 28 * 16, minY: 41 * 16, maxY: 46 * 16 } },
    ];
    for (const sp of wolfSpawns) {
      const spr = this.scene.add.sprite(sp.x, sp.y, 'sdv_wolf', 4).setDepth(sp.y);
      if (this.scene.anims.exists('wolf-idle')) spr.play('wolf-idle');
      this.animals.push({
        kind: 'wolf',
        sprite: spr,
        homeX: sp.x,
        homeY: sp.y,
        bounds: sp.bounds,
        speed: 18,
        state: 'idle',
        timer: this.rng.realInRange(2.0, 4.5),
        animPrefix: 'wolf',
        idleAnim: 'wolf-idle',
        walkAnim: 'wolf-walk',
        specialAnim: 'wolf-howl',
      });
    }

    // =========================================================================
    // 3. RÖMISCHE KAVALLERIE- & ZUGPFERDE (Feldlager / Praetorium)
    // =========================================================================
    const horseSpawns = [
      { x: 79 * 16, y: 27 * 16, bounds: { minX: 76 * 16, maxX: 83 * 16, minY: 25 * 16, maxY: 30 * 16 } },
      { x: 83 * 16, y: 31 * 16, bounds: { minX: 80 * 16, maxX: 87 * 16, minY: 28 * 16, maxY: 34 * 16 } },
    ];
    for (const sp of horseSpawns) {
      const spr = this.scene.add.sprite(sp.x, sp.y, 'sdv_horse', 7).setDepth(sp.y);
      if (this.scene.anims.exists('horse-idle')) spr.play('horse-idle');
      this.animals.push({
        kind: 'horse',
        sprite: spr,
        homeX: sp.x,
        homeY: sp.y,
        bounds: sp.bounds,
        speed: 16,
        state: 'idle',
        timer: this.rng.realInRange(2.2, 4.5),
        animPrefix: 'horse',
        idleAnim: 'horse-idle',
        walkAnim: 'horse-walk',
        specialAnim: 'horse-graze',
      });
    }

    // =========================================================================
    // 4. TIBER-ÖKOSYSTEM: WILDENTEN, SPRINGENDE FRÖSCHE & FISCHE
    // =========================================================================
    // Wildenten auf dem Tiber (sdv_duck, 16x16)
    const duckSpawns = [
      { x: 14 * 16, y: 26 * 16, bounds: { minX: 12 * 16, maxX: 17 * 16, minY: 22 * 16, maxY: 32 * 16 } },
      { x: 15 * 16, y: 38 * 16, bounds: { minX: 13 * 16, maxX: 18 * 16, minY: 34 * 16, maxY: 44 * 16 } },
      { x: 16 * 16, y: 48 * 16, bounds: { minX: 13 * 16, maxX: 18 * 16, minY: 44 * 16, maxY: 54 * 16 } },
      { x: 12 * 16, y: 58 * 16, bounds: { minX: 10 * 16, maxX: 15 * 16, minY: 55 * 16, maxY: 62 * 16 } },
    ];
    for (const d of duckSpawns) {
      const spr = this.scene.add.sprite(d.x, d.y, 'sdv_duck', 12).setDepth(d.y);
      if (this.scene.anims.exists('duck-swim')) spr.play('duck-swim');
      this.ducks.push({
        sprite: spr,
        bounds: d.bounds,
        speed: 14,
        state: 'swim',
        timer: this.rng.realInRange(2.0, 5.0),
        targetX: d.x,
        targetY: d.y,
      });
    }

    // Reaktive Uferfrösche am Tiberufer (sdv_critters, 16x16)
    const frogSpawns = [
      { x: 19 * 16, y: 28 * 16 },
      { x: 18 * 16, y: 36 * 16 },
      { x: 19 * 16, y: 44 * 16 },
      { x: 17 * 16, y: 52 * 16 },
      { x: 16 * 16, y: 61 * 16 },
    ];
    for (const f of frogSpawns) {
      const spr = this.scene.add.sprite(f.x, f.y, 'sdv_critters', 280).setDepth(f.y);
      if (this.scene.anims.exists('critter-frog-idle')) spr.play('critter-frog-idle');
      this.frogs.push({
        sprite: spr,
        startX: f.x,
        startY: f.y,
        state: 'sit',
        timer: this.rng.realInRange(2.0, 6.0),
      });
    }

    // Fische im Tiber
    const fishSpawns = [
      { x: 15 * 16, y: 30 * 16 },
      { x: 14 * 16, y: 42 * 16 },
      { x: 15 * 16, y: 50 * 16 },
      { x: 11 * 16, y: 60 * 16 },
    ];
    for (const fh of fishSpawns) {
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

    // =========================================================================
    // 5. REAKTIVE BAUM-EICHHÖRNCHEN AN RÖMISCHEN PINIEN & ZYPRESSEN
    // =========================================================================
    const treeSquirrels = [
      { groundX: 26 * 16 + 6, groundY: 34 * 16 + 10, treeTopY: 34 * 16 - 16 },
      { groundX: 35 * 16 + 6, groundY: 45 * 16 + 10, treeTopY: 45 * 16 - 16 },
      { groundX: 41 * 16 + 6, groundY: 47 * 16 + 10, treeTopY: 47 * 16 - 16 },
      { groundX: 74 * 16 + 6, groundY: 30 * 16 + 10, treeTopY: 30 * 16 - 16 },
    ];
    for (const sq of treeSquirrels) {
      const spr = this.scene.add.sprite(sq.groundX, sq.groundY, 'sdv_critters', 320).setDepth(sq.groundY + 2);
      if (this.scene.anims.exists('critter-squirrel-idle')) spr.play('critter-squirrel-idle');
      this.squirrels.push({
        sprite: spr,
        groundX: sq.groundX,
        groundY: sq.groundY,
        treeTopY: sq.treeTopY,
        state: 'ground',
        timer: this.rng.realInRange(2.0, 5.0),
      });
    }

    // =========================================================================
    // 6. SANFT FLATTERNDE SCHMETTERLINGE ÜBER BLUMEN & HAINEN
    // =========================================================================
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
    const bAnims = ['critter-butterfly-1', 'critter-butterfly-2', 'critter-butterfly-3'];
    butterflyHomes.forEach(([hx, hy], idx) => {
      const animKey = bAnims[idx % bAnims.length];
      const spr = this.scene.add.sprite(hx, hy, 'sdv_critters', 128).setDepth(8500).setScale(1.0);
      if (this.scene.anims.exists(animKey)) spr.play(animKey);
      this.butterflies.push({
        sprite: spr,
        homeX: hx,
        homeY: hy,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 12,
        phase: Math.random() * Math.PI * 2,
        changeTimer: 900 + Math.random() * 1400,
      });
    });
  }

  public update(time: number, delta: number, playerX?: number, playerY?: number): void {
    const dt = delta / 1000;
    const px = playerX ?? 0;
    const py = playerY ?? 0;

    // -------------------------------------------------------------------------
    // 1. Nutztiere, Wölfe, Hunde, Pferde (Wander- & Fress-Verhalten)
    // -------------------------------------------------------------------------
    for (const a of this.animals) {
      a.timer -= dt;

      if (a.state === 'walk') {
        a.sprite.x += ((a.bounds.maxX - a.sprite.x > 0 ? 1 : -1) * 0.5) * a.speed * dt;
        a.sprite.setDepth(a.sprite.y);

        if (a.timer <= 0) {
          // In Idle oder Fressen/Spezial umschalten
          a.state = 'idle';
          a.timer = this.rng.realInRange(2.0, 4.5);
          if (a.specialAnim && Math.random() < 0.4 && this.scene.anims.exists(a.specialAnim)) {
            a.sprite.play(a.specialAnim, true);
          } else if (this.scene.anims.exists(a.idleAnim)) {
            a.sprite.play(a.idleAnim, true);
          }
        }
      } else {
        // Idle
        if (a.timer <= 0) {
          // Neuen Zielpunkt im Bounding-Box-Radius wählen
          a.state = 'walk';
          a.timer = this.rng.realInRange(1.5, 3.2);

          const targetX = this.rng.between(a.bounds.minX, a.bounds.maxX);
          const targetY = this.rng.between(a.bounds.minY, a.bounds.maxY);
          const dx = targetX - a.sprite.x;
          const dy = targetY - a.sprite.y;

          this.playDirectionAnim(a, dx, dy);

          // Weiche Bewegung dorthin
          this.scene.tweens.add({
            targets: a.sprite,
            x: targetX,
            y: targetY,
            duration: (Math.hypot(dx, dy) / a.speed) * 1000,
            ease: 'Linear',
            onUpdate: () => {
              a.sprite.setDepth(a.sprite.y);
            },
          });
        }
      }
    }

    // -------------------------------------------------------------------------
    // 2. Wildenten auf dem Tiber
    // -------------------------------------------------------------------------
    for (const d of this.ducks) {
      d.timer -= dt;
      if (d.timer <= 0) {
        d.timer = this.rng.realInRange(2.5, 6.0);
        const roll = Math.random();

        if (roll < 0.25 && this.scene.anims.exists('duck-dive')) {
          d.state = 'dive';
          d.sprite.play('duck-dive', true);
        } else if (roll < 0.45 && this.scene.anims.exists('duck-flap')) {
          d.state = 'flap';
          d.sprite.play('duck-flap', true);
        } else {
          d.state = 'swim';
          d.targetX = this.rng.between(d.bounds.minX, d.bounds.maxX);
          d.targetY = this.rng.between(d.bounds.minY, d.bounds.maxY);
          const dx = d.targetX - d.sprite.x;
          const dy = d.targetY - d.sprite.y;

          if (Math.abs(dx) >= Math.abs(dy)) {
            if (this.scene.anims.exists('duck-swim-right')) d.sprite.play('duck-swim-right', true);
            d.sprite.setFlipX(dx < 0);
          } else if (dy > 0) {
            if (this.scene.anims.exists('duck-swim-down')) d.sprite.play('duck-swim-down', true);
          } else {
            if (this.scene.anims.exists('duck-swim-up')) d.sprite.play('duck-swim-up', true);
          }

          this.scene.tweens.add({
            targets: d.sprite,
            x: d.targetX,
            y: d.targetY,
            duration: (Math.hypot(dx, dy) / d.speed) * 1000,
            ease: 'Sine.easeInOut',
            onUpdate: () => d.sprite.setDepth(d.sprite.y),
          });
        }
      }
    }

    // -------------------------------------------------------------------------
    // 3. Reaktive Uferfrösche am Tiber (springen bei Annäherung ins Wasser)
    // -------------------------------------------------------------------------
    for (const fr of this.frogs) {
      const distPlayer = Math.hypot(fr.sprite.x - px, fr.sprite.y - py);

      if (fr.state === 'sit') {
        if (distPlayer < 38) {
          // Spieler tritt zu nah -> Frosch springt ins Wasser!
          fr.state = 'jump';
          fr.timer = 0.55;
          if (this.scene.anims.exists('critter-frog-jump')) fr.sprite.play('critter-frog-jump', true);
        } else {
          fr.timer -= dt;
          if (fr.timer <= 0) {
            fr.timer = this.rng.realInRange(3.0, 7.0);
            if (this.scene.anims.exists('critter-frog-croak')) fr.sprite.play('critter-frog-croak', true);
          }
        }
      } else if (fr.state === 'jump') {
        fr.timer -= dt;
        // Bogenförmiger Sprung nach Westen (in den Tiber hinein)
        fr.sprite.x -= 34 * dt;
        fr.sprite.y -= 10 * Math.sin(fr.timer * Math.PI) * dt;
        if (fr.timer <= 0) {
          fr.state = 'underwater';
          fr.sprite.setVisible(false);
          fr.timer = this.rng.realInRange(7.0, 14.0);
        }
      } else if (fr.state === 'underwater') {
        fr.timer -= dt;
        if (fr.timer <= 0 && distPlayer > 55) {
          fr.state = 'sit';
          fr.sprite.setPosition(fr.startX, fr.startY);
          fr.sprite.setVisible(true);
          if (this.scene.anims.exists('critter-frog-idle')) fr.sprite.play('critter-frog-idle', true);
        }
      }
    }

    // -------------------------------------------------------------------------
    // 4. Reaktive Baum-Eichhörnchen (fliehen an Zypressen- & Pinienstämmen)
    // -------------------------------------------------------------------------
    for (const sq of this.squirrels) {
      const distPlayer = Math.hypot(sq.sprite.x - px, sq.sprite.y - py);

      if (sq.state === 'ground') {
        if (distPlayer < 40) {
          // Spieler kommt zu nah -> huscht den Baumstamm hoch!
          sq.state = 'climb';
          if (this.scene.anims.exists('critter-squirrel-climb')) sq.sprite.play('critter-squirrel-climb', true);
        } else {
          sq.timer -= dt;
          if (sq.timer <= 0) {
            sq.timer = this.rng.realInRange(2.5, 6.0);
            sq.sprite.x = sq.groundX + this.rng.between(-8, 8);
          }
        }
      } else if (sq.state === 'climb') {
        sq.sprite.y -= 35 * dt;
        if (sq.sprite.y <= sq.treeTopY) {
          sq.state = 'perched';
          sq.timer = this.rng.realInRange(5.0, 10.0);
          if (this.scene.anims.exists('critter-squirrel-idle')) sq.sprite.play('critter-squirrel-idle', true);
        }
      } else if (sq.state === 'perched') {
        sq.timer -= dt;
        if (sq.timer <= 0 && distPlayer > 60) {
          // Klettert wieder sanft herunter
          sq.sprite.y += 24 * dt;
          if (sq.sprite.y >= sq.groundY) {
            sq.sprite.y = sq.groundY;
            sq.state = 'ground';
            if (this.scene.anims.exists('critter-squirrel-idle')) sq.sprite.play('critter-squirrel-idle', true);
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // 5. Sanft flatternde Schmetterlinge
    // -------------------------------------------------------------------------
    for (const f of this.butterflies) {
      f.changeTimer -= delta;
      if (f.changeTimer <= 0) {
        f.changeTimer = 900 + Math.random() * 1500;
        const dx = f.homeX - f.sprite.x;
        const dy = f.homeY - f.sprite.y;
        f.vx = (Math.random() - 0.5) * 18 + dx * 0.2;
        f.vy = (Math.random() - 0.5) * 14 + dy * 0.2;
      }
      f.sprite.x += f.vx * dt;
      f.sprite.y += f.vy * dt + Math.sin(time * 0.008 + f.phase) * 0.12;
      f.sprite.setFlipX(f.vx < 0);
      f.sprite.setDepth(8500);
    }

    // -------------------------------------------------------------------------
    // 6. Fische im Tiber
    // -------------------------------------------------------------------------
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

  private playDirectionAnim(a: RoamingAnimal, dx: number, dy: number): void {
    const prefix = a.animPrefix;
    if (Math.abs(dx) >= Math.abs(dy)) {
      const rightKey = `${prefix}-walk-right`;
      const hopRightKey = `${prefix}-hop-right`;
      if (this.scene.anims.exists(rightKey)) {
        a.sprite.play(rightKey, true);
      } else if (this.scene.anims.exists(hopRightKey)) {
        a.sprite.play(hopRightKey, true);
      } else if (this.scene.anims.exists(a.walkAnim)) {
        a.sprite.play(a.walkAnim, true);
      }
      a.sprite.setFlipX(dx < 0);
    } else if (dy > 0) {
      const downKey = `${prefix}-walk-down`;
      const hopDownKey = `${prefix}-hop-down`;
      if (this.scene.anims.exists(downKey)) {
        a.sprite.play(downKey, true);
      } else if (this.scene.anims.exists(hopDownKey)) {
        a.sprite.play(hopDownKey, true);
      } else if (this.scene.anims.exists(a.walkAnim)) {
        a.sprite.play(a.walkAnim, true);
      }
      a.sprite.setFlipX(false);
    } else {
      const upKey = `${prefix}-walk-up`;
      const hopUpKey = `${prefix}-hop-up`;
      if (this.scene.anims.exists(upKey)) {
        a.sprite.play(upKey, true);
      } else if (this.scene.anims.exists(hopUpKey)) {
        a.sprite.play(hopUpKey, true);
      } else if (this.scene.anims.exists(a.walkAnim)) {
        a.sprite.play(a.walkAnim, true);
      }
      a.sprite.setFlipX(false);
    }
  }
}
