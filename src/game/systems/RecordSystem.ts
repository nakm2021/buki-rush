const BEST_DISTANCE_KEY = 'buki-rush-best-distance';

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
