import type { GateOption, PlayerStats } from '../types/GameTypes';
import { getModuleProfile, getRarityProfile } from './WeaponEvolution';

export function applyGateEffect(stats: PlayerStats, gate: GateOption): PlayerStats {
  const next = { ...stats };

  switch (gate.kind) {
    case 'add':
      next.weaponCount = Math.max(1, next.weaponCount + gate.value);
      break;
    case 'multiply':
      next.weaponCount = Math.max(1, Math.min(80, next.weaponCount * gate.value));
      break;
    case 'subtract':
      next.weaponCount = Math.max(1, next.weaponCount - gate.value);
      break;
    case 'level':
      next.level += gate.value;
      next.fireRate = Math.min(4, next.fireRate + 0.2);
      break;
    case 'power':
      next.power = Math.min(40, next.power + gate.value);
      break;
    case 'element':
      next.element = gate.element ?? next.element;
      next.power = Math.min(40, next.power + Math.max(1, gate.value));
      next.tier += 1;
      next.synergy += next.modules.length > 0 ? 2 : 1;
      break;
    case 'tier':
      next.tier += gate.value;
      next.level += Math.max(1, Math.floor(gate.value / 2));
      next.fireRate = Math.min(5, next.fireRate + 0.15);
      break;
    case 'rapid':
      next.fireRate = Math.min(5, next.fireRate + gate.value * 0.25);
      next.power = Math.min(40, next.power + 1);
      break;
    case 'archetype':
      next.archetype = gate.archetype ?? next.archetype;
      next.tier += 1;
      next.power = Math.min(40, next.power + gate.value);
      next.synergy += 1;
      break;
    case 'module':
      if (gate.module) {
        const profile = getModuleProfile(gate.module);
        const alreadyOwned = next.modules.includes(gate.module);
        next.modules = alreadyOwned ? next.modules : [...next.modules, gate.module].slice(-6);
        next.power = Math.min(40, next.power + profile.powerBonus + (alreadyOwned ? 1 : 0));
        next.fireRate = Math.min(5, Math.max(0.8, next.fireRate + profile.fireBonus));
        next.critRate = Math.min(0.45, next.critRate + (gate.module === 'critical' ? 0.08 : 0.015));
        next.pierce = Math.min(4, next.pierce + (gate.module === 'pierce' ? 1 : 0));
        next.shield = Math.min(5, next.shield + (gate.module === 'shield' ? 1 : 0));
        next.synergy += alreadyOwned ? 2 : 1;
      }
      break;
    case 'rarity':
      next.rarity = gate.rarity ?? next.rarity;
      next.power = Math.min(40, next.power + Math.round(getRarityProfile(next.rarity).multiplier * 2));
      next.tier += 1;
      next.synergy += 2;
      break;
    case 'fusion':
      next.level += 1;
      next.tier += gate.value;
      next.power = Math.min(40, next.power + gate.value + next.modules.length);
      next.fireRate = Math.min(5, next.fireRate + 0.18);
      next.critRate = Math.min(0.45, next.critRate + 0.03);
      next.synergy += 3;
      break;
    default:
      break;
  }

  if (gate.kind === 'add' && gate.value > 0) {
    next.weaponCount = Math.min(80, next.weaponCount);
    next.fireRate = Math.min(4, next.fireRate + 0.05);
  }

  return next;
}

export function applyEnemyImpact(stats: PlayerStats): PlayerStats {
  const next = { ...stats };
  next.weaponCount = Math.max(1, next.weaponCount - 3);
  next.power = Math.max(1, next.power - 1);
  next.fireRate = Math.max(0.8, next.fireRate - 0.1);
  next.shield = Math.max(0, next.shield - 1);
  return next;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
