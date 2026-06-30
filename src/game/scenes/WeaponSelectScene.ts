import Phaser from 'phaser';
import { STARTER_WEAPONS } from '../systems/WeaponEvolution';
import type { StarterWeapon } from '../types/GameTypes';

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

    const titleBack = this.add.rectangle(width / 2, 60, 330, 66, 0x7f1d1d, 0.82);
    titleBack.setStrokeStyle(3, 0xfacc15, 0.8);
    const titleGlow = this.add.circle(width / 2, 60, 82, 0xfb7185, 0.18).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: titleGlow, scale: 1.18, alpha: 0.28, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(width / 2, 60, 'WEAPON SELECT', {
      fontSize: '27px',
      color: '#fef08a',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#7f1d1d',
      strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(width / 2, 102, '選んだ系統の中でランダム進化', {
      fontSize: '12px',
      color: '#dcfce7',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(width / 2, 122, '最初の選択で進化候補の種類が決まります', {
      fontSize: '11px',
      color: '#fef3c7',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#4a0f09',
      strokeThickness: 3,
    }).setOrigin(0.5);

    let lastTapAt = 0;
    let lastTapWeaponId = '';
    let pendingStart: Phaser.Time.TimerEvent | undefined;

    STARTER_WEAPONS.forEach((weapon, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 112 + col * 176;
      const y = 218 + row * 154;
      const card = this.add.rectangle(x, y, 160, 142, 0x1f0a10, 0.96);
      card.setStrokeStyle(2, 0xfacc15, 0.56);
      const inner = this.add.rectangle(x, y, 148, 130, 0x450a12, 0.58);
      inner.setStrokeStyle(1, weapon.color, 0.58);
      const glow = this.add.circle(x, y - 24, 48, weapon.color, 0.13).setBlendMode(Phaser.BlendModes.ADD);
      this.add.ellipse(x - 60, y - 52, 5, 9, 0xfacc15, 0.68).setAngle(18);
      this.add.ellipse(x + 60, y - 52, 5, 9, 0xfacc15, 0.68).setAngle(-18);
      this.add.triangle(x - 46, y - 50, 0, -12, 22, 0, 0, 12, 0x22c55e, 0.52).setAngle(-22);
      this.add.triangle(x + 46, y - 50, 0, -12, 22, 0, 0, 12, 0x22c55e, 0.52).setAngle(202);
      if (this.textures.exists(weapon.imageKey)) {
        this.add.image(x, y - 28, weapon.imageKey).setDisplaySize(78, 126).setTint(weapon.color, 0xffffff, weapon.color, 0xffffff);
      } else {
        this.add.rectangle(x, y - 22, 32, 92, weapon.color, 0.92);
      }
      this.add.text(x, y + 42, weapon.title, {
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
        stroke: '#020617',
        strokeThickness: 3,
      }).setOrigin(0.5);
      this.add.text(x, y + 64, weapon.subtitle, {
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
      card.on('pointerdown', () => {
        const now = this.time.now;
        const isDoubleTap = lastTapWeaponId === weapon.id && now - lastTapAt < 320;
        lastTapAt = now;
        lastTapWeaponId = weapon.id;

        if (isDoubleTap) {
          pendingStart?.remove(false);
          pendingStart = undefined;
          this.showWeaponDetail(weapon);
          return;
        }

        pendingStart?.remove(false);
        pendingStart = this.time.delayedCall(240, () => {
          this.scene.start('GameScene', { starterId: weapon.id });
        });
      });
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

  private showWeaponDetail(weapon: StarterWeapon): void {
    const { width, height } = this.scale;
    const veil = this.add.rectangle(width / 2, height / 2, width, height, 0x020617, 0.78);
    const panel = this.add.rectangle(width / 2, height / 2, 334, 468, 0x111827, 0.98);
    panel.setStrokeStyle(2, weapon.color, 0.9);
    const glow = this.add.circle(width / 2, 236, 92, weapon.color, 0.16).setBlendMode(Phaser.BlendModes.ADD);
    const image = this.textures.exists(weapon.imageKey)
      ? this.add.image(width / 2, 242, weapon.imageKey).setDisplaySize(126, 220).setTint(weapon.color, 0xffffff, weapon.color, 0xffffff)
      : this.add.rectangle(width / 2, 242, 58, 178, weapon.color, 0.92);
    const title = this.add.text(width / 2, 86, weapon.title.toUpperCase(), {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 6,
    }).setOrigin(0.5);
    const subtitle = this.add.text(width / 2, 116, weapon.subtitle, {
      fontSize: '13px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    const detail = this.add.text(width / 2, 382, [
      `ATK ${weapon.stats.power}   RATE ${weapon.stats.fireRate.toFixed(2)}`,
      `TYPE ${weapon.stats.element.toUpperCase()} / ${weapon.stats.archetype.toUpperCase()}`,
      '最初の選択で進化候補の種類を制御',
      'BOSS撃破時に候補内からランダム進化',
    ], {
      fontSize: '12px',
      color: '#dbeafe',
      align: 'center',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 8,
    }).setOrigin(0.5);
    const startButton = this.add.rectangle(width / 2 - 72, 520, 120, 44, 0x7f1d1d, 0.96);
    startButton.setStrokeStyle(2, 0xfef08a, 0.88);
    const closeButton = this.add.rectangle(width / 2 + 72, 520, 120, 44, 0x172554, 0.96);
    closeButton.setStrokeStyle(2, 0x93c5fd, 0.76);
    const startText = this.add.text(width / 2 - 72, 520, 'START', {
      fontSize: '14px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    const closeText = this.add.text(width / 2 + 72, 520, 'CLOSE', {
      fontSize: '14px',
      color: '#dbeafe',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    const overlay = this.add.container(0, 0, [veil, panel, glow, image, title, subtitle, detail, startButton, closeButton, startText, closeText]).setDepth(50);
    startButton.setInteractive({ useHandCursor: true });
    startButton.on('pointerdown', () => this.scene.start('GameScene', { starterId: weapon.id }));
    closeButton.setInteractive({ useHandCursor: true });
    closeButton.on('pointerdown', () => overlay.destroy());
    veil.setInteractive();
  }
}
