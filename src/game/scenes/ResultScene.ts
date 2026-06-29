import Phaser from 'phaser';
import type { GameResult } from '../types/GameTypes';

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  create(data: Partial<GameResult>): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x050713, 0.96);
    this.add.rectangle(width / 2, height / 2, 340, height, 0x09111f, 0.78);
    this.add.rectangle(width / 2, height / 2, 292, height, 0x0d1631, 0.54);
    for (let y = 16; y < height; y += 44) {
      this.add.line(width / 2, y, -154, 0, 154, 0, 0x6ee7ff, 0.07);
    }

    const title = data.title ?? 'RESULT';
    const titleColor = title === 'CLEAR' ? '#bbf7d0' : '#fecaca';

    this.add.text(width / 2, 150, title, {
      fontSize: '42px',
      color: titleColor,
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(width / 2, 212, data.subtitle ?? 'もう一度挑戦して、武器の強化を重ねよう', {
      fontSize: '15px',
      color: '#bfdbfe',
      align: 'center',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 6,
    }).setOrigin(0.5);

    this.add.circle(width / 2, 164, 94, title === 'CLEAR' ? 0x22c55e : 0xef4444, 0.08);

    const panelGlow = this.add.rectangle(width / 2, 336, 326, 208, 0x38bdf8, 0.08);
    const panel = this.add.rectangle(width / 2, 336, 310, 196, 0x09111f, 0.9);
    panelGlow.setStrokeStyle(1, 0x38bdf8, 0.18);
    panel.setStrokeStyle(2, 0x38bdf8, 0.36);

    const rows = [
      `距離        ${data.distance ?? 0}m`,
      `最高記録    ${data.bestDistance ?? 0}m`,
      `討伐BOSS    ${data.defeatedBosses ?? 0} / 累計 ${data.totalBosses ?? 0}`,
      `メダル      ${data.medals ?? 0}`,
      `最終武器数  ${data.weaponCount ?? 1}`,
      `最終攻撃力  ${data.power ?? 1}`,
      `レベル      ${data.level ?? 1}`,
      `武器        ${data.weaponName ?? '無-Runner Lv.1'}`,
    ];

    rows.forEach((row, index) => {
      this.add.text(width / 2, 246 + index * 24, row, {
        fontSize: '15px',
        color: '#f8fafc',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0.5);
    });

    const ranking = data.leaderboard ?? [];
    this.add.text(width / 2, 468, data.rankUpdated ? 'RANKING UPDATED' : 'RANKING', {
      fontSize: '16px',
      color: data.rankUpdated ? '#fef08a' : '#bfdbfe',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 4,
    }).setOrigin(0.5);
    ranking.slice(0, 3).forEach((entry, index) => {
      this.add.text(width / 2, 496 + index * 24, `${index + 1}. ${entry.playerName}  ${entry.distance}m`, {
        fontSize: '13px',
        color: index === 0 ? '#fef3c7' : '#e0f2fe',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0.5);
    });

    const button = this.add.rectangle(width / 2, height - 150, 246, 58, 0x12233f, 0.96);
    button.setStrokeStyle(2, 0x38bdf8, 0.9);
    this.add.text(width / 2, height - 150, 'START', {
      fontSize: '18px',
      color: '#eff6ff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 104, 'タップでブキ選択へ', {
      fontSize: '13px',
      color: '#bfdbfe',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => this.scene.start('WeaponSelectScene'));
    this.input.once('pointerdown', () => this.scene.start('WeaponSelectScene'));
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('WeaponSelectScene'));
  }
}
