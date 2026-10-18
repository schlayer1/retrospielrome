/**
 * InteractiveStationModal - Die 5 didaktischen Mitmach-Stationen (Museum-in-a-Game)
 * 100% optionale Knobel- und Experimentierstationen im Römischen Reich:
 * 1. Epigraphik: Lateinische Stein-Inschriften säubern & Abkürzungen dechiffrieren
 * 2. Ingenieurswesen: Aquädukt-Wasserverlauf (3x3 Rohre ausrichten)
 * 3. Horreum: Römische Schnellwaage (Statera) mit Bronzegewicht balancieren
 * 4. Astronomie: Sonnenuhr des Augustus (Solarium) auf die Mittagsstunde justieren
 * 5. Senat: Wachstafel (Tabella) – Argumente pro/contra Lex Agraria zuordnen
 */

import { sound } from '../audio/sound';
import { gameState } from '../systems/GameState';

export type StationType = 'epigraphy' | 'aqueduct' | 'scale' | 'sundial' | 'senate';

export class InteractiveStationModal {
  private overlay: HTMLDivElement | null = null;
  private currentType: StationType | null = null;
  private onCloseCallback: (() => void) | null = null;

  // Station State
  private epigraphyCleaned = 0; // 0..100%
  private epigraphyAnswers: Record<string, string> = {};

  private aqueductGrid = [
    [1, 2, 0],
    [3, 1, 2],
    [0, 3, 1],
  ]; // Rotation in 90°-Schritten

  private scaleWeightPos = 25; // 0..100
  private scaleTargetPos = 65; // Zielgewicht

  private sundialHour = 8; // 6..18 Uhr

  private senateDropped: { pro: string[]; contra: string[] } = { pro: [], contra: [] };

  constructor() {
    this.initDOM();
  }

  private initDOM() {
    if (typeof document === 'undefined') return;
    let el = document.getElementById('interactive-station-modal') as HTMLDivElement | null;
    if (!el) {
      el = document.createElement('div');
      el.id = 'interactive-station-modal';
      el.className = 'modal-backdrop';
      el.style.display = 'none';
      el.style.zIndex = '36';
      document.body.appendChild(el);
    }
    this.overlay = el;
  }

  public open(type: StationType, onClose?: () => void): void {
    if (!this.overlay) return;
    this.currentType = type;
    this.onCloseCallback = onClose || null;
    this.resetStationState(type);
    this.render();
    this.overlay.style.display = 'flex';
  }

  public close(): void {
    if (!this.overlay) return;
    this.overlay.style.display = 'none';
    this.overlay.innerHTML = '';
    this.currentType = null;
    if (this.onCloseCallback) {
      this.onCloseCallback();
      this.onCloseCallback = null;
    }
  }

  private resetStationState(type: StationType) {
    if (type === 'epigraphy') {
      this.epigraphyCleaned = 25;
      this.epigraphyAnswers = {};
    } else if (type === 'aqueduct') {
      this.aqueductGrid = [
        [1, 2, 0],
        [3, 1, 2],
        [0, 3, 1],
      ];
    } else if (type === 'scale') {
      this.scaleWeightPos = 25;
      this.scaleTargetPos = 65;
    } else if (type === 'sundial') {
      this.sundialHour = 8;
    } else if (type === 'senate') {
      this.senateDropped = { pro: [], contra: [] };
    }
  }

  private render(): void {
    if (!this.overlay || !this.currentType) return;

    switch (this.currentType) {
      case 'epigraphy':
        this.renderEpigraphy();
        break;
      case 'aqueduct':
        this.renderAqueduct();
        break;
      case 'scale':
        this.renderScale();
        break;
      case 'sundial':
        this.renderSundial();
        break;
      case 'senate':
        this.renderSenate();
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // 1. STATION: EPIGRAPHIK (Inschriften säubern & Abkürzungen lösen)
  // ---------------------------------------------------------------------------
  private renderEpigraphy(): void {
    const isCleaned = this.epigraphyCleaned >= 100;
    const allAnswered =
      this.epigraphyAnswers['SPQR'] === 'Senatus Populusque Romanus' &&
      this.epigraphyAnswers['IMP'] === 'Imperator (Oberbefehlshaber)' &&
      this.epigraphyAnswers['COS'] === 'Consul (Höchster Staatsbeamter)';

    this.overlay!.innerHTML = `
      <div class="roman-modal station-modal">
        <div class="modal-top-bar">
          <h2>🏛️ Mitmach-Station: Römische Epigraphik (Stein-Inschriften)</h2>
          <button class="close-x-btn" id="station-close-btn">✕</button>
        </div>

        <p class="modal-intro-p">
          Römische Steininschriften waren die „Plakate und Zeitungen" der Antike. Wische über den verwitterten Marmor, um den Text lesbar zu machen, und ordne die Abkürzungen zu!
        </p>

        <div class="station-stone-display" id="stone-clean-area" style="cursor:pointer;" title="Klicken/Wischen zum Säubern">
          <div class="stone-carving" style="opacity:${Math.min(1, 0.35 + (this.epigraphyCleaned / 100) * 0.65)};">
            SENATUS • POPULUSQUE • ROMANUS<br/>
            IMP • CAESAR • AUGUSTUS • COS • XI
          </div>
          <div class="stone-clean-bar">
            <span>Marmorfreilegung: ${this.epigraphyCleaned}%</span>
            <div class="clean-bar-bg"><div class="clean-bar-fill" style="width:${this.epigraphyCleaned}%;"></div></div>
          </div>
        </div>

        ${
          !isCleaned
            ? `<div style="text-align:center;margin:10px 0;">
                <button class="primary-roman-btn" id="clean-step-btn">🧹 Moos & Staub mit Pinsel entfernen (+25%)</button>
               </div>`
            : `
            <div class="epigraphy-quiz-box">
              <h4 style="margin:6px 0 8px 0;color:#3b1e08;">Dechiffriere die antiken Abkürzungen:</h4>
              <div class="abbrev-row">
                <strong>S.P.Q.R.</strong> ➔ 
                <select data-abbrev="SPQR" class="station-select">
                  <option value="">-- Bedeutung wählen --</option>
                  <option value="Senatus Populusque Romanus" ${this.epigraphyAnswers['SPQR'] === 'Senatus Populusque Romanus' ? 'selected' : ''}>Senatus Populusque Romanus (Senat & Volk von Rom)</option>
                  <option value="Soldaten Patrouillieren Quer Durch Rom">Soldaten Patrouillieren Quer Durch Rom</option>
                </select>
              </div>
              <div class="abbrev-row" style="margin-top:6px;">
                <strong>IMP.</strong> ➔ 
                <select data-abbrev="IMP" class="station-select">
                  <option value="">-- Bedeutung wählen --</option>
                  <option value="Imperator (Oberbefehlshaber)" ${this.epigraphyAnswers['IMP'] === 'Imperator (Oberbefehlshaber)' ? 'selected' : ''}>Imperator (Siegreicher Feldherr & Kaiser)</option>
                  <option value="Importeur aus Übersee">Importeur aus Übersee</option>
                </select>
              </div>
              <div class="abbrev-row" style="margin-top:6px;">
                <strong>COS.</strong> ➔ 
                <select data-abbrev="COS" class="station-select">
                  <option value="">-- Bedeutung wählen --</option>
                  <option value="Consul (Höchster Staatsbeamter)" ${this.epigraphyAnswers['COS'] === 'Consul (Höchster Staatsbeamter)' ? 'selected' : ''}>Consul (Höchster Jahresbeamter der Republik)</option>
                  <option value="Cosinus-Messung">Cosinus-Messung</option>
                </select>
              </div>
            </div>
          `
        }

        <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12px;color:#786655;">Didaktischer Nutzen: Schriftquellen-Kompetenz</span>
          <button class="primary-roman-btn" id="station-done-btn" ${!allAnswered ? 'disabled' : ''}>
            ${allAnswered ? '🏆 Inschrift entschlüsselt! (+10 Punkte)' : 'Löse die Abkürzungen...'}
          </button>
        </div>
      </div>
    `;

    this.bindCommonEvents();

    this.overlay!.querySelector('#clean-step-btn')?.addEventListener('click', () => {
      sound.click();
      this.epigraphyCleaned = Math.min(100, this.epigraphyCleaned + 25);
      this.render();
    });

    this.overlay!.querySelectorAll('[data-abbrev]').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        sound.click();
        const k = (e.target as HTMLElement).getAttribute('data-abbrev')!;
        this.epigraphyAnswers[k] = (e.target as HTMLSelectElement).value;
        this.render();
      });
    });

    if (allAnswered) {
      this.overlay!.querySelector('#station-done-btn')?.addEventListener('click', () => {
        sound.success();
        this.onStationComplete('Epigraphik & Stein-Inschriften');
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 2. STATION: INGENIEURSWESEN (Aquädukt-Wasserverlauf)
  // ---------------------------------------------------------------------------
  private renderAqueduct(): void {
    // Ziel: Röhren so ausrichten, dass alle auf 0° (gerade) stehen
    const isSolved = this.aqueductGrid.every((row) => row.every((val) => val === 0));

    this.overlay!.innerHTML = `
      <div class="roman-modal station-modal">
        <div class="modal-top-bar">
          <h2>💧 Mitmach-Station: Aquädukt-Ingenieurswesen</h2>
          <button class="close-x-btn" id="station-close-btn">✕</button>
        </div>

        <p class="modal-intro-p">
          Römische Aquädukte überbrückten Dutzende Kilometer mit stetigem Gefälle (ca. 0,5 %). Drehe die bleiernen Rohrleitungen (Fistulae) durch Anklicken um 90°, bis das Wasser vom Quellbecken zum Forum-Brunnen fließt!
        </p>

        <div class="aqueduct-puzzle-container">
          <div class="aqueduct-flow-label">🏔️ Quellfassung in den Bergen ➔</div>
          <div class="aqueduct-grid">
            ${this.aqueductGrid
              .map(
                (row, rIdx) => `
              <div class="aqueduct-row">
                ${row
                  .map(
                    (rot, cIdx) => `
                  <button class="aqueduct-pipe-btn ${rot === 0 ? 'flowing' : ''}" data-pipe="${rIdx},${cIdx}" title="Klicken zum Drehen um 90°">
                    <span class="pipe-arrow" style="transform:rotate(${rot * 90}deg);">═</span>
                  </button>
                `
                  )
                  .join('')}
              </div>
            `
              )
              .join('')}
          </div>
          <div class="aqueduct-flow-label">➔ 🏛️ Öffentlicher Forum-Brunnen</div>
        </div>

        <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12px;color:#786655;">Didaktischer Nutzen: Antike Wasserversorgung & Gefälle</span>
          <button class="primary-roman-btn" id="station-done-btn" ${!isSolved ? 'disabled' : ''}>
            ${isSolved ? '🌊 Wasser fließt! (+10 Punkte)' : 'Richte alle 9 Segmente aus...'}
          </button>
        </div>
      </div>
    `;

    this.bindCommonEvents();

    this.overlay!.querySelectorAll('[data-pipe]').forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.click();
        const [r, c] = btn.getAttribute('data-pipe')!.split(',').map((x) => parseInt(x, 10));
        this.aqueductGrid[r][c] = (this.aqueductGrid[r][c] + 1) % 4;
        this.render();
      });
    });

    if (isSolved) {
      this.overlay!.querySelector('#station-done-btn')?.addEventListener('click', () => {
        sound.success();
        this.onStationComplete('Aquädukt-Wasserverlauf');
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 3. STATION: HORREUM (Römische Schnellwaage / Statera)
  // ---------------------------------------------------------------------------
  private renderScale(): void {
    const isBalanced = Math.abs(this.scaleWeightPos - this.scaleTargetPos) <= 4;

    this.overlay!.innerHTML = `
      <div class="roman-modal station-modal">
        <div class="modal-top-bar">
          <h2>⚖️ Mitmach-Station: Die Römische Schnellwaage (Statera)</h2>
          <button class="close-x-btn" id="station-close-btn">✕</button>
        </div>

        <p class="modal-intro-p">
          Im Getreidespeicher (Horreum) wogen die Beamten Weizenscheffel für die staatliche Getreidespende ab. Verschiebe das birnenförmige Bronzegewicht (Aequipondium) entlang des ungleicharmigen Hebelbalkens, bis die Waage im Gleichgewicht steht!
        </p>

        <div class="scale-display-box">
          <div class="scale-beam-visual">
            <div class="scale-pan left-pan">🌾 2 Scheffel Emmer-Weizen</div>
            <div class="scale-fulcrum">▲ Drehpunkt</div>
            <div class="scale-pan right-pan" style="transform:translateY(${(this.scaleWeightPos - this.scaleTargetPos) * 0.8}px);">
              ⚖️ Laufgewicht (${this.scaleWeightPos} Librae)
            </div>
          </div>

          <div style="margin-top:16px;">
            <label style="font-weight:700;font-size:13px;">Balkenkerbe justieren (Laufgewicht verschieben):</label>
            <input type="range" id="scale-slider" min="0" max="100" value="${this.scaleWeightPos}" style="width:100%;cursor:pointer;margin-top:6px;" />
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#786655;margin-top:2px;">
              <span>0 Librae (Leicht)</span>
              <span style="font-weight:800;color:${isBalanced ? '#15803d' : '#b45309'};">${isBalanced ? '✓ PERFEKTES GLEICHGEWICHT!' : 'Noch unbalanciert'}</span>
              <span>100 Librae (Schwer)</span>
            </div>
          </div>
        </div>

        <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12px;color:#786655;">Didaktischer Nutzen: Antikes Hebelgesetz, Eichwesen & Annona</span>
          <button class="primary-roman-btn" id="station-done-btn" ${!isBalanced ? 'disabled' : ''}>
            ${isBalanced ? '✓ Exakt abgewogen! (+10 Punkte)' : 'Bringe die Waage ins Gleichgewicht...'}
          </button>
        </div>
      </div>
    `;

    this.bindCommonEvents();

    const slider = this.overlay!.querySelector('#scale-slider') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', () => {
        this.scaleWeightPos = parseInt(slider.value, 10);
        this.render();
      });
    }

    if (isBalanced) {
      this.overlay!.querySelector('#station-done-btn')?.addEventListener('click', () => {
        sound.success();
        this.onStationComplete('Römische Schnellwaage & Horreum');
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 4. STATION: ASTRONOMIE (Sonnenuhr des Augustus / Solarium)
  // ---------------------------------------------------------------------------
  private renderSundial(): void {
    const isNoon = this.sundialHour === 12;

    this.overlay!.innerHTML = `
      <div class="roman-modal station-modal">
        <div class="modal-top-bar">
          <h2>☀️ Mitmach-Station: Sonnenuhr des Augustus (Solarium)</h2>
          <button class="close-x-btn" id="station-close-btn">✕</button>
        </div>

        <p class="modal-intro-p">
          Auf dem Marsfeld ließ Augustus einen ägyptischen Obelisken als Schattenwerfer (Gnomon) aufstellen. Finde die Mittagsstunde (Hora Sexta = 12:00 Uhr), an der der Schatten genau die Meridianlinie des Friedensaltars kreuzt!
        </p>

        <div class="sundial-display-box">
          <div class="sundial-sky">
            <span style="font-size:24px;">☀️</span>
            <div class="gnomon-pillar">🏛️ Obelisk</div>
            <div class="gnomon-shadow" style="transform:scaleX(${(12 - this.sundialHour) * 0.22});opacity:0.8;"></div>
          </div>
          <div class="sundial-time-readout">
            Aktuelle Sonnenstunde: <strong>Hora ${this.sundialHour - 6} (${this.sundialHour}:00 Uhr)</strong>
          </div>
          <input type="range" id="sundial-slider" min="6" max="18" value="${this.sundialHour}" style="width:100%;cursor:pointer;margin-top:8px;" />
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#786655;margin-top:2px;">
            <span>Morgengrauen (06:00)</span>
            <span style="font-weight:800;color:${isNoon ? '#15803d' : '#b45309'};">${isNoon ? '✓ HORA SEXTA (MITTAG)' : 'Justieren'}</span>
            <span>Abenddämmerung (18:00)</span>
          </div>
        </div>

        <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12px;color:#786655;">Didaktischer Nutzen: Zeitmessung & augusteische Baupropaganda</span>
          <button class="primary-roman-btn" id="station-done-btn" ${!isNoon ? 'disabled' : ''}>
            ${isNoon ? '☀️ Mittags-Meridian justiert! (+10 Punkte)' : 'Finde Hora Sexta (12:00)...'}
          </button>
        </div>
      </div>
    `;

    this.bindCommonEvents();

    const slider = this.overlay!.querySelector('#sundial-slider') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', () => {
        this.sundialHour = parseInt(slider.value, 10);
        this.render();
      });
    }

    if (isNoon) {
      this.overlay!.querySelector('#station-done-btn')?.addEventListener('click', () => {
        sound.success();
        this.onStationComplete('Sonnenuhr des Augustus (Solarium)');
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 5. STATION: SENAT & POLITIK (Wachstafel / Tabella)
  // ---------------------------------------------------------------------------
  private renderSenate(): void {
    const isCompleted = this.senateDropped.pro.length >= 2 && this.senateDropped.contra.length >= 2;

    this.overlay!.innerHTML = `
      <div class="roman-modal station-modal">
        <div class="modal-top-bar">
          <h2>📜 Mitmach-Station: Senats-Abstimmung (Wachstafel Tabella)</h2>
          <button class="close-x-btn" id="station-close-btn">✕</button>
        </div>

        <p class="modal-intro-p">
          Vor der Curia Julia wird über das Ackergesetz (Lex Agraria) debattiert. Weise die historischen Argumente den beiden Lagern zu: Zustimmung (Uti Rogas) oder Ablehnung (Antiquo)!
        </p>

        <div class="senate-voting-grid">
          <div class="senate-column pro-col">
            <h4>🟢 ZUSTIMMUNG (Uti Rogas – Popularen)</h4>
            <div class="senate-args-box">
              <button class="senate-arg-btn ${this.senateDropped.pro.includes('land') ? 'selected' : ''}" data-senate="pro,land">
                🌾 Verarmte Kleinbauern erhalten wieder eigenes Land
              </button>
              <button class="senate-arg-btn ${this.senateDropped.pro.includes('army') ? 'selected' : ''}" data-senate="pro,army">
                🛡️ Nur Bauern mit eigenem Land können Soldaten in den Legionen werden
              </button>
            </div>
          </div>

          <div class="senate-column contra-col">
            <h4>🔴 ABLEHNUNG (Antiquo – Optimaten)</h4>
            <div class="senate-args-box">
              <button class="senate-arg-btn ${this.senateDropped.contra.includes('property') ? 'selected' : ''}" data-senate="contra,property">
                🏛️ Senatoren wollen das besetzte Staatsland (Ager Publicus) nicht abgeben
              </button>
              <button class="senate-arg-btn ${this.senateDropped.contra.includes('order') ? 'selected' : ''}" data-senate="contra,order">
                ⚖️ Umverteilung bedroht die traditionelle Machtordnung des Senats
              </button>
            </div>
          </div>
        </div>

        <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12px;color:#786655;">Didaktischer Nutzen: Multiperspektivität im Parteienstreit der Republik</span>
          <button class="primary-roman-btn" id="station-done-btn" ${!isCompleted ? 'disabled' : ''}>
            ${isCompleted ? '📜 Abstimmung vollendet! (+10 Punkte)' : 'Wähle alle Argumente aus...'}
          </button>
        </div>
      </div>
    `;

    this.bindCommonEvents();

    this.overlay!.querySelectorAll('[data-senate]').forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.click();
        const [side, key] = btn.getAttribute('data-senate')!.split(',');
        if (side === 'pro') {
          if (!this.senateDropped.pro.includes(key)) this.senateDropped.pro.push(key);
        } else {
          if (!this.senateDropped.contra.includes(key)) this.senateDropped.contra.push(key);
        }
        this.render();
      });
    });

    if (isCompleted) {
      this.overlay!.querySelector('#station-done-btn')?.addEventListener('click', () => {
        sound.success();
        this.onStationComplete('Senats-Abstimmung & Wachstafeln');
      });
    }
  }

  private bindCommonEvents(): void {
    this.overlay!.querySelector('#station-close-btn')?.addEventListener('click', () => this.close());
  }

  private onStationComplete(title: string): void {
    sound.success();
    // Bonus-Punkte im GameState gutschreiben
    gameState.addPoints(10);
    this.close();
  }
}

export const interactiveStations = new InteractiveStationModal();
