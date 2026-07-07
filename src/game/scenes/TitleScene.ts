import Phaser from 'phaser';
import { TITLE_BACKGROUND_ASSET } from '../systems/AssetCatalog';
import { loadLeaderboard, loadSettings, saveSettings } from '../systems/RecordSystem';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.drawBackground(width, height);

    for (let y = 0; y < height; y += 42) {
      this.add.line(width / 2, y, -154, 0, 154, 0, 0xffffff, 0.07);
    }

    [64, 132, 200, 268, 336].forEach((x) => {
      this.add.line(x, height / 2, 0, 0, 0, height, 0xffffff, x === 200 ? 0.13 : 0.07).setLineWidth(x === 200 ? 3 : 1);
    });

    this.createCuteTitle(width / 2, 132);

    this.add.text(width / 2, 186, '選んだブキで走り切る', {
      fontSize: '14px',
      color: '#fff7ed',
      fontFamily: 'Arial, sans-serif',
      stroke: '#4a0f09',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const specialGlow = this.add.rectangle(width / 2, 316, 310, 58, 0xffef5f, 0.12);
    specialGlow.setBlendMode(Phaser.BlendModes.ADD);
    const specialPanel = this.add.rectangle(width / 2, 316, 296, 48, 0x7f1d1d, 0.38);
    specialPanel.setStrokeStyle(1, 0xfff176, 0.64);
    const specialLine = this.add.rectangle(width / 2, 342, 92, 3, 0xfff176, 0.78);
    specialLine.setBlendMode(Phaser.BlendModes.ADD);
    const specialText = this.add.text(width / 2, 316, '必殺ゲージ 100% でダブルタップ', {
      fontSize: '17px',
      color: '#fff7ad',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#5f160f',
      strokeThickness: 5,
    }).setOrigin(0.5);
    for (let i = 0; i < 7; i++) {
      const spark = this.add.circle(72 + i * 42, 316 + (i % 2) * 18, 2.4, 0xfff176, 0.36);
      spark.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: spark,
        x: spark.x + 32,
        alpha: { from: 0.15, to: 0.72 },
        scale: { from: 0.8, to: 1.5 },
        duration: 980 + i * 70,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
    this.tweens.add({
      targets: [specialGlow, specialPanel, specialText],
      alpha: { from: 0.68, to: 1 },
      duration: 1200,
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

    const button = this.add.rectangle(width / 2, height - 132, 236, 60, 0x12233f, 0.96);
    button.setStrokeStyle(3, 0xfff176, 0.92);
    this.add.text(width / 2, height - 132, 'START', {
      fontSize: '18px',
      color: '#eff6ff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => this.scene.start('LoadingScene'));
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('LoadingScene'));

    const settings = this.add.text(width / 2, height - 72, 'RANKING / SETTINGS', {
      fontSize: '13px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#4a0f09',
      strokeThickness: 3,
    }).setOrigin(0.5);
    settings.setInteractive({ useHandCursor: true });
    settings.on('pointerdown', () => this.showSettingsOverlay());
  }

  private createCuteTitle(x: number, y: number): void {
    const titleGlow = this.add.ellipse(x, y + 18, 320, 96, 0xff6b8a, 0.14);
    titleGlow.setBlendMode(Phaser.BlendModes.ADD);
    const softPlate = this.add.rectangle(x, y + 18, 300, 82, 0x4a0f09, 0.18);
    softPlate.setStrokeStyle(1, 0xfff1d6, 0.16);

    const title = 'ブキラッシュ';
    const chars = [...title];
    const spacing = 38;
    const startX = x - ((chars.length - 1) * spacing) / 2;
    const letters: Phaser.GameObjects.Text[] = [];
    chars.forEach((char, index) => {
      const letter = this.add.text(startX + index * spacing, y + (index % 2 === 0 ? -2 : 2), char, {
        fontSize: index === 0 ? '44px' : '41px',
        color: index % 2 === 0 ? '#fff7ed' : '#fef08a',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
        stroke: '#7f1d1d',
        strokeThickness: 6,
      }).setOrigin(0.5);
      letters.push(letter);
      this.tweens.add({
        targets: letter,
        y: letter.y - 6,
        angle: index % 2 === 0 ? -2 : 2,
        scale: { from: 1, to: 1.045 },
        duration: 820 + index * 52,
        delay: index * 46,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    const leafLeft = this.add.triangle(x - 132, y - 44, 0, -10, 28, 0, 0, 12, 0x22c55e, 0.72).setAngle(-26);
    const leafRight = this.add.triangle(x + 132, y - 42, 0, -10, 28, 0, 0, 12, 0x86efac, 0.68).setAngle(206);
    [leafLeft, leafRight].forEach((leaf, index) => {
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

    for (let i = 0; i < 10; i++) {
      const seedX = x - 132 + (i % 5) * 66;
      const seedY = y - 24 + Math.floor(i / 5) * 66 + (i % 2) * 8;
      const seed = this.add.ellipse(seedX, seedY, 4, 8, i % 3 === 0 ? 0xfff176 : 0xfacc15, 0.34).setAngle(18);
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

    const shine = this.add.rectangle(x - 132, y + 28, 46, 5, 0xffffff, 0.28).setAngle(-12);
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
      targets: [titleGlow, softPlate],
      alpha: { from: 0.14, to: 0.32 },
      scaleX: { from: 1, to: 1.025 },
      duration: 1280,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
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
