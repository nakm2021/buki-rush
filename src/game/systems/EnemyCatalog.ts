import type { EnemyVariant } from '../types/GameTypes';

export const ENEMY_VARIANTS: EnemyVariant[] = [
  { id: 'ember-imp', name: 'Ember Imp', bodyColor: 0xff6b35, accentColor: 0xffc857, coreColor: 0x3b1022, shape: 'horn', hpScale: 0.9, radius: 18 },
  { id: 'frost-wisp', name: 'Frost Wisp', bodyColor: 0x7dd3fc, accentColor: 0xe0f2fe, coreColor: 0x0f172a, shape: 'wisp', hpScale: 0.85, radius: 17 },
  { id: 'thorn-beast', name: 'Thorn Beast', bodyColor: 0x22c55e, accentColor: 0xbbf7d0, coreColor: 0x052e16, shape: 'horn', hpScale: 1.05, radius: 19 },
  { id: 'violet-eye', name: 'Violet Eye', bodyColor: 0xa855f7, accentColor: 0xf0abfc, coreColor: 0x1e103a, shape: 'orb', hpScale: 0.95, radius: 18 },
  { id: 'iron-golem', name: 'Iron Golem', bodyColor: 0x94a3b8, accentColor: 0xf8fafc, coreColor: 0x1e293b, shape: 'golem', hpScale: 1.35, radius: 21 },
  { id: 'shadow-mask', name: 'Shadow Mask', bodyColor: 0x4338ca, accentColor: 0xc4b5fd, coreColor: 0x020617, shape: 'mask', hpScale: 1.1, radius: 19 },
  { id: 'solar-mite', name: 'Solar Mite', bodyColor: 0xfacc15, accentColor: 0xffedd5, coreColor: 0x451a03, shape: 'wing', hpScale: 0.8, radius: 17 },
  { id: 'moon-slime', name: 'Moon Slime', bodyColor: 0x67e8f9, accentColor: 0xd8b4fe, coreColor: 0x083344, shape: 'slime', hpScale: 0.9, radius: 18 },
  { id: 'ruby-wyrm', name: 'Ruby Wyrm', bodyColor: 0xf43f5e, accentColor: 0xfda4af, coreColor: 0x450a0a, shape: 'wyrm', hpScale: 1.25, radius: 20 },
  { id: 'jade-wyrm', name: 'Jade Wyrm', bodyColor: 0x10b981, accentColor: 0xa7f3d0, coreColor: 0x064e3b, shape: 'wyrm', hpScale: 1.2, radius: 20 },
  { id: 'storm-bat', name: 'Storm Bat', bodyColor: 0x38bdf8, accentColor: 0xfef08a, coreColor: 0x0c4a6e, shape: 'wing', hpScale: 0.95, radius: 18 },
  { id: 'ash-orb', name: 'Ash Orb', bodyColor: 0x64748b, accentColor: 0xfb7185, coreColor: 0x111827, shape: 'orb', hpScale: 1.0, radius: 18 },
  { id: 'glass-golem', name: 'Glass Golem', bodyColor: 0x99f6e4, accentColor: 0x5eead4, coreColor: 0x134e4a, shape: 'golem', hpScale: 1.4, radius: 22 },
  { id: 'dream-wisp', name: 'Dream Wisp', bodyColor: 0xf0abfc, accentColor: 0xbfdbfe, coreColor: 0x581c87, shape: 'wisp', hpScale: 0.88, radius: 17 },
  { id: 'lava-slime', name: 'Lava Slime', bodyColor: 0xfb923c, accentColor: 0xfef3c7, coreColor: 0x7c2d12, shape: 'slime', hpScale: 1.05, radius: 19 },
  { id: 'bone-mask', name: 'Bone Mask', bodyColor: 0xf5f5f4, accentColor: 0xfca5a5, coreColor: 0x292524, shape: 'mask', hpScale: 1.15, radius: 19 },
  { id: 'azure-imp', name: 'Azure Imp', bodyColor: 0x2563eb, accentColor: 0x93c5fd, coreColor: 0x172554, shape: 'horn', hpScale: 1.0, radius: 18 },
  { id: 'golden-eye', name: 'Golden Eye', bodyColor: 0xeab308, accentColor: 0xfef08a, coreColor: 0x422006, shape: 'orb', hpScale: 1.08, radius: 18 },
  { id: 'void-wyrm', name: 'Void Wyrm', bodyColor: 0x312e81, accentColor: 0xa78bfa, coreColor: 0x030712, shape: 'wyrm', hpScale: 1.45, radius: 22 },
  { id: 'mist-horn', name: 'Mist Horn', bodyColor: 0xbae6fd, accentColor: 0xf8fafc, coreColor: 0x075985, shape: 'horn', hpScale: 0.92, radius: 18 },
  { id: 'neon-slime', name: 'Neon Slime', bodyColor: 0x2dd4bf, accentColor: 0xf0fdfa, coreColor: 0x042f2e, shape: 'slime', hpScale: 0.98, radius: 18 },
  { id: 'scarlet-bat', name: 'Scarlet Bat', bodyColor: 0xe11d48, accentColor: 0xfda4af, coreColor: 0x4c0519, shape: 'wing', hpScale: 1.0, radius: 18 },
  { id: 'opal-mask', name: 'Opal Mask', bodyColor: 0xc4b5fd, accentColor: 0x99f6e4, coreColor: 0x2e1065, shape: 'mask', hpScale: 1.22, radius: 20 },
  { id: 'cinder-golem', name: 'Cinder Golem', bodyColor: 0x9a3412, accentColor: 0xfdba74, coreColor: 0x1c1917, shape: 'golem', hpScale: 1.5, radius: 23 },
];

export function getEnemyVariant(index: number): EnemyVariant {
  return ENEMY_VARIANTS[index % ENEMY_VARIANTS.length];
}

export function findEnemyVariant(id?: string): EnemyVariant {
  return ENEMY_VARIANTS.find((variant) => variant.id === id) ?? getEnemyVariant(0);
}
