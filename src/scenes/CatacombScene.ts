import Phaser from 'phaser';
import { sound } from '../audio/sound';
import { gameState } from '../systems/GameState';
import { UIScene } from './UIScene';

interface CatacombStation {
  id: string;
  name: string;
  sub: string;
  x: number;
  y: number;
  type: 'exit' | 'ichthys' | 'mithras' | 'supply';
}

export class CatacombScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };
  private stations: CatacombStation[] = [];
  private activeStation: CatacombStation | null = null;
  private labelLayer!: HTMLDivElement;
  private stepTimer = 0;
  private facing: 'down' | 'up' | 'left' | 'right' = 'up';

  constructor() {
    super('Catacomb');
  }

  create() {
    const mapW = 40;
    const mapH = 30;

    // 1. Build dark volcanic tuff-stone underground tilemap
    const g = this.add.graphics();
    g.fillStyle(0x111827, 1);
    g.fillRect(0, 0, mapW * 16, mapH * 16);

    // Outer walls & carved corridors
    for (let ty = 0; ty < mapH; ty++) {
      for (let tx = 0; tx < mapW; tx++) {
        const inMainHall = tx >= 16 && tx <= 24 && ty >= 7 && ty <= 26;
        const inLeftCrypt = tx >= 7 && tx <= 16 && ty >= 9 && ty <= 16;
        const inRightMithraeum = tx >= 24 && tx <= 33 && ty >= 9 && ty <= 16;

        if (inMainHall || inLeftCrypt || inRightMithraeum) {
          const checker = (tx + ty) % 2 === 0 ? 0x292524 : 0x1c1917;
          g.fillStyle(checker, 1);
          g.fillRect(tx * 16, ty * 16, 16, 16);
          // Subtle mortar border
          g.fillStyle(0x44403c, 0.35);
          g.fillRect(tx * 16, ty * 16, 16, 1);
        } else {
          // Dark volcanic Roman tuff wall
          const wallShade = (tx * 7 + ty * 13) % 3 === 0 ? 0x1e1b18 : 0x0c0a09;
          g.fillStyle(wallShade, 1);
          g.fillRect(tx * 16, ty * 16, 16, 16);
        }
      }
    }

    // Mosaic carpet in center corridor
    g.fillStyle(0x7f1d1d, 0.65);
    g.fillRect(19 * 16, 9 * 16, 2 * 16, 16 * 16);

    // 2. Props & Atmospheric Arches, Sarcophagi, and Braziers
    this.add.image(20 * 16, 7 * 16, 'catacomb_arch').setDepth(7 * 16);
    this.add.image(11 * 16, 9 * 16, 'catacomb_arch').setDepth(9 * 16);
    this.add.image(29 * 16, 9 * 16, 'catacomb_arch').setDepth(9 * 16);

    // Left Crypt: Early Christian Catacomb (Ichthys & Sarcophagi)
    this.add.image(9 * 16, 11 * 16, 'marble_sarcophagus').setDepth(11 * 16);
    this.add.image(14 * 16, 11 * 16, 'marble_sarcophagus').setDepth(11 * 16);
    this.add.image(11.5 * 16, 11.5 * 16, 'ara_pacis_altar').setScale(0.75).setDepth(11.5 * 16);
    this.add.image(10 * 16, 13 * 16, 'catacomb_lantern').setDepth(13 * 16);
    this.add.image(13 * 16, 13 * 16, 'catacomb_lantern').setDepth(13 * 16);

    // Right Crypt: Roman Soldiers' Mithraeum (Mithras Sanctuary)
    this.add.image(29.5 * 16, 11.5 * 16, 'statue_emperor').setDepth(11.5 * 16);
    this.add.image(27 * 16, 12 * 16, 'brazier_roman_fire').setDepth(12 * 16);
    this.add.image(32 * 16, 12 * 16, 'brazier_roman_fire').setDepth(12 * 16);
    this.add.image(26 * 16, 10 * 16, 'column_red_porphyry').setScale(0.75).setDepth(10 * 16);
    this.add.image(33 * 16, 10 * 16, 'column_red_porphyry').setScale(0.75).setDepth(10 * 16);

    // Center North: Ancient Scroll & Oil Niche
    this.add.image(20 * 16, 9 * 16, 'roman_amphora_group').setDepth(9 * 16);

    // Warm torchlight glows
    const torchCoords = [
      { x: 11.5 * 16, y: 12 * 16, color: 0x38bdf8 },
      { x: 29.5 * 16, y: 12 * 16, color: 0xf59e0b },
      { x: 20 * 16, y: 10 * 16, color: 0xfbbf24 },
      { x: 20 * 16, y: 24 * 16, color: 0xfbbf24 },
    ];
    for (const tc of torchCoords) {
      this.add.circle(tc.x, tc.y, 38, tc.color, 0.16).setDepth(9000);
      this.add.circle(tc.x, tc.y, 16, 0xfef08a, 0.25).setDepth(9001);
    }

    // 3. Interactive Stations
    this.stations = [
      {
        id: 'catacomb_exit',
        name: 'Aufgang nach Rom',
        sub: '[E] Zurück an die Oberfläche',
        x: 20 * 16,
        y: 25 * 16,
        type: 'exit',
      },
      {
        id: 'ichthys_shrine',
        name: 'Frühchristlicher Ichthys-Altar',
        sub: '[E] Katakomben-Gebet & Fischsymbol (Kap. 9)',
        x: 11.5 * 16,
        y: 12.5 * 16,
        type: 'ichthys',
      },
      {
        id: 'mithras_shrine',
        name: 'Mithräum der Legionäre',
        sub: '[E] Mysterienkult des Lichtgottes Mithras (Kap. 10)',
        x: 29.5 * 16,
        y: 12.5 * 16,
        type: 'mithras',
      },
      {
        id: 'catacomb_supply',
        name: 'Verborgene Katakomben-Nische',
        sub: '[E] +1 Olivenöl & +1 Papyrus',
        x: 20 * 16,
        y: 9.5 * 16,
        type: 'supply',
      },
    ];

    // 4. Player Sprite
    const texKey = gameState.gender === 'female' ? 'player_female' : 'player_male';
    this.player = this.add.sprite(20 * 16, 23 * 16, texKey, 12).setDepth(23 * 16);

    // Camera setup
    this.cameras.main.setBounds(0, 0, mapW * 16, mapH * 16);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.updateCameraZoom();
    this.scale.on('resize', () => this.updateCameraZoom());

    // Controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D,E') as {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
      E: Phaser.Input.Keyboard.Key;
    };

    this.input.keyboard!.on('keydown-E', () => this.handleAction());

    // DOM Label Layer for Catacomb
    this.initDOMLabel();

    this.events.on('wake', () => {
      const tk = gameState.gender === 'female' ? 'player_female' : 'player_male';
      this.player.setTexture(tk);
      this.player.setPosition(20 * 16, 23 * 16);
      if (this.labelLayer) this.labelLayer.style.display = 'block';
    });

    this.events.on('sleep', () => {
      if (this.labelLayer) {
        this.labelLayer.style.display = 'none';
        this.labelLayer.innerHTML = '';
      }
    });
  }

  private updateCameraZoom() {
    const w = this.scale.width;
    const h = this.scale.height;
    const zoom = w < 900 || h < 500 ? 2.4 : 3.0;
    this.cameras.main.setZoom(zoom);
  }

  private initDOMLabel() {
    let existing = document.getElementById('catacomb-label-layer') as HTMLDivElement | null;
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'catacomb-label-layer';
      existing.style.position = 'fixed';
      existing.style.inset = '0';
      existing.style.pointerEvents = 'none';
      existing.style.zIndex = '18';
      document.body.appendChild(existing);
    }
    this.labelLayer = existing;
    this.labelLayer.style.display = 'block';
  }

  private handleAction() {
    const ui = this.scene.get('UI') as UIScene;
    if (!this.activeStation || ui.isModalOpen()) return;

    if (this.activeStation.type === 'exit') {
      sound.click();
      if (this.labelLayer) {
        this.labelLayer.style.display = 'none';
        this.labelLayer.innerHTML = '';
      }
      this.scene.sleep('Catacomb');
      this.scene.wake('World');
      ui.showToast('Du kehrst aus den Katakomben ans Tageslicht Roms zurück.');
      return;
    }

    if (this.activeStation.type === 'ichthys') {
      sound.success();
      gameState.visitCatacombShrine();
      ui.openModalDialog(
        'Frühchristlicher Altar in den Katakomben',
        'Untergrundgemeinde Roms (ab 64 n. Chr.)',
        [
          'In die weiche Tuffsteinwand ist ein Fisch eingeritzt: ΙΧΘΥΣ (Ichthys) – das geheime Erkennungszeichen der verfolgten Christen („Jesus Christus, Gottes Sohn, Erlöser").',
          'Weil die Christen das Opfer vor den Kaiserstatuen verweigerten, ließ Kaiser Nero sie nach dem Großen Brand Roms 64 n. Chr. grausam verfolgen. Hier unter der Erde bestatteten sie ihre Toten und teilten das Brot in Hoffnung auf Erlösung.',
          '✅ Fortschritt vermerkt: Du hast den frühchristlichen Katakomben-Schrein besucht!',
        ]
      );
      return;
    }

    if (this.activeStation.type === 'mithras') {
      sound.success();
      gameState.visitMithrasShrine();
      ui.openModalDialog(
        'Mithräum der Römischen Legionäre',
        'Soldaten-Mysterienkult der Kaiserzeit (2.–3. Jh. n. Chr.)',
        [
          'Im flackernden Fackelschein erkennst du das Kultbild der „Tauroktonie": Der persische Lichtgott Mithras tötet den Urstier in einer Felshöhle, woraus neues Leben und Korn entspringen.',
          'Besonders unter den Legionären am Limes und in den Garnisonen des Imperiums war der Mithraskult extrem verbreitet: Er forderte von seinen Eingeweihten Mut, Disziplin, Handschlagtreue und Kameradschaft.',
          '✅ Fortschritt vermerkt: Du hast das unterirdische Mithras-Heiligtum der Legionäre geweiht!',
        ]
      );
      return;
    }

    if (this.activeStation.type === 'supply') {
      sound.pickup();
      gameState.addItem('olivenoel', 1);
      gameState.addItem('ziegel', 1);
      ui.showToast('Gefunden: +1 Römisches Olivenöl & +1 Tonziegel!');
    }
  }

  update(_time: number, delta: number) {
    const ui = this.scene.get('UI') as UIScene;
    if (ui && ui.isModalOpen()) {
      this.player.anims.stop();
      return;
    }

    const dt = delta / 1000;
    const speed = 78;
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

      const nextX = Phaser.Math.Clamp(this.player.x + vx * dt, 8 * 16, 32 * 16);
      const nextY = Phaser.Math.Clamp(this.player.y + vy * dt, 8 * 16, 25.5 * 16);
      this.player.setPosition(nextX, nextY);
      this.player.setDepth(this.player.y);

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
        this.stepTimer = 280;
      }
    } else {
      this.player.anims.stop();
    }

    // Proximity station check (< 44px)
    let closest: CatacombStation | null = null;
    let bestDist = 44;
    for (const st of this.stations) {
      const d = Math.hypot(this.player.x - st.x, this.player.y - st.y);
      if (d < bestDist) {
        bestDist = d;
        closest = st;
      }
    }
    this.activeStation = closest;
    this.renderDOMLabel();
  }

  private renderDOMLabel() {
    if (!this.labelLayer) return;
    if (!this.activeStation) {
      this.labelLayer.innerHTML = '';
      return;
    }

    const cam = this.cameras.main;
    const screenX = (this.activeStation.x - cam.worldView.x) * cam.zoom;
    const screenY = (this.activeStation.y - 20 - cam.worldView.y) * cam.zoom;

    this.labelLayer.innerHTML = `
      <div class="world-dom-label" style="left:${Math.round(screenX)}px;top:${Math.round(screenY)}px;">
        <div class="world-dom-label-title">${this.activeStation.name}</div>
        <div class="world-dom-label-sub">${this.activeStation.sub}</div>
      </div>
    `;
  }
}
