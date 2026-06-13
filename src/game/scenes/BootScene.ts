import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.image('weaponAnime', 'assets/generated/weapon-anime.png');
    this.load.image('weaponPhoenix', 'assets/generated/weapon-phoenix.png');
    this.load.image('weaponCrystal', 'assets/generated/weapon-crystal.png');
    this.load.image('bossDragon', 'assets/generated/boss-dragon.png');
    this.load.image('bossTitan', 'assets/generated/boss-titan.png');
    this.load.image('eliteReaper', 'assets/generated/elite-reaper.png');
  }

  create(): void {
    this.scene.start('TitleScene');
  }
}
