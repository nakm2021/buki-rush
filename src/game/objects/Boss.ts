import Phaser from 'phaser';

export class Boss extends Phaser.GameObjects.Container {
  private hp: number;

  constructor(scene: Phaser.Scene, x: number, y: number, hp: number) {
    super(scene, x, y);

    this.hp = hp;

    const aura = scene.add.circle(0, 40, 190, 0xff174d, 0.14);
    const image = scene.textures.exists('bossDragon') ? scene.add.image(0, 40, 'bossDragon').setDisplaySize(386, 748) : undefined;
    const glow = scene.add.rectangle(0, 6, 220, 170, 0xff174d, 0.18);
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

    this.add(image ? [aura, glow, image, label] : [aura, glow, wing, core, eye, eye2, mouth, label]);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const bossBody = this.body as Phaser.Physics.Arcade.Body;
    bossBody.setSize(230, 260);
    bossBody.setOffset(-115, -90);

    scene.tweens.add({
      targets: this,
      scaleX: 1.035,
      scaleY: 1.025,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public getHp(): number {
    return this.hp;
  }

  public damage(amount: number): boolean {
    this.hp -= amount;
    return this.hp <= 0;
  }
}
