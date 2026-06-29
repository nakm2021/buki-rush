import Phaser from 'phaser';
import { Boss } from '../objects/Boss';
import { Bullet } from '../objects/Bullet';
import { Enemy } from '../objects/Enemy';
import { GatePair } from '../objects/GatePair';
import { PlayerWeapon } from '../objects/PlayerWeapon';
import { getBossAssetByLoop, getBossTheme, selectWeaponAssetKey, type BossTheme } from '../systems/AssetCatalog';
import { findEnemyVariant } from '../systems/EnemyCatalog';
import { PlayerInputController } from '../systems/PlayerInputController';
import { loadBestDistance, loadPlayerMeta, recordRun, saveBestDistance } from '../systems/RecordSystem';
import { BOSS_STEP_INTERVAL, createBossHp, createLoopStep, INITIAL_STEP_INTERVAL, LOOP_STEP_INTERVAL, OPENING_STEPS } from '../systems/StageSpawner';
import { applyEnemyImpact, applyGateEffect, clamp } from '../systems/UpgradeSystem';
import { getBuildRank, getModuleProfile, getShotSpread, getWeaponColors, getWeaponName, getWeaponPowerMultiplier, getRarityProfile } from '../systems/WeaponEvolution';
import type { GateOption, PlayerStats, StageStep } from '../types/GameTypes';

type ControlKeys = Record<'W' | 'S' | 'A' | 'D' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT', Phaser.Input.Keyboard.Key>;
type RelicId = 'phoenix-core' | 'titan-plate' | 'hydra-heart' | 'storm-engine' | 'royal-crown' | 'void-contract';

interface RelicOption {
  id: RelicId;
  title: string;
  description: string;
  color: number;
  apply: (stats: PlayerStats) => PlayerStats;
}

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
  private bossProjectiles!: Phaser.GameObjects.Group;
  private weaponText!: Phaser.GameObjects.Text;
  private powerText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private distanceText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;
  private weaponNameText!: Phaser.GameObjects.Text;
  private buildText!: Phaser.GameObjects.Text;
  private moduleText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private hpPips: Phaser.GameObjects.Arc[] = [];
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
  private bossBackdrop!: Phaser.GameObjects.Rectangle;
  private bossAurora!: Phaser.GameObjects.Rectangle;
  private bossSigils: Phaser.GameObjects.Arc[] = [];
  private bossMotes: Phaser.GameObjects.Rectangle[] = [];
  private currentBossTheme?: BossTheme;
  private trackGlow!: Phaser.GameObjects.Polygon;
  private laneLights: Phaser.GameObjects.Rectangle[] = [];
  private audioContext?: AudioContext;
  private specialActive = false;
  private specialTimer = 0;
  private specialDrainTimer = 0;
  private specialPulseTimer = 0;
  private bossAttackTimer = 0;
  private bossSpecialTimer = 0;
  private bossPatternIndex = 0;
  private bossPhase = 1;
  private defeatedBossKeys: string[] = [];
  private activeRelics: RelicId[] = [];
  private relicOverlay?: Phaser.GameObjects.Container;
  private medalCount = 0;
  private permanentRank = 0;
  private bossPhaseText!: Phaser.GameObjects.Text;
  private stageBranchOffset = 0;

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
    this.bossProjectiles = this.add.group();

    this.createStatusPanel();
    this.createPauseButton();
    this.createInput();
    this.bestDistance = loadBestDistance();

    this.physics.add.overlap(this.player, this.gates, (_player, gateObject) => this.handleGateCollision(gateObject as Phaser.GameObjects.Container), undefined, this);
    this.physics.add.overlap(this.player, this.enemies, (_player, enemyObject) => this.handleEnemyCollision(enemyObject as Enemy), undefined, this);
    this.physics.add.overlap(this.bullets, this.enemies, (bulletObject, enemyObject) => this.hitEnemy(bulletObject as Bullet, enemyObject as Enemy), undefined, this);
    this.physics.add.overlap(this.player, this.bossProjectiles, (_player, projectile) => this.handleBossProjectileCollision(projectile as Phaser.GameObjects.GameObject), undefined, this);
  }

  private resetRunState(): void {
    const meta = loadPlayerMeta();
    this.permanentRank = meta.permanentRank;
    this.stats = {
      weaponCount: 1,
      power: 1 + Math.floor(this.permanentRank / 2),
      level: 1 + Math.floor(this.permanentRank / 4),
      fireRate: 1 + this.permanentRank * 0.03,
      element: 'neutral',
      archetype: 'blaster',
      modules: [],
      rarity: 'common',
      tier: 1,
      critRate: 0.04 + this.permanentRank * 0.004,
      pierce: 0,
      shield: 0,
      synergy: 0,
    };
    this.boss = undefined;
    this.bossMaxHp = createBossHp(0);
    this.bossHp = this.bossMaxHp;
    this.playerHp = 3 + Math.floor(this.permanentRank / 7);
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
    this.bossSigils = [];
    this.bossMotes = [];
    this.currentBossTheme = undefined;
    this.specialActive = false;
    this.specialTimer = 0;
    this.specialDrainTimer = 0;
    this.specialPulseTimer = 0;
    this.bossAttackTimer = 0;
    this.bossSpecialTimer = 0;
    this.bossPatternIndex = 0;
    this.bossPhase = 1;
    this.defeatedBossKeys = [];
    this.activeRelics = [];
    this.relicOverlay = undefined;
    this.medalCount = 0;
    this.stageBranchOffset = 0;
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
    this.updateSpecial(smoothDelta);
    this.updateBossAttacks(smoothDelta);
    this.updateBossProjectiles(smoothDelta);
    this.moveFlowingObjects(smoothDelta);
    this.updateBossBackdrop(smoothDelta);
    this.updateBossBar();
    this.updateStatusPanel();

    const fireInterval = Math.max(45, 265 - this.stats.fireRate * 38 - Math.min(this.stats.weaponCount, 60) * 3);
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
    this.bossBackdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x020617, 0).setDepth(0.055);
    this.bossAurora = this.add.rectangle(width / 2, height / 2, width * 0.72, height, 0x38bdf8, 0).setBlendMode(Phaser.BlendModes.ADD);
    this.bossAurora.setDepth(0.07);
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

    for (let i = 0; i < 5; i++) {
      const sigil = this.add.circle(76 + i * 62, 118 + (i % 2) * 56, 26 + (i % 3) * 7, 0xffffff, 0);
      sigil.setStrokeStyle(2, 0x38bdf8, 0);
      sigil.setDepth(0.08);
      this.bossSigils.push(sigil);
    }

    for (let i = 0; i < 28; i++) {
      const mote = this.add.rectangle(42 + (i * 53) % 320, (i * 91) % height, 3 + (i % 3), 18 + (i % 4) * 9, 0xffffff, 0);
      mote.setBlendMode(Phaser.BlendModes.ADD);
      mote.setDepth(0.09);
      this.bossMotes.push(mote);
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
    this.hpPips = Array.from({ length: 5 }, (_, index) => {
      const pip = this.add.circle(306 + index * 14, 68, 4, 0xfb7185, index < this.playerHp ? 0.98 : 0.18);
      pip.setStrokeStyle(1, 0xffd5da, 0.75);
      pip.setDepth(9);
      return pip;
    });
    this.weaponNameText = this.add.text(22, 77, 'C 無-Runner Blaster', { fontSize: '12px', color: '#e0f2fe', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(9);
    this.moduleText = this.add.text(22, 96, 'MOD: none', { fontSize: '10px', color: '#bae6fd', fontFamily: 'Arial, sans-serif' }).setOrigin(0, 0.5).setDepth(9);
    this.buildText = this.add.text(210, 96, 'BUILD 0', { fontSize: '10px', color: '#fef3c7', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(9);
    this.distanceText = this.add.text(300, 77, '0m', { fontSize: '12px', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(1, 0.5).setDepth(9);
    this.bestText = this.add.text(378, 77, 'BEST 0m', { fontSize: '12px', color: '#fde68a', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(1, 0.5).setDepth(9);
    this.bossPhaseText = this.add.text(378, 96, 'MEDAL 0', { fontSize: '10px', color: '#fca5a5', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(1, 0.5).setDepth(9);
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

    this.events.on('player-special-trigger', () => {
      this.activateSpecial();
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
      this.spawnStageStep(createLoopStep(this.loopStepIndex + this.stageBranchOffset, difficulty + Math.floor(this.defeatedBossKeys.length / 2)));
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
    const shotCount = Math.min(13, 1 + Math.floor(this.stats.weaponCount / 5));
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

  private updateBossAttacks(delta: number): void {
    if (!this.boss || !this.currentBossTheme || this.boss.y < 116) {
      return;
    }

    this.bossAttackTimer -= delta;
    this.bossSpecialTimer -= delta;

    if (this.bossAttackTimer <= 0) {
      this.fireBossPattern(this.currentBossTheme);
      const loopPressure = this.bossLoopIndex * 44;
      this.bossAttackTimer = Math.max(260, 1180 - loopPressure - this.bossPhase * 110 - Phaser.Math.Between(0, 180));
    }

    if (this.bossSpecialTimer <= 0) {
      this.castBossSpecial(this.currentBossTheme);
      this.bossSpecialTimer = Math.max(1800, 7600 - this.bossLoopIndex * 310);
    }
  }

  private updateBossProjectiles(delta: number): void {
    this.bossProjectiles.getChildren().forEach((child) => {
      const projectile = child as Phaser.GameObjects.Arc | Phaser.GameObjects.Rectangle;
      projectile.x += Number(projectile.getData('vx') ?? 0) * (delta / 1000);
      projectile.y += Number(projectile.getData('vy') ?? 0) * (delta / 1000);
      projectile.setRotation(projectile.rotation + Number(projectile.getData('spin') ?? 0) * (delta / 1000));
      (projectile.body as Phaser.Physics.Arcade.Body | undefined)?.updateFromGameObject();

      if (projectile.y > 780 || projectile.y < -120 || projectile.x < -80 || projectile.x > 480) {
        projectile.destroy();
      }
    });
  }

  private fireBossPattern(theme: BossTheme): void {
    if (!this.boss) {
      return;
    }

    const key = theme.key;
    if (key.includes('Dragon') || key.includes('Phoenix') || key.includes('Oni')) {
      this.spawnBossLaneStrike(theme, this.bossPhase >= 2);
      if (this.bossPhase >= 3) this.spawnBossFanShot(theme);
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('Hydra') || key.includes('Leviathan') || key.includes('Frost')) {
      this.spawnBossFanShot(theme);
      if (this.bossPhase >= 2) this.spawnBossAimedShot(theme);
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('Void') || key.includes('Demon') || key.includes('Mantis')) {
      this.spawnBossNova(theme);
      if (this.bossPhase >= 2) this.spawnBossAimedShot(theme);
      this.bossPatternIndex += 1;
      return;
    }

    const pattern = this.bossPatternIndex % 3;
    this.bossPatternIndex += 1;

    if (pattern === 0) {
      this.spawnBossAimedShot(theme);
      return;
    }

    if (pattern === 1) {
      this.spawnBossFanShot(theme);
      return;
    }

    this.spawnBossLaneStrike(theme, false);
  }

  private spawnBossAimedShot(theme: BossTheme): void {
    if (!this.boss) {
      return;
    }

    const count = 2 + Math.min(3, Math.floor(this.bossLoopIndex / 2)) + (this.bossPhase - 1);
    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * 95, () => {
        if (!this.boss) {
          return;
        }
        const angle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y + 40, this.player.x, this.player.y);
        const speed = 210 + this.bossLoopIndex * 18 + this.bossPhase * 18;
        this.spawnBossProjectile(this.boss.x, this.boss.y + 72, Math.cos(angle) * speed, Math.sin(angle) * speed, 9, theme.primary, this.getBossDamage(1), 'orb');
      });
    }
  }

  private spawnBossFanShot(theme: BossTheme): void {
    if (!this.boss) {
      return;
    }

    const fanCount = 7 + Math.min(4, this.bossLoopIndex) + this.bossPhase * 2;
    const spread = Phaser.Math.DegToRad(58 + this.bossPhase * 14);
    const baseAngle = Math.PI / 2;
    for (let i = 0; i < fanCount; i++) {
      const t = fanCount === 1 ? 0.5 : i / (fanCount - 1);
      const angle = baseAngle - spread / 2 + spread * t;
      const speed = 175 + this.bossLoopIndex * 14 + (i % 2) * 28 + this.bossPhase * 16;
      this.spawnBossProjectile(this.boss.x, this.boss.y + 70, Math.cos(angle) * speed, Math.sin(angle) * speed, 7, i % 2 === 0 ? theme.secondary : theme.accent, this.getBossDamage(1), 'diamond');
    }
    this.spawnBurst(this.boss.x, this.boss.y + 76, theme.secondary, 18);
  }

  private spawnBossLaneStrike(theme: BossTheme, empowered: boolean): void {
    if (!this.boss) {
      return;
    }

    const laneXs = empowered || this.bossPhase >= 3 ? [86, 146, 200, 254, 314] : [112, 200, 288];
    const selected = laneXs.filter((_, index) => empowered || (index + this.bossPatternIndex) % 2 === 0);
    selected.forEach((x, index) => {
      const warning = this.add.rectangle(x, 395, empowered ? 38 : 30, 670, theme.primary, empowered ? 0.2 : 0.14).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
      warning.setStrokeStyle(2, theme.accent, empowered ? 0.82 : 0.52);
      this.tweens.add({
        targets: warning,
        alpha: empowered ? 0.42 : 0.3,
        yoyo: true,
        repeat: 2,
        duration: 120,
        onComplete: () => {
          warning.destroy();
          const beam = this.add.rectangle(x, 395, empowered ? 44 : 34, 700, theme.accent, empowered ? 0.68 : 0.46).setDepth(13).setBlendMode(Phaser.BlendModes.ADD);
          this.tweens.add({ targets: beam, alpha: 0, scaleX: 1.7, duration: 310, ease: 'Quad.easeOut', onComplete: () => beam.destroy() });
          if (Math.abs(this.player.x - x) < (empowered ? 34 : 26)) {
            this.damagePlayer(this.getBossDamage(empowered ? 2 : 1), empowered ? 'BOSS SPECIAL HIT' : 'BOSS HIT', theme.accent);
          }
        },
      });
      this.time.delayedCall(index * 55, () => this.playTone(190 + index * 30, 0.05, 0.025));
    });
  }

  private castBossSpecial(theme: BossTheme): void {
    if (!this.boss) {
      return;
    }

    this.showFlash('BOSS SPECIAL', '#fecaca', this.boss.x, this.boss.y - 104);
    this.cameras.main.shake(520, 0.007);
    this.playRareSound();

    const { width, height } = this.scale;
    const veil = this.add.rectangle(width / 2, height / 2, width, height, theme.primary, 0.2).setDepth(24).setBlendMode(Phaser.BlendModes.ADD);
    const sigil = this.add.circle(this.boss.x, this.boss.y + 44, 74, theme.secondary, 0).setStrokeStyle(6, theme.accent, 0.92).setDepth(25);
    this.tweens.add({ targets: veil, alpha: 0, duration: 900, onComplete: () => veil.destroy() });
    this.tweens.add({ targets: sigil, scale: 2.8, angle: 220, alpha: 0, duration: 940, ease: 'Cubic.easeOut', onComplete: () => sigil.destroy() });

    this.time.delayedCall(620, () => {
      this.spawnBossLaneStrike(theme, true);
      this.spawnBossNova(theme);
    });
  }

  private spawnBossNova(theme: BossTheme): void {
    if (!this.boss) {
      return;
    }

    const count = 18 + Math.min(10, this.bossLoopIndex * 2) + this.bossPhase * 4;
    const originX = this.boss.x;
    const originY = this.boss.y + 66;
    for (let i = 0; i < count; i++) {
      const angle = Phaser.Math.DegToRad(32 + (360 / count) * i);
      const speed = 135 + (i % 3) * 38 + this.bossLoopIndex * 9;
      const vy = Math.max(72, Math.sin(angle) * speed);
      this.spawnBossProjectile(originX, originY, Math.cos(angle) * speed, vy, i % 2 === 0 ? 8 : 6, i % 2 === 0 ? theme.accent : theme.primary, this.getBossDamage(1), i % 2 === 0 ? 'orb' : 'diamond');
    }
    this.spawnBurst(originX, originY, theme.accent, 36);
  }

  private spawnBossProjectile(x: number, y: number, vx: number, vy: number, radius: number, color: number, damage: number, shape: 'orb' | 'diamond'): void {
    const projectile = shape === 'orb'
      ? this.add.circle(x, y, radius, color, 0.96)
      : this.add.rectangle(x, y, radius * 1.8, radius * 1.8, color, 0.94);
    projectile.setDepth(12);
    projectile.setBlendMode(Phaser.BlendModes.ADD);
    projectile.setData('vx', vx);
    projectile.setData('vy', vy);
    projectile.setData('damage', damage);
    projectile.setData('spin', shape === 'diamond' ? 4.6 : 0.8);
    projectile.setStrokeStyle(2, 0xffffff, 0.55);
    if (shape === 'diamond') {
      projectile.setAngle(45);
    }
    this.bossProjectiles.add(projectile);
    this.physics.add.existing(projectile);
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    if (shape === 'orb') {
      body.setCircle(radius);
      body.setOffset(-radius, -radius);
    } else {
      body.setSize(radius * 1.5, radius * 1.5);
      body.setOffset(-radius * 0.75, -radius * 0.75);
    }
  }

  private getBossDamage(baseDamage: number): number {
    return Math.max(1, Math.floor(baseDamage + this.bossPhase - 1 + this.bossLoopIndex * 0.45));
  }

  private updateStatusPanel(): void {
    this.weaponText.setText(`${this.stats.weaponCount}`);
    this.powerText.setText(`${this.stats.power}`);
    this.levelText.setText(`${this.stats.level}`);
    this.distanceText.setText(`${Math.floor(this.distance)}m`);
    this.hpText.setText(`${this.playerHp}`);
    this.hpPips.forEach((pip, index) => {
      pip.setFillStyle(index < this.playerHp ? 0xfb7185 : 0x450a12, index < this.playerHp ? 0.98 : 0.26);
      pip.setScale(index < this.playerHp ? 1 : 0.82);
    });
    this.bestText.setText(`BEST ${Math.max(this.bestDistance, Math.floor(this.distance))}m`);
    this.weaponNameText.setText(getWeaponName(this.stats));
    const modules = this.stats.modules.length > 0 ? this.stats.modules.map((module) => getModuleProfile(module).label).join(' / ') : 'none';
    this.moduleText.setText(`MOD: ${modules}`);
    this.buildText.setText(`BUILD ${getBuildRank(this.stats)}  ${getRarityProfile(this.stats.rarity).label}`);
    this.bossPhaseText.setText(this.boss ? `BOSS P${this.bossPhase}` : `MEDAL ${this.medalCount}`);
    const colors = getWeaponColors(this.stats);
    this.player.setPalette(colors.primary, colors.secondary);
    this.player.setWeaponSkin(selectWeaponAssetKey(this.stats));
    this.updateStageMood(colors.primary, colors.secondary, colors.aura);
    this.updateAuraRings(colors.aura);
    this.updateSquadUnits(colors.primary, colors.secondary);
  }

  private updateStageMood(primary: number, secondary: number, aura: number): void {
    if (this.currentBossTheme) {
      primary = this.currentBossTheme.primary;
      secondary = this.currentBossTheme.secondary;
      aura = this.currentBossTheme.accent;
    }
    this.backgroundTint.setFillStyle(aura, 0.06 + Math.min(0.08, this.stats.tier * 0.006));
    this.trackGlow.setFillStyle(primary, 0.05 + Math.min(0.1, this.stats.level * 0.003));
    this.laneLights.forEach((line, index) => {
      line.setFillStyle(index % 2 === 0 ? primary : secondary, 0.1 + Math.sin(this.stageTimer * 0.004 + index) * 0.035);
    });
    this.speedLines.forEach((line, index) => {
      line.setFillStyle(index % 2 === 0 ? primary : secondary, 0.12 + Math.min(0.08, this.stats.fireRate * 0.01));
    });
  }

  private updateBossBackdrop(delta: number): void {
    const theme = this.currentBossTheme;
    if (!theme) {
      this.bossBackdrop?.setAlpha(Phaser.Math.Linear(this.bossBackdrop.alpha, 0, 0.08));
      this.bossAurora?.setAlpha(Phaser.Math.Linear(this.bossAurora.alpha, 0, 0.08));
      this.bossSigils.forEach((sigil) => sigil.setAlpha(Phaser.Math.Linear(sigil.alpha, 0, 0.08)));
      this.bossMotes.forEach((mote) => mote.setAlpha(Phaser.Math.Linear(mote.alpha, 0, 0.08)));
      return;
    }

    this.bossBackdrop.setFillStyle(theme.darkness, 0.34);
    this.bossBackdrop.setAlpha(Phaser.Math.Linear(this.bossBackdrop.alpha, 1, 0.06));
    this.bossAurora.setFillStyle(theme.primary, 0.28);
    this.bossAurora.setAlpha(Phaser.Math.Linear(this.bossAurora.alpha, 1, 0.06));
    this.bossAurora.setAngle(Math.sin(this.stageTimer * 0.0014) * 7);
    this.bossAurora.setScale(1 + Math.sin(this.stageTimer * 0.002) * 0.08, 1);

    this.bossSigils.forEach((sigil, index) => {
      const pulse = 0.34 + Math.sin(this.stageTimer * 0.004 + index * 1.7) * 0.13;
      sigil.setFillStyle(index % 2 === 0 ? theme.primary : theme.secondary, pulse * 0.22);
      sigil.setStrokeStyle(2, index % 2 === 0 ? theme.accent : theme.secondary, pulse);
      sigil.setAlpha(Phaser.Math.Linear(sigil.alpha, 1, 0.08));
      sigil.setRotation(sigil.rotation + delta * 0.00045 * (index % 2 === 0 ? 1 : -1));
      sigil.y += Math.sin(this.stageTimer * 0.003 + index) * 0.18;
    });

    this.bossMotes.forEach((mote, index) => {
      mote.setFillStyle(index % 2 === 0 ? theme.accent : theme.primary, 0.22 + (index % 4) * 0.04);
      mote.setAlpha(Phaser.Math.Linear(mote.alpha, 1, 0.08));
      mote.y += (72 + (index % 5) * 16) * (delta / 1000);
      mote.x += Math.sin(this.stageTimer * 0.004 + index) * 0.35;
      mote.setAngle(mote.angle + (index % 2 === 0 ? 0.4 : -0.35));
      if (mote.y > 750) {
        mote.y = -30;
      }
    });
  }

  private updateWeaponParts(delta: number): void {
    const maxShown = Math.min(40, Math.max(0, this.stats.weaponCount - 1));
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
    const maxShown = Math.min(64, Math.max(8, this.stats.weaponCount));
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
    const previousStats = { ...this.stats, modules: [...this.stats.modules] };
    const previousHp = this.playerHp;
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
    if (option.kind === 'heal' && option.good) {
      this.playerHp += option.value;
    }
    this.spawnBurst(gateObject.x, gateObject.y, option.good ? option.color : 0xff4d6d, option.good ? 18 : 14);
    this.showFlash(option.good ? `${option.label} UPGRADE` : `${option.label} DOWN`, option.good ? '#dcfce7' : '#fecaca', gateObject.x, gateObject.y - 42);
    this.showStatGainFeedback(previousStats, previousHp, option);
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
      this.pulseStatusText(this.hpText, 0x38bdf8);
    } else {
      this.stats = applyEnemyImpact(this.stats);
      this.playerHp -= enemyObject.getDamage();
      this.showFlash(`HIT -${enemyObject.getDamage()}`, '#fecaca', this.player.x, this.player.y - 72);
      this.pulseStatusText(this.hpText, 0xfb7185);
    }
    this.spawnBurst(enemyObject.x, enemyObject.y, 0xff4d6d, 16);
    enemyObject.destroy();

    if (this.playerHp <= 0) {
      this.finish('GAME OVER');
    }
  }

  private handleBossProjectileCollision(projectile: Phaser.GameObjects.GameObject): void {
    if (!projectile.active) {
      return;
    }

    const damage = Number(projectile.getData('damage') ?? 1);
    const color = this.currentBossTheme?.accent ?? 0xfb7185;
    const x = 'x' in projectile ? Number(projectile.x) : this.player.x;
    const y = 'y' in projectile ? Number(projectile.y) : this.player.y;
    this.spawnBurst(x, y, color, 18);
    projectile.destroy();
    this.damagePlayer(damage, `BOSS HIT -${damage}`, color);
  }

  private damagePlayer(amount: number, label: string, color: number): void {
    if (this.stats.shield > 0) {
      this.stats = { ...this.stats, shield: Math.max(0, this.stats.shield - amount) };
      this.showFlash('SHIELD BLOCK', '#bae6fd', this.player.x, this.player.y - 72);
      this.pulseStatusText(this.hpText, 0x38bdf8);
      this.spawnBurst(this.player.x, this.player.y, 0x38bdf8, 18);
      return;
    }

    this.stats = applyEnemyImpact(this.stats);
    this.playerHp -= amount;
    this.showFlash(label, '#fecaca', this.player.x, this.player.y - 74);
    this.pulseStatusText(this.hpText, color);
    this.cameras.main.shake(170 + amount * 80, 0.003 + amount * 0.001);
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
      const defeatedBossKey = this.currentBossTheme?.key ?? getBossAssetByLoop(this.bossLoopIndex).key;
      this.spawnBurst(this.boss.x, this.boss.y, 0xfef3c7, 42);
      this.showFlash('BOSS BREAK +Lv', '#fef3c7', this.boss.x, this.boss.y - 70);
      const previousStats = { ...this.stats, modules: [...this.stats.modules] };
      const previousHp = this.playerHp;
      this.stats = {
        ...this.stats,
        level: this.stats.level + 1,
        power: this.stats.power + 4 + this.bossLoopIndex,
        weaponCount: this.stats.weaponCount + 10 + this.bossLoopIndex,
        tier: this.stats.tier + 1,
        synergy: this.stats.synergy + 3,
      };
      this.playerHp += 1;
      this.showStatGainFeedback(previousStats, previousHp, { label: 'BOSS BONUS', kind: 'fusion', value: 1, color: 0xfef3c7, good: true });
      this.boss.destroy();
      this.boss = undefined;
      this.currentBossTheme = undefined;
      this.bossProjectiles.clear(true, true);
      this.bossAttackTimer = 0;
      this.bossSpecialTimer = 0;
      this.bossLoopIndex += 1;
      this.bossHpBar.setVisible(false);
      this.bossHpFill.setVisible(false);
      this.bossHpText.setVisible(false);
      this.handleBossDefeated(defeatedBossKey);
    }
  }

  private handleBossDefeated(bossKey: string): void {
    this.defeatedBossKeys.push(bossKey);
    this.stageBranchOffset = Math.abs([...bossKey].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 17;
    const medals = 3 + this.bossLoopIndex + this.bossPhase;
    this.medalCount += medals;
    this.showFlash('STAGE BRANCH', '#bae6fd', 200, 254);
    this.showFlash(`MEDAL +${medals}`, '#fef3c7', 200, 214);
    this.time.delayedCall(520, () => this.showRelicDraft());
  }

  private getRelicOptions(): RelicOption[] {
    const allRelics: RelicOption[] = [
      {
        id: 'phoenix-core',
        title: '鳳凰コア',
        description: '武器変更チャンス: 炎 / 耐久+1',
        color: 0xfb923c,
        apply: (stats) => ({ ...stats, power: stats.power + 3, tier: stats.tier + 1, element: 'fire', archetype: stats.archetype === 'blaster' ? 'phoenix' : stats.archetype }),
      },
      {
        id: 'titan-plate',
        title: '巨神装甲',
        description: '防御特化 / シールド+2',
        color: 0x94a3b8,
        apply: (stats) => ({ ...stats, shield: stats.shield + 2, power: stats.power + 1 }),
      },
      {
        id: 'hydra-heart',
        title: '多頭の心臓',
        description: '武器変更チャンス: 多頭 / 武器数+8',
        color: 0x22c55e,
        apply: (stats) => ({ ...stats, weaponCount: stats.weaponCount + 8, synergy: stats.synergy + 2, archetype: 'hydra' }),
      },
      {
        id: 'storm-engine',
        title: '雷鳴機関',
        description: '武器変更チャンス: 雷 / 連射+',
        color: 0xfacc15,
        apply: (stats) => ({ ...stats, fireRate: stats.fireRate + 0.45, critRate: stats.critRate + 0.05, element: 'thunder', archetype: stats.archetype === 'blaster' ? 'levin' : stats.archetype }),
      },
      {
        id: 'royal-crown',
        title: '王冠レリック',
        description: '武器変更チャンス: レア度 / レベル+2',
        color: 0xfef3c7,
        apply: (stats) => ({ ...stats, level: stats.level + 2, tier: stats.tier + 1, rarity: stats.rarity === 'common' ? 'rare' : stats.rarity }),
      },
      {
        id: 'void-contract',
        title: '虚無契約',
        description: '武器変更チャンス: 影 / 攻撃大幅+',
        color: 0x8b5cf6,
        apply: (stats) => ({ ...stats, power: stats.power + 7, synergy: stats.synergy + 4, element: 'shadow', archetype: stats.archetype === 'blaster' ? 'phantom' : stats.archetype }),
      },
    ];

    const offset = this.defeatedBossKeys.length + this.stats.level + this.stats.tier;
    return [0, 2, 4].map((step) => allRelics[(offset + step) % allRelics.length]);
  }

  private showRelicDraft(): void {
    if (this.isGameOver || this.relicOverlay) {
      return;
    }

    const options = this.getRelicOptions();
    const { width, height } = this.scale;
    this.isPaused = true;
    this.physics.pause();
    const veil = this.add.rectangle(width / 2, height / 2, width, height, 0x020617, 0.74);
    const title = this.add.text(width / 2, 132, 'RELIC SELECT', {
      fontSize: '28px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 6,
    }).setOrigin(0.5);
    const nodes = options.map((option, index) => {
      const y = 242 + index * 118;
      const card = this.add.rectangle(width / 2, y, 316, 88, 0x09111f, 0.95);
      card.setStrokeStyle(3, option.color, 0.9);
      const gem = this.add.star(70, y, 7, 12, 24, option.color, 0.82);
      const name = this.add.text(104, y - 20, option.title, {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
        stroke: '#020617',
        strokeThickness: 4,
      }).setOrigin(0, 0.5);
      const desc = this.add.text(104, y + 16, option.description, {
        fontSize: '12px',
        color: '#cbd5e1',
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0, 0.5);
      card.setInteractive({ useHandCursor: true });
      card.on('pointerdown', () => this.chooseRelic(option));
      return [card, gem, name, desc];
    }).flat();

    this.relicOverlay = this.add.container(0, 0, [veil, title, ...nodes]).setDepth(40);
    this.playRareSound();
  }

  private chooseRelic(option: RelicOption): void {
    const previousStats = { ...this.stats, modules: [...this.stats.modules] };
    const previousHp = this.playerHp;
    this.stats = option.apply(this.stats);
    if (option.id === 'phoenix-core') {
      this.playerHp += 1;
    }
    if (option.id === 'void-contract') {
      this.playerHp = Math.max(1, this.playerHp - 1);
    }
    this.activeRelics.push(option.id);
    this.relicOverlay?.destroy();
    this.relicOverlay = undefined;
    this.isPaused = false;
    this.physics.resume();
    this.showStatGainFeedback(previousStats, previousHp, { label: option.title, kind: 'fusion', value: 1, color: option.color, good: true });
    this.showRareEvolution(option.color);
    this.playRareSound();
  }

  private spawnBoss(): void {
    this.bossMaxHp = createBossHp(this.bossLoopIndex);
    this.bossHp = this.bossMaxHp;
    const bossAsset = getBossAssetByLoop(this.bossLoopIndex);
    this.currentBossTheme = getBossTheme(bossAsset.key);
    this.boss = new Boss(this, 200, -130, this.bossHp, bossAsset.key);
    this.boss.setDepth(2);
    this.bossAttackTimer = 1200;
    this.bossSpecialTimer = 4300 + Phaser.Math.Between(0, 1200);
    this.bossPatternIndex = this.bossLoopIndex;
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
    this.spawnBossArrivalEffect(this.currentBossTheme);
    this.showFlash('BOSS INCOMING', '#fda4af', 200, 148);
  }

  private updateBossBar(): void {
    if (!this.boss) {
      return;
    }

    const hpRatio = clamp(this.bossHp / this.bossMaxHp, 0, 1);
    const nextPhase = hpRatio < 0.34 ? 3 : hpRatio < 0.67 ? 2 : 1;
    if (nextPhase !== this.bossPhase) {
      this.bossPhase = nextPhase;
      this.bossAttackTimer = Math.min(this.bossAttackTimer, 260);
      this.bossSpecialTimer = Math.min(this.bossSpecialTimer, 900);
      this.showFlash(`PHASE ${this.bossPhase}`, '#fecaca', this.boss.x, this.boss.y - 122);
      this.spawnBurst(this.boss.x, this.boss.y + 36, this.currentBossTheme?.accent ?? 0xfecaca, 34);
      this.cameras.main.shake(300, 0.004);
    }
    this.bossHpFill.displayWidth = Math.max(0, hpRatio * 180);
    this.bossHpText.setText(`BOSS P${this.bossPhase}  ${Math.max(0, this.bossHp)} HP`);
  }

  private activateSpecial(): void {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    if (this.playerHp <= 1) {
      this.showFlash('耐久不足', '#fecaca', this.player.x, this.player.y - 92);
      this.pulseStatusText(this.hpText, 0xfb7185);
      this.spawnBurst(this.player.x, this.player.y, 0xfb7185, 16);
      return;
    }

    const colors = getWeaponColors(this.stats);
    this.specialActive = true;
    this.specialTimer = 2600 + Math.min(1100, this.stats.synergy * 42 + this.stats.level * 18);
    this.specialDrainTimer = this.getSpecialDrainInterval() * 0.42;
    this.specialPulseTimer = 0;
    this.showSpecialOpening(colors.primary, colors.secondary, colors.aura);
    this.playRareSound();
    this.cameras.main.shake(420, 0.006);
  }

  private updateSpecial(delta: number): void {
    if (!this.specialActive) {
      return;
    }

    this.specialTimer -= delta;
    this.specialDrainTimer += delta;
    this.specialPulseTimer += delta;

    const drainInterval = this.getSpecialDrainInterval();
    if (this.specialDrainTimer >= drainInterval) {
      this.specialDrainTimer = 0;
      this.playerHp -= 1;
      this.pulseStatusText(this.hpText, 0xfb7185);
      this.showFlash('LIFE BURN', '#fecaca', this.player.x, this.player.y - 118);
      this.spawnBurst(this.player.x, this.player.y, 0xfb7185, 20);
      if (this.playerHp <= 0) {
        this.finish('GAME OVER');
        return;
      }
    }

    if (this.specialPulseTimer >= 125) {
      this.specialPulseTimer = 0;
      this.emitSpecialPulse();
    }

    if (this.specialTimer <= 0) {
      this.specialActive = false;
      this.showFlash('OVERDRIVE END', '#e0f2fe', this.player.x, this.player.y - 104);
    }
  }

  private getSpecialDrainInterval(): number {
    const heavyArchetypes = ['anchor', 'gigas', 'atlas', 'hammer', 'magnum', 'rail', 'meteor', 'dragon'];
    const efficientArchetypes = ['drone', 'hydra', 'wasp', 'wind', 'orbit', 'lotus', 'seraph', 'rune'];
    const heavyCost = heavyArchetypes.includes(this.stats.archetype) ? -170 : 0;
    const efficientBonus = efficientArchetypes.includes(this.stats.archetype) ? 150 : 0;
    const rarityCost = this.stats.rarity === 'mythic' ? -110 : this.stats.rarity === 'legend' ? -70 : this.stats.rarity === 'epic' ? -35 : 0;
    const buildCost = Math.min(180, this.stats.power * 5 + this.stats.weaponCount * 2);
    return clamp(1040 + efficientBonus + heavyCost + rarityCost - buildCost, 620, 1180);
  }

  private showSpecialOpening(primary: number, secondary: number, aura: number): void {
    const { width, height } = this.scale;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, aura, 0.42).setDepth(35).setBlendMode(Phaser.BlendModes.ADD);
    const crown = this.add.circle(this.player.x, this.player.y, 48, primary, 0).setStrokeStyle(7, secondary, 1).setDepth(36);
    const halo = this.add.circle(this.player.x, this.player.y, 78, secondary, 0).setStrokeStyle(3, aura, 0.9).setDepth(36);
    const title = this.add.text(width / 2, height * 0.36, 'LIFE OVERDRIVE', {
      fontSize: '34px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(37);
    const subtitle = this.add.text(width / 2, height * 0.42, getWeaponName(this.stats), {
      fontSize: '13px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(37);

    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18;
      const ray = this.add.rectangle(this.player.x, this.player.y, 5, 150, i % 2 === 0 ? primary : secondary, 0.46).setDepth(34);
      ray.setBlendMode(Phaser.BlendModes.ADD);
      ray.setRotation(angle);
      this.tweens.add({
        targets: ray,
        alpha: 0,
        scaleY: 2.2,
        duration: 760,
        ease: 'Cubic.easeOut',
        onComplete: () => ray.destroy(),
      });
    }

    this.tweens.add({ targets: flash, alpha: 0, duration: 680, onComplete: () => flash.destroy() });
    this.tweens.add({ targets: [crown, halo], scale: 4.2, alpha: 0, duration: 880, ease: 'Cubic.easeOut', onComplete: () => { crown.destroy(); halo.destroy(); } });
    this.tweens.add({ targets: [title, subtitle], y: '-=28', alpha: 0, duration: 1180, ease: 'Sine.easeOut', onComplete: () => { title.destroy(); subtitle.destroy(); } });
  }

  private emitSpecialPulse(): void {
    const colors = getWeaponColors(this.stats);
    const damage = Math.max(12, Math.round((this.stats.power + this.stats.level * 2 + this.stats.weaponCount * 0.45) * getWeaponPowerMultiplier(this.stats) * 1.12));
    const specialStyle = this.getWeaponSpecialStyle();
    let range = 460;
    let enemyDamage = damage * 2;
    let bossDamage = damage;

    if (specialStyle === 'anchor') {
      range = 380;
      enemyDamage = damage * 3.4;
      bossDamage = damage * 2.4;
      const slamCount = 3 + Math.min(2, Math.floor(this.stats.weaponCount / 22));
      for (let i = 0; i < slamCount; i++) {
        const x = this.player.x + (i - (slamCount - 1) / 2) * 68;
        const pillar = this.add.rectangle(x, this.player.y - 170, 28, 360, colors.primary, 0.68).setDepth(14).setBlendMode(Phaser.BlendModes.ADD);
        const impact = this.add.circle(x, this.player.y - 28, 24, colors.secondary, 0).setStrokeStyle(8, colors.bullet, 0.9).setDepth(15);
        this.tweens.add({ targets: pillar, y: '+=92', alpha: 0, scaleX: 4.8, duration: 260, ease: 'Cubic.easeOut', onComplete: () => pillar.destroy() });
        this.tweens.add({ targets: impact, scale: 4.4, alpha: 0, duration: 340, ease: 'Cubic.easeOut', onComplete: () => impact.destroy() });
      }
    } else if (specialStyle === 'basilisk') {
      range = 560;
      enemyDamage = damage * 1.35;
      bossDamage = damage * 1.15;
      this.enemies.getChildren().slice(0, 8).forEach((enemy, index) => {
        const target = enemy as Enemy;
        const line = this.add.line(0, 0, this.player.x, this.player.y - 18, target.x, target.y, index % 2 === 0 ? colors.primary : colors.secondary, 0.74).setDepth(15);
        line.setLineWidth(5).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: line, alpha: 0, duration: 260, ease: 'Quad.easeOut', onComplete: () => line.destroy() });
      });
      const eye = this.add.circle(this.player.x, this.player.y - 54, 20, colors.primary, 0.34).setStrokeStyle(4, colors.secondary, 0.92).setDepth(15);
      this.tweens.add({ targets: eye, scaleX: 6, scaleY: 1.2, alpha: 0, duration: 320, ease: 'Quad.easeOut', onComplete: () => eye.destroy() });
    } else if (specialStyle === 'rune') {
      range = 430;
      enemyDamage = damage * 1.7;
      bossDamage = damage * 0.9;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 + this.stageTimer * 0.002;
        const glyph = this.add.rectangle(this.player.x + Math.cos(angle) * 62, this.player.y + Math.sin(angle) * 38, 18, 18, i % 2 === 0 ? colors.secondary : colors.bullet, 0.72).setDepth(15);
        glyph.setAngle(45 + i * 30).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: glyph, scale: 2.4, angle: glyph.angle + 180, alpha: 0, duration: 420, ease: 'Sine.easeOut', onComplete: () => glyph.destroy() });
      }
      const ward = this.add.circle(this.player.x, this.player.y, 42, colors.aura, 0).setStrokeStyle(5, colors.bullet, 0.86).setDepth(15);
      this.tweens.add({ targets: ward, scale: 3.7, alpha: 0, duration: 420, ease: 'Quad.easeOut', onComplete: () => ward.destroy() });
      if (Math.random() < 0.34) {
        this.playerHp += 1;
        this.showFlash('RUNE HEAL', '#dcfce7', this.player.x, this.player.y - 124);
      }
    } else if (specialStyle === 'phoenix') {
      range = 500;
      enemyDamage = damage * 2.5;
      bossDamage = damage * 1.55;
      for (let i = 0; i < 7; i++) {
        const offset = i - 3;
        const feather = this.add.triangle(this.player.x + offset * 24, this.player.y - 78, 0, -22, 14, 20, -14, 20, i % 2 === 0 ? colors.primary : colors.secondary, 0.78).setDepth(15);
        feather.setAngle(offset * 12).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: feather, y: '-=210', x: `+=${offset * 18}`, scale: 2.4, alpha: 0, duration: 430, ease: 'Cubic.easeOut', onComplete: () => feather.destroy() });
      }
      this.spawnBurst(this.player.x, this.player.y - 54, colors.secondary, 34);
      if (Math.random() < 0.22) {
        this.playerHp += 1;
        this.showFlash('REBIRTH', '#dcfce7', this.player.x, this.player.y - 124);
      }
    } else if (specialStyle === 'storm') {
      range = 520;
      enemyDamage = damage * 2.05;
      bossDamage = damage * 1.2;
      for (let i = 0; i < 7; i++) {
        const x = Phaser.Math.Between(54, 346);
        const bolt = this.add.line(0, 0, x, this.player.y - 370, x + Phaser.Math.Between(-30, 30), this.player.y + 10, i % 2 === 0 ? colors.bullet : colors.secondary, 0.88).setDepth(15);
        bolt.setLineWidth(4 + (i % 3)).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: bolt, alpha: 0, duration: 170, ease: 'Quad.easeOut', onComplete: () => bolt.destroy() });
      }
      this.bossProjectiles.getChildren().slice(0, 8).forEach((projectile) => {
        const obj = projectile as Phaser.GameObjects.GameObject & { x: number; y: number };
        this.spawnBurst(obj.x, obj.y, colors.bullet, 12);
        projectile.destroy();
      });
      this.playTone(880 + Math.random() * 120, 0.035, 0.02);
    } else {
      range = 620;
      enemyDamage = damage * 1.85;
      bossDamage = damage * 0.95;
      const nova = this.add.circle(this.player.x, this.player.y - 80, 22, colors.secondary, 0.22).setStrokeStyle(6, colors.bullet, 0.86).setDepth(16);
      const core = this.add.circle(this.player.x, this.player.y - 80, 10, colors.primary, 0.7).setDepth(16).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: nova, scale: 9, alpha: 0, duration: 460, ease: 'Cubic.easeOut', onComplete: () => nova.destroy() });
      this.tweens.add({ targets: core, scale: 14, alpha: 0, duration: 360, ease: 'Cubic.easeOut', onComplete: () => core.destroy() });
    }

    this.enemies.getChildren().forEach((enemy) => {
      const enemyObject = enemy as Enemy;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemyObject.x, enemyObject.y);
      if (distance < range && enemyObject.damage(Math.round(enemyDamage))) {
        this.spawnBurst(enemyObject.x, enemyObject.y, colors.secondary, 28);
        enemyObject.destroy();
      } else if (distance < range) {
        this.spawnHitEffect(enemyObject.x, enemyObject.y, colors.bullet);
      }
    });

    if (this.boss) {
      this.bossHp -= Math.round(bossDamage);
      this.spawnHitEffect(this.boss.x + Phaser.Math.Between(-86, 86), this.boss.y + Phaser.Math.Between(-40, 80), colors.bullet);
      if (specialStyle === 'basilisk') {
        this.bossAttackTimer += 120;
      }
      if (this.bossHp <= 0) {
        this.hitBoss(new Bullet(this, this.boss.x, this.boss.y, colors.bullet));
      }
    }
  }

  private getWeaponSpecialStyle(): 'anchor' | 'basilisk' | 'rune' | 'phoenix' | 'storm' | 'nova' {
    if (['anchor', 'kraken', 'gigas', 'atlas', 'hammer'].includes(this.stats.archetype)) return 'anchor';
    if (['basilisk', 'chimera', 'onyx', 'phantom'].includes(this.stats.archetype) || this.stats.element === 'shadow') return 'basilisk';
    if (['rune', 'oracle', 'seraph'].includes(this.stats.archetype) || this.stats.element === 'light') return 'rune';
    if (this.stats.element === 'fire' || this.stats.archetype === 'phoenix') return 'phoenix';
    if (this.stats.element === 'thunder' || this.stats.archetype === 'levin') return 'storm';
    return 'nova';
  }

  private spawnBossArrivalEffect(theme: BossTheme): void {
    const { width, height } = this.scale;
    const omen = this.add.rectangle(width / 2, height / 2, width, height, theme.primary, 0.24).setDepth(20).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: omen, alpha: 0, duration: 760, onComplete: () => omen.destroy() });
    for (let i = 0; i < 9; i++) {
      const ring = this.add.circle(200, 148, 42 + i * 18, theme.primary, 0).setStrokeStyle(2 + (i % 3), i % 2 === 0 ? theme.accent : theme.secondary, 0.78).setDepth(21);
      this.tweens.add({
        targets: ring,
        scale: 1.8 + i * 0.13,
        alpha: 0,
        duration: 520 + i * 70,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy(),
      });
    }
    this.cameras.main.shake(360, 0.004);
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

  private showStatGainFeedback(previousStats: PlayerStats, previousHp: number, option: GateOption): void {
    const gains: Array<{ label: string; target: Phaser.GameObjects.Text; color: number }> = [];
    const weaponDelta = this.stats.weaponCount - previousStats.weaponCount;
    const powerDelta = this.stats.power - previousStats.power;
    const levelDelta = this.stats.level - previousStats.level;
    const hpDelta = this.playerHp - previousHp;

    if (weaponDelta !== 0) {
      gains.push({ label: `武器 ${weaponDelta > 0 ? '+' : ''}${weaponDelta}`, target: this.weaponText, color: weaponDelta > 0 ? 0x86efac : 0xfb7185 });
    }
    if (powerDelta > 0) {
      gains.push({ label: `攻撃力 +${powerDelta}`, target: this.powerText, color: 0x93c5fd });
    }
    if (levelDelta > 0) {
      gains.push({ label: `レベル +${levelDelta}`, target: this.levelText, color: 0xd8b4fe });
    }
    if (hpDelta > 0) {
      gains.push({ label: `耐久 +${hpDelta}`, target: this.hpText, color: 0xfb7185 });
    }

    if (option.good && gains.length === 0) {
      gains.push({ label: option.label, target: this.buildText, color: option.color });
    }

    gains.slice(0, 3).forEach((gain, index) => {
      this.pulseStatusText(gain.target, gain.color);
      const text = this.add.text(this.player.x, this.player.y - 92 - index * 26, gain.label, {
        fontSize: index === 0 ? '24px' : '18px',
        color: `#${gain.color.toString(16).padStart(6, '0')}`,
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
        stroke: '#020617',
        strokeThickness: 5,
      }).setOrigin(0.5).setDepth(16);
      this.tweens.add({
        targets: text,
        y: text.y - 42,
        alpha: 0,
        scale: 1.16,
        duration: 760,
        ease: 'Cubic.easeOut',
        onComplete: () => text.destroy(),
      });
    });

    if (gains.length > 0) {
      const color = option.good ? option.color : 0xff4d6d;
      const ring = this.add.circle(this.player.x, this.player.y, 34, color, 0).setStrokeStyle(5, color, 0.95).setDepth(15);
      this.tweens.add({
        targets: ring,
        scale: 2.7,
        alpha: 0,
        duration: 520,
        ease: 'Quad.easeOut',
        onComplete: () => ring.destroy(),
      });
    }
  }

  private pulseStatusText(target: Phaser.GameObjects.Text, color: number): void {
    target.setTint(color);
    this.tweens.add({
      targets: target,
      scale: 1.42,
      duration: 130,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => {
        target.setScale(1);
        target.clearTint();
      },
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
      const panel = this.add.rectangle(200, 360, 310, 202, 0x020617, 0.86);
      panel.setStrokeStyle(2, 0x38bdf8, 0.65);
      const title = this.add.text(200, 304, 'PAUSED', {
        fontSize: '34px',
        color: '#f8fafc',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
        stroke: '#020617',
        strokeThickness: 5,
      }).setOrigin(0.5);
      const build = this.add.text(200, 360, `${getWeaponName(this.stats)}\nBUILD ${getBuildRank(this.stats)} / RELIC ${this.activeRelics.length} / MEDAL ${this.medalCount}`, {
        fontSize: '12px',
        color: '#fef3c7',
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        lineSpacing: 6,
      }).setOrigin(0.5);
      const resume = this.add.text(200, 426, 'タップで再開', {
        fontSize: '16px',
        color: '#bae6fd',
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0.5);
      this.pauseOverlay = this.add.container(0, 0, [panel, title, build, resume]).setDepth(30);
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
    const bestDistance = saveBestDistance(this.distance);
    const meta = recordRun({
      distance: this.distance,
      bosses: this.defeatedBossKeys,
      weaponName: getWeaponName(this.stats),
      medals: this.medalCount + Math.floor(this.distance / 220),
    });
    this.scene.start('ResultScene', {
      title,
      subtitle: '最高記録を超えるまで強化ランは続く',
      weaponCount: this.stats.weaponCount,
      power: this.stats.power,
      level: this.stats.level,
      distance: Math.floor(this.distance),
      bestDistance,
      weaponName: getWeaponName(this.stats),
      medals: meta.medals,
      defeatedBosses: this.defeatedBossKeys.length,
      totalBosses: meta.totalBossKills,
      relics: this.activeRelics,
      codexBosses: meta.bosses.length,
      codexWeapons: meta.weapons.length,
    });
  }
}
