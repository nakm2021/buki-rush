export type WeaponElement = 'neutral' | 'fire' | 'ice' | 'thunder' | 'wind' | 'light' | 'shadow' | 'crystal';

export type WeaponArchetype = string;

export type WeaponModule = string;

export type WeaponRarity = 'common' | 'rare' | 'epic' | 'legend' | 'mythic';

export type GateKind = 'add' | 'multiply' | 'subtract' | 'level' | 'power' | 'heal' | 'element' | 'tier' | 'rapid' | 'archetype' | 'module' | 'rarity' | 'fusion';

export interface PlayerStats {
  weaponCount: number;
  power: number;
  level: number;
  fireRate: number;
  element: WeaponElement;
  archetype: WeaponArchetype;
  modules: WeaponModule[];
  rarity: WeaponRarity;
  tier: number;
  critRate: number;
  pierce: number;
  shield: number;
  synergy: number;
}

export interface GateOption {
  label: string;
  kind: GateKind;
  value: number;
  color: number;
  good: boolean;
  element?: WeaponElement;
  archetype?: WeaponArchetype;
  module?: WeaponModule;
  rarity?: WeaponRarity;
}

export interface GateLine {
  y: number;
  left: GateOption;
  right: GateOption;
}

export interface StageStep {
  time: number;
  gateLine?: GateLine;
  enemy?: { x: number; y: number; hp?: number; variantId?: string };
  enemies?: Array<{ x: number; y: number; hp?: number; variantId?: string }>;
  obstacle?: { x: number; y: number; width: number; height: number };
}

export interface GameResult {
  title: string;
  subtitle: string;
  weaponCount: number;
  power: number;
  level: number;
  distance: number;
  bestDistance: number;
  weaponName: string;
  medals: number;
  defeatedBosses: number;
  totalBosses: number;
  relics: string[];
  codexBosses: number;
  codexWeapons: number;
}

export interface EnemyVariant {
  id: string;
  name: string;
  bodyColor: number;
  accentColor: number;
  coreColor: number;
  shape: 'orb' | 'horn' | 'wing' | 'slime' | 'golem' | 'wisp' | 'wyrm' | 'mask' | 'beast' | 'knight' | 'plant' | 'spider';
  hpScale: number;
  radius: number;
  damage: number;
  imageKey?: string;
  lethal?: boolean;
}
