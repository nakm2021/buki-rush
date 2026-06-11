export type WeaponElement = 'neutral' | 'fire' | 'ice' | 'thunder' | 'wind' | 'light' | 'shadow' | 'crystal';

export type GateKind = 'add' | 'multiply' | 'subtract' | 'level' | 'power' | 'element' | 'tier' | 'rapid';

export interface PlayerStats {
  weaponCount: number;
  power: number;
  level: number;
  fireRate: number;
  element: WeaponElement;
  tier: number;
}

export interface GateOption {
  label: string;
  kind: GateKind;
  value: number;
  color: number;
  good: boolean;
  element?: WeaponElement;
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
}

export interface EnemyVariant {
  id: string;
  name: string;
  bodyColor: number;
  accentColor: number;
  coreColor: number;
  shape: 'orb' | 'horn' | 'wing' | 'slime' | 'golem' | 'wisp' | 'wyrm' | 'mask';
  hpScale: number;
  radius: number;
}
