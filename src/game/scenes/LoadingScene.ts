import Phaser from 'phaser';
import { getPreloadImageAssets, TITLE_BACKGROUND_ASSET } from '../systems/AssetCatalog';

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x2a0d08, 1);

    if (this.textures.exists(TITLE_BACKGROUND_ASSET.key)) {
      this.add.image(width / 2, height / 2, TITLE_BACKGROUND_ASSET.key).setDisplaySize(width, height);
    }

    this.add.rectangle(width / 2, height / 2, width, height, 0x2a0d08, 0.22);
    this.add.rectangle(width / 2, height / 2, width, height, 0x020617, 0.18);

    const title = this.add.text(width / 2, height * 0.46, 'LOADING', {
      fontSize: '28px',
      color: '#fff7ed',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#4a0f09',
      strokeThickness: 7,
    }).setOrigin(0.5);
    const progressBack = this.add.rectangle(width / 2, height * 0.56, 246, 12, 0x1f0906, 0.86);
    progressBack.setStrokeStyle(2, 0xffd199, 0.78);
    const progressFill = this.add.rectangle(width / 2 - 119, height * 0.56, 0, 6, 0xfff176, 0.96).setOrigin(0, 0.5);
    const hint = this.add.text(width / 2, height * 0.61, 'ブキと敵を準備中', {
      fontSize: '13px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#4a0f09',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: [title, hint],
      alpha: { from: 0.72, to: 1 },
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.load.on('progress', (value: number) => {
      progressFill.width = 238 * value;
    });

    getPreloadImageAssets().forEach((asset) => {
      if (!this.textures.exists(asset.key)) {
        this.load.image(asset.key, asset.path);
      }
    });
  }

  create(): void {
    this.scene.start('WeaponSelectScene');
  }
}
