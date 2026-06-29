import Phaser from 'phaser';
import { TITLE_BACKGROUND_ASSET } from '../systems/AssetCatalog';
import { loadLeaderboard, loadPlayerMeta, loadSettings, saveSettings } from '../systems/RecordSystem';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    const { width, height } = this.scale;
    const meta = loadPlayerMeta();
    const settingsState = loadSettings();
    this.drawBackground(width, height);

    for (let y = 0; y < height; y += 42) {
      this.add.line(width / 2, y, -154, 0, 154, 0, 0xffffff, 0.07);
    }

    [64, 132, 200, 268, 336].forEach((x) => {
      this.add.line(x, height / 2, 0, 0, 0, height, 0xffffff, x === 200 ? 0.13 : 0.07).setLineWidth(x === 200 ? 3 : 1);
    });

    const titleShadow = this.add.rectangle(width / 2, 144, 336, 92, 0x1f0906, 0.42);
    titleShadow.setStrokeStyle(2, 0xfff1d6, 0.26);
    this.add.text(width / 2, 132, 'ブキラッシュ', {
      fontSize: '44px',
      color: '#f8fafc',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#4a0f09',
      strokeThickness: 7,
    }).setOrigin(0.5);

    this.add.text(width / 2, 182, '属性・型・MODを重ねて無限強化', {
      fontSize: '14px',
      color: '#fff7ed',
      fontFamily: 'Arial, sans-serif',
      stroke: '#4a0f09',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const specialGlow = this.add.rectangle(width / 2, 326, 342, 82, 0xffef5f, 0.24);
    specialGlow.setBlendMode(Phaser.BlendModes.ADD);
    const specialPanel = this.add.rectangle(width / 2, 326, 326, 70, 0x7f1d1d, 0.84);
    specialPanel.setStrokeStyle(3, 0xfff176, 0.95);
    this.add.text(width / 2, 306, 'OD 100%でダブルタップ!', {
      fontSize: '22px',
      color: '#fff7ad',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#5f160f',
      strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(width / 2, 340, '撃破と時間経過で必殺技チャージ', {
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#5f160f',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: [specialGlow, specialPanel],
      alpha: { from: 0.72, to: 1 },
      scaleX: { from: 1, to: 1.035 },
      scaleY: { from: 1, to: 1.06 },
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const infoPanel = this.add.rectangle(width / 2, 456, 318, 108, 0x160a08, 0.72);
    infoPanel.setStrokeStyle(1, 0xffd199, 0.42);
    this.add.text(width / 2, 456, `PLAYER ${settingsState.playerName}\nPC: 矢印/WASD / スマホ: ドラッグ移動\nメダル ${meta.medals}  永続RANK ${meta.permanentRank}\n図鑑 B${meta.bosses.length}/W${meta.weapons.length}`, {
      fontSize: '13px',
      color: '#fff7ed',
      align: 'center',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 7,
    }).setOrigin(0.5);

    const button = this.add.rectangle(width / 2, height - 132, 236, 60, 0x12233f, 0.96);
    button.setStrokeStyle(3, 0xfff176, 0.92);
    this.add.text(width / 2, height - 132, 'START', {
      fontSize: '18px',
      color: '#eff6ff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => this.scene.start('WeaponSelectScene'));
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('WeaponSelectScene'));

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
    const panel = this.add.rectangle(width / 2, height / 2, 336, 438, 0x111827, 0.97);
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
    const currentName = this.add.text(width / 2, 424, `現在の名前: ${current.playerName}`, {
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 3,
    }).setOrigin(0.5);
    const nameButton = this.add.rectangle(width / 2, 464, 226, 42, 0x172554, 0.96);
    nameButton.setStrokeStyle(2, 0x38bdf8, 0.76);
    const nameText = this.add.text(width / 2, 464, 'PLAYER名を変更', {
      fontSize: '13px',
      color: '#e0f2fe',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    const close = this.add.text(width / 2, 522, 'CLOSE', {
      fontSize: '15px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    const overlay = this.add.container(0, 0, [veil, panel, title, mode, ...rows, currentName, nameButton, nameText, close]).setDepth(50);
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
