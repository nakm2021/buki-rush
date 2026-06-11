import Phaser from 'phaser';
import { Boss } from '../objects/Boss';
import { Bullet } from '../objects/Bullet';
import { Enemy } from '../objects/Enemy';
import { GatePair } from '../objects/GatePair';
import { PlayerWeapon } from '../objects/PlayerWeapon';
import { findEnemyVariant } from '../systems/EnemyCatalog';
import { PlayerInputController } from '../systems/PlayerInputController';
import { loadBestDistance, saveBestDistance } from '../systems/RecordSystem';
import { BOSS_STEP_INTERVAL, createBossHp, createLoopStep, INITIAL_STEP_INTERVAL, LOOP_STEP_INTERVAL, OPENING_STEPS } from '../systems/StageSpawner';
import { applyEnemyImpact, applyGateEffect, clamp } from '../systems/UpgradeSystem';
import { getWeaponColors, getWeaponName } from '../systems/WeaponEvolution';
import type { GateOption, PlayerStats, StageStep } from '../types/GameTypes';

type ControlKeys = Record<'W' | 'S' | 'A' | 'D' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT', Phaser.Input.Keyboard.Key>;

const PLAYER_MIN_X = 40;
const PLAYER_MAX_X = 360;
const PLAYER_MIN_Y = 360;
const PLAYER_MAX_Y = 660;

export default class GameScene extends Phaser.Scene {
  private player!: PlayerWeapon;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private inputController!: PlayerInputController;
  private stats: PlayerStats = { weaponCount: 1, power: 1, level: 1, fireRate: 1, element: 'neutral', tier: 1 };
  private bullets!: Phaser.GameObjects.Group;
  private gates!: Phaser.GameObjects.Group;
  private enemies!: Phaser.GameObjects.Group;
  private obstacles!: Phaser.GameObjects.Group;
  private effects!: Phaser.GameObjects.Group;
  private weaponText!: Phaser.GameObjects.Text;
  private powerText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private distanceText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;
  private weaponNameText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private boss?: Boss;
  private bossHpBar!: Phaser.GameObjects.Rectangle;
  private bossHpFill!: Phaser.GameObjects.Rectangle;
  private bossHpText!: Phaser.GameObjects.Text;
  private bossMaxHp = createBossHp(0);
  private bossHp = this.bossMaxHp;
  private playerHp = 5;
  private fireTimer = 0;
  private isGameOver = false;
  private stageTimer = 0;
  private nextStageIndex = 0;
  private nextLoopSpawnTime = 0;
  private loopStepIndex = 0;
  private bossLoopIndex = 0;
  private distance = 0;
  private bestDistance = 0;
  private pointerTarget: Phaser.Math.Vector2 | null = null;
  private controlKeys!: ControlKeys;
  private weaponParts: Array<Phaser.GameObjects.Arc | Phaser.GameObjects.Rectangle> = [];
  private speedLines: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super('GameScene');
  }

  create(): void {
    const { width, height } = this.scale;

    this.drawTrack(width, height);

    this.player = new PlayerWeapon(this, width / 2, 600);
    this.player.setDepth(3);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setAllowGravity(false);
    this.playerBody.setCollideWorldBounds(true);
    this.playerBody.setBounce(0, 0);

    this.bullets = this.add.group();
    this.gates = this.add.group();
    this.enemies = this.add.group();
    this.obstacles = this.add.group();
    this.effects = this.add.group();

    this.createStatusPanel();
    this.createInput();
    this.bestDistance = loadBestDistance();

    this.physics.add.overlap(this.player, this.gates, (_player, gateObject) => this.handleGateCollision(gateObject as Phaser.GameObjects.Container), undefined, this);
    this.physics.add.overlap(this.player, this.enemies, (_player, enemyObject) => this.handleEnemyCollision(enemyObject as Enemy), undefined, this);
    this.physics.add.overlap(this.bullets, this.enemies, (bulletObject, enemyObject) => this.hitEnemy(bulletObject as Bullet, enemyObject as Enemy), undefined, this);
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver) {
      return;
    }

    const smoothDelta = Math.min(delta, 33);
    this.stageTimer += smoothDelta;
    this.fireTimer += delta;
    this.distance += (smoothDelta / 1000) * (18 + this.stats.level * 1.5);

    this.spawnStageEvents();
    this.updateMovement(smoothDelta);
    this.updateSpeedLines(smoothDelta);
    this.updateBullets(smoothDelta);
    this.moveFlowingObjects(smoothDelta);
    this.updateBossBar();
    this.updateStatusPanel();

    const fireInterval = Math.max(90, 265 - this.stats.fireRate * 38 - Math.min(this.stats.weaponCount, 32) * 4);
    if (this.fireTimer >= fireInterval) {
      this.fireTimer = 0;
      this.fireWeapons();
    }

    this.updateWeaponParts(smoothDelta);
  }

  private drawTrack(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, 0x050713, 1);
    this.add.rectangle(width / 2, height / 2, 292, height, 0x0d1631, 0.52);

    [64, 132, 200, 268, 336].forEach((x) => {
      this.add.line(x, height / 2, 0, 0, 0, height, 0x4f8cff, x === 200 ? 0.13 : 0.09).setLineWidth(x === 200 ? 2 : 1);
    });

    for (let y = 0; y < height; y += 40) {
      this.add.line(width / 2, y, -146, 0, 146, 0, 0x6ee7ff, 0.07).setLineWidth(1);
    }

    for (let i = 0; i < 18; i++) {
      const x = 54 + (i % 6) * 58;
      const y = (i * 51) % height;
      const line = this.add.rectangle(x, y, 2, 52 + (i % 3) * 18, 0x9bdcff, 0.11);
      line.setAngle(i % 2 === 0 ? -8 : 8);
      this.speedLines.push(line);
    }

    this.add.rectangle(width / 2, PLAYER_MIN_Y - 8, 328, 2, 0x38bdf8, 0.12);
    this.add.rectangle(width / 2, PLAYER_MAX_Y + 8, 328, 2, 0x38bdf8, 0.12);
  }

  private createStatusPanel(): void {
    const panel = this.add.rectangle(200, 58, 364, 88, 0x09111f, 0.86);
    panel.setStrokeStyle(2, 0x38bdf8, 0.38);
    panel.setDepth(8);

    const items = [
      { label: '武器数', x: 58, color: '#86efac' },
      { label: '攻撃力', x: 154, color: '#93c5fd' },
      { label: 'レベル', x: 248, color: '#d8b4fe' },
      { label: '耐久', x: 334, color: '#fecaca' },
    ];

    items.forEach((item) => {
      this.add.text(item.x, 27, item.label, { fontSize: '11px', color: item.color, fontFamily: 'Arial, sans-serif' }).setOrigin(0.5).setDepth(9);
    });

    this.weaponText = this.add.text(58, 50, '1', { fontSize: '22px', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0.5).setDepth(9);
    this.powerText = this.add.text(154, 50, '1', { fontSize: '22px', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0.5).setDepth(9);
    this.levelText = this.add.text(248, 50, '1', { fontSize: '22px', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0.5).setDepth(9);
    this.hpText = this.add.text(334, 50, '5', { fontSize: '22px', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0.5).setDepth(9);
    this.weaponNameText = this.add.text(22, 82, '無-Runner Lv.1', { fontSize: '12px', color: '#e0f2fe', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(9);
    this.distanceText = this.add.text(274, 82, '0m', { fontSize: '12px', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(1, 0.5).setDepth(9);
    this.bestText = this.add.text(378, 82, 'BEST 0m', { fontSize: '12px', color: '#fde68a', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(1, 0.5).setDepth(9);
  }

  private createInput(): void {
    this.controlKeys = this.input.keyboard!.addKeys('W,S,A,D,UP,DOWN,LEFT,RIGHT') as ControlKeys;
    this.inputController = new PlayerInputController(this);
    this.inputController.setup();

    this.events.on('player-pointer-target', (x: number, y: number) => {
      this.pointerTarget = new Phaser.Math.Vector2(clamp(x, PLAYER_MIN_X, PLAYER_MAX_X), clamp(y, PLAYER_MIN_Y, PLAYER_MAX_Y));
    });

    this.events.on('player-pointer-release', () => {
      this.pointerTarget = null;
    });
  }

  private spawnStageEvents(): void {
    while (this.nextStageIndex < OPENING_STEPS.length && this.stageTimer >= OPENING_STEPS[this.nextStageIndex].time) {
      this.spawnStageStep(OPENING_STEPS[this.nextStageIndex]);
      this.nextStageIndex += 1;

      if (this.nextStageIndex === OPENING_STEPS.length) {
        this.nextLoopSpawnTime = this.stageTimer + INITIAL_STEP_INTERVAL;
      }
    }

    if (this.nextStageIndex < OPENING_STEPS.length || this.stageTimer < this.nextLoopSpawnTime) {
      return;
    }

    while (this.stageTimer >= this.nextLoopSpawnTime) {
      const difficulty = Math.floor(this.loopStepIndex / 6);
      this.spawnStageStep(createLoopStep(this.loopStepIndex, difficulty));
      this.loopStepIndex += 1;
      this.nextLoopSpawnTime += Math.max(1050, LOOP_STEP_INTERVAL - difficulty * 35);

      if (this.loopStepIndex % BOSS_STEP_INTERVAL === 0 && !this.boss) {
        this.spawnBoss();
      }
    }
  }

  private spawnStageStep(step: StageStep): void {
    if (step.gateLine) {
      const pair = new GatePair(this, 200, step.gateLine.y, step.gateLine.left, step.gateLine.right);
      pair.setDepth(2);
      this.gates.add(pair.left);
      this.gates.add(pair.right);
    }

    if (step.enemy) {
      const enemy = new Enemy(this, step.enemy.x, step.enemy.y, step.enemy.hp ?? 10, findEnemyVariant(step.enemy.variantId));
      enemy.setDepth(2);
      this.enemies.add(enemy);
    }

    if (step.obstacle) {
      const obstacle = this.add.rectangle(step.obstacle.x, step.obstacle.y, step.obstacle.width, step.obstacle.height, 0x334155, 0.45);
      this.obstacles.add(obstacle);
      this.physics.add.existing(obstacle);
      const body = obstacle.body as Phaser.Physics.Arcade.Body;
      body.setImmovable(true);
    }
  }

  private updateMovement(delta: number): void {
    const dt = delta / 1000;
    let moveX = 0;
    let moveY = 0;

    if (this.controlKeys.A.isDown || this.controlKeys.LEFT.isDown) moveX -= 1;
    if (this.controlKeys.D.isDown || this.controlKeys.RIGHT.isDown) moveX += 1;
    if (this.controlKeys.W.isDown || this.controlKeys.UP.isDown) moveY -= 1;
    if (this.controlKeys.S.isDown || this.controlKeys.DOWN.isDown) moveY += 1;

    if (moveX !== 0 || moveY !== 0) {
      const length = Math.hypot(moveX, moveY);
      const speed = 315;
      this.player.x += (moveX / length) * speed * dt;
      this.player.y += (moveY / length) * speed * dt;
      this.pointerTarget = null;
    } else if (this.pointerTarget) {
      const follow = 1 - Math.pow(0.0018, dt);
      this.player.x = Phaser.Math.Linear(this.player.x, this.pointerTarget.x, follow);
      this.player.y = Phaser.Math.Linear(this.player.y, this.pointerTarget.y, follow);
    }

    this.player.setPosition(clamp(this.player.x, PLAYER_MIN_X, PLAYER_MAX_X), clamp(this.player.y, PLAYER_MIN_Y, PLAYER_MAX_Y));
    this.playerBody.updateFromGameObject();
  }

  private updateSpeedLines(delta: number): void {
    const move = (190 + this.stats.level * 14) * (delta / 1000);
    this.speedLines.forEach((line, index) => {
      line.y += move + (index % 3) * 1.6;
      if (line.y > 760) {
        line.y = -50;
      }
    });
  }

  private moveFlowingObjects(delta: number): void {
    const speed = 140 + this.stats.level * 8 + Math.min(90, this.distance * 0.035);

    this.gates.getChildren().forEach((child) => {
      const gate = child as Phaser.GameObjects.Container;
      gate.y += speed * (delta / 1000);
      (gate.body as Phaser.Physics.Arcade.Body | undefined)?.updateFromGameObject();
      if (gate.y > 790) gate.destroy();
    });

    this.enemies.getChildren().forEach((enemy) => {
      const obj = enemy as Enemy;
      obj.y += (speed + 8) * (delta / 1000);
      (obj.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
      if (obj.y > 790) obj.destroy();
    });

    this.obstacles.getChildren().forEach((obstacle) => {
      const obstacleObject = obstacle as Phaser.GameObjects.Rectangle;
      obstacleObject.y += speed * (delta / 1000);
      (obstacleObject.body as Phaser.Physics.Arcade.Body | undefined)?.updateFromGameObject();
      if (obstacleObject.y > 790) obstacleObject.destroy();
    });

    if (this.boss) {
      this.boss.y = Math.min(210, this.boss.y + 68 * (delta / 1000));
      (this.boss.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
      this.bossHpText.setPosition(this.boss.x, this.boss.y - 86);
      this.bossHpBar.setPosition(this.boss.x, this.boss.y - 62);
      this.bossHpFill.setPosition(this.boss.x - 90, this.boss.y - 62);
    }
  }

  private fireWeapons(): void {
    const shotCount = Math.min(9, 1 + Math.floor(this.stats.weaponCount / 4));
    const center = (shotCount - 1) / 2;
    const colors = getWeaponColors(this.stats);

    for (let i = 0; i < shotCount; i++) {
      const offset = i - center;
      const color = i % 3 === 0 ? colors.bullet : i % 3 === 1 ? colors.primary : colors.secondary;
      const bullet = new Bullet(this, this.player.x + offset * 10, this.player.y - 44, color);
      bullet.setDepth(2);
      bullet.setVelocity(440 + this.stats.power * 22);
      const body = bullet.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(offset * 24);
      body.setVelocityY(-440 - this.stats.power * 22);
      this.bullets.add(bullet);
    }
  }

  private updateBullets(delta: number): void {
    this.bullets.getChildren().forEach((child) => {
      const bullet = child as Bullet;
      bullet.update(0, delta);
      if (bullet.y < -30) {
        bullet.destroy();
      }
    });
  }

  private updateStatusPanel(): void {
    this.weaponText.setText(`${this.stats.weaponCount}`);
    this.powerText.setText(`${this.stats.power}`);
    this.levelText.setText(`${this.stats.level}`);
    this.distanceText.setText(`${Math.floor(this.distance)}m`);
    this.hpText.setText(`${this.playerHp}`);
    this.bestText.setText(`BEST ${Math.max(this.bestDistance, Math.floor(this.distance))}m`);
    this.weaponNameText.setText(getWeaponName(this.stats));
    const colors = getWeaponColors(this.stats);
    this.player.setPalette(colors.primary, colors.secondary);
  }

  private updateWeaponParts(delta: number): void {
    const maxShown = Math.min(22, Math.max(0, this.stats.weaponCount - 1));
    while (this.weaponParts.length < maxShown) {
      const index = this.weaponParts.length;
      const part = index % 3 === 0
        ? this.add.rectangle(0, 0, 5, 18, 0x7dd3fc, 0.9)
        : index % 3 === 1
          ? this.add.circle(0, 0, 3, getWeaponColors(this.stats).secondary, 0.9)
          : this.add.rectangle(0, 0, 10, 4, getWeaponColors(this.stats).bullet, 0.9);
      part.setDepth(2);
      this.weaponParts.push(part);
    }

    this.weaponParts.forEach((part, index) => {
      if (index >= maxShown) {
        part.setVisible(false);
        return;
      }
      const wave = Math.sin(this.stageTimer * 0.006 + index) * 4;
      const side = index % 2 === 0 ? -1 : 1;
      const row = Math.floor(index / 2);
      const x = this.player.x + side * (25 + (row % 3) * 8);
      const y = this.player.y - 18 - row * 7 + wave * 0.35;
      part.setVisible(true);
      part.setPosition(x, y);
      part.setRotation(side * 0.22 + wave * 0.02);
    });

    if (delta > 0) {
      this.player.setGlow(0.82 + Math.sin(this.stageTimer * 0.01) * 0.12);
    }
  }

  private handleGateCollision(gateObject: Phaser.GameObjects.Container): void {
    if (!gateObject.active) {
      return;
    }

    const pair = gateObject.getData('pair') as GatePair | undefined;
    const option: GateOption = {
      label: String(gateObject.getData('label') ?? 'OK'),
      kind: gateObject.getData('kind') as GateOption['kind'],
      value: Number(gateObject.getData('value') ?? 1),
      color: Number(gateObject.getData('color') ?? 0x38bdf8),
      good: Boolean(gateObject.getData('good')),
      element: gateObject.getData('element') as GateOption['element'],
    };

    this.stats = applyGateEffect(this.stats, option);
    this.spawnBurst(gateObject.x, gateObject.y, option.good ? option.color : 0xff4d6d, option.good ? 18 : 14);
    this.showFlash(option.good ? `${option.label} UP` : `${option.label} DOWN`, option.good ? '#dcfce7' : '#fecaca', gateObject.x, gateObject.y - 42);

    if (pair) {
      pair.left.destroy();
      pair.right.destroy();
      pair.destroy();
    } else {
      gateObject.destroy();
    }
  }

  private handleEnemyCollision(enemyObject: Enemy): void {
    this.stats = applyEnemyImpact(this.stats);
    this.playerHp -= 1;
    this.spawnBurst(enemyObject.x, enemyObject.y, 0xff4d6d, 16);
    this.showFlash('HIT -1', '#fecaca', this.player.x, this.player.y - 72);
    enemyObject.destroy();

    if (this.playerHp <= 0) {
      this.finish('GAME OVER');
    }
  }

  private hitEnemy(bulletObject: Bullet, enemyObject: Enemy): void {
    const damage = Math.max(1, this.stats.power + this.stats.level);
    this.spawnHitEffect(bulletObject.x, bulletObject.y, 0xfef08a);
    if (enemyObject.damage(damage)) {
      this.spawnBurst(enemyObject.x, enemyObject.y, 0xffb020, 20);
      enemyObject.destroy();
    }
    bulletObject.destroy();
  }

  private hitBoss(bullet: Phaser.GameObjects.GameObject): void {
    if (!this.boss) {
      return;
    }

    const shot = bullet as Bullet;
    const damage = Math.max(1, this.stats.power + this.stats.level * 2);
    this.bossHp -= damage;
    this.spawnHitEffect(shot.x, shot.y, 0xfff1a8);
    shot.destroy();

    if (this.bossHp <= 0 && this.boss) {
      this.spawnBurst(this.boss.x, this.boss.y, 0xfef3c7, 42);
      this.showFlash('BOSS BREAK +Lv', '#fef3c7', this.boss.x, this.boss.y - 70);
      this.stats = {
        ...this.stats,
        level: this.stats.level + 1,
        power: Math.min(40, this.stats.power + 4),
        weaponCount: Math.min(80, this.stats.weaponCount + 10),
        tier: this.stats.tier + 1,
      };
      this.boss.destroy();
      this.boss = undefined;
      this.bossLoopIndex += 1;
      this.bossHpBar.setVisible(false);
      this.bossHpFill.setVisible(false);
      this.bossHpText.setVisible(false);
    }
  }

  private spawnBoss(): void {
    this.bossMaxHp = createBossHp(this.bossLoopIndex);
    this.bossHp = this.bossMaxHp;
    this.boss = new Boss(this, 200, -130, this.bossHp);
    this.boss.setDepth(2);
    this.physics.add.overlap(this.bullets, this.boss, (bulletObject) => this.hitBoss(bulletObject as Phaser.GameObjects.GameObject), undefined, this);
    this.physics.add.overlap(this.player, this.boss, () => this.finish('GAME OVER'), undefined, this);

    this.bossHpBar = this.add.rectangle(200, 96, 188, 16, 0x450a12, 0.92);
    this.bossHpBar.setStrokeStyle(2, 0xfda4af, 0.85);
    this.bossHpBar.setDepth(8);
    this.bossHpFill = this.add.rectangle(110, 96, 180, 10, 0xfb7185, 0.96).setOrigin(0, 0.5).setDepth(9);
    this.bossHpText = this.add.text(200, 68, `BOSS ${this.bossMaxHp} HP`, {
      fontSize: '14px',
      color: '#fff7ed',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5).setDepth(9);
    this.showFlash('BOSS INCOMING', '#fda4af', 200, 148);
  }

  private updateBossBar(): void {
    if (!this.boss) {
      return;
    }

    const hpRatio = clamp(this.bossHp / this.bossMaxHp, 0, 1);
    this.bossHpFill.displayWidth = Math.max(0, hpRatio * 180);
    this.bossHpText.setText(`BOSS ${Math.max(0, this.bossHp)} HP`);
  }

  private spawnBurst(x: number, y: number, color: number, size: number): void {
    const burst = this.add.circle(x, y, size, color, 0.24).setDepth(6);
    const ring = this.add.circle(x, y, Math.max(7, size * 0.5), color, 0).setStrokeStyle(2, color, 0.9).setDepth(6);
    this.tweens.add({
      targets: [burst, ring],
      alpha: 0,
      scale: 2.1,
      duration: 360,
      ease: 'Quad.easeOut',
      onComplete: () => {
        burst.destroy();
        ring.destroy();
      },
    });
  }

  private spawnHitEffect(x: number, y: number, color: number): void {
    const spark = this.add.circle(x, y, 5, color, 0.9).setDepth(5);
    this.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 2.4,
      duration: 180,
      onComplete: () => spark.destroy(),
    });
  }

  private showFlash(text: string, color: string, x: number, y: number): void {
    const label = this.add.text(x, y, text, {
      fontSize: '16px',
      color,
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10);
    this.effects.add(label);
    this.tweens.add({
      targets: label,
      y: label.y - 34,
      alpha: 0,
      scale: 1.18,
      duration: 760,
      ease: 'Quad.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  private finish(title: string): void {
    this.isGameOver = true;
    this.physics.pause();
    this.scene.start('ResultScene', {
      title,
      subtitle: '最高記録を超えるまで強化ランは続く',
      weaponCount: this.stats.weaponCount,
      power: this.stats.power,
      level: this.stats.level,
      distance: Math.floor(this.distance),
      bestDistance: saveBestDistance(this.distance),
      weaponName: getWeaponName(this.stats),
    });
  }
}
