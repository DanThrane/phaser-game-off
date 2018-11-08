/// <reference path="./phaser.d.ts"/>

import "phaser";
import { BootScene } from "./scenes/BootScene";

const config: GameConfig = {
  version: "0.1,0",
  width: 1920,
  height: 1080,
  type: Phaser.AUTO,
  parent: "game",
  scene: [BootScene],
  input: {
    keyboard: true,
    mouse: false,
    touch: false,
    gamepad: false
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  backgroundColor: "#000000",
  pixelArt: false,
  antialias: false
};

export class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

window.onload = () => {
  var game = new Game(config);
};
