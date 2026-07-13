import Phaser from 'phaser';
import './style.css';
import BootScene from './game/scenes/BootScene';
import GameScene from './game/scenes/GameScene';
import LoadingScene from './game/scenes/LoadingScene';
import ResultScene from './game/scenes/ResultScene';
import TitleScene from './game/scenes/TitleScene';
import WeaponSelectScene from './game/scenes/WeaponSelectScene';

const userAgent = navigator.userAgent.toLowerCase();
const isIos = /iphone|ipad|ipod/.test(userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 400,
  height: 720,
  parent: 'app',
  backgroundColor: '#020617',
  antialias: !isIos,
  roundPixels: isIos,
  fps: {
    target: 60,
    smoothStep: true,
  },
  render: {
    antialias: !isIos,
    pixelArt: false,
    powerPreference: 'high-performance',
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [BootScene, TitleScene, LoadingScene, WeaponSelectScene, GameScene, ResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl).catch(() => {
      // キャッシュなしでもゲームは遊べるので、登録失敗は静かに流す
    });
  });
}
