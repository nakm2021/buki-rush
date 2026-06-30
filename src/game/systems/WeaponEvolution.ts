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
  'balance-bow': ['celestial-balance-bow', 'prism-comet-bow', 'verdant-seraph-crossbow', 'quantum-bloom-staff', 'sakura-mirror-fans', 'nebula-harp-launcher', 'moon-guillotine', 'solar-dragon-rail', 'abyss-needle-launcher', 'titan-orbit-hammer', 'crimson-meteor-katana', 'azure-tempest-chakram', 'obsidian-gravity-cannon', 'magma-drill-trident', 'crystal-lotus-shieldgun', 'lotus-aegis-bloom'],
  'slash-speed': ['scarlet-speed-saber', 'moon-guillotine', 'crimson-meteor-katana', 'azure-tempest-chakram', 'chrono-needle-spear', 'magma-drill-trident'],
  'cannon-barrage': ['solar-dragon-rail', 'obsidian-gravity-cannon', 'nebula-harp-launcher', 'prism-comet-bow', 'azure-tempest-chakram', 'void-guardian-cannon'],
  'guard-aegis': ['void-guardian-cannon', 'titan-orbit-hammer', 'crystal-lotus-shieldgun', 'lotus-aegis-bloom', 'quantum-bloom-staff', 'verdant-seraph-crossbow'],
  'venom-curse': ['abyss-needle-launcher', 'moon-guillotine', 'obsidian-gravity-cannon', 'chrono-needle-spear', 'nebula-harp-launcher', 'void-guardian-cannon'],
  'burst-pierce': ['magma-drill-trident', 'chrono-needle-spear', 'solar-dragon-rail', 'crimson-meteor-katana', 'prism-comet-bow', 'scarlet-speed-saber'],
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

function createStarterStats(element: WeaponElement, archetype: WeaponArchetype, power: number, fireRate: number): PlayerStats {
  return {
    weaponCount: 1,
    power,
    level: 1,
    fireRate,
    element,
    archetype,
    modules: [],
    rarity: 'common',
    tier: 1,
    critRate: 0.04,
    pierce: 0,
    shield: 0,
    synergy: 0,
  };
}

export const STARTER_WEAPONS: StarterWeapon[] = [
  { id: 'balance-bow', title: 'バランス弓型', subtitle: '全進化候補が混ざる万能系', detail: '弓・杖・砲・斬撃まで広く回るタイプ。迷ったらこれ。', element: 'neutral', archetype: 'centaur', imageKey: 'weaponCelestialBalanceBow', color: 0x38bdf8, stats: createStarterStats('neutral', 'centaur', 1, 1) },
  { id: 'slash-speed', title: '斬撃スピード型', subtitle: '剣・刀・高速輪が多い会心系', detail: '弾より斬撃寄り。手数、移動感、会心でBOSSを削る。', element: 'shadow', archetype: 'saber', imageKey: 'weaponScarletSpeedSaber', color: 0xfacc15, stats: createStarterStats('shadow', 'saber', 2, 0.98) },
  { id: 'cannon-barrage', title: '砲撃ラッシュ型', subtitle: 'レール砲・重力砲・弾幕系', detail: '遠距離火力と弾幕が中心。BOSSへの圧が強い。', element: 'fire', archetype: 'rail', imageKey: 'weaponSolarDragonRail', color: 0xfb923c, stats: createStarterStats('fire', 'rail', 2, 0.94) },
  { id: 'guard-aegis', title: '耐久ガード型', subtitle: '盾・結界・回復で粘る安定系', detail: '派手さより生存力。進むほど硬くなる守備タイプ。', element: 'crystal', archetype: 'lotus', imageKey: 'weaponLotusAegisBloom', color: 0x7dd3fc, stats: createStarterStats('crystal', 'lotus', 2, 0.88) },
  { id: 'venom-curse', title: '毒呪い技巧型', subtitle: '毒・影・遅延で削る厄介系', detail: '状態異常と特殊必殺が多め。強敵ほどじわじわ効く。', element: 'shadow', archetype: 'needle', imageKey: 'weaponAbyssNeedleLauncher', color: 0x8b5cf6, stats: createStarterStats('shadow', 'needle', 2, 0.92) },
  { id: 'burst-pierce', title: '貫通バースト型', subtitle: '槍・ドリル・高火力突破系', detail: '一撃と貫通を重視。硬い敵を正面から割る。', element: 'fire', archetype: 'lance', imageKey: 'weaponMagmaDrillTrident', color: 0x99f6e4, stats: createStarterStats('fire', 'lance', 3, 0.86) },
];

export function getStarterWeapon(id?: string): StarterWeapon {
  return STARTER_WEAPONS.find((weapon) => weapon.id === id) ?? STARTER_WEAPONS[0];
}
