import { getEnemyVariant } from './EnemyCatalog';
import { getModuleByIndex, getModuleProfile } from './WeaponEvolution';
import type { GateOption, StageStep } from '../types/GameTypes';

export const INITIAL_STEP_INTERVAL = 650;
export const LOOP_STEP_INTERVAL = 820;
export const BOSS_STEP_INTERVAL = 10;

const goodColors = [0x22c55e, 0x38bdf8, 0x818cf8, 0x14b8a6, 0xa855f7, 0xfacc15];
const premiumColors = [0xfb923c, 0x7dd3fc, 0xfef08a, 0xc084fc, 0xf0abfc, 0x99f6e4];
const badColors = [0xef4444, 0xf43f5e, 0xdc2626];

export const OPENING_STEPS: StageStep[] = [
  {
    time: 700,
    gateLine: {
      y: -80,
      left: { label: '+6', kind: 'add', value: 6, color: 0x22c55e, good: true },
      right: { label: '+3', kind: 'add', value: 3, color: 0x38bdf8, good: true },
    },
  },
  {
    time: 2500,
    gateLine: {
      y: -80,
      left: { label: '×2', kind: 'multiply', value: 2, color: 0x818cf8, good: true },
      right: { label: '-4', kind: 'subtract', value: 4, color: 0xef4444, good: false },
    },
    enemies: [
      { x: 250, y: -170, hp: 10, variantId: 'ember-imp' },
      { x: 150, y: -230, hp: 10, variantId: 'storm-bat' },
    ],
  },
  {
    time: 4600,
    gateLine: {
      y: -80,
      left: { label: 'ATK +5', kind: 'power', value: 5, color: 0xfb923c, good: true },
      right: { label: '分裂MOD', kind: 'module', value: 1, color: 0xa855f7, good: true, module: 'split' },
    },
    enemies: [
      { x: 120, y: -190, hp: 14, variantId: 'frost-wisp' },
      { x: 205, y: -260, hp: 22, variantId: 'iron-golem' },
    ],
  },
];

export function createLoopStep(stepIndex: number, difficulty: number): StageStep {
  const gateLine = stepIndex % 5 === 0 ? createGateLine(stepIndex) : undefined;
  const variant = getEnemyVariant(stepIndex);
  const secondVariant = getEnemyVariant(stepIndex + 7);
  const troubleVariants = [
    'toxic-vial',
    'shock-coil',
    'hex-mirror',
    'frost-chain',
    'rust-bomb',
    'neon-razor',
    'photo-berry-drone',
    'photo-ice-lens',
    'photo-brass-scarab',
    'photo-toxic-vial',
    'photo-neon-razor',
    'photo-hex-mirror',
    'photo-berry-brute',
    'photo-crystal-lens',
    'photo-gold-scarab',
    'photo-violet-stinger',
    'photo-chrome-mantis',
  ];
  const dangerVariant = stepIndex % 13 === 9
    ? troubleVariants[Math.floor(stepIndex / 13) % troubleVariants.length]
    : stepIndex % 11 === 6
      ? 'void-gatekeeper'
      : stepIndex % 7 === 3
        ? 'doom-reaper'
        : stepIndex % 5 === 2
          ? 'red-comet'
          : undefined;
  const lanes = [92, 148, 205, 258, 310];
  const lane = lanes[stepIndex % lanes.length];
  const hp = Math.round((22 + stepIndex * 3.4 + difficulty * 14 + Math.max(0, difficulty - 3) ** 2 * 1.6) * variant.hpScale);
  const enemyCount = stepIndex < 3 ? 2 : 3 + Math.min(2, Math.floor(difficulty / 2));
  const enemies = Array.from({ length: enemyCount }, (_, index) => {
    const selectedVariant = index === 0 && dangerVariant ? dangerVariant : index === 0 ? variant.id : secondVariant.id;
    const x = lanes[(stepIndex + index * 2) % lanes.length];
    const y = -170 - index * 72 - (stepIndex % 2) * 28;
    const scale = index === 0 && dangerVariant ? 2.2 : 1 + index * 0.28;
    return {
      x,
      y,
      hp: Math.round(hp * scale),
      variantId: selectedVariant,
    };
  });

  return {
    time: 0,
    gateLine,
    enemy: {
      x: lane,
      y: -190 - (stepIndex % 3) * 36,
      hp,
      variantId: variant.id,
    },
    enemies,
  };
}

export function createBossHp(loopIndex: number, playerPressure = 0): number {
  const lateBossBonus = Math.max(0, loopIndex - 1) * 950;
  const baseHp = 2600 + loopIndex * 1450 + lateBossBonus + loopIndex * loopIndex * 620;
  const adaptiveMultiplier = 1 + Math.min(4.5, playerPressure / 280);
  const adaptiveFlat = Math.max(0, playerPressure) * (28 + loopIndex * 5);
  return Math.round(baseHp * adaptiveMultiplier + adaptiveFlat);
}

function createGateLine(stepIndex: number): StageStep['gateLine'] {
  const pattern = stepIndex % 8;
  const goodA = goodColors[stepIndex % goodColors.length];
  const goodB = goodColors[(stepIndex + 3) % goodColors.length];
  const bad = badColors[stepIndex % badColors.length];

  const goodOptions: GateOption[] = [
    { label: `+${6 + (stepIndex % 7)}`, kind: 'add', value: 6 + (stepIndex % 7), color: goodA, good: true },
    { label: '×2', kind: 'multiply', value: 2, color: goodB, good: true },
    { label: `ATK +${3 + (stepIndex % 5)}`, kind: 'power', value: 3 + (stepIndex % 5), color: goodA, good: true },
    { label: '耐久 +1', kind: 'heal', value: 1, color: 0xfda4af, good: true },
    { label: 'Lv +1', kind: 'level', value: 1, color: goodB, good: true },
    { label: '連射 +', kind: 'rapid', value: 1, color: goodA, good: true },
    { label: '進化 +', kind: 'tier', value: 1, color: goodB, good: true },
    createModuleGate(stepIndex),
    { label: '融合 +', kind: 'fusion', value: 2, color: premiumColors[stepIndex % premiumColors.length], good: true },
  ];

  const badOption: GateOption = {
    label: `-${4 + (stepIndex % 8)}`,
    kind: 'subtract',
    value: 4 + (stepIndex % 8),
    color: bad,
    good: false,
  };

  if (pattern === 0 || pattern === 3 || pattern === 6) {
    return { y: -80, left: goodOptions[stepIndex % goodOptions.length], right: badOption };
  }

  return {
    y: -80,
    left: goodOptions[stepIndex % goodOptions.length],
    right: goodOptions[(stepIndex + 2) % goodOptions.length],
  };
}

function createModuleGate(stepIndex: number): GateOption {
  const module = getModuleByIndex(stepIndex);

  return {
    label: `${getModuleProfile(module).label}MOD`,
    kind: 'module',
    value: 1,
    color: premiumColors[(stepIndex + 2) % premiumColors.length],
    good: true,
    module,
  };
}
