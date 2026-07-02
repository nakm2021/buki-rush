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
    const icon = this.getIcon(option);
    const itemAssetKey = this.getItemAssetKey(option);
    const grade = this.getGradeLabel(option);
    const shadow = scene.add.ellipse(0, 48, 106, 22, 0x020617, 0.32);
    const glow = scene.add.circle(0, 0, option.good ? 54 : 50, mainColor, option.good ? 0.24 : 0.28);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    const itemGlow = scene.add.circle(0, -2, this.isLegendary(option) ? 38 : this.isRare(option) ? 34 : 29, mainColor, option.good ? 0.28 : 0.34);
    itemGlow.setBlendMode(Phaser.BlendModes.ADD);
    const item = scene.textures.exists(itemAssetKey)
      ? scene.add.image(0, -2, itemAssetKey).setDisplaySize(this.isLegendary(option) ? 74 : this.isRare(option) ? 66 : 56, this.isLegendary(option) ? 76 : this.isRare(option) ? 68 : 58)
      : scene.add.circle(0, -2, 26, mainColor, 0.92);
    const gradeText = scene.add.text(-30, -34, grade, {
      fontSize: grade.length > 2 ? '10px' : '12px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 3,
    }).setOrigin(0.5);
    const text = scene.add.text(0, 18, option.label, {
      fontSize: option.label.length > 6 ? '15px' : option.label.length > 4 ? '18px' : '22px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#111827',
      strokeThickness: 5,
    }).setOrigin(0.5);
    const kindText = scene.add.text(28, -34, icon, {
      fontSize: icon.length > 2 ? '9px' : '10px',
      color: '#e0f2fe',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 2,
    }).setOrigin(0.5);

    container.add([shadow, glow, itemGlow, item, gradeText, kindText, text]);
    return container;
  }

  private getItemAssetKey(option: GateOption): string {
    if (!option.good) return 'itemCursedBox';
    if (option.kind === 'add' || option.kind === 'level') return 'itemRushCore';
    if (option.kind === 'power' || option.kind === 'rapid') return 'itemWeaponCache';
    if (option.kind === 'crit') return 'itemPrismCrown';
    if (option.kind === 'pierce') return 'itemVoidDrill';
    if (option.kind === 'special') return 'itemOverdriveOrb';
    if (this.isLegendary(option)) return option.kind === 'fusion' ? 'itemMythicRelicChest' : 'itemSolarLegendChest';
    if (this.isRare(option)) return 'itemRareChest';
    return 'itemBukiCapsule';
  }

  private getGradeLabel(option: GateOption): string {
    if (!option.good) return 'BAD';
    if (this.isLegendary(option)) return 'UR';
    if (this.isRare(option)) return 'SR';
    return 'N';
  }

  private isLegendary(option: GateOption): boolean {
    return option.kind === 'fusion' || option.kind === 'rarity' || option.value >= 8 || (option.kind === 'multiply' && option.value >= 3);
  }

  private isRare(option: GateOption): boolean {
    return option.kind === 'module' || option.kind === 'tier' || option.kind === 'element' || option.kind === 'archetype' || option.value >= 3;
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
      case 'crit':
        return 'CR';
      case 'pierce':
        return 'P';
      case 'shield':
        return 'SH';
      case 'special':
        return 'SP';
      default:
        return '^';
    }
  }
}
