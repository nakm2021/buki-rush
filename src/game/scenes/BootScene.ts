import Phaser from 'phaser';
import { getPreloadImageAssets, TITLE_BACKGROUND_ASSET } from '../systems/AssetCatalog';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x2a0d08, 1);
    const wash = this.add.rectangle(width / 2, height / 2, width, height, 0x3f120b, 0.24);
    const loadingText = this.add.text(width / 2, height * 0.61, 'LOADING', {
      fontSize: '26px',
      color: '#fff7ed',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#4a0f09',
      strokeThickness: 6,
    }).setOrigin(0.5);
    const progressBack = this.add.rectangle(width / 2, height * 0.68, 240, 12, 0x1f0906, 0.82);
    progressBack.setStrokeStyle(2, 0xffd199, 0.72);
    const progressFill = this.add.rectangle(width / 2 - 116, height * 0.68, 0, 6, 0xfff176, 0.96).setOrigin(0, 0.5);

    this.load.once(`filecomplete-image-${TITLE_BACKGROUND_ASSET.key}`, () => {
      const background = this.add.image(width / 2, height / 2, TITLE_BACKGROUND_ASSET.key).setDisplaySize(width, height);
      background.setDepth(-2);
      wash.setDepth(-1);
    });

    this.tweens.add({
      targets: loadingText,
      alpha: { from: 0.72, to: 1 },
      scale: { from: 1, to: 1.04 },
      duration: 560,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.load.on('progress', (value: number) => {
      progressFill.width = 232 * value;
    });

    getPreloadImageAssets().forEach((asset) => {
      this.load.image(asset.key, asset.path);
    });
  }

  create(): void {
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader) {
      initialLoader.classList.add('is-hidden');
      window.setTimeout(() => initialLoader.remove(), 460);
    }
    this.scene.start('TitleScene');
  }
}
