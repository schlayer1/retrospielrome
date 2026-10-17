const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const ARTIFACT_DIR = '/Users/nicolekeller/.gemini/antigravity/brain/591aaa86-0323-4c32-80f9-c97a424a278e';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 5198;
const URL = `http://localhost:${PORT}`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http
        .get(url, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) resolve();
          else setTimeout(check, 200);
        })
        .on('error', () => {
          if (Date.now() - start > timeoutMs) reject(new Error('Server timeout'));
          else setTimeout(check, 200);
        });
    };
    check();
  });
}

async function runVerification() {
  console.log('🚀 Starting Vite server on port', PORT);
  const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: true,
  });

  vite.stdout.on('data', (d) => process.stdout.write('[Vite] ' + d));
  vite.stderr.on('data', (d) => process.stderr.write('[Vite err] ' + d));

  let browser;
  const consoleErrors = [];
  const pageErrors = [];

  try {
    await waitForServer(URL);
    console.log('✅ Vite server is ready!');

    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });

    const page = await browser.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('[Browser Console Error]', msg.text());
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      console.error('[Browser Page Error]', err.message);
      pageErrors.push(err.message);
    });

    // =========================================================================
    // TEST 1: Mobile Landscape Viewport (667x375) & Start Button Visibility
    // =========================================================================
    console.log('📱 Test 1: Checking Mobile Landscape Viewport (667x375)...');
    await page.setViewport({ width: 667, height: 375, isMobile: true, hasTouch: true });
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#start-game-btn', { timeout: 10000 });
    await sleep(600);

    const startBtnBounds = await page.evaluate(() => {
      const btn = document.getElementById('start-game-btn');
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height };
    });

    if (!startBtnBounds) {
      throw new Error('#start-game-btn not found on Start Screen!');
    }
    console.log('   #start-game-btn bounds at 667x375:', startBtnBounds);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'rom_verify_1_mobile_start.png'),
    });

    // =========================================================================
    // TEST 2: Desktop Viewport (1280x800), Chapter 1 Intro & cleanTitle() Check
    // =========================================================================
    console.log('🖥️ Test 2: Switching to Desktop (1280x800) & Starting Chapter 1...');
    await page.setViewport({ width: 1280, height: 800, isMobile: false, hasTouch: false });
    await sleep(400);
    await page.click('#start-game-btn');
    await sleep(700);

    const bodyText = await page.evaluate(() => document.body.innerText);
    if (/KAPITEL\s*\d+\s*:\s*Kapitel\s*\d+/i.test(bodyText)) {
      throw new Error('Duplicate chapter prefix detected ("KAPITEL X: Kapitel X")!');
    }
    console.log('   ✅ cleanTitle() verified: No duplicate "KAPITEL X: Kapitel X" prefix.');

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'rom_verify_2_ch1_dialog.png'),
    });

    // =========================================================================
    // TEST 3: Close Intro Dialog -> Verify Chapter 1 World & 4-Point Gating
    // =========================================================================
    console.log('🗺️ Test 3: Advancing Chapter 1 Intro Dialog & Auditing 4-Point Chapter Gating...');
    for (let i = 0; i < 3; i++) {
      const btn = await page.$('#dialog-next-btn');
      if (btn) {
        await btn.click();
        await sleep(300);
      }
    }
    await sleep(800);

    const ch1Audit = await page.evaluate(() => {
      const game = window.__ROM_GAME__;
      const world = game.scene.getScene('World');
      const targets = world.targets || [];
      const mentors = targets.filter((t) => t.kind === 'mentor');
      const relics = targets.filter((t) => t.kind === 'relic');
      const portals = targets.filter((t) => t.kind === 'portal');
      const lateStations = targets.filter((t) => t.minChapter > 1);
      return {
        mentorCount: mentors.length,
        mentorName: mentors[0]?.name,
        relicCount: relics.length,
        relicId: relics[0]?.id,
        portalCount: portals.length,
        lateStationCount: lateStations.length,
      };
    });

    console.log('   Chapter 1 World Audit:', ch1Audit);
    if (ch1Audit.mentorCount !== 1 || ch1Audit.mentorName !== 'Romulus') {
      throw new Error(`Expected only Romulus in Chapter 1, got: ${JSON.stringify(ch1Audit)}`);
    }
    if (ch1Audit.lateStationCount !== 0 || ch1Audit.portalCount !== 0) {
      throw new Error(`Progression leak in Chapter 1! Found late stations: ${JSON.stringify(ch1Audit)}`);
    }
    console.log('   ✅ Strict 4-Point Chapter Gating verified in Chapter 1 (0 leaks).');

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'rom_verify_3_ch1_world.png'),
    });

    // =========================================================================
    // TEST 4: Verify 27 Lexicon Entries [L] & 5-Row Epoch Comparison Table [Z]
    // =========================================================================
    console.log('📖 Test 4: Auditing Lexicon (27 entries) & Epoch Comparison Table (5 rows)...');
    await page.click('[data-modal="lexicon"]');
    await sleep(500);

    const lexiconCount = await page.evaluate(
      () => document.querySelectorAll('.lexicon-card').length
    );
    console.log('   Lexicon entries rendered:', lexiconCount);
    if (lexiconCount !== 27) {
      throw new Error(`Expected 27 Lexicon entries, found ${lexiconCount}`);
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'rom_verify_4_lexicon.png'),
    });

    await page.click('[data-modal="epochs"]');
    await sleep(500);

    const epochRows = await page.evaluate(
      () => document.querySelectorAll('.epoch-comparison-table tbody tr').length
    );
    console.log('   Epoch comparison rows rendered:', epochRows);
    if (epochRows !== 5) {
      throw new Error(`Expected 5 Epoch Comparison rows, found ${epochRows}`);
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'rom_verify_5_epochs.png'),
    });

    // =========================================================================
    // TEST 5: Jump to Chapter 10 (Imperial Rome), Enter Catacombs & Check Pause [P]
    // =========================================================================
    console.log('🏛️ Test 5: Jumping to Chapter 10 (117 n. Chr. - Trajan) & Entering Catacombs...');
    await page.select('#hud-chapter-select', '10');
    await sleep(600);
    for (let i = 0; i < 3; i++) {
      const btn = await page.$('#dialog-next-btn');
      if (btn) {
        await btn.click();
        await sleep(250);
      }
    }
    await sleep(600);

    await page.evaluate(() => {
      const game = window.__ROM_GAME__;
      game.scene.sleep('World');
      game.scene.run('Catacomb');
    });
    await sleep(600);
    await page.evaluate(() => {
      const cat = window.__ROM_GAME__.scene.getScene('Catacomb');
      if (cat && cat.player) {
        cat.player.setPosition(14 * 16, 13 * 16);
      }
    });
    await sleep(500);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'rom_verify_6_catacombs.png'),
    });

    await page.evaluate(() => {
      const game = window.__ROM_GAME__;
      game.scene.sleep('Catacomb');
      game.scene.wake('World');
    });
    await sleep(500);

    await page.click('[data-modal="pause"]');
    await sleep(500);

    const pauseTiles = await page.evaluate(
      () => document.querySelectorAll('.pause-tile').length
    );
    console.log('   Pause Dashboard tiles rendered:', pauseTiles);
    if (pauseTiles !== 7) {
      throw new Error(`Expected 7 Pause Dashboard tiles, found ${pauseTiles}`);
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'rom_verify_7_pause_dashboard.png'),
    });

    if (consoleErrors.length > 0 || pageErrors.length > 0) {
      throw new Error(
        `Console/Page errors detected: ${JSON.stringify({ consoleErrors, pageErrors })}`
      );
    }

    console.log('🎉 ALL BROWSER VERIFICATION CHECKS PASSED WITH 0 ERRORS!');
  } finally {
    if (browser) await browser.close();
    vite.kill();
  }
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
