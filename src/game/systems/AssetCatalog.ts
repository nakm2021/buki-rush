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

export interface BossTheme {
  key: string;
  primary: number;
  secondary: number;
  accent: number;
  darkness: number;
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
  { key: 'weaponRune', path: 'assets/generated/weapon-rune.png', match: { elements: ['light', 'crystal'], archetypes: ['rune', 'oracle'] } },
  { key: 'weaponBasilisk', path: 'assets/generated/weapon-basilisk.png', match: { elements: ['shadow'], archetypes: ['basilisk', 'chimera'] } },
  { key: 'weaponAnchor', path: 'assets/generated/weapon-anchor.png', match: { archetypes: ['anchor', 'kraken'] } },
];

export const BOSS_IMAGE_ASSETS: BossImageAsset[] = [
  { key: 'bossDragon', path: 'assets/generated/boss-dragon.png', width: 386, height: 748 },
  { key: 'bossTitan', path: 'assets/generated/boss-titan.png', width: 360, height: 520 },
  { key: 'bossHydra', path: 'assets/generated/boss-hydra.png', width: 390, height: 590 },
  { key: 'bossPhoenix', path: 'assets/generated/boss-phoenix.png', width: 390, height: 560 },
  { key: 'bossDemon', path: 'assets/generated/boss-demon.png', width: 380, height: 560 },
  { key: 'bossLeviathan', path: 'assets/generated/boss-leviathan.png', width: 390, height: 560 },
  { key: 'bossVoid', path: 'assets/generated/boss-void.png', width: 390, height: 560 },
  { key: 'bossMantis', path: 'assets/generated/boss-mantis.png', width: 390, height: 820 },
  { key: 'bossOni', path: 'assets/generated/boss-oni.png', width: 410, height: 620 },
  { key: 'bossFrostQueen', path: 'assets/generated/boss-frost-queen.png', width: 390, height: 820 },
];

export const TITLE_BACKGROUND_ASSET: ImageAsset = { key: 'titleIchigo', path: 'assets/generated/title-ichigo.png' };

export const ENEMY_IMAGE_ASSETS: ImageAsset[] = [
  { key: 'enemyStrawberryImp', path: 'assets/generated/enemy-strawberry-imp.png' },
  { key: 'enemyFrostLens', path: 'assets/generated/enemy-frost-lens.png' },
  { key: 'enemyBrassBeetle', path: 'assets/generated/enemy-brass-beetle.png' },
  { key: 'enemyVioletMoth', path: 'assets/generated/enemy-violet-moth.png' },
];

export const MISC_IMAGE_ASSETS: ImageAsset[] = [
  ...ENEMY_IMAGE_ASSETS,
  { key: 'eliteReaper', path: 'assets/generated/elite-reaper.png' },
];

export function getPreloadImageAssets(): ImageAsset[] {
  return [TITLE_BACKGROUND_ASSET, ...WEAPON_IMAGE_ASSETS, ...BOSS_IMAGE_ASSETS, ...MISC_IMAGE_ASSETS];
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

const BOSS_THEMES: BossTheme[] = [
  { key: 'bossDragon', primary: 0xef4444, secondary: 0xfb923c, accent: 0xfef3c7, darkness: 0x180812 },
  { key: 'bossTitan', primary: 0x94a3b8, secondary: 0xfacc15, accent: 0xf8fafc, darkness: 0x111827 },
  { key: 'bossHydra', primary: 0x22c55e, secondary: 0x38bdf8, accent: 0xccfbf1, darkness: 0x052e16 },
  { key: 'bossPhoenix', primary: 0xfb7185, secondary: 0xfacc15, accent: 0xffedd5, darkness: 0x301014 },
  { key: 'bossDemon', primary: 0xdc2626, secondary: 0xa855f7, accent: 0xfecaca, darkness: 0x1f0712 },
  { key: 'bossLeviathan', primary: 0x06b6d4, secondary: 0x2563eb, accent: 0xbae6fd, darkness: 0x082f49 },
  { key: 'bossVoid', primary: 0x8b5cf6, secondary: 0x020617, accent: 0xf0abfc, darkness: 0x09051a },
  { key: 'bossMantis', primary: 0x14b8a6, secondary: 0xfacc15, accent: 0xccfbf1, darkness: 0x042f2e },
  { key: 'bossOni', primary: 0xf97316, secondary: 0x7f1d1d, accent: 0xfef3c7, darkness: 0x1c0a05 },
  { key: 'bossFrostQueen', primary: 0x7dd3fc, secondary: 0xe0f2fe, accent: 0xffffff, darkness: 0x082f49 },
];

export function getBossTheme(key: string): BossTheme {
  return BOSS_THEMES.find((theme) => theme.key === key) ?? BOSS_THEMES[0];
}
