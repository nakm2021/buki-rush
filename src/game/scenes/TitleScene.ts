import Phaser from 'phaser';
import { TITLE_BACKGROUND_ASSET } from '../systems/AssetCatalog';
import { loadPlayerMeta } from '../systems/RecordSystem';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    const { width, height } = this.scale;
    const meta = loadPlayerMeta();
    this.drawBackground(width, height);

    for (let y = 0; y < height; y += 42) {
      this.add.line(width / 2, y, -154, 0, 154, 0, 0xffffff, 0.07);
    }

    [64, 132, 200, 268, 336].forEach((x) => {
      this.add.line(x, height / 2, 0, 0, 0, height, 0xffffff, x === 200 ? 0.13 : 0.07).setLineWidth(x === 200 ? 3 : 1);
    });

    const titleShadow = this.add.rectangle(width / 2, 144, 336, 92, 0x1f0906, 0.42);
    titleShadow.setStrokeStyle(2, 0xfff1d6, 0.26);
    this.add.text(width / 2, 132, 'ブキラッシュ', {
      fontSize: '44px',
      color: '#f8fafc',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#4a0f09',
      strokeThickness: 7,
    }).setOrigin(0.5);

    this.add.text(width / 2, 182, '属性・型・MODを重ねて無限強化', {
      fontSize: '14px',
      color: '#fff7ed',
      fontFamily: 'Arial, sans-serif',
      stroke: '#4a0f09',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const specialGlow = this.add.rectangle(width / 2, 326, 342, 82, 0xffef5f, 0.24);
    specialGlow.setBlendMode(Phaser.BlendModes.ADD);
    const specialPanel = this.add.rectangle(width / 2, 326, 326, 70, 0x7f1d1d, 0.84);
    specialPanel.setStrokeStyle(3, 0xfff176, 0.95);
    this.add.text(width / 2, 306, 'スマホはダブルタップ!', {
      fontSize: '22px',
      color: '#fff7ad',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#5f160f',
      strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(width / 2, 340, '必殺技 LIFE OVERDRIVE 発動', {
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#5f160f',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: [specialGlow, specialPanel],
      alpha: { from: 0.72, to: 1 },
      scaleX: { from: 1, to: 1.035 },
      scaleY: { from: 1, to: 1.06 },
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const infoPanel = this.add.rectangle(width / 2, 456, 318, 108, 0x160a08, 0.72);
    infoPanel.setStrokeStyle(1, 0xffd199, 0.42);
    this.add.text(width / 2, 456, `PC: 矢印/WASD / スマホ: ドラッグ移動\n武器変更はBOSS撃破後のRELICで発生\nメダル ${meta.medals}  永続RANK ${meta.permanentRank}\n図鑑 B${meta.bosses.length}/W${meta.weapons.length}`, {
      fontSize: '13px',
      color: '#fff7ed',
      align: 'center',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 7,
    }).setOrigin(0.5);

    const button = this.add.rectangle(width / 2, height - 132, 236, 60, 0x12233f, 0.96);
    button.setStrokeStyle(3, 0xfff176, 0.92);
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

  private drawBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, 0x2a0d08, 1);

    if (this.textures.exists(TITLE_BACKGROUND_ASSET.key)) {
      this.add.image(width / 2, height / 2, TITLE_BACKGROUND_ASSET.key).setDisplaySize(width, height);
    }

    this.add.rectangle(width / 2, height / 2, width, height, 0x2a0d08, 0.18);
    this.add.rectangle(width / 2, height / 2, width, height, 0x020617, 0.1);
    this.add.rectangle(width / 2, 108, width, 216, 0x3f120b, 0.22);
    this.add.rectangle(width / 2, height - 94, width, 188, 0x160a08, 0.46);
  }
}
