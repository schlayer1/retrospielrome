const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/nicolekeller/.gemini/antigravity/brain/591aaa86-0323-4c32-80f9-c97a424a278e';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('Starting Vite preview server on port 4179...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4179', '--strictPort'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'pipe',
  });

  await sleep(2200);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const errors = [];
  const failedUrls = [];

  try {
    const page = await browser.newPage();
    page.on('pageerror', (err) => errors.push(`PAGEERROR: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`CONSOLE ERROR: ${msg.text()}`);
      }
    });
    page.on('response', (res) => {
      if (res.status() >= 400) {
        failedUrls.push(`${res.status()} ${res.url()}`);
      }
    });

    // 1. Desktop Start Screen (1440x900)
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4179/', { waitUntil: 'networkidle0' });
    await sleep(1500);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'rom_v2_1_desktop_start.png'),
    });
    console.log('Captured rom_v2_1_desktop_start.png');

    // 2. Mobile Landscape Start Screen (812x375)
    await page.setViewport({ width: 812, height: 375, deviceScaleFactor: 2 });
    await sleep(500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'rom_v2_2_mobile_start.png'),
    });
    console.log('Captured rom_v2_2_mobile_start.png');

    // 3. Switch back to Desktop 1440x900 & start Chapter 1
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await sleep(400);
    await page.click('#start-game-btn');
    await sleep(800);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'rom_v2_3_ch1_dialog.png'),
    });
    console.log('Captured rom_v2_3_ch1_dialog.png');

    // Close intro dialog by pressing Escape
    await page.keyboard.press('Escape');
    await sleep(900);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'rom_v2_4_ch1_overworld.png'),
    });
    console.log('Captured rom_v2_4_ch1_overworld.png');

    // 4. Walk West toward Tiber bridge & water to inspect Overworld.png water + wooden bridge + goats
    await page.evaluate(() => {
      // Move near the Tiber bridge & Palatine shore
      const game = window.__PHASER_GAME__ || Object.values(window).find((v) => v && v.scene && v.scene.getScene);
      if (game) {
        const world = game.scene.getScene('World');
        if (world && world.player) {
          world.player.setPosition(28 * 16, 40 * 16);
        }
      }
    });
    // Hold left arrow for 1.2s to walk toward the Tiber bridge & Romulus
    await page.keyboard.down('ArrowLeft');
    await sleep(900);
    await page.keyboard.up('ArrowLeft');
    await sleep(600);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'rom_v2_5_tiber_and_flora.png'),
    });
    console.log('Captured rom_v2_5_tiber_and_flora.png');

    // 5. Open Pause Menu -> Switch to Chapter 8 (Augustus / Imperial Marble Forum) via Start Screen
    await page.keyboard.press('KeyP');
    await sleep(500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'rom_v2_6_pause_dashboard.png'),
    });
    console.log('Captured rom_v2_6_pause_dashboard.png');

    // Click Chapter 8 in Start Screen to verify Imperial Forum marble ground & Augustus sprite
    await page.evaluate(() => {
      localStorage.setItem(
        'retro_save_rom',
        JSON.stringify({
          chapter: 8,
          maxUnlockedChapter: 12,
          completedChapters: [1, 2, 3, 4, 5, 6, 7],
          inventory: {},
          craftedOnce: [],
          builtBuildings: ['vesta_herd', 'curia_senat', 'legion_schmiede', 'via_appia', 'aquaedukt', 'thermen', 'kolosseum'],
          playerX: 54 * 16,
          playerY: 34 * 16,
          quizPerfect: [1, 2, 3, 4, 5, 6, 7],
          gender: 'female',
          role: 'senator',
          discoveredRelics: ['relic_lupa', 'relic_zwoelftafel', 'relic_caesar_denar'],
          visitedCatacombShrine: false,
          visitedMithrasShrine: false,
          lexiconRead: [],
          playerName: 'Cornelia Valeria',
          playTimeSeconds: 420,
        })
      );
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(1200);
    await page.click('#start-game-btn');
    await sleep(600);
    await page.keyboard.press('Escape');
    await sleep(900);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'rom_v2_7_imperial_forum_ch8.png'),
    });
    console.log('Captured rom_v2_7_imperial_forum_ch8.png');

    console.log('Errors:', errors.length);
    if (errors.length > 0) console.error(errors);
    console.log('Failed URLs:', failedUrls.length);
    if (failedUrls.length > 0) console.error(failedUrls);

    if (errors.length > 0 || failedUrls.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
    server.kill();
  }
}

main();
