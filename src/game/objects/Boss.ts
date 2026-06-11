import Phaser from 'phaser';

export class Boss extends Phaser.GameObjects.Container {
  private hp: number;

  constructor(scene: Phaser.Scene, x: number, y: number, hp: number) {
    super(scene, x, y);

    this.hp = hp;

    const glow = scene.add.rectangle(0, 6, 170, 96, 0xff174d, 0.22);
    const wing = scene.add.rectangle(0, -22, 188, 20, 0xff5fa2, 0.88);
    const core = scene.add.rectangle(0, 0, 144, 84, 0xff315f, 0.97);
    core.setStrokeStyle(4, 0xfff1a8, 0.98);
    const eye = scene.add.circle(-30, -6, 9, 0x0f172a, 0.96);
    const eye2 = scene.add.circle(30, -6, 9, 0x0f172a, 0.96);
    const mouth = scene.add.rectangle(0, 20, 62, 8, 0x7f1025, 0.95);
    const label = scene.add.text(0, 0, 'BOSS', {
      fontSize: '18px',
      color: '#fff7ed',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    this.add([glow, wing, core, eye, eye2, mouth, label]);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const bossBody = this.body as Phaser.Physics.Arcade.Body;
    bossBody.setSize(160, 95);
    bossBody.setOffset(-80, -48);
  }

  public getHp(): number {
    return this.hp;
  }

  public damage(amount: number): boolean {
    this.hp -= amount;
    return this.hp <= 0;
  }
}
