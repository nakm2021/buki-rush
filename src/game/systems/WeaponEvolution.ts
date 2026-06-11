import type { PlayerStats, WeaponElement } from '../types/GameTypes';

interface ElementProfile {
  element: WeaponElement;
  label: string;
  names: string[];
  colors: { primary: number; secondary: number; bullet: number };
}

export const ELEMENT_PROFILES: ElementProfile[] = [
  { element: 'neutral', label: '無', names: ['Runner', 'Twin', 'Burst', 'Nova', 'Orbit', 'Crown'], colors: { primary: 0x38bdf8, secondary: 0x93c5fd, bullet: 0x67e8f9 } },
  { element: 'fire', label: '火', names: ['Spark', 'Flare', 'Blaze', 'Inferno', 'Phoenix', 'Solar'], colors: { primary: 0xfb923c, secondary: 0xfacc15, bullet: 0xffedd5 } },
  { element: 'ice', label: '氷', names: ['Frost', 'Glacier', 'Crystal', 'Aurora', 'Zero', 'Polaris'], colors: { primary: 0x7dd3fc, secondary: 0xe0f2fe, bullet: 0xbae6fd } },
  { element: 'thunder', label: '雷', names: ['Volt', 'Sparkline', 'Storm', 'Ion', 'Plasma', 'Raijin'], colors: { primary: 0xfef08a, secondary: 0x38bdf8, bullet: 0xfacc15 } },
  { element: 'wind', label: '風', names: ['Gale', 'Cyclone', 'Typhoon', 'Aero', 'Jet', 'Tempest'], colors: { primary: 0x86efac, secondary: 0x5eead4, bullet: 0xbbf7d0 } },
  { element: 'light', label: '光', names: ['Ray', 'Halo', 'Prism', 'Seraph', 'Stella', 'Radiant'], colors: { primary: 0xfef3c7, secondary: 0xf0f9ff, bullet: 0xffffff } },
  { element: 'shadow', label: '影', names: ['Shade', 'Night', 'Umbra', 'Eclipse', 'Abyss', 'Noctis'], colors: { primary: 0x8b5cf6, secondary: 0x312e81, bullet: 0xc4b5fd } },
  { element: 'crystal', label: '晶', names: ['Quartz', 'Opal', 'Gemini', 'Diamond', 'Arc', 'Mythril'], colors: { primary: 0x99f6e4, secondary: 0xf0abfc, bullet: 0xccfbf1 } },
];

export function getElementProfile(element: WeaponElement): ElementProfile {
  return ELEMENT_PROFILES.find((profile) => profile.element === element) ?? ELEMENT_PROFILES[0];
}

export function getWeaponName(stats: PlayerStats): string {
  const profile = getElementProfile(stats.element);
  const tierIndex = Math.min(profile.names.length - 1, Math.floor((stats.tier - 1) / 2));
  return `${profile.label}-${profile.names[tierIndex]} Lv.${stats.level}`;
}

export function getWeaponColors(stats: PlayerStats): ElementProfile['colors'] {
  return getElementProfile(stats.element).colors;
}

export function getElementByIndex(index: number): WeaponElement {
  const elementalProfiles = ELEMENT_PROFILES.filter((profile) => profile.element !== 'neutral');
  return elementalProfiles[index % elementalProfiles.length].element;
}
