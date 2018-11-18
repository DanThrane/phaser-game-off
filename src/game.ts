/// <reference path="./phaser.d.ts"/>

import "phaser";
import { Entity } from "./objects/entity";
import { WorldScene } from "./scenes/world.scene";
// import { BootScene } from "./scenes/BootScene";

const config: GameConfig = {
  version: "0.1.0",
  width: 1280,
  height: 720,
  type: Phaser.AUTO,
  parent: "game",
  scene: [WorldScene],
  input: {
    keyboard: true,
    mouse: true,
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
  const game = new Game(config);

  const desiredRatio = 16 / 9;
  const inverseRatio = 1 / desiredRatio;
  const resize = () => {
    const canvas = game.canvas;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const heightBasedOnWidth = width * inverseRatio;    
    const widthBasedOnHeight = height * desiredRatio;

    if (heightBasedOnWidth <= height) {
      canvas.style.height = `${heightBasedOnWidth}px`;
      canvas.style.width = `${width}px`;
    } else {
      canvas.style.width = `${widthBasedOnHeight}px`;
      canvas.style.height = `${height}px`;
    }
  };

  window.addEventListener('resize', resize);
  resize();
};