import type { GateOption, PlayerStats } from '../types/GameTypes';

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
  return next;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
