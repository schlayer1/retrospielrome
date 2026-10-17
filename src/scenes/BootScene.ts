import Phaser from 'phaser';
import { state } from '../systems/GameState';

/** Benannte Ausschnitte (x, y, w, h in Pixeln) aus gfx/Overworld.png. */
export const OVERWORLD_FRAMES: Record<string, [number, number, number, number]> = {
  grass: [0, 0, 16, 16],
  water: [16, 16, 16, 16],
  rocks: [68, 24, 24, 22],
  bush: [81, 256, 30, 26],
  flowers: [0, 128, 16, 16],
  langhaus: [96, 0, 80, 80],
  speicher_hut: [208, 64, 32, 48],
  fence_h: [16, 288, 32, 16],
  cave_entrance: [208, 496, 64, 64],
  market_stall: [288, 368, 96, 80],
};

/** Benannte Ausschnitte aus gfx/objects.png. */
export const OBJECT_FRAMES: Record<string, [number, number, number, number]> = {
  stump: [0, 160, 32, 32],
  berrybush: [256, 192, 32, 32],
  bigrock: [320, 4, 32, 30],
  bubble_excl: [32, 128, 16, 16],
  pot: [64, 96, 16, 16],
  ...Object.fromEntries(Array.from({ length: 7 }, (_, i) => [`fire${i}`, [64 + 16 * i, 48, 16, 16]])),
};

/** Benannte Ausschnitte aus gfx/farm.png (Farming 101). */
export const FARM_FRAMES: Record<string, [number, number, number, number]> = {
  soil_raw: [144, 96, 16, 16],
  soil_dry: [176, 48, 16, 16],
  soil_wet: [32, 96, 16, 16],
  wheat_seed: [240, 16, 16, 16],
  wheat_sprout: [256, 16, 16, 16],
  wheat_tall: [272, 0, 16, 32],
  wheat_ripe: [288, 0, 16, 32],
  sign_build: [288, 96, 16, 16],
};

/** Benannte Kachelausschnitte aus gfx/cave.png (Untergrund- & Katakomben-Tileset). */
export const CAVE_FRAMES: Record<string, [number, number, number, number]> = {
  floor_dark: [16, 0, 16, 16],
  floor_smooth: [32, 0, 16, 16],
  floor_rocky: [48, 0, 16, 16],
  floor_pebble1: [16, 16, 16, 16],
  floor_pebble2: [32, 16, 16, 16],
  floor_cracked: [48, 16, 16, 16],
  wall_tl: [64, 0, 16, 16],
  wall_top: [80, 0, 16, 16],
  wall_tr: [96, 0, 16, 16],
  wall_left: [64, 16, 16, 16],
  wall_face: [80, 16, 16, 16],
  wall_right: [96, 16, 16, 16],
  wall_bl: [64, 32, 16, 16],
  wall_bottom: [80, 32, 16, 16],
  wall_br: [96, 32, 16, 16],
  wall_face_upper: [16, 48, 16, 16],
  wall_face_mid: [16, 64, 16, 16],
  wall_face_lower: [16, 80, 16, 16],
  water: [64, 144, 16, 16],
  stalagmite: [0, 0, 16, 32],
  stalactite: [0, 32, 16, 16],
  ore_crystal: [112, 48, 16, 16],
  rock_pile: [160, 64, 16, 16],
  arch_exit: [128, 64, 32, 32],
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // 1. Authentische 16-Bit Welt-Atlanten, A2-Bodentexturen & Natur-Sheets (wie im Steinzeit-Referenzspiel!)
    this.load.atlas('world', '/assets/world/world_atlas.png', '/assets/world/world_atlas.json');
    this.load.image('ground_a2', '/assets/world/ground_a2.png');
    this.load.image('ground_med_a2', '/assets/world/ground_med_a2.png');
    this.load.image('tiles_a2_ground', '/assets/world/ground_med_a2.png');
    this.load.image('roman_a2', '/assets/tilesets/roman_colosseum/Tile_A2 (2).png');
    this.load.image('catacomb_a2', '/assets/tilesets/catacombs/Tile_A2 (2).png');
    this.load.image('overworld', '/assets/gfx/Overworld.png');
    this.load.image('objects', '/assets/gfx/objects.png');
    this.load.image('farm', '/assets/gfx/farm.png');
    this.load.image('cave_tiles', '/assets/gfx/cave.png');
    this.load.image('crop_wheat', '/assets/props/farm_wheat_ripe.png');
    this.load.image('farm_soil_raw', '/assets/props/farm_soil_raw.png');
    this.load.image('farm_soil_dry', '/assets/props/farm_soil_dry.png');
    this.load.image('farm_soil_wet', '/assets/props/farm_soil_wet.png');
    this.load.image('farm_wheat_sprout', '/assets/props/farm_wheat_sprout.png');
    this.load.image('farm_wheat_ripe', '/assets/props/farm_wheat_ripe.png');

    // 2. Player & Roman Historical Mentor Spritesheets (64x128 -> 4x4 grid of 16x32 frames)
    this.load.spritesheet('player_male', '/assets/gfx/player_roman_male.png', {
      frameWidth: 16,
      frameHeight: 32,
    });
    this.load.spritesheet('player_female', '/assets/gfx/player_roman_female.png', {
      frameWidth: 16,
      frameHeight: 32,
    });

    const npcIds = [
      'npc_romulus',
      'npc_brutus',
      'npc_cincinnatus',
      'npc_scipio',
      'npc_gracchus',
      'npc_spartacus',
      'npc_caesar',
      'npc_augustus',
      'npc_claudia',
      'npc_trajan',
      'npc_konstantin',
      'npc_cassiodor',
      'npc_guard',
    ];
    for (const id of npcIds) {
      this.load.spritesheet(id, `/assets/gfx/npcs/${id}.png`, {
        frameWidth: 16,
        frameHeight: 32,
      });
    }

    // 3. Autonomous Mediterranean Fauna (80x80 frames, Steinzeit-Standard)
    this.load.spritesheet('goat', '/assets/gfx/goat.png', {
      frameWidth: 80,
      frameHeight: 80,
    });
    this.load.spritesheet('cow', '/assets/gfx/cow.png', {
      frameWidth: 80,
      frameHeight: 80,
    });
    this.load.spritesheet('animal_goat', '/assets/gfx/goat.png', {
      frameWidth: 80,
      frameHeight: 80,
    });
    this.load.spritesheet('animal_cow', '/assets/gfx/cow.png', {
      frameWidth: 80,
      frameHeight: 80,
    });

    // 4. All 72 Extracted 16-Bit Roman Architecture & Prop Sprites
    const romanSprites = [
      'colosseum_arena',
      'temple_jupiter',
      'temple_vesta',
      'temple_mars',
      'pantheon_front',
      'triumphal_arch',
      'curia_senate',
      'senate_chairs',
      'aqueduct_bridge',
      'aqueduct_fountain',
      'roman_theater',
      'insula_tall_1',
      'insula_tall_2',
      'insula_brick',
      'roman_taberna',
      'villa_rustica',
      'roman_horreum',
      'roman_bakery',
      'fountain_marble_large',
      'fountain_lion',
      'statue_emperor',
      'statue_senator',
      'statue_gladiator',
      'statue_lupa_lion',
      'bust_caesar',
      'column_corinthian',
      'column_red_porphyry',
      'roman_milestone',
      'ara_pacis_altar',
      'mosaic_dolphin',
      'marble_bench_roman',
      'praetorium_tent',
      'legion_tent_red',
      'legion_tent_purple',
      'limes_watchtower',
      'stone_watchtower',
      'legion_aquila_banner',
      'spqr_vexillum',
      'scutum_shield_row',
      'roman_catapult',
      'roman_scorpio',
      'roman_chariot',
      'forge_anvil',
      'armor_stand_lorica',
      'gladiator_weapon_rack',
      'gladiator_dummy',
      'war_map_table',
      'palisade_wall',
      'roman_galley_ship',
      'hannibal_elephant_sprite',
      'lupa_wolf_sprite',
      'basilica_constantine',
      'byzantine_dome_church',
      'egyptian_obelisk',
      'ruined_arch_476',
      'ruined_fountain_476',
      'ruined_column_fallen',
      'ruined_statue_headless',
      'catacomb_entrance',
      'catacomb_arch',
      'catacomb_lantern',
      'marble_sarcophagus',
      'brazier_roman_fire',
      'campfire_legion',
      'cypress_roman_1',
      'cypress_roman_2',
      'olive_grove_tree',
      'vineyard_row',
      'forum_stall_red',
      'forum_stall_blue',
      'roman_amphora_group',
      'roman_cart_goods',
    ];
    for (const key of romanSprites) {
      this.load.image(key, `/assets/rome/${key}.png`);
    }
  }

  create() {
    const registerFrames = (
      texKey: string,
      map: Record<string, [number, number, number, number]>,
    ) => {
      if (!this.textures.exists(texKey)) return;
      const tex = this.textures.get(texKey);
      for (const [name, [x, y, fw, fh]] of Object.entries(map)) {
        if (!tex.has(name)) {
          tex.add(name, 0, x, y, fw, fh);
        }
      }
    };

    registerFrames('overworld', OVERWORLD_FRAMES);
    registerFrames('objects', OBJECT_FRAMES);
    registerFrames('farm', FARM_FRAMES);
    registerFrames('cave_tiles', CAVE_FRAMES);

    // Register animations for goats, cattle & fire (matching Steinzeit Wildlife.ts)
    if (!this.anims.exists('goat-idle')) {
      this.anims.create({
        key: 'goat-idle',
        frames: [{ key: 'goat', frame: 0 }],
        frameRate: 1,
      });
      this.anims.create({
        key: 'goat-walk',
        frames: this.anims.generateFrameNumbers('goat', { start: 4, end: 7 }),
        frameRate: 6,
        repeat: -1,
      });
      this.anims.create({
        key: 'cow-idle',
        frames: [{ key: 'cow', frame: 0 }],
        frameRate: 1,
      });
      this.anims.create({
        key: 'cow-walk',
        frames: this.anims.generateFrameNumbers('cow', { start: 4, end: 7 }),
        frameRate: 5,
        repeat: -1,
      });
      this.anims.create({
        key: 'fire',
        frames: Array.from({ length: 7 }, (_, i) => ({ key: 'objects', frame: `fire${i}` })),
        frameRate: 10,
        repeat: -1,
      });
    }

    this.extractPreviewImages();
    this.generateHelperTextures();
    this.scene.launch('World');
    this.scene.launch('UI');
  }

  private extractPreviewImages() {
    const toDataUrl = (texKey: string, sx = 0, sy = 4, sw = 16, sh = 26): string => {
      if (!this.textures.exists(texKey)) return '';
      const src = this.textures.get(texKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
      const c = document.createElement('canvas');
      c.width = sw;
      c.height = sh;
      const ctx = c.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
      return c.toDataURL();
    };
    state.malePreviewUrl = toDataUrl('player_male', 0, 4, 16, 26);
    state.femalePreviewUrl = toDataUrl('player_female', 0, 4, 16, 26);
  }

  private generateHelperTextures() {
    const g = this.make.graphics({ x: 0, y: 0 });
    // Roman Relic Chest
    g.fillStyle(0x7c2d12, 1);
    g.fillRect(2, 6, 12, 8);
    g.fillStyle(0xb91c1c, 1);
    g.fillRect(3, 7, 10, 6);
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(2, 5, 12, 2);
    g.fillRect(2, 13, 12, 2);
    g.fillRect(6, 8, 4, 3);
    g.generateTexture('roman_relic_chest', 16, 16);

    // Ostia Dock Pier (dock_pier)
    g.clear();
    g.fillStyle(0x5c3a21, 1);
    g.fillRect(0, 0, 48, 24);
    g.fillStyle(0x8b5a2b, 1);
    for (let x = 2; x < 46; x += 6) {
      g.fillRect(x, 2, 4, 20);
      g.fillStyle(0x3b2311, 1);
      g.fillRect(x, 4, 1, 16);
      g.fillStyle(0x8b5a2b, 1);
    }
    g.generateTexture('dock_pier', 48, 24);

    // Butterfly & Fish Sprites (fallback if custom sprites not present)
    g.clear();
    g.fillStyle(0xfacc15, 1);
    g.fillRect(1, 2, 3, 4);
    g.fillRect(6, 2, 3, 4);
    g.fillStyle(0xf97316, 1);
    g.fillRect(2, 3, 2, 2);
    g.fillRect(6, 3, 2, 2);
    g.fillStyle(0x1c1917, 1);
    g.fillRect(4, 1, 2, 6);
    g.generateTexture('butterfly', 10, 8);
    g.generateTexture('critter_butterfly', 10, 8);

    g.clear();
    g.fillStyle(0x38bdf8, 1);
    g.fillRect(3, 3, 6, 4);
    g.fillRect(1, 2, 2, 6);
    g.generateTexture('critter_fish', 12, 10);

    g.destroy();
  }
}
