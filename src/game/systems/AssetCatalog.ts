import type { PlayerStats, WeaponArchetype, WeaponElement, WeaponRarity } from '../types/GameTypes';

interface ImageAsset {
  key: string;
  path: string;
}

export interface WeaponImageAsset extends ImageAsset {
  match?: {
    elements?: WeaponElement[];
    archetypes?: WeaponArchetype[];
    rarities?: WeaponRarity[];
  };
}

export interface BossImageAsset extends ImageAsset {
  width: number;
  height: number;
}

export const WEAPON_IMAGE_ASSETS: WeaponImageAsset[] = [
  { key: 'weaponAnime', path: 'assets/generated/weapon-anime.png' },
  { key: 'weaponPhoenix', path: 'assets/generated/weapon-phoenix.png', match: { elements: ['fire'], rarities: ['mythic'] } },
  { key: 'weaponCrystal', path: 'assets/generated/weapon-crystal.png', match: { elements: ['ice', 'crystal'], rarities: ['legend'] } },
  { key: 'weaponShadow', path: 'assets/generated/weapon-shadow.png', match: { elements: ['shadow'] } },
  { key: 'weaponWind', path: 'assets/generated/weapon-wind.png', match: { elements: ['wind'] } },
  { key: 'weaponSeraph', path: 'assets/generated/weapon-seraph.png', match: { elements: ['light'], archetypes: ['seraph'] } },
  { key: 'weaponSamurai', path: 'assets/generated/weapon-samurai.png', match: { archetypes: ['samurai', 'saber', 'blade'] } },
  { key: 'weaponThunder', path: 'assets/generated/weapon-thunder.png', match: { elements: ['thunder'], archetypes: ['levin', 'rail'] } },
  { key: 'weaponVoid', path: 'assets/generated/weapon-void.png', match: { elements: ['shadow'], archetypes: ['onyx', 'phantom'] } },
  { key: 'weaponDragon', path: 'assets/generated/weapon-dragon.png', match: { archetypes: ['dragon', 'hydra', 'gigas'] } },
  { key: 'weaponFrost', path: 'assets/generated/weapon-frost.png', match: { elements: ['ice'], archetypes: ['aurora', 'geode'] } },
  { key: 'weaponNova', path: 'assets/generated/weapon-nova.png', match: { archetypes: ['nova', 'meteor', 'chrono', 'nebula'] } },
];

export const BOSS_IMAGE_ASSETS: BossImageAsset[] = [
  { key: 'bossDragon', path: 'assets/generated/boss-dragon.png', width: 386, height: 748 },
  { key: 'bossTitan', path: 'assets/generated/boss-titan.png', width: 360, height: 520 },
  { key: 'bossHydra', path: 'assets/generated/boss-hydra.png', width: 390, height: 590 },
  { key: 'bossPhoenix', path: 'assets/generated/boss-phoenix.png', width: 390, height: 560 },
  { key: 'bossDemon', path: 'assets/generated/boss-demon.png', width: 380, height: 560 },
  { key: 'bossLeviathan', path: 'assets/generated/boss-leviathan.png', width: 390, height: 560 },
  { key: 'bossVoid', path: 'assets/generated/boss-void.png', width: 390, height: 560 },
];

export const MISC_IMAGE_ASSETS: ImageAsset[] = [
  { key: 'eliteReaper', path: 'assets/generated/elite-reaper.png' },
];

export function getPreloadImageAssets(): ImageAsset[] {
  return [...WEAPON_IMAGE_ASSETS, ...BOSS_IMAGE_ASSETS, ...MISC_IMAGE_ASSETS];
}

export function getWeaponAssetKeys(): string[] {
  return WEAPON_IMAGE_ASSETS.map((asset) => asset.key);
}

export function selectWeaponAssetKey(stats: PlayerStats): string {
  const matched = [...WEAPON_IMAGE_ASSETS].reverse().find((asset) => {
    const match = asset.match;
    if (!match) {
      return false;
    }
    return Boolean(
      match.elements?.includes(stats.element)
      || match.archetypes?.includes(stats.archetype)
      || match.rarities?.includes(stats.rarity),
    );
  });

  return matched?.key ?? WEAPON_IMAGE_ASSETS[0].key;
}

export function getBossAssetByLoop(loopIndex: number): BossImageAsset {
  return BOSS_IMAGE_ASSETS[loopIndex % BOSS_IMAGE_ASSETS.length];
}

export function getBossAsset(key: string): BossImageAsset {
  return BOSS_IMAGE_ASSETS.find((asset) => asset.key === key) ?? BOSS_IMAGE_ASSETS[0];
}
