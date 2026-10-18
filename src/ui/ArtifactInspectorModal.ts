/**
 * ArtifactInspectorModal - 16-Bit Nahinspektion historischer Artefakte
 * Ermöglicht Schülerinnen und Schülern die vergrößerte Betrachtung antiker Fundstücke
 * inklusive haptischem Wenden und 2 didaktischen Merksätzen.
 */

export interface InspectableArtifact {
  id: string;
  name: string;
  latinName: string;
  year: string;
  icon: string;
  category: string;
  frontDescription: string;
  backDescription: string;
  didacticFact: string;
  backIcon?: string;
}

export const HISTORICAL_ARTIFACTS: Record<string, InspectableArtifact> = {
  denar: {
    id: 'denar',
    name: 'Silber-Denar des Augustus',
    latinName: 'Denarius Argenteus Augusti',
    year: 'ca. 2 v. Chr.',
    icon: '/assets/icons/silber_denar.png',
    category: 'Wirtschaft & Kaiserkult',
    frontDescription:
      'Vorderseite: Profilbildnis des Augustus mit Lorbeerkranz und der Umschrift „CAESAR AUGUSTUS DIVI F PATER PATRIAE" (Sohn des Göttlichen, Vater des Vaterlandes).',
    backDescription:
      'Rückseite: Caesars Enkel Gaius und Lucius Caesar mit Legions-Schilden, Speeren und Priestergeräten als designierte Thronfolger.',
    didacticFact:
      'Römische Münzen waren die effektivsten Massenmedien der Antike: Jeder Soldat und Bürger im Reich sah täglich das Gesicht und die Botschaften des Kaisers.',
  },
  scutum: {
    id: 'scutum',
    name: 'Scutum der 10. Legion',
    latinName: 'Scutum Legionis X Equestris',
    year: 'ca. 50 v. Chr. – 100 n. Chr.',
    icon: '/assets/icons/scutum.png',
    category: 'Militär & Technik',
    frontDescription:
      'Gewölbter Holzschild aus verleimten Birkenleisten, bespannt mit Rindsleder und bemalt mit den Blitzbündeln (Fulmen) des Gottes Jupiter.',
    backDescription:
      'Rückseite: Massiver eiserner Schildbuckel (Umbo) zum Abwehren von Lanzenstößen und horizontaler Griff für den linken Arm des Legionärs.',
    didacticFact:
      'Im geschlossenen Verband bildeten die Scuta die berühmte „Schildkröte" (Testudo), die feindlichen Pfeil- und Speerhagel fast vollständig abwehrte.',
  },
  tabella: {
    id: 'tabella',
    name: 'Wachstafel mit Stilus',
    latinName: 'Tabella Cerata & Stilus',
    year: 'Klassische Antike',
    icon: '/assets/icons/zwoelftafeln.png',
    category: 'Alltag, Schrift & Recht',
    frontDescription:
      'Hölzerne Klapptafel mit vertieftem, mit geschwärztem Bienenwachs gefülltem Schriftfeld für Notizen, Schulübungen und Verträge.',
    backDescription:
      'Der eiserne Stilus besaß eine spitze Schreibseite und ein flaches, spatelförmiges Ende zum Glätten und Löschen des Wachses („Tabula rasa").',
    didacticFact:
      'Wachstafeln waren die wiederverwendbaren „Notizblöcke" der Römer. Wichtige Urkunden wurden mit Schnüren versiegelt, damit niemand den Text heimlich glätten konnte.',
  },
  lucerna: {
    id: 'lucerna',
    name: 'Römische Ton-Öllampe',
    latinName: 'Lucerna Fictilis',
    year: '1. – 4. Jh. n. Chr.',
    icon: '/assets/icons/oellampe.png',
    category: 'Alltag & Glaube',
    frontDescription:
      'Gebrannte Terrakotta-Lampe mit rundem Ölbecken, Einfülloch und Schnauze für den Leinendocht. Gespeist mit sabinischem Olivenöl.',
    backDescription:
      'Auf dem Spiegel (Diskus) ist das frühchristliche Fisch-Symbol (Ichthys) eingeprägt – das geheime Erkennungszeichen in den Katakomben.',
    didacticFact:
      'Ohne elektrisches Licht waren diese kleinen Lampen die einzige Lichtquelle in den fensterlosen Mietskasernen und den unterirdischen Gängen der Katakomben.',
  },
  codex: {
    id: 'codex',
    name: 'Spätantiker Pergament-Codex (Vivarium)',
    latinName: 'Codex Membranaceus',
    year: 'ca. 540 n. Chr.',
    icon: '/assets/icons/pergament_codex.png',
    category: 'Wissenschaft & Nachleben',
    frontDescription:
      'In Holzdeckel und Leder gebundenes Buch aus feinem Schaf-Pergament mit handgeschriebener lateinischer Unzialschrift und roter Rubrizierung.',
    backDescription:
      'Rückseite: Klosterstempel der Schreibstube (Skriptorium) des Gelehrten Cassiodor aus dem süditalienischen Kloster Vivarium.',
    didacticFact:
      'Der Übergang von der empfindlichen Papyrusrolle zum gebundenen Pergament-Codex und die Abschrift durch Mönche rettete die Literatur der Antike für Europa.',
  },
};

export class ArtifactInspectorModal {
  private overlay: HTMLDivElement | null = null;
  private currentArtifact: InspectableArtifact | null = null;
  private isBackside = false;
  private onCloseCallback: (() => void) | null = null;

  constructor() {
    this.initDOM();
  }

  private initDOM() {
    if (typeof document === 'undefined') return;
    let el = document.getElementById('artifact-inspector-modal') as HTMLDivElement | null;
    if (!el) {
      el = document.createElement('div');
      el.id = 'artifact-inspector-modal';
      el.className = 'modal-backdrop';
      el.style.display = 'none';
      el.style.zIndex = '35';
      document.body.appendChild(el);
    }
    this.overlay = el;
  }

  public open(artifactId: string, onClose?: () => void): void {
    const art = HISTORICAL_ARTIFACTS[artifactId];
    if (!art || !this.overlay) return;
    this.currentArtifact = art;
    this.isBackside = false;
    this.onCloseCallback = onClose || null;
    this.render();
    this.overlay.style.display = 'flex';
  }

  public close(): void {
    if (!this.overlay) return;
    this.overlay.style.display = 'none';
    this.overlay.innerHTML = '';
    if (this.onCloseCallback) {
      this.onCloseCallback();
      this.onCloseCallback = null;
    }
  }

  private render(): void {
    if (!this.overlay || !this.currentArtifact) return;
    const a = this.currentArtifact;

    this.overlay.innerHTML = `
      <div class="roman-modal artifact-modal">
        <div class="modal-top-bar">
          <h2>🔍 Archäologische Nahinspektion: ${a.name}</h2>
          <button class="close-x-btn" id="artifact-close-btn">✕</button>
        </div>

        <div class="artifact-inspect-body">
          <div class="artifact-visual-pane">
            <div class="artifact-showcase-box ${this.isBackside ? 'flipped' : ''}" id="artifact-flip-box" title="Klicken zum Wenden des Fundstücks">
              <img src="${a.icon}" class="artifact-pixel-img" alt="${a.name}" />
              <div class="artifact-side-pill">${this.isBackside ? 'RÜCKSEITE ↺' : 'VORDERSEITE ↻'}</div>
            </div>
            <button class="secondary-roman-btn" id="artifact-turn-btn" style="margin-top:10px;width:100%;">
              🔄 Fundstück wenden (360°)
            </button>
          </div>

          <div class="artifact-info-pane">
            <div class="artifact-meta-header">
              <span class="artifact-latin">${a.latinName}</span>
              <span class="artifact-epoch-pill">${a.year}</span>
            </div>
            <h3 style="margin:4px 0 8px 0;font-size:18px;color:#3b1e08;">${a.name}</h3>
            
            <div class="artifact-desc-box">
              <strong>${this.isBackside ? 'Rückseiten-Befund:' : 'Vorderseiten-Befund:'}</strong>
              <p style="margin:4px 0 0 0;line-height:1.5;">${this.isBackside ? a.backDescription : a.frontDescription}</p>
            </div>

            <div class="artifact-didactic-box">
              <strong>💡 Didaktischer Merksatz für das Geschichtsheft:</strong>
              <p style="margin:4px 0 0 0;line-height:1.5;">${a.didacticFact}</p>
            </div>

            <div style="margin-top:auto;padding-top:14px;display:flex;justify-content:flex-end;">
              <button class="primary-roman-btn" id="artifact-done-btn">✓ Erforschung abschließen</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.overlay.querySelector('#artifact-close-btn')?.addEventListener('click', () => this.close());
    this.overlay.querySelector('#artifact-done-btn')?.addEventListener('click', () => this.close());

    const toggleSide = () => {
      this.isBackside = !this.isBackside;
      this.render();
    };

    this.overlay.querySelector('#artifact-flip-box')?.addEventListener('click', toggleSide);
    this.overlay.querySelector('#artifact-turn-btn')?.addEventListener('click', toggleSide);
  }
}

export const artifactInspector = new ArtifactInspectorModal();
