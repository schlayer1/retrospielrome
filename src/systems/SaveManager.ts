import { RomanItemId } from '../data/items';

export type PlayerRole = 'legionary' | 'senator' | 'architect';
export type PlayerGender = 'male' | 'female';

export interface SaveData {
  chapter: number;
  maxUnlockedChapter: number;
  completedChapters: number[];
  inventory: Partial<Record<RomanItemId, number>>;
  craftedOnce: RomanItemId[];
  builtBuildings: string[];
  playerX: number;
  playerY: number;
  quizPerfect: number[];
  gender: PlayerGender;
  role: PlayerRole;
  discoveredRelics: string[];
  visitedCatacombShrine: boolean;
  visitedMithrasShrine: boolean;
  lexiconRead: string[];
  unlockedLexicon?: string[];
  distanceMeters?: number;
  historicalPoints?: number;
  playerName: string;
  playTimeSeconds: number;
}

const STORAGE_KEY = 'retro_save_rom';

export class SaveManager {
  static save(data: SaveData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota errors
    }
  }

  static load(): SaveData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SaveData;
    } catch {
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}
