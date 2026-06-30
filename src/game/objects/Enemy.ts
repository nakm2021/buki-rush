import Phaser from 'phaser';
import { getEnemyVariant } from '../systems/EnemyCatalog';
import type { EnemyVariant } from '../types/GameTypes';

export class Enemy extends Phaser.GameObjects.Container {
  private hp: number;
  private readonly maxHp: number;
  private readonly label: Phaser.GameObjects.Text;
  private readonly hpFill: Phaser.GameObjects.Rectangle;
  private readonly damageValue: number;
  private readonly lethal: boolean;
  private readonly statusEffect?: EnemyVariant['statusEffect'];
  private readonly statusChance: number;

  constructor(scene: Phaser.Scene, x: number, y: number, hp: number, variant: EnemyVariant = getEnemyVariant(0)) {
    super(scene, x, y);

    this.hp = hp;
    this.maxHp = hp;
    this.damageValue = variant.damage;
    this.lethal = Boolean(variant.lethal);
    this.statusEffect = variant.statusEffect;
    this.statusChance = variant.statusChance ?? 0.55;

    const shadow = scene.add.ellipse(0, variant.radius + 10, variant.radius * 2.4, 13, 0x020617, 0.32);
    const glow = scene.add.circle(0, 0, variant.radius + 12, variant.lethal ? 0xff174d : variant.bodyColor, variant.lethal ? 0.28 : 0.13);
    const regularImage = variant.imageKey && scene.textures.exists(variant.imageKey)
      ? scene.add.image(0, -variant.radius * 0.2, variant.imageKey).setDisplaySize(variant.radius * 3.7, variant.radius * 6.55)
      : undefined;
    const image = variant.lethal && scene.textures.exists('eliteReaper')
      ? scene.add.image(0, 0, 'eliteReaper').setDisplaySize(variant.radius * 5.4, variant.radius * 10.4)
      : regularImage;
    const parts = image ? [image] : this.createBody(scene, variant);
    const warning = variant.lethal
      ? scene.add.text(0, -variant.radius - 27, '!!', {
          fontSize: '17px',
          color: '#fecaca',
          fontStyle: 'bold',
          fontFamily: 'Arial, sans-serif',
          stroke: '#020617',
          strokeThickness: 4,
        }).setOrigin(0.5)
      : undefined;
    const statusBadge = variant.statusEffect
      ? scene.add.text(variant.radius + 11, -variant.radius - 9, this.getStatusIcon(variant.statusEffect), {
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
          fontFamily: 'Arial, sans-serif',
          stroke: '#020617',
          strokeThickness: 3,
        }).setOrigin(0.5)
      : undefined;
    const hpY = image ? -variant.radius * 3.55 : -variant.radius - 14;
    const hpBack = scene.add.rectangle(0, hpY, 46, 10, 0x020617, 0.82);
    hpBack.setStrokeStyle(1, variant.accentColor, 0.72);
    this.hpFill = scene.add.rectangle(-21, hpY, 42, 6, variant.lethal ? 0xff174d : variant.accentColor, 0.95).setOrigin(0, 0.5);
    this.label = scene.add.text(0, hpY - 1, String(hp), {
      fontSize: '10px',
      color: '#fff7ed',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 2,
    }).setOrigin(0.5);

    const children = warning ? [shadow, glow, ...parts, warning, hpBack, this.hpFill, this.label] : [shadow, glow, ...parts, hpBack, this.hpFill, this.label];
    if (statusBadge) {
      children.push(statusBadge);
    }
    this.add(children);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const enemyBody = this.body as Phaser.Physics.Arcade.Body;
    const hitRadius = Math.max(11, variant.radius - (variant.lethal ? 7 : 4));
    enemyBody.setCircle(hitRadius);
    enemyBody.setOffset(-hitRadius, -hitRadius);
  }

  public getHp(): number {
    return this.hp;
  }

  public getDamage(): number {
    return this.damageValue;
  }

  public isLethal(): boolean {
    return this.lethal;
  }

  public getStatusEffect(): EnemyVariant['statusEffect'] | undefined {
    return this.statusEffect;
  }

  public getStatusChance(): number {
    return this.statusChance;
  }

  public damage(amount: number): boolean {
    this.hp -= amount;
    const visibleHp = Math.max(0, this.hp);
    this.label.setText(String(visibleHp));
    this.hpFill.width = 42 * Phaser.Math.Clamp(visibleHp / this.maxHp, 0, 1);
    return this.hp <= 0;
  }

  private createBody(scene: Phaser.Scene, variant: EnemyVariant): Phaser.GameObjects.GameObject[] {
    const r = variant.radius;
    const body = scene.add.ellipse(0, 4, r * 1.72, r * 1.95, variant.bodyColor, 0.98).setStrokeStyle(3, variant.accentColor, 0.95);
    const head = scene.add.ellipse(0, -r * 0.72, r * 1.48, r * 1.1, variant.bodyColor, 0.98).setStrokeStyle(2, variant.accentColor, 0.85);
    const eyeL = scene.add.circle(-r * 0.28, -r * 0.82, Math.max(2.5, r * 0.12), variant.coreColor, 0.98);
    const eyeR = scene.add.circle(r * 0.28, -r * 0.82, Math.max(2.5, r * 0.12), variant.coreColor, 0.98);
    const core = scene.add.circle(0, 5, Math.max(5, r * 0.28), variant.coreColor, 0.78);
    const footL = scene.add.ellipse(-r * 0.42, r * 0.96, r * 0.52, r * 0.26, variant.accentColor, 0.9);
    const footR = scene.add.ellipse(r * 0.42, r * 0.96, r * 0.52, r * 0.26, variant.accentColor, 0.9);
    const base = [body, head, eyeL, eyeR, core, footL, footR];

    switch (variant.shape) {
      case 'horn':
        return [
          scene.add.triangle(-r * 0.46, -r * 1.36, 0, 13, 7, -11, 15, 13, variant.accentColor, 0.94),
          scene.add.triangle(r * 0.46, -r * 1.36, 0, 13, 7, -11, 15, 13, variant.accentColor, 0.94),
          ...base,
        ];
      case 'wing':
        return [
          scene.add.triangle(-r * 0.98, -3, 0, 0, 31, -12, 28, 16, variant.accentColor, 0.82).setAngle(-14),
          scene.add.triangle(r * 0.98, -3, 0, 0, 31, -12, 28, 16, variant.accentColor, 0.82).setAngle(194),
          ...base,
        ];
      case 'slime':
        return [
          scene.add.ellipse(0, r * 0.6, r * 2.2, r * 1.25, variant.bodyColor, 0.75),
          scene.add.ellipse(0, -r * 0.18, r * 1.7, r * 1.32, variant.bodyColor, 0.96).setStrokeStyle(3, variant.accentColor, 0.85),
          eyeL,
          eyeR,
          core,
        ];
      case 'golem':
        return [
          scene.add.rectangle(0, 2, r * 1.75, r * 1.7, variant.bodyColor, 0.98).setStrokeStyle(3, variant.accentColor, 0.95),
          scene.add.rectangle(0, -r * 0.86, r * 1.32, r * 0.72, variant.bodyColor, 0.98).setStrokeStyle(2, variant.accentColor, 0.9),
          scene.add.rectangle(-r - 5, 4, 10, 24, variant.accentColor, 0.85),
          scene.add.rectangle(r + 5, 4, 10, 24, variant.accentColor, 0.85),
          eyeL,
          eyeR,
          core,
        ];
      case 'wisp':
        return [
          scene.add.triangle(0, r * 0.9, -r * 0.72, -r * 0.16, 0, -r * 1.25, r * 0.72, -r * 0.16, variant.bodyColor, 0.82).setStrokeStyle(2, variant.accentColor, 0.9),
          scene.add.circle(-8, -7, r * 0.4, variant.accentColor, 0.36),
          scene.add.circle(9, 7, r * 0.32, variant.accentColor, 0.28),
          eyeL,
          eyeR,
          core,
        ];
      case 'wyrm':
        return [
          scene.add.ellipse(-r * 0.62, r * 0.45, r * 0.95, r * 0.62, variant.bodyColor, 0.82),
          scene.add.ellipse(r * 0.62, -r * 0.28, r * 0.95, r * 0.62, variant.bodyColor, 0.82),
          ...base,
          scene.add.rectangle(0, -r - 5, 23, 7, variant.accentColor, 0.9),
        ];
      case 'beast':
        return [
          scene.add.rectangle(-r * 0.8, 0, 10, 22, variant.accentColor, 0.8).setAngle(16),
          scene.add.rectangle(r * 0.8, 0, 10, 22, variant.accentColor, 0.8).setAngle(-16),
          ...base,
          scene.add.triangle(0, -r * 0.35, -9, 0, 9, 0, 0, 11, variant.accentColor, 0.9),
        ];
      case 'knight':
        return [
          scene.add.rectangle(0, 3, r * 1.7, r * 1.85, variant.bodyColor, 0.98).setStrokeStyle(3, variant.accentColor, 0.95),
          scene.add.triangle(0, -r * 1.18, -r * 0.68, -r * 0.35, 0, -r * 0.95, r * 0.68, -r * 0.35, variant.accentColor, 0.95),
          scene.add.rectangle(0, -r * 0.72, r * 0.9, 5, variant.coreColor, 0.9),
          core,
          footL,
          footR,
        ];
      case 'plant':
        return [
          scene.add.triangle(-r * 0.7, -r * 0.48, 0, 0, 22, -16, 18, 18, variant.accentColor, 0.82).setAngle(-12),
          scene.add.triangle(r * 0.7, -r * 0.48, 0, 0, 22, -16, 18, 18, variant.accentColor, 0.82).setAngle(192),
          ...base,
          scene.add.rectangle(0, r * 0.18, 8, r * 1.1, variant.accentColor, 0.8),
        ];
      case 'spider':
        return [
          ...[-1, 1].flatMap((side) => [
            scene.add.rectangle(side * r * 0.86, -5, 26, 5, variant.accentColor, 0.82).setAngle(side * 23),
            scene.add.rectangle(side * r * 0.9, 5, 25, 5, variant.accentColor, 0.82).setAngle(side * -18),
          ]),
          ...base,
        ];
      case 'mask':
        return [
          scene.add.rectangle(0, 0, r * 1.72, r * 1.92, variant.bodyColor, 0.96).setStrokeStyle(3, variant.accentColor, 0.95),
          scene.add.triangle(0, -r * 0.82, -r * 0.55, -r * 0.15, 0, -r * 1.02, r * 0.55, -r * 0.15, variant.accentColor, 0.82),
          eyeL,
          eyeR,
          scene.add.rectangle(0, 9, 18, 4, variant.accentColor, 0.85),
        ];
      case 'orb':
      default:
        return [
          scene.add.polygon(0, 0, [-r, -4, -r * 0.45, -r, r * 0.45, -r, r, -4, r * 0.72, r * 0.75, 0, r, -r * 0.72, r * 0.75], variant.bodyColor, 0.96).setStrokeStyle(3, variant.accentColor, 0.95),
          eyeL,
          eyeR,
          core,
          footL,
          footR,
        ];
    }
  }

  private getStatusIcon(effect: NonNullable<EnemyVariant['statusEffect']>): string {
    switch (effect) {
      case 'poison':
        return 'PO';
      case 'paralyze':
        return 'ST';
      case 'freeze':
        return 'FR';
      case 'curse':
        return 'CU';
      case 'burn':
        return 'BR';
      default:
        return '!';
    }
  }
}
