import Phaser from 'phaser';
import { sound } from '../audio/sound';
import { CHAPTERS } from '../data/chapters';
import { BUILDINGS, ITEMS, RomanItemId } from '../data/items';
import { ROMAN_RELICS, RomanRelic } from '../data/relics';
import { gameState } from '../systems/GameState';
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

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

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
  private mentorMarker: Phaser.GameObjects.Text | null = null;
  private targets: InteractiveTarget[] = [];
  private activeTarget: InteractiveTarget | null = null;
  private labelLayer!: HTMLDivElement;

  private decorManager!: WorldDecorManager;
  private wildlifeManager!: WildlifeManager;
  private waterSparkles: Phaser.GameObjects.Rectangle[] = [];
  private stepTimer = 0;
  private facing: 'down' | 'up' | 'left' | 'right' = 'down';

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
    this.bakeRomanTerrainTexture();

    this.add
      .image(0, 0, 'rome_ground_baked')
      .setOrigin(0, 0)
      .setDepth(0);

    this.createWaterSparkles();

    this.decorManager = new WorldDecorManager(this);
    this.wildlifeManager = new WildlifeManager(this);

    this.buildStaticRomanWorld();

    this.dynamicGroup = this.add.group();
    this.rebuildChapterEntities();

    // Spawn Player
    const texKey = gameState.gender === 'female' ? 'player_female' : 'player_male';
    this.player = this.add
      .sprite(gameState.playerX, gameState.playerY, texKey, 0)
      .setDepth(gameState.playerY);

    // Initialize Living Wildlife
    this.wildlifeManager.init(this.mapW, this.mapH);

    // Camera setup
    this.cameras.main.setBounds(0, 0, this.mapW * 16, this.mapH * 16);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
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
  }

  public onChapterChanged() {
    this.rebuildChapterEntities();
    const mCoord = this.mentorCoords[gameState.chapter] || { x: 34, y: 42 };
    this.player.setPosition((mCoord.x - 2) * 16, (mCoord.y + 2) * 16);
    gameState.playerX = this.player.x;
    gameState.playerY = this.player.y;
  }

  private updateCameraZoom() {
    const w = this.scale.width;
    const h = this.scale.height;
    const zoom = w < 900 || h < 500 ? 2.25 : 2.85;
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
    for (const s of sheets) {
      if (!this.anims.exists(`${s.prefix}_walk_down`)) {
        this.anims.create({
          key: `${s.prefix}_walk_down`,
          frames: this.anims.generateFrameNumbers(s.key, { start: 0, end: 3 }),
          frameRate: 8,
          repeat: -1,
        });
        this.anims.create({
          key: `${s.prefix}_walk_left`,
          frames: this.anims.generateFrameNumbers(s.key, { start: 4, end: 7 }),
          frameRate: 8,
          repeat: -1,
        });
        this.anims.create({
          key: `${s.prefix}_walk_right`,
          frames: this.anims.generateFrameNumbers(s.key, { start: 8, end: 11 }),
          frameRate: 8,
          repeat: -1,
        });
        this.anims.create({
          key: `${s.prefix}_walk_up`,
          frames: this.anims.generateFrameNumbers(s.key, { start: 12, end: 15 }),
          frameRate: 8,
          repeat: -1,
        });
      }
    }
  }

  // =========================================================================
  // 16-BIT A2 GROUND TILESET SAMPLING + 4x4 BAYER DITHERING TERRAIN BAKER
  // =========================================================================
  private isWaterTile(tx: number, ty: number): boolean {
    // Bridges across the Tiber: Pons Milvius (y: 19..21) and Pons Sublicius / Tiber Island (y: 40..42)
    if (ty >= 19 && ty <= 21 && tx >= 12 && tx <= 21) return false;
    if (ty >= 40 && ty <= 42 && tx >= 11 && tx <= 21) return false;
    // Ostia Pier (x: 15..21, y: 57..59)
    if (ty >= 57 && ty <= 59 && tx >= 15 && tx <= 21) return false;

    // Tyrrhenian Sea at Ostia (Southwest)
    if (ty >= 54 && tx <= 18) return true;
    // Meandering Tiber River from North to Southwest
    const riverCenter = 16 + Math.round(Math.sin(ty * 0.11) * 2);
    if (ty < 56 && Math.abs(tx - riverCenter) <= 2) return true;
    return false;
  }

  private bakeRomanTerrainTexture() {
    if (this.textures.exists('rome_ground_baked')) return;

    const canvasTex = this.textures.createCanvas(
      'rome_ground_baked',
      this.mapW * 16,
      this.mapH * 16
    )!;
    const ctx = canvasTex.getContext();
    ctx.imageSmoothingEnabled = false;

    const a2Img = this.textures.get('tiles_a2_ground').getSourceImage() as HTMLImageElement;

    const drawA2Block = (bx: number, by: number, tx: number, ty: number) => {
      const px = tx * 16;
      const py = ty * 16;
      if (a2Img && a2Img.complete && a2Img.width >= 768) {
        const u = ((tx * 16) % 48 + 48) % 48;
        const v = ((ty * 16) % 48 + 48) % 48;
        const sx = bx * 96 + 24 + u;
        const sy = by * 144 + 72 + v;
        ctx.drawImage(a2Img, sx, sy, 16, 16, px, py, 16, 16);
      } else {
        ctx.fillStyle = bx === 2 ? '#e5c07b' : bx === 3 ? '#78716c' : bx >= 6 ? '#d6d3d1' : '#4d7c0f';
        ctx.fillRect(px, py, 16, 16);
      }
    };

    for (let ty = 0; ty < this.mapH; ty++) {
      for (let tx = 0; tx < this.mapW; tx++) {
        const px = tx * 16;
        const py = ty * 16;
        const bayerVal = BAYER_4X4[ty % 4][tx % 4] / 16;

        // 1. Water: Tiber River & Ostia Coast
        if (this.isWaterTile(tx, ty)) {
          const deep = tx <= 10 && ty >= 58;
          ctx.fillStyle = deep ? '#0369a1' : '#0284c7';
          ctx.fillRect(px, py, 16, 16);
          ctx.fillStyle = deep ? '#0284c7' : '#38bdf8';
          ctx.fillRect(px + ((tx * 3) % 10), py + ((ty * 5) % 12), 5, 2);
          continue;
        }

        // 2. Bridges over the Tiber
        if (
          (ty >= 19 && ty <= 21 && tx >= 13 && tx <= 19) ||
          (ty >= 40 && ty <= 42 && tx >= 13 && tx <= 19)
        ) {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(px, py, 16, 16);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(px + 1, py + 2, 14, 12);
          ctx.fillStyle = '#451a03';
          ctx.fillRect(px, py, 16, 2);
          ctx.fillRect(px, py + 14, 16, 2);
          continue;
        }

        // 3. Sandy Tiber Riverbank & Ostia Beach -> (bx=2, by=1)
        const riverCenter = 16 + Math.round(Math.sin(ty * 0.11) * 2);
        const nearRiver = Math.abs(tx - riverCenter) <= 3 + (bayerVal > 0.55 ? 1 : 0);
        const nearSea = ty >= 52 && tx <= 22 + (bayerVal > 0.55 ? 1 : 0);
        if (nearRiver || nearSea) {
          drawA2Block(2, 1, tx, ty);
          continue;
        }

        // 4. Paved Roman Roads: Via Sacra, Via Appia, Via Flaminia -> (bx=6, by=1) + stone cobbles
        const onHorizontalRoad = ty >= 39 && ty <= 41 && tx >= 20 && tx <= 86;
        const onNorthRoad = tx >= 51 && tx <= 53 && ty >= 15 && ty <= 40;
        const onViaAppia = tx >= 64 && tx <= 66 && ty >= 40 && ty <= 66;
        if (onHorizontalRoad || onNorthRoad || onViaAppia) {
          drawA2Block(1, 0, tx, ty);
          ctx.fillStyle = 'rgba(87, 83, 78, 0.45)';
          ctx.fillRect(px + 1, py + 1, 6, 6);
          ctx.fillRect(px + 9, py + 9, 6, 6);
          continue;
        }

        // 5. Forum Romanum & Imperial Marble Plaza (x: 45..66, y: 27..39) -> (bx=6/7, by=1)
        const inForum =
          tx >= 45 + (bayerVal > 0.6 ? 1 : 0) &&
          tx <= 66 - (bayerVal > 0.6 ? 1 : 0) &&
          ty >= 27 + (bayerVal > 0.6 ? 1 : 0) &&
          ty <= 39;
        if (inForum) {
          const isCapitol = ty <= 30;
          drawA2Block(isCapitol ? 7 : 6, 1, tx, ty);
          continue;
        }

        // 6. Northern Quarries & Apennine Foothills (y <= 16) -> (bx=3, by=1)
        if (ty <= 16 + (bayerVal > 0.45 ? 1 : 0)) {
          drawA2Block(3, 1, tx, ty);
          continue;
        }

        // 7. Palatine Hill Earth & Agricultural Fields -> (bx=1, by=1) or (bx=0, by=1)
        const wave =
          Math.sin(tx * 0.35 + ty * 0.28) * 0.5 +
          Math.cos(tx * 0.22 - ty * 0.31) * 0.5;
        const grassBx = wave + (bayerVal - 0.5) * 0.6 > 0.2 ? 0 : 1;
        drawA2Block(grassBx, 1, tx, ty);
      }
    }

    canvasTex.refresh();
  }

  private createWaterSparkles() {
    for (let i = 0; i < 35; i++) {
      const ty = Math.floor(Math.random() * 70) + 2;
      const riverCenter = 16 + Math.round(Math.sin(ty * 0.11) * 2);
      const tx = ty > 55 ? Math.floor(Math.random() * 15) + 2 : riverCenter + (Math.floor(Math.random() * 3) - 1);
      if (this.isWaterTile(tx, ty)) {
        const rect = this.add
          .rectangle(tx * 16 + 8, ty * 16 + 8, 3, 2, 0xe0f2fe, 0.75)
          .setDepth(5);
        this.waterSparkles.push(rect);
      }
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
    this.decorManager.addTorchGlow(31 * 16, 41 * 16, 28, 0xf97316);

    // 2. Capitoline Hill & Temple of Jupiter Optimus Maximus (NW of Forum)
    this.placeSprite('temple_jupiter', 45, 25, 0.95);
    this.placeSprite('temple_mars', 59, 25, 0.9);
    this.placeSprite('brazier_roman_fire', 44, 28, 1);
    this.placeSprite('brazier_roman_fire', 47, 28, 1);
    this.decorManager.addTorchGlow(44 * 16, 28 * 16, 26);
    this.decorManager.addTorchGlow(47 * 16, 28 * 16, 26);

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

    // 4. Agricultural Estates (Villa Rustica, Olive Grove, Vineyard, Spelt Field)
    this.placeSprite('villa_rustica', 38, 52, 0.9);
    for (let x = 30; x <= 34; x += 2) {
      for (let y = 51; y <= 54; y += 1.5) {
        this.placeSprite('crop_wheat', x, y, 1);
      }
    }
    this.placeSprite('olive_grove_tree', 41, 47, 0.95);
    this.placeSprite('olive_grove_tree', 44, 48, 0.95);
    this.placeSprite('vineyard_row', 45, 52, 0.95);
    this.placeSprite('vineyard_row', 48, 52, 0.95);
    this.placeSprite('tree_oak_1', 35, 46, 1);
    this.placeSprite('tree_oak_2', 38, 46, 1);

    // 5. Harbor of Ostia & Tiber Shipping (SW)
    this.placeSprite('dock_pier', 17, 58, 1);
    this.placeSprite('roman_galley_ship', 12, 59, 0.95);
    this.placeSprite('roman_horreum', 22, 56, 0.85);
    this.placeSprite('roman_amphora_group', 20, 57, 0.9);
    this.placeSprite('roman_cart_goods', 23, 59, 0.9);

    // 6. Northern Quarries & Mines (Carrara Marble, Volcanic Tuff, Iron/Copper/Gold)
    this.placeSprite('rock_med_1', 31, 13, 1.2);
    this.placeSprite('rock_med_2', 33, 14, 1.2);
    this.placeSprite('rock_med_1', 43, 13, 1.2);
    this.placeSprite('rock_med_2', 45, 14, 1.2);
    this.placeSprite('forge_anvil', 61, 14, 0.95);
    this.placeSprite('rock_med_1', 63, 13, 1.1);
    this.placeSprite('rock_med_2', 68, 13, 1.1);
    this.placeSprite('rock_med_1', 75, 13, 1.1);

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

    // -----------------------------------------------------------------------
    // 1. ONLY SPAWN CURRENT CHAPTER'S HISTORICAL MENTOR
    // -----------------------------------------------------------------------
    const chapterData = CHAPTERS.find((c) => c.id === ch) || CHAPTERS[0];
    const mPos = this.mentorCoords[ch] || { x: 34, y: 42 };
    this.mentorSprite = this.add
      .sprite(mPos.x * 16, mPos.y * 16, chapterData.mentorId, 0)
      .setDepth(mPos.y * 16);
    this.dynamicGroup.add(this.mentorSprite);

    const questReady = gameState.checkQuest();
    this.mentorMarker = this.add
      .text(
        mPos.x * 16,
        mPos.y * 16 - 24,
        questReady ? '❓ Quiz bereit!' : '❗ Aufgabe',
        {
          fontFamily: ' Cinzel, Georgia, serif',
          fontSize: '10px',
          fontStyle: 'bold',
          color: questReady ? '#4ade80' : '#fbbf24',
          backgroundColor: '#0f172acc',
          padding: { x: 4, y: 2 },
        }
      )
      .setOrigin(0.5)
      .setDepth(9500);
    this.dynamicGroup.add(this.mentorMarker);

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

    // -----------------------------------------------------------------------
    // 2. CHAPTER-GATED RESOURCE STATIONS, PORTALS & TRADERS
    // -----------------------------------------------------------------------
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

    // -----------------------------------------------------------------------
    // 3. CHAPTER-GATED ARCHAEOLOGICAL RELICS (ROMAN_RELICS)
    // -----------------------------------------------------------------------
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

    // -----------------------------------------------------------------------
    // 4. CHAPTER-GATED SETTLEMENT BUILDINGS & EPOCH ARCHITECTURE
    // -----------------------------------------------------------------------
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

        // Extra camp details when legion camp is built
        if (b.id === 'legion_schmiede') {
          this.dynamicGroup.add(
            this.add.image((bc.x - 3) * 16, (bc.y + 1) * 16, 'legion_tent_red').setDepth((bc.y + 1) * 16)
          );
          this.dynamicGroup.add(
            this.add.image((bc.x + 3) * 16, (bc.y + 1) * 16, 'legion_aquila_banner').setDepth((bc.y + 1) * 16)
          );
        }
      } else if (b.minChapter <= ch) {
        // Unbuilt construction plot for current/unlocked chapter
        const plot = this.add
          .rectangle(bc.x * 16, bc.y * 16, 36, 24, 0x78350f, 0.45)
          .setStrokeStyle(1, 0xfbbf24, 0.85)
          .setDepth(10);
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

    // Epoch-specific visual landmarks (No future leaks in early chapters!)
    if (ch >= 4) {
      // Punic Wars: Hannibal's elephant trophy / military equipment near camp
      this.dynamicGroup.add(
        this.add.image(61 * 16, 21 * 16, 'roman_catapult').setScale(0.85).setDepth(21 * 16)
      );
    }
    if (ch >= 6) {
      // Gladiator training ground (Spartacus)
      this.dynamicGroup.add(
        this.add.image(67 * 16, 39 * 16, 'gladiator_weapon_rack').setDepth(39 * 16)
      );
      this.dynamicGroup.add(
        this.add.image(69 * 16, 39 * 16, 'statue_gladiator').setDepth(39 * 16)
      );
    }
    if (ch >= 7) {
      // Triumphal Arch & Caesar Bust
      this.dynamicGroup.add(
        this.add.image(52 * 16, 39 * 16, 'triumphal_arch').setScale(0.85).setDepth(39 * 16)
      );
    }
    if (ch >= 8) {
      // Imperial Rome: Pantheon & Ara Pacis
      this.dynamicGroup.add(
        this.add.image(69 * 16, 28 * 16, 'pantheon_front').setScale(0.85).setDepth(28 * 16)
      );
      this.dynamicGroup.add(
        this.add.image(71 * 16, 22 * 16, 'ara_pacis_altar').setScale(0.85).setDepth(22 * 16)
      );
    }
    if (ch === 12) {
      // 476 AD Late Antiquity: Overgrown ruins beside the Christian Scriptorium
      this.dynamicGroup.add(
        this.add.image(49 * 16, 36 * 16, 'ruined_column_fallen').setDepth(36 * 16)
      );
      this.dynamicGroup.add(
        this.add.image(58 * 16, 36 * 16, 'ruined_arch_476').setScale(0.85).setDepth(36 * 16)
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
    if (!this.mentorMarker) return;
    const ready = gameState.checkQuest();
    this.mentorMarker.setText(ready ? '❓ Quiz bereit!' : '❗ Aufgabe');
    this.mentorMarker.setColor(ready ? '#4ade80' : '#fbbf24');
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
  // GAME LOOP: Movement, Collision, Wildlife & Single-Proximity DOM Label
  // =========================================================================
  update(time: number, delta: number) {
    const ui = this.scene.get('UI') as UIScene;
    if (ui && ui.isModalOpen()) {
      this.player.anims.stop();
      return;
    }

    this.decorManager.update(time);
    this.wildlifeManager.update(time, delta);

    // Water shimmer animation
    for (let i = 0; i < this.waterSparkles.length; i++) {
      const sp = this.waterSparkles[i];
      sp.alpha = 0.35 + Math.sin(time * 0.005 + i) * 0.35;
    }

    const dt = delta / 1000;
    const speed = 88;
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

      const prefix = gameState.gender === 'female' ? 'female' : 'male';
      this.player.play(`${prefix}_walk_${this.facing}`, true);

      this.stepTimer -= delta;
      if (this.stepTimer <= 0) {
        sound.step();
        this.stepTimer = 270;
      }
    } else {
      this.player.anims.stop();
    }

    // Single-Proximity Target Detection (< 44px)
    let closest: InteractiveTarget | null = null;
    let bestDist = 44;
    for (const t of this.targets) {
      const d = Math.hypot(this.player.x - t.x, this.player.y - t.y);
      if (d < bestDist) {
        bestDist = d;
        closest = t;
      }
    }
    this.activeTarget = closest;
    this.renderSingleProximityDOMLabel();
  }

  private renderSingleProximityDOMLabel() {
    if (!this.labelLayer) return;
    if (!this.activeTarget) {
      this.labelLayer.innerHTML = '';
      return;
    }

    const cam = this.cameras.main;
    const screenX = (this.activeTarget.x - cam.worldView.x) * cam.zoom;
    const screenY = (this.activeTarget.y - 22 - cam.worldView.y) * cam.zoom;

    this.labelLayer.innerHTML = `
      <div class="world-dom-label" style="left:${Math.round(screenX)}px;top:${Math.round(screenY)}px;">
        <div class="world-dom-label-title">${this.activeTarget.name}</div>
        <div class="world-dom-label-sub">${this.activeTarget.sub}</div>
      </div>
    `;
  }
}
