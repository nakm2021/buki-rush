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
    const shadow = scene.add.ellipse(6, 43, 128, 24, 0x020617, 0.28);
    const backPlate = scene.add.rectangle(0, 8, 124, 70, darkColor, 0.95);
    backPlate.setStrokeStyle(2, 0x020617, 0.45);
    const glow = scene.add.rectangle(0, -1, 140, 88, mainColor, option.good ? 0.2 : 0.16);
    const leftPost = scene.add.rectangle(-55, 42, 9, 32, 0x334155, 0.95);
    const rightPost = scene.add.rectangle(55, 42, 9, 32, 0x334155, 0.95);
    const body = scene.add.rectangle(0, 0, 116, 68, mainColor, 0.95);
    body.setStrokeStyle(4, option.good ? 0xf8fafc : 0xfee2e2, 0.95);
    const topBevel = scene.add.rectangle(0, -27, 104, 10, 0xffffff, option.good ? 0.34 : 0.18);
    const bottomBevel = scene.add.rectangle(0, 27, 106, 8, 0x020617, 0.16);
    const iconBack = scene.add.circle(-39, -1, 19, 0x020617, 0.32);
    iconBack.setStrokeStyle(2, 0xffffff, 0.35);
    const iconText = scene.add.text(-39, -2, icon, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 3,
    }).setOrigin(0.5);
    const text = scene.add.text(14, 0, option.label, {
      fontSize: option.label.length > 5 ? '18px' : '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#111827',
      strokeThickness: 5,
    }).setOrigin(0.5);
    const arrow = scene.add.triangle(41, 28, 0, 0, 12, 7, 0, 14, option.good ? 0xffffff : 0xfee2e2, 0.75);

    container.add([shadow, leftPost, rightPost, glow, backPlate, body, topBevel, bottomBevel, iconBack, iconText, text, arrow]);
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
