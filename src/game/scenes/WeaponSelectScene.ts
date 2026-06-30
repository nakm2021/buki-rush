import Phaser from 'phaser';
import { STARTER_WEAPONS } from '../systems/WeaponEvolution';

export default class WeaponSelectScene extends Phaser.Scene {
  constructor() {
    super('WeaponSelectScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x19070b, 1);
    this.add.rectangle(width / 2, height / 2, 352, height, 0x3b0a13, 0.92);
    this.add.rectangle(width / 2, height / 2, 300, height + 40, 0x0f172a, 0.28);
    for (let i = 0; i < 42; i++) {
      const x = 36 + (i % 6) * 64 + (Math.floor(i / 6) % 2) * 18;
      const y = 26 + Math.floor(i / 6) * 96;
      this.add.ellipse(x, y, 5, 9, 0xfacc15, 0.34).setAngle(18);
    }
    for (let i = 0; i < 10; i++) {
      const leaf = this.add.triangle(20 + i * 42, 106 + (i % 3) * 170, 0, -18, 34, 0, 0, 18, 0x22c55e, 0.16).setAngle(i % 2 === 0 ? -18 : 22);
      leaf.setBlendMode(Phaser.BlendModes.ADD);
    }

    const titleBack = this.add.rectangle(width / 2, 62, 330, 78, 0x7f1d1d, 0.88);
    titleBack.setStrokeStyle(3, 0xfacc15, 0.8);
    const titleGlow = this.add.circle(width / 2, 60, 82, 0xfb7185, 0.18).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: titleGlow, scale: 1.18, alpha: 0.28, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(width / 2, 48, 'ICHIGO BUKI', {
      fontSize: '25px',
      color: '#fff7ed',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#4a0f09',
      strokeThickness: 7,
    }).setOrigin(0.5);
    this.add.text(width / 2, 78, 'WEAPON SELECT', {
      fontSize: '18px',
      color: '#fef08a',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#7f1d1d',
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(width / 2, 106, '選んだブキは固定 / 進化で姿が変わる', {
      fontSize: '12px',
      color: '#dcfce7',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    STARTER_WEAPONS.forEach((weapon, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 112 + col * 176;
      const y = 202 + row * 154;
      const card = this.add.rectangle(x, y, 154, 132, 0x1f0a10, 0.96);
      card.setStrokeStyle(2, 0xfacc15, 0.56);
      const inner = this.add.rectangle(x, y, 142, 120, 0x450a12, 0.58);
      inner.setStrokeStyle(1, weapon.color, 0.58);
      const glow = this.add.circle(x, y - 24, 48, weapon.color, 0.13).setBlendMode(Phaser.BlendModes.ADD);
      this.add.ellipse(x - 60, y - 52, 5, 9, 0xfacc15, 0.68).setAngle(18);
      this.add.ellipse(x + 60, y - 52, 5, 9, 0xfacc15, 0.68).setAngle(-18);
      this.add.triangle(x - 46, y - 50, 0, -12, 22, 0, 0, 12, 0x22c55e, 0.52).setAngle(-22);
      this.add.triangle(x + 46, y - 50, 0, -12, 22, 0, 0, 12, 0x22c55e, 0.52).setAngle(202);
      if (this.textures.exists(weapon.imageKey)) {
        this.add.image(x, y - 24, weapon.imageKey).setDisplaySize(62, 112).setTint(weapon.color, 0xffffff, weapon.color, 0xffffff);
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
        card.setStrokeStyle(4, 0xfef08a, 1);
        inner.setStrokeStyle(2, weapon.color, 1);
        glow.setAlpha(0.3);
      });
      card.on('pointerout', () => {
        card.setStrokeStyle(2, 0xfacc15, 0.56);
        inner.setStrokeStyle(1, weapon.color, 0.58);
        glow.setAlpha(0.13);
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
