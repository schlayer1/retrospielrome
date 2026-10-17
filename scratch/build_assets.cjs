const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

async function main() {
  ['public/assets/rome', 'public/assets/icons', 'public/assets/gfx/npcs', 'public/assets/world'].forEach((d) =>
    fs.mkdirSync(d, { recursive: true }),
  );

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // Load Roman & Mediterranean tileset sheets as base64
  const sheets = {
    rc_b1: fs.readFileSync('public/assets/tilesets/roman_city/tile-B-01.png').toString('base64'),
    rc_b2: fs.readFileSync('public/assets/tilesets/roman_city/tile-B-02.png').toString('base64'),
    rc_b3: fs.readFileSync('public/assets/tilesets/roman_city/tile-B-03.png').toString('base64'),
    rc_b4: fs.readFileSync('public/assets/tilesets/roman_city/tile-B-04.png').toString('base64'),
    rc_b5: fs.readFileSync('public/assets/tilesets/roman_city/tile-B-05.png').toString('base64'),
    col_b1: fs.readFileSync('public/assets/tilesets/roman_colosseum/tile-B-01.png').toString('base64'),
    col_b2: fs.readFileSync('public/assets/tilesets/roman_colosseum/tile-B-02.png').toString('base64'),
    col_b3: fs.readFileSync('public/assets/tilesets/roman_colosseum/tile-B-03.png').toString('base64'),
    army_b1: fs.readFileSync('public/assets/tilesets/roman_army/tile-B-01.png').toString('base64'),
    army_b2: fs.readFileSync('public/assets/tilesets/roman_army/tile-B-02.png').toString('base64'),
    army_b3: fs.readFileSync('public/assets/tilesets/roman_army/tile-B-03.png').toString('base64'),
    army_b4: fs.readFileSync('public/assets/tilesets/roman_army/tile-B-04.png').toString('base64'),
    byz_b1: fs.readFileSync('public/assets/tilesets/byzantine/tile-B-01.png').toString('base64'),
    cat_b1: fs.readFileSync('public/assets/tilesets/catacombs/tile-B-01.png').toString('base64'),
    cat_b2: fs.readFileSync('public/assets/tilesets/catacombs/tile-B-02.png').toString('base64'),
    cat_b3: fs.readFileSync('public/assets/tilesets/catacombs/tile-B-03.png').toString('base64'),
    med_b3: fs.readFileSync('public/assets/tilesets/mediterranean/tile-B-03.png').toString('base64'),
    med_b5: fs.readFileSync('public/assets/tilesets/mediterranean/tile-B-05.png').toString('base64'),
    zoo_b2: fs.readFileSync('public/assets/tilesets/zoo/tile-B-02.png').toString('base64'),
    rome_6: fs.readFileSync('public/assets/tilesets/rome_icons/6.png').toString('base64'),
    rome_8: fs.readFileSync('public/assets/tilesets/rome_icons/8.png').toString('base64'),
    rome_9: fs.readFileSync('public/assets/tilesets/rome_icons/9.png').toString('base64'),
    rome_10: fs.readFileSync('public/assets/tilesets/rome_icons/10.png').toString('base64'),
    rome_12: fs.readFileSync('public/assets/tilesets/rome_icons/12.png').toString('base64'),
    rome_15: fs.readFileSync('public/assets/tilesets/rome_icons/15.png').toString('base64'),
    charBase: fs.readFileSync('public/assets/gfx/character.png').toString('base64'),
  };

  // Crop definitions in 48x48 grid units (cx, cy, cw, ch, outW, outH)
  const cropDefs = [
    // 1. Roman Monuments & Temples (roman_city B1, B4, B5)
    { id: 'colosseum_arena', sheet: 'rc_b1', cx: 8, cy: 0, cw: 8, ch: 4, outW: 156, outH: 96 },
    { id: 'temple_jupiter', sheet: 'rc_b1', cx: 12, cy: 4, cw: 2, ch: 2.15, outW: 76, outH: 78 },
    { id: 'temple_vesta', sheet: 'rc_b4', cx: 2, cy: 4, cw: 2, ch: 2, outW: 58, outH: 62 },
    { id: 'temple_mars', sheet: 'rc_b1', cx: 10, cy: 4, cw: 2, ch: 2.15, outW: 72, outH: 76 },
    { id: 'pantheon_front', sheet: 'rc_b4', cx: 8, cy: 8, cw: 4, ch: 4, outW: 108, outH: 96 },
    { id: 'triumphal_arch', sheet: 'rc_b1', cx: 8, cy: 7, cw: 3, ch: 3, outW: 88, outH: 82 },
    { id: 'curia_senate', sheet: 'rc_b1', cx: 8, cy: 4, cw: 2, ch: 2.15, outW: 68, outH: 72 },
    { id: 'senate_chairs', sheet: 'rc_b1', cx: 4, cy: 8, cw: 2, ch: 2, outW: 64, outH: 56 },
    { id: 'aqueduct_bridge', sheet: 'rc_b1', cx: 8, cy: 10, cw: 4, ch: 3, outW: 112, outH: 68 },
    { id: 'aqueduct_fountain', sheet: 'rc_b5', cx: 10, cy: 6, cw: 2, ch: 2, outW: 58, outH: 58 },
    { id: 'roman_theater', sheet: 'rc_b4', cx: 12, cy: 12, cw: 4, ch: 4, outW: 104, outH: 96 },

    // 2. Insulae, Villa Rustica, Domus & Granaries
    { id: 'insula_tall_1', sheet: 'rc_b1', cx: 0, cy: 4, cw: 2, ch: 2, outW: 56, outH: 68 },
    { id: 'insula_tall_2', sheet: 'rc_b1', cx: 2, cy: 4, cw: 2, ch: 2, outW: 56, outH: 68 },
    { id: 'insula_brick', sheet: 'rc_b1', cx: 4, cy: 4, cw: 2, ch: 2, outW: 56, outH: 68 },
    { id: 'roman_taberna', sheet: 'rc_b1', cx: 0, cy: 6, cw: 2, ch: 2, outW: 62, outH: 60 },
    { id: 'villa_rustica', sheet: 'rc_b5', cx: 4, cy: 12, cw: 2.5, ch: 2, outW: 72, outH: 62 },
    { id: 'roman_horreum', sheet: 'rc_b5', cx: 0, cy: 8, cw: 2, ch: 2, outW: 58, outH: 56 },
    { id: 'roman_bakery', sheet: 'rc_b5', cx: 2, cy: 8, cw: 2, ch: 2, outW: 58, outH: 56 },

    // 3. Forum Romanum Statues, Columns, Fountains, Milestones & Mosaics
    { id: 'fountain_marble_large', sheet: 'rc_b4', cx: 4, cy: 8, cw: 4, ch: 4, outW: 76, outH: 76 },
    { id: 'fountain_lion', sheet: 'rc_b2', cx: 4, cy: 12, cw: 2, ch: 2, outW: 52, outH: 52 },
    { id: 'statue_emperor', sheet: 'col_b1', cx: 8, cy: 10, cw: 1, ch: 2, outW: 28, outH: 48 },
    { id: 'statue_senator', sheet: 'rc_b1', cx: 4, cy: 12.5, cw: 1, ch: 1.5, outW: 26, outH: 46 },
    { id: 'statue_gladiator', sheet: 'col_b1', cx: 10, cy: 10, cw: 1.3, ch: 2, outW: 32, outH: 48 },
    { id: 'statue_lupa_lion', sheet: 'col_b1', cx: 11.4, cy: 10.5, cw: 1.6, ch: 1.6, outW: 44, outH: 38 },
    { id: 'bust_caesar', sheet: 'col_b1', cx: 14, cy: 10, cw: 1, ch: 2, outW: 24, outH: 42 },
    { id: 'column_corinthian', sheet: 'rc_b1', cx: 14, cy: 10, cw: 1, ch: 2, outW: 20, outH: 46 },
    { id: 'column_red_porphyry', sheet: 'col_b1', cx: 0, cy: 8, cw: 1, ch: 2, outW: 20, outH: 46 },
    { id: 'roman_milestone', sheet: 'rc_b1', cx: 15, cy: 13, cw: 1, ch: 1.2, outW: 22, outH: 32 },
    { id: 'ara_pacis_altar', sheet: 'rome_15', cx: 3, cy: 3.2, cw: 2, ch: 2.6, outW: 42, outH: 48 },
    { id: 'mosaic_dolphin', sheet: 'rc_b1', cx: 4, cy: 14, cw: 2, ch: 2, outW: 48, outH: 48 },
    { id: 'marble_bench_roman', sheet: 'rc_b1', cx: 0, cy: 13, cw: 1, ch: 1, outW: 40, outH: 22 },

    // 4. Roman Army, Legion Camp, Rubicon, Limes & Gladiator Ludus
    { id: 'praetorium_tent', sheet: 'army_b1', cx: 4, cy: 0, cw: 4, ch: 4, outW: 84, outH: 78 },
    { id: 'legion_tent_red', sheet: 'army_b1', cx: 0, cy: 2, cw: 2, ch: 2, outW: 52, outH: 52 },
    { id: 'legion_tent_purple', sheet: 'army_b3', cx: 0, cy: 0, cw: 2, ch: 2, outW: 52, outH: 52 },
    { id: 'limes_watchtower', sheet: 'army_b1', cx: 10, cy: 4, cw: 2, ch: 4, outW: 48, outH: 78 },
    { id: 'stone_watchtower', sheet: 'rome_9', cx: 0.5, cy: 4, cw: 2.2, ch: 4, outW: 48, outH: 76 },
    { id: 'legion_aquila_banner', sheet: 'army_b1', cx: 9, cy: 8, cw: 1, ch: 2, outW: 24, outH: 48 },
    { id: 'spqr_vexillum', sheet: 'army_b1', cx: 4, cy: 12, cw: 1, ch: 2, outW: 24, outH: 48 },
    { id: 'scutum_shield_row', sheet: 'army_b4', cx: 8, cy: 6, cw: 2, ch: 2, outW: 44, outH: 44 },
    { id: 'roman_catapult', sheet: 'army_b4', cx: 0, cy: 0, cw: 4, ch: 4, outW: 68, outH: 64 },
    { id: 'roman_scorpio', sheet: 'army_b4', cx: 4, cy: 5, cw: 2, ch: 3, outW: 44, outH: 48 },
    { id: 'roman_chariot', sheet: 'army_b2', cx: 10, cy: 8, cw: 2, ch: 2, outW: 54, outH: 46 },
    { id: 'forge_anvil', sheet: 'army_b2', cx: 12, cy: 6.5, cw: 1.8, ch: 1.5, outW: 36, outH: 30 },
    { id: 'armor_stand_lorica', sheet: 'army_b2', cx: 10, cy: 12, cw: 2, ch: 2, outW: 42, outH: 44 },
    { id: 'gladiator_weapon_rack', sheet: 'col_b3', cx: 8, cy: 14, cw: 2, ch: 2, outW: 48, outH: 44 },
    { id: 'gladiator_dummy', sheet: 'col_b2', cx: 0, cy: 8, cw: 1, ch: 2, outW: 26, outH: 40 },
    { id: 'war_map_table', sheet: 'army_b3', cx: 8, cy: 4, cw: 4, ch: 2, outW: 68, outH: 42 },
    { id: 'palisade_wall', sheet: 'army_b1', cx: 12, cy: 0, cw: 2, ch: 1.5, outW: 48, outH: 36 },

    // 5. Harbor of Ostia & Punic Wars (Carthage Elephant, Galley)
    { id: 'roman_galley_ship', sheet: 'med_b5', cx: 10, cy: 1, cw: 2, ch: 1, outW: 56, outH: 34 },
    { id: 'hannibal_elephant_sprite', sheet: 'zoo_b2', cx: 6, cy: 8, cw: 1.95, ch: 1.95, outW: 64, outH: 56 },
    { id: 'lupa_wolf_sprite', sheet: 'zoo_b2', cx: 4.8, cy: 8.8, cw: 1.2, ch: 1.2, outW: 34, outH: 30 },

    // 6. Late Antiquity, Constantine Basilica & Ruins of 476 AD
    { id: 'basilica_constantine', sheet: 'byz_b1', cx: 4, cy: 1, cw: 2, ch: 3, outW: 72, outH: 84 },
    { id: 'byzantine_dome_church', sheet: 'byz_b1', cx: 8, cy: 12, cw: 2, ch: 2, outW: 64, outH: 64 },
    { id: 'egyptian_obelisk', sheet: 'byz_b1', cx: 14, cy: 8, cw: 1, ch: 2.5, outW: 22, outH: 58 },
    { id: 'ruined_arch_476', sheet: 'rome_6', cx: 14, cy: 0, cw: 2, ch: 2, outW: 62, outH: 56 },
    { id: 'ruined_fountain_476', sheet: 'rome_8', cx: 8, cy: 0, cw: 4, ch: 4, outW: 56, outH: 52 },
    { id: 'ruined_column_fallen', sheet: 'rome_8', cx: 8, cy: 10, cw: 4, ch: 2.5, outW: 56, outH: 36 },
    { id: 'ruined_statue_headless', sheet: 'rome_8', cx: 14, cy: 0, cw: 2, ch: 4, outW: 28, outH: 48 },

    // 7. Catacombs & Mithraeum Sub-Scene (Medieval Underground Mine + Roman Altars)
    { id: 'catacomb_entrance', sheet: 'cat_b2', cx: 14, cy: 4, cw: 2, ch: 2, outW: 56, outH: 54 },
    { id: 'catacomb_arch', sheet: 'cat_b1', cx: 10, cy: 8, cw: 2, ch: 2, outW: 52, outH: 48 },
    { id: 'catacomb_lantern', sheet: 'cat_b1', cx: 11, cy: 12, cw: 1, ch: 1, outW: 20, outH: 24 },
    { id: 'marble_sarcophagus', sheet: 'rc_b2', cx: 8, cy: 12, cw: 2, ch: 2, outW: 56, outH: 44 },
    { id: 'brazier_roman_fire', sheet: 'army_b4', cx: 8, cy: 4, cw: 1.5, ch: 2, outW: 34, outH: 40 },
    { id: 'campfire_legion', sheet: 'rome_9', cx: 8, cy: 4.2, cw: 2, ch: 2, outW: 40, outH: 38 },

    // 8. Flora, Agriculture & Market Stalls
    { id: 'cypress_roman_1', sheet: 'rc_b5', cx: 12, cy: 14, cw: 1, ch: 2, outW: 22, outH: 52 },
    { id: 'cypress_roman_2', sheet: 'rc_b5', cx: 13, cy: 14, cw: 1, ch: 2, outW: 22, outH: 52 },
    { id: 'olive_grove_tree', sheet: 'rc_b4', cx: 4, cy: 0, cw: 2, ch: 2, outW: 46, outH: 46 },
    { id: 'vineyard_row', sheet: 'rc_b5', cx: 2, cy: 0, cw: 2, ch: 2, outW: 48, outH: 48 },
    { id: 'forum_stall_red', sheet: 'rc_b4', cx: 12, cy: 4, cw: 2, ch: 2, outW: 54, outH: 52 },
    { id: 'forum_stall_blue', sheet: 'rc_b4', cx: 8, cy: 6, cw: 2, ch: 2, outW: 54, outH: 52 },
    { id: 'roman_amphora_group', sheet: 'rc_b5', cx: 12, cy: 12, cw: 2, ch: 2, outW: 44, outH: 38 },
    { id: 'roman_cart_goods', sheet: 'rc_b1', cx: 11, cy: 13, cw: 1.5, ch: 1.2, outW: 44, outH: 34 },
  ];

  // 33 Roman Items + 5 Relics (32x32 crisp pixel art icons)
  const iconDefs = [
    // 1. Nahrung & Heilung
    {
      id: 'getreide',
      draw: `
        ctx.fillStyle = '#eab308';
        ctx.fillRect(10, 6, 2, 20); ctx.fillRect(15, 4, 2, 22); ctx.fillRect(20, 6, 2, 20);
        ctx.fillStyle = '#fde047';
        for(let y=6; y<=16; y+=3) { ctx.fillRect(7, y, 4, 2); ctx.fillRect(13, y-2, 6, 2); ctx.fillRect(21, y, 4, 2); }
        ctx.fillStyle = '#b91c1c'; ctx.fillRect(9, 20, 14, 3);
      `,
    },
    {
      id: 'puls_brei',
      draw: `
        ctx.fillStyle = '#9a3412';
        ctx.beginPath(); ctx.arc(16, 18, 10, 0, Math.PI); ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.ellipse(16, 18, 9, 4, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(12, 17, 3, 2); ctx.fillRect(17, 18, 3, 2);
      `,
    },
    {
      id: 'panis_brot',
      draw: `
        // Round Roman loaf divided into 8 wedges (Panis Quadratus from Pompeii)
        ctx.fillStyle = '#92400e';
        ctx.beginPath(); ctx.arc(16, 17, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.beginPath(); ctx.arc(16, 16, 8.5, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(8,16); ctx.lineTo(24,16); ctx.moveTo(16,8); ctx.lineTo(16,24); ctx.stroke();
      `,
    },
    {
      id: 'oliven',
      draw: `
        ctx.fillStyle = '#4d7c0f'; ctx.fillRect(6, 12, 20, 2);
        ctx.fillStyle = '#65a30d'; ctx.fillRect(8, 8, 5, 3); ctx.fillRect(18, 8, 5, 3);
        ctx.fillStyle = '#365314'; ctx.beginPath(); ctx.ellipse(11, 20, 4, 5, 0.2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#1e1b4b'; ctx.beginPath(); ctx.ellipse(21, 20, 4, 5, -0.2, 0, Math.PI*2); ctx.fill();
      `,
    },
    {
      id: 'olivenoel',
      draw: `
        ctx.fillStyle = '#b45309'; ctx.fillRect(13, 5, 6, 4);
        ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(16, 19, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(15, 18, 6, 0, Math.PI*2); ctx.fill();
      `,
    },
    {
      id: 'weintrauben',
      draw: `
        ctx.fillStyle = '#15803d'; ctx.fillRect(14, 4, 4, 4); ctx.fillRect(10, 6, 12, 3);
        const pts = [[12,11],[16,11],[20,11],[10,15],[14,15],[18,15],[22,15],[12,19],[16,19],[20,19],[14,23],[18,23],[16,26]];
        for (const [gx,gy] of pts) {
          ctx.fillStyle = '#581c87'; ctx.beginPath(); ctx.arc(gx, gy, 3, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#9333ea'; ctx.beginPath(); ctx.arc(gx-0.5, gy-0.5, 2, 0, Math.PI*2); ctx.fill();
        }
      `,
    },
    {
      id: 'garum_fisch',
      draw: `
        ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.ellipse(15, 16, 10, 5, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#bae6fd'; ctx.beginPath(); ctx.ellipse(15, 17, 8, 2.5, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#d97706'; ctx.fillRect(20, 19, 7, 9);
      `,
    },
    {
      id: 'ziegenkaese',
      draw: `
        ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.ellipse(16, 19, 10, 6, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.ellipse(16, 16, 10, 6, 0, 0, Math.PI*2); ctx.fill();
      `,
    },
    {
      id: 'wasser',
      draw: `
        ctx.fillStyle = '#c2410c'; ctx.beginPath(); ctx.arc(16, 19, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillRect(13, 7, 6, 5);
        ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(16, 19, 5, 0, Math.PI*2); ctx.fill();
      `,
    },

    // 2. Werkzeuge & Waffen
    {
      id: 'hacke',
      draw: `
        ctx.fillStyle = '#78350f'; for(let i=0;i<18;i++) ctx.fillRect(6+i, 24-i, 3, 3);
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(18, 5, 8, 4); ctx.fillRect(22, 8, 4, 6);
      `,
    },
    {
      id: 'sichel',
      draw: `
        ctx.fillStyle = '#78350f'; ctx.fillRect(7, 20, 4, 7);
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(16, 14, 8, Math.PI*0.7, Math.PI*1.9); ctx.stroke();
      `,
    },
    {
      id: 'gladius',
      draw: `
        // Roman short sword Gladius Hispaniensis
        ctx.fillStyle = '#78350f'; ctx.fillRect(14, 22, 4, 6);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(11, 20, 10, 3); ctx.fillRect(13, 27, 6, 3);
        ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.moveTo(13,20); ctx.lineTo(13,7); ctx.lineTo(16,3); ctx.lineTo(19,7); ctx.lineTo(19,20); ctx.fill();
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(15, 6, 2, 13);
      `,
    },
    {
      id: 'scutum',
      draw: `
        // Rectangular red curved Roman Legionary Shield Scutum with gold wings
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(8, 4, 16, 24);
        ctx.fillStyle = '#b91c1c'; ctx.fillRect(9, 5, 14, 22);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(11, 8, 4, 3); ctx.fillRect(17, 8, 4, 3);
        ctx.fillRect(11, 21, 4, 3); ctx.fillRect(17, 21, 4, 3);
        ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.arc(16, 16, 3, 0, Math.PI*2); ctx.fill();
      `,
    },
    {
      id: 'fasces',
      draw: `
        // Roman Lictor Fasces: bundle of birch rods with red leather straps and axe blade
        ctx.fillStyle = '#a16207'; ctx.fillRect(11, 5, 8, 22);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(10, 8, 10, 2); ctx.fillRect(10, 15, 10, 2); ctx.fillRect(10, 22, 10, 2);
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath(); ctx.moveTo(19, 9); ctx.lineTo(26, 7); ctx.lineTo(26, 15); ctx.lineTo(19, 13); ctx.fill();
      `,
    },
    {
      id: 'corvus_enterbruecke',
      draw: `
        // Roman naval boarding bridge Corvus with iron spike
        ctx.fillStyle = '#78350f'; ctx.fillRect(6, 12, 18, 8);
        ctx.fillStyle = '#a16207'; ctx.fillRect(7, 14, 16, 4);
        ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.moveTo(22, 14); ctx.lineTo(28, 24); ctx.lineTo(20, 20); ctx.fill();
      `,
    },
    {
      id: 'gladiator_dreizack',
      draw: `
        // Retiarius Trident (Fuscina)
        ctx.fillStyle = '#78350f'; ctx.fillRect(15, 11, 2, 18);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(10, 10, 12, 2);
        ctx.fillRect(10, 4, 2, 7); ctx.fillRect(15, 3, 2, 8); ctx.fillRect(20, 4, 2, 7);
      `,
    },
    {
      id: 'oellampe',
      draw: `
        // Roman terracotta oil lamp (Lucerna)
        ctx.fillStyle = '#c2410c';
        ctx.beginPath(); ctx.ellipse(14, 20, 8, 5, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillRect(19, 18, 6, 4);
        ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(24, 14, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(24, 15, 2.5, 0, Math.PI*2); ctx.fill();
      `,
    },

    // 3. Rohstoffe & Material
    {
      id: 'holz',
      draw: `
        ctx.fillStyle = '#78350f'; ctx.fillRect(5, 16, 22, 6); ctx.fillRect(7, 10, 18, 6);
        ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(26, 19, 3, 0, Math.PI*2); ctx.fill();
      `,
    },
    {
      id: 'tuffstein',
      draw: `
        ctx.fillStyle = '#a8a29e'; ctx.fillRect(6, 11, 20, 13);
        ctx.fillStyle = '#d6d3d1'; ctx.fillRect(8, 13, 16, 9);
      `,
    },
    {
      id: 'marmor',
      draw: `
        ctx.fillStyle = '#e2e8f0'; ctx.fillRect(5, 9, 22, 15);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(7, 11, 18, 11);
        ctx.fillStyle = '#93c5fd'; ctx.fillRect(9, 13, 6, 1); ctx.fillRect(14, 16, 7, 1);
      `,
    },
    {
      id: 'ziegel',
      draw: `
        // Roman fired roof tiles & bricks (Tegulae / Lateres)
        ctx.fillStyle = '#9a3412'; ctx.fillRect(5, 17, 13, 6); ctx.fillRect(14, 10, 13, 6);
        ctx.fillStyle = '#ea580c'; ctx.fillRect(6, 18, 11, 4); ctx.fillRect(15, 11, 11, 4);
      `,
    },
    {
      id: 'opus_caementicium',
      draw: `
        // Roman waterproof volcanic mortar / concrete bucket
        ctx.fillStyle = '#78350f'; ctx.fillRect(7, 12, 18, 14);
        ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.ellipse(16, 12, 9, 4, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.ellipse(16, 12, 6, 2.5, 0, 0, Math.PI*2); ctx.fill();
      `,
    },
    {
      id: 'eisenerz',
      draw: `
        ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.arc(16, 17, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(11, 12, 4, 4); ctx.fillRect(18, 15, 4, 4);
      `,
    },
    {
      id: 'silbererz',
      draw: `
        ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.arc(16, 17, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f8fafc'; ctx.fillRect(10, 12, 4, 4); ctx.fillRect(17, 11, 5, 4);
      `,
    },
    {
      id: 'wolle',
      draw: `
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath(); ctx.arc(12, 16, 6, 0, Math.PI*2); ctx.arc(20, 16, 6, 0, Math.PI*2); ctx.arc(16, 13, 6, 0, Math.PI*2); ctx.fill();
      `,
    },
    {
      id: 'samen',
      draw: `
        ctx.fillStyle = '#a16207'; ctx.beginPath(); ctx.arc(16, 18, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#facc15'; ctx.fillRect(13, 15, 2, 2); ctx.fillRect(17, 14, 2, 2);
      `,
    },

    // 4. Kult, Staat & Recht
    {
      id: 'zwoelftafeln',
      draw: `
        // Bronze Twelve Tables of Roman Law (Lex Duodecim Tabularum)
        ctx.fillStyle = '#b45309'; ctx.fillRect(5, 6, 10, 20); ctx.fillRect(17, 6, 10, 20);
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(6, 7, 8, 18); ctx.fillRect(18, 7, 8, 18);
        ctx.fillStyle = '#78350f';
        for(let y=9;y<=21;y+=3) { ctx.fillRect(7, y, 6, 1); ctx.fillRect(19, y, 6, 1); }
      `,
    },
    {
      id: 'toga_candida',
      draw: `
        // White Roman Senatorial Toga with purple stripe (Toga Praetexta)
        ctx.fillStyle = '#f8fafc'; ctx.fillRect(8, 6, 16, 20);
        ctx.fillStyle = '#e2e8f0'; ctx.fillRect(6, 8, 4, 12); ctx.fillRect(22, 8, 4, 12);
        ctx.fillStyle = '#7e22ce'; ctx.fillRect(10, 6, 3, 20);
      `,
    },
    {
      id: 'ackergesetz_rolle',
      draw: `
        ctx.fillStyle = '#dc2626'; ctx.fillRect(6, 6, 20, 3); ctx.fillRect(6, 23, 20, 3);
        ctx.fillStyle = '#fef9c3'; ctx.fillRect(8, 9, 16, 14);
        ctx.fillStyle = '#475569'; ctx.fillRect(10, 12, 12, 1); ctx.fillRect(10, 16, 10, 1);
      `,
    },
    {
      id: 'silber_denar',
      draw: `
        ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(16, 16, 11, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(16, 16, 9, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.arc(16, 15, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillRect(13, 19, 6, 4);
      `,
    },
    {
      id: 'legionsadler',
      draw: `
        // Golden Roman Aquila Eagle Standard
        ctx.fillStyle = '#b45309'; ctx.fillRect(15, 12, 2, 17);
        ctx.fillStyle = '#facc15';
        ctx.beginPath(); ctx.moveTo(4, 8); ctx.lineTo(28, 8); ctx.lineTo(22, 14); ctx.lineTo(10, 14); ctx.closePath(); ctx.fill();
        ctx.fillRect(14, 5, 4, 9);
        ctx.fillStyle = '#dc2626'; ctx.fillRect(11, 16, 10, 6);
      `,
    },
    {
      id: 'lorbeerkranz_rom',
      draw: `
        ctx.strokeStyle = '#eab308'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(16, 16, 9, 0.3, Math.PI*2 - 0.3); ctx.stroke();
        ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(16, 16, 9, 0.3, Math.PI*2 - 0.3); ctx.stroke();
      `,
    },
    {
      id: 'meilenstein',
      draw: `
        // Roman Milestone Miliarium with "ROMA M·P·I"
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(9, 22, 14, 6);
        ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(16, 10, 6, Math.PI, 0); ctx.fill();
        ctx.fillRect(10, 10, 12, 12);
        ctx.fillStyle = '#dc2626'; ctx.fillRect(12, 13, 8, 2);
      `,
    },
    {
      id: 'chi_rho_schild',
      draw: `
        // Constantine's Chi-Rho (☧) Labarum Shield
        ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(16, 16, 12, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#1d4ed8'; ctx.beginPath(); ctx.arc(16, 16, 10, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(11,11); ctx.lineTo(21,21); ctx.moveTo(21,11); ctx.lineTo(11,21); ctx.moveTo(16,7); ctx.lineTo(16,25); ctx.stroke();
      `,
    },
    {
      id: 'pergament_codex',
      draw: `
        // Bound Parchment Codex (Late Antiquity Monastery)
        ctx.fillStyle = '#7f1d1d'; ctx.fillRect(6, 5, 20, 22);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(8, 7, 16, 18);
        ctx.fillStyle = '#fef3c7'; ctx.fillRect(10, 8, 13, 16);
        ctx.fillStyle = '#b91c1c'; ctx.fillRect(14, 11, 4, 8); ctx.fillRect(12, 13, 8, 4);
      `,
    },

    // 5 Relics
    {
      id: 'relic_lupa',
      draw: `
        // Capitoline She-Wolf bronze relic
        ctx.fillStyle = '#78350f'; ctx.fillRect(4, 22, 24, 5);
        ctx.fillStyle = '#d97706'; ctx.fillRect(7, 11, 16, 7); ctx.fillRect(20, 7, 6, 6);
        ctx.fillRect(8, 18, 2, 4); ctx.fillRect(13, 18, 2, 4); ctx.fillRect(19, 18, 2, 4);
        ctx.fillStyle = '#fde047'; ctx.fillRect(11, 19, 3, 3); ctx.fillRect(15, 19, 3, 3);
      `,
    },
    {
      id: 'relic_zwoelftafel',
      draw: `
        ctx.fillStyle = '#92400e'; ctx.fillRect(5, 4, 22, 24);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(7, 6, 18, 20);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(9, 9, 14, 2); ctx.fillRect(9, 13, 14, 2); ctx.fillRect(9, 17, 14, 2); ctx.fillRect(9, 21, 10, 2);
      `,
    },
    {
      id: 'relic_caesar_denar',
      draw: `
        ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.arc(16, 16, 12, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(16, 16, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.arc(16, 14, 4.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#16a34a'; ctx.fillRect(12, 11, 8, 2);
      `,
    },
    {
      id: 'relic_augustus_statue',
      draw: `
        // Augustus of Prima Porta marble bust & breastplate
        ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(16, 10, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.ellipse(16, 11, 4.5, 5.5, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#dc2626'; ctx.fillRect(8, 17, 16, 9);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(10, 18, 12, 6);
      `,
    },
    {
      id: 'relic_konstantin_medaillon',
      draw: `
        // Golden Medallion of Constantine with Chi-Rho
        ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(16, 16, 12, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(16, 16, 10, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(11,11); ctx.lineTo(21,21); ctx.moveTo(21,11); ctx.lineTo(11,21); ctx.moveTo(16,7); ctx.lineTo(16,25); ctx.stroke();
      `,
    },
  ];

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <script>
        window.processAll = async function(sheets, cropDefs, iconDefs) {
          function loadImg(b64) {
            return new Promise(res => {
              const img = new Image();
              img.onload = () => res(img);
              img.src = "data:image/png;base64," + b64;
            });
          }

          const loaded = {};
          for (const [k, b64] of Object.entries(sheets)) {
            loaded[k] = await loadImg(b64);
          }

          // 1. Crop & trim Roman world sprites
          const croppedOut = {};
          for (const def of cropDefs) {
            const img = loaded[def.sheet];
            const sx = Math.round(def.cx * 48);
            const sy = Math.round(def.cy * 48);
            const sw = Math.round(def.cw * 48);
            const sh = Math.round(def.ch * 48);

            const tmp = document.createElement('canvas');
            tmp.width = sw;
            tmp.height = sh;
            const tctx = tmp.getContext('2d');
            tctx.imageSmoothingEnabled = false;
            tctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

            const idata = tctx.getImageData(0, 0, sw, sh).data;
            let minX = sw, minY = sh, maxX = 0, maxY = 0;
            for (let y = 0; y < sh; y++) {
              for (let x = 0; x < sw; x++) {
                const a = idata[(y * sw + x) * 4 + 3];
                if (a > 15) {
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                }
              }
            }
            if (minX > maxX) { minX = 0; minY = 0; maxX = sw - 1; maxY = sh - 1; }
            const bw = maxX - minX + 1;
            const bh = maxY - minY + 1;

            const out = document.createElement('canvas');
            out.width = def.outW;
            out.height = def.outH;
            const octx = out.getContext('2d');
            octx.imageSmoothingEnabled = false;
            octx.drawImage(tmp, minX, minY, bw, bh, 0, 0, def.outW, def.outH);
            croppedOut[def.id] = out.toDataURL('image/png').split(',')[1];
          }

          // 2. Build Roman Characters & 12 Historical Mentors (64x128 4x4 spritesheets of 16x32 frames)
          const charImg = loaded.charBase;
          const charDefs = [
            { id: 'player_roman_male', skin: 'med_olive', hair: 'dark_curls', tunic: 'white_toga', cloak: 'imperial_crimson', wreath: 'gold_laurel' },
            { id: 'player_roman_female', skin: 'med_light', hair: 'long_braid', tunic: 'white_toga', cloak: 'royal_purple', wreath: 'gold_laurel' },
            { id: 'npc_romulus', skin: 'sun_bronzed', hair: 'dark_beard', tunic: 'shepherd_hide', cloak: 'imperial_crimson', wreath: 'wolf_pelt' },
            { id: 'npc_brutus', skin: 'med_olive', hair: 'dark_curls', tunic: 'white_toga', cloak: 'senate_purple', wreath: 'none' },
            { id: 'npc_cincinnatus', skin: 'sun_bronzed', hair: 'grey_beard', tunic: 'white_toga', cloak: 'olive_green', wreath: 'olive_branch' },
            { id: 'npc_scipio', skin: 'sun_bronzed', hair: 'dark_curls', tunic: 'lorica_armor', cloak: 'imperial_crimson', wreath: 'galea_crest' },
            { id: 'npc_gracchus', skin: 'med_light', hair: 'dark_curls', tunic: 'white_toga', cloak: 'plebeian_blue', wreath: 'none' },
            { id: 'npc_spartacus', skin: 'sun_bronzed', hair: 'dark_beard', tunic: 'gladiator_bronze', cloak: 'imperial_crimson', wreath: 'gladiator_helm' },
            { id: 'npc_caesar', skin: 'med_light', hair: 'dark_curls', tunic: 'lorica_armor', cloak: 'imperial_crimson', wreath: 'gold_laurel' },
            { id: 'npc_augustus', skin: 'med_light', hair: 'golden_mane', tunic: 'white_toga', cloak: 'royal_purple', wreath: 'gold_laurel' },
            { id: 'npc_claudia', skin: 'med_light', hair: 'long_braid', tunic: 'white_toga', cloak: 'plebeian_blue', wreath: 'gold_diadem' },
            { id: 'npc_trajan', skin: 'med_olive', hair: 'dark_curls', tunic: 'lorica_armor', cloak: 'royal_purple', wreath: 'gold_laurel' },
            { id: 'npc_konstantin', skin: 'med_light', hair: 'dark_curls', tunic: 'lorica_armor', cloak: 'royal_purple', wreath: 'gold_diadem' },
            { id: 'npc_cassiodor', skin: 'med_olive', hair: 'grey_beard', tunic: 'monk_robe', cloak: 'gold_sash', wreath: 'none' },
            { id: 'npc_guard', skin: 'sun_bronzed', hair: 'dark_curls', tunic: 'lorica_armor', cloak: 'imperial_crimson', wreath: 'galea_crest' },
          ];

          const charOut = {};
          for (const def of charDefs) {
            const c = document.createElement('canvas');
            c.width = 64;
            c.height = 128;
            const ctx = c.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(charImg, 0, 0, 64, 128, 0, 0, 64, 128);

            const imgData = ctx.getImageData(0, 0, 64, 128);
            const d = imgData.data;

            for (let i = 0; i < d.length; i += 4) {
              const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
              if (a < 64) continue;

              const isHair = (r > 60 && r < 145 && g > 35 && g < 100 && b > 20 && b < 75 && r > g && g >= b);
              const isSkin = (r > 200 && g > 150 && b > 120 && r > g && g > b && (r - b) > 30);
              const isTunic = (r > 120 && r > g * 1.35 && r > b * 1.35);
              const isPants = (b > 65 && b > r * 1.1 && b >= g);

              if (isSkin) {
                const lum = (r + g + b) / 3;
                if (def.skin === 'sun_bronzed') {
                  d[i] = Math.min(255, Math.round(lum * 1.0));
                  d[i + 1] = Math.min(255, Math.round(lum * 0.76));
                  d[i + 2] = Math.min(255, Math.round(lum * 0.55));
                } else if (def.skin === 'med_light') {
                  d[i] = Math.min(255, Math.round(lum * 1.08));
                  d[i + 1] = Math.min(255, Math.round(lum * 0.90));
                  d[i + 2] = Math.min(255, Math.round(lum * 0.72));
                } else {
                  d[i] = Math.min(255, Math.round(lum * 1.04));
                  d[i + 1] = Math.min(255, Math.round(lum * 0.84));
                  d[i + 2] = Math.min(255, Math.round(lum * 0.64));
                }
              }

              if (isHair) {
                const lum = (r + g + b) / 3;
                if (def.hair === 'grey_beard') {
                  d[i] = Math.min(255, Math.round(lum * 1.6 + 60));
                  d[i + 1] = Math.min(255, Math.round(lum * 1.6 + 60));
                  d[i + 2] = Math.min(255, Math.round(lum * 1.65 + 65));
                } else if (def.hair === 'golden_mane') {
                  d[i] = Math.min(255, Math.round(lum * 1.9 + 50));
                  d[i + 1] = Math.min(255, Math.round(lum * 1.45 + 30));
                  d[i + 2] = Math.min(255, Math.round(lum * 0.55 + 10));
                } else {
                  d[i] = Math.round(lum * 0.35 + 12);
                  d[i + 1] = Math.round(lum * 0.25 + 8);
                  d[i + 2] = Math.round(lum * 0.20 + 6);
                }
              }

              if (isTunic) {
                const lum = r;
                if (def.tunic === 'lorica_armor') {
                  d[i] = Math.min(255, Math.round(lum * 1.05 + 35));
                  d[i + 1] = Math.min(255, Math.round(lum * 1.05 + 35));
                  d[i + 2] = Math.min(255, Math.round(lum * 1.15 + 45));
                } else if (def.tunic === 'gladiator_bronze' || def.tunic === 'shepherd_hide') {
                  d[i] = Math.min(255, Math.round(lum * 1.15 + 25));
                  d[i + 1] = Math.min(255, Math.round(lum * 0.78 + 15));
                  d[i + 2] = Math.min(255, Math.round(lum * 0.32 + 5));
                } else if (def.tunic === 'monk_robe') {
                  d[i] = Math.min(255, Math.round(lum * 0.7 + 20));
                  d[i + 1] = Math.min(255, Math.round(lum * 0.5 + 15));
                  d[i + 2] = Math.min(255, Math.round(lum * 0.35 + 10));
                } else {
                  // Crisp Roman Toga / Tunica
                  d[i] = Math.min(255, Math.round(lum * 1.35 + 48));
                  d[i + 1] = Math.min(255, Math.round(lum * 1.32 + 44));
                  d[i + 2] = Math.min(255, Math.round(lum * 1.24 + 36));
                }
              }

              if (isPants) {
                const lum = b;
                if (def.cloak === 'imperial_crimson') {
                  d[i] = Math.min(255, Math.round(lum * 1.45 + 40));
                  d[i + 1] = Math.round(lum * 0.22 + 8);
                  d[i + 2] = Math.round(lum * 0.22 + 8);
                } else if (def.cloak === 'royal_purple' || def.cloak === 'senate_purple') {
                  d[i] = Math.min(255, Math.round(lum * 1.15 + 35));
                  d[i + 1] = Math.round(lum * 0.25 + 10);
                  d[i + 2] = Math.min(255, Math.round(lum * 1.35 + 45));
                } else if (def.cloak === 'plebeian_blue') {
                  d[i] = Math.round(lum * 0.25 + 10);
                  d[i + 1] = Math.min(255, Math.round(lum * 0.85 + 30));
                  d[i + 2] = Math.min(255, Math.round(lum * 1.45 + 45));
                } else {
                  d[i] = Math.min(255, Math.round(lum * 1.25 + 35));
                  d[i + 1] = Math.min(255, Math.round(lum * 1.05 + 25));
                  d[i + 2] = Math.round(lum * 0.45 + 12);
                }
              }
            }
            ctx.putImageData(imgData, 0, 0);

            for (let row = 0; row < 4; row++) {
              for (let col = 0; col < 4; col++) {
                const fx = col * 16;
                const fy = row * 32;
                const bob = (col === 1 || col === 3) ? -1 : 0;

                if (def.wreath === 'gold_laurel' || def.wreath === 'gold_diadem') {
                  ctx.fillStyle = '#fbbf24';
                  ctx.fillRect(fx + 4, fy + 6 + bob, 8, 1);
                  ctx.fillStyle = '#f59e0b';
                  ctx.fillRect(fx + 5, fy + 5 + bob, 2, 1);
                  ctx.fillRect(fx + 9, fy + 5 + bob, 2, 1);
                } else if (def.wreath === 'galea_crest') {
                  ctx.fillStyle = '#dc2626';
                  ctx.fillRect(fx + 5, fy + 2 + bob, 6, 3);
                  ctx.fillStyle = '#cbd5e1';
                  ctx.fillRect(fx + 4, fy + 5 + bob, 8, 2);
                } else if (def.wreath === 'gladiator_helm') {
                  ctx.fillStyle = '#d97706';
                  ctx.fillRect(fx + 4, fy + 4 + bob, 8, 3);
                }

                // Toga Praetexta / Paludamentum shoulder sash
                if (def.cloak === 'imperial_crimson') {
                  ctx.fillStyle = '#b91c1c';
                  ctx.fillRect(fx + 4, fy + 15 + bob, 8, 2);
                } else if (def.cloak === 'royal_purple' || def.cloak === 'senate_purple') {
                  ctx.fillStyle = '#7e22ce';
                  ctx.fillRect(fx + 4, fy + 15 + bob, 8, 2);
                }
              }
            }
            charOut[def.id] = c.toDataURL('image/png').split(',')[1];
          }

          // 3. Render 32x32 Item & Relic Icons
          const iconOut = {};
          for (const def of iconDefs) {
            const c = document.createElement('canvas');
            c.width = 32;
            c.height = 32;
            const ctx = c.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            eval(def.draw);
            iconOut[def.id] = c.toDataURL('image/png').split(',')[1];
          }

          return { croppedOut, charOut, iconOut };
        };
      </script>
    </body>
    </html>
  `);

  const { croppedOut, charOut, iconOut } = await page.evaluate(
    (s, c, ic) => window.processAll(s, c, ic),
    sheets,
    cropDefs,
    iconDefs,
  );

  for (const [id, b64] of Object.entries(croppedOut)) {
    fs.writeFileSync(path.join('public/assets/rome', `${id}.png`), Buffer.from(b64, 'base64'));
  }

  for (const [id, b64] of Object.entries(charOut)) {
    if (id.startsWith('player_')) {
      fs.writeFileSync(path.join('public/assets/gfx', `${id}.png`), Buffer.from(b64, 'base64'));
    } else {
      fs.writeFileSync(path.join('public/assets/gfx/npcs', `${id}.png`), Buffer.from(b64, 'base64'));
    }
  }

  for (const [id, b64] of Object.entries(iconOut)) {
    fs.writeFileSync(path.join('public/assets/icons', `${id}.png`), Buffer.from(b64, 'base64'));
  }

  console.log(
    `✅ Extracted ${Object.keys(croppedOut).length} Roman world sprites, ${Object.keys(charOut).length} character sheets, and ${Object.keys(iconOut).length} item/relic icons!`,
  );
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
