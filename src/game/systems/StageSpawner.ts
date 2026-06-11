import { ENEMY_VARIANTS, getEnemyVariant } from './EnemyCatalog';
import { getArchetypeByIndex, getElementByIndex, getModuleByIndex, getRarityByIndex } from './WeaponEvolution';
import type { GateOption, StageStep } from '../types/GameTypes';

export const INITIAL_STEP_INTERVAL = 1800;
export const LOOP_STEP_INTERVAL = 1650;
export const BOSS_STEP_INTERVAL = 9;

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
    enemy: { x: 250, y: -170, hp: 10, variantId: 'ember-imp' },
  },
  {
    time: 4600,
    gateLine: {
      y: -80,
      left: { label: '火進化', kind: 'element', value: 2, color: 0xfb923c, good: true, element: 'fire' },
      right: { label: '分裂MOD', kind: 'module', value: 1, color: 0xa855f7, good: true, module: 'split' },
    },
    enemy: { x: 120, y: -190, hp: 14, variantId: 'frost-wisp' },
  },
];

export function createLoopStep(stepIndex: number, difficulty: number): StageStep {
  const gateLine = createGateLine(stepIndex);
  const variant = getEnemyVariant(stepIndex);
  const lane = [92, 148, 205, 258, 310][stepIndex % 5];
  const hp = Math.round((12 + stepIndex * 1.9 + difficulty * 7) * variant.hpScale);

  return {
    time: 0,
    gateLine,
    enemy: {
      x: lane,
      y: -190 - (stepIndex % 3) * 36,
      hp,
      variantId: variant.id,
    },
  };
}

export function createBossHp(loopIndex: number): number {
  return 240 + loopIndex * 80;
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
    { label: 'Lv +1', kind: 'level', value: 1, color: goodB, good: true },
    { label: '連射 +', kind: 'rapid', value: 1, color: goodA, good: true },
    { label: '進化 +', kind: 'tier', value: 1, color: goodB, good: true },
    createElementGate(stepIndex),
    createArchetypeGate(stepIndex),
    createModuleGate(stepIndex),
    createRarityGate(stepIndex),
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

function createElementGate(stepIndex: number): GateOption {
  const element = getElementByIndex(stepIndex);
  const labels = {
    fire: '火属性',
    ice: '氷属性',
    thunder: '雷属性',
    wind: '風属性',
    light: '光属性',
    shadow: '影属性',
    crystal: '晶属性',
    neutral: '無属性',
  };

  return {
    label: `${labels[element]}進化`,
    kind: 'element',
    value: 2,
    color: goodColors[(stepIndex + ENEMY_VARIANTS.length) % goodColors.length],
    good: true,
    element,
  };
}

function createArchetypeGate(stepIndex: number): GateOption {
  const archetype = getArchetypeByIndex(stepIndex);
  const labels = {
    blaster: '砲型',
    blade: '刃型',
    orbit: '環型',
    lance: '槍型',
    drone: '機型',
    rail: '軌型',
    nova: '星型',
    comet: '彗型',
  };

  return {
    label: labels[archetype],
    kind: 'archetype',
    value: 2,
    color: premiumColors[stepIndex % premiumColors.length],
    good: true,
    archetype,
  };
}

function createModuleGate(stepIndex: number): GateOption {
  const module = getModuleByIndex(stepIndex);
  const labels = {
    split: '分裂MOD',
    pierce: '貫通MOD',
    critical: '会心MOD',
    overclock: '過速MOD',
    shield: '装甲MOD',
    magnet: '吸引MOD',
    chain: '連鎖MOD',
    focus: '集中MOD',
  };

  return {
    label: labels[module],
    kind: 'module',
    value: 1,
    color: premiumColors[(stepIndex + 2) % premiumColors.length],
    good: true,
    module,
  };
}

function createRarityGate(stepIndex: number): GateOption {
  const rarity = getRarityByIndex(stepIndex);
  const labels = {
    common: 'C昇格',
    rare: 'R昇格',
    epic: 'SR昇格',
    legend: 'SSR昇格',
    mythic: 'UR昇格',
  };

  return {
    label: labels[rarity],
    kind: 'rarity',
    value: 1,
    color: premiumColors[(stepIndex + 4) % premiumColors.length],
    good: true,
    rarity,
  };
}
