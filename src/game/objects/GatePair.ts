import Phaser from 'phaser';
import type { GateOption } from '../types/GameTypes';

export class GatePair extends Phaser.GameObjects.Container {
  public readonly left: Phaser.GameObjects.Container;
  public readonly right: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number, left: GateOption, right: GateOption) {
    super(scene, x, y);

    this.left = this.createGate(scene, x - 82, y, left);
    this.right = this.createGate(scene, x + 82, y, right);
    scene.add.existing(this);

    scene.physics.add.existing(this.left);
    scene.physics.add.existing(this.right);
    const leftBody = this.left.body as Phaser.Physics.Arcade.Body;
    const rightBody = this.right.body as Phaser.Physics.Arcade.Body;
    leftBody.setSize(120, 72);
    rightBody.setSize(120, 72);
    leftBody.setOffset(-60, -36);
    rightBody.setOffset(-60, -36);
  }

  private createGate(scene: Phaser.Scene, x: number, y: number, option: GateOption): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    container.setData('kind', option.kind);
    container.setData('value', option.value);
    container.setData('label', option.label);
    container.setData('good', option.good);
    container.setData('color', option.color);
    container.setData('element', option.element);
    container.setData('archetype', option.archetype);
    container.setData('module', option.module);
    container.setData('rarity', option.rarity);
    container.setData('pair', this);

    const mainColor = option.good ? option.color : 0xef4444;
    const darkColor = option.good ? 0x0f172a : 0x450a0a;
    const icon = this.getIcon(option);
    const shadow = scene.add.ellipse(6, 45, 132, 26, 0x020617, 0.34);
    const glow = scene.add.circle(0, 0, option.good ? 58 : 52, mainColor, option.good ? 0.2 : 0.22);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    const backPlate = scene.add.polygon(0, 0, [-50, -34, 48, -34, 62, 0, 48, 34, -50, 34, -62, 0], darkColor, 0.95);
    backPlate.setStrokeStyle(2, 0x020617, 0.45);
    const body = scene.add.polygon(0, 0, [-42, -29, 42, -29, 54, 0, 42, 29, -42, 29, -54, 0], mainColor, 0.96);
    body.setStrokeStyle(4, option.good ? 0xf8fafc : 0xfee2e2, 0.95);
    const topBevel = scene.add.polygon(0, -12, [-34, -13, 28, -13, 42, 0, 27, 8, -31, 6, -43, -1], 0xffffff, option.good ? 0.28 : 0.13);
    const bottomBevel = scene.add.polygon(0, 16, [-38, 2, 37, 2, 48, 12, 33, 18, -34, 18, -48, 8], 0x020617, 0.18);
    const leftPost = scene.add.triangle(-58, 28, 0, 0, 13, 8, 6, 36, option.good ? 0x334155 : 0x7f1d1d, 0.95);
    const rightPost = scene.add.triangle(58, 28, 13, 0, 0, 8, 7, 36, option.good ? 0x334155 : 0x7f1d1d, 0.95);
    const iconBack = option.good
      ? scene.add.star(-39, -1, 7, 12, 21, 0x020617, 0.34)
      : scene.add.circle(-39, -1, 20, 0x020617, 0.48);
    iconBack.setStrokeStyle(2, option.good ? 0xffffff : 0xffd5da, 0.45);
    const iconText = scene.add.text(-39, -2, icon, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 3,
    }).setOrigin(0.5);
    const trimA = scene.add.circle(45, -24, 5, option.good ? 0xffffff : 0xff174d, option.good ? 0.7 : 0.95);
    const trimB = scene.add.circle(45, 24, 5, option.good ? 0xffffff : 0xff174d, option.good ? 0.45 : 0.75);
    const enemyEye = scene.add.circle(24, -14, 4, 0xffffff, option.good ? 0 : 0.95);
    const enemyEye2 = scene.add.circle(40, -14, 4, 0xffffff, option.good ? 0 : 0.95);
    const enemyMouth = scene.add.triangle(32, 16, 0, 0, 18, 0, 9, 10, 0x020617, option.good ? 0 : 0.9);
    const text = scene.add.text(14, 0, option.label, {
      fontSize: option.label.length > 5 ? '18px' : '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#111827',
      strokeThickness: 5,
    }).setOrigin(0.5);
    const arrow = scene.add.triangle(41, 30, 0, 0, 12, 7, 0, 14, option.good ? 0xffffff : 0xfee2e2, 0.75);

    container.add([shadow, glow, leftPost, rightPost, backPlate, body, topBevel, bottomBevel, iconBack, iconText, trimA, trimB, enemyEye, enemyEye2, enemyMouth, text, arrow]);
    return container;
  }

  private getIcon(option: GateOption): string {
    if (!option.good) return '!';
    switch (option.kind) {
      case 'add':
        return '+';
      case 'multiply':
        return 'x';
      case 'power':
        return 'ATK';
      case 'heal':
        return 'HP';
      case 'level':
        return 'Lv';
      case 'rapid':
        return '>>';
      case 'element':
        return '*';
      case 'archetype':
        return 'W';
      case 'module':
        return 'M';
      case 'rarity':
        return 'R';
      case 'fusion':
        return 'F';
      default:
        return '^';
    }
  }
}
