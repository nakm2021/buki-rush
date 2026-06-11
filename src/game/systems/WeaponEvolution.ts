import type { PlayerStats, WeaponArchetype, WeaponElement, WeaponModule, WeaponRarity } from '../types/GameTypes';

interface ElementProfile {
  element: WeaponElement;
  label: string;
  names: string[];
  colors: { primary: number; secondary: number; bullet: number; aura: number };
}

interface ArchetypeProfile {
  archetype: WeaponArchetype;
  label: string;
  names: string[];
  shotSpread: number;
  damageBonus: number;
}

interface ModuleProfile {
  module: WeaponModule;
  label: string;
  powerBonus: number;
  fireBonus: number;
}

interface RarityProfile {
  rarity: WeaponRarity;
  label: string;
  color: number;
  multiplier: number;
}

export const ELEMENT_PROFILES: ElementProfile[] = [
  { element: 'neutral', label: '無', names: ['Runner', 'Twin', 'Burst', 'Nova', 'Orbit', 'Crown', 'Zenith', 'Omega'], colors: { primary: 0x38bdf8, secondary: 0x93c5fd, bullet: 0x67e8f9, aura: 0x0ea5e9 } },
  { element: 'fire', label: '火', names: ['Spark', 'Flare', 'Blaze', 'Inferno', 'Phoenix', 'Solar', 'Volcanic', 'Helios'], colors: { primary: 0xfb923c, secondary: 0xfacc15, bullet: 0xffedd5, aura: 0xef4444 } },
  { element: 'ice', label: '氷', names: ['Frost', 'Glacier', 'Crystal', 'Aurora', 'Zero', 'Polaris', 'Absolute', 'Nifl'], colors: { primary: 0x7dd3fc, secondary: 0xe0f2fe, bullet: 0xbae6fd, aura: 0x2563eb } },
  { element: 'thunder', label: '雷', names: ['Volt', 'Sparkline', 'Storm', 'Ion', 'Plasma', 'Raijin', 'Tesla', 'Judgment'], colors: { primary: 0xfef08a, secondary: 0x38bdf8, bullet: 0xfacc15, aura: 0xeab308 } },
  { element: 'wind', label: '風', names: ['Gale', 'Cyclone', 'Typhoon', 'Aero', 'Jet', 'Tempest', 'Sonic', 'Stratos'], colors: { primary: 0x86efac, secondary: 0x5eead4, bullet: 0xbbf7d0, aura: 0x10b981 } },
  { element: 'light', label: '光', names: ['Ray', 'Halo', 'Prism', 'Seraph', 'Stella', 'Radiant', 'Lucent', 'Eden'], colors: { primary: 0xfef3c7, secondary: 0xf0f9ff, bullet: 0xffffff, aura: 0xf59e0b } },
  { element: 'shadow', label: '影', names: ['Shade', 'Night', 'Umbra', 'Eclipse', 'Abyss', 'Noctis', 'Void', 'Ruin'], colors: { primary: 0x8b5cf6, secondary: 0x312e81, bullet: 0xc4b5fd, aura: 0x6d28d9 } },
  { element: 'crystal', label: '晶', names: ['Quartz', 'Opal', 'Gemini', 'Diamond', 'Arc', 'Mythril', 'Astra', 'Crown'], colors: { primary: 0x99f6e4, secondary: 0xf0abfc, bullet: 0xccfbf1, aura: 0x14b8a6 } },
];

export const ARCHETYPE_PROFILES: ArchetypeProfile[] = [
  { archetype: 'blaster', label: '砲', names: ['Blaster', 'Cannon', 'Barrage', 'Launcher'], shotSpread: 1.0, damageBonus: 1.0 },
  { archetype: 'blade', label: '刃', names: ['Blade', 'Edge', 'Ripper', 'Kaiser'], shotSpread: 0.75, damageBonus: 1.18 },
  { archetype: 'orbit', label: '環', names: ['Orbit', 'Ring', 'Halo', 'Satellite'], shotSpread: 1.25, damageBonus: 0.95 },
  { archetype: 'lance', label: '槍', names: ['Lance', 'Spear', 'Piercer', 'Needle'], shotSpread: 0.55, damageBonus: 1.32 },
  { archetype: 'drone', label: '機', names: ['Drone', 'Swarm', 'Hive', 'Colony'], shotSpread: 1.45, damageBonus: 0.9 },
  { archetype: 'rail', label: '軌', names: ['Rail', 'Vector', 'Line', 'Gauss'], shotSpread: 0.42, damageBonus: 1.45 },
  { archetype: 'nova', label: '星', names: ['Nova', 'Pulse', 'Quasar', 'Singularity'], shotSpread: 1.08, damageBonus: 1.2 },
  { archetype: 'comet', label: '彗', names: ['Comet', 'Meteor', 'Aster', 'Orbitfall'], shotSpread: 1.18, damageBonus: 1.1 },
];

export const MODULE_PROFILES: ModuleProfile[] = [
  { module: 'split', label: '分裂', powerBonus: 1, fireBonus: 0.15 },
  { module: 'pierce', label: '貫通', powerBonus: 2, fireBonus: 0 },
  { module: 'critical', label: '会心', powerBonus: 3, fireBonus: 0 },
  { module: 'overclock', label: '過速', powerBonus: 1, fireBonus: 0.35 },
  { module: 'shield', label: '装甲', powerBonus: 1, fireBonus: 0.05 },
  { module: 'magnet', label: '吸引', powerBonus: 1, fireBonus: 0.1 },
  { module: 'chain', label: '連鎖', powerBonus: 2, fireBonus: 0.12 },
  { module: 'focus', label: '集中', powerBonus: 4, fireBonus: -0.05 },
];

export const RARITY_PROFILES: RarityProfile[] = [
  { rarity: 'common', label: 'C', color: 0xe2e8f0, multiplier: 1 },
  { rarity: 'rare', label: 'R', color: 0x60a5fa, multiplier: 1.12 },
  { rarity: 'epic', label: 'SR', color: 0xc084fc, multiplier: 1.28 },
  { rarity: 'legend', label: 'SSR', color: 0xfacc15, multiplier: 1.5 },
  { rarity: 'mythic', label: 'UR', color: 0xfb7185, multiplier: 1.8 },
];

export function getElementProfile(element: WeaponElement): ElementProfile {
  return ELEMENT_PROFILES.find((profile) => profile.element === element) ?? ELEMENT_PROFILES[0];
}

export function getArchetypeProfile(archetype: WeaponArchetype): ArchetypeProfile {
  return ARCHETYPE_PROFILES.find((profile) => profile.archetype === archetype) ?? ARCHETYPE_PROFILES[0];
}

export function getModuleProfile(module: WeaponModule): ModuleProfile {
  return MODULE_PROFILES.find((profile) => profile.module === module) ?? MODULE_PROFILES[0];
}

export function getRarityProfile(rarity: WeaponRarity): RarityProfile {
  return RARITY_PROFILES.find((profile) => profile.rarity === rarity) ?? RARITY_PROFILES[0];
}

export function getWeaponName(stats: PlayerStats): string {
  const element = getElementProfile(stats.element);
  const archetype = getArchetypeProfile(stats.archetype);
  const rarity = getRarityProfile(stats.rarity);
  const tierIndex = Math.min(element.names.length - 1, Math.floor((stats.tier - 1) / 2));
  const formIndex = Math.min(archetype.names.length - 1, Math.floor((stats.level - 1) / 4));
  const moduleText = stats.modules.slice(-2).map((module) => getModuleProfile(module).label).join('/');
  const suffix = moduleText ? ` ${moduleText}` : '';
  return `${rarity.label} ${element.label}-${element.names[tierIndex]} ${archetype.names[formIndex]}${suffix}`;
}

export function getWeaponColors(stats: PlayerStats): ElementProfile['colors'] {
  return getElementProfile(stats.element).colors;
}

export function getWeaponPowerMultiplier(stats: PlayerStats): number {
  const rarity = getRarityProfile(stats.rarity).multiplier;
  const archetype = getArchetypeProfile(stats.archetype).damageBonus;
  const moduleBonus = 1 + stats.modules.length * 0.035 + stats.synergy * 0.025;
  return rarity * archetype * moduleBonus;
}

export function getShotSpread(stats: PlayerStats): number {
  return getArchetypeProfile(stats.archetype).shotSpread;
}

export function getBuildRank(stats: PlayerStats): number {
  return stats.level + stats.tier * 2 + stats.modules.length * 3 + stats.synergy + Math.floor(getRarityProfile(stats.rarity).multiplier * 10);
}

export function getElementByIndex(index: number): WeaponElement {
  const elementalProfiles = ELEMENT_PROFILES.filter((profile) => profile.element !== 'neutral');
  return elementalProfiles[index % elementalProfiles.length].element;
}

export function getArchetypeByIndex(index: number): WeaponArchetype {
  return ARCHETYPE_PROFILES[index % ARCHETYPE_PROFILES.length].archetype;
}

export function getModuleByIndex(index: number): WeaponModule {
  return MODULE_PROFILES[index % MODULE_PROFILES.length].module;
}

export function getRarityByIndex(index: number): WeaponRarity {
  const rarityRamp: WeaponRarity[] = ['rare', 'epic', 'rare', 'legend', 'epic', 'mythic'];
  return rarityRamp[index % rarityRamp.length];
}
