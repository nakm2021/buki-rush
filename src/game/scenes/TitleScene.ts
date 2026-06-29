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
    this.add.text(width / 2, 456, `PC: 矢印/WASD / スマホ: ドラッグ移動\nスタート時にブキを選択 / 撃破で少し成長\nメダル ${meta.medals}  永続RANK ${meta.permanentRank}\n図鑑 B${meta.bosses.length}/W${meta.weapons.length}`, {
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
    const nameButton = this.add.rectangle(width / 2, 462, 226, 42, 0x172554, 0.96);
    nameButton.setStrokeStyle(2, 0x38bdf8, 0.76);
    const nameText = this.add.text(width / 2, 462, 'PLAYER名を切替', {
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
    const overlay = this.add.container(0, 0, [veil, panel, title, mode, ...rows, nameButton, nameText, close]).setDepth(50);
    nameButton.setInteractive({ useHandCursor: true });
    nameButton.on('pointerdown', () => {
      const nextName = window.prompt('ランキングに表示するPLAYER名を入力してください', current.playerName);
      if (nextName === null) {
        return;
      }
      current = saveSettings({ playerName: nextName });
      mode.setText(`PLAYER: ${current.playerName}  MODE: LOCAL`);
    });
    close.setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => overlay.destroy());
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
