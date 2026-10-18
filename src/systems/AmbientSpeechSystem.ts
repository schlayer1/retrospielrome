/**
 * AmbientSpeechSystem - Schwebende Einzeiler-Sprechblasen im Forum Romanum
 * Erscheinen beim Vorbeigehen an Bürgern (< 65px) ohne das Spiel zu stoppen.
 */

export interface CitizenSpeaker {
  id: string;
  name: string;
  x: number; // In Welt-Pixeln
  y: number;
  quotes: Record<number, string[]>; // Kapitel -> Sprüche
  lastSpokenTime?: number;
}

export class AmbientSpeechSystem {
  private container: HTMLDivElement | null = null;
  private currentBubbleEl: HTMLDivElement | null = null;
  private activeCitizenId: string | null = null;
  private bubbleTimeout: number | null = null;
  private citizens: CitizenSpeaker[] = [];

  constructor() {
    this.initDOM();
    this.initHistoricalSpeakers();
  }

  private initDOM() {
    if (typeof document === 'undefined') return;
    let layer = document.getElementById('ambient-speech-layer') as HTMLDivElement | null;
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'ambient-speech-layer';
      layer.style.position = 'fixed';
      layer.style.inset = '0';
      layer.style.pointerEvents = 'none';
      layer.style.zIndex = '5';
      document.body.appendChild(layer);
    }
    this.container = layer;
  }

  private initHistoricalSpeakers() {
    this.citizens = [
      {
        id: 'speaker_forum_trader',
        name: 'Marcus der Händler',
        x: 48 * 16,
        y: 36 * 16,
        quotes: {
          1: ['Frisches Emmer-Getreide aus den Tälern!', 'Salve Bürger! Opfere am Vesta-Herd!'],
          2: ['Der Tyrann ist vertrieben! Frei handeln in der Republik!', 'Kein König herrscht mehr über unsere Preise!'],
          3: ['Zwölftafeln sichern auch uns Händlern Recht und Gesetz!', 'Pflügt das Land und ehrt die Republik!'],
          4: ['Hannibal bedroht die Handelswege – doch Ostia hält stand!', 'Getreide aus Sizilien ist eingetroffen!'],
          5: ['Brotpreise steigen! Gracchus fordert gerechte Landreform!', 'Die Latifundien der Senatoren ruinieren uns Bauern!'],
          6: ['Spartacus hat Capua erschüttert! Sklaven verlangen Würde!', 'Die Straßen nach Neapel sind unruhig...'],
          7: ['Caesar hat den Rubikon überschritten! Der Würfel ist gefallen!', 'Triumphzug auf der Via Sacra!'],
          8: ['Augustus lässt Rom aus weißem Carrara-Marmor erstrahlen!', 'Pax Romana – sichere Schifffahrt im ganzen Mittelmeer!'],
          9: ['Rauchgeruch hängt über den Insulae... Nero sucht Sündenböcke!', 'Die Getreidespeicher am Tiber werden streng bewacht.'],
          10: ['Waren aus 40 Provinzen auf dem Forum Trajans!', '80.000 Kilometer Reichsstraßen verbinden die Welt!'],
          11: ['Konstantins Basilika wird das größte Bauwerk der Stadt!', 'Das Zeichen Chi-Rho prangt auf den Legionärsschilden.'],
          12: ['Romulus Augustulus ist abgesetzt... Die Zeiten wandeln sich.', 'Die Schriften der Vorfahren werden in die Klöster gebracht.'],
        },
      },
      {
        id: 'speaker_curia_senator',
        name: 'Senator Quintus',
        x: 53 * 16,
        y: 33 * 16,
        quotes: {
          1: ['Die Götter schützen den Palatin-Hügel!', 'Romulus hat die Stadt nach heiligem Ritus geweiht.'],
          2: ['S.P.Q.R. – Senatus Populusque Romanus! Die Republik lebt!', 'Zwei Konsuln wachen über das Wohl aller Bürger.'],
          3: ['Cincinnatus gab die Diktatur nach 16 Tagen zurück – wahre Bürgertugend!', 'Mos Maiorum ist das Fundament Roms.'],
          4: ['Der Senat kapituliert niemals! Nicht vor Karthago, nicht vor Hannibal!', 'Scipio rüstet die Legionen in Afrika.'],
          5: ['Der Senat warnt vor Umsturz! Haltet die Ordnung der Väter ein!', 'Gefährliche Unruhe auf der Rostra...'],
          6: ['Ordnung und Disziplin sichern die Republik!', 'Die Legionen ziehen nach Süden gegen den Aufstand.'],
          7: ['Caesar steht vor Rom... Was wird aus dem Senat?', 'Die Gesetze müssen stärker sein als ein einzelner Mann!'],
          8: ['Augustus ist der Princeps – der Erste unter Gleichen!', 'Der Altar des Friedens (Ara Pacis) ist vollendet.'],
          9: ['Kaiser Nero verschwendet Gold für seinen Goldenen Palast!', 'Die Mietskasernen der Plebejer brannten wie Zunder.'],
          10: ['Optimus Princeps Trajan ehrt die Traditionen des Senats!', 'Unser Imperium erstreckt sich von Ozean zu Ozean.'],
          11: ['Konstantin verlegt den Hof nach Osten... Konstantinopel wächst.', 'Die Kirche erhält kaiserlichen Schutz.'],
          12: ['Über tausend Jahre Geschichte... Doch Roms Geist wird niemals sterben!', 'Cassiodor rettet die Handschriften im Vivarium.'],
        },
      },
      {
        id: 'speaker_tiber_ferryman',
        name: 'Aulus der Fährmann',
        x: 20 * 16,
        y: 41 * 16,
        quotes: {
          1: ['Der Tiber trägt Holz und Schilf zu den Hügeln!', 'Achtet auf die Strömung an den Ufern!'],
          2: ['Die Pons Sublicius verbindet uns mit den Feldern Etruriens.', 'Freie Bürger überqueren den heiligen Fluss.'],
          3: ['Gute Ernte an den Sabiner Hängen!', 'Kühles Quellwasser für müde Wanderer.'],
          4: ['Kornschiffe aus Ostia segeln den Tiber hinauf!', 'Rom hungert nicht, solange der Fluss fließt.'],
          5: ['Rundbrot für das Volk wird an den Horrea verteilt.', 'Unruhige Zeiten in der Stadt...'],
          6: ['Gladiatoren wurden im Süden gesehen... Haltet Wache!', 'Der Fluss fließt ruhig weiter, trotz aller Stürme.'],
          7: ['Schwere Rüstungen auf der Flussbrücke!', 'Die Legionen sind im Anmarsch.'],
          8: ['Neue Aquädukte leiten reinstes Wasser über gewaltige Bögen!', 'Frisches Wasser sprudelt an jedem Platz.'],
          9: ['Öllampen flackern in der Nacht – die Menschen suchen Trost.', 'Die Boote brachten Wasser zum Löschen der Brände.'],
          10: ['Marmorblöcke aus Carrara werden am Kai entladen!', 'Aus aller Herren Länder strömen Kaufleute herbei.'],
          11: ['Pilger reisen nach Rom, um die Gräber der Apostel zu sehen.', 'Friede sei mit allen, die diesen Fluss kreuzen.'],
          12: ['Verlassene Schiffe am Ufer... Doch die Mühlen mahlen noch.', 'Was Rom erbaut hat, bleibt im Gedächtnis der Welt.'],
        },
      },
    ];
  }

  public update(
    playerX: number,
    playerY: number,
    chapter: number,
    cam: Phaser.Cameras.Scene2D.Camera,
    canvasRect: DOMRect,
    isSuppressed: boolean = false
  ): void {
    if (!this.container) return;

    if (isSuppressed) {
      if (this.currentBubbleEl) {
        this.dismissBubble(true);
      }
      return;
    }

    // Wenn aktuell eine Sprechblase aktiv ist: Position am Bildschirm nachführen
    if (this.currentBubbleEl && this.activeCitizenId) {
      const active = this.citizens.find((c) => c.id === this.activeCitizenId);
      if (active) {
        const sx = ((active.x - cam.worldView.x) / cam.worldView.width) * canvasRect.width + canvasRect.left;
        const sy = ((active.y - 28 - cam.worldView.y) / cam.worldView.height) * canvasRect.height + canvasRect.top;
        this.currentBubbleEl.style.left = `${Math.round(sx)}px`;
        this.currentBubbleEl.style.top = `${Math.round(sy)}px`;

        // Ausblenden wenn Spieler zu weit weggelaufen ist (> 95px)
        const dist = Math.hypot(playerX - active.x, playerY - active.y);
        if (dist > 95) {
          this.dismissBubble();
        }
      }
      return;
    }

    const now = Date.now();

    // Nach einem nahen Bürger (< 65px) suchen, der nicht vor kurzem gesprochen hat
    for (const citizen of this.citizens) {
      const dist = Math.hypot(playerX - citizen.x, playerY - citizen.y);
      if (dist < 65) {
        if (!citizen.lastSpokenTime || now - citizen.lastSpokenTime > 14000) {
          this.showSpeechBubble(citizen, chapter, cam, canvasRect);
          citizen.lastSpokenTime = now;
          break;
        }
      }
    }
  }

  private showSpeechBubble(
    citizen: CitizenSpeaker,
    chapter: number,
    cam: Phaser.Cameras.Scene2D.Camera,
    canvasRect: DOMRect
  ): void {
    if (!this.container) return;
    this.dismissBubble(true);

    const pool = citizen.quotes[chapter] || citizen.quotes[1] || ['Salve, Bürger Roms!'];
    const text = pool[Math.floor(Math.random() * pool.length)];

    const sx = ((citizen.x - cam.worldView.x) / cam.worldView.width) * canvasRect.width + canvasRect.left;
    const sy = ((citizen.y - 28 - cam.worldView.y) / cam.worldView.height) * canvasRect.height + canvasRect.top;

    const bubble = document.createElement('div');
    bubble.className = 'ambient-speech-bubble';
    bubble.innerHTML = `
      <div class="ambient-bubble-name">${citizen.name}</div>
      <div class="ambient-bubble-text">„${text}“</div>
    `;

    bubble.style.left = `${Math.round(sx)}px`;
    bubble.style.top = `${Math.round(sy)}px`;

    this.container.appendChild(bubble);
    this.currentBubbleEl = bubble;
    this.activeCitizenId = citizen.id;

    // Automatisches Verblassen nach 3.8 Sekunden
    this.bubbleTimeout = window.setTimeout(() => {
      this.dismissBubble();
    }, 3800);
  }

  public dismissBubble(immediate: boolean = false): void {
    if (this.bubbleTimeout) {
      clearTimeout(this.bubbleTimeout);
      this.bubbleTimeout = null;
    }
    if (this.currentBubbleEl) {
      const el = this.currentBubbleEl;
      this.currentBubbleEl = null;
      this.activeCitizenId = null;
      if (immediate) {
        el.remove();
      } else {
        el.classList.add('bubble-fade-out');
        setTimeout(() => el.remove(), 300);
      }
    }
  }
}
