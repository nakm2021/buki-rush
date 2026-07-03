import Phaser from 'phaser';

export type BulletShape = 'orb' | 'bow' | 'slash' | 'rocket' | 'guard' | 'skull' | 'pierce';

export class Bullet extends Phaser.GameObjects.Container {
  private speed = 420;

  constructor(scene: Phaser.Scene, x: number, y: number, color = 0x67e8f9, shape: BulletShape = 'orb') {
    super(scene, x, y);
    this.add(this.createShape(scene, color, shape));
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.configureBody(shape);
  }

  public update(_time: number, delta: number): void {
    this.y -= this.speed * (delta / 1000);
    (this.body as Phaser.Physics.Arcade.Body | undefined)?.updateFromGameObject();
  }

  public setVelocity(v: number): void {
    this.speed = v;
  }

  private configureBody(shape: BulletShape): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    if (shape === 'rocket' || shape === 'pierce' || shape === 'slash') {
      body.setSize(14, 30);
      body.setOffset(-7, -15);
      return;
    }
    if (shape === 'guard') {
      body.setCircle(10);
      body.setOffset(-10, -10);
      return;
    }
    body.setCircle(7);
    body.setOffset(-7, -7);
  }

  private createShape(scene: Phaser.Scene, color: number, shape: BulletShape): Phaser.GameObjects.GameObject[] {
    const glow = scene.add.circle(0, 0, 11, color, shape === 'orb' ? 0.26 : 0.16);
    glow.setBlendMode(Phaser.BlendModes.ADD);

    switch (shape) {
      case 'bow': {
        const arc = scene.add.arc(0, 0, 12, 230, 130, false, color, 0).setStrokeStyle(3, color, 0.92);
        const string = scene.add.line(0, 0, -8, -10, -8, 10, 0xffffff, 0.76).setLineWidth(2);
        const arrow = scene.add.triangle(4, -3, 0, -12, 7, 6, -7, 6, color, 0.95).setAngle(180);
        return [glow, arc, string, arrow];
      }
      case 'slash': {
        const slash = scene.add.rectangle(0, 0, 8, 40, color, 0.72).setAngle(-18);
        slash.setStrokeStyle(2, 0xffffff, 0.42);
        const edge = scene.add.rectangle(4, -2, 3, 34, 0xffffff, 0.32).setAngle(-18);
        edge.setBlendMode(Phaser.BlendModes.ADD);
        return [glow, slash, edge];
      }
      case 'rocket': {
        const body = scene.add.rectangle(0, 1, 12, 24, color, 0.94);
        body.setStrokeStyle(2, 0xffffff, 0.34);
        const nose = scene.add.triangle(0, -15, -7, 0, 7, 0, 0, -12, 0xffffff, 0.9);
        const finL = scene.add.triangle(-8, 8, 0, -6, 7, 8, 0, 8, color, 0.86).setAngle(-22);
        const finR = scene.add.triangle(8, 8, 0, -6, 7, 8, 0, 8, color, 0.86).setAngle(22);
        const flame = scene.add.triangle(0, 18, -5, 0, 5, 0, 0, 12, 0xfff176, 0.86);
        return [glow, flame, finL, finR, body, nose];
      }
      case 'guard': {
        const shield = scene.add.polygon(0, 0, [0, -15, 13, -7, 10, 10, 0, 17, -10, 10, -13, -7], color, 0.88);
        shield.setStrokeStyle(2, 0xffffff, 0.56);
        const core = scene.add.circle(0, -1, 5, 0xffffff, 0.48);
        return [glow, shield, core];
      }
      case 'skull': {
        const head = scene.add.circle(0, -2, 10, color, 0.9);
        head.setStrokeStyle(2, 0xffffff, 0.34);
        const eyeL = scene.add.circle(-4, -4, 2.4, 0x020617, 0.86);
        const eyeR = scene.add.circle(4, -4, 2.4, 0x020617, 0.86);
        const jaw = scene.add.rectangle(0, 8, 10, 7, color, 0.82);
        const tooth = scene.add.rectangle(0, 8, 2, 7, 0xffffff, 0.32);
        return [glow, head, jaw, eyeL, eyeR, tooth];
      }
      case 'pierce': {
        const spear = scene.add.polygon(0, 0, [0, -20, 7, -4, 4, 18, 0, 24, -4, 18, -7, -4], color, 0.94);
        spear.setStrokeStyle(2, 0xffffff, 0.42);
        const core = scene.add.rectangle(0, 4, 3, 26, 0xffffff, 0.42);
        core.setBlendMode(Phaser.BlendModes.ADD);
        return [glow, spear, core];
      }
      case 'orb':
      default: {
        const orb = scene.add.circle(0, 0, 5, color, 0.96);
        orb.setStrokeStyle(2, 0xffffff, 0.35);
        return [glow, orb];
      }
    }
  }
}
