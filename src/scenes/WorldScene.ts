import Phaser from 'phaser';
import { sound } from '../audio/sound';
import { CHAPTERS } from '../data/chapters';
import { BUILDINGS, ITEMS, RomanItemId } from '../data/items';
import { ROMAN_RELICS, RomanRelic } from '../data/relics';
import { state as gameState } from '../systems/GameState';
import { WorldDecorManager } from '../world/decor';
import { WildlifeManager } from '../world/Wildlife';
import { UIScene } from './UIScene';

interface InteractiveTarget {
  id: string;
  kind: 'mentor' | 'resource' | 'relic' | 'portal' | 'trader' | 'building_plot';
  name: string;
  sub: string;
  x: number;
  y: number;
  minChapter: number;
  itemId?: RomanItemId;
  relic?: RomanRelic;
  buildingId?: string;
}

export class WorldScene extends Phaser.Scene {
  private mapW = 100;
  private mapH = 75;
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };

  private dynamicGroup!: Phaser.GameObjects.Group;
  private mentorSprite: Phaser.GameObjects.Sprite | null = null;
  private targets: InteractiveTarget[] = [];
  private activeTarget: InteractiveTarget | null = null;
  private labelLayer!: HTMLDivElement;

  private decorManager!: WorldDecorManager;
  private wildlifeManager!: WildlifeManager;
  private waterSparkles: Phaser.GameObjects.Rectangle[] = [];
  private stepTimer = 0;
  private facing: 'down' | 'up' | 'left' | 'right' = 'down';
  private bakedGroundEpoch = -1;
  private groundImage?: Phaser.GameObjects.Image;
  private warmSunlightOverlay?: Phaser.GameObjects.Rectangle;

  // Mentor positions per chapter across the historical topography of Rome
  private mentorCoords: Record<number, { x: number; y: number }> = {
    1: { x: 31, y: 42 }, // Romulus on the Palatine Hill
    2: { x: 50, y: 34 }, // Brutus at the Republican Forum Romanum
    3: { x: 35, y: 49 }, // Cincinnatus by the plow & fields
    4: { x: 64, y: 24 }, // Scipio Africanus at the Castra Legionis
    5: { x: 48, y: 37 }, // Tiberius Gracchus at the Rostra / Forum
    6: { x: 68, y: 37 }, // Spartacus near the Arena / Gladiators
    7: { x: 55, y: 31 }, // Julius Caesar in front of the Senate Curia
    8: { x: 69, y: 23 }, // Augustus on the Campus Martius / Ara Pacis
    9: { x: 73, y: 43 }, // Claudia near the Insulae & Catacomb path
    10: { x: 76, y: 22 }, // Trajan near the Limes & Imperial Forum
    11: { x: 80, y: 41 }, // Constantine near the Basilica
    12: { x: 54, y: 35 }, // Cassiodorus amid the late-antique Forum & Scriptorium
  };

  constructor() {
    super('World');
  }

  create() {
    this.createCharacterAnimations();
    this.bakeRomanTerrainTexture(gameState.chapter);

    this.groundImage = this.add
      .image(0, 0, 'rome_ground_baked')
      .setOrigin(0, 0)
      .setDepth(0);

    this.decorManager = new WorldDecorManager(this);
    this.wildlifeManager = new WildlifeManager(this);

    // 1. Echter 16-Bit Tiber-Fluss, Küste von Ostia, Ufersteine, Schilf & Holzbrücken (Steinzeit-Standard)
    this.buildRiverAndBridges();

    // 2. 130+ Bodenflora-Details, bemooste Felsen, Eichen & römische Monumente
    this.scatterRomanNature();
    this.buildStaticRomanWorld();

    this.dynamicGroup = this.add.group();
    this.rebuildChapterEntities();

    // 3. Spieler-Spawn
    const texKey = gameState.gender === 'female' ? 'player_female' : 'player_male';
    this.player = this.add
      .sprite(gameState.playerX, gameState.playerY, texKey, 0)
      .setDepth(gameState.playerY);

    // 4. Lebendige Tierwelt (80x80 Ziegen, Rinder, Schmetterlinge & Fische)
    this.wildlifeManager.init(this.mapW, this.mapH);

    // 5. Warme mediterrane Nachmittagssonne (Belichtungs-Overlay)
    this.warmSunlightOverlay = this.add
      .rectangle(0, 0, this.mapW * 16, this.mapH * 16, 0xfef3c7, 0.055)
      .setOrigin(0, 0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(8500);

    // Camera setup
    this.cameras.main.setBounds(0, 0, this.mapW * 16, this.mapH * 16);
    this.cameras.main.startFollow(this.player, true, 0.14, 0.14);
    this.cameras.main.setRoundPixels(true);
    this.updateCameraZoom();
    this.scale.on('resize', () => this.updateCameraZoom());

    // Keyboard Controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D,E') as {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
      E: Phaser.Input.Keyboard.Key;
    };

    this.input.keyboard!.on('keydown-E', () => this.handleAction());

    this.initDOMLabelLayer();

    // Wake / Sleep lifecycle for Catacomb Sub-Scene transitions
    this.events.on('wake', () => {
      const tk = gameState.gender === 'female' ? 'player_female' : 'player_male';
      this.player.setTexture(tk);
      if (this.labelLayer) this.labelLayer.style.display = 'block';
      this.rebuildChapterEntities();
      sound.resumeChapterBGM();
    });

    this.events.on('sleep', () => {
      if (this.labelLayer) {
        this.labelLayer.style.display = 'none';
        this.labelLayer.innerHTML = '';
      }
    });
  }

  public refreshCharacterAppearance() {
    if (!this.player) return;
    const tk = gameState.gender === 'female' ? 'player_female' : 'player_male';
    this.player.setTexture(tk);
    const prefix = gameState.gender === 'female' ? 'female' : 'male';
    this.player.play(`${prefix}_idle_${this.facing}`, true);
  }

  public onChapterChanged() {
    this.bakeRomanTerrainTexture(gameState.chapter);
    if (this.groundImage) {
      this.groundImage.setTexture('rome_ground_baked');
    }
    this.rebuildChapterEntities();
    const mCoord = this.mentorCoords[gameState.chapter] || { x: 31, y: 42 };
    this.player.setPosition((mCoord.x - 2) * 16, (mCoord.y + 1.5) * 16);
    this.player.setDepth(this.player.y);
    gameState.playerX = Math.round(this.player.x);
    gameState.playerY = Math.round(this.player.y);
  }

  private updateCameraZoom() {
    const w = this.scale.width;
    const h = this.scale.height;
    const zoom = w < 900 || h < 500 ? 2.25 : 2.75;
    this.cameras.main.setZoom(zoom);
  }

  private initDOMLabelLayer() {
    let existing = document.getElementById('world-label-layer') as HTMLDivElement | null;
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'world-label-layer';
      existing.style.position = 'fixed';
      existing.style.inset = '0';
      existing.style.pointerEvents = 'none';
      existing.style.zIndex = '15';
      document.body.appendChild(existing);
    }
    this.labelLayer = existing;
    this.labelLayer.style.display = 'block';
  }

  private createCharacterAnimations() {
    const sheets = [
      { key: 'player_male', prefix: 'male' },
      { key: 'player_female', prefix: 'female' },
    ];
    // Spritesheets are 64x128 (4 cols x 4 rows of 16x32):
    // Row 0 (0..3) = down, Row 1 (4..7) = right, Row 2 (8..11) = up, Row 3 (12..15) = left
    const dirs: Array<{ dir: 'down' | 'right' | 'up' | 'left'; start: number }> = [
      { dir: 'down', start: 0 },
      { dir: 'right', start: 4 },
      { dir: 'up', start: 8 },
      { dir: 'left', start: 12 },
    ];
    for (const s of sheets) {
      for (const d of dirs) {
        if (!this.anims.exists(`${s.prefix}_walk_${d.dir}`)) {
          this.anims.create({
            key: `${s.prefix}_walk_${d.dir}`,
            frames: this.anims.generateFrameNumbers(s.key, { start: d.start, end: d.start + 3 }),
            frameRate: 8,
            repeat: -1,
          });
          this.anims.create({
            key: `${s.prefix}_idle_${d.dir}`,
            frames: [{ key: s.key, frame: d.start }],
            frameRate: 1,
          });
        }
      }
    }
  }

  // =========================================================================
  // 16-BIT PER-PIXEL A2 AUTOTILE SAMPLING + BAYER DITHERING (STEINZEIT-REFERENZ)
  // =========================================================================
  private getGroundEpoch(ch: number): number {
    if (ch <= 1) return 1; // 753 BC: Shepherd settlement & natural Palatine/Forum clearing
    if (ch <= 7) return 2; // 509–44 BC: Republican cobblestone Forum & Via Sacra
    if (ch <= 11) return 3; // 27 BC–312 AD: Imperial Marble Forum & Roman Mosaics
    return 4; // 476 AD: Overgrown Late-Antique Marble Plaza
  }

  private isWaterTile(tx: number, ty: number): boolean {
    // Bridges across the Tiber: Pons Milvius (y: 19..21) and Pons Sublicius (y: 40..42)
    if (ty >= 19 && ty <= 21 && tx >= 12 && tx <= 21) return false;
    if (ty >= 40 && ty <= 42 && tx >= 11 && tx <= 21) return false;
    // Ostia Pier (x: 14..21, y: 57..59)
    if (ty >= 57 && ty <= 59 && tx >= 14 && tx <= 21) return false;

    // Tyrrhenian Sea at Ostia (Southwest)
    if (ty >= 55 && tx <= 17) return true;
    // Meandering Tiber River from North to Southwest
    const riverCenter = 16 + Math.round(Math.sin(ty * 0.11) * 2);
    if (ty < 56 && Math.abs(tx - riverCenter) <= 2) return true;
    return false;
  }

  private bakeRomanTerrainTexture(ch: number) {
    const epoch = this.getGroundEpoch(ch);
    if (this.textures.exists('rome_ground_baked') && this.bakedGroundEpoch === epoch) {
      return;
    }
    this.bakedGroundEpoch = epoch;

    const W = this.mapW * 16;
    const H = this.mapH * 16;

    const srcA2 = this.textures.get('ground_a2').getSourceImage() as HTMLImageElement;
    const srcRoman = this.textures.get('roman_a2').getSourceImage() as HTMLImageElement;

    const extractData = (img: HTMLImageElement) => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      return { data: ctx.getImageData(0, 0, img.width, img.height).data, w: img.width };
    };

    const a2 = extractData(srcA2);
    const romA2 = extractData(srcRoman);

    // Samples the 48x48 seamless inner texture of an RPG Maker A2 block (bx: 0..7, by: 0..3)
    const sampleBlock = (
      sheet: { data: Uint8ClampedArray; w: number },
      bx: number,
      by: number,
      px: number,
      py: number,
    ): [number, number, number] => {
      const u = ((px % 48) + 48) % 48;
      const v = ((py % 48) + 48) % 48;
      const sx = bx * 96 + 24 + u;
      const sy = by * 144 + 72 + v;
      const idx = (sy * sheet.w + sx) * 4;
      return [sheet.data[idx], sheet.data[idx + 1], sheet.data[idx + 2]];
    };

    const distToSeg = (
      px: number,
      py: number,
      ax: number,
      ay: number,
      bx: number,
      by: number,
    ): number => {
      const dx = bx - ax;
      const dy = by - ay;
      const l2 = dx * dx + dy * dy;
      if (l2 === 0) return Math.hypot(px - ax, py - ay);
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
      return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    };

    // Organic Roman Road & Path Network (in pixels)
    const roads: Array<[number, number, number, number, number, 'cobble' | 'dirt']> = [
      // Via Sacra (Pons Sublicius -> Palatine -> Forum Romanum -> Colosseum)
      [19 * 16, 41 * 16, 32 * 16, 41 * 16, 15, epoch >= 2 ? 'cobble' : 'dirt'],
      [32 * 16, 41 * 16, 48 * 16, 36 * 16, 16, epoch >= 2 ? 'cobble' : 'dirt'],
      [48 * 16, 36 * 16, 70 * 16, 37 * 16, 16, epoch >= 2 ? 'cobble' : 'dirt'],
      [70 * 16, 37 * 16, 84 * 16, 41 * 16, 14, epoch >= 3 ? 'cobble' : 'dirt'],
      // Via Appia (Forum -> South-East toward Capua & Catacombs)
      [63 * 16, 37 * 16, 65 * 16, 64 * 16, 15, epoch >= 2 ? 'cobble' : 'dirt'],
      [65 * 16, 48 * 16, 82 * 16, 48 * 16, 13, 'dirt'],
      // Via Flaminia / North Quarry & Legion Camp Road
      [52 * 16, 34 * 16, 52 * 16, 15 * 16, 14, epoch >= 2 ? 'cobble' : 'dirt'],
      [32 * 16, 14 * 16, 75 * 16, 14 * 16, 13, 'dirt'],
      [52 * 16, 22 * 16, 76 * 16, 22 * 16, 14, epoch >= 2 ? 'cobble' : 'dirt'],
      // Via Ostiensis (Palatine -> Aventine -> Ostia Harbor)
      [31 * 16, 42 * 16, 23 * 16, 57 * 16, 14, epoch >= 2 ? 'cobble' : 'dirt'],
      // Rural Shepherd & Farm Footpaths on the Palatine / Aventine
      [31 * 16, 42 * 16, 36 * 16, 51 * 16, 13, 'dirt'],
      [36 * 16, 51 * 16, 46 * 16, 51 * 16, 12, 'dirt'],
      // Pons Milvius North Approach
      [19 * 16, 20 * 16, 52 * 16, 20 * 16, 13, 'dirt'],
    ];

    let canvasTex: Phaser.Textures.CanvasTexture;
    if (this.textures.exists('rome_ground_baked')) {
      canvasTex = this.textures.get('rome_ground_baked') as Phaser.Textures.CanvasTexture;
    } else {
      canvasTex = this.textures.createCanvas('rome_ground_baked', W, H)!;
    }
    const outCtx = canvasTex.getContext();
    const outImg = outCtx.createImageData(W, H);
    const out = outImg.data;

    // 4x4 Bayer Dithering Matrix (identisch mit Steinzeit-Referenz!)
    const bayer4 = [
      [0 / 16, 8 / 16, 2 / 16, 10 / 16],
      [12 / 16, 4 / 16, 14 / 16, 6 / 16],
      [3 / 16, 11 / 16, 1 / 16, 9 / 16],
      [15 / 16, 7 / 16, 13 / 16, 5 / 16],
    ];

    // Render in 2x2 pixel clusters just like Steinzeit buildGround()
    for (let y = 0; y < H; y += 2) {
      const ty = y >> 4;
      const riverCenterPx = (16 + Math.sin(ty * 0.11) * 2) * 16 + 8;

      for (let x = 0; x < W; x += 2) {
        const dither = bayer4[(y >> 1) & 3][(x >> 1) & 3] - 0.5;
        const n1 = Math.sin(x * 0.032) * Math.cos(y * 0.032) * 5;
        const n2 = Math.sin((x + y) * 0.02) * 4;
        const jitter = n1 + n2 + dither * 9;

        // 1. Distance to Tiber River & Ostia Sea
        const distRiver = y < 56 * 16 ? Math.abs(x - riverCenterPx) - 36 : 999;
        const distSea =
          y >= 53 * 16 && x <= 22 * 16
            ? Math.max(55 * 16 - y, x - 18 * 16)
            : 999;
        const shoreDist = Math.min(distRiver, distSea) + jitter * 0.65;

        // 2. Distance to Roman Road Network
        let minCobbleD = 999;
        let minDirtD = 999;
        for (const [ax, ay, bx, by, rad, kind] of roads) {
          const d = distToSeg(x, y, ax, ay, bx, by) - rad;
          if (kind === 'cobble') {
            if (d < minCobbleD) minCobbleD = d;
          } else {
            if (d < minDirtD) minDirtD = d;
          }
        }

        // 3. Forum Romanum Plaza (x: 46..65, y: 26..39)
        const forumDx = Math.max(46 * 16 - x, x - 65 * 16, 0);
        const forumDy = Math.max(26 * 16 - y, y - 39 * 16, 0);
        const forumDist = Math.hypot(forumDx, forumDy) + jitter * 0.7;

        // 4. Palatine Shepherd Clearing (x: 26..35, y: 39..45)
        const palDist = Math.hypot(x - 31 * 16, (y - 42 * 16) * 1.25) + jitter;

        // 5. Northern Apennine / Quarry Foothills (y < 13*16)
        const northDist = y - 13 * 16 + jitter * 1.1;

        for (let py = y; py < y + 2 && py < H; py++) {
          for (let px = x; px < x + 2 && px < W; px++) {
            let rgb: [number, number, number];

            if (shoreDist < 16) {
              // Sandy Tiber Riverbank & Ostia Beach (ground_a2 bx=2, by=1)
              rgb =
                shoreDist < 9
                  ? sampleBlock(a2, 2, 1, px, py)
                  : sampleBlock(a2, 1, 0, px, py);
            } else if (forumDist < 6) {
              // Forum Romanum evolves across the 4 historical ground epochs!
              if (epoch === 1) {
                // 753 BC: Grassy shepherd valley with trodden clay footpaths
                rgb =
                  dither > 0.1
                    ? sampleBlock(a2, 1, 0, px, py)
                    : sampleBlock(a2, 1, 1, px, py);
              } else if (epoch === 2) {
                // Republic (509–44 BC): Golden Roman Flagstone & Travertine Forum
                rgb =
                  dither > 0.15
                    ? sampleBlock(romA2, 6, 1, px, py)
                    : sampleBlock(a2, 6, 1, px, py);
              } else if (epoch === 3) {
                // High Empire (27 BC–312 AD): White Carrara Marble + Imperial Mosaic Center
                const inMosaic =
                  Math.abs(px - 54 * 16) < 36 && Math.abs(py - 33 * 16) < 26;
                rgb = inMosaic
                  ? sampleBlock(romA2, 2, 2, px, py)
                  : py < 31 * 16
                    ? sampleBlock(romA2, 3, 3, px, py)
                    : sampleBlock(romA2, 7, 1, px, py);
              } else {
                // 476 AD: Overgrown Marble Plaza with moss & grass breaking through
                const overgrown = Math.sin(px * 0.06) + Math.cos(py * 0.06) + dither > 0.35;
                rgb = overgrown
                  ? sampleBlock(a2, 0, 3, px, py)
                  : sampleBlock(romA2, 7, 1, px, py);
              }
            } else if (minCobbleD + jitter * 0.55 < 0) {
              // Paved Roman Via Sacra / Via Appia (Polygonal Roman Basalt & Natural Cobblestone)
              rgb =
                minCobbleD + jitter * 0.55 < -4
                  ? sampleBlock(romA2, 7, 2, px, py)
                  : sampleBlock(a2, 6, 1, px, py);
            } else if (minDirtD + jitter * 0.65 < 0 || palDist < 42) {
              // Warm trodden clay path & Palatine settlement clearing (ground_a2 bx=1, by=0)
              rgb = sampleBlock(a2, 1, 0, px, py);
            } else if (northDist < 0) {
              // Rocky Northern Quarries & Apennine Foothills
              rgb =
                northDist < -22
                  ? sampleBlock(a2, 2, 3, px, py)
                  : sampleBlock(a2, 5, 1, px, py);
            } else {
              // Lush Mediterranean Grasslands (1,1), Deep Forest Green (0,1) & Moss (0,3) — 1:1 Steinzeit-Referenz!
              const wave =
                Math.sin(x * 0.022 + y * 0.018) * 0.5 +
                Math.cos(x * 0.015 - y * 0.025) * 0.5;
              const edgeBoost =
                (x < 220 ? (220 - x) / 140 : 0) +
                (y < 160 ? (160 - y) / 110 : 0) +
                (x > 1380 ? (x - 1380) / 140 : 0) +
                (y > 1020 ? (y - 1020) / 110 : 0);
              if (wave + edgeBoost + dither * 0.55 > 0.68) {
                rgb = sampleBlock(a2, 0, 3, px, py); // Rich mossy forest floor
              } else if (wave + edgeBoost + dither * 0.55 > 0.22) {
                rgb = sampleBlock(a2, 0, 1, px, py); // Deep forest green
              } else {
                rgb = sampleBlock(a2, 1, 1, px, py); // Lush meadow green
              }
            }

            const oIdx = (py * W + px) * 4;
            out[oIdx] = rgb[0];
            out[oIdx + 1] = rgb[1];
            out[oIdx + 2] = rgb[2];
            out[oIdx + 3] = 255;
          }
        }
      }
    }

    outCtx.putImageData(outImg, 0, 0);
    canvasTex.refresh();
  }

  // =========================================================================
  // REAL 16-BIT WATER, SHORE ROCKS, REEDS & BRIDGES (STEINZEIT BUILD_RIVER)
  // =========================================================================
  private buildRiverAndBridges() {
    this.waterSparkles = [];

    for (let ty = 0; ty < this.mapH; ty++) {
      for (let tx = 0; tx < this.mapW; tx++) {
        if (this.isWaterTile(tx, ty)) {
          this.add
            .image(tx * 16 + 8, ty * 16 + 8, 'overworld', 'water')
            .setDepth(1);

          if ((tx * 7 + ty * 13) % 11 === 0) {
            const sp = this.add
              .rectangle(tx * 16 + 8, ty * 16 + 8, 4, 2, 0xe0f2fe, 0.65)
              .setDepth(3);
            this.waterSparkles.push(sp);
          }
        }
      }
    }

    // Authentic 16-bit Wooden Bridges across the Tiber: Pons Milvius (y=19..21) & Pons Sublicius (y=40..42)
    const bridgeRows = [
      { yStart: 19, yEnd: 21, xStart: 13, xEnd: 19 },
      { yStart: 40, yEnd: 42, xStart: 13, xEnd: 19 },
    ];
    const gBridge = this.add.graphics().setDepth(4);
    for (const br of bridgeRows) {
      const bx = br.xStart * 16;
      const by = br.yStart * 16 + 4;
      const bw = (br.xEnd - br.xStart + 1) * 16;
      const bh = (br.yEnd - br.yStart + 1) * 16 - 8;

      // Dark timber support beams
      gBridge.fillStyle(0x3b2314, 1);
      gBridge.fillRect(bx, by - 2, bw, bh + 4);
      // Warm oak planks
      gBridge.fillStyle(0x8b5a2b, 1);
      gBridge.fillRect(bx + 2, by + 2, bw - 4, bh - 4);
      // Individual plank seams & highlights
      for (let px = bx + 4; px < bx + bw - 4; px += 6) {
        gBridge.fillStyle(0x5c3a21, 1);
        gBridge.fillRect(px, by + 2, 1, bh - 4);
        gBridge.fillStyle(0xa47148, 1);
        gBridge.fillRect(px + 1, by + 3, 2, bh - 6);
      }
      // Handrails top & bottom
      gBridge.fillStyle(0x4a2c18, 1);
      gBridge.fillRect(bx, by, bw, 3);
      gBridge.fillRect(bx, by + bh - 3, bw, 3);
    }

    // Shore rocks & reeds along the Tiber banks (from world_atlas, just like Steinzeit!)
    for (let ty = 4; ty < 54; ty += 3) {
      if ((ty >= 18 && ty <= 22) || (ty >= 39 && ty <= 43)) continue;
      const riverCenter = 16 + Math.round(Math.sin(ty * 0.11) * 2);
      const leftBankX = (riverCenter - 3) * 16 + 6;
      const rightBankX = (riverCenter + 3) * 16 - 4;
      const py = ty * 16 + 8;

      if (ty % 6 === 0) {
        this.add.image(leftBankX, py, 'world', 'reed_1').setDepth(py);
        this.add.image(rightBankX, py + 6, 'world', 'water_rock_1').setDepth(py + 6);
      } else {
        this.add.image(rightBankX, py, 'world', 'reed_2').setDepth(py);
        if (ty % 9 === 0) {
          this.add.image(leftBankX + 4, py, 'world', 'water_rock_2').setDepth(py);
        }
      }
    }
  }

  // =========================================================================
  // 130+ GROUND FLORA, FERNS, FLOWERS, PEBBLES, MOSSY ROCKS & TREES (STEINZEIT)
  // =========================================================================
  private scatterRomanNature() {
    const groundFloraFrames = [
      'grass_s1',
      'grass_s2',
      'grass_s3',
      'grass_s4',
      'fern_1',
      'fern_2',
      'fern_3',
      'fern_4',
      'flower_bunch_a',
      'flower_bunch_b',
      'flower_bunch_c',
      'pebbles_a',
      'pebbles_b',
      'pebbles_c',
    ];

    // Deterministic rich scattering of 145 ground details across all non-water tiles
    let seed = 1337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let i = 0; i < 145; i++) {
      const tx = 6 + Math.floor(rand() * (this.mapW - 12));
      const ty = 8 + Math.floor(rand() * (this.mapH - 14));
      if (this.isWaterTile(tx, ty)) continue;
      // Keep central Forum plaza clean of wild ferns in later chapters
      if (tx >= 46 && tx <= 64 && ty >= 27 && ty <= 38) continue;

      const px = tx * 16 + Math.floor(rand() * 10) - 5;
      const py = ty * 16 + Math.floor(rand() * 10) - 5;
      const frame = groundFloraFrames[i % groundFloraFrames.length];
      this.add.image(px, py, 'world', frame).setDepth(2);
    }

    // Authentic 16-bit deciduous trees ('tree_1', 'tree_2'), bushes ('bush_1', 'bush_2'), and stumps from world_atlas
    const forestTrees: Array<[number, number, string]> = [
      [23, 35, 'tree_1'],
      [26, 34, 'tree_2'],
      [35, 45, 'tree_1'],
      [38, 45, 'tree_2'],
      [22, 48, 'tree_1'],
      [30, 56, 'tree_2'],
      [40, 56, 'tree_1'],
      [50, 55, 'tree_2'],
      [58, 48, 'tree_1'],
      [74, 30, 'tree_2'],
      [82, 28, 'tree_1'],
      [86, 35, 'tree_2'],
      [88, 46, 'tree_1'],
      [77, 54, 'tree_2'],
      [27, 22, 'tree_1'],
      [36, 20, 'tree_2'],
      [41, 22, 'tree_1'],
      [83, 18, 'tree_2'],
    ];
    for (const [tx, ty, frame] of forestTrees) {
      this.add
        .image(tx * 16, ty * 16, 'world', frame)
        .setDepth(ty * 16);
    }

    const bushesAndStumps: Array<[number, number, string]> = [
      [24, 37, 'bush_1'],
      [29, 44, 'bush_2'],
      [34, 47, 'stump_a'],
      [37, 47, 'log_h'],
      [43, 46, 'bush_1'],
      [25, 53, 'bush_2'],
      [49, 43, 'bush_1'],
      [61, 44, 'bush_2'],
      [71, 46, 'stump_b'],
      [79, 36, 'bush_1'],
      [68, 19, 'bush_2'],
      [39, 18, 'stump_c'],
    ];
    for (const [tx, ty, frame] of bushesAndStumps) {
      this.add
        .image(tx * 16, ty * 16, 'world', frame)
        .setDepth(ty * 16);
    }

    // Authentic 16-bit mossy quarry rocks ('rock_moss_a..k') in the Northern Quarries & Palatine cliffs
    const rockSpots: Array<[number, number, string]> = [
      [21, 45, 'rock_moss_a'],
      [23, 46, 'rock_moss_b'],
      [31, 13, 'rock_moss_c'],
      [33, 14, 'rock_moss_d'],
      [43, 13, 'rock_moss_e'],
      [45, 14, 'rock_moss_f'],
      [61, 13, 'rock_moss_g'],
      [63, 14, 'rock_moss_h'],
      [68, 13, 'rock_moss_i'],
      [74, 13, 'rock_moss_j'],
      [76, 14, 'rock_moss_k'],
    ];
    for (const [tx, ty, frame] of rockSpots) {
      this.add
        .image(tx * 16, ty * 16, 'world', frame)
        .setDepth(ty * 16);
    }
  }

  // =========================================================================
  // STATIC ROMAN WORLD TOPOGRAPHY (Hills, Groves, Quarries, Bridges, Harbors)
  // =========================================================================
  private buildStaticRomanWorld() {
    // 1. Palatine Hill & Lupercal Sanctuary (SW of Forum)
    this.placeSprite('statue_lupa_lion', 25, 43, 0.9);
    this.placeSprite('lupa_wolf_sprite', 24, 44.5, 0.9);
    this.placeSprite('temple_vesta', 31, 39, 0.9);
    this.placeSprite('brazier_roman_fire', 31, 41, 1);
    this.decorManager.addTorchGlow(31 * 16, 41 * 16, 32, 0xf97316);

    // Animated campfire on the Palatine shepherd clearing (using world_atlas / objects fire)
    const palFire = this.add.sprite(28 * 16, 43 * 16, 'objects', 'fire0').setDepth(43 * 16);
    if (this.anims.exists('fire')) palFire.play('fire');
    this.decorManager.addTorchGlow(28 * 16, 43 * 16, 36, 0xf59e0b);

    // 2. Capitoline Hill & Temple of Jupiter Optimus Maximus (NW of Forum)
    this.placeSprite('temple_jupiter', 45, 25, 0.95);
    this.placeSprite('temple_mars', 59, 25, 0.9);
    this.placeSprite('brazier_roman_fire', 44, 28, 1);
    this.placeSprite('brazier_roman_fire', 47, 28, 1);
    this.decorManager.addTorchGlow(44 * 16, 28 * 16, 28);
    this.decorManager.addTorchGlow(47 * 16, 28 * 16, 28);

    // 3. Forum Romanum Columns, Rostra & Statues
    const forumCols = [46, 50, 56, 60, 64];
    for (const cx of forumCols) {
      this.placeSprite('column_corinthian', cx, 29, 0.85);
      this.placeSprite('column_corinthian', cx, 38, 0.85);
    }
    this.placeSprite('fountain_marble_large', 52, 34, 0.9);
    this.placeSprite('statue_senator', 48, 32, 0.9);
    this.placeSprite('forum_stall_red', 47, 39, 0.85);
    this.placeSprite('forum_stall_blue', 57, 39, 0.85);

    // 4. Agricultural Estates (Villa Rustica, Olive Grove, Vineyard, Spelt Field with real 16-bit soil!)
    this.placeSprite('villa_rustica', 38, 52, 0.9);
    for (let x = 30; x <= 34; x += 1) {
      for (let y = 51; y <= 54; y += 1) {
        this.add.image(x * 16, y * 16, 'farm', 'soil_wet').setDepth(3);
        if ((x + y) % 2 === 0) {
          this.add.image(x * 16, y * 16 - 6, 'farm', 'wheat_ripe').setDepth(y * 16);
        }
      }
    }
    this.placeSprite('olive_grove_tree', 41, 47, 0.95);
    this.placeSprite('olive_grove_tree', 44, 48, 0.95);
    this.placeSprite('olive_grove_tree', 42, 50, 0.95);
    this.placeSprite('vineyard_row', 45, 52, 0.95);
    this.placeSprite('vineyard_row', 48, 52, 0.95);

    // 5. Harbor of Ostia & Tiber Shipping (SW)
    this.placeSprite('dock_pier', 17, 58, 1);
    this.placeSprite('roman_galley_ship', 12, 59, 0.95);
    this.placeSprite('roman_horreum', 22, 56, 0.85);
    this.placeSprite('roman_amphora_group', 20, 57, 0.9);
    this.placeSprite('roman_cart_goods', 23, 59, 0.9);

    // 6. Northern Quarries & Mines (Anvil & Forge glow)
    this.placeSprite('forge_anvil', 61, 14, 0.95);
    this.decorManager.addTorchGlow(61 * 16, 14 * 16, 26, 0xef4444);

    // 7. Roman Cypresses & Milestones along Via Appia & Via Sacra
    const cypressSpots = [
      { x: 28, y: 37 },
      { x: 40, y: 37 },
      { x: 63, y: 42 },
      { x: 67, y: 46 },
      { x: 63, y: 50 },
      { x: 67, y: 54 },
      { x: 78, y: 34 },
      { x: 85, y: 38 },
      { x: 44, y: 31 },
      { x: 65, y: 31 },
    ];
    cypressSpots.forEach((sp, idx) => {
      this.placeSprite(idx % 2 === 0 ? 'cypress_roman_1' : 'cypress_roman_2', sp.x, sp.y, 0.95);
    });
    this.placeSprite('roman_milestone', 43, 40, 0.9);
    this.placeSprite('roman_milestone', 65, 45, 0.9);
  }

  private placeSprite(key: string, tx: number, ty: number, scale = 1): Phaser.GameObjects.Image {
    return this.add
      .image(tx * 16, ty * 16, key)
      .setScale(scale)
      .setDepth(ty * 16);
  }

  // =========================================================================
  // STRICT 4-POINT CHAPTER GATING (Rebuild Dynamic Chapter Entities)
  // =========================================================================
  public rebuildChapterEntities() {
    this.dynamicGroup.clear(true, true);
    this.targets = [];
    const ch = gameState.chapter;

    // 1. ONLY SPAWN CURRENT CHAPTER'S HISTORICAL MENTOR
    const chapterData = CHAPTERS.find((c) => c.id === ch) || CHAPTERS[0];
    const mPos = this.mentorCoords[ch] || { x: 31, y: 42 };
    this.mentorSprite = this.add
      .sprite(mPos.x * 16, mPos.y * 16, chapterData.mentorId, 0)
      .setDepth(mPos.y * 16);
    this.dynamicGroup.add(this.mentorSprite);

    const questReady = gameState.checkQuest();
    this.targets.push({
      id: `mentor_${ch}`,
      kind: 'mentor',
      name: chapterData.mentorName,
      sub: questReady
        ? `[E] Kapitel-Quiz starten (${chapterData.year})`
        : `[E] Mit ${chapterData.mentorName} sprechen`,
      x: mPos.x * 16,
      y: mPos.y * 16,
      minChapter: ch,
    });

    // 2. CHAPTER-GATED RESOURCE STATIONS, PORTALS & TRADERS
    const allStations: InteractiveTarget[] = [
      {
        id: 'res_tuff_palatin',
        kind: 'resource',
        name: 'Tuffstein-Fels am Palatin',
        sub: '[E] Tuffstein brechen',
        x: 22 * 16,
        y: 45 * 16,
        minChapter: 1,
        itemId: 'tuffstein',
      },
      {
        id: 'res_oak',
        kind: 'resource',
        name: 'Eichenhain am Palatin',
        sub: '[E] Zypressen- & Eichenholz fällen',
        x: 36 * 16,
        y: 46 * 16,
        minChapter: 1,
        itemId: 'holz',
      },
      {
        id: 'res_grain',
        kind: 'resource',
        name: 'Emmer-Ackerfeld (Far)',
        sub: '[E] Emmer-Getreide ernten',
        x: 32 * 16,
        y: 52 * 16,
        minChapter: 1,
        itemId: 'getreide',
      },
      {
        id: 'res_water',
        kind: 'resource',
        name: 'Quelle am Tiberufer',
        sub: '[E] Quellwasser schöpfen',
        x: 22 * 16,
        y: 41 * 16,
        minChapter: 1,
        itemId: 'wasser',
      },
      {
        id: 'res_wool',
        kind: 'resource',
        name: 'Schafweide am Aventin',
        sub: '[E] Schafwolle scheren',
        x: 26 * 16,
        y: 50 * 16,
        minChapter: 1,
        itemId: 'wolle',
      },
      {
        id: 'res_olives',
        kind: 'resource',
        name: 'Sabinischer Olivenhain',
        sub: '[E] Sabiner Oliven ernten',
        x: 42 * 16,
        y: 48 * 16,
        minChapter: 1,
        itemId: 'oliven',
      },
      {
        id: 'res_grapes',
        kind: 'resource',
        name: 'Weinberg von Latium',
        sub: '[E] Weintrauben lesen',
        x: 46 * 16,
        y: 52 * 16,
        minChapter: 1,
        itemId: 'weintrauben',
      },
      {
        id: 'res_tuff',
        kind: 'resource',
        name: 'Vulkanischer Tuff-Steinbruch',
        sub: '[E] Tuffstein brechen',
        x: 44 * 16,
        y: 14 * 16,
        minChapter: 2,
        itemId: 'tuffstein',
      },
      {
        id: 'res_iron',
        kind: 'resource',
        name: 'Etruskische Eisenmine',
        sub: '[E] Etruskisches Eisenerz abbauen',
        x: 62 * 16,
        y: 14 * 16,
        minChapter: 2,
        itemId: 'eisenerz',
      },
      {
        id: 'ostia_trader',
        kind: 'trader',
        name: 'Fernhändler in Ostia',
        sub: '[E] Seehandel im Mare Nostrum öffnen',
        x: 20 * 16,
        y: 58 * 16,
        minChapter: 4,
      },
      {
        id: 'res_silver',
        kind: 'resource',
        name: 'Hispanische Silbermine',
        sub: '[E] Silbererz schürfen',
        x: 75 * 16,
        y: 14 * 16,
        minChapter: 7,
        itemId: 'silbererz',
      },
      {
        id: 'res_marble',
        kind: 'resource',
        name: 'Marmor-Steinbruch (Carrara)',
        sub: '[E] Carrara-Marmor brechen',
        x: 32 * 16,
        y: 14 * 16,
        minChapter: 8,
        itemId: 'marmor',
      },
      {
        id: 'catacomb_portal',
        kind: 'portal',
        name: 'Katakomben & Mithräum',
        sub: '[E] Hinabsteigen in Roms Untergrund',
        x: 82 * 16,
        y: 48 * 16,
        minChapter: 9,
      },
    ];

    for (const st of allStations) {
      if (st.minChapter <= ch) {
        this.targets.push(st);
        if (st.kind === 'portal') {
          const catImg = this.add
            .image(st.x, st.y, 'catacomb_entrance')
            .setDepth(st.y);
          this.dynamicGroup.add(catImg);
        } else if (st.kind === 'trader') {
          const traderSpr = this.add
            .sprite(st.x, st.y, 'npc_guard', 0)
            .setDepth(st.y);
          this.dynamicGroup.add(traderSpr);
        }
      }
    }

    // 3. CHAPTER-GATED ARCHAEOLOGICAL RELICS (ROMAN_RELICS)
    for (const relic of ROMAN_RELICS) {
      if (relic.minChapter <= ch && !gameState.hasRelic(relic.id)) {
        const chest = this.add
          .image(relic.x * 16, relic.y * 16, 'roman_relic_chest')
          .setDepth(relic.y * 16);
        const aura = this.add
          .circle(relic.x * 16, relic.y * 16, 12, 0xfbbf24, 0.25)
          .setDepth(relic.y * 16 - 1);
        this.dynamicGroup.add(chest);
        this.dynamicGroup.add(aura);

        this.targets.push({
          id: relic.id,
          kind: 'relic',
          name: 'Archäologisches Relikt',
          sub: `[E] ${relic.name} untersuchen`,
          x: relic.x * 16,
          y: relic.y * 16,
          minChapter: relic.minChapter,
          relic,
        });
      }
    }

    // 4. CHAPTER-GATED SETTLEMENT BUILDINGS & EPOCH ARCHITECTURE
    const buildingCoords: Record<string, { x: number; y: number; sprite: string; scale: number }> = {
      vesta_herd: { x: 33, y: 40, sprite: 'roman_horreum', scale: 0.85 },
      curia_senat: { x: 54, y: 28, sprite: 'curia_senate', scale: 0.9 },
      legion_schmiede: { x: 66, y: 21, sprite: 'praetorium_tent', scale: 0.9 },
      ostia_werft: { x: 19, y: 55, sprite: 'roman_galley_ship', scale: 0.9 },
      aqua_romana: { x: 62, y: 33, sprite: 'aqueduct_bridge', scale: 0.85 },
      kolosseum_bau: { x: 71, y: 36, sprite: 'colosseum_arena', scale: 0.85 },
      basilika_bau: { x: 83, y: 40, sprite: 'basilica_constantine', scale: 0.9 },
    };

    for (const b of BUILDINGS) {
      const bc = buildingCoords[b.id];
      if (!bc) continue;

      if (gameState.isBuilt(b.id)) {
        const bImg = this.add
          .image(bc.x * 16, bc.y * 16, bc.sprite)
          .setScale(bc.scale)
          .setDepth(bc.y * 16);
        this.dynamicGroup.add(bImg);

        if (b.id === 'legion_schmiede') {
          this.dynamicGroup.add(
            this.add.image((bc.x - 3) * 16, (bc.y + 1) * 16, 'legion_tent_red').setDepth((bc.y + 1) * 16),
          );
          this.dynamicGroup.add(
            this.add.image((bc.x + 3) * 16, (bc.y + 1) * 16, 'legion_aquila_banner').setDepth((bc.y + 1) * 16),
          );
        }
      } else if (b.minChapter <= ch) {
        const plot = this.add
          .image(bc.x * 16, bc.y * 16, 'farm', 'sign_build')
          .setDepth(bc.y * 16);
        this.dynamicGroup.add(plot);
        this.targets.push({
          id: `plot_${b.id}`,
          kind: 'building_plot',
          name: `Bauplatz: ${b.name}`,
          sub: '[E] / [B] Bauwerk errichten',
          x: bc.x * 16,
          y: bc.y * 16,
          minChapter: b.minChapter,
          buildingId: b.id,
        });
      }
    }

    // Epoch-specific visual landmarks
    if (ch >= 4) {
      this.dynamicGroup.add(
        this.add.image(61 * 16, 21 * 16, 'roman_catapult').setScale(0.85).setDepth(21 * 16),
      );
      if (ch === 4) {
        this.dynamicGroup.add(
          this.add.image(59 * 16, 23 * 16, 'hannibal_elephant_sprite').setScale(0.9).setDepth(23 * 16),
        );
      }
    }
    if (ch >= 6) {
      this.dynamicGroup.add(
        this.add.image(67 * 16, 39 * 16, 'gladiator_weapon_rack').setDepth(39 * 16),
      );
      this.dynamicGroup.add(
        this.add.image(69 * 16, 39 * 16, 'statue_gladiator').setDepth(39 * 16),
      );
    }
    if (ch >= 7) {
      this.dynamicGroup.add(
        this.add.image(52 * 16, 39 * 16, 'triumphal_arch').setScale(0.85).setDepth(39 * 16),
      );
    }
    if (ch >= 8) {
      this.dynamicGroup.add(
        this.add.image(69 * 16, 28 * 16, 'pantheon_front').setScale(0.85).setDepth(28 * 16),
      );
      this.dynamicGroup.add(
        this.add.image(71 * 16, 22 * 16, 'ara_pacis_altar').setScale(0.85).setDepth(22 * 16),
      );
    }
    if (ch === 12) {
      this.dynamicGroup.add(
        this.add.image(49 * 16, 36 * 16, 'ruined_column_fallen').setDepth(36 * 16),
      );
      this.dynamicGroup.add(
        this.add.image(58 * 16, 36 * 16, 'ruined_arch_476').setScale(0.85).setDepth(36 * 16),
      );
    }
  }

  // =========================================================================
  // INTERACTION HANDLER ([E] Key or Touch Action Button)
  // =========================================================================
  private handleAction() {
    const ui = this.scene.get('UI') as UIScene;
    if (!this.activeTarget || ui.isModalOpen()) return;

    const t = this.activeTarget;

    if (t.kind === 'mentor') {
      sound.click();
      ui.openMentorInteraction();
      return;
    }

    if (t.kind === 'resource' && t.itemId) {
      sound.pickup();
      const added = gameState.addItem(t.itemId, 1, true);
      const itemDef = ITEMS[t.itemId];
      const bonusNote = added > 1 ? ` (inkl. Rollen-Bonus!)` : '';
      ui.showToast(`+${added} ${itemDef.name} gesammelt${bonusNote}`);
      this.spawnFloatingText(t.x, t.y - 12, `+${added} ${itemDef.name}`);
      this.refreshMentorMarker();
      return;
    }

    if (t.kind === 'relic' && t.relic) {
      sound.click();
      ui.openRelicModal(t.relic);
      return;
    }

    if (t.kind === 'trader') {
      sound.click();
      ui.toggleModal('trade');
      return;
    }

    if (t.kind === 'building_plot') {
      sound.click();
      ui.toggleModal('build');
      return;
    }

    if (t.kind === 'portal') {
      sound.click();
      if (this.labelLayer) {
        this.labelLayer.style.display = 'none';
        this.labelLayer.innerHTML = '';
      }
      this.scene.sleep('World');
      this.scene.run('Catacomb');
      ui.showToast('Du steigst hinab in die unterirdischen Katakomben Roms...');
    }
  }

  public refreshMentorMarker() {
    // Mentor nameplate automatically reflects quest state in renderWorldDOMLabels()
  }

  private spawnFloatingText(x: number, y: number, msg: string) {
    const txt = this.add
      .text(x, y, msg, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#fef08a',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(9800);

    this.tweens.add({
      targets: txt,
      y: y - 22,
      alpha: 0,
      duration: 950,
      onComplete: () => txt.destroy(),
    });
  }

  // =========================================================================
  // GAME LOOP: Movement, Collision, Wildlife & Floating Rounded Nameplates
  // =========================================================================
  update(time: number, delta: number) {
    const ui = this.scene.get('UI') as UIScene;
    if (ui && ui.isModalOpen()) {
      const prefix = gameState.gender === 'female' ? 'female' : 'male';
      this.player.play(`${prefix}_idle_${this.facing}`, true);
      if (this.labelLayer) this.labelLayer.innerHTML = '';
      return;
    }

    this.decorManager.update(time);
    this.wildlifeManager.update(time, delta);

    // Water shimmer animation
    for (let i = 0; i < this.waterSparkles.length; i++) {
      const sp = this.waterSparkles[i];
      sp.alpha = 0.25 + Math.sin(time * 0.004 + i) * 0.35;
    }

    const dt = delta / 1000;
    const speed = 92;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;

    if (ui && ui.touchControls) {
      vx += ui.touchControls.dx;
      vy += ui.touchControls.dy;
      if (ui.touchControls.consumeAction()) {
        this.handleAction();
      }
    }

    const prefix = gameState.gender === 'female' ? 'female' : 'male';
    const len = Math.hypot(vx, vy);
    if (len > 0) {
      vx = (vx / len) * speed;
      vy = (vy / len) * speed;

      const nextX = Phaser.Math.Clamp(this.player.x + vx * dt, 24, (this.mapW - 2) * 16);
      const nextY = Phaser.Math.Clamp(this.player.y + vy * dt, 24, (this.mapH - 2) * 16);

      const tileX = Math.floor(nextX / 16);
      const tileY = Math.floor(nextY / 16);

      if (!this.isWaterTile(tileX, tileY)) {
        this.player.setPosition(nextX, nextY);
        this.player.setDepth(this.player.y);
        gameState.playerX = Math.round(this.player.x);
        gameState.playerY = Math.round(this.player.y);
      }

      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx < 0 ? 'left' : 'right';
      } else {
        this.facing = vy < 0 ? 'up' : 'down';
      }

      this.player.play(`${prefix}_walk_${this.facing}`, true);

      this.stepTimer -= delta;
      if (this.stepTimer <= 0) {
        sound.step();
        this.stepTimer = 270;
      }
    } else {
      this.player.play(`${prefix}_idle_${this.facing}`, true);
    }

    // Single-Proximity Target Detection (< 46px)
    let closest: InteractiveTarget | null = null;
    let bestDist = 46;
    for (const t of this.targets) {
      const d = Math.hypot(this.player.x - t.x, this.player.y - t.y);
      if (d < bestDist) {
        bestDist = d;
        closest = t;
      }
    }
    this.activeTarget = closest;
    this.renderWorldDOMLabels();
  }

  /**
   * Rendert abgerundete schwebende Namensschilder (wie im Steinzeit-Referenzbild media_1792253280030.png)
   * für den Spieler, den aktuellen Kapitel-Mentor sowie das nächste Interaktionsziel (< 46px).
   */
  private renderWorldDOMLabels() {
    if (!this.labelLayer) return;
    const canvas = this.game.canvas;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cam = this.cameras.main;

    const toScreen = (wx: number, wy: number) => ({
      sx: ((wx - cam.worldView.x) / cam.worldView.width) * rect.width + rect.left,
      sy: ((wy - cam.worldView.y) / cam.worldView.height) * rect.height + rect.top,
    });

    const pills: string[] = [];

    // 1. Floating Nameplate over Player (Sippenkind / Titus Valerius style)
    const pPos = toScreen(this.player.x, this.player.y - 20);
    if (pPos.sy > rect.top + 95 && pPos.sy < rect.bottom - 50) {
      pills.push(`
        <div class="floating-nameplate player-plate" style="left:${Math.round(pPos.sx)}px;top:${Math.round(pPos.sy)}px;">
          ${this.escapeHtml(gameState.playerName)}
        </div>
      `);
    }

    // 2. Floating Nameplate over Active Historical Mentor (Älteste Ota style)
    if (this.mentorSprite) {
      const chData = CHAPTERS.find((c) => c.id === gameState.chapter) || CHAPTERS[0];
      const questReady = gameState.checkQuest();
      const mPos = toScreen(this.mentorSprite.x, this.mentorSprite.y - 22);
      if (
        mPos.sx > rect.left + 30 &&
        mPos.sx < rect.right - 30 &&
        mPos.sy > rect.top + 95 &&
        mPos.sy < rect.bottom - 50 &&
        (!this.activeTarget || this.activeTarget.kind !== 'mentor')
      ) {
        const badge = questReady ? '❓ ' : '❗ ';
        pills.push(`
          <div class="floating-nameplate mentor-plate ${questReady ? 'ready' : ''}" style="left:${Math.round(mPos.sx)}px;top:${Math.round(mPos.sy)}px;">
            ${badge}${this.escapeHtml(chData.mentorName)}
          </div>
        `);
      }
    }

    // 3. Single-Proximity Action Pill (< 46px)
    if (this.activeTarget) {
      const tPos = toScreen(this.activeTarget.x, this.activeTarget.y - 24);
      pills.push(`
        <div class="world-dom-label" style="left:${Math.round(tPos.sx)}px;top:${Math.round(tPos.sy)}px;">
          <div class="world-dom-label-title">${this.escapeHtml(this.activeTarget.name)}</div>
          <div class="world-dom-label-sub">${this.escapeHtml(this.activeTarget.sub)}</div>
        </div>
      `);
    }

    this.labelLayer.innerHTML = pills.join('');
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
