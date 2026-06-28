import Phaser from 'phaser';
import { WEAPON_IMAGE_ASSETS } from '../systems/AssetCatalog';
import { loadPlayerMeta } from '../systems/RecordSystem';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    const { width, height } = this.scale;
    const meta = loadPlayerMeta();
    this.add.rectangle(width / 2, height / 2, width, height, 0x050713, 1);
    this.add.rectangle(width / 2, height / 2, 340, height, 0x09111f, 0.92);
    this.add.rectangle(width / 2, height / 2, 292, height, 0x0d1631, 0.64);
    this.add.rectangle(width / 2, height / 2, 204, height, 0x071a36, 0.28);

    for (let y = 0; y < height; y += 42) {
      this.add.line(width / 2, y, -154, 0, 154, 0, 0x6ee7ff, 0.09);
    }

    [64, 132, 200, 268, 336].forEach((x) => {
      this.add.line(x, height / 2, 0, 0, 0, height, 0x4f8cff, x === 200 ? 0.2 : 0.12).setLineWidth(x === 200 ? 3 : 1);
    });

    for (let i = 0; i < 14; i++) {
      this.add.rectangle(42 + i * 26, 84 + (i % 5) * 86, 2, 72, i % 2 === 0 ? 0x38bdf8 : 0xc084fc, 0.12).setAngle(i % 2 === 0 ? -9 : 9);
    }

    this.add.circle(width / 2, 262, 112, 0x38bdf8, 0.1);
    this.add.circle(width / 2, 262, 78, 0xc084fc, 0.08);
    const titleWeaponKey = WEAPON_IMAGE_ASSETS[0].key;
    if (this.textures.exists(titleWeaponKey)) {
      this.add.image(width / 2, 274, titleWeaponKey).setDisplaySize(150, 274).setTint(0x67e8f9, 0xfacc15, 0xa78bfa, 0x67e8f9);
    } else {
      this.add.rectangle(width / 2, 262, 44, 104, 0x22d3ee, 0.96);
      this.add.rectangle(width / 2, 205, 92, 12, 0xf8fafc, 0.94);
    }

    this.add.text(width / 2, 140, 'ブキラッシュ', {
      fontSize: '40px',
      color: '#f8fafc',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#0f172a',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(width / 2, 188, '属性・型・MODを重ねて無限強化', {
      fontSize: '14px',
      color: '#bae6fd',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    const infoPanel = this.add.rectangle(width / 2, 414, 306, 126, 0x09111f, 0.72);
    infoPanel.setStrokeStyle(1, 0x38bdf8, 0.28);
    this.add.text(width / 2, 410, `PC: 矢印/WASD / スマホ: ドラッグ移動\nダブルタップで必殺技 LIFE OVERDRIVE\n武器変更はBOSS撃破後のRELICで発生\nメダル ${meta.medals}  永続RANK ${meta.permanentRank}  図鑑 B${meta.bosses.length}/W${meta.weapons.length}`, {
      fontSize: '13px',
      color: '#e0f2fe',
      align: 'center',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 7,
    }).setOrigin(0.5);

    const button = this.add.rectangle(width / 2, height - 132, 236, 60, 0x12233f, 0.96);
    button.setStrokeStyle(3, 0x38bdf8, 0.92);
    this.add.text(width / 2, height - 132, 'START', {
      fontSize: '18px',
      color: '#eff6ff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => this.scene.start('GameScene'));
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('GameScene'));
  }
}
