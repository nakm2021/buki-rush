import Phaser from 'phaser';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x050713, 1);
    this.add.rectangle(width / 2, height / 2, 292, height, 0x0d1631, 0.56);

    for (let y = 0; y < height; y += 42) {
      this.add.line(width / 2, y, -146, 0, 146, 0, 0x6ee7ff, 0.08);
    }

    [64, 132, 200, 268, 336].forEach((x) => {
      this.add.line(x, height / 2, 0, 0, 0, height, 0x4f8cff, 0.11);
    });

    this.add.circle(width / 2, 254, 78, 0x38bdf8, 0.12);
    this.add.rectangle(width / 2, 260, 38, 92, 0x22d3ee, 0.95);
    this.add.rectangle(width / 2 - 28, 274, 10, 66, 0x93c5fd, 0.94);
    this.add.rectangle(width / 2 + 28, 274, 10, 66, 0x93c5fd, 0.94);
    this.add.rectangle(width / 2, 210, 78, 12, 0xf8fafc, 0.92);

    this.add.text(width / 2, 140, 'ブキラッシュ', {
      fontSize: '40px',
      color: '#f8fafc',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#0f172a',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(width / 2, 188, '強化ゲートを選んでボスまで走れ', {
      fontSize: '14px',
      color: '#bae6fd',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    this.add.text(width / 2, 394, 'PC: 矢印/WASD\nスマホ: ドラッグで移動', {
      fontSize: '16px',
      color: '#e0f2fe',
      align: 'center',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 8,
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
