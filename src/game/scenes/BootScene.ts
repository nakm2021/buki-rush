import Phaser from 'phaser';
import { getPreloadImageAssets } from '../systems/AssetCatalog';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    getPreloadImageAssets().forEach((asset) => {
      this.load.image(asset.key, asset.path);
    });
  }

  create(): void {
    this.scene.start('TitleScene');
  }
}
