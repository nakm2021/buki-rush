import Phaser from 'phaser';

export class PlayerWeapon extends Phaser.GameObjects.Container {
  private readonly core: Phaser.GameObjects.Arc;
  private readonly barrel: Phaser.GameObjects.Rectangle;
  private readonly sideBarrels: Phaser.GameObjects.Rectangle[];
  private readonly muzzle: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const glow = scene.add.circle(0, 4, 27, 0x38bdf8, 0.18);
    const grip = scene.add.rectangle(0, 15, 22, 26, 0x0f172a, 0.95);
    grip.setStrokeStyle(2, 0x67e8f9, 0.45);
    const leftBarrel = scene.add.rectangle(-9, -12, 7, 34, 0x93c5fd, 0.95);
    const rightBarrel = scene.add.rectangle(9, -12, 7, 34, 0x93c5fd, 0.95);
    this.core = scene.add.circle(0, 3, 15, 0x38bdf8, 0.98);
    this.core.setStrokeStyle(2, 0xe0f2fe, 0.85);
    this.barrel = scene.add.rectangle(0, -18, 10, 42, 0x22d3ee, 0.96);
    this.sideBarrels = [leftBarrel, rightBarrel];
    this.muzzle = scene.add.rectangle(0, -41, 30, 8, 0xf8fafc, 0.9);

    this.add([glow, grip, leftBarrel, rightBarrel, this.barrel, this.muzzle, this.core]);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(18);
    body.setOffset(-18, -18);
  }

  public setGlow(alpha: number): void {
    this.core.setAlpha(alpha);
  }

  public setPalette(primary: number, secondary: number): void {
    this.core.setFillStyle(primary, 0.98);
    this.barrel.setFillStyle(primary, 0.96);
    this.sideBarrels.forEach((barrel) => barrel.setFillStyle(secondary, 0.95));
    this.muzzle.setFillStyle(secondary, 0.92);
  }
}
