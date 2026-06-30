export interface RareRushEvent {
  id: string;
  title: string;
  subtitle: string;
  chance: number;
  enemyVariantId: string;
  targetKills: number;
  maxActiveEnemies: number;
  spawnBatchSize: number;
  spawnIntervalMs: number;
  rewardItemKey: string;
}

export const RARE_RUSH_EVENTS: RareRushEvent[] = [
  {
    id: 'thousand-berry-swarm',
    title: '千体ベリー襲来',
    subtitle: '全部倒せたら激レア宝箱',
    chance: 1 / 100000,
    enemyVariantId: 'photo-melon-blade-sentinel',
    targetKills: 1000,
    maxActiveEnemies: 64,
    spawnBatchSize: 12,
    spawnIntervalMs: 260,
    rewardItemKey: 'itemMythicRelicChest',
  },
];

export function rollRareRushEvent(): RareRushEvent | undefined {
  return RARE_RUSH_EVENTS.find((event) => Math.random() < event.chance);
}
