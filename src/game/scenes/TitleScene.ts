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

    const titleShadow = this.add.rectangle(width / 2, 152, 326, 104, 0x1f0906, 0.34);
    titleShadow.setStrokeStyle(2, 0xfff1d6, 0.22);
    this.add.text(width / 2, 132, 'ブキラッシュ', {
      fontSize: '46px',
      color: '#f8fafc',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#4a0f09',
      strokeThickness: 7,
    }).setOrigin(0.5);

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

  private showSettingsOverlay(): void {
    const { width, height } = this.scale;
    let current = loadSettings();
    const leaderboard = loadLeaderboard();
    const veil = this.add.rectangle(width / 2, height / 2, width, height, 0x020617, 0.78);
    const panel = this.add.rectangle(width / 2, height / 2, 336, 496, 0x111827, 0.97);
    panel.setStrokeStyle(2, 0xfff176, 0.74);
    const title = this.add.text(width / 2, 172, 'RANKING / SETTINGS', {
      fontSize: '21px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 5,
    }).setOrigin(0.5);
    const mode = this.add.text(width / 2, 210, `PLAYER: ${current.playerName}  MODE: LOCAL`, {
      fontSize: '12px',
      color: '#bfdbfe',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    const rows = (leaderboard.length > 0 ? leaderboard : [{ playerName: '-', distance: 0, weaponName: 'NO RECORD', recordedAt: '' }]).slice(0, 5).map((entry, index) => {
      return this.add.text(width / 2, 254 + index * 34, `${index + 1}. ${entry.playerName}  ${entry.distance}m  ${entry.weaponName}`, {
        fontSize: '12px',
        color: index === 0 ? '#fef08a' : '#f8fafc',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0.5);
    });
    const controls = this.add.text(width / 2, 422, '操作: PC 矢印/WASD\nスマホ ドラッグ移動 / ダブルタップ 必殺', {
      fontSize: '12px',
      color: '#dcfce7',
      align: 'center',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 5,
      stroke: '#020617',
      strokeThickness: 3,
    }).setOrigin(0.5);
    const currentName = this.add.text(width / 2, 470, `現在の名前: ${current.playerName}`, {
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 3,
    }).setOrigin(0.5);
    const nameButton = this.add.rectangle(width / 2, 510, 226, 42, 0x172554, 0.96);
    nameButton.setStrokeStyle(2, 0x38bdf8, 0.76);
    const nameText = this.add.text(width / 2, 510, 'PLAYER名を変更', {
      fontSize: '13px',
      color: '#e0f2fe',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    const close = this.add.text(width / 2, 568, 'CLOSE', {
      fontSize: '15px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    const overlay = this.add.container(0, 0, [veil, panel, title, mode, ...rows, controls, currentName, nameButton, nameText, close]).setDepth(50);
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
