import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { CatacombScene } from './scenes/CatacombScene';
import { UIScene } from './scenes/UIScene';
import { WorldScene } from './scenes/WorldScene';
import { gameState } from './systems/GameState';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#0c0a09',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, WorldScene, CatacombScene, UIScene],
};

const game = new Phaser.Game(config);

// Expose for automated verification & classroom inspection
(window as unknown as Record<string, unknown>).__ROM_GAME__ = game;
(window as unknown as Record<string, unknown>).__ROM_STATE__ = gameState;
