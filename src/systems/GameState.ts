import { LEXICON } from '../data/chapters';
import { BUILDINGS, ITEMS, RECIPES, RomanItemId, TRADES } from '../data/items';
import { PlayerGender, PlayerRole, SaveData, SaveManager } from './SaveManager';

export interface RoleDefinition {
  id: PlayerRole;
  name: string;
  latinTitle: string;
  description: string;
  bonusText: string;
  icon: string;
}

export const ROM_ROLES: RoleDefinition[] = [
  {
    id: 'legionary',
    name: 'Legionär & Tribun',
    latinTitle: 'Miles Legionis',
    description:
      'Vom einfachen Bauern-Milizionär zum Offizier am Limes: Du kennst Disziplin, Taktik und den Mut der Legionen.',
    bonusText: '+1 Bonus-Ertrag beim Abbau von Eisenerz, Silbererz und Holz',
    icon: '/assets/icons/scutum.png',
  },
  {
    id: 'senator',
    name: 'Volkstribun & Senator',
    latinTitle: 'Senator & Tribunus Plebis',
    description:
      'Auf dem Forum Romanum und in der Curia kämpfst du mit Redekunst, Gesetzen und Diplomatie um die Res Publica.',
    bonusText: '+1 Bonus-Ertrag bei Oliven, Weintrauben, Getreide & Schafwolle',
    icon: '/assets/icons/zwoelftafeln.png',
  },
  {
    id: 'architect',
    name: 'Baumeister & Ingenieur',
    latinTitle: 'Architectus Romanus',
    description:
      'Mit Bögen, Aquädukten, Marmor und römischem Beton (Opus Caementicium) formst du Rom zur ewigen Weltmetropole.',
    bonusText: '+1 Bonus-Ertrag beim Abbau von Tuffstein, Carrara-Marmor und Quellwasser',
    icon: '/assets/icons/opus_caementicium.png',
  },
];

type Listener = () => void;

export class GameState {
  public chapter = 1;
  public maxUnlockedChapter = 1;
  public completedChapters = new Set<number>();
  public inventory: Partial<Record<RomanItemId, number>> = {};
  public craftedOnce = new Set<RomanItemId>();
  public builtBuildings = new Set<string>();
  public quizPerfect = new Set<number>();
  public discoveredRelics = new Set<string>();
  public lexiconRead = new Set<string>();
  public unlockedLexicon = new Set<string>();
  public distanceMeters = 0;
  public compassText = '';
  public historicalPoints = 0;
  public visitedCatacombShrine = false;
  public visitedMithrasShrine = false;
  public playerX = 34 * 16;
  public playerY = 42 * 16;
  public questCompleted = false;
  public gender: PlayerGender = 'male';
  public role: PlayerRole = 'legionary';
  public playerName = 'Titus Valerius';
  public playTimeSeconds = 0;
  public storyFlags: Record<string, boolean> = {};
  public dilemmaSummary = '';
  public malePreviewUrl = '';
  public femalePreviewUrl = '';

  private listeners: Listener[] = [];

  constructor() {
    this.load();
    this.checkLexiconUnlocks();
  }

  public onChange(fn: Listener) {
    this.listeners.push(fn);
  }

  public notify() {
    this.checkQuest();
    this.save();
    for (const fn of this.listeners) fn();
  }

  public getRoleDef(): RoleDefinition {
    return ROM_ROLES.find((r) => r.id === this.role) || ROM_ROLES[0];
  }

  public setProfile(gender: PlayerGender, role: PlayerRole, name?: string) {
    this.gender = gender;
    this.role = role;
    if (name && name.trim().length > 0) {
      this.playerName = name.trim();
    } else {
      this.playerName = gender === 'female' ? 'Cornelia Valeria' : 'Titus Valerius';
    }
    this.notify();
  }

  public getItemCount(id: RomanItemId): number {
    return this.inventory[id] || 0;
  }

  public hasItem(id: RomanItemId, count = 1): boolean {
    return this.getItemCount(id) >= count;
  }

  public addItem(id: RomanItemId, count = 1, applyRoleBonus = false): number {
    let actualCount = count;
    if (applyRoleBonus) {
      if (
        this.role === 'legionary' &&
        (id === 'eisenerz' || id === 'silbererz' || id === 'holz')
      ) {
        actualCount += 1;
      } else if (
        this.role === 'senator' &&
        (id === 'oliven' || id === 'weintrauben' || id === 'getreide' || id === 'wolle')
      ) {
        actualCount += 1;
      } else if (
        this.role === 'architect' &&
        (id === 'tuffstein' || id === 'marmor' || id === 'wasser')
      ) {
        actualCount += 1;
      }
    }
    this.inventory[id] = (this.inventory[id] || 0) + actualCount;
    this.notify();
    return actualCount;
  }

  public removeItem(id: RomanItemId, count = 1): boolean {
    if (!this.hasItem(id, count)) return false;
    this.inventory[id] = (this.inventory[id] || 0) - count;
    if ((this.inventory[id] || 0) <= 0) {
      delete this.inventory[id];
    }
    this.notify();
    return true;
  }

  public canCraft(recipeId: string): boolean {
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe || recipe.minChapter > this.chapter) return false;
    for (const [item, qty] of Object.entries(recipe.inputs)) {
      if (!this.hasItem(item as RomanItemId, qty || 0)) return false;
    }
    return true;
  }

  public craft(recipeId: string): boolean {
    if (!this.canCraft(recipeId)) return false;
    const recipe = RECIPES.find((r) => r.id === recipeId)!;
    for (const [item, qty] of Object.entries(recipe.inputs)) {
      this.removeItem(item as RomanItemId, qty || 0);
    }
    const outCount = recipe.outputCount;
    this.inventory[recipe.output] = (this.inventory[recipe.output] || 0) + outCount;
    this.craftedOnce.add(recipe.output);
    this.notify();
    return true;
  }

  public canTrade(tradeId: string): boolean {
    const trade = TRADES.find((t) => t.id === tradeId);
    if (!trade) return false;
    return this.hasItem(trade.giveItem, trade.giveCount);
  }

  public executeTrade(tradeId: string): boolean {
    const trade = TRADES.find((t) => t.id === tradeId);
    if (!trade || !this.canTrade(tradeId)) return false;
    this.removeItem(trade.giveItem, trade.giveCount);
    this.addItem(trade.receiveItem, trade.receiveCount);
    this.craftedOnce.add(trade.receiveItem);
    this.notify();
    return true;
  }

  public isBuilt(buildingId: string): boolean {
    return this.builtBuildings.has(buildingId);
  }

  public canBuild(buildingId: string): boolean {
    if (this.isBuilt(buildingId)) return false;
    const b = BUILDINGS.find((x) => x.id === buildingId);
    if (!b || b.minChapter > this.chapter) return false;
    for (const [item, qty] of Object.entries(b.cost)) {
      if (!this.hasItem(item as RomanItemId, qty || 0)) return false;
    }
    return true;
  }

  public build(buildingId: string): boolean {
    if (!this.canBuild(buildingId)) return false;
    const b = BUILDINGS.find((x) => x.id === buildingId)!;
    for (const [item, qty] of Object.entries(b.cost)) {
      this.removeItem(item as RomanItemId, qty || 0);
    }
    this.builtBuildings.add(buildingId);
    this.notify();
    return true;
  }

  public discoverRelic(relicId: string) {
    this.discoveredRelics.add(relicId);
    this.notify();
  }

  public hasRelic(relicId: string): boolean {
    return this.discoveredRelics.has(relicId);
  }

  public markLexiconRead(termId: string) {
    if (!this.lexiconRead.has(termId)) {
      this.lexiconRead.add(termId);
      this.save();
    }
  }

  public isLexiconUnlocked(termId: string): boolean {
    return this.unlockedLexicon.has(termId);
  }

  public checkLexiconUnlocks(): string[] {
    const newlyUnlocked: string[] = [];
    for (const entry of LEXICON) {
      if (this.unlockedLexicon.has(entry.id)) continue;
      const chOk = entry.minChapter <= this.chapter;
      const craftOk = entry.unlockCraftId ? this.craftedOnce.has(entry.unlockCraftId as RomanItemId) : false;
      const relicOk = entry.unlockRelicId ? this.discoveredRelics.has(entry.unlockRelicId) : false;
      const buildOk = entry.unlockBuildingId ? this.builtBuildings.has(entry.unlockBuildingId) : false;

      if (chOk || craftOk || relicOk || buildOk) {
        this.unlockedLexicon.add(entry.id);
        newlyUnlocked.push(entry.id);
      }
    }
    return newlyUnlocked;
  }

  public addPoints(pts: number) {
    this.historicalPoints += pts;
    this.notify();
  }

  public formatPlayTime(): string {
    const m = Math.floor(this.playTimeSeconds / 60);
    const s = this.playTimeSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s} Min.`;
  }

  public visitCatacombShrine() {
    this.visitedCatacombShrine = true;
    this.notify();
  }

  public visitMithrasShrine() {
    this.visitedMithrasShrine = true;
    this.notify();
  }

  public checkQuest(): boolean {
    let done = false;
    switch (this.chapter) {
      case 1:
        done =
          this.isBuilt('vesta_herd') &&
          (this.craftedOnce.has('puls_brei') || this.hasItem('puls_brei', 1));
        break;
      case 2:
        done =
          this.isBuilt('curia_senat') &&
          (this.craftedOnce.has('fasces') || this.hasItem('fasces', 1));
        break;
      case 3:
        done =
          this.isBuilt('legion_schmiede') &&
          (this.craftedOnce.has('zwoelftafeln') || this.hasItem('zwoelftafeln', 1)) &&
          (this.craftedOnce.has('toga_candida') || this.hasItem('toga_candida', 1));
        break;
      case 4:
        done =
          this.isBuilt('ostia_werft') &&
          (this.craftedOnce.has('corvus_enterbruecke') ||
            this.hasItem('corvus_enterbruecke', 1));
        break;
      case 5:
        done =
          (this.craftedOnce.has('panis_brot') || this.hasItem('panis_brot', 1)) &&
          (this.craftedOnce.has('ackergesetz_rolle') ||
            this.hasItem('ackergesetz_rolle', 1));
        break;
      case 6:
        done =
          (this.craftedOnce.has('gladiator_dreizack') ||
            this.hasItem('gladiator_dreizack', 1)) &&
          (this.craftedOnce.has('gladius') || this.hasItem('gladius', 1));
        break;
      case 7:
        done =
          (this.craftedOnce.has('silber_denar') || this.hasItem('silber_denar', 1)) &&
          (this.craftedOnce.has('legionsadler') || this.hasItem('legionsadler', 1));
        break;
      case 8:
        done =
          this.isBuilt('aqua_romana') &&
          (this.craftedOnce.has('lorbeerkranz_rom') ||
            this.hasItem('lorbeerkranz_rom', 1));
        break;
      case 9:
        done =
          (this.craftedOnce.has('oellampe') || this.hasItem('oellampe', 1)) &&
          this.visitedCatacombShrine;
        break;
      case 10:
        done =
          this.isBuilt('kolosseum_bau') &&
          (this.craftedOnce.has('meilenstein') || this.hasItem('meilenstein', 1)) &&
          this.visitedMithrasShrine;
        break;
      case 11:
        done =
          this.isBuilt('basilika_bau') &&
          (this.craftedOnce.has('chi_rho_schild') ||
            this.hasItem('chi_rho_schild', 1));
        break;
      case 12:
        done =
          this.craftedOnce.has('pergament_codex') ||
          this.hasItem('pergament_codex', 1);
        break;
    }
    this.questCompleted = done;
    return done;
  }

  public getQuestStepProgress(): { label: string; done: boolean }[] {
    switch (this.chapter) {
      case 1:
        return [
          {
            label: 'Heiligen Herd der Vesta & Horreum bauen [B]',
            done: this.isBuilt('vesta_herd'),
          },
          {
            label: 'Römischen Puls-Getreidebrei kochen [C]',
            done: this.craftedOnce.has('puls_brei') || this.hasItem('puls_brei', 1),
          },
        ];
      case 2:
        return [
          {
            label: 'Curia Hostilia (Senatshaus) errichten [B]',
            done: this.isBuilt('curia_senat'),
          },
          {
            label: 'Rutenbündel der Liktoren (Fasces) binden [C]',
            done: this.craftedOnce.has('fasces') || this.hasItem('fasces', 1),
          },
        ];
      case 3:
        return [
          {
            label: 'Republikanische Legionsschmiede bauen [B]',
            done: this.isBuilt('legion_schmiede'),
          },
          {
            label: 'Zwölftafelgesetze gießen & Weiße Toga weben [C]',
            done:
              (this.craftedOnce.has('zwoelftafeln') || this.hasItem('zwoelftafeln', 1)) &&
              (this.craftedOnce.has('toga_candida') || this.hasItem('toga_candida', 1)),
          },
        ];
      case 4:
        return [
          {
            label: 'Flottenarsenal & Hafen von Ostia bauen [B]',
            done: this.isBuilt('ostia_werft'),
          },
          {
            label: 'Enterbrücke (Corvus) gegen Karthago bauen [C]',
            done:
              this.craftedOnce.has('corvus_enterbruecke') ||
              this.hasItem('corvus_enterbruecke', 1),
          },
        ];
      case 5:
        return [
          {
            label: 'Panis-Rundbrot für das Volk backen [C]',
            done: this.craftedOnce.has('panis_brot') || this.hasItem('panis_brot', 1),
          },
          {
            label: 'Ackergesetz-Rolle (Lex Agraria) verfassen [C]',
            done:
              this.craftedOnce.has('ackergesetz_rolle') ||
              this.hasItem('ackergesetz_rolle', 1),
          },
        ];
      case 6:
        return [
          {
            label: 'Gladiatoren-Dreizack (Fuscina) schmieden [C]',
            done:
              this.craftedOnce.has('gladiator_dreizack') ||
              this.hasItem('gladiator_dreizack', 1),
          },
          {
            label: 'Römisches Kurzschwert (Gladius) schmieden [C]',
            done: this.craftedOnce.has('gladius') || this.hasItem('gladius', 1),
          },
        ];
      case 7:
        return [
          {
            label: 'Römischen Silber-Denar prägen [C]',
            done:
              this.craftedOnce.has('silber_denar') || this.hasItem('silber_denar', 1),
          },
          {
            label: 'Goldenen Legionsadler (Aquila) fertigen [C]',
            done:
              this.craftedOnce.has('legionsadler') || this.hasItem('legionsadler', 1),
          },
        ];
      case 8:
        return [
          {
            label: 'Römischen Beton mischen [C] & Aquädukt bauen [B]',
            done: this.isBuilt('aqua_romana'),
          },
          {
            label: 'Kaiserlichen Lorbeerkranz flechten [C]',
            done:
              this.craftedOnce.has('lorbeerkranz_rom') ||
              this.hasItem('lorbeerkranz_rom', 1),
          },
        ];
      case 9:
        return [
          {
            label: 'Römische Ton-Öllampe (Lucerna) fertigen [C]',
            done: this.craftedOnce.has('oellampe') || this.hasItem('oellampe', 1),
          },
          {
            label: 'Frühchristlichen Ichthys-Altar in den Katakomben besuchen [E]',
            done: this.visitedCatacombShrine,
          },
        ];
      case 10:
        return [
          {
            label: 'Amphitheatrum Flavium (Kolosseum) errichten [B]',
            done: this.isBuilt('kolosseum_bau'),
          },
          {
            label: 'Römischen Meilenstein (Miliarium) meißeln [C]',
            done: this.craftedOnce.has('meilenstein') || this.hasItem('meilenstein', 1),
          },
          {
            label: 'Mithräum der Legionäre in den Katakomben besuchen [E]',
            done: this.visitedMithrasShrine,
          },
        ];
      case 11:
        return [
          {
            label: 'Konstantinsbasilika errichten [B]',
            done: this.isBuilt('basilika_bau'),
          },
          {
            label: 'Konstantinischen Chi-Rho-Schild (☧) fertigen [C]',
            done:
              this.craftedOnce.has('chi_rho_schild') ||
              this.hasItem('chi_rho_schild', 1),
          },
        ];
      case 12:
        return [
          {
            label: 'Spätantiken Pergament-Codex (Vivarium) binden [C]',
            done:
              this.craftedOnce.has('pergament_codex') ||
              this.hasItem('pergament_codex', 1),
          },
        ];
      default:
        return [];
    }
  }

  public completeChapter(perfectQuiz: boolean) {
    this.completedChapters.add(this.chapter);
    if (perfectQuiz) {
      this.quizPerfect.add(this.chapter);
    }
    if (this.chapter < 12) {
      this.chapter += 1;
      if (this.chapter > this.maxUnlockedChapter) {
        this.maxUnlockedChapter = this.chapter;
      }
    }
    this.notify();
  }

  public setChapter(ch: number) {
    if (ch >= 1 && ch <= 12) {
      this.chapter = ch;
      if (ch > this.maxUnlockedChapter) {
        this.maxUnlockedChapter = ch;
      }
      for (const b of BUILDINGS) {
        if (b.minChapter < ch) {
          this.builtBuildings.add(b.id);
        }
      }
      this.notify();
    }
  }

  public getCertificateRank(): { rank: string; title: string; color: string } {
    const completed = this.completedChapters.size;
    const relics = this.discoveredRelics.size;
    if (completed >= 12 && relics >= 5) {
      return {
        rank: 'S-RANG (SUMMA CUM LAUDE)',
        title: 'Meisterhistoriker & Triumphator des Imperium Romanum',
        color: '#b45309',
      };
    }
    if (completed >= 10 || (completed >= 8 && relics >= 3)) {
      return {
        rank: 'A-RANG (MAGNA CUM LAUDE)',
        title: 'Konsul & Bewahrer der Res Publica',
        color: '#0369a1',
      };
    }
    if (completed >= 5) {
      return {
        rank: 'B-RANG (CUM LAUDE)',
        title: 'Volkstribun & Chronist am Tiber',
        color: '#15803d',
      };
    }
    return {
      rank: 'C-RANG (TIRO ROMANUS)',
      title: 'Jungbürger am Palatin-Hügel',
      color: '#44403c',
    };
  }

  public exportShortcode(): string {
    const chStr = String(this.chapter).padStart(2, '0');
    const roleChar =
      this.role === 'legionary' ? 'L' : this.role === 'senator' ? 'S' : 'A';
    const genderChar = this.gender === 'female' ? 'F' : 'M';
    let compMask = 0;
    for (let i = 1; i <= 12; i++) {
      if (this.completedChapters.has(i)) compMask |= 1 << (i - 1);
    }
    const relicIds = [
      'relic_lupa',
      'relic_zwoelftafel',
      'relic_caesar_denar',
      'relic_augustus_statue',
      'relic_konstantin_medaillon',
    ];
    let relicMask = 0;
    relicIds.forEach((id, idx) => {
      if (this.discoveredRelics.has(id)) relicMask |= 1 << idx;
    });
    const compHex = compMask.toString(16).toUpperCase().padStart(3, '0');
    const relicHex = relicMask.toString(16).toUpperCase().padStart(2, '0');
    return `ROM-K${chStr}-${roleChar}${genderChar}-${compHex}-${relicHex}`;
  }

  public importShortcode(code: string): boolean {
    const clean = code.trim().toUpperCase();
    const match = clean.match(
      /^ROM-K(\d{1,2})-([LSA])([MF])-([0-9A-F]{1,3})-([0-9A-F]{1,2})$/
    );
    if (!match) return false;
    const ch = parseInt(match[1], 10);
    if (ch < 1 || ch > 12) return false;
    const roleChar = match[2];
    const genderChar = match[3];
    const compMask = parseInt(match[4], 16);
    const relicMask = parseInt(match[5], 16);

    this.role =
      roleChar === 'L' ? 'legionary' : roleChar === 'S' ? 'senator' : 'architect';
    this.gender = genderChar === 'F' ? 'female' : 'male';
    this.completedChapters.clear();
    for (let i = 1; i <= 12; i++) {
      if (compMask & (1 << (i - 1))) {
        this.completedChapters.add(i);
      }
    }
    const relicIds = [
      'relic_lupa',
      'relic_zwoelftafel',
      'relic_caesar_denar',
      'relic_augustus_statue',
      'relic_konstantin_medaillon',
    ];
    this.discoveredRelics.clear();
    relicIds.forEach((id, idx) => {
      if (relicMask & (1 << idx)) {
        this.discoveredRelics.add(id);
      }
    });
    this.setChapter(ch);
    return true;
  }

  public save() {
    const data: SaveData = {
      chapter: this.chapter,
      maxUnlockedChapter: this.maxUnlockedChapter,
      completedChapters: Array.from(this.completedChapters),
      inventory: this.inventory,
      craftedOnce: Array.from(this.craftedOnce),
      builtBuildings: Array.from(this.builtBuildings),
      playerX: this.playerX,
      playerY: this.playerY,
      quizPerfect: Array.from(this.quizPerfect),
      gender: this.gender,
      role: this.role,
      discoveredRelics: Array.from(this.discoveredRelics),
      visitedCatacombShrine: this.visitedCatacombShrine,
      visitedMithrasShrine: this.visitedMithrasShrine,
      lexiconRead: Array.from(this.lexiconRead),
      unlockedLexicon: Array.from(this.unlockedLexicon),
      distanceMeters: Math.round(this.distanceMeters),
      historicalPoints: this.historicalPoints,
      playerName: this.playerName,
      playTimeSeconds: this.playTimeSeconds,
    };
    SaveManager.save(data);
  }

  public load() {
    const data = SaveManager.load();
    if (!data) return;
    this.chapter = data.chapter || 1;
    this.maxUnlockedChapter = data.maxUnlockedChapter || 1;
    this.completedChapters = new Set(data.completedChapters || []);
    this.inventory = data.inventory || {};
    this.craftedOnce = new Set(data.craftedOnce || []);
    this.builtBuildings = new Set(data.builtBuildings || []);
    this.quizPerfect = new Set(data.quizPerfect || []);
    this.discoveredRelics = new Set(data.discoveredRelics || []);
    this.lexiconRead = new Set(data.lexiconRead || []);
    this.unlockedLexicon = new Set(data.unlockedLexicon || []);
    this.distanceMeters = data.distanceMeters || 0;
    this.historicalPoints = data.historicalPoints || 0;
    this.visitedCatacombShrine = Boolean(data.visitedCatacombShrine);
    this.visitedMithrasShrine = Boolean(data.visitedMithrasShrine);
    this.playerX = data.playerX || 34 * 16;
    this.playerY = data.playerY || 42 * 16;
    this.gender = data.gender || 'male';
    this.role = data.role || 'legionary';
    this.playerName = data.playerName || 'Titus Valerius';
    this.playTimeSeconds = data.playTimeSeconds || 0;
    this.checkQuest();
    this.checkLexiconUnlocks();
  }

  public resetGame() {
    SaveManager.clear();
    this.chapter = 1;
    this.maxUnlockedChapter = 1;
    this.completedChapters.clear();
    this.inventory = {};
    this.craftedOnce.clear();
    this.builtBuildings.clear();
    this.quizPerfect.clear();
    this.discoveredRelics.clear();
    this.lexiconRead.clear();
    this.unlockedLexicon.clear();
    this.distanceMeters = 0;
    this.historicalPoints = 0;
    this.visitedCatacombShrine = false;
    this.visitedMithrasShrine = false;
    this.playerX = 34 * 16;
    this.playerY = 42 * 16;
    this.questCompleted = false;
    this.playTimeSeconds = 0;
    this.checkLexiconUnlocks();
    this.notify();
  }
}

export const gameState = new GameState();
export const state = gameState;
export { ITEMS };
