import Phaser from 'phaser';
import { STARTER_WEAPONS } from '../systems/WeaponEvolution';

export default class WeaponSelectScene extends Phaser.Scene {
  constructor() {
    super('WeaponSelectScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x050713, 1);
    this.add.rectangle(width / 2, height / 2, 350, height, 0x09111f, 0.86);
    this.add.text(width / 2, 58, 'SELECT WEAPON', {
      fontSize: '28px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(width / 2, 92, '選んだブキを育てて進化させよう', {
      fontSize: '13px',
      color: '#bfdbfe',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    STARTER_WEAPONS.forEach((weapon, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 112 + col * 176;
      const y = 190 + row * 154;
      const card = this.add.rectangle(x, y, 154, 132, 0x111827, 0.94);
      card.setStrokeStyle(2, weapon.color, 0.82);
      const glow = this.add.circle(x, y - 22, 44, weapon.color, 0.1).setBlendMode(Phaser.BlendModes.ADD);
      if (this.textures.exists(weapon.imageKey)) {
        this.add.image(x, y - 22, weapon.imageKey).setDisplaySize(58, 104).setTint(weapon.color, 0xffffff, weapon.color, 0xffffff);
      } else {
        this.add.rectangle(x, y - 22, 26, 78, weapon.color, 0.92);
      }
      this.add.text(x, y + 38, weapon.title, {
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
        stroke: '#020617',
        strokeThickness: 3,
      }).setOrigin(0.5);
      this.add.text(x, y + 60, weapon.subtitle, {
        fontSize: '10px',
        color: '#cbd5e1',
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0.5);

      card.setInteractive({ useHandCursor: true });
      card.on('pointerover', () => {
        card.setStrokeStyle(4, weapon.color, 1);
        glow.setAlpha(0.24);
      });
      card.on('pointerout', () => {
        card.setStrokeStyle(2, weapon.color, 0.82);
        glow.setAlpha(1);
      });
      card.on('pointerdown', () => this.scene.start('GameScene', { starterId: weapon.id }));
    });

    const back = this.add.text(width / 2, height - 54, 'BACK', {
      fontSize: '15px',
      color: '#bfdbfe',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    back.setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('TitleScene'));
  }
}
