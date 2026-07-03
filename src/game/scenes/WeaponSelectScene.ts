import Phaser from 'phaser';
import { WEAPON_CATEGORIES, getStarterWeaponsByCategory } from '../systems/WeaponEvolution';
import type { StarterWeapon } from '../types/GameTypes';

export default class WeaponSelectScene extends Phaser.Scene {
  private content?: Phaser.GameObjects.Container;
  private selectedCategoryId = WEAPON_CATEGORIES[0]?.id ?? 'balance-bow';
  private selectedWeapon?: StarterWeapon;
  private weaponPage = 0;

  constructor() {
    super('WeaponSelectScene');
  }

  create(): void {
    this.drawBackground();
    this.renderCategorySelect();
  }

  private drawBackground(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x16051e, 1);
    this.add.rectangle(width / 2, height / 2, 354, height, 0x100f24, 0.82);
    for (let i = 0; i < 34; i++) {
      const x = 28 + (i * 57) % 344;
      const y = 24 + (i * 83) % 690;
      const mote = this.add.ellipse(x, y, 5 + (i % 3), 11 + (i % 4) * 3, i % 2 === 0 ? 0xfacc15 : 0x86efac, 0.22);
      mote.setAngle(i * 19);
      mote.setBlendMode(Phaser.BlendModes.ADD);
    }
  }

  private clearContent(): void {
    this.content?.destroy();
    this.content = this.add.container(0, 0);
  }

  private wrapText(text: string, maxChars: number): string {
    return text
      .split('\n')
      .flatMap((line) => {
        const chunks: string[] = [];
        for (let i = 0; i < line.length; i += maxChars) {
          chunks.push(line.slice(i, i + maxChars));
        }
        return chunks;
      })
      .join('\n');
  }

  private getCategoryCardDetail(categoryId: string): string {
    switch (categoryId) {
      case 'balance-bow':
        return '迷ったらこれ\n回避も火力も安定';
      case 'slash-speed':
        return '手数と会心\n素早い敵に強い';
      case 'cannon-barrage':
        return '重火力で押す\nBOSS戦向け';
      case 'guard-aegis':
        return '盾と回復\n事故に強い';
      case 'venom-curse':
        return '毒と遅延\n硬い敵に強い';
      case 'burst-pierce':
        return '直線貫通\n敵弾相殺向き';
      default:
        return '固定ブキで\n最後まで戦う';
    }
  }

  private renderCategorySelect(): void {
    this.clearContent();
    const { width, height } = this.scale;
    const content = this.content!;

    const titleBack = this.add.rectangle(width / 2, 58, 330, 62, 0x7f1d1d, 0.78);
    titleBack.setStrokeStyle(3, 0xfacc15, 0.78);
    const title = this.add.text(width / 2, 58, 'WEAPON TYPE', {
      fontSize: '27px',
      color: '#fef08a',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#7f1d1d',
      strokeThickness: 6,
    }).setOrigin(0.5);
    const guide = this.add.text(width / 2, 106, 'タイプを選ぶと、該当ブキの詳細一覧へ進みます', {
      fontSize: '11px',
      color: '#dcfce7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    content.add([titleBack, title, guide]);

    WEAPON_CATEGORIES.forEach((category, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 112 + col * 176;
      const y = 202 + row * 148;
      const card = this.add.rectangle(x, y, 160, 132, 0x111827, 0.94);
      card.setStrokeStyle(2, category.color, 0.68);
      const glow = this.add.circle(x, y - 30, 48, category.color, 0.14).setBlendMode(Phaser.BlendModes.ADD);
      const sampleWeapon = getStarterWeaponsByCategory(category.id)[0];
      const image = sampleWeapon && this.textures.exists(sampleWeapon.imageKey)
        ? this.add.image(x, y - 28, sampleWeapon.imageKey).setDisplaySize(56, 82)
        : this.add.rectangle(x, y - 28, 32, 78, category.color, 0.9);
      const titleText = this.add.text(x, y + 23, this.wrapText(category.title, 8), {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
        stroke: '#020617',
        strokeThickness: 3,
        align: 'center',
        fixedWidth: 138,
      }).setOrigin(0.5);
      const sub = this.add.text(x, y + 49, this.wrapText(category.subtitle, 11), {
        fontSize: '9px',
        color: '#fef3c7',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
        align: 'center',
        fixedWidth: 136,
        wordWrap: { width: 134, useAdvancedWrap: true },
      }).setOrigin(0.5);
      const detail = this.add.text(x, y + 78, this.getCategoryCardDetail(category.id), {
        fontSize: '8px',
        color: '#cbd5e1',
        fontFamily: 'Arial, sans-serif',
        align: 'center',
        fixedWidth: 138,
        lineSpacing: 2,
        wordWrap: { width: 136, useAdvancedWrap: true },
      }).setOrigin(0.5);
      content.add([card, glow, image, titleText, sub, detail]);

      card.setInteractive({ useHandCursor: true });
      card.on('pointerover', () => {
        card.setStrokeStyle(4, 0xfef08a, 1);
        glow.setAlpha(0.28);
      });
      card.on('pointerout', () => {
        card.setStrokeStyle(2, category.color, 0.68);
        glow.setAlpha(0.14);
      });
      card.on('pointerdown', () => {
        this.selectedCategoryId = category.id;
        this.weaponPage = 0;
        this.selectedWeapon = getStarterWeaponsByCategory(category.id)[0];
        this.renderWeaponSelect();
      });
    });

    const back = this.add.text(width / 2, height - 42, 'BACK', {
      fontSize: '15px',
      color: '#bfdbfe',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    back.setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('TitleScene'));
    content.add(back);
  }

  private renderWeaponSelect(): void {
    this.clearContent();
    const { width, height } = this.scale;
    const content = this.content!;
    const category = WEAPON_CATEGORIES.find((item) => item.id === this.selectedCategoryId) ?? WEAPON_CATEGORIES[0];
    const weapons = getStarterWeaponsByCategory(category.id);
    this.selectedWeapon ??= weapons[0];
    const pageSize = 4;
    const pageCount = Math.max(1, Math.ceil(weapons.length / pageSize));
    this.weaponPage = Phaser.Math.Clamp(this.weaponPage, 0, pageCount - 1);
    const pageWeapons = weapons.slice(this.weaponPage * pageSize, this.weaponPage * pageSize + pageSize);

    const title = this.add.text(width / 2, 38, category.title, {
      fontSize: '21px',
      color: '#fef08a',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 5,
    }).setOrigin(0.5);
    const guide = this.add.text(width / 2, 66, 'ブキを選んで詳細を確認。START後はこのブキ固定です。', {
      fontSize: '10px',
      color: '#dcfce7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    content.add([title, guide]);

    pageWeapons.forEach((weapon, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 112 + col * 176;
      const y = 154 + row * 144;
      const selected = this.selectedWeapon?.id === weapon.id;
      const card = this.add.rectangle(x, y, 160, 128, selected ? 0x2a1634 : 0x111827, 0.96);
      card.setStrokeStyle(selected ? 4 : 2, selected ? 0xfef08a : weapon.color, selected ? 1 : 0.66);
      const glow = this.add.circle(x, y - 24, 44, weapon.color, selected ? 0.22 : 0.11).setBlendMode(Phaser.BlendModes.ADD);
      const image = this.textures.exists(weapon.imageKey)
        ? this.add.image(x, y - 24, weapon.imageKey).setDisplaySize(66, 104)
        : this.add.rectangle(x, y - 24, 34, 92, weapon.color, 0.9);
      const name = this.add.text(x, y + 43, weapon.title, {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
        stroke: '#020617',
        strokeThickness: 3,
      }).setOrigin(0.5);
      const attr = this.add.text(x, y + 62, weapon.attributeLabel, {
        fontSize: '9px',
        color: '#fef3c7',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0.5);
      content.add([card, glow, image, name, attr]);

      card.setInteractive({ useHandCursor: true });
      card.on('pointerdown', () => {
        this.selectedWeapon = weapon;
        this.renderWeaponSelect();
      });
    });

    if (pageCount > 1) {
      const prev = this.add.text(60, 360, '<', { fontSize: '22px', color: '#bfdbfe', fontStyle: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
      const next = this.add.text(340, 360, '>', { fontSize: '22px', color: '#bfdbfe', fontStyle: 'bold', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
      const page = this.add.text(width / 2, 360, `${this.weaponPage + 1}/${pageCount}`, { fontSize: '11px', color: '#cbd5e1', fontFamily: 'Arial, sans-serif' }).setOrigin(0.5);
      prev.setInteractive({ useHandCursor: true });
      next.setInteractive({ useHandCursor: true });
      prev.on('pointerdown', () => {
        this.weaponPage = (this.weaponPage + pageCount - 1) % pageCount;
        this.selectedWeapon = weapons[this.weaponPage * pageSize];
        this.renderWeaponSelect();
      });
      next.on('pointerdown', () => {
        this.weaponPage = (this.weaponPage + 1) % pageCount;
        this.selectedWeapon = weapons[this.weaponPage * pageSize];
        this.renderWeaponSelect();
      });
      content.add([prev, next, page]);
    }

    this.renderSelectedWeaponDetail(content, this.selectedWeapon ?? weapons[0], category.color);

    const typeBack = this.add.text(64, height - 34, 'TYPE', {
      fontSize: '13px',
      color: '#bfdbfe',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    typeBack.setInteractive({ useHandCursor: true });
    typeBack.on('pointerdown', () => this.renderCategorySelect());
    content.add(typeBack);
  }

  private renderSelectedWeaponDetail(content: Phaser.GameObjects.Container, weapon: StarterWeapon, accent: number): void {
    const { width, height } = this.scale;
    const panel = this.add.rectangle(width / 2, 508, 350, 248, 0x08111f, 0.94);
    panel.setStrokeStyle(2, weapon.color, 0.78);
    const name = this.add.text(32, 392, this.wrapText(weapon.title, 22), {
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      stroke: '#020617',
      strokeThickness: 4,
      fixedWidth: 336,
    }).setOrigin(0, 0.5);
    const stats = this.add.text(32, 418, this.wrapText(`属性 ${weapon.attributeLabel} / ATK ${weapon.stats.power} / RATE ${weapon.stats.fireRate.toFixed(2)} / CRIT ${Math.round(weapon.stats.critRate * 100)}%`, 34), {
      fontSize: '10px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
      fixedWidth: 336,
      wordWrap: { width: 336, useAdvancedWrap: true },
    }).setOrigin(0, 0.5);
    const detail = this.add.text(32, 440, this.wrapText(`概要: ${weapon.subtitle}`, 25), {
      fontSize: '9px',
      color: '#dbeafe',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 2,
      fixedWidth: 336,
      wordWrap: { width: 328, useAdvancedWrap: true },
    }).setOrigin(0, 0);
    const strong = this.add.text(32, 476, this.wrapText(`得意: ${weapon.strongAgainst}`, 25), {
      fontSize: '9px',
      color: '#bbf7d0',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 2,
      fixedWidth: 336,
      wordWrap: { width: 328, useAdvancedWrap: true },
    }).setOrigin(0, 0);
    const strategy = this.add.text(32, 514, this.wrapText(`戦い方: ${weapon.strategy}`, 25), {
      fontSize: '9px',
      color: '#bae6fd',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 2,
      fixedWidth: 336,
      wordWrap: { width: 328, useAdvancedWrap: true },
    }).setOrigin(0, 0);
    const weak = this.add.text(32, 590, this.wrapText(`注意: ${weapon.weakness}`, 25), {
      fontSize: '9px',
      color: '#fecaca',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 2,
      fixedWidth: 336,
      wordWrap: { width: 328, useAdvancedWrap: true },
    }).setOrigin(0, 0);

    const startButton = this.add.rectangle(width / 2, height - 34, 138, 38, 0x7f1d1d, 0.98);
    startButton.setStrokeStyle(2, 0xfef08a, 0.9);
    const startText = this.add.text(width / 2, height - 34, 'START', {
      fontSize: '14px',
      color: '#fef3c7',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    const glow = this.add.rectangle(width / 2, height - 34, 152, 44, accent, 0.1).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.24, duration: 720, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    startButton.setInteractive({ useHandCursor: true });
    startButton.on('pointerdown', () => this.scene.start('GameScene', { starterId: weapon.id }));

    content.add([panel, name, stats, detail, strong, strategy, weak, glow, startButton, startText]);
  }
}
