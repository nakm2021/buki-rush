import Phaser from 'phaser';
import { Boss } from '../objects/Boss';
import { Bullet } from '../objects/Bullet';
import { Enemy } from '../objects/Enemy';
import { GatePair } from '../objects/GatePair';
import { PlayerWeapon } from '../objects/PlayerWeapon';
import { getBossAssetByLoop, selectWeaponAssetKey } from '../systems/AssetCatalog';
import { findEnemyVariant } from '../systems/EnemyCatalog';
import { PlayerInputController } from '../systems/PlayerInputController';
import { loadBestDistance, saveBestDistance } from '../systems/RecordSystem';
import { BOSS_STEP_INTERVAL, createBossHp, createLoopStep, INITIAL_STEP_INTERVAL, LOOP_STEP_INTERVAL, OPENING_STEPS } from '../systems/StageSpawner';
import { applyEnemyImpact, applyGateEffect, clamp } from '../systems/UpgradeSystem';
import { getBuildRank, getModuleProfile, getShotSpread, getWeaponColors, getWeaponName, getWeaponPowerMultiplier, getRarityProfile } from '../systems/WeaponEvolution';
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
  private stats: PlayerStats = {
    weaponCount: 1,
    power: 1,
    level: 1,
    fireRate: 1,
    element: 'neutral',
    archetype: 'blaster',
    modules: [],
    rarity: 'common',
    tier: 1,
    critRate: 0.04,
    pierce: 0,
    shield: 0,
    synergy: 0,
  };
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
  private buildText!: Phaser.GameObjects.Text;
  private moduleText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private boss?: Boss;
  private bossHpBar!: Phaser.GameObjects.Rectangle;
  private bossHpFill!: Phaser.GameObjects.Rectangle;
  private bossHpText!: Phaser.GameObjects.Text;
  private pauseButton!: Phaser.GameObjects.Text;
  private pauseOverlay?: Phaser.GameObjects.Container;
  private bossMaxHp = createBossHp(0);
  private bossHp = this.bossMaxHp;
  private playerHp = 3;
  private fireTimer = 0;
  private isGameOver = false;
  private isPaused = false;
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
  private squadUnits: Phaser.GameObjects.Container[] = [];
  private speedLines: Phaser.GameObjects.Rectangle[] = [];
  private auraRings: Phaser.GameObjects.Arc[] = [];
  private backgroundTint!: Phaser.GameObjects.Rectangle;
  private trackGlow!: Phaser.GameObjects.Polygon;
  private laneLights: Phaser.GameObjects.Rectangle[] = [];
  private audioContext?: AudioContext;

  constructor() {
    super('GameScene');
  }

  create(): void {
    const { width, height } = this.scale;

    this.resetRunState();
    this.physics.resume();
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
    this.createPauseButton();
    this.createInput();
    this.bestDistance = loadBestDistance();

    this.physics.add.overlap(this.player, this.gates, (_player, gateObject) => this.handleGateCollision(gateObject as Phaser.GameObjects.Container), undefined, this);
    this.physics.add.overlap(this.player, this.enemies, (_player, enemyObject) => this.handleEnemyCollision(enemyObject as Enemy), undefined, this);
    this.physics.add.overlap(this.bullets, this.enemies, (bulletObject, enemyObject) => this.hitEnemy(bulletObject as Bullet, enemyObject as Enemy), undefined, this);
  }

  private resetRunState(): void {
    this.stats = {
      weaponCount: 1,
      power: 1,
      level: 1,
      fireRate: 1,
      element: 'neutral',
      archetype: 'blaster',
      modules: [],
      rarity: 'common',
      tier: 1,
      critRate: 0.04,
      pierce: 0,
      shield: 0,
      synergy: 0,
    };
    this.boss = undefined;
    this.bossMaxHp = createBossHp(0);
    this.bossHp = this.bossMaxHp;
    this.playerHp = 3;
    this.fireTimer = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.stageTimer = 0;
    this.nextStageIndex = 0;
    this.nextLoopSpawnTime = 0;
    this.loopStepIndex = 0;
    this.bossLoopIndex = 0;
    this.distance = 0;
    this.pointerTarget = null;
    this.weaponParts = [];
    this.squadUnits = [];
    this.speedLines = [];
    this.auraRings = [];
    this.laneLights = [];
    this.pauseOverlay = undefined;
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    const smoothDelta = Math.min(delta, 33);
    this.stageTimer += smoothDelta;
    this.fireTimer += delta;
    this.distance += (smoothDelta / 1000) * 22;

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
    this.add.rectangle(width / 2, height / 2, width, height, 0x1c140f, 1);
    this.backgroundTint = this.add.rectangle(width / 2, height / 2, width, height, 0x38bdf8, 0.08).setBlendMode(Phaser.BlendModes.ADD);
    this.backgroundTint.setDepth(0.05);
    this.add.polygon(width / 2, height / 2, [58, 720, 342, 720, 308, 0, 92, 0], 0xd6d8dd, 1);
    this.add.polygon(width / 2, height / 2, [82, 720, 318, 720, 288, 0, 112, 0], 0xbfc3ca, 1);
    this.add.polygon(width / 2, height / 2, [112, 720, 288, 720, 268, 0, 132, 0], 0xe5e7eb, 0.92);
    this.trackGlow = this.add.polygon(width / 2, height / 2, [112, 720, 288, 720, 268, 0, 132, 0], 0x38bdf8, 0.08);
    this.trackGlow.setBlendMode(Phaser.BlendModes.ADD);

    for (let y = -40; y < height + 80; y += 86) {
      this.add.rectangle(width / 2, y, 250, 4, 0xffffff, 0.2).setAngle(-1);
      this.add.rectangle(width / 2, y + 38, 210, 2, 0x8b8f98, 0.18).setAngle(1);
    }

    [90, 310].forEach((x) => {
      this.add.rectangle(x, height / 2, 18, height, 0x8a8f99, 0.95);
      this.add.rectangle(x, height / 2, 5, height, 0x6b7280, 0.9);
      this.add.rectangle(x + (x < 200 ? -16 : 16), height / 2, 3, height, 0xf8fafc, 0.38);
    });

    [146, 200, 254].forEach((x) => {
      this.add.line(x, height / 2, 0, 0, 0, height, 0xffffff, 0.18).setLineWidth(2);
      const laneLight = this.add.rectangle(x, height / 2, 5, height, 0x38bdf8, 0.12).setBlendMode(Phaser.BlendModes.ADD);
      this.laneLights.push(laneLight);
    });

    for (let i = 0; i < 22; i++) {
      const x = 102 + (i % 5) * 48;
      const y = (i * 64) % height;
      const line = this.add.rectangle(x, y, 2, 38 + (i % 3) * 14, 0xffffff, 0.14);
      this.speedLines.push(line);
    }
  }

  private createStatusPanel(): void {
    const panelGlow = this.add.rectangle(200, 62, 376, 108, 0x38bdf8, 0.1);
    panelGlow.setDepth(7);
    const panel = this.add.rectangle(200, 62, 364, 102, 0x09111f, 0.9);
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
    this.hpText = this.add.text(334, 50, '3', { fontSize: '22px', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0.5).setDepth(9);
    this.weaponNameText = this.add.text(22, 77, 'C 無-Runner Blaster', { fontSize: '12px', color: '#e0f2fe', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(9);
    this.moduleText = this.add.text(22, 96, 'MOD: none', { fontSize: '10px', color: '#bae6fd', fontFamily: 'Arial, sans-serif' }).setOrigin(0, 0.5).setDepth(9);
    this.buildText = this.add.text(210, 96, 'BUILD 0', { fontSize: '10px', color: '#fef3c7', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(9);
    this.distanceText = this.add.text(300, 77, '0m', { fontSize: '12px', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(1, 0.5).setDepth(9);
    this.bestText = this.add.text(378, 77, 'BEST 0m', { fontSize: '12px', color: '#fde68a', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(1, 0.5).setDepth(9);
  }

  private createPauseButton(): void {
    const bg = this.add.circle(370, 126, 20, 0x09111f, 0.92).setDepth(12);
    bg.setStrokeStyle(2, 0x38bdf8, 0.6);
    this.pauseButton = this.add.text(370, 126, 'II', {
      fontSize: '17px',
      color: '#f8fafc',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5).setDepth(13);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => this.togglePause());
    this.pauseButton.setInteractive({ useHandCursor: true });
    this.pauseButton.on('pointerdown', () => this.togglePause());
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard?.on('keydown-P', () => this.togglePause());
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

    if (step.enemies) {
      step.enemies.forEach((enemyData) => this.spawnEnemy(enemyData));
    } else if (step.enemy) {
      this.spawnEnemy(step.enemy);
    }

    if (step.obstacle) {
      const obstacle = this.add.rectangle(step.obstacle.x, step.obstacle.y, step.obstacle.width, step.obstacle.height, 0x334155, 0.45);
      this.obstacles.add(obstacle);
      this.physics.add.existing(obstacle);
      const body = obstacle.body as Phaser.Physics.Arcade.Body;
      body.setImmovable(true);
    }
  }

  private spawnEnemy(enemyData: { x: number; y: number; hp?: number; variantId?: string }): void {
    const variant = findEnemyVariant(enemyData.variantId);
    const enemy = new Enemy(this, enemyData.x, enemyData.y, enemyData.hp ?? 10, variant);
    enemy.setDepth(variant.lethal ? 4 : 2);
    this.enemies.add(enemy);

    if (variant.lethal) {
      this.spawnBurst(enemy.x, enemy.y, 0xff174d, 28);
      this.showFlash('DANGER', '#fecaca', enemy.x, enemy.y + 44);
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
    const move = 170 * (delta / 1000);
    this.speedLines.forEach((line, index) => {
      line.y += move + (index % 3) * 1.6;
      if (line.y > 760) {
        line.y = -50;
      }
    });
  }

  private moveFlowingObjects(delta: number): void {
    const speed = 150;

    this.gates.getChildren().forEach((child) => {
      const gate = child as Phaser.GameObjects.Container;
      gate.y += speed * (delta / 1000);
      (gate.body as Phaser.Physics.Arcade.Body | undefined)?.updateFromGameObject();
      if (gate.y > 790) gate.destroy();
    });

    this.enemies.getChildren().forEach((enemy) => {
      const obj = enemy as Enemy;
      obj.y += speed * (delta / 1000);
      (obj.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
      if (obj.y > 790) {
        obj.destroy();
      }
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
    const shotCount = Math.min(7, 1 + Math.floor(this.stats.weaponCount / 5));
    const center = (shotCount - 1) / 2;
    const colors = getWeaponColors(this.stats);
    const spread = getShotSpread(this.stats);
    const pierceLeft = this.stats.pierce + (this.stats.modules.includes('chain') ? 1 : 0);

    for (let i = 0; i < shotCount; i++) {
      const offset = i - center;
      const color = i % 3 === 0 ? colors.bullet : i % 3 === 1 ? colors.primary : colors.secondary;
      const bullet = new Bullet(this, this.player.x + offset * 10, this.player.y - 44, color);
      bullet.setDepth(2);
      bullet.setVelocity(440 + this.stats.power * 22 + this.stats.synergy * 4);
      bullet.setScale(this.stats.modules.includes('focus') ? 1.28 : 1);
      bullet.setData('pierceLeft', pierceLeft);
      const body = bullet.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(offset * 24 * spread);
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
    const modules = this.stats.modules.length > 0 ? this.stats.modules.map((module) => getModuleProfile(module).label).join(' / ') : 'none';
    this.moduleText.setText(`MOD: ${modules}`);
    this.buildText.setText(`BUILD ${getBuildRank(this.stats)}  ${getRarityProfile(this.stats.rarity).label}`);
    const colors = getWeaponColors(this.stats);
    this.player.setPalette(colors.primary, colors.secondary);
    this.player.setWeaponSkin(selectWeaponAssetKey(this.stats));
    this.updateStageMood(colors.primary, colors.secondary, colors.aura);
    this.updateAuraRings(colors.aura);
    this.updateSquadUnits(colors.primary, colors.secondary);
  }

  private updateStageMood(primary: number, secondary: number, aura: number): void {
    this.backgroundTint.setFillStyle(aura, 0.06 + Math.min(0.08, this.stats.tier * 0.006));
    this.trackGlow.setFillStyle(primary, 0.05 + Math.min(0.1, this.stats.level * 0.003));
    this.laneLights.forEach((line, index) => {
      line.setFillStyle(index % 2 === 0 ? primary : secondary, 0.1 + Math.sin(this.stageTimer * 0.004 + index) * 0.035);
    });
    this.speedLines.forEach((line, index) => {
      line.setFillStyle(index % 2 === 0 ? primary : secondary, 0.12 + Math.min(0.08, this.stats.fireRate * 0.01));
    });
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

  private updateSquadUnits(primary: number, secondary: number): void {
    const maxShown = Math.min(36, Math.max(8, this.stats.weaponCount));
    while (this.squadUnits.length < maxShown) {
      const unit = this.add.container(this.player.x, this.player.y + 34);
      const shadow = this.add.ellipse(0, 11, 16, 8, 0x1f2937, 0.28);
      const legs = this.add.rectangle(0, 9, 9, 10, 0x1e3a8a, 0.95);
      const body = this.add.rectangle(0, 2, 12, 15, 0x2563eb, 0.98);
      body.setStrokeStyle(1, 0xeff6ff, 0.5);
      const helmet = this.add.circle(0, -8, 7, 0x38bdf8, 0.98);
      helmet.setStrokeStyle(1, 0xffffff, 0.7);
      const visor = this.add.rectangle(0, -9, 9, 3, 0x0f172a, 0.8);
      unit.add([shadow, legs, body, helmet, visor]);
      unit.setDepth(2.6);
      this.squadUnits.push(unit);
    }

    this.squadUnits.forEach((unit, index) => {
      if (index >= maxShown) {
        unit.setVisible(false);
        return;
      }
      const cols = Math.min(6, Math.ceil(Math.sqrt(maxShown)));
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = this.player.x + (col - (cols - 1) / 2) * 19;
      const y = this.player.y + 46 + row * 18 + Math.sin(this.stageTimer * 0.014 + index) * 1.2;
      unit.setVisible(true);
      unit.setPosition(clamp(x, PLAYER_MIN_X + 8, PLAYER_MAX_X - 8), clamp(y, PLAYER_MIN_Y, PLAYER_MAX_Y + 34));
      const body = unit.getAt(2) as Phaser.GameObjects.Rectangle;
      const helmet = unit.getAt(3) as Phaser.GameObjects.Arc;
      body.setFillStyle(primary, 0.98);
      helmet.setFillStyle(secondary, 0.98);
    });
  }

  private handleGateCollision(gateObject: Phaser.GameObjects.Container): void {
    if (!gateObject.active) {
      return;
    }

    const pair = gateObject.getData('pair') as GatePair | undefined;
    const previousRarity = this.stats.rarity;
    const option: GateOption = {
      label: String(gateObject.getData('label') ?? 'OK'),
      kind: gateObject.getData('kind') as GateOption['kind'],
      value: Number(gateObject.getData('value') ?? 1),
      color: Number(gateObject.getData('color') ?? 0x38bdf8),
      good: Boolean(gateObject.getData('good')),
      element: gateObject.getData('element') as GateOption['element'],
      archetype: gateObject.getData('archetype') as GateOption['archetype'],
      module: gateObject.getData('module') as GateOption['module'],
      rarity: gateObject.getData('rarity') as GateOption['rarity'],
    };

    this.stats = applyGateEffect(this.stats, option);
    this.spawnBurst(gateObject.x, gateObject.y, option.good ? option.color : 0xff4d6d, option.good ? 18 : 14);
    this.showFlash(option.good ? `${option.label} UPGRADE` : `${option.label} DOWN`, option.good ? '#dcfce7' : '#fecaca', gateObject.x, gateObject.y - 42);
    if (option.good) {
      this.playUpgradeSound(option.kind);
      this.animateWeaponUpgrade(option.color);
    }
    if (option.kind === 'rarity' || option.kind === 'fusion' || previousRarity !== this.stats.rarity) {
      this.playRareSound();
      this.showRareEvolution(option.color);
    }

    if (pair) {
      pair.left.destroy();
      pair.right.destroy();
      pair.destroy();
    } else {
      gateObject.destroy();
    }
  }

  private handleEnemyCollision(enemyObject: Enemy): void {
    if (enemyObject.isLethal()) {
      this.playerHp = 0;
      this.spawnBurst(enemyObject.x, enemyObject.y, 0xff174d, 34);
      this.showFlash('INSTANT BREAK', '#fecaca', this.player.x, this.player.y - 78);
    } else if (this.stats.shield > 0) {
      this.stats = { ...this.stats, shield: this.stats.shield - 1 };
      this.showFlash('SHIELD BLOCK', '#bae6fd', this.player.x, this.player.y - 72);
    } else {
      this.stats = applyEnemyImpact(this.stats);
      this.playerHp -= enemyObject.getDamage();
      this.showFlash(`HIT -${enemyObject.getDamage()}`, '#fecaca', this.player.x, this.player.y - 72);
    }
    this.spawnBurst(enemyObject.x, enemyObject.y, 0xff4d6d, 16);
    enemyObject.destroy();

    if (this.playerHp <= 0) {
      this.finish('GAME OVER');
    }
  }

  private hitEnemy(bulletObject: Bullet, enemyObject: Enemy): void {
    const critical = Math.random() < this.stats.critRate;
    const damage = Math.max(1, Math.round((this.stats.power + this.stats.level + this.stats.synergy * 0.65) * getWeaponPowerMultiplier(this.stats) * 0.72 * (critical ? 1.65 : 1)));
    this.spawnHitEffect(bulletObject.x, bulletObject.y, critical ? 0xffffff : 0xfef08a);
    if (enemyObject.damage(damage)) {
      this.spawnBurst(enemyObject.x, enemyObject.y, 0xffb020, 20);
      enemyObject.destroy();
    }
    const pierceLeft = Number(bulletObject.getData('pierceLeft') ?? 0);
    if (pierceLeft > 0) {
      bulletObject.setData('pierceLeft', pierceLeft - 1);
      return;
    }
    bulletObject.destroy();
  }

  private hitBoss(bullet: Phaser.GameObjects.GameObject): void {
    if (!this.boss) {
      return;
    }

    const shot = bullet as Bullet;
    const critical = Math.random() < this.stats.critRate;
    const damage = Math.max(1, Math.round((this.stats.power + this.stats.level * 1.5 + this.stats.synergy * 0.55) * getWeaponPowerMultiplier(this.stats) * 0.62 * (critical ? 1.55 : 1)));
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
        synergy: this.stats.synergy + 3,
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
    this.boss = new Boss(this, 200, -130, this.bossHp, getBossAssetByLoop(this.bossLoopIndex).key);
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
    this.playRareSound();
    this.spawnBurst(200, 148, 0xfb7185, 34);
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

  private updateAuraRings(color: number): void {
    while (this.auraRings.length < 3) {
      const ring = this.add.circle(this.player.x, this.player.y, 34 + this.auraRings.length * 10, color, 0).setStrokeStyle(2, color, 0.22);
      ring.setDepth(1);
      this.auraRings.push(ring);
    }

    this.auraRings.forEach((ring, index) => {
      const pulse = Math.sin(this.stageTimer * 0.004 + index * 1.4) * 4;
      ring.setPosition(this.player.x, this.player.y + 2);
      ring.setRadius(34 + index * 12 + pulse + Math.min(20, this.stats.synergy * 0.45));
      ring.setStrokeStyle(2, color, 0.1 + index * 0.045);
    });
  }

  private togglePause(): void {
    if (this.isGameOver) {
      return;
    }

    this.isPaused = !this.isPaused;
    this.pauseButton.setText(this.isPaused ? '▶' : 'II');

    if (this.isPaused) {
      this.physics.pause();
      const panel = this.add.rectangle(200, 360, 292, 150, 0x020617, 0.84);
      panel.setStrokeStyle(2, 0x38bdf8, 0.65);
      const title = this.add.text(200, 334, 'PAUSED', {
        fontSize: '34px',
        color: '#f8fafc',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
        stroke: '#020617',
        strokeThickness: 5,
      }).setOrigin(0.5);
      const resume = this.add.text(200, 386, 'タップで再開', {
        fontSize: '16px',
        color: '#bae6fd',
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0.5);
      this.pauseOverlay = this.add.container(0, 0, [panel, title, resume]).setDepth(30);
      panel.setInteractive({ useHandCursor: true });
      panel.on('pointerdown', () => this.togglePause());
      return;
    }

    this.physics.resume();
    this.pauseOverlay?.destroy();
    this.pauseOverlay = undefined;
  }

  private animateWeaponUpgrade(color: number): void {
    this.tweens.add({
      targets: this.player,
      scale: 1.18,
      angle: 4,
      yoyo: true,
      duration: 150,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.player.setScale(1);
        this.player.setAngle(0);
      },
    });
    this.spawnBurst(this.player.x, this.player.y - 20, color, 24);
  }

  private showRareEvolution(color: number): void {
    const { width, height } = this.scale;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, color, 0.18).setDepth(28);
    const ring = this.add.circle(this.player.x, this.player.y, 42, color, 0).setStrokeStyle(4, color, 0.9).setDepth(29);
    this.showFlash('RARE EVOLUTION', '#fef3c7', this.player.x, this.player.y - 104);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 420,
      onComplete: () => flash.destroy(),
    });
    this.tweens.add({
      targets: ring,
      scale: 3.3,
      alpha: 0,
      duration: 520,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  private playUpgradeSound(kind: GateOption['kind']): void {
    const base = kind === 'rarity' || kind === 'fusion' ? 660 : kind === 'module' ? 520 : 420;
    this.playTone(base, 0.055, 0.035);
    this.time.delayedCall(70, () => this.playTone(base * 1.5, 0.055, 0.028));
  }

  private playRareSound(): void {
    [523, 659, 784, 1046].forEach((frequency, index) => {
      this.time.delayedCall(index * 58, () => this.playTone(frequency, 0.08, 0.04));
    });
  }

  private playTone(frequency: number, duration: number, volume: number): void {
    try {
      this.audioContext ??= new AudioContext();
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(this.audioContext.destination);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration + 0.02);
    } catch {
      // 音が使えない環境では演出だけ続行
    }
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
