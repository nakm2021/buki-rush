import Phaser from 'phaser';
import { getEnemyVariant } from '../systems/EnemyCatalog';
import type { EnemyVariant } from '../types/GameTypes';

export class Enemy extends Phaser.GameObjects.Container {
  private hp: number;
  private readonly label: Phaser.GameObjects.Text;
  private readonly damageValue: number;
  private readonly lethal: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, hp: number, variant: EnemyVariant = getEnemyVariant(0)) {
    super(scene, x, y);

    this.hp = hp;
    this.damageValue = variant.damage;
    this.lethal = Boolean(variant.lethal);

    const shadow = scene.add.circle(0, 7, variant.radius + 8, 0x020617, 0.32);
    const glow = scene.add.circle(0, 0, variant.radius + 10, variant.lethal ? 0xff174d : variant.bodyColor, variant.lethal ? 0.28 : 0.14);
    const image = variant.lethal && scene.textures.exists('eliteReaper') ? scene.add.image(0, 0, 'eliteReaper').setDisplaySize(variant.radius * 5.4, variant.radius * 10.4) : undefined;
    const parts = image ? [image] : this.createBody(scene, variant);
    const warning = variant.lethal
      ? scene.add.text(0, -variant.radius - 18, '!!', {
          fontSize: '17px',
          color: '#fecaca',
          fontStyle: 'bold',
          fontFamily: 'Arial, sans-serif',
          stroke: '#020617',
          strokeThickness: 4,
        }).setOrigin(0.5)
      : undefined;
    this.label = scene.add.text(0, 1, String(hp), {
      fontSize: '12px',
      color: '#fff7ed',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add(warning ? [shadow, glow, ...parts, warning, this.label] : [shadow, glow, ...parts, this.label]);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const enemyBody = this.body as Phaser.Physics.Arcade.Body;
    enemyBody.setCircle(variant.radius + 4);
    enemyBody.setOffset(-(variant.radius + 4), -(variant.radius + 4));
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

  public damage(amount: number): boolean {
    this.hp -= amount;
    this.label.setText(String(Math.max(0, this.hp)));
    return this.hp <= 0;
  }

  private createBody(scene: Phaser.Scene, variant: EnemyVariant): Phaser.GameObjects.GameObject[] {
    const r = variant.radius;
    const body = scene.add.circle(0, 0, r, variant.bodyColor, 0.98);
    body.setStrokeStyle(3, variant.accentColor, 0.95);
    const core = scene.add.circle(0, 1, Math.max(6, r * 0.42), variant.coreColor, 0.9);

    switch (variant.shape) {
      case 'horn':
        return [
          scene.add.triangle(-10, -16, 0, 13, 8, -9, 18, 13, variant.accentColor, 0.94),
          scene.add.triangle(10, -16, 0, 13, 8, -9, 18, 13, variant.accentColor, 0.94),
          body,
          core,
        ];
      case 'wing':
        return [
          scene.add.rectangle(-23, -4, 32, 9, variant.accentColor, 0.85).setAngle(-18),
          scene.add.rectangle(23, -4, 32, 9, variant.accentColor, 0.85).setAngle(18),
          body,
          core,
        ];
      case 'slime':
        return [
          scene.add.ellipse(0, 10, r * 2.3, r * 1.1, variant.bodyColor, 0.7),
          body,
          scene.add.circle(-7, -5, 4, variant.accentColor, 0.95),
          scene.add.circle(7, -5, 4, variant.accentColor, 0.95),
          core,
        ];
      case 'golem':
        return [
          scene.add.rectangle(0, 0, r * 2.1, r * 1.85, variant.bodyColor, 0.98).setStrokeStyle(3, variant.accentColor, 0.95),
          scene.add.rectangle(-r - 7, 2, 10, 22, variant.accentColor, 0.85),
          scene.add.rectangle(r + 7, 2, 10, 22, variant.accentColor, 0.85),
          core,
        ];
      case 'wisp':
        return [
          scene.add.circle(0, 0, r, variant.bodyColor, 0.78).setStrokeStyle(2, variant.accentColor, 0.9),
          scene.add.circle(-8, -7, r * 0.45, variant.accentColor, 0.45),
          scene.add.circle(9, 7, r * 0.35, variant.accentColor, 0.35),
          core,
        ];
      case 'wyrm':
        return [
          scene.add.circle(-16, 9, r * 0.55, variant.bodyColor, 0.82),
          scene.add.circle(16, -9, r * 0.55, variant.bodyColor, 0.82),
          body,
          scene.add.rectangle(0, -r - 3, 22, 7, variant.accentColor, 0.9),
          core,
        ];
      case 'mask':
        return [
          scene.add.rectangle(0, 0, r * 1.9, r * 1.65, variant.bodyColor, 0.96).setStrokeStyle(3, variant.accentColor, 0.95),
          scene.add.circle(-7, -3, 4, variant.coreColor, 0.95),
          scene.add.circle(7, -3, 4, variant.coreColor, 0.95),
          scene.add.rectangle(0, 9, 18, 4, variant.accentColor, 0.85),
        ];
      case 'orb':
      default:
        return [
          scene.add.circle(0, 0, r + 4, variant.accentColor, 0.18),
          body,
          scene.add.circle(-6, -5, 4, variant.accentColor, 0.95),
          core,
        ];
    }
  }
}
