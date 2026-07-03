import Phaser from 'phaser';
import { Boss } from '../objects/Boss';
import { Bullet, type BulletShape } from '../objects/Bullet';
import { Enemy } from '../objects/Enemy';
import { GatePair } from '../objects/GatePair';
import { PlayerWeapon } from '../objects/PlayerWeapon';
import { getBossAssetByLoop, getBossTheme, getRandomBossAsset, type BossTheme } from '../systems/AssetCatalog';
import { findEnemyVariant } from '../systems/EnemyCatalog';
import { PlayerInputController } from '../systems/PlayerInputController';
import { rollRareRushEvent, type RareRushEvent } from '../systems/RareEventCatalog';
import { loadBestDistance, loadPlayerMeta, recordLeaderboard, recordRun, saveBestDistance } from '../systems/RecordSystem';
import { BOSS_WARNING_PROFILE, EVENT_REWARD_PROFILE, RARE_SOUND_PROFILE, getUpgradeProfile, getWeaponShotProfile, type SoundProfile } from '../systems/SoundCatalog';
import { createBossHp, createLoopStep, INITIAL_STEP_INTERVAL, LOOP_STEP_INTERVAL, OPENING_STEPS } from '../systems/StageSpawner';
import { applyEnemyImpact, applyGateEffect, clamp } from '../systems/UpgradeSystem';
import { getBuildRank, getEvolutionBranch, getModuleProfile, getShotSpread, getStarterWeapon, getWeaponColors, getWeaponName, getWeaponPowerMultiplier, getRarityProfile } from '../systems/WeaponEvolution';
import type { GateOption, PlayerStats, StageStep, StatusEffect } from '../types/GameTypes';

type ControlKeys = Record<'W' | 'S' | 'A' | 'D' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT', Phaser.Input.Keyboard.Key>;
type SpecialStyle = 'anchor' | 'basilisk' | 'rune' | 'phoenix' | 'storm' | 'frost' | 'nova' | 'blade';
type SpecialVariant = 0 | 1 | 2;
type ChargeBurstTheme = 'thunder' | 'strawberry' | 'grape';

interface PlayerStatusState {
  poisonMs: number;
  poisonTickMs: number;
  paralyzeMs: number;
  freezeMs: number;
  burnMs: number;
  burnTickMs: number;
  curseMs: number;
}

interface StageTheme {
  name: string;
  sky: number;
  ground: number;
  trackOuter: number;
  trackMid: number;
  trackInner: number;
  lane: number;
  accent: number;
}

const PLAYER_MIN_X = 28;
const PLAYER_MAX_X = 372;
const PLAYER_MIN_Y = 48;
const PLAYER_MAX_Y = 684;

const STAGE_THEMES: StageTheme[] = [
  { name: 'STRAWBERRY DAWN', sky: 0x2a0d08, ground: 0x1c140f, trackOuter: 0xd6d8dd, trackMid: 0xbfc3ca, trackInner: 0xe5e7eb, lane: 0xffffff, accent: 0xfb7185 },
  { name: 'NEON CIRCUIT', sky: 0x051923, ground: 0x06232c, trackOuter: 0x0f766e, trackMid: 0x164e63, trackInner: 0xd9f99d, lane: 0x67e8f9, accent: 0x22d3ee },
  { name: 'TOXIC GARDEN', sky: 0x17210b, ground: 0x0f1f0c, trackOuter: 0x365314, trackMid: 0x65a30d, trackInner: 0xecfccb, lane: 0xd9f99d, accent: 0x84cc16 },
  { name: 'FROST FORGE', sky: 0x082f49, ground: 0x0c1f2e, trackOuter: 0x075985, trackMid: 0x7dd3fc, trackInner: 0xf0f9ff, lane: 0xe0f2fe, accent: 0x38bdf8 },
  { name: 'VOID FIELD', sky: 0x09051a, ground: 0x120a24, trackOuter: 0x312e81, trackMid: 0x6d28d9, trackInner: 0xe9d5ff, lane: 0xf0abfc, accent: 0xa855f7 },
  { name: 'VINEYARD STORM', sky: 0x16051e, ground: 0x1f1029, trackOuter: 0x4c1d95, trackMid: 0x6d28d9, trackInner: 0xd8b4fe, lane: 0x86efac, accent: 0xa855f7 },
  { name: 'ARROW AURORA', sky: 0x06241f, ground: 0x0d1f22, trackOuter: 0x0f766e, trackMid: 0x38bdf8, trackInner: 0xfef3c7, lane: 0x99f6e4, accent: 0xfacc15 },
  { name: 'SABER NIGHT', sky: 0x1f0712, ground: 0x170914, trackOuter: 0x7f1d1d, trackMid: 0xbe123c, trackInner: 0xffedd5, lane: 0xfca5a5, accent: 0xfb7185 },
  { name: 'ROCKET FOUNDRY', sky: 0x1c0a05, ground: 0x23110a, trackOuter: 0x7c2d12, trackMid: 0xea580c, trackInner: 0xfef3c7, lane: 0xfacc15, accent: 0xfb923c },
  { name: 'AEGIS SANCTUM', sky: 0x082f49, ground: 0x0f172a, trackOuter: 0x155e75, trackMid: 0x22d3ee, trackInner: 0xf0f9ff, lane: 0xbae6fd, accent: 0x7dd3fc },
  { name: 'PIERCE CANYON', sky: 0x111827, ground: 0x1f2937, trackOuter: 0x334155, trackMid: 0x06b6d4, trackInner: 0xe0f2fe, lane: 0x67e8f9, accent: 0x99f6e4 },
  { name: 'BOSS INFERNO', sky: 0x180812, ground: 0x21070d, trackOuter: 0x7f1d1d, trackMid: 0xef4444, trackInner: 0xffedd5, lane: 0xfef3c7, accent: 0xfb923c },
  { name: 'BOSS ABYSS', sky: 0x020617, ground: 0x09051a, trackOuter: 0x312e81, trackMid: 0x7e22ce, trackInner: 0xe9d5ff, lane: 0xf0abfc, accent: 0x8b5cf6 },
  { name: 'BOSS TIDE', sky: 0x082f49, ground: 0x061625, trackOuter: 0x075985, trackMid: 0x0ea5e9, trackInner: 0xe0f2fe, lane: 0xbae6fd, accent: 0x38bdf8 },
  { name: 'BOSS CLOCK', sky: 0x111827, ground: 0x1c1917, trackOuter: 0x92400e, trackMid: 0xb45309, trackInner: 0xfef3c7, lane: 0xfde68a, accent: 0xfacc15 },
  { name: 'BOSS VINEYARD', sky: 0x16051e, ground: 0x1f1029, trackOuter: 0x581c87, trackMid: 0x7e22ce, trackInner: 0xf0abfc, lane: 0x86efac, accent: 0xc084fc },
];

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
  private specialText!: Phaser.GameObjects.Text;
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
  private stageThemeIndex = 0;
  private stageGround!: Phaser.GameObjects.Rectangle;
  private backgroundTint!: Phaser.GameObjects.Rectangle;
  private trackOuter!: Phaser.GameObjects.Polygon;
  private trackMid!: Phaser.GameObjects.Polygon;
  private trackInner!: Phaser.GameObjects.Polygon;
  private bossBackdrop!: Phaser.GameObjects.Rectangle;
  private bossAurora!: Phaser.GameObjects.Rectangle;
  private bossSigils: Phaser.GameObjects.Arc[] = [];
  private bossMotes: Phaser.GameObjects.Rectangle[] = [];
  private stageMarkers: Phaser.GameObjects.Rectangle[] = [];
  private stageThemeText!: Phaser.GameObjects.Text;
  private currentBossTheme?: BossTheme;
  private trackGlow!: Phaser.GameObjects.Polygon;
  private laneLights: Phaser.GameObjects.Rectangle[] = [];
  private audioContext?: AudioContext;
  private specialActive = false;
  private specialTimer = 0;
  private specialDrainTimer = 0;
  private specialPulseTimer = 0;
  private specialVariant: SpecialVariant = 0;
  private specialCharge = 0;
  private specialCooldown = 0;
  private chargeBurstTheme?: ChargeBurstTheme;
  private chargeBurstPower = 0;
  private chargeBurstPulseTimer = 0;
  private bossAttackTimer = 0;
  private bossSpecialTimer = 0;
  private bossPatternIndex = 0;
  private bossPhase = 1;
  private bossDefeatGraceMs = 0;
  private bossWarningActive = false;
  private bossSpawnStartedAt = 0;
  private nextBossStepTarget = 10;
  private firstBossPrepGranted = false;
  private defeatedBossKeys: string[] = [];
  private evolutionCount = 0;
  private evolutionPath: string[] = [];
  private lockedWeaponSkinKey = 'weaponAnime';
  private lockedWeaponTitle = 'Buki';
  private starterCategoryId = 'balance-bow';
  private playerStatuses: PlayerStatusState = {
    poisonMs: 0,
    poisonTickMs: 0,
    paralyzeMs: 0,
    freezeMs: 0,
    burnMs: 0,
    burnTickMs: 0,
    curseMs: 0,
  };
  private medalCount = 0;
  private permanentRank = 0;
  private bossPhaseText!: Phaser.GameObjects.Text;
  private stageBranchOffset = 0;
  private statusPanelObjects: Phaser.GameObjects.GameObject[] = [];
  private rareEvent?: RareRushEvent;
  private rareEventKills = 0;
  private rareEventSpawned = 0;
  private rareEventSpawnTimer = 0;
  private shotSoundTimer = 0;

  constructor() {
    super('GameScene');
  }

  create(data?: { starterId?: string }): void {
    const { width, height } = this.scale;

    this.resetRunState(data?.starterId);
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
    this.physics.add.overlap(this.bullets, this.bossProjectiles, (bulletObject, projectileObject) => this.resolveProjectileClash(bulletObject as Bullet, projectileObject as Phaser.GameObjects.GameObject), undefined, this);
    this.physics.add.overlap(this.player, this.bossProjectiles, (_player, projectile) => this.handleBossProjectileCollision(projectile as Phaser.GameObjects.GameObject), undefined, this);
  }

  private resetRunState(starterId?: string): void {
    this.time.timeScale = 1;
    this.physics.world.timeScale = 1;
    const meta = loadPlayerMeta();
    const starter = getStarterWeapon(starterId);
    this.permanentRank = meta.permanentRank;
    this.starterCategoryId = starter.categoryId;
    this.lockedWeaponSkinKey = starter.imageKey;
    this.lockedWeaponTitle = starter.title;
    this.stats = {
      ...starter.stats,
      modules: [...starter.stats.modules],
      power: starter.stats.power + Math.floor(this.permanentRank / 2),
      level: starter.stats.level + Math.floor(this.permanentRank / 4),
      fireRate: starter.stats.fireRate + this.permanentRank * 0.03,
      critRate: starter.stats.critRate + this.permanentRank * 0.004,
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
    this.stageMarkers = [];
    this.stageThemeIndex = 0;
    this.currentBossTheme = undefined;
    this.specialActive = false;
    this.specialTimer = 0;
    this.specialDrainTimer = 0;
    this.specialPulseTimer = 0;
    this.specialVariant = 0;
    this.specialCharge = 12;
    this.specialCooldown = 0;
    this.chargeBurstTheme = undefined;
    this.chargeBurstPower = 0;
    this.chargeBurstPulseTimer = 0;
    this.bossAttackTimer = 0;
    this.bossSpecialTimer = 0;
    this.bossPatternIndex = 0;
    this.bossPhase = 1;
    this.bossDefeatGraceMs = 0;
    this.bossWarningActive = false;
    this.bossSpawnStartedAt = 0;
    this.nextBossStepTarget = Phaser.Math.Between(9, 12);
    this.firstBossPrepGranted = false;
    this.defeatedBossKeys = [];
    this.evolutionCount = 0;
    this.evolutionPath = [];
    this.medalCount = 0;
    this.stageBranchOffset = 0;
    this.rareEvent = undefined;
    this.rareEventKills = 0;
    this.rareEventSpawned = 0;
    this.rareEventSpawnTimer = 0;
    this.shotSoundTimer = 0;
    this.pauseOverlay = undefined;
    this.playerStatuses = {
      poisonMs: 0,
      poisonTickMs: 0,
      paralyzeMs: 0,
      freezeMs: 0,
      burnMs: 0,
      burnTickMs: 0,
      curseMs: 0,
    };
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    const smoothDelta = Math.min(delta, 33);
    this.stageTimer += smoothDelta;
    this.fireTimer += delta;
    this.shotSoundTimer = Math.max(0, this.shotSoundTimer - smoothDelta);
    this.distance += (smoothDelta / 1000) * 22;
    this.bossDefeatGraceMs = Math.max(0, this.bossDefeatGraceMs - smoothDelta);

    this.spawnStageEvents();
    this.updateRareEvent(smoothDelta);
    this.updatePlayerStatuses(smoothDelta);
    this.updateEnemyStatuses(smoothDelta);
    this.updateEnemyTactics(smoothDelta);
    this.updateMovement(smoothDelta);
    this.updateSpeedLines(smoothDelta);
    this.updateBullets(smoothDelta);
    this.updateSpecialCharge(smoothDelta);
    this.updateSpecial(smoothDelta);
    this.updateBossAttacks(smoothDelta);
    this.updateBossProjectiles(smoothDelta);
    this.moveFlowingObjects(smoothDelta);
    this.updateBossBackdrop(smoothDelta);
    this.updateStageBackground();
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
    const theme = STAGE_THEMES[0];
    this.stageGround = this.add.rectangle(width / 2, height / 2, width, height, theme.ground, 1);
    this.backgroundTint = this.add.rectangle(width / 2, height / 2, width, height, 0x38bdf8, 0.08).setBlendMode(Phaser.BlendModes.ADD);
    this.backgroundTint.setDepth(0.05);
    this.bossBackdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x020617, 0).setDepth(0.055);
    this.bossAurora = this.add.rectangle(width / 2, height / 2, width * 0.72, height, 0x38bdf8, 0).setBlendMode(Phaser.BlendModes.ADD);
    this.bossAurora.setDepth(0.07);
    this.trackOuter = this.add.polygon(width / 2, height / 2, [58, 720, 342, 720, 308, 0, 92, 0], theme.trackOuter, 1);
    this.trackMid = this.add.polygon(width / 2, height / 2, [82, 720, 318, 720, 288, 0, 112, 0], theme.trackMid, 1);
    this.trackInner = this.add.polygon(width / 2, height / 2, [112, 720, 288, 720, 268, 0, 132, 0], theme.trackInner, 0.92);
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

    for (let i = 0; i < 18; i++) {
      const marker = this.add.rectangle(34 + (i * 71) % 332, (i * 117) % height, 8 + (i % 3) * 3, 56 + (i % 4) * 12, theme.accent, 0.1);
      marker.setAngle(i % 2 === 0 ? -11 : 11);
      marker.setBlendMode(Phaser.BlendModes.ADD);
      marker.setDepth(0.06);
      this.stageMarkers.push(marker);
    }

    this.stageThemeText = this.add.text(22, 128, theme.name, {
      fontSize: '10px',
      color: '#fef3c7',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#020617',
      strokeThickness: 3,
    }).setOrigin(0, 0.5).setAlpha(0.72).setDepth(9);
  }

  private createStatusPanel(): void {
    const panelGlow = this.add.rectangle(200, 62, 376, 108, 0x38bdf8, 0.1);
    panelGlow.setDepth(7);
    const panel = this.add.rectangle(200, 62, 364, 102, 0x09111f, 0.9);
    panel.setStrokeStyle(2, 0x38bdf8, 0.38);
    panel.setDepth(8);
    this.statusPanelObjects = [panelGlow, panel];

    const items = [
      { label: '武器数', x: 58, color: '#86efac' },
      { label: '攻撃力', x: 154, color: '#93c5fd' },
      { label: 'レベル', x: 248, color: '#d8b4fe' },
      { label: '耐久', x: 334, color: '#fecaca' },
    ];

    items.forEach((item) => {
      const label = this.add.text(item.x, 27, item.label, { fontSize: '11px', color: item.color, fontFamily: 'Arial, sans-serif' }).setOrigin(0.5).setDepth(9);
      this.statusPanelObjects.push(label);
    });

    this.weaponText = this.add.text(58, 50, '1', { fontSize: '22px', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0.5).setDepth(9);
    this.powerText = this.add.text(154, 50, '1', { fontSize: '22px', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0.5).setDepth(9);
    this.levelText = this.add.text(248, 50, '1', { fontSize: '22px', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0.5).setDepth(9);
    this.hpText = this.add.text(334, 50, '3', { fontSize: '22px', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0.5).setDepth(9);
    this.hpPips = Array.from({ length: 5 }, (_, index) => {
      const pip = this.add.circle(302 + index * 16, 68, 5.5, 0xfb7185, index < this.playerHp ? 0.98 : 0.18);
      pip.setStrokeStyle(2, index < this.playerHp ? 0xfff1f2 : 0x7f1d1d, index < this.playerHp ? 0.9 : 0.55);
      pip.setDepth(9);
      return pip;
    });
    this.weaponNameText = this.add.text(22, 77, 'C 無-Runner Blaster', { fontSize: '12px', color: '#e0f2fe', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(9);
    this.moduleText = this.add.text(22, 96, 'MOD: none', { fontSize: '10px', color: '#bae6fd', fontFamily: 'Arial, sans-serif' }).setOrigin(0, 0.5).setDepth(9);
    this.buildText = this.add.text(210, 96, 'BUILD 0', { fontSize: '10px', color: '#fef3c7', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(9);
    this.distanceText = this.add.text(300, 77, '0m', { fontSize: '12px', color: '#f8fafc', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(1, 0.5).setDepth(9);
    this.bestText = this.add.text(378, 77, 'BEST 0m', { fontSize: '12px', color: '#fde68a', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(1, 0.5).setDepth(9);
    this.bossPhaseText = this.add.text(378, 96, 'MEDAL 0', { fontSize: '10px', color: '#fca5a5', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(1, 0.5).setDepth(9);
    this.specialText = this.add.text(200, 116, '必殺 12%', { fontSize: '11px', color: '#fef08a', fontFamily: 'Arial, sans-serif', fontStyle: 'bold' }).setOrigin(0.5).setDepth(9);
    this.statusPanelObjects.push(this.weaponText, this.powerText, this.levelText, this.hpText, ...this.hpPips, this.weaponNameText, this.moduleText, this.buildText, this.distanceText, this.bestText, this.bossPhaseText, this.specialText);
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
    if (this.rareEvent) {
      return;
    }

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
      if (!this.boss) {
        const event = rollRareRushEvent();
        if (event) {
          this.startRareEvent(event);
          this.nextLoopSpawnTime += LOOP_STEP_INTERVAL;
          return;
        }
      }
      const difficulty = Math.floor(this.loopStepIndex / 6);
      this.spawnStageStep(createLoopStep(this.loopStepIndex + this.stageBranchOffset, difficulty + Math.floor(this.defeatedBossKeys.length / 2)));
      this.loopStepIndex += 1;
      this.nextLoopSpawnTime += Math.max(1050, LOOP_STEP_INTERVAL - difficulty * 35);

      if (this.loopStepIndex >= this.nextBossStepTarget && !this.boss && !this.bossWarningActive) {
        this.triggerBossWarning();
      }
    }
  }

  private spawnStageStep(step: StageStep): void {
    if (step.gateLine) {
      const pair = new GatePair(this, 200, step.gateLine.y, step.gateLine.single ?? step.gateLine.left, step.gateLine.right, Boolean(step.gateLine.single));
      pair.setDepth(2);
      this.gates.add(pair.left);
      if (pair.right !== pair.left) {
        this.gates.add(pair.right);
      }
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

  private startRareEvent(event: RareRushEvent): void {
    this.rareEvent = event;
    this.rareEventKills = 0;
    this.rareEventSpawned = 0;
    this.rareEventSpawnTimer = 0;
    this.clearBossAttacks();
    this.enemies.clear(true, true);
    this.gates.clear(true, true);
    this.obstacles.clear(true, true);
    this.showFlash(event.title, '#fef08a', 200, 180);
    this.showFlash(event.subtitle, '#dcfce7', 200, 220);
    this.cameras.main.shake(500, 0.004);
    this.playSoundProfile(RARE_SOUND_PROFILE);
  }

  private updateRareEvent(delta: number): void {
    if (!this.rareEvent) {
      return;
    }

    this.rareEventSpawnTimer -= delta;
    if (this.rareEventSpawnTimer <= 0 && this.rareEventSpawned < this.rareEvent.targetKills) {
      const activeEnemies = this.enemies.getLength();
      const room = Math.max(0, this.rareEvent.maxActiveEnemies - activeEnemies);
      const count = Math.min(this.rareEvent.spawnBatchSize, room, this.rareEvent.targetKills - this.rareEventSpawned);
      for (let i = 0; i < count; i++) {
        const laneX = [72, 116, 160, 204, 248, 292, 336][(this.rareEventSpawned + i) % 7];
        const y = -120 - Math.floor(i / 4) * 58 - Phaser.Math.Between(0, 22);
        const hp = 12 + Math.floor(this.rareEventKills / 80) * 3;
        this.spawnEnemy({ x: laneX, y, hp, variantId: this.rareEvent.enemyVariantId });
      }
      this.rareEventSpawned += count;
      this.rareEventSpawnTimer = this.rareEvent.spawnIntervalMs;
    }

    if (this.rareEventKills >= this.rareEvent.targetKills) {
      this.completeRareEvent();
    } else if (this.rareEventSpawned >= this.rareEvent.targetKills && this.enemies.getLength() === 0) {
      this.showFlash('EVENT MISSED', '#fecaca', 200, 200);
      this.rareEvent = undefined;
    }
  }

  private completeRareEvent(): void {
    const event = this.rareEvent;
    if (!event) {
      return;
    }

    const previousStats = { ...this.stats, modules: [...this.stats.modules] };
    const previousHp = this.playerHp;
    this.rareEvent = undefined;
    this.rareEventSpawnTimer = 0;
    this.showEventRewardChest(event.rewardItemKey);
    this.stats = {
      ...this.stats,
      weaponCount: this.stats.weaponCount + 80,
      power: this.stats.power + 35,
      level: this.stats.level + 12,
      critRate: Math.min(0.58, this.stats.critRate + 0.06),
      shield: this.stats.shield + 8,
      synergy: this.stats.synergy + 14,
    };
    this.playerHp += 8;
    this.specialCharge = 100;
    this.medalCount += 25;
    this.playSoundProfile(EVENT_REWARD_PROFILE);
    this.showFlash('激レア宝箱 GET', '#fef08a', 200, 256);
    this.showStatGainFeedback(previousStats, previousHp, { label: 'MYTHIC CHEST', kind: 'fusion', value: 1, color: 0xfef08a, good: true });
  }

  private showEventRewardChest(itemKey: string): void {
    const image = this.textures.exists(itemKey)
      ? this.add.image(200, 260, itemKey).setDisplaySize(118, 118)
      : this.add.star(200, 260, 7, 28, 62, 0xfef08a, 0.95);
    image.setDepth(30);
    image.setBlendMode(Phaser.BlendModes.ADD);
    const ring = this.add.circle(200, 260, 78, 0xfef08a, 0).setStrokeStyle(5, 0xffffff, 0.86).setDepth(29);
    this.tweens.add({ targets: image, scale: 1.24, angle: 12, duration: 420, yoyo: true, repeat: 2, ease: 'Back.easeOut', onComplete: () => image.destroy() });
    this.tweens.add({ targets: ring, scale: 2.2, alpha: 0, duration: 1050, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
  }

  private getBossPowerPressure(): number {
    return (
      this.stats.power * 2.2
      + this.stats.level * 3.1
      + this.stats.synergy * 2
      + this.stats.weaponCount * 0.55
      + this.stats.tier * 38
      + this.evolutionCount * 70
    ) * getWeaponPowerMultiplier(this.stats);
  }

  private getBossArmor(baseArmor: number): number {
    const adaptiveArmor = Math.min(4.2, this.getBossPowerPressure() / 310);
    return baseArmor + adaptiveArmor + this.bossLoopIndex * 0.28 + Math.max(0, this.bossPhase - 1) * 0.38;
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
      const speed = 315 * this.getPlayerMoveMultiplier();
      this.player.x += (moveX / length) * speed * dt;
      this.player.y += (moveY / length) * speed * dt;
      this.pointerTarget = null;
    } else if (this.pointerTarget) {
      const follow = 1 - Math.pow(0.0018, dt * this.getPlayerMoveMultiplier());
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
      const slowMultiplier = Number(obj.getData('slowMultiplier') ?? 1);
      obj.y += speed * slowMultiplier * (delta / 1000);
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
      if (this.currentBossTheme && this.boss.y >= 170) {
        const sway = this.getBossSwayAmplitude(this.currentBossTheme.key);
        this.boss.x = clamp(200 + Math.sin(this.stageTimer * 0.0024 + this.bossLoopIndex) * sway, 82, 318);
      }
      (this.boss.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
      const hpY = clamp(this.boss.y + 132, 218, 336);
      this.bossHpText.setPosition(this.boss.x, hpY - 24);
      this.bossHpBar.setPosition(this.boss.x, hpY);
      this.bossHpFill.setPosition(this.boss.x - 90, hpY);
    }
  }

  private fireWeapons(): void {
    this.playWeaponShotSound();
    const branchBonus = Math.min(4, this.evolutionPath.length);
    const shotCount = Math.min(17, 1 + Math.floor(this.stats.weaponCount / 5) + Math.floor(branchBonus / 2));
    const center = (shotCount - 1) / 2;
    const colors = getWeaponColors(this.stats);
    const spread = getShotSpread(this.stats);
    const pierceLeft = this.stats.pierce + (this.stats.modules.includes('chain') ? 1 : 0);
    const hasStormArray = this.evolutionPath.includes('storm-array') || this.evolutionPath.includes('solar-dragon-rail');
    const hasSolarBarrage = this.evolutionPath.includes('solar-barrage') || this.evolutionPath.includes('solar-dragon-rail');
    const hasZeroLance = this.evolutionPath.includes('zero-lance') || this.evolutionPath.includes('abyss-needle-launcher');
    const hasKrakenAnchor = this.evolutionPath.includes('kraken-anchor') || this.evolutionPath.includes('titan-orbit-hammer');
    const usesSlashShot = this.usesSlashShots();
    const bulletShape = usesSlashShot ? 'slash' : this.getStarterBulletShape();
    const clashPower = Math.max(1, Math.round((this.stats.power + this.stats.level + this.stats.synergy * 0.45) * getWeaponPowerMultiplier(this.stats) * 0.32));

    for (let i = 0; i < shotCount; i++) {
      const offset = i - center;
      const color = i % 3 === 0 ? colors.bullet : i % 3 === 1 ? colors.primary : colors.secondary;
      const bullet = new Bullet(this, this.player.x + offset * 10, this.player.y - 44, color, bulletShape);
      bullet.setDepth(2);
      bullet.setVelocity(440 + this.stats.power * 22 + this.stats.synergy * 4 + (hasStormArray ? 80 : 0));
      bullet.setScale((this.stats.modules.includes('focus') ? 1.28 : 1) + (hasZeroLance ? 0.18 : 0) + (hasKrakenAnchor ? 0.28 : 0));
      bullet.setData('damage', clashPower + (hasKrakenAnchor ? 1 : 0) + (usesSlashShot ? 1 : 0));
      bullet.setData('pierceLeft', pierceLeft + (hasZeroLance ? 1 : 0) + (hasKrakenAnchor && i % 3 === 0 ? 1 : 0));
      const shotStatus = this.getPlayerShotStatus();
      if (shotStatus && Math.random() < shotStatus.chance) {
        bullet.setData('statusEffect', shotStatus.effect);
      }
      const body = bullet.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(offset * 24 * spread + (hasSolarBarrage ? Math.sin(i + this.stageTimer * 0.01) * 28 : 0));
      body.setVelocityY(-440 - this.stats.power * 22);
      this.bullets.add(bullet);

      if (hasSolarBarrage && i % 2 === 0) {
        this.spawnBranchShard(this.player.x + offset * 12, this.player.y - 48, offset * 52, -520, colors.secondary, 'burn', 0.85, 0, 'rocket');
      }
      if (this.evolutionPath.includes('venom-gaze') && i % 3 === 0) {
        this.spawnBranchShard(this.player.x + offset * 10, this.player.y - 42, offset * 20, -430, colors.primary, 'poison', 0.85, 0, 'skull');
      }
      if (this.evolutionPath.includes('deadeye-line') && i === Math.floor(center)) {
        this.spawnBranchShard(this.player.x, this.player.y - 58, 0, -760, colors.bullet, undefined, 1.7, 3);
      }
    }
  }

  private playWeaponShotSound(): void {
    if (this.shotSoundTimer > 0) {
      return;
    }

    this.shotSoundTimer = 92;
    this.playSoundProfile(getWeaponShotProfile(this.stats));
  }

  private spawnBranchShard(x: number, y: number, vx: number, vy: number, color: number, status?: StatusEffect, scale = 0.85, pierce = 0, shape = this.getStarterBulletShape()): void {
    const shard = new Bullet(this, x, y, color, shape);
    shard.setDepth(2);
    shard.setScale(scale);
    shard.setVelocity(Math.abs(vy));
    shard.setData('damage', Math.max(1, Math.round((this.stats.power + this.stats.level) * 0.38 * scale)));
    shard.setData('pierceLeft', pierce);
    if (status) {
      shard.setData('statusEffect', status);
    }
    const body = shard.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(vx, vy);
    this.bullets.add(shard);
  }

  private usesSlashShots(): boolean {
    const branch = getEvolutionBranch(this.evolutionPath.at(-1));
    return branch?.specialStyle === 'blade' || ['blade', 'saber', 'samurai'].includes(this.stats.archetype);
  }

  private getStarterBulletShape(): BulletShape {
    switch (this.starterCategoryId) {
      case 'balance-bow':
        return 'bow';
      case 'slash-speed':
        return 'slash';
      case 'cannon-barrage':
        return 'rocket';
      case 'guard-aegis':
        return 'guard';
      case 'venom-curse':
        return 'skull';
      case 'burst-pierce':
        return 'pierce';
      default:
        return 'orb';
    }
  }

  private syncBulletVisual(bullet: Bullet): void {
    const slash = bullet.getData('slashVisual') as Phaser.GameObjects.Rectangle | undefined;
    if (!slash || !slash.active) {
      return;
    }
    slash.setPosition(bullet.x, bullet.y);
    slash.setAngle(slash.angle + Number(bullet.getData('slashSpin') ?? 12));
  }

  private destroyBullet(bullet: Phaser.GameObjects.GameObject): void {
    const slash = bullet.getData?.('slashVisual') as Phaser.GameObjects.GameObject | undefined;
    if (slash?.active) {
      slash.destroy();
    }
    bullet.destroy();
  }

  private updateBullets(delta: number): void {
    this.bullets.getChildren().forEach((child) => {
      const bullet = child as Bullet;
      bullet.update(0, delta);
      this.syncBulletVisual(bullet);
      if (bullet.y < -30) {
        this.destroyBullet(bullet);
      }
    });
  }

  private updateSpecialCharge(delta: number): void {
    this.specialCooldown = Math.max(0, this.specialCooldown - delta);
    if (!this.specialActive && this.specialCooldown <= 0) {
      const chargeRate = 0.0048 + Math.min(0.0022, this.stats.synergy * 0.00008 + this.stats.level * 0.000035);
      this.specialCharge = clamp(this.specialCharge + delta * chargeRate, 0, 100);
    }
  }

  private updatePlayerStatuses(delta: number): void {
    const statuses = this.playerStatuses;
    if (statuses.poisonMs > 0) {
      statuses.poisonMs = Math.max(0, statuses.poisonMs - delta);
      statuses.poisonTickMs += delta;
      if (statuses.poisonTickMs >= 900) {
        statuses.poisonTickMs = 0;
        this.playerHp -= 1;
        this.showFlash('POISON -1', '#bef264', this.player.x, this.player.y - 94);
        this.spawnBurst(this.player.x, this.player.y, 0x84cc16, 14);
      }
    }
    if (statuses.burnMs > 0) {
      statuses.burnMs = Math.max(0, statuses.burnMs - delta);
      statuses.burnTickMs += delta;
      if (statuses.burnTickMs >= 700) {
        statuses.burnTickMs = 0;
        this.playerHp -= 1;
        this.showFlash('BURN -1', '#fed7aa', this.player.x, this.player.y - 94);
        this.spawnBurst(this.player.x, this.player.y, 0xfb923c, 14);
      }
    }
    statuses.paralyzeMs = Math.max(0, statuses.paralyzeMs - delta);
    statuses.freezeMs = Math.max(0, statuses.freezeMs - delta);
    statuses.curseMs = Math.max(0, statuses.curseMs - delta);

    if (this.playerHp <= 0) {
      this.finish('GAME OVER');
    }
  }

  private updateEnemyStatuses(delta: number): void {
    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      const poisonMs = Math.max(0, Number(enemy.getData('poisonMs') ?? 0) - delta);
      if (poisonMs > 0) {
        const tick = Number(enemy.getData('poisonTickMs') ?? 0) + delta;
        if (tick >= 420) {
          enemy.setData('poisonTickMs', 0);
          const poisonDamage = Math.max(2, Math.round(this.stats.power * 0.45 + this.stats.level));
          if (enemy.damage(poisonDamage)) {
            this.spawnBurst(enemy.x, enemy.y, 0x84cc16, 20);
            enemy.destroy();
            return;
          }
          this.spawnHitEffect(enemy.x, enemy.y, 0x84cc16);
        } else {
          enemy.setData('poisonTickMs', tick);
        }
      }
      enemy.setData('poisonMs', poisonMs);

      const slowMs = Math.max(0, Number(enemy.getData('slowMs') ?? 0) - delta);
      enemy.setData('slowMs', slowMs);
      enemy.setData('slowMultiplier', slowMs > 0 ? Number(enemy.getData('slowPower') ?? 0.45) : 1);
    });
  }

  private updateEnemyTactics(delta: number): void {
    const dt = delta / 1000;
    this.enemies.getChildren().forEach((child, index) => {
      const enemy = child as Enemy;
      let tactic = String(enemy.getData('tactic') ?? '');
      if (!tactic) {
        const seed = Math.abs(Math.floor(enemy.x + enemy.y + index * 17));
        tactic = seed % 11 === 0 ? 'dash' : seed % 7 === 0 ? 'sway' : seed % 5 === 0 ? 'guard' : 'fall';
        enemy.setData('tactic', tactic);
        enemy.setData('tacticSeed', seed);
        enemy.setData('tacticTimer', Phaser.Math.Between(420, 1100));
      }

      const seed = Number(enemy.getData('tacticSeed') ?? 0);
      const timer = Math.max(0, Number(enemy.getData('tacticTimer') ?? 0) - delta);
      enemy.setData('tacticTimer', timer);

      if (tactic === 'sway') {
        enemy.x = clamp(enemy.x + Math.sin(this.stageTimer * 0.006 + seed) * 74 * dt, 32, 368);
      } else if (tactic === 'dash' && timer <= 0) {
        const direction = Math.sign(this.player.x - enemy.x) || 1;
        enemy.x = clamp(enemy.x + direction * 175 * dt, 32, 368);
        enemy.y += 78 * dt;
        if (Math.abs(enemy.x - this.player.x) < 30 || enemy.y > this.player.y - 40) {
          enemy.setData('tacticTimer', 820);
        }
      } else if (tactic === 'guard') {
        enemy.setScale(1 + Math.sin(this.stageTimer * 0.008 + seed) * 0.045);
      }
      (enemy.body as Phaser.Physics.Arcade.Body | undefined)?.updateFromGameObject();
    });
  }

  private getPlayerMoveMultiplier(): number {
    let multiplier = 1;
    if (this.playerStatuses.paralyzeMs > 0) multiplier *= 0.58;
    if (this.playerStatuses.freezeMs > 0) multiplier *= 0.7;
    if (this.playerStatuses.curseMs > 0) multiplier *= 0.84;
    return multiplier;
  }

  private getPlayerShotStatus(): { effect: StatusEffect; chance: number } | undefined {
    if (this.stats.modules.includes('poison') || this.stats.element === 'shadow') {
      return { effect: 'poison', chance: 0.34 + Math.min(0.16, this.stats.synergy * 0.01) };
    }
    if (this.stats.modules.includes('volt') || this.stats.element === 'thunder') {
      return { effect: 'paralyze', chance: 0.28 };
    }
    if (this.stats.modules.includes('freeze') || this.stats.element === 'ice') {
      return { effect: 'freeze', chance: 0.3 };
    }
    if (this.stats.modules.includes('flare') || this.stats.element === 'fire') {
      return { effect: 'burn', chance: 0.24 };
    }
    return undefined;
  }

  private applyEnemyStatus(enemy: Enemy, effect?: StatusEffect): void {
    if (!effect) {
      return;
    }

    switch (effect) {
      case 'poison':
        enemy.setData('poisonMs', 2600);
        enemy.setData('poisonTickMs', Number(enemy.getData('poisonTickMs') ?? 0));
        this.showFlash('POISON', '#bef264', enemy.x, enemy.y - 36);
        break;
      case 'paralyze':
        enemy.setData('slowMs', 1600);
        enemy.setData('slowPower', 0.2);
        this.showFlash('STUN', '#fef08a', enemy.x, enemy.y - 36);
        break;
      case 'freeze':
        enemy.setData('slowMs', 2200);
        enemy.setData('slowPower', 0.34);
        this.showFlash('FREEZE', '#bae6fd', enemy.x, enemy.y - 36);
        break;
      case 'burn':
        enemy.damage(Math.max(3, Math.round(this.stats.power * 0.55)));
        this.spawnBurst(enemy.x, enemy.y, 0xfb923c, 16);
        break;
      case 'curse':
        enemy.setData('slowMs', 1800);
        enemy.setData('slowPower', 0.55);
        this.showFlash('CURSE', '#e9d5ff', enemy.x, enemy.y - 36);
        break;
      default:
        break;
    }
  }

  private applyPlayerStatus(effect?: StatusEffect, chance = 0): void {
    if (!effect || Math.random() > chance) {
      return;
    }

    switch (effect) {
      case 'poison':
        this.playerStatuses.poisonMs = Math.max(this.playerStatuses.poisonMs, 3600);
        this.playerStatuses.poisonTickMs = 0;
        this.showFlash('POISONED', '#bef264', this.player.x, this.player.y - 102);
        break;
      case 'paralyze':
        this.playerStatuses.paralyzeMs = Math.max(this.playerStatuses.paralyzeMs, 2200);
        this.showFlash('PARALYZE', '#fef08a', this.player.x, this.player.y - 102);
        break;
      case 'freeze':
        this.playerStatuses.freezeMs = Math.max(this.playerStatuses.freezeMs, 2600);
        this.showFlash('SLOWED', '#bae6fd', this.player.x, this.player.y - 102);
        break;
      case 'curse':
        this.playerStatuses.curseMs = Math.max(this.playerStatuses.curseMs, 3400);
        this.stats = { ...this.stats, fireRate: Math.max(0.8, this.stats.fireRate - 0.18), power: Math.max(1, this.stats.power - 1) };
        this.showFlash('CURSE DOWN', '#e9d5ff', this.player.x, this.player.y - 102);
        break;
      case 'burn':
        this.playerStatuses.burnMs = Math.max(this.playerStatuses.burnMs, 2400);
        this.playerStatuses.burnTickMs = 0;
        this.showFlash('BURNING', '#fed7aa', this.player.x, this.player.y - 102);
        break;
      default:
        break;
    }
    this.cameras.main.shake(150, 0.0025);
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
      const firstBossRelief = this.bossLoopIndex === 0 ? 260 : 0;
      this.bossAttackTimer = Math.max(220, 820 + firstBossRelief - loopPressure - this.bossPhase * 95 - Phaser.Math.Between(0, 160));
    }

    if (this.bossSpecialTimer <= 0) {
      this.castBossSpecial(this.currentBossTheme);
      const firstBossRelief = this.bossLoopIndex === 0 ? 900 : 0;
      this.bossSpecialTimer = Math.max(1500, 5200 + firstBossRelief - this.bossLoopIndex * 260 - this.bossPhase * 220);
    }
  }

  private getBossSwayAmplitude(key: string): number {
    if (key.includes('Mantis') || key.includes('Phoenix') || key.includes('Cerberus')) return 92;
    if (key.includes('Leviathan') || key.includes('Hydra')) return 72;
    if (key.includes('Titan') || key.includes('Oni') || key.includes('Mochi')) return 34;
    return 54;
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
    if (key.includes('Dragon') || key.includes('Cerberus')) {
      this.spawnBossLaneStrike(theme, this.bossPhase >= 2);
      this.spawnBossBulletRain(theme, 8 + this.bossPhase * 4, 80);
      if (this.bossPhase >= 2) this.time.delayedCall(280, () => this.spawnBossFanShot(theme));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('Phoenix')) {
      this.spawnBossFanShot(theme);
      this.time.delayedCall(180, () => this.spawnBossPhoenixDive(theme));
      if (this.bossPhase >= 2) this.spawnBossBulletRain(theme, 6 + this.bossPhase * 3, 55);
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('Hydra')) {
      this.spawnBossHydraBarrage(theme);
      if (this.bossPhase >= 2) this.time.delayedCall(240, () => this.spawnBossAimedShot(theme));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('Abyss')) {
      this.spawnBossHydraBarrage(theme);
      this.time.delayedCall(180, () => this.spawnBossWaveWall(theme));
      if (this.bossPhase >= 2) this.time.delayedCall(360, () => this.spawnBossSpiral(theme, 10 + this.bossPhase * 4));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('GrapeThunder')) {
      this.spawnBossFanShot(theme);
      this.time.delayedCall(160, () => this.spawnBossSpiral(theme, 10 + this.bossPhase * 4));
      if (this.bossPhase >= 2) this.time.delayedCall(360, () => this.spawnBossAimedShot(theme));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('Vineyard') || key.includes('Queen')) {
      this.spawnBossOrbitMines(theme);
      this.time.delayedCall(180, () => this.spawnBossWaveWall(theme));
      if (this.bossPhase >= 2) this.time.delayedCall(380, () => this.spawnBossSnipeWeb(theme));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('Leviathan') || key.includes('Frost')) {
      this.spawnBossFanShot(theme);
      this.time.delayedCall(210, () => this.spawnBossWaveWall(theme));
      if (this.bossPhase >= 3) this.time.delayedCall(420, () => this.spawnBossFanShot(theme));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('Strawberry')) {
      this.spawnBossLaneStrike(theme, this.bossPhase >= 2);
      this.time.delayedCall(160, () => this.spawnBossBulletRain(theme, 10 + this.bossPhase * 4, 58));
      if (this.bossPhase >= 3) this.time.delayedCall(420, () => this.spawnBossFanShot(theme));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('CrownedBerry')) {
      this.spawnBossLaneStrike(theme, this.bossPhase >= 3);
      this.time.delayedCall(220, () => this.spawnBossFanShot(theme));
      if (this.bossPhase >= 2) this.time.delayedCall(430, () => this.spawnBossWaveWall(theme));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('NeonOrchard')) {
      this.spawnBossFanShot(theme);
      this.time.delayedCall(120, () => this.spawnBossCrossSlash(theme));
      this.time.delayedCall(300, () => this.spawnBossBulletRain(theme, 12 + this.bossPhase * 4, 48));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('Clockwork')) {
      this.spawnBossSpiral(theme, 14 + this.bossPhase * 5);
      this.time.delayedCall(240, () => this.spawnBossWaveWall(theme));
      if (this.bossPhase >= 2) this.time.delayedCall(460, () => this.spawnBossAimedShot(theme));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('PrismOrchard') || key.includes('OrchardWyvern')) {
      this.spawnBossFanShot(theme);
      this.time.delayedCall(180, () => this.spawnBossBulletRain(theme, 10 + this.bossPhase * 5, 48));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('IronMochi') || key.includes('JadeMochi')) {
      this.spawnBossLaneStrike(theme, this.bossPhase >= 2);
      this.time.delayedCall(240, () => this.spawnBossWaveWall(theme));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('ChronoSpider')) {
      this.spawnBossSpiral(theme, 12 + this.bossPhase * 6);
      if (this.bossPhase >= 2) this.time.delayedCall(260, () => this.spawnBossAimedShot(theme));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('EmeraldClock')) {
      this.spawnBossOrbitMines(theme);
      this.time.delayedCall(260, () => this.spawnBossSnipeWeb(theme));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('CrimsonPrism')) {
      this.spawnBossPrismScatter(theme);
      this.time.delayedCall(240, () => this.spawnBossLaneStrike(theme, this.bossPhase >= 2));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('Lunar')) {
      this.spawnBossCrossSlash(theme);
      this.time.delayedCall(180, () => this.spawnBossFanShot(theme));
      if (this.bossPhase >= 2) this.time.delayedCall(360, () => this.spawnBossNova(theme));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('Void') || key.includes('Demon') || key.includes('Cathedral')) {
      this.spawnBossNova(theme);
      this.spawnBossSpiral(theme, 12 + this.bossPhase * 4);
      if (this.bossPhase >= 2) this.time.delayedCall(260, () => this.spawnBossAimedShot(theme));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('Mantis')) {
      this.spawnBossCrossSlash(theme);
      this.spawnBossAimedShot(theme);
      if (this.bossPhase >= 2) this.time.delayedCall(260, () => this.spawnBossCrossSlash(theme));
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('Oni')) {
      this.spawnBossLaneStrike(theme, true);
      this.time.delayedCall(180, () => this.spawnBossCrossSlash(theme));
      if (this.bossPhase >= 2) this.spawnBossBulletRain(theme, 7 + this.bossPhase * 3, 65);
      this.bossPatternIndex += 1;
      return;
    }
    if (key.includes('Titan')) {
      this.spawnBossWaveWall(theme);
      this.time.delayedCall(260, () => this.spawnBossLaneStrike(theme, this.bossPhase >= 2));
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

  private spawnBossHydraBarrage(theme: BossTheme): void {
    if (!this.boss) {
      return;
    }

    const heads = 3 + this.bossPhase;
    for (let h = 0; h < heads; h++) {
      this.time.delayedCall(h * 105, () => {
        if (!this.boss) return;
        const originX = this.boss.x + (h - (heads - 1) / 2) * 32;
        const angle = Phaser.Math.Angle.Between(originX, this.boss.y + 70, this.player.x + Phaser.Math.Between(-42, 42), this.player.y);
        for (let i = -1; i <= 1; i++) {
          const spread = angle + i * 0.16;
          const speed = 220 + this.bossPhase * 24 + h * 8;
          this.spawnBossProjectile(originX, this.boss.y + 72, Math.cos(spread) * speed, Math.sin(spread) * speed, 7, i === 0 ? theme.primary : theme.secondary, this.getBossDamage(1), 'orb');
        }
      });
    }
  }

  private spawnBossBulletRain(theme: BossTheme, count: number, delayStep: number): void {
    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * delayStep, () => {
        const x = 42 + ((i * 67 + this.bossPatternIndex * 39) % 316);
        const speed = 235 + this.bossPhase * 28 + (i % 4) * 24;
        this.spawnBossProjectile(x, -30, Phaser.Math.Between(-18, 18), speed, i % 3 === 0 ? 9 : 7, i % 2 === 0 ? theme.accent : theme.primary, this.getBossDamage(1), i % 2 === 0 ? 'diamond' : 'orb');
      });
    }
  }

  private spawnBossSpiral(theme: BossTheme, count: number): void {
    if (!this.boss) {
      return;
    }

    const originX = this.boss.x;
    const originY = this.boss.y + 68;
    for (let i = 0; i < count; i++) {
      const angle = Phaser.Math.DegToRad(this.bossPatternIndex * 31 + i * (360 / count));
      const speed = 135 + (i % 4) * 34 + this.bossPhase * 18;
      const vy = Math.max(84, Math.sin(angle) * speed + 85);
      this.spawnBossProjectile(originX, originY, Math.cos(angle) * speed, vy, i % 2 === 0 ? 8 : 6, i % 2 === 0 ? theme.secondary : theme.accent, this.getBossDamage(1), i % 3 === 0 ? 'diamond' : 'orb');
    }
  }

  private spawnBossWaveWall(theme: BossTheme): void {
    const lanes = [58, 104, 150, 196, 242, 288, 334];
    lanes.forEach((x, index) => {
      if ((index + this.bossPatternIndex) % 3 === 1) {
        return;
      }
      this.time.delayedCall(index * 70, () => {
        this.spawnBossProjectile(x, -24, Math.sin(index) * 42, 245 + this.bossPhase * 34, 10, index % 2 === 0 ? theme.primary : theme.accent, this.getBossDamage(1), 'diamond');
      });
    });
  }

  private spawnBossOrbitMines(theme: BossTheme): void {
    if (!this.boss) {
      return;
    }

    const count = 6 + this.bossPhase * 2;
    for (let i = 0; i < count; i++) {
      const angle = Phaser.Math.DegToRad((360 / count) * i + this.bossPatternIndex * 19);
      const x = clamp(this.boss.x + Math.cos(angle) * 92, 46, 354);
      const y = this.boss.y + 72 + Math.sin(angle) * 28;
      const mine = this.spawnBossProjectile(x, y, Math.cos(angle) * 34, 118 + Math.sin(angle) * 32, 11, i % 2 === 0 ? theme.secondary : theme.primary, this.getBossDamage(1), 'diamond');
      mine?.setData('spin', 7.5);
    }
    this.spawnBurst(this.boss.x, this.boss.y + 70, theme.secondary, 26);
  }

  private spawnBossSnipeWeb(theme: BossTheme): void {
    if (!this.boss) {
      return;
    }

    const lanes = [this.player.x, this.player.x - 58, this.player.x + 58].map((x) => clamp(x, 48, 352));
    lanes.forEach((x, index) => {
      const warning = this.add.rectangle(x, 384, 24, 680, theme.secondary, 0.1).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
      warning.setData('bossAttackEffect', true);
      warning.setStrokeStyle(2, theme.accent, 0.7);
      this.tweens.add({
        targets: warning,
        alpha: 0.24,
        yoyo: true,
        repeat: 2,
        duration: 90,
        delay: index * 60,
        onComplete: () => {
          warning.destroy();
          if (!this.boss) return;
          this.spawnBossProjectile(x, -18, Phaser.Math.Between(-10, 10), 330 + this.bossPhase * 34, 8, theme.accent, this.getBossDamage(1), 'orb');
        },
      });
    });
  }

  private spawnBossPrismScatter(theme: BossTheme): void {
    if (!this.boss) {
      return;
    }

    const count = 9 + this.bossPhase * 4;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const x = 48 + t * 304;
      const vx = Math.sin(i * 1.7 + this.bossPatternIndex) * 86;
      const vy = 190 + (i % 4) * 36 + this.bossPhase * 22;
      this.spawnBossProjectile(x, -26 - (i % 3) * 24, vx, vy, i % 2 === 0 ? 7 : 9, i % 3 === 0 ? theme.accent : i % 3 === 1 ? theme.primary : theme.secondary, this.getBossDamage(1), i % 2 === 0 ? 'diamond' : 'orb');
    }
  }

  private spawnBossPhoenixDive(theme: BossTheme): void {
    if (!this.boss) {
      return;
    }

    const startX = this.boss.x;
    const targetX = clamp(this.player.x + Phaser.Math.Between(-80, 80), 72, 328);
    const warning = this.add.rectangle(targetX, 384, 58, 680, theme.secondary, 0.12).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
    warning.setData('bossAttackEffect', true);
    warning.setStrokeStyle(2, theme.accent, 0.78);
    this.tweens.add({
      targets: warning,
        alpha: 0.26,
      yoyo: true,
      repeat: 2,
      duration: 86,
      onComplete: () => {
        warning.destroy();
        if (!this.boss) return;
        this.tweens.add({ targets: this.boss, x: targetX, duration: 210, ease: 'Cubic.easeInOut' });
        this.spawnBossLaneStrike(theme, true);
        this.time.delayedCall(260, () => {
          if (this.boss) this.tweens.add({ targets: this.boss, x: startX, duration: 260, ease: 'Sine.easeOut' });
        });
      },
    });
  }

  private spawnBossCrossSlash(theme: BossTheme): void {
    const angles = [-18, 18];
    angles.forEach((angle, index) => {
      const warning = this.add.rectangle(200, 384, 54, 760, theme.primary, 0.1).setAngle(angle).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
      warning.setData('bossAttackEffect', true);
      warning.setStrokeStyle(2, theme.accent, 0.72);
      this.tweens.add({
        targets: warning,
        alpha: 0.24,
        yoyo: true,
        repeat: 2,
        duration: 100,
        onComplete: () => {
          warning.destroy();
          if (!this.boss) {
            return;
          }
          const slash = this.add.rectangle(200, 384, 62, 800, index === 0 ? theme.accent : theme.secondary, 0.34).setAngle(angle).setDepth(13).setBlendMode(Phaser.BlendModes.ADD);
          slash.setData('bossAttackEffect', true);
          this.tweens.add({ targets: slash, alpha: 0, scaleX: 1.8, duration: 300, ease: 'Quad.easeOut', onComplete: () => slash.destroy() });
          const radians = Phaser.Math.DegToRad(angle);
          const distanceToLine = Math.abs((this.player.x - 200) * Math.cos(radians) + (this.player.y - 384) * Math.sin(radians));
          if (distanceToLine < 36) {
            const damage = this.reduceInstantBossAttack(
              this.getBossDamage(2),
              (bullet) => Math.abs((bullet.x - 200) * Math.cos(radians) + (bullet.y - 384) * Math.sin(radians)) < 46,
              theme.accent,
            );
            if (damage > 0) {
              this.damagePlayer(damage, 'SLASH HIT', theme.accent);
            }
          }
        },
      });
    });
  }

  private spawnBossLaneStrike(theme: BossTheme, empowered: boolean): void {
    if (!this.boss) {
      return;
    }

    const laneXs = empowered || this.bossPhase >= 3 ? [86, 146, 200, 254, 314] : [112, 200, 288];
    const selected = laneXs.filter((_, index) => empowered || (index + this.bossPatternIndex) % 2 === 0);
    selected.forEach((x, index) => {
      const warning = this.add.rectangle(x, 395, empowered ? 38 : 30, 670, theme.primary, empowered ? 0.14 : 0.09).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
      warning.setData('bossAttackEffect', true);
      warning.setStrokeStyle(2, theme.accent, empowered ? 0.82 : 0.52);
      this.tweens.add({
        targets: warning,
        alpha: empowered ? 0.28 : 0.2,
        yoyo: true,
        repeat: 2,
        duration: 120,
        onComplete: () => {
          warning.destroy();
          if (!this.boss) {
            return;
          }
          const beam = this.add.rectangle(x, 395, empowered ? 44 : 34, 700, theme.accent, empowered ? 0.42 : 0.3).setDepth(13).setBlendMode(Phaser.BlendModes.ADD);
          beam.setData('bossAttackEffect', true);
          this.tweens.add({ targets: beam, alpha: 0, scaleX: 1.7, duration: 310, ease: 'Quad.easeOut', onComplete: () => beam.destroy() });
          if (Math.abs(this.player.x - x) < (empowered ? 34 : 26)) {
            const damage = this.reduceInstantBossAttack(
              this.getBossDamage(empowered ? 2 : 1),
              (bullet) => Math.abs(bullet.x - x) < (empowered ? 44 : 34),
              theme.accent,
            );
            if (damage > 0) {
              this.damagePlayer(damage, empowered ? 'BOSS SPECIAL HIT' : 'BOSS HIT', theme.accent);
            }
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
    const veil = this.add.rectangle(width / 2, height / 2, width, height, theme.primary, 0.12).setDepth(24).setBlendMode(Phaser.BlendModes.ADD);
    const sigil = this.add.circle(this.boss.x, this.boss.y + 44, 74, theme.secondary, 0).setStrokeStyle(6, theme.accent, 0.92).setDepth(25);
    veil.setData('bossAttackEffect', true);
    sigil.setData('bossAttackEffect', true);
    this.tweens.add({ targets: veil, alpha: 0, duration: 900, onComplete: () => veil.destroy() });
    this.tweens.add({ targets: sigil, scale: 2.8, angle: 220, alpha: 0, duration: 940, ease: 'Cubic.easeOut', onComplete: () => sigil.destroy() });

    this.time.delayedCall(620, () => {
      const key = theme.key;
      if (key.includes('Dragon') || key.includes('Oni') || key.includes('Cerberus')) {
        this.spawnBossLaneStrike(theme, true);
        this.spawnBossBulletRain(theme, 16 + this.bossPhase * 4, 42);
        return;
      }
      if (key.includes('Phoenix')) {
        this.spawnBossPhoenixDive(theme);
        this.spawnBossFanShot(theme);
        this.spawnBossBulletRain(theme, 12 + this.bossPhase * 4, 38);
        return;
      }
      if (key.includes('Hydra') || key.includes('Leviathan')) {
        this.spawnBossHydraBarrage(theme);
        this.time.delayedCall(260, () => this.spawnBossHydraBarrage(theme));
        this.spawnBossWaveWall(theme);
        return;
      }
      if (key.includes('Abyss')) {
        this.spawnBossHydraBarrage(theme);
        this.time.delayedCall(180, () => this.spawnBossSpiral(theme, 24 + this.bossPhase * 5));
        this.time.delayedCall(360, () => this.spawnBossWaveWall(theme));
        return;
      }
      if (key.includes('GrapeThunder')) {
        this.spawnBossSpiral(theme, 26 + this.bossPhase * 5);
        this.time.delayedCall(220, () => this.spawnBossHydraBarrage(theme));
        this.time.delayedCall(420, () => this.spawnBossFanShot(theme));
        return;
      }
      if (key.includes('Vineyard') || key.includes('Queen')) {
        this.spawnBossOrbitMines(theme);
        this.spawnBossWaveWall(theme);
        this.time.delayedCall(260, () => this.spawnBossSnipeWeb(theme));
        this.time.delayedCall(520, () => this.spawnBossBulletRain(theme, 16 + this.bossPhase * 5, 42));
        return;
      }
      if (key.includes('Frost') || key.includes('Titan')) {
        this.spawnBossWaveWall(theme);
        this.spawnBossLaneStrike(theme, true);
        this.time.delayedCall(260, () => this.spawnBossWaveWall(theme));
        return;
      }
      if (key.includes('Strawberry')) {
        this.spawnBossLaneStrike(theme, true);
        this.spawnBossBulletRain(theme, 22 + this.bossPhase * 5, 34);
        this.time.delayedCall(300, () => this.spawnBossFanShot(theme));
        return;
      }
      if (key.includes('CrownedBerry')) {
        this.spawnBossLaneStrike(theme, true);
        this.spawnBossWaveWall(theme);
        this.time.delayedCall(260, () => this.spawnBossNova(theme));
        return;
      }
      if (key.includes('NeonOrchard')) {
        this.spawnBossCrossSlash(theme);
        this.spawnBossFanShot(theme);
        this.time.delayedCall(220, () => this.spawnBossNova(theme));
        this.time.delayedCall(420, () => this.spawnBossBulletRain(theme, 18 + this.bossPhase * 5, 36));
        return;
      }
      if (key.includes('Clockwork')) {
        this.spawnBossSpiral(theme, 28 + this.bossPhase * 5);
        this.spawnBossWaveWall(theme);
        this.time.delayedCall(280, () => this.spawnBossSpiral(theme, 18 + this.bossPhase * 4));
        return;
      }
      if (key.includes('PrismOrchard') || key.includes('OrchardWyvern')) {
        this.spawnBossFanShot(theme);
        this.spawnBossBulletRain(theme, 22 + this.bossPhase * 5, 34);
        this.time.delayedCall(260, () => this.spawnBossNova(theme));
        return;
      }
      if (key.includes('IronMochi') || key.includes('JadeMochi')) {
        this.spawnBossLaneStrike(theme, true);
        this.spawnBossWaveWall(theme);
        this.time.delayedCall(280, () => this.spawnBossLaneStrike(theme, true));
        return;
      }
      if (key.includes('ChronoSpider')) {
        this.spawnBossSpiral(theme, 30 + this.bossPhase * 6);
        this.time.delayedCall(280, () => this.spawnBossWaveWall(theme));
        return;
      }
      if (key.includes('EmeraldClock')) {
        this.spawnBossOrbitMines(theme);
        this.time.delayedCall(220, () => this.spawnBossSpiral(theme, 24 + this.bossPhase * 4));
        this.time.delayedCall(460, () => this.spawnBossSnipeWeb(theme));
        return;
      }
      if (key.includes('CrimsonPrism')) {
        this.spawnBossPrismScatter(theme);
        this.time.delayedCall(220, () => this.spawnBossBulletRain(theme, 24 + this.bossPhase * 5, 32));
        this.time.delayedCall(420, () => this.spawnBossNova(theme));
        return;
      }
      if (key.includes('Lunar')) {
        this.spawnBossNova(theme);
        this.spawnBossCrossSlash(theme);
        this.time.delayedCall(220, () => this.spawnBossFanShot(theme));
        return;
      }
      if (key.includes('Mantis')) {
        this.spawnBossCrossSlash(theme);
        this.spawnBossSpiral(theme, 20 + this.bossPhase * 4);
        return;
      }
      if (key.includes('Void') || key.includes('Demon') || key.includes('Cathedral')) {
        this.spawnBossNova(theme);
        this.spawnBossSpiral(theme, 24 + this.bossPhase * 5);
        this.time.delayedCall(260, () => this.spawnBossAimedShot(theme));
        return;
      }
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

  private spawnBossProjectile(x: number, y: number, vx: number, vy: number, radius: number, color: number, damage: number, shape: 'orb' | 'diamond'): Phaser.GameObjects.Arc | Phaser.GameObjects.Rectangle | undefined {
    if (!this.boss) {
      return undefined;
    }

    const projectile = shape === 'orb'
      ? this.add.circle(x, y, radius, color, 0.74)
      : this.add.rectangle(x, y, radius * 1.8, radius * 1.8, color, 0.72);
    projectile.setDepth(12);
    projectile.setBlendMode(Phaser.BlendModes.ADD);
    projectile.setData('vx', vx);
    projectile.setData('vy', vy);
    projectile.setData('damage', damage);
    projectile.setData('spin', shape === 'diamond' ? 4.6 : 0.8);
    projectile.setData('bossAttackEffect', true);
    projectile.setStrokeStyle(2, 0xffffff, 0.34);
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
    return projectile;
  }

  private getBossDamage(baseDamage: number): number {
    if (this.bossLoopIndex === 0) {
      return Math.max(1, Math.floor(baseDamage + Math.max(0, this.bossPhase - 2)));
    }
    return Math.max(1, Math.floor(baseDamage + this.bossPhase - 1 + this.bossLoopIndex * 0.45));
  }

  private updateStatusPanel(): void {
    this.weaponText.setText(`${this.stats.weaponCount}`);
    this.powerText.setText(`${this.stats.power}`);
    this.levelText.setText(`${this.stats.level}`);
    this.distanceText.setText(`${Math.floor(this.distance)}m`);
    this.hpText.setText(`${this.playerHp}`);
    this.hpPips.forEach((pip, index) => {
      pip.setFillStyle(index < this.playerHp ? 0xfb7185 : 0x450a12, index < this.playerHp ? 0.98 : 0.24);
      pip.setStrokeStyle(2, index < this.playerHp ? 0xfff1f2 : 0x7f1d1d, index < this.playerHp ? 0.92 : 0.55);
      pip.setScale(index < this.playerHp ? 1.05 + Math.sin(this.stageTimer * 0.008 + index) * 0.04 : 0.86);
    });
    const specialReady = this.specialCharge >= 100 && this.specialCooldown <= 0 && !this.specialActive;
    this.specialText.setText(this.specialActive ? '必殺発動中' : this.specialCooldown > 0 ? `必殺CT ${Math.ceil(this.specialCooldown / 1000)}s` : `必殺 ${Math.floor(this.specialCharge)}%`);
    this.specialText.setColor(specialReady ? '#fef08a' : this.specialActive ? '#ffffff' : '#bae6fd');
    this.bestText.setText(`BEST ${Math.max(this.bestDistance, Math.floor(this.distance))}m`);
    this.weaponNameText.setText(this.lockedWeaponTitle);
    const modules = this.stats.modules.length > 0 ? this.stats.modules.map((module) => getModuleProfile(module).label).join(' / ') : 'none';
    this.moduleText.setText(`MOD: ${modules}`);
    this.buildText.setText(`BUILD ${getBuildRank(this.stats)}  ${getRarityProfile(this.stats.rarity).label}`);
    this.bossPhaseText.setText(this.rareEvent ? `EVENT ${this.rareEventKills}/${this.rareEvent.targetKills}` : this.boss ? `BOSS P${this.bossPhase}` : `MEDAL ${this.medalCount}`);
    const panelAlpha = this.boss ? 0.58 : 1;
    this.statusPanelObjects.forEach((object) => {
      (object as Phaser.GameObjects.GameObject & { setAlpha?: (value: number) => void }).setAlpha?.(panelAlpha);
    });
    const colors = getWeaponColors(this.stats);
    this.player.setPalette(colors.primary, colors.secondary);
    this.player.setWeaponSkin(this.getCurrentWeaponSkinKey());
    this.player.setEvolutionStage(this.evolutionCount + Math.floor(this.stats.tier / 2), colors.primary, colors.secondary, colors.aura);
    this.updateStageMood(colors.primary, colors.secondary, colors.aura);
    this.updateAuraRings(colors.aura);
    this.updateSquadUnits(colors.primary, colors.secondary);
  }

  private getCurrentWeaponSkinKey(): string {
    return this.lockedWeaponSkinKey;
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

  private updateStageBackground(): void {
    const nextIndex = this.resolveStageThemeIndex();
    const theme = STAGE_THEMES[nextIndex];
    if (nextIndex !== this.stageThemeIndex) {
      this.stageThemeIndex = nextIndex;
      this.showFlash(theme.name, '#fef3c7', 200, 164);
      this.spawnBurst(200, 220, theme.accent, 34);
    }

    this.stageGround.setFillStyle(theme.ground, 1);
    this.trackOuter.setFillStyle(theme.trackOuter, 1);
    this.trackMid.setFillStyle(theme.trackMid, 1);
    this.trackInner.setFillStyle(theme.trackInner, 0.92);
    this.stageThemeText.setText(theme.name);
    this.stageThemeText.setColor(`#${theme.accent.toString(16).padStart(6, '0')}`);
    this.stageMarkers.forEach((marker, index) => {
      marker.setFillStyle(index % 2 === 0 ? theme.accent : theme.lane, 0.1 + Math.sin(this.stageTimer * 0.003 + index) * 0.04);
      marker.y += (26 + (index % 4) * 5) * (1 / 60);
      if (marker.y > 750) {
        marker.y = -50;
      }
    });
  }

  private resolveStageThemeIndex(): number {
    if (this.currentBossTheme) {
      return this.getBossStageThemeIndex(this.currentBossTheme.key);
    }
    return this.getWeaponStageThemeIndex();
  }

  private getWeaponStageThemeIndex(): number {
    const branch = getEvolutionBranch(this.evolutionPath.at(-1));
    const skinKey = this.getCurrentWeaponSkinKey();
    const signature = `${skinKey} ${branch?.id ?? ''} ${branch?.title ?? ''}`.toLowerCase();
    if (signature.includes('grape')) return this.findStageThemeIndex('VINEYARD STORM');
    if (signature.includes('ichigo')) return this.findStageThemeIndex('STRAWBERRY DAWN');
    if (this.stats.element === 'thunder' || ['rail', 'tempest', 'levin', 'chrono'].includes(this.stats.archetype) || signature.includes('thunder') || signature.includes('storm')) {
      return this.findStageThemeIndex('NEON CIRCUIT');
    }
    if (this.stats.element === 'shadow' || ['basilisk', 'needle', 'phantom', 'onyx', 'chimera'].includes(this.stats.archetype)) {
      return this.findStageThemeIndex('VOID FIELD');
    }
    if (this.stats.element === 'ice') return this.findStageThemeIndex('FROST FORGE');
    if (this.stats.element === 'crystal' || ['lotus', 'rune', 'seraph', 'oracle'].includes(this.stats.archetype)) {
      return this.findStageThemeIndex('AEGIS SANCTUM');
    }

    switch (this.starterCategoryId) {
      case 'balance-bow':
        return this.findStageThemeIndex('ARROW AURORA');
      case 'slash-speed':
        return this.findStageThemeIndex('SABER NIGHT');
      case 'cannon-barrage':
        return this.findStageThemeIndex('ROCKET FOUNDRY');
      case 'guard-aegis':
        return this.findStageThemeIndex('AEGIS SANCTUM');
      case 'venom-curse':
        return this.findStageThemeIndex('TOXIC GARDEN');
      case 'burst-pierce':
        return this.findStageThemeIndex('PIERCE CANYON');
      default:
        return this.findStageThemeIndex('NEON CIRCUIT');
    }
  }

  private getBossStageThemeIndex(key: string): number {
    if (key.includes('Grape') || key.includes('Vineyard') || key.includes('Queen')) return this.findStageThemeIndex('BOSS VINEYARD');
    if (key.includes('Leviathan') || key.includes('Hydra') || key.includes('Kraken') || key.includes('Aqua')) return this.findStageThemeIndex('BOSS TIDE');
    if (key.includes('Clock') || key.includes('Chrono') || key.includes('Spider') || key.includes('Arachne')) return this.findStageThemeIndex('BOSS CLOCK');
    if (key.includes('Void') || key.includes('Abyss') || key.includes('Demon') || key.includes('Lunar') || key.includes('Cathedral')) return this.findStageThemeIndex('BOSS ABYSS');
    if (key.includes('Frost')) return this.findStageThemeIndex('FROST FORGE');
    if (key.includes('Dragon') || key.includes('Phoenix') || key.includes('Cerberus') || key.includes('Tyrant')) return this.findStageThemeIndex('BOSS INFERNO');
    return this.findStageThemeIndex('BOSS ABYSS');
  }

  private findStageThemeIndex(name: string): number {
    const index = STAGE_THEMES.findIndex((theme) => theme.name === name);
    return index >= 0 ? index : 0;
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
    if (option.kind === 'special' && option.good) {
      this.specialCharge = clamp(this.specialCharge + option.value, 0, 100);
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
      if (pair.right !== pair.left) {
        pair.right.destroy();
      }
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
    this.applyPlayerStatus(enemyObject.getStatusEffect(), enemyObject.getStatusChance());
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

    if (!this.boss || this.bossDefeatGraceMs > 0) {
      projectile.destroy();
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

  private resolveProjectileClash(bulletObject: Bullet, projectile: Phaser.GameObjects.GameObject): void {
    if (!bulletObject.active || !projectile.active) {
      return;
    }

    const bulletDamage = Math.max(1, Number(bulletObject.getData('damage') ?? 1));
    const bossDamage = Math.max(1, Number(projectile.getData('damage') ?? 1));
    const x = 'x' in projectile ? Number(projectile.x) : bulletObject.x;
    const y = 'y' in projectile ? Number(projectile.y) : bulletObject.y;
    const color = this.currentBossTheme?.accent ?? 0xfef08a;
    this.spawnBurst((bulletObject.x + x) / 2, (bulletObject.y + y) / 2, bulletDamage >= bossDamage ? 0xbae6fd : color, 10 + Math.min(18, Math.max(bulletDamage, bossDamage) * 2));

    if (bulletDamage >= bossDamage) {
      projectile.destroy();
      const pierceLeft = Number(bulletObject.getData('pierceLeft') ?? 0);
      if (bulletDamage > bossDamage && pierceLeft > 0) {
        bulletObject.setData('pierceLeft', pierceLeft - 1);
        bulletObject.setData('damage', Math.max(1, bulletDamage - bossDamage));
        return;
      }
      this.destroyBullet(bulletObject);
      return;
    }

    projectile.setData('damage', bossDamage - bulletDamage);
    const remainingRatio = clamp((bossDamage - bulletDamage) / bossDamage, 0.35, 1);
    (projectile as Phaser.GameObjects.GameObject & { setScale?: (x: number, y?: number) => void }).setScale?.(remainingRatio);
    this.destroyBullet(bulletObject);
  }

  private reduceInstantBossAttack(damage: number, intersects: (bullet: Bullet) => boolean, color: number): number {
    let remaining = damage;
    const bullets = this.bullets.getChildren().filter((child) => child.active && intersects(child as Bullet)) as Bullet[];
    for (const bullet of bullets) {
      if (remaining <= 0) {
        break;
      }
      const bulletDamage = Math.max(1, Number(bullet.getData('damage') ?? 1));
      remaining -= bulletDamage;
      this.spawnBurst(bullet.x, bullet.y, bulletDamage >= damage ? 0xbae6fd : color, 8 + Math.min(14, bulletDamage * 2));
      this.destroyBullet(bullet);
    }

    if (remaining <= 0) {
      this.showFlash('PARRY BREAK', '#bae6fd', this.player.x, this.player.y - 112);
      this.playTone(740, 0.05, 0.024);
      return 0;
    }

    if (remaining < damage) {
      this.showFlash(`PARRY -${damage - remaining}`, '#dbeafe', this.player.x, this.player.y - 112);
    }
    return Math.max(1, Math.ceil(remaining));
  }

  private damagePlayer(amount: number, label: string, color: number): void {
    if ((!this.boss || this.bossDefeatGraceMs > 0) && (label.includes('BOSS') || label.includes('SLASH'))) {
      return;
    }

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
    this.applyEnemyStatus(enemyObject, bulletObject.getData('statusEffect') as StatusEffect | undefined);
    if (enemyObject.damage(damage)) {
      this.spawnBurst(enemyObject.x, enemyObject.y, 0xffb020, 20);
      if (this.rareEvent) {
        this.rareEventKills += 1;
        this.specialCharge = clamp(this.specialCharge + 0.35, 0, 100);
        if (this.rareEventKills % 100 === 0) {
          this.showFlash(`${this.rareEventKills}/${this.rareEvent.targetKills}`, '#fef08a', 200, 168);
        }
      } else {
        this.grantEnemyDefeatReward(enemyObject);
      }
      enemyObject.destroy();
    }
    const pierceLeft = Number(bulletObject.getData('pierceLeft') ?? 0);
    if (pierceLeft > 0) {
      bulletObject.setData('pierceLeft', pierceLeft - 1);
      return;
    }
    this.destroyBullet(bulletObject);
  }

  private grantEnemyDefeatReward(enemyObject: Enemy): void {
    const previousStats = { ...this.stats, modules: [...this.stats.modules] };
    const previousHp = this.playerHp;
    const roll = Phaser.Math.Between(0, 99);
    if (roll < 38) {
      this.stats = { ...this.stats, power: this.stats.power + 1 };
      this.showFlash('ATK +1', '#93c5fd', enemyObject.x, enemyObject.y - 32);
    } else if (roll < 68) {
      this.stats = { ...this.stats, level: this.stats.level + 1 };
      this.showFlash('Lv +1', '#d8b4fe', enemyObject.x, enemyObject.y - 32);
    } else if (roll < 84) {
      this.playerHp += 1;
      this.showFlash('HP +1', '#fecaca', enemyObject.x, enemyObject.y - 32);
    } else {
      this.stats = { ...this.stats, weaponCount: this.stats.weaponCount + 1, synergy: this.stats.synergy + 1 };
      this.showFlash('BUKI +1', '#86efac', enemyObject.x, enemyObject.y - 32);
    }
    this.specialCharge = clamp(this.specialCharge + 4 + Math.min(3, this.stats.tier * 0.2), 0, 100);
    this.showStatGainFeedback(previousStats, previousHp, { label: 'DROP BONUS', kind: 'fusion', value: 1, color: 0xfef3c7, good: true });
  }

  private hitBoss(bullet: Phaser.GameObjects.GameObject): void {
    if (!this.boss) {
      return;
    }

    const shot = bullet as Bullet;
    const critical = Math.random() < this.stats.critRate;
    const rawDamage = (this.stats.power + this.stats.level * 1.5 + this.stats.synergy * 0.55) * getWeaponPowerMultiplier(this.stats) * 0.62 * (critical ? 1.55 : 1);
    const bossArmor = this.getBossArmor(2.35 + this.bossPhase * 0.5);
    const damage = Math.max(1, Math.round(rawDamage / bossArmor));
    this.bossHp -= damage;
    this.spawnHitEffect(shot.x, shot.y, 0xfff1a8);
    this.destroyBullet(shot);

    if (this.bossHp <= 0 && this.boss) {
      const defeatedBossKey = this.currentBossTheme?.key ?? getBossAssetByLoop(this.bossLoopIndex).key;
      this.spawnBurst(this.boss.x, this.boss.y, 0xfef3c7, 42);
      this.showBossDefeatCutIn();
      this.showFlash('BOSS BREAK +Lv', '#fef3c7', this.boss.x, this.boss.y - 70);
      const previousStats = { ...this.stats, modules: [...this.stats.modules] };
      const previousHp = this.playerHp;
      this.stats = {
        ...this.stats,
        level: this.stats.level + 1,
        power: this.stats.power + 2 + Math.floor(this.bossLoopIndex / 2),
        weaponCount: this.stats.weaponCount + 5 + this.bossLoopIndex,
        tier: this.stats.tier + 1,
        synergy: this.stats.synergy + 2,
      };
      this.playerHp += 1;
      this.showStatGainFeedback(previousStats, previousHp, { label: 'BOSS BONUS', kind: 'fusion', value: 1, color: 0xfef3c7, good: true });
      this.clearBossAttacks();
      this.boss.destroy();
      this.boss = undefined;
      this.currentBossTheme = undefined;
      this.bossAttackTimer = 0;
      this.bossSpecialTimer = 0;
      this.bossLoopIndex += 1;
      this.bossHpBar.setVisible(false);
      this.bossHpFill.setVisible(false);
      this.bossHpText.setVisible(false);
      this.handleBossDefeated(defeatedBossKey);
    }
  }

  private clearBossAttacks(): void {
    this.bossDefeatGraceMs = 1600;
    this.bossProjectiles.clear(true, true);
    this.children.list
      .filter((child) => child.getData?.('bossAttackEffect'))
      .forEach((child) => child.destroy());
  }

  private showBossDefeatCutIn(): void {
    const { width, height } = this.scale;
    const color = this.currentBossTheme?.accent ?? 0xfef3c7;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.32).setDepth(36).setBlendMode(Phaser.BlendModes.ADD);
    const band = this.add.rectangle(width / 2, height * 0.42, width + 120, 88, 0x020617, 0.9).setDepth(37);
    band.setStrokeStyle(3, color, 0.95);
    const text = this.add.text(width / 2, height * 0.42, 'BOSS BREAK', {
      fontSize: '34px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(38);
    this.time.timeScale = 0.42;
    this.physics.world.timeScale = 0.42;
    this.time.delayedCall(260, () => {
      this.time.timeScale = 1;
      this.physics.world.timeScale = 1;
    });
    this.tweens.add({ targets: flash, alpha: 0, duration: 520, onComplete: () => flash.destroy() });
    this.tweens.add({ targets: [band, text], alpha: 0, y: '-=24', delay: 620, duration: 380, ease: 'Sine.easeIn', onComplete: () => { band.destroy(); text.destroy(); } });
    this.cameras.main.shake(420, 0.008);
  }

  private handleBossDefeated(bossKey: string): void {
    this.defeatedBossKeys.push(bossKey);
    this.stageBranchOffset = Math.abs([...bossKey].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 17;
    const fightMs = Math.max(0, this.stageTimer - this.bossSpawnStartedAt);
    const adaptiveGap = Math.min(9, Math.floor(fightMs / 4500));
    this.nextBossStepTarget = this.loopStepIndex + Phaser.Math.Between(8, 14) + adaptiveGap + Math.min(5, this.bossLoopIndex);
    const medals = 3 + this.bossLoopIndex + this.bossPhase;
    this.medalCount += medals;
    this.showFlash('STAGE BRANCH', '#bae6fd', 200, 254);
    this.showFlash(`MEDAL +${medals}`, '#fef3c7', 200, 214);
    this.time.delayedCall(420, () => this.grantBossEvolutionBonus());
  }

  private grantBossEvolutionBonus(): void {
    const previousStats = { ...this.stats, modules: [...this.stats.modules] };
    const previousHp = this.playerHp;
    this.evolutionCount += 1;
    const masteryModule = this.getFixedWeaponMasteryModule();
    const modules = masteryModule && !this.stats.modules.includes(masteryModule)
      ? [...this.stats.modules, masteryModule]
      : [...this.stats.modules];
    const rarity = this.evolutionCount >= 6 ? 'mythic' : this.evolutionCount >= 4 ? 'legend' : this.evolutionCount >= 2 ? 'epic' : 'rare';
    this.stats = {
      ...this.stats,
      modules,
      rarity,
      level: this.stats.level + 2,
      tier: this.stats.tier + 1,
      power: this.stats.power + 4 + Math.ceil(this.evolutionCount * 0.7),
      fireRate: Math.max(0.78, this.stats.fireRate + this.getFixedWeaponFireBonus()),
      critRate: Math.min(0.62, this.stats.critRate + 0.025 + (this.starterCategoryId === 'slash-speed' ? 0.01 : 0)),
      pierce: this.stats.pierce + (this.starterCategoryId === 'burst-pierce' || this.starterCategoryId === 'cannon-barrage' ? 1 : 0),
      shield: this.stats.shield + (this.starterCategoryId === 'guard-aegis' ? 2 : 0),
      synergy: this.stats.synergy + 2 + (masteryModule ? 1 : 0),
    };
    this.playerHp += 1;
    const color = getWeaponColors(this.stats).aura;
    this.showFlash(`${this.lockedWeaponTitle} +${this.evolutionCount}`, '#fef3c7', this.player.x, this.player.y - 132);
    this.specialCharge = clamp(this.specialCharge + 28, 0, 100);
    this.showStatGainFeedback(previousStats, previousHp, { label: 'BUKI MASTERY', kind: 'fusion', value: 1, color, good: true });
    this.showEvolutionCutIn(this.lockedWeaponTitle, '選んだブキを固定したまま熟練強化', color);
    this.showRareEvolution(color, this.lockedWeaponTitle);
    this.playRareSound();
  }

  private getFixedWeaponMasteryModule(): string | undefined {
    switch (this.starterCategoryId) {
      case 'balance-bow':
        return 'homing';
      case 'slash-speed':
        return 'bladebit';
      case 'cannon-barrage':
        return 'burst';
      case 'guard-aegis':
        return 'aegis';
      case 'venom-curse':
        return 'poison';
      case 'burst-pierce':
        return 'drill';
      default:
        return undefined;
    }
  }

  private getFixedWeaponFireBonus(): number {
    switch (this.starterCategoryId) {
      case 'slash-speed':
        return 0.18;
      case 'balance-bow':
      case 'venom-curse':
        return 0.1;
      case 'guard-aegis':
        return 0.06;
      case 'cannon-barrage':
      case 'burst-pierce':
        return 0.04;
      default:
        return 0.08;
    }
  }

  private triggerBossWarning(): void {
    this.bossWarningActive = true;
    this.nextBossStepTarget = Number.POSITIVE_INFINITY;
    this.playSoundProfile(BOSS_WARNING_PROFILE);
    navigator.vibrate?.([140, 60, 220, 80, 360]);
    this.cameras.main.shake(1050, 0.006);

    const { width, height } = this.scale;
    const veil = this.add.rectangle(width / 2, height / 2, width, height, 0x7f1d1d, 0.16).setDepth(32);
    const top = this.add.rectangle(width / 2, 138, width + 40, 56, 0x7f1d1d, 0.86).setDepth(33);
    top.setStrokeStyle(3, 0xfef08a, 0.9);
    const label = this.add.text(width / 2, 138, 'BOSS WARNING', {
      fontSize: '24px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#450a0a',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(34);
    const sub = this.add.text(width / 2, 178, '巨大反応 接近中', {
      fontSize: '13px',
      color: '#fee2e2',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#450a0a',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(34);
    const scan = this.add.rectangle(width / 2, -40, width, 26, 0xfef08a, 0.35).setDepth(33).setBlendMode(Phaser.BlendModes.ADD);
    [veil, top, label, sub, scan].forEach((object) => object.setData('bossWarningEffect', true));
    this.tweens.add({ targets: [top, label, sub], alpha: 0.28, duration: 120, yoyo: true, repeat: 7 });
    this.tweens.add({ targets: scan, y: height + 40, duration: 1280, ease: 'Cubic.easeIn', onComplete: () => scan.destroy() });
    this.tweens.add({ targets: veil, alpha: 0, delay: 1450, duration: 360, onComplete: () => veil.destroy() });
    this.tweens.add({ targets: [top, label, sub], alpha: 0, delay: 1450, duration: 300, onComplete: () => { top.destroy(); label.destroy(); sub.destroy(); } });

    this.time.delayedCall(1700, () => {
      this.bossWarningActive = false;
      if (!this.isGameOver && !this.boss) {
        this.spawnBoss();
      }
    });
  }

  private spawnBoss(): void {
    this.bossMaxHp = createBossHp(this.bossLoopIndex, this.getBossPowerPressure());
    this.bossHp = this.bossMaxHp;
    const bossAsset = getRandomBossAsset(this.bossLoopIndex, this.defeatedBossKeys.slice(-2));
    this.currentBossTheme = getBossTheme(bossAsset.key);
    this.boss = new Boss(this, 200, -130, this.bossHp, bossAsset.key);
    this.boss.setDepth(2);
    this.bossPhase = 1;
    this.bossAttackTimer = this.bossLoopIndex === 0 ? 1280 : 820;
    this.bossSpecialTimer = (this.bossLoopIndex === 0 ? 4200 : 2800) + Phaser.Math.Between(0, 900);
    this.bossPatternIndex = this.bossLoopIndex;
    this.bossSpawnStartedAt = this.stageTimer;
    this.grantFirstBossPrep();
    this.physics.add.overlap(this.bullets, this.boss, (bulletObject) => this.hitBoss(bulletObject as Phaser.GameObjects.GameObject), undefined, this);
    this.physics.add.overlap(this.player, this.boss, () => this.finish('GAME OVER'), undefined, this);

    this.bossHpBar = this.add.rectangle(200, 218, 188, 16, 0x450a12, 0.92);
    this.bossHpBar.setStrokeStyle(2, 0xfda4af, 0.85);
    this.bossHpBar.setDepth(8);
    this.bossHpFill = this.add.rectangle(110, 218, 180, 10, 0xfb7185, 0.96).setOrigin(0, 0.5).setDepth(9);
    this.bossHpText = this.add.text(200, 194, `BOSS ${this.bossMaxHp} HP`, {
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

  private grantFirstBossPrep(): void {
    if (this.bossLoopIndex !== 0 || this.firstBossPrepGranted) {
      return;
    }

    this.firstBossPrepGranted = true;
    const modules = this.stats.modules.includes('shield') ? this.stats.modules : [...this.stats.modules, 'shield'];
    this.stats = {
      ...this.stats,
      modules,
      weaponCount: Math.max(this.stats.weaponCount, 22),
      power: Math.max(this.stats.power + 4, 13),
      level: Math.max(this.stats.level + 1, 4),
      fireRate: this.stats.fireRate + 0.12,
      shield: this.stats.shield + 3,
      synergy: this.stats.synergy + 2,
    };
    this.playerHp = Math.max(this.playerHp, 6);
    this.specialCharge = Math.max(this.specialCharge, 70);
    this.showFlash('FIRST BOSS SUPPLY', '#dcfce7', this.player.x, this.player.y - 130);
    this.spawnBurst(this.player.x, this.player.y - 24, 0x86efac, 26);
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
      this.showBossPhaseCutIn(this.bossPhase);
      this.spawnBurst(this.boss.x, this.boss.y + 36, this.currentBossTheme?.accent ?? 0xfecaca, 34);
      this.spawnBossPhaseMinions(this.bossPhase);
      if (this.currentBossTheme) {
        this.time.delayedCall(this.bossLoopIndex === 0 ? 520 : 180, () => this.fireBossPattern(this.currentBossTheme!));
      }
      this.cameras.main.shake(300, 0.004);
    }
    this.bossHpFill.displayWidth = Math.max(0, hpRatio * 180);
    this.bossHpText.setText(`BOSS P${this.bossPhase}  ${Math.max(0, this.bossHp)} HP`);
  }

  private showBossPhaseCutIn(phase: number): void {
    const theme = this.currentBossTheme;
    const color = theme?.accent ?? 0xfecaca;
    const { width, height } = this.scale;
    const band = this.add.rectangle(width / 2, height * 0.24, width + 80, 78, theme?.darkness ?? 0x1f0712, 0.88).setDepth(32);
    band.setStrokeStyle(3, color, 0.92);
    const text = this.add.text(width / 2, height * 0.24, `BOSS PHASE ${phase}`, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 7,
    }).setOrigin(0.5).setDepth(33);
    const blade = this.add.rectangle(-40, height * 0.24, width * 0.9, 8, color, 0.82).setAngle(-8).setDepth(33).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: blade, x: width + 80, alpha: 0, scaleX: 1.8, duration: 520, ease: 'Cubic.easeOut', onComplete: () => blade.destroy() });
    this.tweens.add({ targets: [band, text], alpha: 0, delay: 720, duration: 320, onComplete: () => { band.destroy(); text.destroy(); } });
  }

  private spawnBossPhaseMinions(phase: number): void {
    const variants = phase >= 3
      ? ['photo-chrome-mantis', 'photo-gold-scarab', 'photo-violet-stinger']
      : ['photo-crystal-lens', 'photo-berry-brute', 'shock-coil'];
    const count = Math.max(1, phase + 1 - (this.bossLoopIndex === 0 ? 1 : 0));
    for (let i = 0; i < count; i++) {
      this.spawnEnemy({
        x: 72 + i * (256 / Math.max(1, count - 1)),
        y: -120 - i * 42,
        hp: Math.round((42 + this.bossLoopIndex * 18 + phase * 28) * (phase >= 3 ? 1.35 : 1)),
        variantId: variants[i % variants.length],
      });
    }
    this.showFlash('MINIONS IN', '#fecaca', 200, 160);
  }

  private activateSpecial(): void {
    if (this.isGameOver || this.isPaused) {
      return;
    }

    if (this.specialActive) {
      this.showFlash('必殺発動中', '#fef08a', this.player.x, this.player.y - 92);
      return;
    }

    if (this.specialCooldown > 0 || this.specialCharge < 100) {
      this.showFlash(`必殺 ${Math.floor(this.specialCharge)}%`, '#fef08a', this.player.x, this.player.y - 92);
      this.pulseStatusText(this.specialText, 0xfef08a);
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
    this.specialVariant = Phaser.Math.Between(0, 2) as SpecialVariant;
    this.specialCharge = 0;
    this.specialCooldown = 8500;
    this.specialTimer = 2600 + Math.min(1100, this.stats.synergy * 42 + this.stats.level * 18);
    this.specialDrainTimer = this.getSpecialDrainInterval() * 0.42;
    this.specialPulseTimer = 0;
    this.chargeBurstTheme = this.getChargeBurstSpecialTheme();
    this.chargeBurstPower = 0;
    this.chargeBurstPulseTimer = 0;
    this.showSpecialOpening(colors.primary, colors.secondary, colors.aura, this.specialVariant);
    if (this.chargeBurstTheme) {
      this.showFlash('ためろ...', '#fef3c7', this.player.x, this.player.y - 132);
    }
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
    this.chargeBurstPulseTimer += delta;
    if (this.chargeBurstTheme) {
      const chargeRate = 0.018 + Math.min(0.03, this.stats.power * 0.0009 + this.stats.synergy * 0.0012 + this.stats.level * 0.00045);
      this.chargeBurstPower += delta * chargeRate;
      if (this.chargeBurstPulseTimer >= 150) {
        this.chargeBurstPulseTimer = 0;
        this.emitChargeBurstCharge(this.chargeBurstTheme);
      }
    }

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
      if (!this.chargeBurstTheme) {
        this.emitSpecialPulse();
      }
    }

    if (this.specialTimer <= 0) {
      if (this.chargeBurstTheme) {
        this.releaseChargeBurstSpecial(this.chargeBurstTheme);
      }
      this.specialActive = false;
      this.chargeBurstTheme = undefined;
      this.chargeBurstPower = 0;
      this.chargeBurstPulseTimer = 0;
      this.showFlash('必殺終了', '#e0f2fe', this.player.x, this.player.y - 104);
    }
  }

  private getChargeBurstSpecialTheme(): ChargeBurstTheme | undefined {
    const branch = getEvolutionBranch(this.evolutionPath.at(-1));
    const skinKey = this.getCurrentWeaponSkinKey();
    const signature = `${skinKey} ${this.lockedWeaponTitle} ${branch?.id ?? ''} ${branch?.title ?? ''} ${getWeaponName(this.stats)}`.toLowerCase();
    if (signature.includes('grape') || signature.includes('vineyard')) return 'grape';
    if (signature.includes('ichigo') || signature.includes('strawberry')) return 'strawberry';
    if (this.stats.element === 'thunder' || ['rail', 'tempest', 'levin', 'chrono'].includes(this.stats.archetype) || signature.includes('thunder') || signature.includes('storm') || signature.includes('volt') || signature.includes('tesla')) {
      return 'thunder';
    }
    return undefined;
  }

  private getChargeBurstPalette(theme: ChargeBurstTheme): { primary: number; secondary: number; aura: number; text: string; status: StatusEffect } {
    if (theme === 'thunder') {
      return { primary: 0xfef08a, secondary: 0x38bdf8, aura: 0xfacc15, text: 'THUNDER CRITICAL', status: 'paralyze' };
    }
    if (theme === 'strawberry') {
      return { primary: 0xfb7185, secondary: 0x22c55e, aura: 0xfef3c7, text: 'STRAWBERRY CRITICAL', status: 'burn' };
    }
    return { primary: 0x8b5cf6, secondary: 0x86efac, aura: 0xf0abfc, text: 'GRAPE CRITICAL', status: 'poison' };
  }

  private getChargeBurstLabel(theme: ChargeBurstTheme): string {
    if (theme === 'thunder') return '雷鳴一閃';
    if (theme === 'strawberry') return '苺芯撃';
    return '葡萄裂星';
  }

  private emitChargeBurstCharge(theme: ChargeBurstTheme): void {
    const palette = this.getChargeBurstPalette(theme);
    const charge = clamp(this.chargeBurstPower / 125, 0.16, 1.4);
    const ring = this.add.circle(this.player.x, this.player.y - 42, 22 + charge * 24, palette.primary, 0).setStrokeStyle(3 + charge * 2, palette.aura, 0.52).setDepth(16);
    const core = this.add.circle(this.player.x, this.player.y - 42, 6 + charge * 5, palette.secondary, 0.32).setDepth(17).setBlendMode(Phaser.BlendModes.ADD);
    ring.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: ring, scale: 1.8 + charge * 0.8, alpha: 0, duration: 260, ease: 'Sine.easeOut', onComplete: () => ring.destroy() });
    this.tweens.add({ targets: core, scale: 2.2 + charge, alpha: 0, duration: 220, ease: 'Quad.easeOut', onComplete: () => core.destroy() });
    if (theme === 'thunder') {
      const bolt = this.add.line(0, 0, this.player.x + Phaser.Math.Between(-60, 60), this.player.y - 190, this.player.x + Phaser.Math.Between(-18, 18), this.player.y - 34, palette.primary, 0.62).setDepth(16);
      bolt.setLineWidth(2 + charge * 2).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: bolt, alpha: 0, duration: 150, onComplete: () => bolt.destroy() });
    } else {
      const petal = this.add.triangle(this.player.x + Phaser.Math.Between(-28, 28), this.player.y - 78, 0, -10, 8, 10, -8, 10, theme === 'grape' ? palette.aura : palette.primary, 0.58).setDepth(16);
      petal.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: petal, y: petal.y - 66, angle: Phaser.Math.Between(-120, 120), alpha: 0, scale: 2, duration: 420, ease: 'Sine.easeOut', onComplete: () => petal.destroy() });
    }
    if (this.chargeBurstPower > 80 && Math.random() < 0.32) {
      this.playTone(theme === 'thunder' ? 720 : theme === 'grape' ? 520 : 620, 0.025, 0.018);
    }
  }

  private releaseChargeBurstSpecial(theme: ChargeBurstTheme): void {
    const palette = this.getChargeBurstPalette(theme);
    const variant = this.specialVariant;
    const chargeRatio = clamp(this.chargeBurstPower / 120, 0.75, 2.4);
    const baseDamage = Math.max(18, Math.round((this.stats.power + this.stats.level * 2.3 + this.stats.weaponCount * 0.5 + this.stats.synergy * 1.4) * getWeaponPowerMultiplier(this.stats)));
    const enemyDamage = Math.round(baseDamage * (4.6 + chargeRatio * 2.1 + variant * 0.9));
    const bossDamage = Math.round(baseDamage * (3.2 + chargeRatio * 1.35 + variant * 0.72));
    const impactY = this.player.y - 260;

    this.spawnChargeBurstFinisher(theme, palette, impactY, chargeRatio, variant);

    this.enemies.getChildren().forEach((enemy) => {
      const enemyObject = enemy as Enemy;
      enemyObject.setData(`${palette.status}Ms`, 1800 + variant * 500);
      if (enemyObject.damage(enemyDamage)) {
        this.spawnBurst(enemyObject.x, enemyObject.y, palette.secondary, 30);
        enemyObject.destroy();
      } else {
        this.spawnHitEffect(enemyObject.x, enemyObject.y, palette.aura);
      }
    });

    this.bossProjectiles.getChildren().slice(0, 18 + variant * 8).forEach((projectile) => {
      const obj = projectile as Phaser.GameObjects.GameObject & { x: number; y: number };
      this.spawnBurst(obj.x, obj.y, palette.primary, 13);
      projectile.destroy();
    });

    if (this.boss) {
      const armoredBossDamage = Math.max(1, Math.round(bossDamage / this.getBossArmor(2.1 + this.bossPhase * 0.36)));
      this.bossHp -= armoredBossDamage;
      this.spawnBurst(this.boss.x, this.boss.y + 18, palette.aura, 48);
      this.spawnHitEffect(this.boss.x, this.boss.y, palette.secondary);
      if (theme === 'thunder') this.bossAttackTimer += 220;
      if (this.bossHp <= 0) {
        this.hitBoss(new Bullet(this, this.boss.x, this.boss.y, palette.aura, 'pierce'));
      }
    }

    this.showFlash(palette.text, '#ffffff', this.player.x, this.player.y - 150);
    this.cameras.main.shake(720, 0.011);
    this.playTone(theme === 'thunder' ? 1280 : theme === 'grape' ? 720 : 900, 0.16, 0.05);
  }

  private spawnChargeBurstFinisher(
    theme: ChargeBurstTheme,
    palette: ReturnType<typeof this.getChargeBurstPalette>,
    impactY: number,
    chargeRatio: number,
    variant: SpecialVariant,
  ): void {
    const { width, height } = this.scale;
    const focusX = clamp(this.boss?.x ?? this.player.x, 78, 322);
    const tunnel = this.add.circle(focusX, impactY, 42, palette.primary, 0).setStrokeStyle(12, palette.aura, 0.64).setDepth(29);
    tunnel.setScale(1.15, 0.52).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: tunnel, scaleX: 8 + chargeRatio * 1.4, scaleY: 3.1 + chargeRatio * 0.55, alpha: 0, duration: 680, ease: 'Cubic.easeOut', onComplete: () => tunnel.destroy() });

    const shock = this.add.circle(focusX, impactY, 16, palette.secondary, 0.18).setStrokeStyle(6, palette.primary, 0.86).setDepth(31);
    shock.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: shock, scale: 12 + chargeRatio * 2.4, alpha: 0, duration: 620, ease: 'Cubic.easeOut', onComplete: () => shock.destroy() });

    const label = this.add.text(focusX, Math.max(120, impactY - 88), this.getChargeBurstLabel(theme), {
      fontSize: '31px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#020617',
      strokeThickness: 7,
    }).setOrigin(0.5).setDepth(36);
    this.tweens.add({ targets: label, y: label.y - 18, scale: 1.12, alpha: 0, duration: 900, delay: 170, ease: 'Cubic.easeOut', onComplete: () => label.destroy() });

    const laneCount = 12 + variant * 4;
    for (let i = 0; i < laneCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const lane = this.add.rectangle(focusX + side * (32 + i * 9), height + 40, 5 + (i % 3), height * 0.9, i % 2 === 0 ? palette.secondary : palette.aura, 0.34).setDepth(28);
      lane.setAngle(side * (14 + (i % 4) * 4)).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: lane,
        y: impactY - 140 - i * 6,
        x: focusX + side * (210 + i * 12),
        scaleX: 2 + chargeRatio * 0.4,
        alpha: 0,
        duration: 520 + (i % 5) * 36,
        ease: 'Cubic.easeOut',
        onComplete: () => lane.destroy(),
      });
    }

    if (theme === 'thunder') {
      this.spawnThunderFinisher(focusX, impactY, palette, chargeRatio, variant);
    } else if (theme === 'strawberry') {
      this.spawnStrawberryFinisher(focusX, impactY, palette, chargeRatio, variant);
    } else {
      this.spawnGrapeFinisher(focusX, impactY, palette, chargeRatio, variant);
    }

    const cut = this.add.rectangle(focusX, impactY + 8, width * 0.76, 9, 0xffffff, 0.52).setDepth(35);
    cut.setAngle(-10 + variant * 10).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: cut, scaleX: 1.35, scaleY: 3.2, alpha: 0, duration: 260, ease: 'Quad.easeOut', onComplete: () => cut.destroy() });
  }

  private spawnThunderFinisher(x: number, y: number, palette: ReturnType<typeof this.getChargeBurstPalette>, chargeRatio: number, variant: SpecialVariant): void {
    const spear = this.add.triangle(x, -120, 0, -70, 26, 70, -26, 70, palette.primary, 0.94).setDepth(34);
    const core = this.add.rectangle(x, -90, 18, 230, palette.aura, 0.78).setDepth(33);
    spear.setBlendMode(Phaser.BlendModes.ADD);
    core.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: [spear, core], y, scaleX: 4.2 + chargeRatio, scaleY: 3.4 + chargeRatio * 0.7, alpha: 0, duration: 520, ease: 'Expo.easeIn', onComplete: () => { spear.destroy(); core.destroy(); } });
    for (let i = 0; i < 9 + variant * 3; i++) {
      const bolt = this.add.line(0, 0, x + Phaser.Math.Between(-130, 130), y - Phaser.Math.Between(130, 260), x + Phaser.Math.Between(-80, 80), y + Phaser.Math.Between(-30, 90), i % 2 === 0 ? palette.primary : palette.secondary, 0.76).setDepth(35);
      bolt.setLineWidth(4 + (i % 3)).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: bolt, alpha: 0, duration: 180 + i * 22, onComplete: () => bolt.destroy() });
    }
  }

  private spawnStrawberryFinisher(x: number, y: number, palette: ReturnType<typeof this.getChargeBurstPalette>, chargeRatio: number, variant: SpecialVariant): void {
    const berry = this.add.container(x, y - 260).setDepth(36);
    const body = this.add.ellipse(0, 42, 88, 118, palette.primary, 0.94);
    const tip = this.add.triangle(0, 126, -34, -12, 34, -12, 0, 44, palette.primary, 0.94);
    const leftGlow = this.add.ellipse(-24, 18, 22, 54, 0xffffff, 0.24).setAngle(20);
    const leafA = this.add.triangle(-28, -24, 0, 22, 48, 8, 12, -30, palette.secondary, 0.86).setAngle(-18);
    const leafB = this.add.triangle(0, -34, -34, 24, 34, 24, 0, -38, palette.secondary, 0.9);
    const leafC = this.add.triangle(28, -24, -48, 8, 0, 22, -12, -30, palette.secondary, 0.86).setAngle(18);
    berry.add([body, tip, leftGlow, leafA, leafB, leafC]);
    berry.setScale(0.28).setAngle(-8 + variant * 8);
    berry.setBlendMode(Phaser.BlendModes.ADD);

    const shadow = this.add.ellipse(x, y + 58, 74, 18, 0x020617, 0.28).setDepth(29);
    this.tweens.add({ targets: shadow, scaleX: 4.2 + chargeRatio, scaleY: 2.4, alpha: 0, duration: 620, ease: 'Cubic.easeOut', onComplete: () => shadow.destroy() });
    this.tweens.add({
      targets: berry,
      y: y - 8,
      scale: 3.2 + chargeRatio * 0.78,
      angle: berry.angle + 18,
      duration: 460,
      ease: 'Expo.easeIn',
      onComplete: () => {
        this.tweens.add({ targets: berry, y: y + 18, scale: 4.7 + chargeRatio, alpha: 0, duration: 260, ease: 'Back.easeOut', onComplete: () => berry.destroy() });
      },
    });

    const impactRing = this.add.ellipse(x, y + 38, 48, 18, palette.primary, 0).setStrokeStyle(9, palette.aura, 0.84).setDepth(35);
    impactRing.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: impactRing, scaleX: 7.8 + chargeRatio * 1.6, scaleY: 4.4 + chargeRatio, alpha: 0, duration: 560, delay: 330, ease: 'Cubic.easeOut', onComplete: () => impactRing.destroy() });

    const seedCount = 24 + variant * 8;
    for (let i = 0; i < seedCount; i++) {
      const angle = (Math.PI * 2 * i) / seedCount;
      const seed = this.add.ellipse(x, y + 12, 8, 14, i % 3 === 0 ? palette.aura : 0xfef3c7, 0.78).setDepth(37);
      seed.setAngle(Phaser.Math.RadToDeg(angle) + 90).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: seed,
        x: x + Math.cos(angle) * (190 + chargeRatio * 58 + (i % 4) * 12),
        y: y + Math.sin(angle) * (128 + chargeRatio * 42 + (i % 5) * 10),
        scale: 2.4 + (i % 3) * 0.4,
        alpha: 0,
        duration: 480 + (i % 6) * 42,
        delay: 260,
        ease: 'Cubic.easeOut',
        onComplete: () => seed.destroy(),
      });
    }

    for (let i = 0; i < 10 + variant * 3; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const crack = this.add.rectangle(x + side * (18 + i * 9), y + 44 + (i % 3) * 10, 6, 170 + chargeRatio * 40, i % 2 === 0 ? palette.primary : palette.secondary, 0.52).setDepth(34);
      crack.setAngle(side * (72 - (i % 4) * 10)).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: crack,
        x: x + side * (150 + i * 18),
        scaleX: 3.4,
        alpha: 0,
        duration: 430 + i * 24,
        delay: 270,
        ease: 'Quad.easeOut',
        onComplete: () => crack.destroy(),
      });
    }

    for (let i = 0; i < 9 + variant * 3; i++) {
      const leaf = this.add.triangle(x, y - 24, 0, -24, 18, 18, -18, 18, palette.secondary, 0.74).setDepth(36);
      const angle = -Math.PI * 0.85 + (Math.PI * 1.7 * i) / Math.max(1, 8 + variant * 3);
      leaf.setAngle(Phaser.Math.RadToDeg(angle) + 90).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: leaf, x: x + Math.cos(angle) * (160 + chargeRatio * 42), y: y + Math.sin(angle) * (96 + chargeRatio * 30), scale: 2.9, alpha: 0, duration: 600 + (i % 4) * 50, delay: 210, ease: 'Back.easeOut', onComplete: () => leaf.destroy() });
    }
  }

  private spawnGrapeFinisher(x: number, y: number, palette: ReturnType<typeof this.getChargeBurstPalette>, chargeRatio: number, variant: SpecialVariant): void {
    const orbCount = 7 + variant * 2;
    for (let i = 0; i < orbCount; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const orb = this.add.circle(x + (col - 1) * 24, y - 86 + row * 28, 14 + (i % 2) * 3, i % 2 === 0 ? palette.primary : palette.aura, 0.82).setDepth(34);
      orb.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: orb, x: x + (col - 1) * (86 + chargeRatio * 22), y: y + row * 14, scale: 5.8 + chargeRatio, alpha: 0, duration: 560 + i * 22, ease: 'Back.easeOut', onComplete: () => orb.destroy() });
    }
    for (let i = 0; i < 8 + variant * 3; i++) {
      const vine = this.add.rectangle(x + Phaser.Math.Between(-90, 90), y + Phaser.Math.Between(-120, 80), 7, 190 + chargeRatio * 38, i % 2 === 0 ? palette.secondary : palette.primary, 0.48).setDepth(33);
      vine.setAngle(Phaser.Math.Between(-54, 54)).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: vine, scaleX: 3.2, alpha: 0, angle: vine.angle + Phaser.Math.Between(-80, 80), duration: 460 + i * 28, ease: 'Sine.easeOut', onComplete: () => vine.destroy() });
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

  private showSpecialOpening(primary: number, secondary: number, aura: number, variant: SpecialVariant): void {
    const { width, height } = this.scale;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, aura, 0.42).setDepth(35).setBlendMode(Phaser.BlendModes.ADD);
    const veil = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.18).setDepth(34).setBlendMode(Phaser.BlendModes.ADD);
    const crown = this.add.circle(this.player.x, this.player.y, 48, primary, 0).setStrokeStyle(7, secondary, 1).setDepth(36);
    const halo = this.add.circle(this.player.x, this.player.y, 78, secondary, 0).setStrokeStyle(3, aura, 0.9).setDepth(36);
    const glyph = this.add.star(this.player.x, this.player.y - 20, 8, 22, 92, secondary, 0).setStrokeStyle(4, aura, 0.95).setDepth(36);
    glyph.setBlendMode(Phaser.BlendModes.ADD);
    const title = this.add.text(width / 2, height * 0.36, 'BUKI SPECIAL', {
      fontSize: '34px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(37);
    const specialNames = ['BURST', 'RAMPAGE', 'CATASTROPHE'];
    const subtitle = this.add.text(width / 2, height * 0.42, `${this.lockedWeaponTitle} / ${specialNames[variant]}`, {
      fontSize: '13px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(37);

    const rayCount = 18 + variant * 6;
    for (let i = 0; i < rayCount; i++) {
      const angle = (Math.PI * 2 * i) / rayCount;
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

    for (let i = 0; i < 10 + variant * 3; i++) {
      const x = 36 + i * 36;
      const beam = this.add.rectangle(x, height / 2, 8 + (i % 3) * 5, height + 120, i % 2 === 0 ? secondary : aura, 0.28).setAngle(i % 2 === 0 ? -12 : 12).setDepth(33);
      beam.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: beam,
        x: x + (i % 2 === 0 ? 46 : -46),
        alpha: 0,
        scaleX: 2.4,
        duration: 620 + i * 26,
        ease: 'Cubic.easeOut',
        onComplete: () => beam.destroy(),
      });
    }

    if (variant >= 1) {
      for (let i = 0; i < 5 + variant * 2; i++) {
        const ring = this.add.circle(this.player.x, this.player.y - 28, 42 + i * 18, i % 2 === 0 ? primary : secondary, 0).setStrokeStyle(3, i % 2 === 0 ? aura : secondary, 0.78).setDepth(36);
        ring.setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: ring, scale: 2.8 + i * 0.2, angle: 180 + i * 24, alpha: 0, duration: 620 + i * 62, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
      }
    }

    const shardCount = 30 + variant * 12;
    for (let i = 0; i < shardCount; i++) {
      const angle = (Math.PI * 2 * i) / shardCount;
      const shard = this.add.triangle(this.player.x, this.player.y - 22, 0, -8, 6, 8, -6, 8, i % 2 === 0 ? aura : secondary, 0.82).setDepth(37);
      shard.setBlendMode(Phaser.BlendModes.ADD);
      shard.setRotation(angle);
      this.tweens.add({
        targets: shard,
        x: this.player.x + Math.cos(angle) * Phaser.Math.Between(120, 260),
        y: this.player.y - 22 + Math.sin(angle) * Phaser.Math.Between(90, 220),
        angle: Phaser.Math.RadToDeg(angle) + 260,
        alpha: 0,
        scale: 2.2,
        duration: 680 + (i % 5) * 70,
        ease: 'Cubic.easeOut',
        onComplete: () => shard.destroy(),
      });
    }

    this.tweens.add({ targets: flash, alpha: 0, duration: 680, onComplete: () => flash.destroy() });
    this.tweens.add({ targets: veil, alpha: 0, duration: 360, onComplete: () => veil.destroy() });
    this.tweens.add({ targets: [crown, halo, glyph], scale: 4.2, angle: 220, alpha: 0, duration: 880, ease: 'Cubic.easeOut', onComplete: () => { crown.destroy(); halo.destroy(); glyph.destroy(); } });
    this.tweens.add({ targets: [title, subtitle], y: '-=28', alpha: 0, duration: 1180, ease: 'Sine.easeOut', onComplete: () => { title.destroy(); subtitle.destroy(); } });
  }

  private emitSpecialPulse(): void {
    const colors = getWeaponColors(this.stats);
    const damage = Math.max(12, Math.round((this.stats.power + this.stats.level * 2 + this.stats.weaponCount * 0.45) * getWeaponPowerMultiplier(this.stats) * 1.12));
    const specialStyle = this.getWeaponSpecialStyle();
    const variant = this.specialVariant;
    let range = 460;
    let enemyDamage = damage * 2;
    let bossDamage = damage;

    if (specialStyle === 'anchor') {
      range = variant === 1 ? 470 : variant === 2 ? 430 : 380;
      enemyDamage = damage * (variant === 2 ? 4.1 : variant === 1 ? 2.8 : 3.4);
      bossDamage = damage * (variant === 2 ? 2.85 : variant === 1 ? 2.15 : 2.4);
      const slamCount = 3 + Math.min(2, Math.floor(this.stats.weaponCount / 22)) + variant;
      for (let i = 0; i < slamCount; i++) {
        const x = variant === 1 ? 52 + i * (296 / Math.max(1, slamCount - 1)) : this.player.x + (i - (slamCount - 1) / 2) * 68;
        const pillar = this.add.rectangle(x, this.player.y - 185 + (variant === 2 ? i * 12 : 0), variant === 2 ? 42 : 28, 360, colors.primary, 0.68).setDepth(14).setBlendMode(Phaser.BlendModes.ADD);
        const impact = this.add.circle(x, this.player.y - 28, 24 + variant * 6, colors.secondary, 0).setStrokeStyle(8 + variant * 2, colors.bullet, 0.9).setDepth(15);
        this.tweens.add({ targets: pillar, y: `+=${92 + variant * 26}`, alpha: 0, scaleX: 4.8 + variant * 1.4, duration: 260 + variant * 55, ease: 'Cubic.easeOut', onComplete: () => pillar.destroy() });
        this.tweens.add({ targets: impact, scale: 4.4 + variant * 1.2, alpha: 0, duration: 340 + variant * 60, ease: 'Cubic.easeOut', onComplete: () => impact.destroy() });
      }
    } else if (specialStyle === 'blade') {
      range = variant === 2 ? 640 : 560;
      enemyDamage = damage * (variant === 0 ? 2.45 : variant === 1 ? 2.85 : 2.2);
      bossDamage = damage * (variant === 0 ? 1.45 : variant === 1 ? 1.72 : 1.25);
      const slashCount = 6 + variant * 4;
      for (let i = 0; i < slashCount; i++) {
        const sweep = i - (slashCount - 1) / 2;
        const slash = this.add.rectangle(this.player.x + sweep * 28, this.player.y - 126 - (i % 2) * 44, 10 + variant * 2, 280 + variant * 58, i % 2 === 0 ? colors.bullet : colors.secondary, 0.74).setDepth(16);
        slash.setBlendMode(Phaser.BlendModes.ADD);
        slash.setAngle(-58 + (i % 3) * 58);
        slash.setStrokeStyle(2, 0xffffff, 0.48);
        this.tweens.add({
          targets: slash,
          x: slash.x + sweep * 22,
          y: slash.y - 76,
          scaleX: 3.1 + variant * 0.7,
          alpha: 0,
          angle: slash.angle + (sweep >= 0 ? 36 : -36),
          duration: 260 + variant * 50 + (i % 3) * 42,
          ease: 'Cubic.easeOut',
          onComplete: () => slash.destroy(),
        });
      }
      if (variant === 2) {
        this.spawnReaperScythes(colors);
      }
      this.bossProjectiles.getChildren().slice(0, 4 + variant * 4).forEach((projectile) => {
        const obj = projectile as Phaser.GameObjects.GameObject & { x: number; y: number };
        this.spawnBurst(obj.x, obj.y, colors.bullet, 12);
        projectile.destroy();
      });
    } else if (specialStyle === 'basilisk') {
      range = variant === 2 ? 650 : 560;
      enemyDamage = damage * (variant === 0 ? 1.35 : variant === 1 ? 1.7 : 1.2);
      bossDamage = damage * (variant === 0 ? 1.15 : variant === 1 ? 1.35 : 1.0);
      this.enemies.getChildren().slice(0, 8 + variant * 4).forEach((enemy, index) => {
        const target = enemy as Enemy;
        const line = this.add.line(0, 0, this.player.x, this.player.y - 18, target.x, target.y, index % 2 === 0 ? colors.primary : colors.secondary, 0.74).setDepth(15);
        line.setLineWidth(5 + variant * 2).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: line, alpha: 0, duration: 260 + variant * 80, ease: 'Quad.easeOut', onComplete: () => line.destroy() });
      });
      const eye = this.add.circle(this.player.x, this.player.y - 54, 20, colors.primary, 0.34).setStrokeStyle(4, colors.secondary, 0.92).setDepth(15);
      this.tweens.add({ targets: eye, scaleX: 6 + variant * 2, scaleY: 1.2 + variant * 0.4, alpha: 0, duration: 320 + variant * 80, ease: 'Quad.easeOut', onComplete: () => eye.destroy() });
      if (variant >= 1) {
        this.spawnSpecialRain(colors, variant === 2 ? 18 : 10, colors.primary);
      }
      if (variant === 2) {
        this.spawnReaperScythes(colors);
        this.bossProjectiles.getChildren().slice(0, 10).forEach((projectile) => {
          const obj = projectile as Phaser.GameObjects.GameObject & { x: number; y: number };
          this.spawnBurst(obj.x, obj.y, colors.primary, 12);
          projectile.destroy();
        });
      }
    } else if (specialStyle === 'rune') {
      range = variant === 1 ? 540 : 430;
      enemyDamage = damage * (variant === 2 ? 1.35 : variant === 1 ? 2.05 : 1.7);
      bossDamage = damage * (variant === 1 ? 1.18 : 0.9);
      const glyphCount = 6 + variant * 4;
      for (let i = 0; i < glyphCount; i++) {
        const angle = (Math.PI * 2 * i) / glyphCount + this.stageTimer * 0.002;
        const glyph = this.add.rectangle(this.player.x + Math.cos(angle) * (62 + variant * 18), this.player.y + Math.sin(angle) * (38 + variant * 12), 18 + variant * 4, 18 + variant * 4, i % 2 === 0 ? colors.secondary : colors.bullet, 0.72).setDepth(15);
        glyph.setAngle(45 + i * 30).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: glyph, scale: 2.4 + variant * 0.9, angle: glyph.angle + 180 + variant * 90, alpha: 0, duration: 420 + variant * 70, ease: 'Sine.easeOut', onComplete: () => glyph.destroy() });
      }
      const ward = this.add.circle(this.player.x, this.player.y, 42, colors.aura, 0).setStrokeStyle(5, colors.bullet, 0.86).setDepth(15);
      this.tweens.add({ targets: ward, scale: 3.7 + variant * 0.8, alpha: 0, duration: 420 + variant * 70, ease: 'Quad.easeOut', onComplete: () => ward.destroy() });
      if (Math.random() < (variant === 2 ? 0.5 : 0.34)) {
        this.playerHp += 1;
        this.showFlash('RUNE HEAL', '#dcfce7', this.player.x, this.player.y - 124);
      }
    } else if (specialStyle === 'phoenix') {
      range = variant === 2 ? 580 : 500;
      enemyDamage = damage * (variant === 1 ? 2.95 : variant === 2 ? 2.25 : 2.5);
      bossDamage = damage * (variant === 1 ? 1.85 : variant === 2 ? 1.4 : 1.55);
      const featherCount = 7 + variant * 5;
      for (let i = 0; i < featherCount; i++) {
        const offset = i - (featherCount - 1) / 2;
        const feather = this.add.triangle(this.player.x + offset * (variant === 2 ? 18 : 24), this.player.y - 78, 0, -22, 14, 20, -14, 20, i % 2 === 0 ? colors.primary : colors.secondary, 0.78).setDepth(15);
        feather.setAngle(offset * 12).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: feather, y: `-=${210 + variant * 60}`, x: `+=${offset * (18 + variant * 8)}`, scale: 2.4 + variant * 0.9, alpha: 0, duration: 430 + variant * 70, ease: 'Cubic.easeOut', onComplete: () => feather.destroy() });
      }
      this.spawnBurst(this.player.x, this.player.y - 54, colors.secondary, 34 + variant * 10);
      if (variant >= 1) {
        this.spawnSpecialRain(colors, variant === 2 ? 16 : 9, colors.secondary);
      }
      if (Math.random() < (variant === 2 ? 0.3 : 0.22)) {
        this.playerHp += 1;
        this.showFlash('REBIRTH', '#dcfce7', this.player.x, this.player.y - 124);
      }
    } else if (specialStyle === 'storm') {
      range = variant === 2 ? 610 : 520;
      enemyDamage = damage * (variant === 1 ? 2.45 : variant === 2 ? 1.85 : 2.05);
      bossDamage = damage * (variant === 1 ? 1.45 : variant === 2 ? 1.1 : 1.2);
      for (let i = 0; i < 7 + variant * 5; i++) {
        const x = Phaser.Math.Between(54, 346);
        const bolt = this.add.line(0, 0, x, this.player.y - 370, x + Phaser.Math.Between(-30, 30), this.player.y + 10, i % 2 === 0 ? colors.bullet : colors.secondary, 0.88).setDepth(15);
        bolt.setLineWidth(4 + (i % 3) + variant).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: bolt, alpha: 0, duration: 170 + variant * 36, ease: 'Quad.easeOut', onComplete: () => bolt.destroy() });
      }
      this.bossProjectiles.getChildren().slice(0, 8 + variant * 5).forEach((projectile) => {
        const obj = projectile as Phaser.GameObjects.GameObject & { x: number; y: number };
        this.spawnBurst(obj.x, obj.y, colors.bullet, 12);
        projectile.destroy();
      });
      if (variant === 2) {
        this.spawnSpecialOrbitals(colors, 8, 94);
      }
      this.playTone(880 + Math.random() * 120, 0.035, 0.02);
    } else if (specialStyle === 'frost') {
      range = variant === 1 ? 590 : 520;
      enemyDamage = damage * (variant === 0 ? 2.1 : variant === 1 ? 1.75 : 2.65);
      bossDamage = damage * (variant === 0 ? 1.22 : variant === 1 ? 1.05 : 1.55);
      const lanceCount = 6 + variant * 4;
      for (let i = 0; i < lanceCount; i++) {
        const angle = (Math.PI * 2 * i) / lanceCount + (variant === 1 ? this.stageTimer * 0.004 : -Math.PI / 2);
        const startX = variant === 2 ? 38 + i * (324 / Math.max(1, lanceCount - 1)) : this.player.x + Math.cos(angle) * (70 + variant * 18);
        const startY = variant === 2 ? this.player.y - 330 : this.player.y - 54 + Math.sin(angle) * (44 + variant * 18);
        const lance = this.add.triangle(startX, startY, 0, -30, 10, 22, -10, 22, i % 2 === 0 ? colors.bullet : colors.secondary, 0.82).setDepth(15);
        lance.setBlendMode(Phaser.BlendModes.ADD);
        lance.setAngle(variant === 2 ? Phaser.Math.Between(-10, 10) : Phaser.Math.RadToDeg(angle) + 90);
        this.tweens.add({
          targets: lance,
          y: variant === 2 ? this.player.y + 46 : startY + Math.sin(angle) * 230,
          x: variant === 2 ? startX + Phaser.Math.Between(-26, 26) : startX + Math.cos(angle) * 230,
          scale: 2.5 + variant * 0.5,
          alpha: 0,
          duration: 360 + variant * 80,
          ease: 'Cubic.easeOut',
          onComplete: () => lance.destroy(),
        });
      }
      const crystal = this.add.star(this.player.x, this.player.y - 54, 8, 16, 62 + variant * 18, colors.secondary, 0.32).setStrokeStyle(4 + variant, colors.bullet, 0.86).setDepth(16);
      crystal.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: crystal, scale: 3.1 + variant, angle: 180 + variant * 120, alpha: 0, duration: 430 + variant * 80, ease: 'Cubic.easeOut', onComplete: () => crystal.destroy() });
      if (variant >= 1) {
        this.bossAttackTimer += 80;
      }
    } else {
      range = variant === 1 ? 700 : 620;
      enemyDamage = damage * (variant === 2 ? 2.2 : 1.85);
      bossDamage = damage * (variant === 2 ? 1.22 : 0.95);
      const nova = this.add.circle(this.player.x, this.player.y - 80, 22 + variant * 8, colors.secondary, 0.22).setStrokeStyle(6 + variant * 2, colors.bullet, 0.86).setDepth(16);
      const core = this.add.circle(this.player.x, this.player.y - 80, 10, colors.primary, 0.7).setDepth(16).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: nova, scale: 9 + variant * 2, alpha: 0, duration: 460 + variant * 80, ease: 'Cubic.easeOut', onComplete: () => nova.destroy() });
      this.tweens.add({ targets: core, scale: 14 + variant * 3, alpha: 0, duration: 360 + variant * 70, ease: 'Cubic.easeOut', onComplete: () => core.destroy() });
      if (variant >= 1) {
        this.spawnSpecialOrbitals(colors, variant === 2 ? 10 : 6, variant === 2 ? 126 : 88);
      }
    }

    this.spawnSpecialPulseFlare(colors, specialStyle, range, variant);

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
      const bossArmor = this.getBossArmor(2.65 + this.bossPhase * 0.48);
      const armoredBossDamage = Math.max(1, Math.round(bossDamage / bossArmor));
      this.bossHp -= armoredBossDamage;
      this.spawnHitEffect(this.boss.x + Phaser.Math.Between(-86, 86), this.boss.y + Phaser.Math.Between(-40, 80), colors.bullet);
      if (specialStyle === 'basilisk') {
        this.bossAttackTimer += 120;
      }
      if (this.bossHp <= 0) {
        this.hitBoss(new Bullet(this, this.boss.x, this.boss.y, colors.bullet));
      }
    }
  }

  private spawnSpecialPulseFlare(colors: ReturnType<typeof getWeaponColors>, specialStyle: SpecialStyle, range: number, variant: SpecialVariant): void {
    const pulse = this.add.circle(this.player.x, this.player.y - 38, Math.max(30, range * 0.13), colors.aura, 0).setStrokeStyle(8, colors.bullet, 0.8).setDepth(14);
    const inner = this.add.circle(this.player.x, this.player.y - 38, 18, colors.primary, 0.26).setStrokeStyle(3, colors.secondary, 0.9).setDepth(15);
    pulse.setBlendMode(Phaser.BlendModes.ADD);
    inner.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: pulse, scale: 4.6 + variant * 0.9, alpha: 0, duration: 420 + variant * 65, ease: 'Cubic.easeOut', onComplete: () => pulse.destroy() });
    this.tweens.add({ targets: inner, scale: 8.4 + variant * 1.6, alpha: 0, duration: 320 + variant * 55, ease: 'Cubic.easeOut', onComplete: () => inner.destroy() });

    const slashCount = (specialStyle === 'blade' ? 14 : specialStyle === 'storm' ? 10 : specialStyle === 'phoenix' ? 12 : 8) + variant * 4;
    for (let i = 0; i < slashCount; i++) {
      const angle = (Math.PI * 2 * i) / slashCount + this.stageTimer * 0.004;
      const length = (specialStyle === 'blade' ? 260 : specialStyle === 'anchor' ? 230 : 170 + (i % 3) * 36) + variant * 42;
      const slash = this.add.rectangle(this.player.x + Math.cos(angle) * 52, this.player.y - 38 + Math.sin(angle) * 44, 7, length, i % 2 === 0 ? colors.secondary : colors.bullet, 0.48).setDepth(14);
      slash.setBlendMode(Phaser.BlendModes.ADD);
      slash.setRotation(angle);
      this.tweens.add({
        targets: slash,
        x: slash.x + Math.cos(angle) * 118,
        y: slash.y + Math.sin(angle) * 118,
        alpha: 0,
        scaleX: 2.6 + variant * 0.8,
        duration: 260 + variant * 40 + (i % 4) * 34,
        ease: 'Quad.easeOut',
        onComplete: () => slash.destroy(),
      });
    }

    if (specialStyle === 'phoenix' || specialStyle === 'rune' || specialStyle === 'frost') {
      const star = this.add.star(this.player.x, this.player.y - 76, specialStyle === 'phoenix' ? 7 : 10, 18, 72, colors.secondary, 0.34).setStrokeStyle(3, colors.bullet, 0.88).setDepth(16);
      star.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: star, angle: 260, scale: 3.2, alpha: 0, duration: 430, ease: 'Cubic.easeOut', onComplete: () => star.destroy() });
    }

    if (specialStyle === 'basilisk' || specialStyle === 'nova') {
      for (let i = 0; i < 5 + variant * 2; i++) {
        const ring = this.add.circle(this.player.x, this.player.y - 44, 38 + i * 18, colors.primary, 0).setStrokeStyle(2, i % 2 === 0 ? colors.aura : colors.secondary, 0.42).setDepth(13);
        ring.setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: ring, scale: 2.2 + i * 0.18, alpha: 0, duration: 360 + i * 54, ease: 'Sine.easeOut', onComplete: () => ring.destroy() });
      }
    }
  }

  private spawnSpecialRain(colors: ReturnType<typeof getWeaponColors>, count: number, color: number): void {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(28, 372);
      const y = Phaser.Math.Between(-70, 110);
      const shard = this.add.triangle(x, y, 0, -18, 10, 18, -10, 18, i % 2 === 0 ? color : colors.bullet, 0.78).setDepth(15);
      shard.setBlendMode(Phaser.BlendModes.ADD);
      shard.setAngle(Phaser.Math.Between(-22, 22));
      this.tweens.add({
        targets: shard,
        y: y + Phaser.Math.Between(260, 430),
        x: x + Phaser.Math.Between(-42, 42),
        scale: 2.1,
        alpha: 0,
        duration: 380 + (i % 5) * 42,
        ease: 'Cubic.easeIn',
        onComplete: () => shard.destroy(),
      });
    }
  }

  private spawnReaperScythes(colors: ReturnType<typeof getWeaponColors>): void {
    const sweeps = [
      { y: this.player.y - 154, angle: -54, dir: 1 },
      { y: this.player.y - 250, angle: 54, dir: -1 },
      { y: this.player.y - 64, angle: -18, dir: 1 },
    ];
    sweeps.forEach((sweep, index) => {
      const shaft = this.add.rectangle(sweep.dir > 0 ? -40 : 440, sweep.y, 18, 260, colors.primary, 0.78).setDepth(17);
      const blade = this.add.arc(sweep.dir > 0 ? -42 : 442, sweep.y - 68, 74, 208, 342, false, colors.bullet, 0.86).setDepth(18);
      const edge = this.add.arc(sweep.dir > 0 ? -42 : 442, sweep.y - 68, 92, 210, 338, false, 0xffffff, 0.7).setDepth(19);
      [shaft, blade, edge].forEach((part) => {
        part.setBlendMode(Phaser.BlendModes.ADD);
        part.setAngle(sweep.angle);
      });
      this.time.delayedCall(index * 70, () => {
        this.tweens.add({
          targets: [shaft, blade, edge],
          x: sweep.dir > 0 ? 460 : -60,
          y: `+=${sweep.dir * 36}`,
          angle: `+=${sweep.dir * 34}`,
          alpha: 0,
          duration: 520,
          ease: 'Cubic.easeOut',
          onComplete: () => { shaft.destroy(); blade.destroy(); edge.destroy(); },
        });
      });
    });
    const omen = this.add.circle(this.player.x, this.player.y - 92, 38, colors.primary, 0).setStrokeStyle(8, colors.secondary, 0.92).setDepth(17);
    omen.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: omen, scaleX: 7, scaleY: 1.8, angle: 180, alpha: 0, duration: 520, ease: 'Cubic.easeOut', onComplete: () => omen.destroy() });
    this.showFlash('REAPER SCYTHE', '#f0abfc', this.player.x, this.player.y - 142);
  }

  private spawnSpecialOrbitals(colors: ReturnType<typeof getWeaponColors>, count: number, radius: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + this.stageTimer * 0.006;
      const orb = this.add.circle(this.player.x + Math.cos(angle) * radius, this.player.y - 46 + Math.sin(angle) * radius * 0.62, 10 + (i % 3) * 3, i % 2 === 0 ? colors.secondary : colors.bullet, 0.72).setDepth(16);
      orb.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: orb,
        x: this.player.x + Math.cos(angle + 1.8) * (radius + 110),
        y: this.player.y - 46 + Math.sin(angle + 1.8) * (radius + 90),
        scale: 3.2,
        alpha: 0,
        duration: 430 + (i % 4) * 48,
        ease: 'Cubic.easeOut',
        onComplete: () => orb.destroy(),
      });
    }
  }

  private getWeaponSpecialStyle(): SpecialStyle {
    const branchStyle = getEvolutionBranch(this.evolutionPath.at(-1))?.specialStyle;
    if (branchStyle) {
      return branchStyle;
    }
    if (['blade', 'saber', 'samurai'].includes(this.stats.archetype)) return 'blade';
    if (['anchor', 'kraken', 'gigas', 'atlas', 'hammer'].includes(this.stats.archetype)) return 'anchor';
    if (['basilisk', 'chimera', 'onyx', 'phantom'].includes(this.stats.archetype) || this.stats.element === 'shadow') return 'basilisk';
    if (['rune', 'oracle', 'seraph'].includes(this.stats.archetype) || this.stats.element === 'light') return 'rune';
    if (this.stats.element === 'fire' || this.stats.archetype === 'phoenix') return 'phoenix';
    if (this.stats.element === 'thunder' || this.stats.archetype === 'levin') return 'storm';
    if (this.stats.element === 'ice' || this.stats.element === 'crystal' || ['lance', 'geode', 'aurora'].includes(this.stats.archetype)) return 'frost';
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
      const build = this.add.text(200, 360, `${this.lockedWeaponTitle}\nBUILD ${getBuildRank(this.stats)} / MASTERY ${this.evolutionCount} / MEDAL ${this.medalCount}`, {
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

  private showRareEvolution(color: number, label = 'RARE EVOLUTION'): void {
    const { width, height } = this.scale;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, color, 0.18).setDepth(28);
    const ring = this.add.circle(this.player.x, this.player.y, 42, color, 0).setStrokeStyle(4, color, 0.9).setDepth(29);
    this.showFlash(label, '#fef3c7', this.player.x, this.player.y - 104);
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

  private showEvolutionCutIn(title: string, subtitle: string, color: number): void {
    const { width, height } = this.scale;
    const band = this.add.rectangle(width / 2, height * 0.32, width + 120, 104, 0x020617, 0.88).setDepth(38);
    band.setStrokeStyle(3, color, 0.9);
    const flare = this.add.rectangle(width / 2, height * 0.32, width + 160, 12, color, 0.7).setDepth(39).setBlendMode(Phaser.BlendModes.ADD);
    const titleText = this.add.text(width / 2, height * 0.29, title, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 7,
    }).setOrigin(0.5).setDepth(40);
    const subtitleText = this.add.text(width / 2, height * 0.35, subtitle, {
      fontSize: '13px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(40);

    for (let i = 0; i < 14; i++) {
      const slash = this.add.rectangle(-40 + i * 34, height * 0.32 + Phaser.Math.Between(-42, 42), 6, 150, i % 2 === 0 ? color : 0xffffff, 0.52).setAngle(68).setDepth(39);
      slash.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: slash, x: slash.x + width + 160, alpha: 0, duration: 520 + i * 18, ease: 'Cubic.easeOut', onComplete: () => slash.destroy() });
    }

    this.cameras.main.shake(280, 0.0038);
    this.tweens.add({ targets: flare, x: width + 120, alpha: 0, scaleX: 2.4, duration: 540, ease: 'Cubic.easeOut', onComplete: () => flare.destroy() });
    this.tweens.add({ targets: [band, titleText, subtitleText], x: '+=0', alpha: 0, delay: 820, duration: 360, ease: 'Sine.easeIn', onComplete: () => { band.destroy(); titleText.destroy(); subtitleText.destroy(); } });
  }

  private playUpgradeSound(kind: GateOption['kind']): void {
    this.playSoundProfile(getUpgradeProfile(kind));
  }

  private playRareSound(): void {
    this.playSoundProfile(RARE_SOUND_PROFILE);
  }

  private playSoundProfile(profile: SoundProfile): void {
    profile.steps.forEach((step) => {
      this.time.delayedCall(step.delay ?? 0, () => this.playTone(step.frequency, step.duration, step.volume, step.wave));
    });
  }

  private playTone(frequency: number, duration: number, volume: number, wave: OscillatorType = 'triangle'): void {
    try {
      this.audioContext ??= new AudioContext();
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.type = wave;
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
    this.time.timeScale = 1;
    this.physics.world.timeScale = 1;
    this.physics.pause();
    const bestDistance = saveBestDistance(this.distance);
    const finalWeaponName = this.lockedWeaponTitle;
    const leaderboardResult = recordLeaderboard(this.distance, finalWeaponName);
    const meta = recordRun({
      distance: this.distance,
      bosses: this.defeatedBossKeys,
      weaponName: finalWeaponName,
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
      weaponName: finalWeaponName,
      medals: meta.medals,
      defeatedBosses: this.defeatedBossKeys.length,
      totalBosses: meta.totalBossKills,
      evolutions: this.evolutionCount,
      codexBosses: meta.bosses.length,
      codexWeapons: meta.weapons.length,
      leaderboard: leaderboardResult.leaderboard,
      rankUpdated: leaderboardResult.updated,
    });
  }
}
