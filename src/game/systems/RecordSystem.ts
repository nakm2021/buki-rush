import type { LeaderboardEntry } from '../types/GameTypes';

const BEST_DISTANCE_KEY = 'buki-rush-best-distance';
const META_KEY = 'buki-rush-meta-v2';
const LEADERBOARD_KEY = 'buki-rush-leaderboard-v1';
const SETTINGS_KEY = 'buki-rush-settings-v1';

export interface RunRecordUpdate {
  distance: number;
  bosses: string[];
  weaponName: string;
  medals: number;
}

export interface PlayerMeta {
  medals: number;
  permanentRank: number;
  totalBossKills: number;
  bosses: string[];
  weapons: string[];
}

export interface PlayerSettings {
  playerName: string;
  rankingMode: 'local' | 'global-ready';
}

const defaultMeta: PlayerMeta = {
  medals: 0,
  permanentRank: 0,
  totalBossKills: 0,
  bosses: [],
  weapons: [],
};

const defaultSettings: PlayerSettings = {
  playerName: 'PLAYER',
  rankingMode: 'local',
};

export function loadBestDistance(): number {
  const rawValue = window.localStorage.getItem(BEST_DISTANCE_KEY);
  const value = rawValue ? Number(rawValue) : 0;
  return Number.isFinite(value) ? value : 0;
}

export function saveBestDistance(distance: number): number {
  const best = Math.max(loadBestDistance(), Math.floor(distance));
  window.localStorage.setItem(BEST_DISTANCE_KEY, String(best));
  return best;
}

export function loadPlayerMeta(): PlayerMeta {
  const rawValue = window.localStorage.getItem(META_KEY);
  if (!rawValue) {
    return { ...defaultMeta };
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<PlayerMeta>;
    return {
      medals: Number.isFinite(parsed.medals) ? Number(parsed.medals) : 0,
      permanentRank: Number.isFinite(parsed.permanentRank) ? Number(parsed.permanentRank) : 0,
      totalBossKills: Number.isFinite(parsed.totalBossKills) ? Number(parsed.totalBossKills) : 0,
      bosses: Array.isArray(parsed.bosses) ? parsed.bosses.filter((value): value is string => typeof value === 'string') : [],
      weapons: Array.isArray(parsed.weapons) ? parsed.weapons.filter((value): value is string => typeof value === 'string') : [],
    };
  } catch {
    return { ...defaultMeta };
  }
}

export function savePlayerMeta(meta: PlayerMeta): PlayerMeta {
  const cleanMeta: PlayerMeta = {
    medals: Math.max(0, Math.floor(meta.medals)),
    permanentRank: Math.max(0, Math.floor(meta.permanentRank)),
    totalBossKills: Math.max(0, Math.floor(meta.totalBossKills)),
    bosses: [...new Set(meta.bosses)],
    weapons: [...new Set(meta.weapons)],
  };
  window.localStorage.setItem(META_KEY, JSON.stringify(cleanMeta));
  return cleanMeta;
}

export function recordRun(update: RunRecordUpdate): PlayerMeta {
  const meta = loadPlayerMeta();
  const medalsEarned = Math.max(0, Math.floor(update.medals));
  const totalMedals = meta.medals + medalsEarned;
  const permanentRank = Math.max(meta.permanentRank, Math.floor(totalMedals / 12));
  return savePlayerMeta({
    medals: totalMedals,
    permanentRank,
    totalBossKills: meta.totalBossKills + update.bosses.length,
    bosses: [...meta.bosses, ...update.bosses],
    weapons: [...meta.weapons, update.weaponName],
  });
}

export function loadSettings(): PlayerSettings {
  const rawValue = window.localStorage.getItem(SETTINGS_KEY);
  if (!rawValue) {
    return { ...defaultSettings };
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<PlayerSettings>;
    return {
      playerName: typeof parsed.playerName === 'string' && parsed.playerName.trim() ? parsed.playerName.trim().slice(0, 12) : defaultSettings.playerName,
      rankingMode: parsed.rankingMode === 'global-ready' ? 'global-ready' : 'local',
    };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings: Partial<PlayerSettings>): PlayerSettings {
  const next: PlayerSettings = {
    ...loadSettings(),
    ...settings,
  };
  const clean: PlayerSettings = {
    playerName: next.playerName.trim().slice(0, 12) || defaultSettings.playerName,
    rankingMode: next.rankingMode === 'global-ready' ? 'global-ready' : 'local',
  };
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(clean));
  return clean;
}

export function loadLeaderboard(): LeaderboardEntry[] {
  const rawValue = window.localStorage.getItem(LEADERBOARD_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<LeaderboardEntry>[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((entry): entry is LeaderboardEntry => typeof entry.playerName === 'string' && Number.isFinite(entry.distance) && typeof entry.weaponName === 'string' && typeof entry.recordedAt === 'string')
      .sort((a, b) => b.distance - a.distance)
      .slice(0, 10);
  } catch {
    return [];
  }
}

export function recordLeaderboard(distance: number, weaponName: string): { leaderboard: LeaderboardEntry[]; updated: boolean } {
  const settings = loadSettings();
  const entry: LeaderboardEntry = {
    playerName: settings.playerName,
    distance: Math.max(0, Math.floor(distance)),
    weaponName,
    recordedAt: new Date().toISOString(),
  };
  const previous = loadLeaderboard();
  const leaderboard = [...previous, entry].sort((a, b) => b.distance - a.distance).slice(0, 10);
  const updated = leaderboard.includes(entry);
  window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  return { leaderboard, updated };
}
