import type { GateKind, PlayerStats } from '../types/GameTypes';

export type SoundEventId = 'weapon-shot' | 'upgrade' | 'rare' | 'boss-attack' | 'boss-warning' | 'event-reward';

export interface ToneStep {
  frequency: number;
  duration: number;
  volume: number;
  delay?: number;
  wave?: OscillatorType;
}

export interface SoundProfile {
  id: SoundEventId;
  steps: ToneStep[];
}

const SHOT_PROFILES: Record<string, ToneStep[]> = {
  saber: [
    { frequency: 760, duration: 0.026, volume: 0.018, wave: 'sawtooth' },
    { frequency: 1140, duration: 0.022, volume: 0.012, delay: 24, wave: 'triangle' },
  ],
  samurai: [
    { frequency: 820, duration: 0.024, volume: 0.018, wave: 'sawtooth' },
    { frequency: 1320, duration: 0.018, volume: 0.012, delay: 22, wave: 'sine' },
  ],
  rail: [
    { frequency: 220, duration: 0.036, volume: 0.017, wave: 'square' },
    { frequency: 880, duration: 0.034, volume: 0.015, delay: 28, wave: 'triangle' },
  ],
  lance: [
    { frequency: 420, duration: 0.032, volume: 0.017, wave: 'triangle' },
    { frequency: 980, duration: 0.024, volume: 0.012, delay: 32, wave: 'sine' },
  ],
  needle: [
    { frequency: 980, duration: 0.018, volume: 0.014, wave: 'triangle' },
    { frequency: 640, duration: 0.02, volume: 0.01, delay: 18, wave: 'sawtooth' },
  ],
  hammer: [
    { frequency: 140, duration: 0.05, volume: 0.022, wave: 'square' },
    { frequency: 360, duration: 0.04, volume: 0.014, delay: 44, wave: 'triangle' },
  ],
  lotus: [
    { frequency: 523, duration: 0.04, volume: 0.014, wave: 'sine' },
    { frequency: 784, duration: 0.042, volume: 0.012, delay: 44, wave: 'triangle' },
  ],
};

export function getWeaponShotProfile(stats: PlayerStats): SoundProfile {
  const steps = SHOT_PROFILES[stats.archetype] ?? (['blade', 'saber', 'samurai'].includes(stats.archetype)
    ? SHOT_PROFILES.saber
    : ['atlas', 'gigas', 'anchor'].includes(stats.archetype)
      ? SHOT_PROFILES.hammer
      : [{ frequency: 440, duration: 0.032, volume: 0.014, wave: 'triangle' }]);

  return { id: 'weapon-shot', steps };
}

export function getUpgradeProfile(kind: GateKind): SoundProfile {
  const base = kind === 'rarity' || kind === 'fusion' ? 660 : kind === 'module' ? 520 : 420;
  return {
    id: 'upgrade',
    steps: [
      { frequency: base, duration: 0.055, volume: 0.035, wave: 'triangle' },
      { frequency: base * 1.5, duration: 0.055, volume: 0.028, delay: 70, wave: 'triangle' },
    ],
  };
}

export const RARE_SOUND_PROFILE: SoundProfile = {
  id: 'rare',
  steps: [523, 659, 784, 1046].map((frequency, index) => ({ frequency, duration: 0.08, volume: 0.04, delay: index * 58, wave: 'triangle' })),
};

export const EVENT_REWARD_PROFILE: SoundProfile = {
  id: 'event-reward',
  steps: [392, 523, 659, 784, 1175].map((frequency, index) => ({ frequency, duration: 0.09, volume: 0.045, delay: index * 72, wave: 'triangle' })),
};

export const BOSS_WARNING_PROFILE: SoundProfile = {
  id: 'boss-warning',
  steps: [
    { frequency: 82, duration: 0.26, volume: 0.08, wave: 'sawtooth' },
    { frequency: 196, duration: 0.18, volume: 0.045, delay: 40, wave: 'square' },
    { frequency: 74, duration: 0.28, volume: 0.08, delay: 380, wave: 'sawtooth' },
    { frequency: 220, duration: 0.18, volume: 0.045, delay: 430, wave: 'square' },
    { frequency: 68, duration: 0.34, volume: 0.09, delay: 780, wave: 'sawtooth' },
    { frequency: 247, duration: 0.24, volume: 0.05, delay: 850, wave: 'square' },
  ],
};
