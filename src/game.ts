/// <reference path="./phaser.d.ts"/>

import "phaser";
import { Entity } from "./objects/entity";
import { WorldScene } from "./scenes/world.scene";
// import { BootScene } from "./scenes/BootScene";

const config: GameConfig = {
  version: "0.1,0",
  width: 800,
  height: 600,
  type: Phaser.AUTO,
  parent: "game",
  scene: [WorldScene],
  input: {
    keyboard: true,
    mouse: false,
    touch: false,
    gamepad: false
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: true
    }
  },
  backgroundColor: "#000000",
  pixelArt: true,
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
