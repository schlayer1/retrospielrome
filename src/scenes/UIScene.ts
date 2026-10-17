import Phaser from 'phaser';
import { sound } from '../audio/sound';
import { CHAPTERS, EPOCH_COMPARISON, HIGHLIGHT_TERMS, LEXICON } from '../data/chapters';
import { BUILDINGS, ITEMS, RECIPES, RomanItemId, TRADES } from '../data/items';
import { ROMAN_RELICS, RomanRelic } from '../data/relics';
import { gameState, ROM_ROLES } from '../systems/GameState';
import { PlayerGender, PlayerRole } from '../systems/SaveManager';
import { TouchControls } from '../ui/TouchControls';
import { WorldScene } from './WorldScene';

export const cleanTitle = (t: string): string =>
  t.replace(/^Kapitel\s*\d+\s*:\s*/i, '');

export type ModalType =
  | 'none'
  | 'start'
  | 'dialog'
  | 'quiz'
  | 'summary'
  | 'inventory'
  | 'craft'
  | 'build'
  | 'trade'
  | 'lexicon'
  | 'epochs'
  | 'certificate'
  | 'pause'
  | 'relic';

export class UIScene extends Phaser.Scene {
  public touchControls!: TouchControls;
  private activeModal: ModalType = 'start';
  private uiRoot!: HTMLDivElement;
  private hudHeader!: HTMLDivElement;
  private questBox!: HTMLDivElement;
  private modalOverlay!: HTMLDivElement;
  private toastContainer!: HTMLDivElement;

  private craftCategoryFilter: 'all' | 'economy' | 'republic' | 'empire' = 'all';
  private lexiconSearch = '';
  private lexiconCategory = 'Alle';
  private questCollapsed = false;

  // Dialog & Quiz state
  private dialogLines: string[] = [];
  private dialogIndex = 0;
  private dialogSpeaker = '';
  private dialogRole = '';
  private dialogPortrait = '';
  private quizIndex = 0;
  private quizMistakes = 0;
  private quizAnswered = false;
  private quizSelectedOption: number | null = null;

  constructor() {
    super('UI');
  }

  create() {
    this.initDOMStructure();
    this.touchControls = new TouchControls((key) => this.handleShortcutKey(key));
    this.registerKeyboardShortcuts();

    gameState.onChange(() => {
      this.renderHUD();
      this.renderQuestTracker();
    });

    // Playtime counter
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.activeModal !== 'start' && this.activeModal !== 'pause') {
          gameState.playTimeSeconds += 1;
        }
      },
    });

    this.renderHUD();
    this.renderQuestTracker();
    this.openStartScreen();
  }

  public isModalOpen(): boolean {
    return this.activeModal !== 'none';
  }

  private initDOMStructure() {
    let root = document.getElementById('ui-layer') as HTMLDivElement | null;
    if (!root) {
      root = document.createElement('div');
      root.id = 'ui-layer';
      document.body.appendChild(root);
    }
    this.uiRoot = root;
    this.uiRoot.innerHTML = '';

    this.hudHeader = document.createElement('div');
    this.hudHeader.className = 'hud-top-bar';

    this.questBox = document.createElement('div');
    this.questBox.className = 'hud-quest-tracker';

    this.modalOverlay = document.createElement('div');
    this.modalOverlay.className = 'modal-backdrop';
    this.modalOverlay.style.display = 'none';

    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';

    this.uiRoot.appendChild(this.hudHeader);
    this.uiRoot.appendChild(this.questBox);
    this.uiRoot.appendChild(this.modalOverlay);
    this.uiRoot.appendChild(this.toastContainer);

    // Delegate clicks on highlighted lexicon terms inside dialogs
    this.modalOverlay.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains('term-highlight')) {
        const termId = target.getAttribute('data-term');
        if (termId) {
          sound.click();
          gameState.markLexiconRead(termId);
          const entry = LEXICON.find((x) => x.id === termId);
          if (entry) {
            this.showToast(`📖 ${entry.term}: ${entry.definition}`);
          }
        }
      }
    });
  }

  private registerKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = e.key.toUpperCase();
      if (key === 'ESCAPE') {
        if (this.activeModal !== 'none' && this.activeModal !== 'start') {
          sound.click();
          this.closeModal();
        } else if (this.activeModal === 'none') {
          this.toggleModal('pause');
        }
        return;
      }

      if (this.activeModal === 'start') return;

      if (['I', 'C', 'B', 'H', 'L', 'Z', 'U', 'P', 'M'].includes(key)) {
        e.preventDefault();
        this.handleShortcutKey(key);
      }
    });
  }

  private handleShortcutKey(key: string) {
    if (this.activeModal === 'start') return;
    switch (key) {
      case 'I':
        this.toggleModal('inventory');
        break;
      case 'C':
        this.toggleModal('craft');
        break;
      case 'B':
        this.toggleModal('build');
        break;
      case 'H':
        this.toggleModal('trade');
        break;
      case 'L':
        this.toggleModal('lexicon');
        break;
      case 'Z':
        this.toggleModal('epochs');
        break;
      case 'U':
        this.toggleModal('certificate');
        break;
      case 'P':
        this.toggleModal('pause');
        break;
      case 'M': {
        const playing = sound.toggleBGM();
        this.showToast(playing ? '🎵 Hintergrundmusik aktiviert' : '🔇 Hintergrundmusik stummgeschaltet');
        this.renderHUD();
        break;
      }
    }
  }

  public toggleModal(type: ModalType) {
    sound.click();
    if (this.activeModal === type) {
      this.closeModal();
      return;
    }
    this.activeModal = type;
    this.renderActiveModal();
  }

  public closeModal() {
    this.activeModal = 'none';
    this.modalOverlay.style.display = 'none';
    this.modalOverlay.innerHTML = '';
    const world = this.scene.get('World') as WorldScene;
    if (world) world.refreshMentorMarker();
    this.renderHUD();
    this.renderQuestTracker();
  }

  public showToast(message: string) {
    const el = document.createElement('div');
    el.className = 'roman-toast';
    el.textContent = message;
    this.toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add('toast-fade-out');
      setTimeout(() => el.remove(), 350);
    }, 3200);
  }

  private formatHighlightedText(text: string): string {
    let out = text;
    const sortedTerms = Object.keys(HIGHLIGHT_TERMS).sort((a, b) => b.length - a.length);
    for (const term of sortedTerms) {
      const lexId = HIGHLIGHT_TERMS[term];
      const regex = new RegExp(`\\b(${term})\\b`, 'g');
      out = out.replace(
        regex,
        `<span class="term-highlight" data-term="${lexId}" title="Klicken für Lexikon-Erklärung">$1</span>`
      );
    }
    return out;
  }

  // =========================================================================
  // TOP HUD BAR & COLLAPSIBLE QUEST TRACKER
  // =========================================================================
  public renderHUD() {
    this.hudHeader.style.display = this.activeModal === 'start' ? 'none' : 'flex';
    this.questBox.style.display = this.activeModal === 'start' ? 'none' : 'block';
    if (this.touchControls) {
      this.touchControls.setVisible(this.activeModal === 'none');
    }
    const ch = CHAPTERS.find((c) => c.id === gameState.chapter) || CHAPTERS[0];
    const roleDef = gameState.getRoleDef();

    const chapterOptions = CHAPTERS.map(
      (c) =>
        `<option value="${c.id}" ${c.id === gameState.chapter ? 'selected' : ''}>Kap. ${c.id}: ${cleanTitle(c.title)} (${c.year})</option>`
    ).join('');

    this.hudHeader.innerHTML = `
      <div class="hud-left-cluster">
        <div class="hud-spqr-emblem">SPQR</div>
        <div class="hud-chapter-block">
          <div class="hud-chapter-title">KAPITEL ${ch.id}: ${cleanTitle(ch.title)} <span class="hud-year-pill">${ch.year}</span></div>
          <div class="hud-role-sub">
            <img src="${roleDef.icon}" class="hud-mini-icon" alt="" />
            <span>${gameState.playerName} (${roleDef.name})</span>
            <span class="hud-stat-sep">•</span>
            <span>🏺 Relikte: ${gameState.discoveredRelics.size}/5</span>
          </div>
        </div>
        <select id="hud-chapter-select" class="hud-chapter-select" title="Kapitel direkt wählen (1–12)">
          ${chapterOptions}
        </select>
      </div>
      <div class="hud-nav-buttons">
        <button class="hud-btn ${this.activeModal === 'inventory' ? 'active' : ''}" data-modal="inventory" title="Inventar & Relikte [I]">🎒 <span class="hud-btn-label">Beutel [I]</span></button>
        <button class="hud-btn ${this.activeModal === 'craft' ? 'active' : ''}" data-modal="craft" title="Handwerk [C]">⚒️ <span class="hud-btn-label">Handwerk [C]</span></button>
        <button class="hud-btn ${this.activeModal === 'build' ? 'active' : ''}" data-modal="build" title="Bauwerke [B]">🏛️ <span class="hud-btn-label">Bauen [B]</span></button>
        <button class="hud-btn ${this.activeModal === 'trade' ? 'active' : ''}" data-modal="trade" title="Seehandel Ostia [H]">⛵ <span class="hud-btn-label">Handel [H]</span></button>
        <button class="hud-btn ${this.activeModal === 'lexicon' ? 'active' : ''}" data-modal="lexicon" title="Römisches Lexikon [L]">📖 <span class="hud-btn-label">Lexikon [L]</span></button>
        <button class="hud-btn ${this.activeModal === 'epochs' ? 'active' : ''}" data-modal="epochs" title="Epochenvergleich [Z]">⏳ <span class="hud-btn-label">Epochen [Z]</span></button>
        <button class="hud-btn ${this.activeModal === 'certificate' ? 'active' : ''}" data-modal="certificate" title="A4-Urkunde [U]">📜 <span class="hud-btn-label">Urkunde [U]</span></button>
        <button class="hud-btn ${this.activeModal === 'pause' ? 'active' : ''}" data-modal="pause" title="Pause & Klassen-Code [P]">⚙️ <span class="hud-btn-label">Pause [P]</span></button>
      </div>
    `;

    const sel = this.hudHeader.querySelector('#hud-chapter-select') as HTMLSelectElement | null;
    if (sel) {
      sel.addEventListener('change', () => {
        const targetCh = parseInt(sel.value, 10);
        sound.click();
        gameState.setChapter(targetCh);
        sound.startBGM(targetCh);
        const world = this.scene.get('World') as WorldScene;
        if (world) world.onChapterChanged();
        this.openChapterIntroDialog();
      });
    }

    this.hudHeader.querySelectorAll('.hud-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const m = btn.getAttribute('data-modal') as ModalType;
        if (m) this.toggleModal(m);
      });
    });
  }

  public renderQuestTracker() {
    const ch = CHAPTERS.find((c) => c.id === gameState.chapter) || CHAPTERS[0];
    const steps = gameState.getQuestStepProgress();
    const allDone = gameState.checkQuest();

    this.questBox.innerHTML = `
      <div class="quest-header" id="quest-toggle-header">
        <span class="quest-header-title">📜 AUFTRAG (${ch.year})</span>
        <button class="quest-collapse-btn" title="Auftrag ein-/ausklappen">${this.questCollapsed ? '➕' : '➖'}</button>
      </div>
      ${
        this.questCollapsed
          ? ''
          : `
        <div class="quest-body">
          <div class="quest-mentor-line">Mentor: <strong>${ch.mentorName}</strong></div>
          <p class="quest-desc">${ch.questDescription}</p>
          <div class="quest-steps-list">
            ${steps
              .map(
                (s) => `
              <div class="quest-step-item ${s.done ? 'step-done' : ''}">
                <span>${s.done ? '✅' : '⬜'}</span>
                <span>${s.label}</span>
              </div>
            `
              )
              .join('')}
          </div>
          <div class="quest-status-banner ${allDone ? 'ready' : ''}">
            ${
              allDone
                ? `✨ Alle Aufgaben erfüllt! Sprich jetzt mit <strong>${ch.mentorName}</strong> [E] für das Kapitel-Quiz!`
                : `💡 Tipp: ${ch.hints[0]}`
            }
          </div>
          <div class="quest-action-row">
            <button class="quest-action-btn" id="btn-open-mentor-dialog">💬 Dialog / Quiz mit ${ch.mentorName}</button>
          </div>
        </div>
      `
      }
    `;

    const toggleHeader = this.questBox.querySelector('#quest-toggle-header');
    if (toggleHeader) {
      toggleHeader.addEventListener('click', () => {
        this.questCollapsed = !this.questCollapsed;
        this.renderQuestTracker();
      });
    }

    const mentorBtn = this.questBox.querySelector('#btn-open-mentor-dialog');
    if (mentorBtn) {
      mentorBtn.addEventListener('click', () => {
        sound.click();
        this.openMentorInteraction();
      });
    }
  }

  // =========================================================================
  // START SCREEN (Character, Gender & Roman Role Selection)
  // =========================================================================
  public openStartScreen() {
    this.activeModal = 'start';
    this.modalOverlay.style.display = 'flex';

    let selectedGender: PlayerGender = gameState.gender;
    let selectedRole: PlayerRole = gameState.role;
    let enteredName = gameState.playerName;

    const renderStart = () => {
      this.modalOverlay.innerHTML = `
        <div class="roman-modal start-screen-modal">
          <div class="start-banner-top">IMPERIUM ROMANUM • 16-BIT GESCHICHTS-ABENTEUER</div>
          <h1 class="start-main-title">ALTES ROM</h1>
          <div class="start-subtitle">Vom Wolfsmythos am Palatin (753 v. Chr.) bis zum Untergang Westroms (476 n. Chr.)</div>

          <div class="start-grid">
            <div class="start-col">
              <h3 class="section-heading">1. Wähle deinen Charakter & Namen</h3>
              <div class="gender-cards">
                <button class="choice-card ${selectedGender === 'male' ? 'selected' : ''}" data-gender="male">
                  <div class="choice-sprite-preview">🛡️</div>
                  <div class="choice-title">Titus Valerius</div>
                  <div class="choice-sub">Römischer Bürger</div>
                </button>
                <button class="choice-card ${selectedGender === 'female' ? 'selected' : ''}" data-gender="female">
                  <div class="choice-sprite-preview">🏛️</div>
                  <div class="choice-title">Cornelia Valeria</div>
                  <div class="choice-sub">Römische Bürgerin</div>
                </button>
              </div>
              <div class="name-input-wrap">
                <label for="player-name-input">Römischer Name (für deine Urkunde):</label>
                <input id="player-name-input" type="text" maxlength="28" value="${enteredName}" placeholder="z. B. Titus Valerius" />
              </div>
            </div>

            <div class="start-col">
              <h3 class="section-heading">2. Wähle deine Laufbahn (Rollen-Bonus)</h3>
              <div class="role-cards">
                ${ROM_ROLES.map(
                  (r) => `
                  <button class="role-card ${selectedRole === r.id ? 'selected' : ''}" data-role="${r.id}">
                    <img src="${r.icon}" class="role-card-icon" alt="${r.name}" />
                    <div class="role-card-info">
                      <div class="role-card-title">${r.name} <span class="latin-pill">${r.latinTitle}</span></div>
                      <div class="role-card-desc">${r.description}</div>
                      <div class="role-card-bonus">⭐ ${r.bonusText}</div>
                    </div>
                  </button>
                `
                ).join('')}
              </div>
            </div>
          </div>

          <div class="start-footer">
            <button id="start-game-btn" class="primary-gold-btn">
              ⚔️ REISE DURCH 12 KAPITEL STARTEN (753 v. Chr. – 476 n. Chr.)
            </button>
          </div>
        </div>
      `;

      const nameInput = this.modalOverlay.querySelector('#player-name-input') as HTMLInputElement | null;
      if (nameInput) {
        nameInput.addEventListener('input', () => {
          enteredName = nameInput.value;
        });
      }

      this.modalOverlay.querySelectorAll('[data-gender]').forEach((btn) => {
        btn.addEventListener('click', () => {
          sound.click();
          selectedGender = btn.getAttribute('data-gender') as PlayerGender;
          if (enteredName === 'Titus Valerius' || enteredName === 'Cornelia Valeria') {
            enteredName = selectedGender === 'female' ? 'Cornelia Valeria' : 'Titus Valerius';
          }
          renderStart();
        });
      });

      this.modalOverlay.querySelectorAll('[data-role]').forEach((btn) => {
        btn.addEventListener('click', () => {
          sound.click();
          selectedRole = btn.getAttribute('data-role') as PlayerRole;
          renderStart();
        });
      });

      const startBtn = this.modalOverlay.querySelector('#start-game-btn');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          sound.success();
          gameState.setProfile(selectedGender, selectedRole, enteredName);
          sound.startBGM(gameState.chapter);
          const world = this.scene.get('World') as WorldScene;
          if (world) world.refreshCharacterAppearance();
          this.openChapterIntroDialog();
        });
      }
    };

    renderStart();
  }

  // =========================================================================
  // MENTOR DIALOG, CHAPTER INTRO & 3-QUESTION QUIZ
  // =========================================================================
  public openMentorInteraction() {
    if (gameState.checkQuest()) {
      this.openChapterQuiz();
    } else {
      this.openChapterIntroDialog();
    }
  }

  public openChapterIntroDialog() {
    const ch = CHAPTERS.find((c) => c.id === gameState.chapter) || CHAPTERS[0];
    this.dialogLines = ch.introDialog;
    this.dialogIndex = 0;
    this.dialogSpeaker = ch.mentorName;
    this.dialogRole = `${ch.mentorRole} • KAPITEL ${ch.id}: ${cleanTitle(ch.title)} (${ch.year})`;
    this.dialogPortrait = `/assets/gfx/npcs/${ch.mentorId}.png`;
    this.activeModal = 'dialog';
    this.renderActiveModal();
  }

  public openModalDialog(speaker: string, role: string, lines: string[]) {
    this.dialogLines = lines;
    this.dialogIndex = 0;
    this.dialogSpeaker = speaker;
    this.dialogRole = role;
    this.dialogPortrait = '';
    this.activeModal = 'dialog';
    this.renderActiveModal();
  }

  private renderDialogModal() {
    this.modalOverlay.style.display = 'flex';
    const ch = CHAPTERS.find((c) => c.id === gameState.chapter) || CHAPTERS[0];
    const line = this.dialogLines[this.dialogIndex] || '';
    const isLast = this.dialogIndex >= this.dialogLines.length - 1;

    this.modalOverlay.innerHTML = `
      <div class="roman-modal dialog-modal">
        <div class="dialog-header">
          <div class="dialog-speaker-info">
            <div class="dialog-role-badge">${this.dialogRole}</div>
            <h2 class="dialog-speaker-name">${this.dialogSpeaker}</h2>
          </div>
          <div class="dialog-step-indicator">Seite ${this.dialogIndex + 1} / ${this.dialogLines.length}</div>
        </div>

        <div class="dialog-body">
          <p class="dialog-text">${this.formatHighlightedText(line)}</p>
        </div>

        <div class="dialog-quest-box">
          <strong>📋 Aktueller Auftrag (${ch.year}):</strong> ${ch.questDescription}
        </div>

        <div class="dialog-footer">
          <span class="dialog-hint-tip">💡 Unterstrichene Begriffe anklicken für Lexikon-Wissen</span>
          <div class="dialog-btn-group">
            ${
              this.dialogIndex > 0
                ? `<button id="dialog-prev-btn" class="secondary-roman-btn">◀ Zurück</button>`
                : ''
            }
            <button id="dialog-next-btn" class="primary-gold-btn">
              ${isLast ? '✅ Verstanden (Auftrag starten)' : 'Weiter ▶'}
            </button>
          </div>
        </div>
      </div>
    `;

    const prevBtn = this.modalOverlay.querySelector('#dialog-prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        sound.click();
        this.dialogIndex = Math.max(0, this.dialogIndex - 1);
        this.renderDialogModal();
      });
    }

    const nextBtn = this.modalOverlay.querySelector('#dialog-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        sound.click();
        if (!isLast) {
          this.dialogIndex += 1;
          this.renderDialogModal();
        } else {
          this.closeModal();
        }
      });
    }
  }

  public openChapterQuiz() {
    this.quizIndex = 0;
    this.quizMistakes = 0;
    this.quizAnswered = false;
    this.quizSelectedOption = null;
    this.activeModal = 'quiz';
    this.renderActiveModal();
  }

  private renderQuizModal() {
    this.modalOverlay.style.display = 'flex';
    const ch = CHAPTERS.find((c) => c.id === gameState.chapter) || CHAPTERS[0];
    const q = ch.quiz[this.quizIndex];

    this.modalOverlay.innerHTML = `
      <div class="roman-modal quiz-modal">
        <div class="modal-top-bar">
          <div>
            <span class="chapter-pill">KAPITEL ${ch.id}: ${cleanTitle(ch.title)} (${ch.year})</span>
            <h2>Historische Wissensprüfung bei ${ch.mentorName}</h2>
          </div>
          <div class="quiz-progress-badge">Frage ${this.quizIndex + 1} / ${ch.quiz.length}</div>
        </div>

        <div class="quiz-question-box">
          <p class="quiz-question-text">${q.question}</p>
        </div>

        <div class="quiz-options-list">
          ${q.options
            .map((opt, idx) => {
              let cls = 'quiz-option-btn';
              if (this.quizAnswered) {
                if (idx === q.correctIndex) cls += ' correct';
                else if (idx === this.quizSelectedOption) cls += ' wrong';
              }
              return `
                <button class="${cls}" data-idx="${idx}" ${this.quizAnswered ? 'disabled' : ''}>
                  <span class="opt-letter">${['A', 'B', 'C'][idx]}</span>
                  <span class="opt-text">${opt}</span>
                </button>
              `;
            })
            .join('')}
        </div>

        ${
          this.quizAnswered
            ? `
          <div class="quiz-explanation-box ${this.quizSelectedOption === q.correctIndex ? 'exp-ok' : 'exp-err'}">
            <strong>${
              this.quizSelectedOption === q.correctIndex
                ? '✅ Richtig erkannt!'
                : '❌ Nicht ganz! Versuche es gleich noch einmal:'
            }</strong>
            <p>${q.explanation}</p>
          </div>
          <div class="modal-footer-right">
            ${
              this.quizSelectedOption === q.correctIndex
                ? `<button id="quiz-continue-btn" class="primary-gold-btn">${
                    this.quizIndex < ch.quiz.length - 1
                      ? 'Nächste Frage ▶'
                      : '🏆 Kapitel abschließen!'
                  }</button>`
                : `<button id="quiz-retry-btn" class="secondary-roman-btn">🔄 Frage erneut beantworten</button>`
            }
          </div>
        `
            : ''
        }
      </div>
    `;

    this.modalOverlay.querySelectorAll('.quiz-option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.quizAnswered) return;
        const idx = parseInt(btn.getAttribute('data-idx') || '0', 10);
        this.quizSelectedOption = idx;
        this.quizAnswered = true;
        if (idx === q.correctIndex) {
          sound.success();
        } else {
          sound.error();
          this.quizMistakes += 1;
        }
        this.renderQuizModal();
      });
    });

    const retryBtn = this.modalOverlay.querySelector('#quiz-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        sound.click();
        this.quizAnswered = false;
        this.quizSelectedOption = null;
        this.renderQuizModal();
      });
    }

    const nextBtn = this.modalOverlay.querySelector('#quiz-continue-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        sound.click();
        if (this.quizIndex < ch.quiz.length - 1) {
          this.quizIndex += 1;
          this.quizAnswered = false;
          this.quizSelectedOption = null;
          this.renderQuizModal();
        } else {
          this.activeModal = 'summary';
          this.renderSummaryModal(ch.id);
        }
      });
    }
  }

  private renderSummaryModal(completedChapterId: number) {
    this.modalOverlay.style.display = 'flex';
    const ch = CHAPTERS.find((c) => c.id === completedChapterId) || CHAPTERS[0];
    const perfect = this.quizMistakes === 0;

    this.modalOverlay.innerHTML = `
      <div class="roman-modal summary-modal">
        <div class="summary-crest">🏛️ KAPITEL ${ch.id} MEISTERHAFT ABGESCHLOSSEN!</div>
        <h2>${cleanTitle(ch.title)} (${ch.year})</h2>
        <div class="summary-merksatz-box">
          <div class="merksatz-label">📌 HISTORISCHER MERKSATZ (HEFTEINTRAG):</div>
          <p>${ch.summary}</p>
        </div>
        <div class="summary-unlock-banner">
          🔓 ${ch.unlocksText}
        </div>
        <div class="modal-footer-right">
          <button id="summary-next-chapter-btn" class="primary-gold-btn">
            ${
              completedChapterId < 12
                ? `⚔️ Weiter zu Kapitel ${completedChapterId + 1}`
                : '📜 Abschluss-Urkunde ansehen [U]'
            }
          </button>
        </div>
      </div>
    `;

    const btn = this.modalOverlay.querySelector('#summary-next-chapter-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        sound.success();
        const wasLast = completedChapterId >= 12;
        gameState.completeChapter(perfect);
        sound.startBGM(gameState.chapter);
        const world = this.scene.get('World') as WorldScene;
        if (world) world.onChapterChanged();
        if (wasLast) {
          this.toggleModal('certificate');
        } else {
          this.openChapterIntroDialog();
        }
      });
    }
  }

  // =========================================================================
  // ARCHAEOLOGICAL RELIC DISCOVERY MODAL (5 Relics + Cultural Quiz)
  // =========================================================================
  public openRelicModal(relic: RomanRelic) {
    this.activeModal = 'relic';
    this.modalOverlay.style.display = 'flex';

    let answered = false;
    let selectedIdx: number | null = null;

    const renderRelic = () => {
      const isCorrect = selectedIdx === relic.correctIndex;
      this.modalOverlay.innerHTML = `
        <div class="roman-modal relic-modal">
          <div class="modal-top-bar">
            <div>
              <span class="chapter-pill">🏺 ARCHÄOLOGISCHER FUND • ${relic.epoch} (${relic.year})</span>
              <h2>${relic.name}</h2>
            </div>
            <button class="close-x-btn" id="relic-close-btn">✕</button>
          </div>

          <div class="relic-showcase">
            <img src="${relic.icon}" class="relic-large-icon" alt="${relic.name}" />
            <div class="relic-meta">
              <div><strong>Fundort:</strong> ${relic.findLocation}</div>
              <p class="relic-context">${relic.historicalContext}</p>
              <div class="relic-sig"><strong>Historische Bedeutung:</strong> ${relic.significance}</div>
            </div>
          </div>

          <div class="relic-quiz-section">
            <h3>🔍 Archäologie-Frage zur Bergung des Relikts:</h3>
            <p class="quiz-question-text">${relic.question}</p>
            <div class="quiz-options-list">
              ${relic.options
                .map((opt, idx) => {
                  let cls = 'quiz-option-btn';
                  if (answered) {
                    if (idx === relic.correctIndex) cls += ' correct';
                    else if (idx === selectedIdx) cls += ' wrong';
                  }
                  return `
                    <button class="${cls}" data-ridx="${idx}" ${answered && isCorrect ? 'disabled' : ''}>
                      <span class="opt-letter">${['A', 'B', 'C'][idx]}</span>
                      <span class="opt-text">${opt}</span>
                    </button>
                  `;
                })
                .join('')}
            </div>
            ${
              answered
                ? isCorrect
                  ? `
                  <div class="quiz-explanation-box exp-ok">
                    <strong>🎉 Relikt erfolgreich geborgen!</strong> Du erhältst das Relikt für deine S-Rang-Urkunde sowie +1 Golderz & +1 Carrara-Marmor!
                  </div>
                  <div class="modal-footer-right">
                    <button id="relic-claim-btn" class="primary-gold-btn">🏺 Relikt in Sammlung aufnehmen</button>
                  </div>
                `
                  : `
                  <div class="quiz-explanation-box exp-err">
                    <strong>Nicht ganz richtig!</strong> Lies den historischen Kontext oben noch einmal genau durch und klicke auf die richtige Antwort.
                  </div>
                `
                : ''
            }
          </div>
        </div>
      `;

      this.modalOverlay.querySelector('#relic-close-btn')?.addEventListener('click', () => {
        sound.click();
        this.closeModal();
      });

      this.modalOverlay.querySelectorAll('[data-ridx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-ridx') || '0', 10);
          selectedIdx = idx;
          answered = true;
          if (idx === relic.correctIndex) {
            sound.success();
          } else {
            sound.error();
          }
          renderRelic();
        });
      });

      this.modalOverlay.querySelector('#relic-claim-btn')?.addEventListener('click', () => {
        sound.craft();
        gameState.discoverRelic(relic.id);
        gameState.addItem('silber_denar', 1);
        gameState.addItem('marmor', 1);
        const world = this.scene.get('World') as WorldScene;
        if (world) world.rebuildChapterEntities();
        this.closeModal();
        this.showToast(`🏺 Relikt geborgen: ${relic.name} (${gameState.discoveredRelics.size}/5)!`);
      });
    };

    renderRelic();
  }

  // =========================================================================
  // MODAL ROUTER FOR [I], [C], [B], [H], [L], [Z], [U], [P]
  // =========================================================================
  private renderActiveModal() {
    switch (this.activeModal) {
      case 'dialog':
        this.renderDialogModal();
        break;
      case 'quiz':
        this.renderQuizModal();
        break;
      case 'inventory':
        this.renderInventoryModal();
        break;
      case 'craft':
        this.renderCraftModal();
        break;
      case 'build':
        this.renderBuildModal();
        break;
      case 'trade':
        this.renderTradeModal();
        break;
      case 'lexicon':
        this.renderLexiconModal();
        break;
      case 'epochs':
        this.renderEpochsModal();
        break;
      case 'certificate':
        this.renderCertificateModal();
        break;
      case 'pause':
        this.renderPauseModal();
        break;
      default:
        break;
    }
    this.renderHUD();
  }

  // 1. INVENTORY & RELICS MODAL [I]
  private renderInventoryModal() {
    this.modalOverlay.style.display = 'flex';
    const ownedEntries = Object.entries(gameState.inventory).filter(
      ([, qty]) => (qty || 0) > 0
    );

    this.modalOverlay.innerHTML = `
      <div class="roman-modal wide-modal">
        <div class="modal-top-bar">
          <h2>🎒 Römischer Marschbeutel & Archäologische Relikte [I]</h2>
          <button class="close-x-btn" id="modal-close-btn">✕</button>
        </div>

        <h3 class="section-heading">Gesammelte Rohstoffe, Werkzeuge & Schriftrollen (${ownedEntries.length})</h3>
        ${
          ownedEntries.length === 0
            ? `<div class="empty-state-box">Dein Beutel ist noch leer. Laufe zu Rohstoff-Fundorten auf der Karte und drücke <strong>[E]</strong>!</div>`
            : `<div class="inventory-grid">
                ${ownedEntries
                  .map(([id, qty]) => {
                    const def = ITEMS[id as RomanItemId];
                    if (!def) return '';
                    return `
                      <div class="inv-card">
                        <img src="${def.icon}" class="inv-icon" alt="${def.name}" />
                        <div class="inv-info">
                          <div class="inv-name">${def.name} <span class="inv-qty">×${qty}</span></div>
                          <div class="inv-desc">${def.description}</div>
                          <div class="inv-hist">📜 ${def.historicalNote}</div>
                        </div>
                      </div>
                    `;
                  })
                  .join('')}
              </div>`
        }

        <h3 class="section-heading" style="margin-top:14px;">🏺 Archäologische Relikte des Alten Rom (${gameState.discoveredRelics.size} / 5)</h3>
        <div class="relics-grid">
          ${ROMAN_RELICS.map((r) => {
            const found = gameState.hasRelic(r.id);
            return `
              <div class="relic-status-card ${found ? 'found' : 'locked'}">
                <img src="${r.icon}" class="relic-mini-img" alt="${r.name}" />
                <div>
                  <div class="relic-card-title">${found ? r.name : `🔒 Unentdecktes Relikt (ab Kap. ${r.minChapter})`}</div>
                  <div class="relic-card-sub">${found ? `${r.year} • ${r.significance}` : `Hinweis: Suche nahe „${r.findLocation}"`}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.modalOverlay
      .querySelector('#modal-close-btn')
      ?.addEventListener('click', () => this.closeModal());
  }

  // 2. CRAFTING MODAL [C]
  private renderCraftModal() {
    this.modalOverlay.style.display = 'flex';
    const filtered = RECIPES.filter((r) => {
      if (this.craftCategoryFilter !== 'all' && r.category !== this.craftCategoryFilter)
        return false;
      return true;
    });

    this.modalOverlay.innerHTML = `
      <div class="roman-modal wide-modal">
        <div class="modal-top-bar">
          <h2>⚒️ Römische Werkstätten & Handwerk [C]</h2>
          <button class="close-x-btn" id="modal-close-btn">✕</button>
        </div>

        <div class="filter-tabs">
          <button class="tab-btn ${this.craftCategoryFilter === 'all' ? 'active' : ''}" data-cat="all">Alle Rezepte (${RECIPES.length})</button>
          <button class="tab-btn ${this.craftCategoryFilter === 'economy' ? 'active' : ''}" data-cat="economy">🌾 Wirtschaft & Werkzeuge</button>
          <button class="tab-btn ${this.craftCategoryFilter === 'republic' ? 'active' : ''}" data-cat="republic">🦅 Republik & Militär</button>
          <button class="tab-btn ${this.craftCategoryFilter === 'empire' ? 'active' : ''}" data-cat="empire">👑 Kaiserzeit & Glaube</button>
        </div>

        <div class="recipes-grid">
          ${filtered
            .map((r) => {
              const outItem = ITEMS[r.output];
              const unlocked = r.minChapter <= gameState.chapter;
              const craftable = gameState.canCraft(r.id);
              const alreadyDone = gameState.craftedOnce.has(r.output);

              const inputsHtml = Object.entries(r.inputs)
                .map(([inId, need]) => {
                  const have = gameState.getItemCount(inId as RomanItemId);
                  const inDef = ITEMS[inId as RomanItemId];
                  const ok = have >= (need || 0);
                  return `<span class="ing-pill ${ok ? 'ok' : 'missing'}"><img src="${inDef.icon}" alt="" /> ${inDef.name}: ${have}/${need}</span>`;
                })
                .join('');

              return `
                <div class="recipe-card ${!unlocked ? 'locked' : ''} ${craftable ? 'can-craft' : ''}">
                  <div class="recipe-head">
                    <img src="${outItem.icon}" class="recipe-icon" alt="${outItem.name}" />
                    <div>
                      <div class="recipe-title">
                        ${outItem.name} ${r.outputCount > 1 ? `×${r.outputCount}` : ''}
                        ${alreadyDone ? '<span class="crafted-badge">✓ Gefertigt</span>' : ''}
                      </div>
                      <div class="recipe-epoch">Freigeschaltet ab Kapitel ${r.minChapter}</div>
                    </div>
                  </div>
                  <p class="recipe-desc">${outItem.historicalNote}</p>
                  <div class="recipe-inputs">${inputsHtml}</div>
                  <button class="craft-action-btn" data-recipe="${r.id}" ${!craftable ? 'disabled' : ''}>
                    ${
                      !unlocked
                        ? `🔒 Ab Kapitel ${r.minChapter}`
                        : craftable
                        ? '⚒️ Jetzt herstellen'
                        : 'Rohstoffe fehlen'
                    }
                  </button>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `;

    this.modalOverlay
      .querySelector('#modal-close-btn')
      ?.addEventListener('click', () => this.closeModal());

    this.modalOverlay.querySelectorAll('[data-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.click();
        this.craftCategoryFilter = btn.getAttribute('data-cat') as
          | 'all'
          | 'economy'
          | 'republic'
          | 'empire';
        this.renderCraftModal();
      });
    });

    this.modalOverlay.querySelectorAll('[data-recipe]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rId = btn.getAttribute('data-recipe')!;
        if (gameState.craft(rId)) {
          sound.craft();
          const r = RECIPES.find((x) => x.id === rId)!;
          this.showToast(`⚒️ Hergestellt: ${ITEMS[r.output].name}!`);
          this.renderCraftModal();
        } else {
          sound.error();
        }
      });
    });
  }

  // 3. BUILDINGS MODAL [B]
  private renderBuildModal() {
    this.modalOverlay.style.display = 'flex';

    this.modalOverlay.innerHTML = `
      <div class="roman-modal wide-modal">
        <div class="modal-top-bar">
          <h2>🏛️ Römischer Städtebau & Monumente [B]</h2>
          <button class="close-x-btn" id="modal-close-btn">✕</button>
        </div>

        <div class="buildings-grid">
          ${BUILDINGS.map((b) => {
            const built = gameState.isBuilt(b.id);
            const unlocked = b.minChapter <= gameState.chapter;
            const canBuild = gameState.canBuild(b.id);

            const costHtml = Object.entries(b.cost)
              .map(([inId, need]) => {
                const have = gameState.getItemCount(inId as RomanItemId);
                const inDef = ITEMS[inId as RomanItemId];
                const ok = have >= (need || 0);
                return `<span class="ing-pill ${ok ? 'ok' : 'missing'}"><img src="${inDef.icon}" alt="" /> ${inDef.name}: ${have}/${need}</span>`;
              })
              .join('');

            return `
              <div class="building-card ${built ? 'built' : ''} ${!unlocked ? 'locked' : ''}">
                <div class="building-header">
                  <div>
                    <div class="building-title">${b.name}</div>
                    <div class="building-sub">Ab Kapitel ${b.minChapter}</div>
                  </div>
                  <span class="building-status-badge ${built ? 'done' : ''}">
                    ${built ? '🏛️ Errichtet' : unlocked ? '📐 Bauplan bereit' : `🔒 Kap. ${b.minChapter}`}
                  </span>
                </div>
                <p class="building-desc">${b.description}</p>
                <div class="building-hist">📜 ${b.historicalNote}</div>
                <div class="recipe-inputs">${costHtml}</div>
                <button class="craft-action-btn" data-build="${b.id}" ${!canBuild || built ? 'disabled' : ''}>
                  ${
                    built
                      ? '✅ Bereits in Rom errichtet'
                      : !unlocked
                      ? `🔒 Freigeschaltet in Kapitel ${b.minChapter}`
                      : canBuild
                      ? '🏛️ Bauwerk jetzt errichten!'
                      : 'Baumaterial fehlt'
                  }
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.modalOverlay
      .querySelector('#modal-close-btn')
      ?.addEventListener('click', () => this.closeModal());

    this.modalOverlay.querySelectorAll('[data-build]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const bId = btn.getAttribute('data-build')!;
        if (gameState.build(bId)) {
          sound.build();
          const b = BUILDINGS.find((x) => x.id === bId)!;
          const world = this.scene.get('World') as WorldScene;
          if (world) world.rebuildChapterEntities();
          this.showToast(`🏛️ Monument errichtet: ${b.name}!`);
          this.renderBuildModal();
        } else {
          sound.error();
        }
      });
    });
  }

  // 4. MARITIME TRADE MODAL AT OSTIA [H]
  private renderTradeModal() {
    this.modalOverlay.style.display = 'flex';

    this.modalOverlay.innerHTML = `
      <div class="roman-modal wide-modal">
        <div class="modal-top-bar">
          <h2>⛵ Seehandel im Hafen von Ostia (Mare Nostrum) [H]</h2>
          <button class="close-x-btn" id="modal-close-btn">✕</button>
        </div>
        <p class="modal-intro-p">
          Im Tiefwasserhafen von Ostia an der Tibermündung legen Handelsschiffe aus Ägypten, Phönizien, Hispanien und über die Seidenstraße an. Tausche italische Erzeugnisse gegen seltene Güter!
        </p>

        <div class="trades-grid">
          ${TRADES.map((t) => {
            const giveDef = ITEMS[t.giveItem];
            const recDef = ITEMS[t.receiveItem];
            const have = gameState.getItemCount(t.giveItem);
            const can = gameState.canTrade(t.id);

            return `
              <div class="trade-card ${can ? 'can-craft' : ''}">
                <div class="trade-merchant">⚓ ${t.merchant}</div>
                <p class="trade-desc">${t.description}</p>
                <div class="trade-exchange-row">
                  <div class="trade-side">
                    <img src="${giveDef.icon}" alt="" />
                    <span>Gib: <strong>${t.giveCount}× ${giveDef.name}</strong> (Besitz: ${have})</span>
                  </div>
                  <span class="trade-arrow">➔</span>
                  <div class="trade-side">
                    <img src="${recDef.icon}" alt="" />
                    <span>Erhalte: <strong>${t.receiveCount}× ${recDef.name}</strong></span>
                  </div>
                </div>
                <button class="craft-action-btn" data-trade="${t.id}" ${!can ? 'disabled' : ''}>
                  ${can ? '⛵ Handel abschließen' : `Benötigt ${t.giveCount}× ${giveDef.name}`}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.modalOverlay
      .querySelector('#modal-close-btn')
      ?.addEventListener('click', () => this.closeModal());

    this.modalOverlay.querySelectorAll('[data-trade]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tId = btn.getAttribute('data-trade')!;
        if (gameState.executeTrade(tId)) {
          sound.craft();
          const t = TRADES.find((x) => x.id === tId)!;
          this.showToast(`⛵ Gehandelt: +${t.receiveCount} ${ITEMS[t.receiveItem].name}!`);
          this.renderTradeModal();
        } else {
          sound.error();
        }
      });
    });
  }

  // 5. ENCYCLOPEDIA / LEXICON MODAL (27 Entries) [L]
  private renderLexiconModal() {
    this.modalOverlay.style.display = 'flex';
    const categories = ['Alle', ...Array.from(new Set(LEXICON.map((x) => x.category)))];

    const filtered = LEXICON.filter((entry) => {
      if (this.lexiconCategory !== 'Alle' && entry.category !== this.lexiconCategory)
        return false;
      if (this.lexiconSearch.trim().length > 0) {
        const q = this.lexiconSearch.toLowerCase();
        return (
          entry.term.toLowerCase().includes(q) ||
          entry.definition.toLowerCase().includes(q) ||
          entry.category.toLowerCase().includes(q)
        );
      }
      return true;
    });

    this.modalOverlay.innerHTML = `
      <div class="roman-modal wide-modal">
        <div class="modal-top-bar">
          <h2>📖 Lexikon des Alten Rom (${LEXICON.length} Fachbegriffe) [L]</h2>
          <button class="close-x-btn" id="modal-close-btn">✕</button>
        </div>

        <div class="lexicon-controls">
          <input id="lexicon-search-input" type="text" placeholder="Begriff suchen (z. B. Senat, Konsul, Rubikon, Limes, Katakomben)..." value="${this.lexiconSearch}" />
          <div class="filter-tabs">
            ${categories
              .map(
                (cat) => `
              <button class="tab-btn ${this.lexiconCategory === cat ? 'active' : ''}" data-lexcat="${cat}">${cat}</button>
            `
              )
              .join('')}
          </div>
        </div>

        <div class="lexicon-list">
          ${filtered
            .map(
              (entry) => `
            <div class="lexicon-card">
              <div class="lexicon-card-head">
                <span class="lexicon-term">${entry.term}</span>
                <span class="lexicon-cat-badge">${entry.category}</span>
              </div>
              <p class="lexicon-def">${entry.definition}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    this.modalOverlay
      .querySelector('#modal-close-btn')
      ?.addEventListener('click', () => this.closeModal());

    const searchInput = this.modalOverlay.querySelector(
      '#lexicon-search-input'
    ) as HTMLInputElement | null;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.lexiconSearch = searchInput.value;
        this.renderLexiconModal();
        const el = this.modalOverlay.querySelector(
          '#lexicon-search-input'
        ) as HTMLInputElement | null;
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      });
    }

    this.modalOverlay.querySelectorAll('[data-lexcat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.click();
        this.lexiconCategory = btn.getAttribute('data-lexcat') || 'Alle';
        this.renderLexiconModal();
      });
    });
  }

  // 6. EPOCH & PHASE COMPARISON MODAL (5 Dimensions across Roman History) [Z]
  private renderEpochsModal() {
    this.modalOverlay.style.display = 'flex';

    this.modalOverlay.innerHTML = `
      <div class="roman-modal wide-modal">
        <div class="modal-top-bar">
          <h2>⏳ Historischer Struktur- & Phasenvergleich des Alten Rom [Z]</h2>
          <button class="close-x-btn" id="modal-close-btn">✕</button>
        </div>
        <p class="modal-intro-p">
          Wie wandelte sich Rom in über 1.200 Jahren vom kleinen Hirtendorf am Tiber zur Republik und schließlich zum christlichen Kaiserreich der Spätantike?
        </p>

        <div class="epoch-table-wrapper">
          <table class="epoch-comparison-table">
            <thead>
              <tr>
                <th>Vergleichs-Dimension</th>
                <th>🐺 Königszeit & Frühe Republik<br/><small>(753 – 264 v. Chr. • Kap. 1–3)</small></th>
                <th>🦅 Späte Republik & Weltmacht<br/><small>(264 – 27 v. Chr. • Kap. 4–7)</small></th>
                <th>👑 Kaiserzeit & Spätantike<br/><small>(27 v. Chr. – 476 n. Chr. • Kap. 8–12)</small></th>
              </tr>
            </thead>
            <tbody>
              ${EPOCH_COMPARISON.map(
                (row) => `
                <tr>
                  <td class="epoch-dim-cell"><strong>${row.dimension}</strong></td>
                  <td>${row.earlyPeriod}</td>
                  <td>${row.middlePeriod}</td>
                  <td>${row.latePeriod}</td>
                </tr>
              `
              ).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.modalOverlay
      .querySelector('#modal-close-btn')
      ?.addEventListener('click', () => this.closeModal());
  }

  // 7. PRINTABLE A4 CERTIFICATE MODAL [U]
  private renderCertificateModal() {
    this.modalOverlay.style.display = 'flex';
    const rankInfo = gameState.getCertificateRank();
    const roleDef = gameState.getRoleDef();
    const minutes = Math.max(1, Math.round(gameState.playTimeSeconds / 60));
    const dateStr = new Date().toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    this.modalOverlay.innerHTML = `
      <div class="roman-modal wide-modal certificate-modal-wrapper">
        <div class="modal-top-bar no-print">
          <h2>📜 Offizielle Römische Ehren-Urkunde (A4-Druckansicht) [U]</h2>
          <div class="cert-actions">
            <button id="cert-print-btn" class="primary-gold-btn">🖨️ Urkunde als PDF / A4 drucken</button>
            <button class="close-x-btn" id="modal-close-btn">✕</button>
          </div>
        </div>

        <div class="certificate-sheet" id="printable-certificate">
          <div class="cert-border-inner">
            <div class="cert-spqr-header">SENATUS POPULUSQUE ROMANUS • HISTORIA ROMANA</div>
            <h1 class="cert-main-title">EHREN-URKUNDE DES ALTEN ROM</h1>
            <div class="cert-subtitle">Historisches Lernabenteuer von 753 v. Chr. bis 476 n. Chr.</div>

            <div class="cert-recipient-block">
              <div>Verliehen an den römischen Chronisten:</div>
              <div class="cert-student-name">${gameState.playerName}</div>
              <div class="cert-role-line">Laufbahn: <strong>${roleDef.name} (${roleDef.latinTitle})</strong></div>
            </div>

            <div class="cert-rank-banner" style="border-color:${rankInfo.color};">
              <div class="cert-rank-grade" style="color:${rankInfo.color};">${rankInfo.rank}</div>
              <div class="cert-rank-title">${rankInfo.title}</div>
            </div>

            <div class="cert-stats-grid">
              <div class="cert-stat-box">
                <div class="cert-stat-val">${gameState.completedChapters.size} / 12</div>
                <div class="cert-stat-lbl">Kapitel gemeistert</div>
              </div>
              <div class="cert-stat-box">
                <div class="cert-stat-val">${gameState.discoveredRelics.size} / 5</div>
                <div class="cert-stat-lbl">Archäologische Relikte</div>
              </div>
              <div class="cert-stat-box">
                <div class="cert-stat-val">${gameState.builtBuildings.size} / 7</div>
                <div class="cert-stat-lbl">Monumente errichtet</div>
              </div>
              <div class="cert-stat-box">
                <div class="cert-stat-val">${minutes} Min.</div>
                <div class="cert-stat-lbl">Forschungszeit</div>
              </div>
            </div>

            <div class="cert-chapters-summary">
              <strong>Erforschte Epochen Roms (753 v. Chr. – 476 n. Chr.):</strong>
              <div class="cert-chapter-badges">
                ${CHAPTERS.map((c) => {
                  const done = gameState.completedChapters.has(c.id);
                  return `<span class="cert-ch-pill ${done ? 'done' : ''}">${done ? '✓' : '○'} Kap. ${c.id}: ${cleanTitle(c.title)} (${c.year})</span>`;
                }).join('')}
              </div>
            </div>

            <div class="cert-footer-row">
              <div>Datum: <strong>${dateStr}</strong></div>
              <div>Klassen-Prüfcode: <strong>${gameState.exportShortcode()}</strong></div>
              <div>Siegel des Senats: <strong>S.P.Q.R.</strong></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.modalOverlay
      .querySelector('#modal-close-btn')
      ?.addEventListener('click', () => this.closeModal());

    this.modalOverlay
      .querySelector('#cert-print-btn')
      ?.addEventListener('click', () => {
        window.print();
      });
  }

  // 8. STANDARDIZED 7-TILE PAUSE DASHBOARD [P]
  private renderPauseModal() {
    this.modalOverlay.style.display = 'flex';
    const shortcode = gameState.exportShortcode();

    this.modalOverlay.innerHTML = `
      <div class="roman-modal wide-modal">
        <div class="modal-top-bar">
          <h2>⚙️ Pause-Dashboard & Klassenraum-Verwaltung [P]</h2>
          <button class="close-x-btn" id="modal-close-btn">✕</button>
        </div>

        <div class="pause-dashboard-grid">
          <!-- Kachel 1: Spielstand-Kurzcode -->
          <div class="pause-tile">
            <h3>1. 🔑 Schul-Kurzcode (Export / Import)</h3>
            <p>Notiere diesen Code im Heft oder gib einen Code ein, um an jedem Schulgerät weiterzuspielen:</p>
            <div class="shortcode-display">${shortcode}</div>
            <div class="shortcode-input-row">
              <input id="import-code-input" type="text" placeholder="ROM-K08-LM-0FF-1F" />
              <button id="import-code-btn" class="secondary-roman-btn">Laden</button>
            </div>
          </div>

          <!-- Kachel 2: Kapitel-Schnellwahl (1–12) -->
          <div class="pause-tile">
            <h3>2. 🗺️ Kapitel-Schnellwahl (753 v. Chr. – 476 n. Chr.)</h3>
            <p>Springe für den Unterricht direkt in eines der 12 historischen Kapitel:</p>
            <div class="pause-chapter-grid">
              ${CHAPTERS.map(
                (c) => `
                <button class="pause-ch-btn ${c.id === gameState.chapter ? 'active' : ''}" data-jumpch="${c.id}">
                  <strong>K${c.id}</strong> (${c.year})
                </button>
              `
              ).join('')}
            </div>
          </div>

          <!-- Kachel 3: Audio & Synthesizer -->
          <div class="pause-tile">
            <h3>3. 🔊 Ton & 16-Bit Musik</h3>
            <p>Steuere die Hintergrundmusik und die Soundeffekte für das Klassenzimmer:</p>
            <div class="pause-btn-col">
              <button id="toggle-bgm-btn" class="secondary-roman-btn">
                ${sound.bgmMuted ? '🔇 Musik: AUS (Klicken zum Einschalten)' : '🎵 Musik: AN (Klicken zum Stummschalten)'}
              </button>
              <button id="toggle-sfx-btn" class="secondary-roman-btn">
                ${sound.muted ? '🔕 Soundeffekte: AUS' : '🔔 Soundeffekte: AN'}
              </button>
            </div>
          </div>

          <!-- Kachel 4: Charakter & Laufbahn anpassen -->
          <div class="pause-tile">
            <h3>4. 🛡️ Charakter & Laufbahn wechseln</h3>
            <p>Aktuell: <strong>${gameState.playerName}</strong> (${gameState.getRoleDef().name})</p>
            <div class="pause-btn-col">
              <button id="switch-gender-btn" class="secondary-roman-btn">
                👤 Figur wechseln (${gameState.gender === 'male' ? 'Titus ➔ Cornelia' : 'Cornelia ➔ Titus'})
              </button>
              <button id="cycle-role-btn" class="secondary-roman-btn">
                ⭐ Rolle wechseln (${gameState.getRoleDef().name})
              </button>
            </div>
          </div>

          <!-- Kachel 5: Steuerungs-Übersicht -->
          <div class="pause-tile">
            <h3>5. 🎮 Steuerung (Tastatur & Touch)</h3>
            <ul class="controls-list">
              <li><strong>WASD / Pfeiltasten / Joystick:</strong> Bewegen</li>
              <li><strong>[E]</strong> Interagieren, Sammeln, Sprechen & Katakomben</li>
              <li><strong>[C]</strong> Handwerk • <strong>[B]</strong> Bauen • <strong>[I]</strong> Beutel</li>
              <li><strong>[L]</strong> Lexikon (27) • <strong>[Z]</strong> Epochen • <strong>[U]</strong> Urkunde</li>
            </ul>
          </div>

          <!-- Kachel 6: Lernfortschritt & Bilanz -->
          <div class="pause-tile">
            <h3>6. 📊 Historische Lernbilanz</h3>
            <ul class="controls-list">
              <li>Abgeschlossene Kapitel: <strong>${gameState.completedChapters.size} / 12</strong></li>
              <li>Archäologische Relikte: <strong>${gameState.discoveredRelics.size} / 5</strong></li>
              <li>Errichtete Monumente: <strong>${gameState.builtBuildings.size} / 7</strong></li>
              <li>Aktueller Rang: <strong>${gameState.getCertificateRank().rank}</strong></li>
            </ul>
          </div>

          <!-- Kachel 7: Spielstand zurücksetzen -->
          <div class="pause-tile">
            <h3>7. 🔄 Neues Spiel starten</h3>
            <p>Setzt den gesamten Fortschritt auf Kapitel 1 (753 v. Chr.) zurück:</p>
            <button id="reset-game-btn" class="danger-roman-btn">⚠️ Spielstand komplett zurücksetzen</button>
          </div>
        </div>
      </div>
    `;

    this.modalOverlay
      .querySelector('#modal-close-btn')
      ?.addEventListener('click', () => this.closeModal());

    this.modalOverlay.querySelector('#import-code-btn')?.addEventListener('click', () => {
      const inp = this.modalOverlay.querySelector('#import-code-input') as HTMLInputElement | null;
      if (inp && gameState.importShortcode(inp.value)) {
        sound.success();
        const world = this.scene.get('World') as WorldScene;
        if (world) {
          world.refreshCharacterAppearance();
          world.onChapterChanged();
        }
        this.showToast('✅ Kurzcode erfolgreich geladen!');
        this.renderPauseModal();
      } else {
        sound.error();
        this.showToast('❌ Ungültiger Kurzcode (Format: ROM-K08-LM-0FF-1F)');
      }
    });

    this.modalOverlay.querySelectorAll('[data-jumpch]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ch = parseInt(btn.getAttribute('data-jumpch') || '1', 10);
        sound.click();
        gameState.setChapter(ch);
        sound.startBGM(ch);
        const world = this.scene.get('World') as WorldScene;
        if (world) world.onChapterChanged();
        this.openChapterIntroDialog();
      });
    });

    this.modalOverlay.querySelector('#toggle-bgm-btn')?.addEventListener('click', () => {
      sound.toggleBGM();
      this.renderPauseModal();
    });

    this.modalOverlay.querySelector('#toggle-sfx-btn')?.addEventListener('click', () => {
      sound.muted = !sound.muted;
      this.renderPauseModal();
    });

    this.modalOverlay.querySelector('#switch-gender-btn')?.addEventListener('click', () => {
      sound.click();
      const nextG: PlayerGender = gameState.gender === 'male' ? 'female' : 'male';
      const nextName =
        gameState.playerName === 'Titus Valerius' || gameState.playerName === 'Cornelia Valeria'
          ? nextG === 'female'
            ? 'Cornelia Valeria'
            : 'Titus Valerius'
          : gameState.playerName;
      gameState.setProfile(nextG, gameState.role, nextName);
      const world = this.scene.get('World') as WorldScene;
      if (world) world.refreshCharacterAppearance();
      this.renderPauseModal();
    });

    this.modalOverlay.querySelector('#cycle-role-btn')?.addEventListener('click', () => {
      sound.click();
      const order: PlayerRole[] = ['legionary', 'senator', 'architect'];
      const nextRole = order[(order.indexOf(gameState.role) + 1) % order.length];
      gameState.setProfile(gameState.gender, nextRole, gameState.playerName);
      this.renderPauseModal();
    });

    this.modalOverlay.querySelector('#reset-game-btn')?.addEventListener('click', () => {
      sound.error();
      gameState.resetGame();
      const world = this.scene.get('World') as WorldScene;
      if (world) world.onChapterChanged();
      this.openStartScreen();
    });
  }
}
