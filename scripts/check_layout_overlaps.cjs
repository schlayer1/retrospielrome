#!/usr/bin/env node
/**
 * Layout Overlap Linter (check_layout_overlaps.cjs) — Altes Rom (753 v. Chr. – 476 n. Chr.)
 * Strict 95% Visual Bounding-Box Overlap Check across all static monuments, trees, rocks,
 * dynamic buildings, epoch landmarks, mentors, relics, and stations.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ATLAS_JSON = path.join(ROOT, 'public/assets/world/world_atlas.json');
const ROME_DIR = path.join(ROOT, 'public/assets/rome');
const WORLD_SCENE_TS = path.join(ROOT, 'src/scenes/WorldScene.ts');
const RELICS_TS = path.join(ROOT, 'src/data/relics.ts');

function getPngDims(filePath) {
  if (!fs.existsSync(filePath)) return { w: 32, h: 32 };
  const buf = fs.readFileSync(filePath);
  if (buf.length < 24) return { w: 32, h: 32 };
  return {
    w: buf.readUInt32BE(16),
    h: buf.readUInt32BE(20),
  };
}

// 1. Load world_atlas frame dimensions
const atlasFrames = {};
if (fs.existsSync(ATLAS_JSON)) {
  const raw = JSON.parse(fs.readFileSync(ATLAS_JSON, 'utf8'));
  for (const [k, v] of Object.entries(raw.frames || {})) {
    atlasFrames[k] = { w: v.frame.w, h: v.frame.h };
  }
}

// 2. Load standalone /assets/rome/*.png dimensions
const romeDims = {
  roman_relic_chest: { w: 16, h: 16 },
  dock_pier: { w: 48, h: 24 },
  npc_guard: { w: 16, h: 32 },
  mentor: { w: 16, h: 32 },
  fire0: { w: 16, h: 16 },
};
if (fs.existsSync(ROME_DIR)) {
  for (const f of fs.readdirSync(ROME_DIR)) {
    if (f.endsWith('.png')) {
      romeDims[f.replace(/\.png$/, '')] = getPngDims(path.join(ROME_DIR, f));
    }
  }
}

function getBox(id, kind, x, y, w, h, scale = 1, chapters = null) {
  const sw = w * scale * 0.95;
  const sh = h * scale * 0.95;
  return {
    id,
    kind,
    x,
    y,
    left: x - sw / 2,
    right: x + sw / 2,
    top: y - sh / 2,
    bottom: y + sh / 2,
    w: Math.round(sw),
    h: Math.round(sh),
    chapters,
  };
}

const src = fs.readFileSync(WORLD_SCENE_TS, 'utf8');
const boxes = [];

// Parse forestTrees
const forestMatch = src.match(/const forestTrees[^=]*=\s*\[([\s\S]*?)\];/);
if (forestMatch) {
  const re = /\[\s*(\d+)\s*,\s*(\d+)\s*,\s*'([^']+)'\s*\]/g;
  let m;
  let idx = 0;
  while ((m = re.exec(forestMatch[1])) !== null) {
    const tx = Number(m[1]), ty = Number(m[2]), frame = m[3];
    const d = atlasFrames[frame] || { w: 62, h: 80 };
    boxes.push(getBox(`forest_${idx++}_${frame}`, 'tree', tx * 16, ty * 16, d.w, d.h, 1));
  }
}

// Parse bushesAndStumps
const bushMatch = src.match(/const bushesAndStumps[^=]*=\s*\[([\s\S]*?)\];/);
if (bushMatch) {
  const re = /\[\s*(\d+)\s*,\s*(\d+)\s*,\s*'([^']+)'\s*\]/g;
  let m;
  let idx = 0;
  while ((m = re.exec(bushMatch[1])) !== null) {
    const tx = Number(m[1]), ty = Number(m[2]), frame = m[3];
    const d = atlasFrames[frame] || { w: 28, h: 24 };
    boxes.push(getBox(`bush_${idx++}_${frame}`, 'flora', tx * 16, ty * 16, d.w, d.h, 1));
  }
}

// Parse rockSpots
const rockMatch = src.match(/const rockSpots[^=]*=\s*\[([\s\S]*?)\];/);
if (rockMatch) {
  const re = /\[\s*(\d+)\s*,\s*(\d+)\s*,\s*'([^']+)'\s*\]/g;
  let m;
  let idx = 0;
  while ((m = re.exec(rockMatch[1])) !== null) {
    const tx = Number(m[1]), ty = Number(m[2]), frame = m[3];
    const d = atlasFrames[frame] || { w: 28, h: 24 };
    boxes.push(getBox(`rock_${idx++}_${frame}`, 'rock', tx * 16, ty * 16, d.w, d.h, 0.45));
  }
}

// Parse buildStaticRomanWorld placeSprite calls
const staticBlockMatch = src.match(/private buildStaticRomanWorld\(\)\s*\{([\s\S]*?)\n  \}/);
if (staticBlockMatch) {
  const block = staticBlockMatch[1];
  const psRe = /this\.placeSprite\(\s*'([^']+)'\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/g;
  let m;
  let idx = 0;
  while ((m = psRe.exec(block)) !== null) {
    const key = m[1], tx = Number(m[2]), ty = Number(m[3]), scale = Number(m[4]);
    const d = romeDims[key] || { w: 32, h: 32 };
    boxes.push(getBox(`static_${idx++}_${key}`, 'static', tx * 16, ty * 16, d.w, d.h, scale));
  }
  // forumCols loop
  const forumColMatch = block.match(/const forumCols\s*=\s*\[([\d,\s]+)\]/);
  const colScaleMatch = block.match(/this\.placeSprite\('column_corinthian',\s*cx,\s*29,\s*([\d.]+)\)/);
  if (forumColMatch && colScaleMatch) {
    const cols = forumColMatch[1].split(',').map((s) => Number(s.trim())).filter(Boolean);
    const sc = Number(colScaleMatch[1]);
    const d = romeDims['column_corinthian'] || { w: 29, h: 101 };
    for (const cx of cols) {
      boxes.push(getBox(`col_${cx}_29`, 'static', cx * 16, 29 * 16, d.w, d.h, sc));
      boxes.push(getBox(`col_${cx}_38`, 'static', cx * 16, 38 * 16, d.w, d.h, sc));
    }
  }
  // cypressSpots loop
  const cypBlockMatch = block.match(/const cypressSpots\s*=\s*\[([\s\S]*?)\];/);
  if (cypBlockMatch) {
    const cRe = /\{\s*x:\s*([\d.]+)\s*,\s*y:\s*([\d.]+)\s*\}/g;
    let cm;
    let cIdx = 0;
    while ((cm = cRe.exec(cypBlockMatch[1])) !== null) {
      const tx = Number(cm[1]), ty = Number(cm[2]);
      const key = cIdx % 2 === 0 ? 'cypress_roman_1' : 'cypress_roman_2';
      const d = romeDims[key] || { w: 36, h: 64 };
      boxes.push(getBox(`cypress_${cIdx++}`, 'tree', tx * 16, ty * 16, d.w, d.h, 0.95));
    }
  }
}

// Parse mentorCoords
const mentorBlock = src.match(/private mentorCoords[^=]*=\s*\{([\s\S]*?)\};/);
if (mentorBlock) {
  const mRe = /(\d+)\s*:\s*\{\s*x:\s*([\d.]+)\s*,\s*y:\s*([\d.]+)\s*\}/g;
  let m;
  while ((m = mRe.exec(mentorBlock[1])) !== null) {
    const ch = Number(m[1]), tx = Number(m[2]), ty = Number(m[3]);
    boxes.push(getBox(`mentor_ch${ch}`, 'mentor', tx * 16, ty * 16, 16, 32, 1, [ch]));
  }
}

// Parse buildingCoords
const bldBlock = src.match(/const buildingCoords[^=]*=\s*\{([\s\S]*?)\};/);
if (bldBlock) {
  const bRe = /(\w+)\s*:\s*\{\s*x:\s*([\d.]+)\s*,\s*y:\s*([\d.]+)\s*,\s*sprite:\s*'([^']+)'\s*,\s*scale:\s*([\d.]+)\s*\}/g;
  let m;
  while ((m = bRe.exec(bldBlock[1])) !== null) {
    const id = m[1], tx = Number(m[2]), ty = Number(m[3]), sprite = m[4], scale = Number(m[5]);
    const d = romeDims[sprite] || { w: 64, h: 64 };
    boxes.push(getBox(`bld_${id}`, 'building', tx * 16, ty * 16, d.w, d.h, scale));
    if (id === 'legion_schmiede') {
      const dTent = romeDims['legion_tent_red'] || { w: 48, h: 46 };
      const dBan = romeDims['legion_aquila_banner'] || { w: 22, h: 48 };
      boxes.push(getBox(`bld_legion_tent`, 'prop', (tx - 6) * 16, (ty + 1) * 16, dTent.w, dTent.h, 1));
      boxes.push(getBox(`bld_legion_banner`, 'prop', (tx + 4) * 16, (ty + 1) * 16, dBan.w, dBan.h, 1));
    }
  }
}

// Parse dynamic epoch landmarks, portal & trader
const dynAddRe = /this\.add\.image\(\s*([\d.]+)\s*\*\s*16\s*,\s*([\d.]+)\s*\*\s*16\s*,\s*'([^']+)'\s*\)(?:\.setScale\(([\d.]+)\))?/g;
const rebuildBlock = src.slice(src.indexOf('public rebuildChapterEntities()'));
let dm;
let dIdx = 0;
while ((dm = dynAddRe.exec(rebuildBlock)) !== null) {
  const tx = Number(dm[1]), ty = Number(dm[2]), key = dm[3], sc = dm[4] ? Number(dm[4]) : 1;
  const d = romeDims[key] || { w: 32, h: 32 };
  const chs = key.includes('ruined_') ? [12] : key === 'hannibal_elephant_sprite' ? [4] : null;
  boxes.push(getBox(`epoch_${dIdx++}_${key}`, 'landmark', tx * 16, ty * 16, d.w, d.h, sc, chs));
}

// Portal & trader
boxes.push(getBox('catacomb_portal', 'portal', 82 * 16, 48 * 16, (romeDims['catacomb_entrance'] || { w: 48, h: 52 }).w, (romeDims['catacomb_entrance'] || { w: 48, h: 52 }).h, 1));
boxes.push(getBox('ostia_trader', 'trader', 20 * 16, 58 * 16, 16, 32, 1));

// StationsList
const stBlock = rebuildBlock.match(/const stationsList[^=]*=\s*\[([\s\S]*?)\];/);
if (stBlock) {
  const sRe = /id:\s*'([^']+)'[\s\S]*?tx:\s*([\d.]+)[\s\S]*?ty:\s*([\d.]+)[\s\S]*?spriteFrame:\s*'([^']+)'/g;
  let sm;
  while ((sm = sRe.exec(stBlock[1])) !== null) {
    const id = sm[1], tx = Number(sm[2]), ty = Number(sm[3]), frame = sm[4];
    const d = atlasFrames[frame] || { w: 28, h: 28 };
    boxes.push(getBox(id, 'station', tx * 16, ty * 16, d.w, d.h, 0.42));
  }
}

// InspectableArtifacts
const artBlock = rebuildBlock.match(/const inspectableArtifacts[^=]*=\s*\[([\s\S]*?)\];/);
if (artBlock) {
  const aRe = /id:\s*'([^']+)'[\s\S]*?tx:\s*([\d.]+)[\s\S]*?ty:\s*([\d.]+)/g;
  let am;
  while ((am = aRe.exec(artBlock[1])) !== null) {
    const id = am[1], tx = Number(am[2]), ty = Number(am[3]);
    const d = atlasFrames['stone_ring'] || { w: 32, h: 28 };
    boxes.push(getBox(id, 'artifact', tx * 16, ty * 16, d.w, d.h, 0.32));
  }
}

// Relics
if (fs.existsSync(RELICS_TS)) {
  const rSrc = fs.readFileSync(RELICS_TS, 'utf8');
  const rRe = /id:\s*'([^']+)'[\s\S]*?x:\s*([\d.]+)[\s\S]*?y:\s*([\d.]+)/g;
  let rm;
  while ((rm = rRe.exec(rSrc)) !== null) {
    boxes.push(getBox(rm[1], 'relic', Number(rm[2]) * 16, Number(rm[3]) * 16, 16, 16, 1));
  }
}

function chaptersOverlap(a, b) {
  if (!a.chapters || !b.chapters) return true;
  return a.chapters.some((c) => b.chapters.includes(c));
}

const overlaps = [];
for (let i = 0; i < boxes.length; i++) {
  for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i];
    const b = boxes[j];
    if (!chaptersOverlap(a, b)) continue;
    const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ox > 0 && oy > 0) {
      overlaps.push({ a, b, ox: Math.round(ox), oy: Math.round(oy) });
    }
  }
}

if (overlaps.length > 0) {
  console.error(`❌ LAYOUT OVERLAP CHECK FAILED: ${overlaps.length} overlap(s) detected:`);
  for (const o of overlaps) {
    console.error(
      `  - [${o.a.id} (${o.a.x},${o.a.y} ${o.a.w}x${o.a.h})] overlaps [${o.b.id} (${o.b.x},${o.b.y} ${o.b.w}x${o.b.h})] by ${o.ox}x${o.oy}px`,
    );
  }
  process.exit(1);
} else {
  console.log(`✅ LAYOUT OVERLAP CHECK PASSED: ${boxes.length} placed objects verified with 0 overlaps.`);
}
