import Phaser from 'phaser';

export class PlayerWeapon extends Phaser.GameObjects.Container {
  private readonly core: Phaser.GameObjects.Arc;
  private readonly barrel: Phaser.GameObjects.Rectangle;
  private readonly sideBarrels: Phaser.GameObjects.Rectangle[];
  private readonly muzzle: Phaser.GameObjects.Rectangle;
  private readonly fins: Phaser.GameObjects.Triangle[];
  private readonly energyCells: Phaser.GameObjects.Arc[];
  private readonly animeSprites: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const glow = scene.add.circle(0, 4, 35, 0x38bdf8, 0.18);
    const backGlow = scene.add.circle(0, 10, 24, 0x93c5fd, 0.16);
    const grip = scene.add.rectangle(0, 15, 22, 26, 0x0f172a, 0.95);
    grip.setStrokeStyle(2, 0x67e8f9, 0.45);
    const leftWing = scene.add.triangle(-18, 4, 0, -18, 18, 14, 2, 24, 0x1e3a8a, 0.86);
    const rightWing = scene.add.triangle(18, 4, 0, -18, 18, 14, 2, 24, 0x1e3a8a, 0.86);
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
    const spriteKeys = ['weaponAnime', 'weaponPhoenix', 'weaponCrystal'];
    spriteKeys.forEach((key, index) => {
      if (!scene.textures.exists(key)) {
        return;
      }
      const sprite = scene.add.image(0, -20, key).setDisplaySize(104, 190).setAlpha(index === 0 ? 0.98 : 0);
      sprite.setVisible(index === 0);
      this.animeSprites.push(sprite);
    });

    this.add([glow, backGlow, leftWing, rightWing, grip, leftBarrel, rightBarrel, this.barrel, this.muzzle, this.core, ...this.energyCells]);
    this.animeSprites.forEach((sprite) => this.add(sprite));
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(18);
    body.setOffset(-18, -18);
  }

  public setGlow(alpha: number): void {
    this.core.setAlpha(alpha);
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
    this.animeSprites.forEach((sprite) => sprite.setTint(primary, secondary, primary, secondary));
  }

  public setWeaponSkin(index: number): void {
    if (this.animeSprites.length === 0) {
      return;
    }
    const selectedIndex = index % this.animeSprites.length;
    this.animeSprites.forEach((sprite, spriteIndex) => {
      sprite.setVisible(spriteIndex === selectedIndex);
      sprite.setAlpha(spriteIndex === selectedIndex ? 1 : 0);
    });
  }
}
