import Phaser from 'phaser';

export class Bullet extends Phaser.GameObjects.Arc {
  private speed = 420;

  constructor(scene: Phaser.Scene, x: number, y: number, color = 0x67e8f9) {
    super(scene, x, y, 5, 0, 360, false, color, 0.96);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(5);
    body.setOffset(-5, -5);
  }

  public update(_time: number, delta: number): void {
    this.y -= this.speed * (delta / 1000);
  }

  public setVelocity(v: number): void {
    this.speed = v;
  }
}
