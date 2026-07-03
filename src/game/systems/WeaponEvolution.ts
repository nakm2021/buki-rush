import type { PlayerStats, StarterWeapon, WeaponArchetype, WeaponElement, WeaponModule, WeaponRarity } from '../types/GameTypes';

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

export interface WeaponEvolutionBranch {
  id: string;
  title: string;
  subtitle: string;
  module: WeaponModule;
  archetype?: WeaponArchetype;
  element?: WeaponElement;
  imageKey?: string;
  specialStyle?: 'anchor' | 'basilisk' | 'rune' | 'phoenix' | 'storm' | 'frost' | 'nova' | 'blade';
  power: number;
  fireRate: number;
  critRate: number;
  pierce: number;
  shield: number;
  synergy: number;
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
  { archetype: 'falcon', label: '隼', names: ['Falcon', 'Talon', 'Skyline', 'Raptor'], shotSpread: 0.86, damageBonus: 1.16 },
  { archetype: 'hydra', label: '蛇', names: ['Hydra', 'Serpent', 'Viper', 'Orochi'], shotSpread: 1.55, damageBonus: 0.96 },
  { archetype: 'atlas', label: '巨', names: ['Atlas', 'Titan', 'Colossus', 'Fortress'], shotSpread: 0.7, damageBonus: 1.5 },
  { archetype: 'lotus', label: '蓮', names: ['Lotus', 'Bloom', 'Petal', 'Mandala'], shotSpread: 1.32, damageBonus: 1.02 },
  { archetype: 'vortex', label: '渦', names: ['Vortex', 'Spiral', 'Maelstrom', 'Gyre'], shotSpread: 1.7, damageBonus: 0.93 },
  { archetype: 'needle', label: '針', names: ['Needle', 'Stinger', 'Pinpoint', 'Wasper'], shotSpread: 0.32, damageBonus: 1.62 },
  { archetype: 'hammer', label: '槌', names: ['Hammer', 'Breaker', 'Crusher', 'Mjolnir'], shotSpread: 0.82, damageBonus: 1.52 },
  { archetype: 'mirror', label: '鏡', names: ['Mirror', 'Reflector', 'Prism', 'Kaleido'], shotSpread: 1.22, damageBonus: 1.08 },
  { archetype: 'sakura', label: '桜', names: ['Sakura', 'Petal', 'Hanami', 'Bloomstorm'], shotSpread: 1.38, damageBonus: 1.0 },
  { archetype: 'anchor', label: '錨', names: ['Anchor', 'Harpoon', 'Tide', 'Leviathan'], shotSpread: 0.62, damageBonus: 1.44 },
  { archetype: 'pulse', label: '波', names: ['Pulse', 'Echo', 'Resonance', 'Heartbeat'], shotSpread: 1.05, damageBonus: 1.24 },
  { archetype: 'meteor', label: '隕', names: ['Meteor', 'Impact', 'Crater', 'Extinction'], shotSpread: 1.14, damageBonus: 1.34 },
  { archetype: 'wolf', label: '狼', names: ['Wolf', 'Fang', 'Howl', 'Lupus'], shotSpread: 0.92, damageBonus: 1.2 },
  { archetype: 'wasp', label: '蜂', names: ['Wasp', 'Hornet', 'Swarm', 'Hiveking'], shotSpread: 1.42, damageBonus: 1.05 },
  { archetype: 'monarch', label: '王', names: ['Monarch', 'Crown', 'Regalia', 'Sovereign'], shotSpread: 1.0, damageBonus: 1.36 },
  { archetype: 'phantom', label: '幻', names: ['Phantom', 'Mirage', 'Specter', 'Ghostline'], shotSpread: 1.26, damageBonus: 1.12 },
  { archetype: 'gigas', label: '轟', names: ['Gigas', 'Roar', 'Dreadnought', 'Worldbreaker'], shotSpread: 0.68, damageBonus: 1.65 },
  { archetype: 'seraph', label: '天', names: ['Seraph', 'Feather', 'Sanctus', 'Archangel'], shotSpread: 1.1, damageBonus: 1.28 },
  { archetype: 'onyx', label: '黒', names: ['Onyx', 'Obsidian', 'Blackstar', 'Nightcore'], shotSpread: 0.95, damageBonus: 1.31 },
  { archetype: 'topaz', label: '黄', names: ['Topaz', 'Amber', 'Citrine', 'Sunshard'], shotSpread: 1.18, damageBonus: 1.13 },
  { archetype: 'rune', label: '符', names: ['Rune', 'Glyph', 'Sigil', 'Codex'], shotSpread: 1.0, damageBonus: 1.22 },
  { archetype: 'chrono', label: '時', names: ['Chrono', 'Clock', 'Epoch', 'Aeon'], shotSpread: 0.88, damageBonus: 1.39 },
  { archetype: 'nebula', label: '雲', names: ['Nebula', 'Cosmos', 'Galaxy', 'Deepfield'], shotSpread: 1.48, damageBonus: 1.06 },
  { archetype: 'pegasus', label: '翼', names: ['Pegasus', 'Wing', 'Aerohoof', 'Skyrider'], shotSpread: 1.2, damageBonus: 1.14 },
  { archetype: 'basilisk', label: '毒', names: ['Basilisk', 'Venom', 'Gaze', 'Medusa'], shotSpread: 0.78, damageBonus: 1.42 },
  { archetype: 'levin', label: '迅', names: ['Levin', 'Flash', 'Blink', 'Lightspeed'], shotSpread: 0.9, damageBonus: 1.23 },
  { archetype: 'magnum', label: '銃', names: ['Magnum', 'Revolver', 'Barrel', 'Deadeye'], shotSpread: 0.48, damageBonus: 1.58 },
  { archetype: 'saber', label: '剣', names: ['Saber', 'Cutlass', 'Katana', 'Excalibur'], shotSpread: 0.7, damageBonus: 1.46 },
  { archetype: 'chimera', label: '獣', names: ['Chimera', 'Beast', 'Hybrid', 'Mythos'], shotSpread: 1.35, damageBonus: 1.17 },
  { archetype: 'aurora', label: '極', names: ['Aurora', 'Curtain', 'Borealis', 'Polarflare'], shotSpread: 1.24, damageBonus: 1.11 },
  { archetype: 'dragon', label: '竜', names: ['Dragon', 'Drake', 'Wyrmfire', 'Bahamut'], shotSpread: 1.12, damageBonus: 1.48 },
  { archetype: 'samurai', label: '侍', names: ['Samurai', 'Ronin', 'Iaido', 'Shogun'], shotSpread: 0.58, damageBonus: 1.54 },
  { archetype: 'oracle', label: '預', names: ['Oracle', 'Prophet', 'Vision', 'Fatewriter'], shotSpread: 1.02, damageBonus: 1.3 },
  { archetype: 'geode', label: '鉱', names: ['Geode', 'Shard', 'Cluster', 'Coremine'], shotSpread: 1.16, damageBonus: 1.25 },
  { archetype: 'tempest', label: '嵐', names: ['Tempest', 'Squall', 'Cyclone', 'Stormlord'], shotSpread: 1.62, damageBonus: 0.98 },
  { archetype: 'phoenix', label: '鳳', names: ['Phoenix', 'Ashwing', 'Rebirth', 'Solarbird'], shotSpread: 1.06, damageBonus: 1.38 },
  { archetype: 'kraken', label: '海', names: ['Kraken', 'Tentacle', 'Abyssal', 'Tsunami'], shotSpread: 1.5, damageBonus: 1.08 },
  { archetype: 'centaur', label: '駆', names: ['Centaur', 'Gallop', 'Javelin', 'Sagitta'], shotSpread: 0.76, damageBonus: 1.33 },
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
  { module: 'scatter', label: '散弾', powerBonus: 1, fireBonus: 0.18 },
  { module: 'burst', label: '爆裂', powerBonus: 3, fireBonus: 0.04 },
  { module: 'laser', label: '光線', powerBonus: 4, fireBonus: -0.02 },
  { module: 'mine', label: '地雷', powerBonus: 2, fireBonus: 0.02 },
  { module: 'aegis', label: '盾壁', powerBonus: 1, fireBonus: 0.03 },
  { module: 'rift', label: '裂隙', powerBonus: 3, fireBonus: 0.08 },
  { module: 'echo', label: '反響', powerBonus: 2, fireBonus: 0.14 },
  { module: 'flare', label: '閃光', powerBonus: 2, fireBonus: 0.17 },
  { module: 'gravity', label: '重力', powerBonus: 4, fireBonus: -0.04 },
  { module: 'nova-core', label: '星核', powerBonus: 5, fireBonus: -0.08 },
  { module: 'bladebit', label: '刃片', powerBonus: 3, fireBonus: 0.09 },
  { module: 'rapid-drum', label: '弾倉', powerBonus: 1, fireBonus: 0.32 },
  { module: 'sniper', label: '狙撃', powerBonus: 5, fireBonus: -0.12 },
  { module: 'drill', label: '穿孔', powerBonus: 4, fireBonus: 0.01 },
  { module: 'barrier', label: '結界', powerBonus: 1, fireBonus: 0.06 },
  { module: 'homing', label: '追尾', powerBonus: 2, fireBonus: 0.11 },
  { module: 'mirror-shot', label: '鏡弾', powerBonus: 2, fireBonus: 0.16 },
  { module: 'booster', label: '推進', powerBonus: 1, fireBonus: 0.28 },
  { module: 'reactor', label: '炉心', powerBonus: 5, fireBonus: 0 },
  { module: 'poison', label: '毒牙', powerBonus: 3, fireBonus: 0.07 },
  { module: 'freeze', label: '凍結', powerBonus: 3, fireBonus: 0.05 },
  { module: 'volt', label: '電導', powerBonus: 3, fireBonus: 0.12 },
  { module: 'repair', label: '修復', powerBonus: 1, fireBonus: 0.02 },
  { module: 'berserk', label: '狂化', powerBonus: 6, fireBonus: -0.1 },
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

const DEFAULT_EVOLUTION_BRANCHES: WeaponEvolutionBranch[] = [
  { id: 'core-overdrive', title: 'CORE OVERDRIVE', subtitle: '基礎性能を大きく底上げ', module: 'reactor', power: 5, fireRate: 0.08, critRate: 0.025, pierce: 0, shield: 1, synergy: 3 },
  { id: 'rapid-arsenal', title: 'RAPID ARSENAL', subtitle: '弾数と連射を強化', module: 'rapid-drum', power: 2, fireRate: 0.22, critRate: 0.01, pierce: 0, shield: 0, synergy: 4 },
  { id: 'pierce-driver', title: 'PIERCE DRIVER', subtitle: '貫通と一点火力を強化', module: 'drill', power: 6, fireRate: -0.02, critRate: 0.035, pierce: 1, shield: 0, synergy: 2 },
];

const EVOLUTION_BRANCHES: Record<string, WeaponEvolutionBranch[]> = {
  phoenix: [
    { id: 'phoenix-rebirth', title: 'REBIRTH WING', subtitle: '回復と炎上を伸ばす不死鳥進化', module: 'repair', archetype: 'phoenix', power: 4, fireRate: 0.1, critRate: 0.02, pierce: 0, shield: 2, synergy: 4 },
    { id: 'solar-barrage', title: 'SOLAR BARRAGE', subtitle: '炎弾幕で画面を焼く', module: 'flare', archetype: 'meteor', power: 6, fireRate: 0.16, critRate: 0.02, pierce: 0, shield: 0, synergy: 3 },
    { id: 'ash-saber', title: 'ASH SABER', subtitle: '火力と会心に寄せる刃進化', module: 'bladebit', archetype: 'saber', power: 7, fireRate: 0.02, critRate: 0.055, pierce: 1, shield: 0, synergy: 2 },
  ],
  lance: [
    { id: 'zero-lance', title: 'ZERO LANCE', subtitle: '凍結と貫通を伸ばす', module: 'freeze', archetype: 'lance', power: 5, fireRate: 0.04, critRate: 0.025, pierce: 1, shield: 1, synergy: 3 },
    { id: 'aurora-field', title: 'AURORA FIELD', subtitle: '広範囲制圧と防御を強化', module: 'barrier', archetype: 'aurora', power: 3, fireRate: 0.12, critRate: 0.01, pierce: 0, shield: 2, synergy: 5 },
    { id: 'geode-shard', title: 'GEODE SHARD', subtitle: '結晶片を重ねる高火力進化', module: 'drill', archetype: 'geode', power: 7, fireRate: 0, critRate: 0.035, pierce: 1, shield: 0, synergy: 3 },
  ],
  rail: [
    { id: 'tesla-rail', title: 'TESLA RAIL', subtitle: '雷撃と連鎖を伸ばす', module: 'volt', archetype: 'rail', power: 5, fireRate: 0.12, critRate: 0.025, pierce: 1, shield: 0, synergy: 3 },
    { id: 'storm-array', title: 'STORM ARRAY', subtitle: '弾幕数と速度を伸ばす', module: 'scatter', archetype: 'tempest', power: 3, fireRate: 0.24, critRate: 0.015, pierce: 0, shield: 0, synergy: 5 },
    { id: 'deadeye-line', title: 'DEADEYE LINE', subtitle: '一点突破の狙撃進化', module: 'sniper', archetype: 'magnum', power: 8, fireRate: -0.05, critRate: 0.06, pierce: 2, shield: 0, synergy: 2 },
  ],
  basilisk: [
    { id: 'venom-gaze', title: 'VENOM GAZE', subtitle: '毒と呪いで削る', module: 'poison', archetype: 'basilisk', power: 4, fireRate: 0.1, critRate: 0.02, pierce: 0, shield: 0, synergy: 5 },
    { id: 'void-phantom', title: 'VOID PHANTOM', subtitle: '影弾と回避不能圧を伸ばす', module: 'rift', archetype: 'phantom', power: 6, fireRate: 0.08, critRate: 0.035, pierce: 1, shield: 0, synergy: 3 },
    { id: 'onyx-chimera', title: 'ONYX CHIMERA', subtitle: '高耐久の異形進化', module: 'berserk', archetype: 'chimera', power: 8, fireRate: -0.04, critRate: 0.03, pierce: 0, shield: 2, synergy: 2 },
  ],
  anchor: [
    { id: 'kraken-anchor', title: 'KRAKEN ANCHOR', subtitle: '重撃と海裂を伸ばす', module: 'gravity', archetype: 'kraken', power: 7, fireRate: -0.02, critRate: 0.03, pierce: 1, shield: 1, synergy: 3 },
    { id: 'atlas-breaker', title: 'ATLAS BREAKER', subtitle: '一撃火力と装甲を伸ばす', module: 'focus', archetype: 'atlas', power: 9, fireRate: -0.08, critRate: 0.04, pierce: 0, shield: 2, synergy: 2 },
    { id: 'tide-hammer', title: 'TIDE HAMMER', subtitle: '広範囲叩きつけ進化', module: 'mine', archetype: 'hammer', power: 6, fireRate: 0.06, critRate: 0.015, pierce: 0, shield: 1, synergy: 4 },
  ],
};

export const RANDOM_EVOLUTION_BRANCHES: WeaponEvolutionBranch[] = [
  { id: 'celestial-balance-bow', title: 'CELESTIAL BALANCE', subtitle: '均整弓。全距離に対応する万能射撃', module: 'homing', archetype: 'centaur', element: 'light', imageKey: 'weaponCelestialBalanceBow', specialStyle: 'nova', power: 5, fireRate: 0.13, critRate: 0.025, pierce: 1, shield: 1, synergy: 5 },
  { id: 'scarlet-speed-saber', title: 'SCARLET SPEED', subtitle: '高速剣。斬撃と連射で押し切る', module: 'booster', archetype: 'saber', element: 'fire', imageKey: 'weaponScarletSpeedSaber', specialStyle: 'blade', power: 6, fireRate: 0.2, critRate: 0.045, pierce: 1, shield: 0, synergy: 4 },
  { id: 'void-guardian-cannon', title: 'VOID GUARDIAN', subtitle: '守護砲。重い一撃と盾で耐える', module: 'aegis', archetype: 'atlas', element: 'shadow', imageKey: 'weaponVoidGuardianCannon', specialStyle: 'anchor', power: 9, fireRate: -0.07, critRate: 0.02, pierce: 0, shield: 3, synergy: 3 },
  { id: 'lotus-aegis-bloom', title: 'LOTUS AEGIS', subtitle: '蓮華盾。回復と結界で崩れにくい', module: 'repair', archetype: 'lotus', element: 'crystal', imageKey: 'weaponLotusAegisBloom', specialStyle: 'rune', power: 4, fireRate: 0.11, critRate: 0.015, pierce: 0, shield: 3, synergy: 6 },
  { id: 'emerald-orbit-harp', title: 'EMERALD ORBIT', subtitle: '翠星琴。旋回弾と反響で面制圧', module: 'echo', archetype: 'orbit', element: 'wind', imageKey: 'weaponEmeraldOrbitHarp', specialStyle: 'nova', power: 5, fireRate: 0.19, critRate: 0.02, pierce: 1, shield: 1, synergy: 6 },
  { id: 'garnet-breaker-axe', title: 'GARNET BREAKER', subtitle: '紅玉斧。鈍重だが装甲を割る重撃', module: 'berserk', archetype: 'hammer', element: 'fire', imageKey: 'weaponGarnetBreakerAxe', specialStyle: 'anchor', power: 10, fireRate: -0.12, critRate: 0.04, pierce: 1, shield: 1, synergy: 2 },
  { id: 'jade-storm-fan', title: 'JADE STORM', subtitle: '翠嵐扇。高速風刃で弾幕を散らす', module: 'booster', archetype: 'tempest', element: 'wind', imageKey: 'weaponJadeStormFan', specialStyle: 'storm', power: 5, fireRate: 0.23, critRate: 0.03, pierce: 1, shield: 0, synergy: 5 },
  { id: 'solar-venom-needle', title: 'SOLAR VENOM', subtitle: '陽毒針。毒と炎で継続ダメージ', module: 'poison', archetype: 'basilisk', element: 'fire', imageKey: 'weaponSolarVenomNeedle', specialStyle: 'basilisk', power: 6, fireRate: 0.12, critRate: 0.025, pierce: 2, shield: 0, synergy: 4 },
  { id: 'ichigo-balance-bow', title: 'ICHIGO BALANCE', subtitle: '苺弓。弓形エネルギーで万能射撃', module: 'homing', archetype: 'centaur', element: 'light', imageKey: 'weaponIchigoBalanceBow', specialStyle: 'nova', power: 5, fireRate: 0.14, critRate: 0.03, pierce: 1, shield: 1, synergy: 5 },
  { id: 'ichigo-speed-saber', title: 'ICHIGO SABER', subtitle: '苺閃刀。斬撃速度を極める', module: 'bladebit', archetype: 'saber', element: 'fire', imageKey: 'weaponIchigoSpeedSaber', specialStyle: 'blade', power: 7, fireRate: 0.18, critRate: 0.05, pierce: 1, shield: 0, synergy: 4 },
  { id: 'ichigo-rocket-cannon', title: 'ICHIGO ROCKET', subtitle: '苺砲。ロケット弾で押し込む', module: 'burst', archetype: 'rail', element: 'fire', imageKey: 'weaponIchigoRocketCannon', specialStyle: 'storm', power: 8, fireRate: 0.02, critRate: 0.025, pierce: 1, shield: 0, synergy: 3 },
  { id: 'ichigo-aegis-shield', title: 'ICHIGO AEGIS', subtitle: '苺盾砲。守りと反撃を両立', module: 'aegis', archetype: 'lotus', element: 'crystal', imageKey: 'weaponIchigoAegisShield', specialStyle: 'rune', power: 4, fireRate: 0.1, critRate: 0.015, pierce: 0, shield: 4, synergy: 6 },
  { id: 'ichigo-curse-needle', title: 'ICHIGO CURSE', subtitle: '苺呪針。毒と呪いで削る', module: 'poison', archetype: 'basilisk', element: 'shadow', imageKey: 'weaponIchigoCurseNeedle', specialStyle: 'basilisk', power: 6, fireRate: 0.11, critRate: 0.025, pierce: 2, shield: 0, synergy: 5 },
  { id: 'ichigo-pierce-lance', title: 'ICHIGO PIERCE', subtitle: '苺穿槍。一直線に貫く突破型', module: 'drill', archetype: 'lance', element: 'fire', imageKey: 'weaponIchigoPierceLance', specialStyle: 'phoenix', power: 8, fireRate: 0.03, critRate: 0.035, pierce: 3, shield: 0, synergy: 3 },
  { id: 'grape-balance-bow', title: 'GRAPE BALANCE', subtitle: '葡萄弓。精密誘導と会心で安定制圧', module: 'homing', archetype: 'centaur', element: 'light', imageKey: 'weaponGrapeBalanceBow', specialStyle: 'nova', power: 6, fireRate: 0.13, critRate: 0.04, pierce: 1, shield: 1, synergy: 5 },
  { id: 'grape-speed-saber', title: 'GRAPE SABER', subtitle: '葡萄剣。溜めた刃で一気に断つ', module: 'bladebit', archetype: 'saber', element: 'shadow', imageKey: 'weaponGrapeSpeedSaber', specialStyle: 'blade', power: 7, fireRate: 0.18, critRate: 0.055, pierce: 1, shield: 0, synergy: 4 },
  { id: 'grape-rocket-cannon', title: 'GRAPE ROCKET', subtitle: '葡萄砲。雷光ロケットでBOSSを穿つ', module: 'volt', archetype: 'rail', element: 'thunder', imageKey: 'weaponGrapeRocketCannon', specialStyle: 'storm', power: 8, fireRate: 0.04, critRate: 0.035, pierce: 2, shield: 0, synergy: 4 },
  { id: 'grape-aegis-shield', title: 'GRAPE AEGIS', subtitle: '葡萄盾。蔓の結界で耐えて反撃', module: 'aegis', archetype: 'lotus', element: 'crystal', imageKey: 'weaponGrapeAegisShield', specialStyle: 'rune', power: 5, fireRate: 0.09, critRate: 0.02, pierce: 0, shield: 4, synergy: 6 },
  { id: 'grape-curse-needle', title: 'GRAPE CURSE', subtitle: '葡萄呪針。毒と影を濃く重ねる', module: 'poison', archetype: 'basilisk', element: 'shadow', imageKey: 'weaponGrapeCurseNeedle', specialStyle: 'basilisk', power: 7, fireRate: 0.1, critRate: 0.03, pierce: 2, shield: 0, synergy: 5 },
  { id: 'grape-pierce-lance', title: 'GRAPE PIERCE', subtitle: '葡萄穿槍。ドリル状の貫通突破型', module: 'drill', archetype: 'lance', element: 'shadow', imageKey: 'weaponGrapePierceLance', specialStyle: 'frost', power: 9, fireRate: 0.0, critRate: 0.04, pierce: 3, shield: 0, synergy: 3 },
  { id: 'moon-guillotine', title: 'MOON GUILLOTINE', subtitle: '月光の大鎌剣。会心斬撃で押し切る', module: 'bladebit', archetype: 'saber', element: 'shadow', imageKey: 'weaponMoonGuillotine', specialStyle: 'blade', power: 7, fireRate: 0.02, critRate: 0.055, pierce: 1, shield: 0, synergy: 3 },
  { id: 'solar-dragon-rail', title: 'SOLAR DRAGON RAIL', subtitle: '太陽竜の軌道砲。高火力の雷火線', module: 'laser', archetype: 'rail', element: 'fire', imageKey: 'weaponSolarDragonRail', specialStyle: 'storm', power: 8, fireRate: -0.03, critRate: 0.035, pierce: 2, shield: 0, synergy: 2 },
  { id: 'quantum-bloom-staff', title: 'QUANTUM BLOOM', subtitle: '花弁結界の杖。守りながら制圧する', module: 'barrier', archetype: 'rune', element: 'light', imageKey: 'weaponQuantumBloomStaff', specialStyle: 'rune', power: 4, fireRate: 0.14, critRate: 0.015, pierce: 0, shield: 2, synergy: 5 },
  { id: 'abyss-needle-launcher', title: 'ABYSS NEEDLE', subtitle: '深淵の毒針砲。毒と影で削り続ける', module: 'poison', archetype: 'needle', element: 'shadow', imageKey: 'weaponAbyssNeedleLauncher', specialStyle: 'basilisk', power: 6, fireRate: 0.1, critRate: 0.025, pierce: 1, shield: 0, synergy: 4 },
  { id: 'titan-orbit-hammer', title: 'TITAN ORBIT', subtitle: '重力ハンマー。重い一撃と装甲を伸ばす', module: 'gravity', archetype: 'hammer', element: 'crystal', imageKey: 'weaponTitanOrbitHammer', specialStyle: 'anchor', power: 9, fireRate: -0.08, critRate: 0.03, pierce: 0, shield: 2, synergy: 3 },
  { id: 'prism-comet-bow', title: 'PRISM COMET', subtitle: '彗星弓。広域プリズム弾で掃討する', module: 'mirror-shot', archetype: 'comet', element: 'crystal', imageKey: 'weaponPrismCometBow', specialStyle: 'nova', power: 5, fireRate: 0.16, critRate: 0.035, pierce: 1, shield: 0, synergy: 4 },
  { id: 'crimson-meteor-katana', title: 'CRIMSON METEOR', subtitle: '隕鉄刀。炎の斬撃と会心を伸ばす', module: 'flare', archetype: 'samurai', element: 'fire', imageKey: 'weaponCrimsonMeteorKatana', specialStyle: 'blade', power: 8, fireRate: 0.04, critRate: 0.06, pierce: 1, shield: 0, synergy: 3 },
  { id: 'azure-tempest-chakram', title: 'AZURE TEMPEST', subtitle: '暴風輪。連射と雷撃で弾幕を作る', module: 'volt', archetype: 'tempest', element: 'thunder', imageKey: 'weaponAzureTempestChakram', specialStyle: 'storm', power: 5, fireRate: 0.2, critRate: 0.025, pierce: 1, shield: 0, synergy: 5 },
  { id: 'verdant-seraph-crossbow', title: 'VERDANT SERAPH', subtitle: '聖樹弩。回復と結界で粘り強く戦う', module: 'repair', archetype: 'seraph', element: 'light', imageKey: 'weaponVerdantSeraphCrossbow', specialStyle: 'rune', power: 4, fireRate: 0.12, critRate: 0.02, pierce: 1, shield: 2, synergy: 5 },
  { id: 'obsidian-gravity-cannon', title: 'OBSIDIAN GRAVITY', subtitle: '重力砲。鈍重だがBOSS火力が高い', module: 'nova-core', archetype: 'gigas', element: 'shadow', imageKey: 'weaponObsidianGravityCannon', specialStyle: 'anchor', power: 10, fireRate: -0.1, critRate: 0.035, pierce: 0, shield: 2, synergy: 2 },
  { id: 'sakura-mirror-fans', title: 'SAKURA MIRROR', subtitle: '鏡扇。反射花弁で広範囲を制圧する', module: 'mirror-shot', archetype: 'sakura', element: 'crystal', imageKey: 'weaponSakuraMirrorFans', specialStyle: 'nova', power: 5, fireRate: 0.18, critRate: 0.035, pierce: 1, shield: 0, synergy: 5 },
  { id: 'chrono-needle-spear', title: 'CHRONO NEEDLE', subtitle: '時針槍。貫通と遅延で敵を止める', module: 'sniper', archetype: 'chrono', element: 'thunder', imageKey: 'weaponChronoNeedleSpear', specialStyle: 'storm', power: 7, fireRate: 0.02, critRate: 0.05, pierce: 2, shield: 0, synergy: 3 },
  { id: 'nebula-harp-launcher', title: 'NEBULA HARP', subtitle: '星弦ランチャー。広域必殺と連射を伸ばす', module: 'echo', archetype: 'nebula', element: 'light', imageKey: 'weaponNebulaHarpLauncher', specialStyle: 'nova', power: 5, fireRate: 0.18, critRate: 0.025, pierce: 1, shield: 0, synergy: 6 },
  { id: 'magma-drill-trident', title: 'MAGMA DRILL', subtitle: '溶岩三叉槍。貫通と炎上に特化', module: 'drill', archetype: 'lance', element: 'fire', imageKey: 'weaponMagmaDrillTrident', specialStyle: 'phoenix', power: 8, fireRate: 0.02, critRate: 0.035, pierce: 2, shield: 0, synergy: 3 },
  { id: 'crystal-lotus-shieldgun', title: 'CRYSTAL LOTUS', subtitle: '結晶盾砲。守りと回復の進化', module: 'aegis', archetype: 'lotus', element: 'crystal', imageKey: 'weaponCrystalLotusShieldgun', specialStyle: 'rune', power: 4, fireRate: 0.1, critRate: 0.015, pierce: 0, shield: 3, synergy: 5 },
];

const EVOLUTION_POOLS_BY_STARTER: Record<string, string[]> = {
  'balance-bow': ['ichigo-balance-bow', 'grape-balance-bow', 'celestial-balance-bow', 'emerald-orbit-harp', 'prism-comet-bow', 'verdant-seraph-crossbow', 'quantum-bloom-staff', 'sakura-mirror-fans', 'moon-guillotine', 'solar-dragon-rail', 'abyss-needle-launcher', 'titan-orbit-hammer', 'crimson-meteor-katana', 'azure-tempest-chakram', 'obsidian-gravity-cannon', 'magma-drill-trident', 'crystal-lotus-shieldgun', 'lotus-aegis-bloom', 'jade-storm-fan', 'solar-venom-needle', 'garnet-breaker-axe', 'grape-speed-saber', 'grape-rocket-cannon', 'grape-aegis-shield', 'grape-curse-needle', 'grape-pierce-lance'],
  'slash-speed': ['ichigo-speed-saber', 'grape-speed-saber', 'scarlet-speed-saber', 'jade-storm-fan', 'moon-guillotine', 'crimson-meteor-katana', 'azure-tempest-chakram', 'chrono-needle-spear', 'magma-drill-trident'],
  'cannon-barrage': ['ichigo-rocket-cannon', 'grape-rocket-cannon', 'solar-dragon-rail', 'obsidian-gravity-cannon', 'nebula-harp-launcher', 'prism-comet-bow', 'azure-tempest-chakram', 'void-guardian-cannon', 'emerald-orbit-harp'],
  'guard-aegis': ['ichigo-aegis-shield', 'grape-aegis-shield', 'void-guardian-cannon', 'garnet-breaker-axe', 'titan-orbit-hammer', 'crystal-lotus-shieldgun', 'lotus-aegis-bloom', 'quantum-bloom-staff', 'verdant-seraph-crossbow'],
  'venom-curse': ['ichigo-curse-needle', 'grape-curse-needle', 'solar-venom-needle', 'abyss-needle-launcher', 'moon-guillotine', 'obsidian-gravity-cannon', 'chrono-needle-spear', 'nebula-harp-launcher', 'void-guardian-cannon'],
  'burst-pierce': ['ichigo-pierce-lance', 'grape-pierce-lance', 'garnet-breaker-axe', 'magma-drill-trident', 'chrono-needle-spear', 'solar-dragon-rail', 'crimson-meteor-katana', 'prism-comet-bow', 'scarlet-speed-saber'],
};

export function getEvolutionBranches(_stats: PlayerStats, starterId = 'balance-bow'): WeaponEvolutionBranch[] {
  const poolIds = EVOLUTION_POOLS_BY_STARTER[starterId] ?? EVOLUTION_POOLS_BY_STARTER['balance-bow'];
  const branches = poolIds
    .map((id) => RANDOM_EVOLUTION_BRANCHES.find((branch) => branch.id === id))
    .filter((branch): branch is WeaponEvolutionBranch => Boolean(branch));
  return branches.length > 0 ? branches : RANDOM_EVOLUTION_BRANCHES;
}

export function getEvolutionBranch(id?: string): WeaponEvolutionBranch | undefined {
  if (!id) {
    return undefined;
  }
  return RANDOM_EVOLUTION_BRANCHES.find((branch) => branch.id === id)
    ?? Object.values(EVOLUTION_BRANCHES).flat().find((branch) => branch.id === id)
    ?? DEFAULT_EVOLUTION_BRANCHES.find((branch) => branch.id === id);
}

export function applyWeaponEvolutionBranch(stats: PlayerStats, branch: WeaponEvolutionBranch, evolutionCount: number): PlayerStats {
  const modules = stats.modules.includes(branch.module) ? stats.modules : [...stats.modules, branch.module];
  const rarity: WeaponRarity = evolutionCount >= 6 ? 'mythic' : evolutionCount >= 4 ? 'legend' : evolutionCount >= 2 ? 'epic' : 'rare';
  return {
    ...stats,
    element: branch.element ?? stats.element,
    archetype: branch.archetype ?? stats.archetype,
    rarity,
    modules,
    level: stats.level + 2,
    tier: stats.tier + 1,
    power: stats.power + branch.power + Math.ceil(evolutionCount / 2),
    fireRate: Math.max(0.75, stats.fireRate + branch.fireRate),
    critRate: Math.min(0.58, stats.critRate + branch.critRate),
    pierce: stats.pierce + branch.pierce,
    shield: stats.shield + branch.shield,
    synergy: stats.synergy + branch.synergy,
  };
}

export interface WeaponCategory {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  color: number;
}

export const WEAPON_CATEGORIES: WeaponCategory[] = [
  { id: 'balance-bow', title: 'バランス弓型', subtitle: '万能・誘導・会心の標準型', detail: '扱いやすい射撃武器が中心。雑魚処理、BOSS削り、アイテム回収のどれも崩れにくい。', color: 0x38bdf8 },
  { id: 'slash-speed', title: '斬撃スピード型', subtitle: '高速斬撃・会心・接近制圧', detail: '剣や刀の斬撃でテンポよく削る型。硬い敵より、数で押す敵や素早い敵を捌きやすい。', color: 0xfacc15 },
  { id: 'cannon-barrage', title: '砲撃ラッシュ型', subtitle: '重火力・弾幕・BOSS圧', detail: 'ロケットやレール砲で正面を押しつぶす型。BOSSや大型敵に強いが、細かい回避はやや苦手。', color: 0xfb923c },
  { id: 'guard-aegis', title: '耐久ガード型', subtitle: '盾・回復・粘り勝ち', detail: '守りと反撃を軸に長く戦う型。事故に強く、状態異常や弾幕が多いステージで安定しやすい。', color: 0x7dd3fc },
  { id: 'venom-curse', title: '毒呪い技巧型', subtitle: '毒・遅延・継続ダメージ', detail: '状態異常でじわじわ削る技巧型。硬い敵や厄介な敵に強いが、瞬間火力は武器ごとに差がある。', color: 0x8b5cf6 },
  { id: 'burst-pierce', title: '貫通バースト型', subtitle: '槍・ドリル・一点突破', detail: '貫通と一撃火力で直線上の敵をまとめて抜く型。BOSSの攻撃相殺にも向いている。', color: 0x99f6e4 },
];

function createStarterStats(
  element: WeaponElement,
  archetype: WeaponArchetype,
  power: number,
  fireRate: number,
  modules: WeaponModule[] = [],
  extra: Partial<PlayerStats> = {},
): PlayerStats {
  return {
    weaponCount: 1,
    power,
    level: 1,
    fireRate,
    element,
    archetype,
    modules,
    rarity: extra.rarity ?? 'common',
    tier: extra.tier ?? 1,
    critRate: extra.critRate ?? 0.04,
    pierce: extra.pierce ?? 0,
    shield: extra.shield ?? 0,
    synergy: extra.synergy ?? 0,
  };
}

export const STARTER_WEAPONS: StarterWeapon[] = [
  { id: 'ichigo-balance-bow', categoryId: 'balance-bow', title: 'ICHIGO BALANCE', subtitle: '苺弓。万能射撃で安定', detail: '属性: 光 / 得意: 雑魚の群れ、初見BOSS / 戦い方: 画面中央を維持し、弓形弾を広く当てながら安全に育てる。', attributeLabel: '光・万能', strongAgainst: '雑魚群、遠距離BOSS、弾の薄い相手', strategy: '癖が少ないので、アイテム回収と回避を優先して長く伸ばす。必殺は苺系の溜め会心。', weakness: '尖った瞬間火力は専門武器に劣る。', element: 'light', archetype: 'centaur', imageKey: 'weaponIchigoBalanceBow', color: 0xfb7185, stats: createStarterStats('light', 'centaur', 5, 1.04, ['homing'], { critRate: 0.07, pierce: 1, synergy: 3 }) },
  { id: 'grape-balance-bow', categoryId: 'balance-bow', title: 'GRAPE BALANCE', subtitle: '葡萄弓。会心寄りの安定型', detail: '属性: 光 / 得意: 動く敵、分散した敵 / 戦い方: 誘導と会心で削り、必殺は溜めて葡萄の一撃を叩き込む。', attributeLabel: '光・会心', strongAgainst: '回避しながら迫る敵、分散配置の敵', strategy: '無理に正面へ出ず、誘導弾で安全に削る。会心系アイテムと相性がいい。', weakness: '直線貫通火力は控えめ。', element: 'light', archetype: 'centaur', imageKey: 'weaponGrapeBalanceBow', color: 0x8b5cf6, stats: createStarterStats('light', 'centaur', 6, 1.03, ['homing'], { critRate: 0.08, pierce: 1, synergy: 4 }) },
  { id: 'kiji-feather-bow', categoryId: 'balance-bow', title: 'KIJI FEATHER', subtitle: '雉羽弓。軽快な追尾弾', detail: '属性: 風 / 得意: 高速雑魚、横移動する敵 / 戦い方: 風の追尾弾で動く敵を捕まえ、軽い連射で数を減らす。', attributeLabel: '風・追尾', strongAgainst: '素早い敵、横に逃げる敵、低耐久の群れ', strategy: '動き回りながら撃ち続ける。連射と会心を伸ばすと軽快に化ける。', weakness: '重装BOSSへの一撃は弱め。', element: 'wind', archetype: 'falcon', imageKey: 'weaponKijiFeatherBow', color: 0x22c55e, stats: createStarterStats('wind', 'falcon', 5, 1.14, ['homing'], { critRate: 0.075, pierce: 1, synergy: 3 }) },
  { id: 'ruri-azure-lance', categoryId: 'burst-pierce', title: 'RURI AZURE', subtitle: '瑠璃槍。美しい一点突破', detail: '属性: 晶 / 得意: 縦に並ぶ敵、装甲持ち / 戦い方: 瑠璃色の貫通線で正面を抜く。BOSS攻撃の相殺にも強い。', attributeLabel: '晶・貫通', strongAgainst: '直線配置、装甲敵、BOSS弾', strategy: '敵の列に正面を合わせる。貫通と攻撃力を伸ばすほど分かりやすく強い。', weakness: '横に広い群れは苦手。', element: 'crystal', archetype: 'lance', imageKey: 'weaponRuriAzureLance', color: 0x2563eb, stats: createStarterStats('crystal', 'lance', 8, 0.94, ['drill'], { critRate: 0.07, pierce: 3, synergy: 2 }) },
  { id: 'ichigo-speed-saber', categoryId: 'slash-speed', title: 'ICHIGO SABER', subtitle: '苺閃刀。高速斬撃', detail: '属性: 火 / 得意: 低中耐久の群れ、近距離BOSS / 戦い方: 斬撃でテンポよく削り、苺必殺で会心の一撃を狙う。', attributeLabel: '火・斬撃', strongAgainst: '密集雑魚、素早い敵、低耐久BOSS', strategy: '攻撃回数と会心を伸ばす。正面維持より、避けながら削る動きが強い。', weakness: '弾幕相殺力は砲撃型に劣る。', element: 'fire', archetype: 'saber', imageKey: 'weaponIchigoSpeedSaber', color: 0xfb7185, stats: createStarterStats('fire', 'saber', 7, 1.1, ['bladebit'], { critRate: 0.1, pierce: 1, synergy: 3 }) },
  { id: 'grape-speed-saber', categoryId: 'slash-speed', title: 'GRAPE SABER', subtitle: '葡萄剣。影の会心斬り', detail: '属性: 影 / 得意: 厄介な中型敵、BOSS削り / 戦い方: 影の斬撃で削り、溜め必殺で大きく割る。', attributeLabel: '影・会心', strongAgainst: '中型敵、硬めの雑魚、BOSS', strategy: '会心と攻撃力を優先。必殺は安全な位置で溜め切る。', weakness: '序盤の雑魚処理はやや忙しい。', element: 'shadow', archetype: 'saber', imageKey: 'weaponGrapeSpeedSaber', color: 0xa855f7, stats: createStarterStats('shadow', 'saber', 7, 1.08, ['bladebit'], { critRate: 0.11, pierce: 1, synergy: 3 }) },
  { id: 'jo-tan-salt-blade', categoryId: 'slash-speed', title: 'JO-TAN SALT', subtitle: '上タン塩刃。塩晶の切断', detail: '属性: 火 / 得意: 斬れる雑魚、突進敵 / 戦い方: 塩晶の斬撃で前方を切り払い、会心で一気に削る。', attributeLabel: '火・料理刃', strongAgainst: '突進敵、軽装雑魚、短期戦BOSS', strategy: '会心、連射、攻撃力を伸ばす。被弾しない距離で切り続ける。', weakness: '長期戦の耐久は低め。', element: 'fire', archetype: 'samurai', imageKey: 'weaponJoTanSaltBlade', color: 0xfacc15, stats: createStarterStats('fire', 'samurai', 8, 1.02, ['critical'], { critRate: 0.13, pierce: 1, synergy: 2 }) },
  { id: 'moon-guillotine', categoryId: 'slash-speed', title: 'MOON GUILLOTINE', subtitle: '月光鎌。広い斬撃線', detail: '属性: 影 / 得意: 横に広い敵、BOSS取り巻き / 戦い方: 鎌の広い斬撃で周囲を巻き込み、会心で削る。', attributeLabel: '影・大鎌', strongAgainst: '横並びの敵、取り巻き召喚、影に弱い敵', strategy: '攻撃範囲と会心を伸ばす。取り巻きを消しながらBOSSに当て続ける。', weakness: '一点突破は槍型ほど鋭くない。', element: 'shadow', archetype: 'saber', imageKey: 'weaponMoonGuillotine', color: 0xc084fc, stats: createStarterStats('shadow', 'saber', 7, 0.98, ['bladebit'], { critRate: 0.12, pierce: 1, synergy: 3 }) },
  { id: 'ichigo-rocket-cannon', categoryId: 'cannon-barrage', title: 'ICHIGO ROCKET', subtitle: '苺ロケット。爆発弾幕', detail: '属性: 火 / 得意: 大型BOSS、まとまった敵 / 戦い方: 正面火力で押し込み、苺必殺をBOSSへ合わせる。', attributeLabel: '火・爆裂', strongAgainst: '大型BOSS、密集敵、低速弾幕', strategy: '正面を取り続ける。攻撃力と弾数を伸ばすとBOSS戦が安定する。', weakness: '細かい横移動の敵には当てにくい。', element: 'fire', archetype: 'rail', imageKey: 'weaponIchigoRocketCannon', color: 0xfb923c, stats: createStarterStats('fire', 'rail', 8, 0.96, ['burst'], { critRate: 0.065, pierce: 2, synergy: 2 }) },
  { id: 'rocket-launcher-barrage', categoryId: 'cannon-barrage', title: 'ROCKET BARRAGE', subtitle: '重ロケラン。純粋火力', detail: '属性: 火 / 得意: BOSS、装甲敵、弾幕相殺 / 戦い方: 重いロケットで敵弾ごと押し返す。', attributeLabel: '火・重砲', strongAgainst: 'BOSS、装甲敵、丸弾/菱形弾', strategy: '攻撃力と貫通を優先。移動より位置取りで正面を取る。', weakness: '連射が遅く、取りこぼしやすい。', element: 'fire', archetype: 'magnum', imageKey: 'weaponRocketLauncherBarrage', color: 0xef4444, stats: createStarterStats('fire', 'magnum', 10, 0.86, ['burst'], { critRate: 0.075, pierce: 2, synergy: 2 }) },
  { id: 'tonkotsu-ramen-cannon', categoryId: 'cannon-barrage', title: 'TONKOTSU CORE', subtitle: 'とんこつ砲。濃厚制圧', detail: '属性: 光 / 得意: 群れ、持久戦、回復が欲しい場面 / 戦い方: 濃厚な弾幕で押し、MODで粘りを伸ばす。', attributeLabel: '光・制圧', strongAgainst: '群れ、長期戦、じわじわ迫る敵', strategy: '弾数と盾を伸ばす。危険な敵を先に削りながら中央を守る。', weakness: '瞬間火力はロケランより低い。', element: 'light', archetype: 'blaster', imageKey: 'weaponTonkotsuRamenCannon', color: 0xfef3c7, stats: createStarterStats('light', 'blaster', 7, 1.0, ['repair'], { critRate: 0.055, shield: 1, synergy: 4 }) },
  { id: 'sns-signal-spear', categoryId: 'cannon-barrage', title: 'SNS SIGNAL', subtitle: '通知槍。連鎖拡散', detail: '属性: 雷 / 得意: 分散した敵、連鎖で削れる群れ / 戦い方: 通知弾をばらまき、雷の溜め必殺で締める。', attributeLabel: '雷・連鎖', strongAgainst: '分散雑魚、素早い敵、低耐久の群れ', strategy: '連射と会心を伸ばす。BOSS戦では弾幕相殺も意識する。', weakness: '単体への重い一撃は専門砲より控えめ。', element: 'thunder', archetype: 'pulse', imageKey: 'weaponSnsSignalSpear', color: 0x38bdf8, stats: createStarterStats('thunder', 'pulse', 6, 1.12, ['echo'], { critRate: 0.075, pierce: 1, synergy: 5 }) },
  { id: 'ichigo-aegis-shield', categoryId: 'guard-aegis', title: 'ICHIGO AEGIS', subtitle: '苺盾砲。守りの基本', detail: '属性: 晶 / 得意: 弾幕BOSS、事故が多い場面 / 戦い方: 盾と回復で耐え、苺必殺で反撃する。', attributeLabel: '晶・盾', strongAgainst: '弾幕BOSS、状態異常敵、長期戦', strategy: '盾と耐久を伸ばして粘る。焦らず生存を最優先にする。', weakness: '序盤火力は控えめ。', element: 'crystal', archetype: 'lotus', imageKey: 'weaponIchigoAegisShield', color: 0x7dd3fc, stats: createStarterStats('crystal', 'lotus', 5, 0.95, ['aegis'], { critRate: 0.045, shield: 4, synergy: 5 }) },
  { id: 'grape-aegis-shield', categoryId: 'guard-aegis', title: 'GRAPE AEGIS', subtitle: '葡萄盾。蔓の結界', detail: '属性: 晶 / 得意: 持久戦、毒や呪いを撒く敵 / 戦い方: 結界で耐え、葡萄必殺の一撃に繋げる。', attributeLabel: '晶・結界', strongAgainst: '長期戦、状態異常敵、取り巻きBOSS', strategy: '盾とシナジーを伸ばす。必殺ゲージを大切に使う。', weakness: '派手な瞬間火力は溜め必殺依存。', element: 'crystal', archetype: 'lotus', imageKey: 'weaponGrapeAegisShield', color: 0x8b5cf6, stats: createStarterStats('crystal', 'lotus', 5, 0.94, ['aegis'], { critRate: 0.05, shield: 4, synergy: 6 }) },
  { id: 'poseidon-trident-cannon', categoryId: 'guard-aegis', title: 'POSEIDON TRIDENT', subtitle: '海神槍。波と守護', detail: '属性: 氷 / 得意: 弾幕、直線BOSS、押し寄せる敵 / 戦い方: 波のような貫通と守りで、敵弾を抑えながら進む。', attributeLabel: '氷・海神', strongAgainst: '弾幕BOSS、直線配置、押し寄せる群れ', strategy: '貫通と盾を両方伸ばす。守りながらBOSSへ圧をかける。', weakness: '横に散った敵にはやや時間がかかる。', element: 'ice', archetype: 'anchor', imageKey: 'weaponPoseidonTridentCannon', color: 0x38bdf8, stats: createStarterStats('ice', 'anchor', 8, 0.9, ['barrier'], { critRate: 0.06, pierce: 2, shield: 3, synergy: 4 }) },
  { id: 'crystal-lotus-shieldgun', categoryId: 'guard-aegis', title: 'CRYSTAL LOTUS', subtitle: '結晶盾砲。回復守備', detail: '属性: 晶 / 得意: 長期戦、事故回避 / 戦い方: 回復と盾で崩れにくい盤面を作る。', attributeLabel: '晶・回復', strongAgainst: '長期戦、持続ダメージ、取り巻き戦', strategy: '耐久を伸ばして堅実に進む。攻撃力アイテムも忘れず拾う。', weakness: 'BOSSを倒す速度は遅め。', element: 'crystal', archetype: 'lotus', imageKey: 'weaponCrystalLotusShieldgun', color: 0x99f6e4, stats: createStarterStats('crystal', 'lotus', 5, 0.96, ['repair'], { critRate: 0.05, shield: 3, synergy: 5 }) },
  { id: 'ichigo-curse-needle', categoryId: 'venom-curse', title: 'ICHIGO CURSE', subtitle: '苺呪針。毒と呪い', detail: '属性: 影 / 得意: 硬い敵、厄介な中型 / 戦い方: 状態異常で削り、苺必殺の一撃で仕留める。', attributeLabel: '影・毒', strongAgainst: '硬い雑魚、中型敵、回避しにくい敵', strategy: '毒、会心、貫通を伸ばす。即殺より継続ダメージで優位を取る。', weakness: '初速火力は控えめ。', element: 'shadow', archetype: 'basilisk', imageKey: 'weaponIchigoCurseNeedle', color: 0xfb7185, stats: createStarterStats('shadow', 'basilisk', 6, 0.98, ['poison'], { critRate: 0.07, pierce: 2, synergy: 5 }) },
  { id: 'grape-curse-needle', categoryId: 'venom-curse', title: 'GRAPE CURSE', subtitle: '葡萄呪針。濃い毒影', detail: '属性: 影 / 得意: BOSS、硬い雑魚、毒が効く敵 / 戦い方: 毒を重ね、葡萄必殺で大きく削る。', attributeLabel: '影・濃毒', strongAgainst: 'BOSS、硬い敵、状態異常に弱い敵', strategy: 'シナジーと貫通を伸ばす。長期戦になるほど味が出る。', weakness: '軽い雑魚の大群には処理が遅れることがある。', element: 'shadow', archetype: 'basilisk', imageKey: 'weaponGrapeCurseNeedle', color: 0x8b5cf6, stats: createStarterStats('shadow', 'basilisk', 7, 0.96, ['poison'], { critRate: 0.075, pierce: 2, synergy: 6 }) },
  { id: 'abyss-needle-launcher', categoryId: 'venom-curse', title: 'ABYSS NEEDLE', subtitle: '深淵針砲。影の削り', detail: '属性: 影 / 得意: 高耐久敵、遠距離BOSS / 戦い方: 影針を当て続け、毒と貫通で体力を削る。', attributeLabel: '影・針砲', strongAgainst: '高耐久敵、遠距離BOSS、遅い敵', strategy: '正面維持で毒針を重ねる。貫通を伸ばすとかなり強い。', weakness: '素早い敵には外しやすい。', element: 'shadow', archetype: 'needle', imageKey: 'weaponAbyssNeedleLauncher', color: 0x6d28d9, stats: createStarterStats('shadow', 'needle', 7, 0.95, ['poison'], { critRate: 0.08, pierce: 2, synergy: 4 }) },
  { id: 'solar-venom-needle', categoryId: 'venom-curse', title: 'SOLAR VENOM', subtitle: '陽毒針。燃える継続毒', detail: '属性: 火 / 得意: 再生系、硬い敵 / 戦い方: 炎と毒で継続ダメージを重ねる。', attributeLabel: '火・毒', strongAgainst: '再生系、硬い雑魚、長期戦BOSS', strategy: '毒と火力を両立。逃げながら継続ダメージを稼ぐ。', weakness: '一撃で敵を止める力は低め。', element: 'fire', archetype: 'basilisk', imageKey: 'weaponSolarVenomNeedle', color: 0xfb923c, stats: createStarterStats('fire', 'basilisk', 6, 1.0, ['poison'], { critRate: 0.07, pierce: 2, synergy: 4 }) },
  { id: 'ichigo-pierce-lance', categoryId: 'burst-pierce', title: 'ICHIGO PIERCE', subtitle: '苺穿槍。直線突破', detail: '属性: 火 / 得意: 縦並び、BOSS弾相殺 / 戦い方: 正面を合わせて貫通弾を通し、苺必殺で仕上げる。', attributeLabel: '火・貫通', strongAgainst: '縦並び、BOSS弾、装甲敵', strategy: '敵の列に軸を合わせる。攻撃力と貫通を拾うほど強い。', weakness: '横広がりの敵は苦手。', element: 'fire', archetype: 'lance', imageKey: 'weaponIchigoPierceLance', color: 0xfb7185, stats: createStarterStats('fire', 'lance', 8, 0.94, ['drill'], { critRate: 0.075, pierce: 3, synergy: 3 }) },
  { id: 'grape-pierce-lance', categoryId: 'burst-pierce', title: 'GRAPE PIERCE', subtitle: '葡萄穿槍。影ドリル', detail: '属性: 影 / 得意: 高耐久BOSS、直線敵 / 戦い方: 影の貫通で削り、葡萄必殺で割る。', attributeLabel: '影・ドリル', strongAgainst: 'BOSS、装甲敵、縦列雑魚', strategy: '貫通と会心を伸ばす。BOSSの正面で相殺しながら攻める。', weakness: '横移動する敵は追いづらい。', element: 'shadow', archetype: 'lance', imageKey: 'weaponGrapePierceLance', color: 0x8b5cf6, stats: createStarterStats('shadow', 'lance', 9, 0.9, ['drill'], { critRate: 0.08, pierce: 3, synergy: 3 }) },
  { id: 'magma-drill-trident', categoryId: 'burst-pierce', title: 'MAGMA DRILL', subtitle: '溶岩三叉槍。重貫通', detail: '属性: 火 / 得意: 装甲敵、BOSS、直線群れ / 戦い方: 重い貫通で正面を焼き抜く。', attributeLabel: '火・重貫通', strongAgainst: '装甲敵、直線群れ、大型BOSS', strategy: '攻撃力を伸ばして一撃を重くする。正面の取り方が重要。', weakness: '連射は遅め。', element: 'fire', archetype: 'lance', imageKey: 'weaponMagmaDrillTrident', color: 0xef4444, stats: createStarterStats('fire', 'lance', 9, 0.88, ['drill'], { critRate: 0.075, pierce: 3, synergy: 2 }) },
  { id: 'chrono-needle-spear', categoryId: 'burst-pierce', title: 'CHRONO NEEDLE', subtitle: '時針槍。雷の一点突破', detail: '属性: 雷 / 得意: BOSS、危険弾の相殺 / 戦い方: 雷針で正面を抜き、溜め必殺で大ダメージを狙う。', attributeLabel: '雷・時針', strongAgainst: 'BOSS弾、直線配置、高速BOSS', strategy: '貫通と会心を伸ばす。雷必殺はBOSS出現中に合わせたい。', weakness: '範囲処理は狭い。', element: 'thunder', archetype: 'chrono', imageKey: 'weaponChronoNeedleSpear', color: 0xfef08a, stats: createStarterStats('thunder', 'chrono', 8, 0.94, ['sniper'], { critRate: 0.1, pierce: 3, synergy: 3 }) },
];

export function getStarterWeapon(id?: string): StarterWeapon {
  return STARTER_WEAPONS.find((weapon) => weapon.id === id) ?? STARTER_WEAPONS[0];
}

export function getStarterWeaponsByCategory(categoryId: string): StarterWeapon[] {
  return STARTER_WEAPONS.filter((weapon) => weapon.categoryId === categoryId);
}
