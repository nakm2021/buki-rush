import Phaser from 'phaser';
import { getWeaponAssetKeys } from '../systems/AssetCatalog';

export class PlayerWeapon extends Phaser.GameObjects.Container {
  private readonly glow: Phaser.GameObjects.Arc;
  private readonly backGlow: Phaser.GameObjects.Arc;
  private readonly core: Phaser.GameObjects.Arc;
  private readonly barrel: Phaser.GameObjects.Rectangle;
  private readonly sideBarrels: Phaser.GameObjects.Rectangle[];
  private readonly muzzle: Phaser.GameObjects.Rectangle;
  private readonly fins: Phaser.GameObjects.Triangle[];
  private readonly energyCells: Phaser.GameObjects.Arc[];
  private readonly evolutionWings: Phaser.GameObjects.Triangle[];
  private readonly evolutionHalo: Phaser.GameObjects.Arc;
  private readonly evolutionSparks: Phaser.GameObjects.Arc[];
  private readonly animeSprites = new Map<string, Phaser.GameObjects.Image>();
  private evolutionStage = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.glow = scene.add.circle(0, 4, 35, 0x38bdf8, 0.18);
    this.backGlow = scene.add.circle(0, 10, 24, 0x93c5fd, 0.16);
    const grip = scene.add.rectangle(0, 15, 22, 26, 0x0f172a, 0.95);
    grip.setStrokeStyle(2, 0x67e8f9, 0.45);
    const leftWing = scene.add.triangle(-18, 4, 0, -18, 18, 14, 2, 24, 0x1e3a8a, 0.86);
    const rightWing = scene.add.triangle(18, 4, 0, -18, 18, 14, 2, 24, 0x1e3a8a, 0.86);
    const evolvedLeftWing = scene.add.triangle(-52, -28, 8, -76, -8, 56, -76, 24, 0xfb7185, 0);
    const evolvedRightWing = scene.add.triangle(52, -28, -8, -76, 8, 56, 76, 24, 0xfb7185, 0);
    this.evolutionWings = [evolvedLeftWing, evolvedRightWing];
    this.evolutionWings.forEach((wing) => {
      wing.setVisible(false);
      wing.setBlendMode(Phaser.BlendModes.ADD);
    });
    this.evolutionHalo = scene.add.circle(0, -38, 42, 0xfef3c7, 0).setStrokeStyle(5, 0xfef3c7, 0);
    this.evolutionHalo.setVisible(false);
    this.evolutionHalo.setBlendMode(Phaser.BlendModes.ADD);
    const leftBarrel = scene.add.rectangle(-12, -13, 8, 38, 0x93c5fd, 0.95);
    const rightBarrel = scene.add.rectangle(12, -13, 8, 38, 0x93c5fd, 0.95);
    this.core = scene.add.circle(0, 4, 17, 0x38bdf8, 0.98);
    this.core.setStrokeStyle(2, 0xe0f2fe, 0.85);
    this.barrel = scene.add.rectangle(0, -20, 12, 48, 0x22d3ee, 0.96);
    this.sideBarrels = [leftBarrel, rightBarrel];
    this.muzzle = scene.add.rectangle(0, -48, 36, 9, 0xf8fafc, 0.9);
    this.fins = [leftWing, rightWing];
    this.energyCells = [
      scene.add.circle(-8, 8, 3, 0xf8fafc, 0.94),
      scene.add.circle(8, 8, 3, 0xf8fafc, 0.94),
      scene.add.circle(0, -7, 3, 0xf8fafc, 0.94),
    ];
    this.evolutionSparks = [
      scene.add.circle(-34, -68, 4, 0xfef3c7, 0),
      scene.add.circle(34, -68, 4, 0xfef3c7, 0),
      scene.add.circle(-46, -8, 3, 0xfef3c7, 0),
      scene.add.circle(46, -8, 3, 0xfef3c7, 0),
      scene.add.circle(0, -94, 5, 0xfef3c7, 0),
    ];
    this.evolutionSparks.forEach((spark) => {
      spark.setVisible(false);
      spark.setBlendMode(Phaser.BlendModes.ADD);
    });
    getWeaponAssetKeys().forEach((key, index) => {
      if (!scene.textures.exists(key)) {
        return;
      }
      const sprite = scene.add.image(0, -20, key).setDisplaySize(104, 190).setAlpha(index === 0 ? 0.98 : 0);
      sprite.setVisible(index === 0);
      this.animeSprites.set(key, sprite);
    });

    this.add([this.evolutionHalo, ...this.evolutionWings, this.glow, this.backGlow, leftWing, rightWing, grip, leftBarrel, rightBarrel, this.barrel, this.muzzle, this.core, ...this.energyCells, ...this.evolutionSparks]);
    this.animeSprites.forEach((sprite) => this.add(sprite));
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(18);
    body.setOffset(-18, -18);
  }

  public setGlow(alpha: number): void {
    this.core.setAlpha(alpha);
    this.glow.setAlpha(Math.min(0.55, alpha * 0.26 + this.evolutionStage * 0.035));
    this.backGlow.setAlpha(Math.min(0.5, alpha * 0.2 + this.evolutionStage * 0.03));
    this.animeSprites.forEach((sprite) => {
      if (sprite.visible) {
        sprite.setAlpha(Math.min(1, alpha + 0.08));
      }
    });
  }

  public setPalette(primary: number, secondary: number): void {
    this.core.setFillStyle(primary, 0.98);
    this.barrel.setFillStyle(primary, 0.96);
    this.sideBarrels.forEach((barrel) => barrel.setFillStyle(secondary, 0.95));
    this.muzzle.setFillStyle(secondary, 0.92);
    this.fins.forEach((fin) => fin.setFillStyle(secondary, 0.82));
    this.energyCells.forEach((cell) => cell.setFillStyle(primary, 0.94));
    this.glow.setFillStyle(primary, Math.max(0.14, this.glow.alpha));
    this.backGlow.setFillStyle(secondary, Math.max(0.12, this.backGlow.alpha));
    this.evolutionWings.forEach((wing, index) => wing.setFillStyle(index === 0 ? primary : secondary, wing.alpha));
    this.evolutionHalo.setStrokeStyle(5 + Math.min(4, this.evolutionStage), secondary, this.evolutionHalo.alpha);
    this.evolutionSparks.forEach((spark, index) => spark.setFillStyle(index % 2 === 0 ? secondary : primary, spark.alpha));
    this.animeSprites.forEach((sprite) => sprite.setTint(primary, secondary, primary, secondary));
  }

  public setEvolutionStage(stage: number, primary: number, secondary: number, aura: number): void {
    this.evolutionStage = Math.max(0, stage);
    const visible = this.evolutionStage >= 2;
    const power = Math.min(6, this.evolutionStage);
    const spriteWidth = 104 + power * 9;
    const spriteHeight = 190 + power * 16;

    this.glow.setRadius(35 + power * 6);
    this.backGlow.setRadius(24 + power * 5);
    this.evolutionWings.forEach((wing, index) => {
      wing.setVisible(visible);
      wing.setFillStyle(index === 0 ? primary : secondary, visible ? 0.18 + power * 0.08 : 0);
      wing.setScale(0.78 + power * 0.11, 0.86 + power * 0.13);
      wing.setAngle((index === 0 ? -1 : 1) * (8 + power * 2));
    });
    this.evolutionHalo.setVisible(visible);
    this.evolutionHalo.setStrokeStyle(5 + Math.min(4, power), aura, visible ? 0.3 + power * 0.08 : 0);
    this.evolutionHalo.setScale(0.82 + power * 0.1);
    this.evolutionSparks.forEach((spark, index) => {
      const sparkVisible = this.evolutionStage >= 3 || index < 2;
      spark.setVisible(visible && sparkVisible);
      spark.setFillStyle(index % 2 === 0 ? aura : secondary, visible ? 0.34 + power * 0.06 : 0);
      spark.setScale(0.86 + power * 0.14 + (index % 2) * 0.18);
    });
    this.animeSprites.forEach((sprite) => sprite.setDisplaySize(spriteWidth, spriteHeight));
  }

  public setWeaponSkin(key: string): void {
    if (this.animeSprites.size === 0) {
      return;
    }
    const selectedKey = this.animeSprites.has(key) ? key : getWeaponAssetKeys()[0];
    this.animeSprites.forEach((sprite, spriteKey) => {
      sprite.setVisible(spriteKey === selectedKey);
      sprite.setAlpha(spriteKey === selectedKey ? 1 : 0);
    });
  }
}
