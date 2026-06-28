const BEST_DISTANCE_KEY = 'buki-rush-best-distance';
const META_KEY = 'buki-rush-meta-v2';

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

const defaultMeta: PlayerMeta = {
  medals: 0,
  permanentRank: 0,
  totalBossKills: 0,
  bosses: [],
  weapons: [],
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
