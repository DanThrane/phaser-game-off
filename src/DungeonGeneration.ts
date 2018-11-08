import { Sprites } from "./scenes/BootScene";
import { Physics } from "phaser";

const emptyRoom = [
    "XXXXX",
    "XOOOX",
    "XOOOX",
    "XOOOX",
    "XXXXX"
];

const pillarRoom = [
    "XXXXX",
    "XOOOX",
    "XOXOX",
    "XOOOX",
    "XXXXX"
];

const largeRoom = [
    "XXXXXXXXXX",
    "XOOOOOOOOX",
    "XOOOOOOOOX",
    "XOOOOOOOOX",
    "XOOOOOOOOX",
    "XOOOOOOOOX",
    "XOOOOOOOOX",
    "XXXXXXXXXX"
];

const layouts = [emptyRoom, pillarRoom, largeRoom];

const pickLayout = (): string[] => layouts[(Math.random() * layouts.length) | 0];

interface BuildLayoutResult { room: Phaser.GameObjects.GameObject[], width: number, height: number }
export function buildLayout(offsetX: number, offsetY: number, physics: Physics.Arcade.ArcadePhysics): BuildLayoutResult {
    const blockSize = 32;
    const selectedLayout = pickLayout();
    const height = selectedLayout[0].length;
    const width = selectedLayout.length;
    let room = [];
    // Create frame
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            switch (selectedLayout[i][j]) {
                case "X":
                    room.push(physics.add.staticSprite(offsetX + i * blockSize, offsetY + j * blockSize, Sprites.WALL));
                    continue;
                case "O":
                    continue;
            }
        }
    }
    return { room, width, height };
}