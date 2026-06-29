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
    const darkColor = option.good ? 0x111827 : 0x450a0a;
    const icon = this.getIcon(option);
    const shadow = scene.add.ellipse(5, 47, 140, 25, 0x020617, 0.36);
    const glow = scene.add.circle(0, 0, option.good ? 64 : 58, mainColor, option.good ? 0.24 : 0.26);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    const rail = scene.add.rectangle(0, 0, 136, 76, 0x020617, 0.44);
    rail.setStrokeStyle(2, mainColor, 0.5);
    const leftBlade = scene.add.triangle(-71, -1, 0, 0, 28, -42, 28, 42, mainColor, 0.82);
    const rightBlade = scene.add.triangle(71, -1, 28, 0, 0, -42, 0, 42, mainColor, 0.82);
    const body = scene.add.rectangle(0, 0, 108, 58, darkColor, 0.94);
    body.setStrokeStyle(4, option.good ? mainColor : 0xffd5da, 0.95);
    const core = scene.add.rectangle(-4, 0, 84, 42, mainColor, option.good ? 0.88 : 0.72);
    core.setStrokeStyle(2, 0xffffff, option.good ? 0.8 : 0.48);
    const capsule = scene.add.ellipse(-37, 0, 42, 52, 0x020617, 0.58);
    capsule.setStrokeStyle(3, option.good ? 0xffffff : 0xffd5da, 0.6);
    const weaponHandle = scene.add.rectangle(-37, 12, 8, 26, 0xe5e7eb, option.good ? 0.9 : 0.54);
    const weaponBarrel = scene.add.rectangle(-37, -12, 20, 8, 0xf8fafc, option.good ? 0.94 : 0.62);
    const weaponCore = scene.add.circle(-37, 0, 8, mainColor, 0.95);
    const circuitA = scene.add.line(0, 0, -6, -20, 34, -20, 0xffffff, 0.42).setLineWidth(2);
    const circuitB = scene.add.line(0, 0, -6, 20, 38, 20, 0x020617, 0.26).setLineWidth(3);
    const chipA = scene.add.rectangle(43, -23, 10, 5, 0xffffff, option.good ? 0.66 : 0.38);
    const chipB = scene.add.rectangle(49, 23, 7, 7, 0xffffff, option.good ? 0.52 : 0.32);
    const iconText = scene.add.text(-37, -1, icon, {
      fontSize: icon.length > 2 ? '11px' : '16px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 3,
    }).setOrigin(0.5);
    const text = scene.add.text(20, 0, option.label, {
      fontSize: option.label.length > 5 ? '18px' : '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#111827',
      strokeThickness: 5,
    }).setOrigin(0.5);
    const arrow = scene.add.triangle(55, 32, 0, 0, 14, 7, 0, 14, option.good ? 0xffffff : 0xfee2e2, 0.78);

    container.add([shadow, glow, rail, leftBlade, rightBlade, body, core, capsule, weaponHandle, weaponBarrel, weaponCore, circuitA, circuitB, chipA, chipB, iconText, text, arrow]);
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
