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

    const glow = scene.add.rectangle(0, 0, 132, 84, option.color, option.good ? 0.24 : 0.14);
    const shine = scene.add.rectangle(0, -21, 108, 12, 0xffffff, option.good ? 0.16 : 0.08);
    const body = scene.add.rectangle(0, 0, 116, 68, option.color, 0.9);
    body.setStrokeStyle(3, option.good ? 0xe0f2fe : 0xfca5a5, 0.95);
    const text = scene.add.text(0, 0, option.label, {
      fontSize: option.label.length > 5 ? '18px' : '24px',
      color: '#eff6ff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 4,
    }).setOrigin(0.5);

    container.add([glow, body, shine, text]);
    return container;
  }
}
