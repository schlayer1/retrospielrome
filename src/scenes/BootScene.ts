import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // 1. Player & Roman Historical Mentor Spritesheets (64x128 -> 4x4 grid of 16x32 frames)
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

    // 2. Ground A2 Tileset & Farm Props
    this.load.image('tiles_a2_ground', '/assets/world/ground_med_a2.png');
    this.load.image('crop_wheat', '/assets/props/farm_wheat_ripe.png');

    // 3. Autonomous Mediterranean Fauna (Goats & Cattle - 80x80 frames)
    this.load.spritesheet('animal_cow', '/assets/gfx/cow.png', {
      frameWidth: 80,
      frameHeight: 80,
    });
    this.load.spritesheet('animal_goat', '/assets/gfx/goat.png', {
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
    this.generateHelperTextures();
    this.scene.launch('World');
    this.scene.launch('UI');
  }

  private generateHelperTextures() {
    // 1. Roman Relic Chest
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x7c2d12, 1);
    g.fillRect(2, 6, 12, 8);
    g.fillStyle(0xb91c1c, 1);
    g.fillRect(3, 7, 10, 6);
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(2, 5, 12, 2);
    g.fillRect(2, 13, 12, 2);
    g.fillRect(6, 8, 4, 3);
    g.generateTexture('roman_relic_chest', 16, 16);

    // 2. Oak Trees (tree_oak_1, tree_oak_2)
    g.clear();
    g.fillStyle(0x5c3a21, 1);
    g.fillRect(12, 20, 8, 12);
    g.fillStyle(0x166534, 1);
    g.fillCircle(16, 14, 12);
    g.fillStyle(0x22c55e, 1);
    g.fillCircle(14, 11, 8);
    g.generateTexture('tree_oak_1', 32, 32);
    g.generateTexture('tree_oak_2', 32, 32);

    // 3. Quarry Rocks (rock_med_1, rock_med_2)
    g.clear();
    g.fillStyle(0x57534e, 1);
    g.fillCircle(12, 14, 10);
    g.fillStyle(0xa8a29e, 1);
    g.fillCircle(10, 11, 6);
    g.generateTexture('rock_med_1', 24, 24);
    g.clear();
    g.fillStyle(0xd6d3d1, 1);
    g.fillCircle(12, 14, 10);
    g.fillStyle(0xf5f5f4, 1);
    g.fillCircle(10, 11, 6);
    g.generateTexture('rock_med_2', 24, 24);

    // 4. Ostia Dock Pier (dock_pier)
    g.clear();
    g.fillStyle(0x78350f, 1);
    g.fillRect(0, 0, 48, 24);
    g.fillStyle(0x92400e, 1);
    for (let x = 2; x < 46; x += 6) {
      g.fillRect(x, 2, 4, 20);
    }
    g.generateTexture('dock_pier', 48, 24);

    // 5. Butterfly & Fish Sprites
    g.clear();
    g.fillStyle(0xfacc15, 1);
    g.fillRect(2, 3, 3, 4);
    g.fillRect(7, 3, 3, 4);
    g.fillStyle(0x1c1917, 1);
    g.fillRect(5, 2, 2, 6);
    g.generateTexture('critter_butterfly', 12, 10);

    g.clear();
    g.fillStyle(0x38bdf8, 1);
    g.fillRect(3, 3, 6, 4);
    g.fillRect(1, 2, 2, 6);
    g.generateTexture('critter_fish', 12, 10);

    g.destroy();
  }
}
