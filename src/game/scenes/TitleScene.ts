import Phaser from 'phaser';
import { TITLE_BACKGROUND_ASSET } from '../systems/AssetCatalog';
import { loadLeaderboard, loadSettings, saveSettings } from '../systems/RecordSystem';

export default class TitleScene extends Phaser.Scene {
  private startRequested = false;

  constructor() {
    super('TitleScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.drawBackground(width, height);
    this.createBerryAtmosphere(width, height);

    for (let y = 0; y < height; y += 44) {
      this.add.line(width / 2, y, -158, 0, 158, 0, 0xfff1d6, 0.05);
    }

    [72, 136, 200, 264, 328].forEach((x) => {
      this.add.line(x, height / 2, 0, 0, 0, height, 0xffc2c7, x === 200 ? 0.08 : 0.04).setLineWidth(x === 200 ? 3 : 1);
    });

    this.createStrawberryBackdrop(width / 2, 205);
    this.createCuteTitle(width / 2, 126);

    const subtitlePlate = this.add.rectangle(width / 2, 190, 214, 24, 0x641018, 0.34);
    subtitlePlate.setStrokeStyle(1, 0xffccd5, 0.38);
    const subtitle = this.add.text(width / 2, 190, '選んだブキで甘く走り切る', {
      fontSize: '14px',
      color: '#fff8db',
      fontStyle: 'bold',
      fontFamily: '"Arial Rounded MT Bold", "Hiragino Maru Gothic ProN", "Yu Gothic", Arial, sans-serif',
      stroke: '#5b0b12',
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: [subtitlePlate, subtitle],
      y: '+=3',
      duration: 1460,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const specialGlow = this.add.ellipse(width / 2, 316, 326, 70, 0xff4770, 0.18);
    specialGlow.setBlendMode(Phaser.BlendModes.ADD);
    const specialPanel = this.add.rectangle(width / 2, 316, 300, 50, 0x8f172a, 0.54);
    specialPanel.setStrokeStyle(2, 0xfff0b3, 0.76);
    const specialLine = this.add.rectangle(width / 2, 342, 104, 4, 0xfff0b3, 0.84);
    specialLine.setBlendMode(Phaser.BlendModes.ADD);
    const specialText = this.add.text(width / 2, 316, '必殺ゲージ 100% でダブルタップ', {
      fontSize: '16px',
      color: '#fff1a8',
      fontStyle: 'bold',
      fontFamily: '"Arial Rounded MT Bold", "Hiragino Maru Gothic ProN", "Yu Gothic", Arial, sans-serif',
      stroke: '#6d0b16',
      strokeThickness: 5,
    }).setOrigin(0.5);
    for (let i = 0; i < 10; i++) {
      const seed = this.add.ellipse(58 + i * 32, 300 + (i % 3) * 15, 4, 8, i % 2 === 0 ? 0xfff4b8 : 0xf8c75f, 0.38).setAngle(-18 + i * 7);
      seed.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: seed,
        x: seed.x + 22,
        y: seed.y - 8,
        alpha: { from: 0.12, to: 0.72 },
        scale: { from: 0.75, to: 1.35 },
        duration: 960 + i * 58,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
    this.tweens.add({
      targets: [specialGlow, specialPanel, specialText],
      alpha: { from: 0.7, to: 1 },
      scale: { from: 1, to: 1.025 },
      duration: 1180,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: specialLine,
      scaleX: { from: 0.45, to: 2.4 },
      alpha: { from: 0.2, to: 0.92 },
      duration: 980,
      yoyo: true,
      repeat: -1,
      ease: 'Cubic.easeInOut',
    });

    this.startRequested = false;
    this.createStrawberryStartButton(width / 2, height - 132);
    this.input.keyboard?.once('keydown-ENTER', () => this.requestStart());

    const settings = this.add.text(width / 2, height - 72, 'RANKING / SETTINGS', {
      fontSize: '13px',
      color: '#fff1bd',
      fontStyle: 'bold',
      fontFamily: '"Arial Rounded MT Bold", "Hiragino Maru Gothic ProN", "Yu Gothic", Arial, sans-serif',
      stroke: '#5b0b12',
      strokeThickness: 3,
    }).setOrigin(0.5);
    settings.setInteractive({ useHandCursor: true });
    settings.on('pointerdown', () => this.showSettingsOverlay());
  }

  private createStrawberryStartButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    container.setDepth(20);
    const glow = this.add.ellipse(0, 4, 292, 96, 0xff4770, 0.24);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    const body = this.add.ellipse(0, 6, 248, 72, 0xe11d48, 0.98);
    body.setStrokeStyle(5, 0xfff0b3, 0.98);
    const lower = this.add.triangle(0, 44, -92, -22, 92, -22, 0, 30, 0xb7132d, 0.98);
    lower.setStrokeStyle(4, 0xffc2c7, 0.52);
    const shade = this.add.ellipse(28, 18, 174, 44, 0x7f0d1b, 0.3);
    const shine = this.add.ellipse(-58, -8, 58, 14, 0xffffff, 0.34).setAngle(-14);
    shine.setBlendMode(Phaser.BlendModes.ADD);
    const leaves = [-58, -24, 10, 44, 78].map((leafX, index) => {
      const leaf = this.add.triangle(leafX, -40 + (index % 2) * 4, 0, -18, 42, 0, 0, 18, index % 2 === 0 ? 0x2f9e44 : 0x8ce99a, 0.92);
      leaf.setAngle(-42 + index * 20);
      leaf.setBlendMode(Phaser.BlendModes.ADD);
      return leaf;
    });
    const seeds = Array.from({ length: 18 }, (_, index) => {
      const row = Math.floor(index / 6);
      const col = index % 6;
      const seed = this.add.ellipse(-86 + col * 34 + (row % 2) * 17, -10 + row * 18, 4, 9, index % 2 === 0 ? 0xfff4b8 : 0xf7c85b, 0.78);
      seed.setAngle(-16 + col * 7);
      seed.setBlendMode(Phaser.BlendModes.ADD);
      return seed;
    });
    const textShadow = this.add.text(3, 9, 'START', {
      fontSize: '31px',
      color: '#5b0b12',
      fontStyle: 'bold',
      fontFamily: '"Arial Rounded MT Bold", "Hiragino Maru Gothic ProN", "Yu Gothic", Arial, sans-serif',
    }).setOrigin(0.5).setAlpha(0.82);
    const text = this.add.text(0, 2, 'START', {
      fontSize: '31px',
      color: '#fff7d6',
      fontStyle: 'bold',
      fontFamily: '"Arial Rounded MT Bold", "Hiragino Maru Gothic ProN", "Yu Gothic", Arial, sans-serif',
      stroke: '#9f1239',
      strokeThickness: 7,
    }).setOrigin(0.5);

    container.add([glow, lower, body, shade, shine, ...leaves, ...seeds, textShadow, text]);
    container.setSize(320, 132);
    container.setInteractive(new Phaser.Geom.Rectangle(-160, -66, 320, 132), Phaser.Geom.Rectangle.Contains);

    this.tweens.add({
      targets: container,
      scaleX: { from: 1, to: 1.045 },
      scaleY: { from: 1, to: 0.985 },
      y: y - 5,
      duration: 980,
      yoyo: true,
      repeat: -1,
      ease: 'Back.easeInOut',
    });
    this.tweens.add({
      targets: shine,
      x: 62,
      alpha: { from: 0.1, to: 0.62 },
      duration: 1280,
      repeat: -1,
      repeatDelay: 480,
      ease: 'Cubic.easeInOut',
    });
    seeds.forEach((seed, index) => {
      this.tweens.add({
        targets: seed,
        alpha: { from: 0.38, to: 0.92 },
        scale: { from: 0.9, to: 1.28 },
        duration: 820 + index * 25,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    const hitTarget = this.add.rectangle(x, y, 336, 144, 0xffffff, 0.001).setDepth(21);
    hitTarget.setInteractive({ useHandCursor: true });
    const press = () => {
      this.tweens.killTweensOf(container);
      container.setScale(0.96, 0.94);
      glow.setAlpha(0.48);
      text.setColor('#ffffff');
      this.requestStart();
    };
    const release = () => {
      container.setScale(1.04, 1);
    };
    const cancel = () => {
      if (!this.startRequested) {
        container.setScale(1);
        glow.setAlpha(1);
        text.setColor('#fff7d6');
      }
    };
    [container, hitTarget].forEach((target) => {
      target.on('pointerdown', press);
      target.on('pointerup', release);
      target.on('pointerout', cancel);
      target.on('pointerupoutside', cancel);
    });
    return container;
  }

  private requestStart(): void {
    if (this.startRequested) {
      return;
    }
    this.startRequested = true;
    this.scene.start('LoadingScene');
  }

  private createCuteTitle(x: number, y: number): void {
    const titleGlow = this.add.ellipse(x, y + 18, 348, 132, 0xff3f65, 0.24);
    titleGlow.setBlendMode(Phaser.BlendModes.ADD);
    const berryBack = this.add.ellipse(x, y + 22, 302, 118, 0xe11d48, 0.52);
    berryBack.setStrokeStyle(5, 0xfff0b3, 0.7);
    const berryShade = this.add.ellipse(x + 22, y + 28, 258, 82, 0x6d0b16, 0.24);
    const cream = this.add.ellipse(x - 6, y + 13, 276, 76, 0xfff4d4, 0.16);
    const jamPlate = this.add.rectangle(x, y + 18, 304, 74, 0x8f172a, 0.12);
    jamPlate.setStrokeStyle(1, 0xffd0d7, 0.18);

    const title = 'ブキラッシュ';
    const chars = [...title];
    const spacing = 37;
    const startX = x - ((chars.length - 1) * spacing) / 2;
    const letters: Phaser.GameObjects.Text[] = [];
    chars.forEach((char, index) => {
      const shadow = this.add.text(startX + index * spacing + 3, y + 6 + (index % 2 === 0 ? -2 : 2), char, {
        fontSize: index === 0 ? '47px' : '43px',
        color: '#6d0b16',
        fontStyle: 'bold',
        fontFamily: '"Arial Rounded MT Bold", "Hiragino Maru Gothic ProN", "Yu Gothic", Arial, sans-serif',
      }).setOrigin(0.5);
      shadow.setAlpha(0.64);
      const letter = this.add.text(startX + index * spacing, y + (index % 2 === 0 ? -2 : 2), char, {
        fontSize: index === 0 ? '47px' : '43px',
        color: index % 2 === 0 ? '#fff3cf' : '#fffb8f',
        fontStyle: 'bold',
        fontFamily: '"Arial Rounded MT Bold", "Hiragino Maru Gothic ProN", "Yu Gothic", Arial, sans-serif',
        stroke: '#b7132d',
        strokeThickness: 8,
      }).setOrigin(0.5);
      letters.push(letter);
      letters.push(shadow);
      if (index % 2 === 0) {
        const highlight = this.add.ellipse(letter.x - 6, letter.y - 14, 10, 4, 0xffffff, 0.44).setAngle(-18);
        highlight.setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
          targets: highlight,
          alpha: { from: 0.18, to: 0.6 },
          scaleX: { from: 0.7, to: 1.25 },
          duration: 900 + index * 80,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
      this.tweens.add({
        targets: [letter, shadow],
        y: '-=6',
        angle: index % 2 === 0 ? -2 : 2,
        scale: { from: 1, to: 1.055 },
        duration: 760 + index * 58,
        delay: index * 46,
        yoyo: true,
        repeat: -1,
        ease: 'Back.easeInOut',
      });
    });

    const leafLeft = this.add.triangle(x - 112, y - 62, 0, -15, 42, 0, 0, 16, 0x2f9e44, 0.88).setAngle(-24);
    const leafRight = this.add.triangle(x + 118, y - 58, 0, -14, 42, 0, 0, 16, 0x8ce99a, 0.82).setAngle(204);
    const leafTop = this.add.triangle(x + 10, y - 74, 0, -17, 46, 0, 0, 18, 0x37b24d, 0.88).setAngle(92);
    const leafTiny = this.add.triangle(x - 18, y - 68, 0, -12, 34, 0, 0, 14, 0xb2f2bb, 0.74).setAngle(118);
    [leafLeft, leafRight, leafTop, leafTiny].forEach((leaf, index) => {
      leaf.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: leaf,
        angle: leaf.angle + (index === 0 ? -10 : 10),
        y: leaf.y - 4,
        duration: 1100 + index * 180,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    for (let i = 0; i < 24; i++) {
      const seedX = x - 128 + (i % 8) * 37;
      const seedY = y - 30 + Math.floor(i / 8) * 33 + (i % 2) * 7;
      const seed = this.add.ellipse(seedX, seedY, 4, 9, i % 3 === 0 ? 0xfff4b8 : 0xf6c85f, 0.4).setAngle(18);
      seed.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: seed,
        alpha: { from: 0.18, to: 0.78 },
        scale: { from: 0.8, to: 1.25 },
        y: seed.y - 6,
        duration: 840 + (i % 5) * 120,
        delay: i * 35,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    const shine = this.add.rectangle(x - 138, y + 26, 52, 6, 0xffffff, 0.32).setAngle(-12);
    shine.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: shine,
      x: x + 132,
      alpha: { from: 0, to: 0.52 },
      scaleX: { from: 0.35, to: 1.25 },
      duration: 1520,
      repeat: -1,
      repeatDelay: 680,
      ease: 'Cubic.easeInOut',
    });

    this.tweens.add({
      targets: [berryBack, berryShade, titleGlow, cream, jamPlate],
      alpha: { from: 0.2, to: 0.48 },
      scaleX: { from: 1, to: 1.025 },
      duration: 1280,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createStrawberryBackdrop(x: number, y: number): void {
    const body = this.add.ellipse(x, y + 20, 344, 370, 0xc41230, 0.28);
    const cheek = this.add.ellipse(x - 54, y - 28, 116, 150, 0xff8fa3, 0.18);
    const bottom = this.add.triangle(x, y + 226, -150, -88, 150, -88, 0, 54, 0xa40f24, 0.24);
    const leafBase = this.add.ellipse(x, y - 174, 154, 38, 0x2f9e44, 0.34);
    [body, cheek, bottom, leafBase].forEach((object) => object.setBlendMode(Phaser.BlendModes.ADD));
    for (let i = 0; i < 42; i++) {
      const col = i % 7;
      const row = Math.floor(i / 7);
      const seed = this.add.ellipse(x - 126 + col * 42 + (row % 2) * 20, y - 112 + row * 46, 5, 11, i % 2 === 0 ? 0xfff4b8 : 0xf6c85f, 0.28);
      seed.setAngle(-22 + col * 7);
      seed.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: seed,
        alpha: { from: 0.12, to: 0.46 },
        scaleY: { from: 0.8, to: 1.2 },
        duration: 1200 + i * 18,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
    for (let i = 0; i < 5; i++) {
      const leaf = this.add.triangle(x - 76 + i * 38, y - 180, 0, -18, 58, 0, 0, 22, i % 2 === 0 ? 0x51cf66 : 0xb2f2bb, 0.44);
      leaf.setAngle(-52 + i * 26);
      leaf.setBlendMode(Phaser.BlendModes.ADD);
    }
  }

  private createBerryAtmosphere(width: number, height: number): void {
    const wash = this.add.rectangle(width / 2, height / 2, width, height, 0xff5b6f, 0.1);
    wash.setBlendMode(Phaser.BlendModes.ADD);
    const syrup = this.add.rectangle(width / 2, height - 72, width, 158, 0x520916, 0.34);
    syrup.setBlendMode(Phaser.BlendModes.MULTIPLY);

    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(18, width - 18);
      const y = Phaser.Math.Between(8, height - 120);
      const seed = this.add.ellipse(x, y, 3.5, 8, i % 2 === 0 ? 0xfff0a8 : 0xf7c85b, 0.22).setAngle(Phaser.Math.Between(-26, 26));
      seed.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: seed,
        y: y + Phaser.Math.Between(18, 46),
        x: x + Phaser.Math.Between(-14, 14),
        alpha: { from: 0.08, to: 0.42 },
        duration: Phaser.Math.Between(1800, 3200),
        delay: i * 120,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    for (let i = 0; i < 7; i++) {
      const leaf = this.add.triangle(Phaser.Math.Between(22, width - 22), Phaser.Math.Between(34, 170), 0, -8, 26, 0, 0, 10, i % 2 === 0 ? 0x8ce99a : 0x51cf66, 0.48);
      leaf.setAngle(Phaser.Math.Between(-40, 40));
      leaf.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: leaf,
        y: leaf.y + Phaser.Math.Between(8, 26),
        angle: leaf.angle + Phaser.Math.Between(-18, 18),
        alpha: { from: 0.18, to: 0.62 },
        duration: 1600 + i * 180,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private showSettingsOverlay(): void {
    const { width, height } = this.scale;
    let current = loadSettings();
    const leaderboard = loadLeaderboard();
    const renderLabels: Record<typeof current.renderMode, string> = {
      auto: '自動',
      lite: '軽量',
      standard: '標準',
      flashy: '派手',
    };
    const renderModes: typeof current.renderMode[] = ['auto', 'lite', 'standard', 'flashy'];
    const veil = this.add.rectangle(width / 2, height / 2, width, height, 0x020617, 0.78);
    const panel = this.add.rectangle(width / 2, height / 2, 336, 548, 0x111827, 0.97);
    panel.setStrokeStyle(2, 0xfff176, 0.74);
    const title = this.add.text(width / 2, 144, 'RANKING / SETTINGS', {
      fontSize: '21px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 5,
    }).setOrigin(0.5);
    const mode = this.add.text(width / 2, 180, `PLAYER: ${current.playerName}  MODE: LOCAL`, {
      fontSize: '12px',
      color: '#bfdbfe',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    const rows = (leaderboard.length > 0 ? leaderboard : [{ playerName: '-', distance: 0, weaponName: 'NO RECORD', recordedAt: '' }]).slice(0, 5).map((entry, index) => {
      return this.add.text(width / 2, 220 + index * 30, `${index + 1}. ${entry.playerName}  ${entry.distance}m  ${entry.weaponName}`, {
        fontSize: '12px',
        color: index === 0 ? '#fef08a' : '#f8fafc',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0.5);
    });
    const controls = this.add.text(width / 2, 392, '操作: PC 矢印/WASD\nスマホ ドラッグ移動 / ダブルタップ 必殺', {
      fontSize: '12px',
      color: '#dcfce7',
      align: 'center',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 5,
      stroke: '#020617',
      strokeThickness: 3,
    }).setOrigin(0.5);
    const currentName = this.add.text(width / 2, 438, `現在の名前: ${current.playerName}`, {
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 3,
    }).setOrigin(0.5);
    const renderButton = this.add.rectangle(width / 2, 476, 226, 36, 0x1e1b4b, 0.96);
    renderButton.setStrokeStyle(2, 0xa78bfa, 0.76);
    const renderText = this.add.text(width / 2, 476, `描画: ${renderLabels[current.renderMode]}`, {
      fontSize: '13px',
      color: '#ede9fe',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    const debugButton = this.add.rectangle(width / 2, 518, 226, 36, 0x083344, 0.96);
    debugButton.setStrokeStyle(2, 0x22d3ee, 0.76);
    const debugText = this.add.text(width / 2, 518, `デバッグ表示: ${current.debugHud ? 'ON' : 'OFF'}`, {
      fontSize: '13px',
      color: '#cffafe',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    const nameButton = this.add.rectangle(width / 2, 560, 226, 36, 0x172554, 0.96);
    nameButton.setStrokeStyle(2, 0x38bdf8, 0.76);
    const nameText = this.add.text(width / 2, 560, 'PLAYER名を変更', {
      fontSize: '13px',
      color: '#e0f2fe',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    const close = this.add.text(width / 2, 620, 'CLOSE', {
      fontSize: '15px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    const overlay = this.add.container(0, 0, [veil, panel, title, mode, ...rows, controls, currentName, renderButton, renderText, debugButton, debugText, nameButton, nameText, close]).setDepth(50);
    renderButton.setInteractive({ useHandCursor: true });
    renderButton.on('pointerdown', () => {
      const nextIndex = (renderModes.indexOf(current.renderMode) + 1) % renderModes.length;
      current = saveSettings({ renderMode: renderModes[nextIndex] });
      renderText.setText(`描画: ${renderLabels[current.renderMode]}`);
    });
    debugButton.setInteractive({ useHandCursor: true });
    debugButton.on('pointerdown', () => {
      current = saveSettings({ debugHud: !current.debugHud });
      debugText.setText(`デバッグ表示: ${current.debugHud ? 'ON' : 'OFF'}`);
    });
    nameButton.setInteractive({ useHandCursor: true });
    nameButton.on('pointerdown', () => {
      this.openPlayerNameEditor(current.playerName, (nextName) => {
        current = saveSettings({ playerName: nextName });
        mode.setText(`PLAYER: ${current.playerName}  MODE: LOCAL`);
        currentName.setText(`現在の名前: ${current.playerName}`);
      });
    });
    close.setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => overlay.destroy());
  }

  private openPlayerNameEditor(currentName: string, onSave: (name: string) => void): void {
    const existing = document.getElementById('player-name-editor');
    if (existing) {
      existing.remove();
    }

    const editor = document.createElement('div');
    editor.id = 'player-name-editor';
    editor.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:3000',
      'display:grid',
      'place-items:center',
      'background:rgba(2,6,23,0.78)',
      'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    ].join(';');

    const panel = document.createElement('div');
    panel.style.cssText = [
      'width:min(320px,86vw)',
      'box-sizing:border-box',
      'padding:22px',
      'border:2px solid rgba(254,240,138,0.86)',
      'border-radius:8px',
      'background:#111827',
      'box-shadow:0 22px 60px rgba(0,0,0,0.42)',
      'color:#f8fafc',
      'text-align:center',
    ].join(';');

    const title = document.createElement('div');
    title.textContent = 'PLAYER名';
    title.style.cssText = 'font-size:20px;font-weight:900;color:#fef3c7;margin-bottom:14px';

    const input = document.createElement('input');
    input.value = currentName;
    input.maxLength = 12;
    input.autocomplete = 'off';
    input.inputMode = 'text';
    input.style.cssText = [
      'width:100%',
      'box-sizing:border-box',
      'height:44px',
      'padding:0 12px',
      'border:2px solid #38bdf8',
      'border-radius:6px',
      'background:#020617',
      'color:#ffffff',
      'font-size:18px',
      'font-weight:800',
      'text-align:center',
      'outline:none',
    ].join(';');

    const actions = document.createElement('div');
    actions.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px';

    const save = document.createElement('button');
    save.textContent = '保存';
    save.style.cssText = 'height:42px;border:0;border-radius:6px;background:#fef08a;color:#422006;font-weight:900;font-size:15px';

    const cancel = document.createElement('button');
    cancel.textContent = 'キャンセル';
    cancel.style.cssText = 'height:42px;border:1px solid #64748b;border-radius:6px;background:#1e293b;color:#e2e8f0;font-weight:800;font-size:15px';

    const closeEditor = (): void => editor.remove();
    const saveName = (): void => {
      onSave(input.value);
      closeEditor();
    };

    save.addEventListener('click', saveName);
    cancel.addEventListener('click', closeEditor);
    input.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Enter') {
        saveName();
      }
      if (event.key === 'Escape') {
        closeEditor();
      }
    });

    actions.append(save, cancel);
    panel.append(title, input, actions);
    editor.append(panel);
    document.body.append(editor);
    window.setTimeout(() => {
      input.focus();
      input.select();
    }, 0);
  }

  private drawBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, 0x2a0d08, 1);

    if (this.textures.exists(TITLE_BACKGROUND_ASSET.key)) {
      this.add.image(width / 2, height / 2, TITLE_BACKGROUND_ASSET.key).setDisplaySize(width, height);
    }

    this.add.rectangle(width / 2, height / 2, width, height, 0x2a0d08, 0.18);
    this.add.rectangle(width / 2, height / 2, width, height, 0x020617, 0.1);
    this.add.rectangle(width / 2, 108, width, 216, 0x3f120b, 0.22);
    this.add.rectangle(width / 2, height - 94, width, 188, 0x160a08, 0.46);
  }
}
