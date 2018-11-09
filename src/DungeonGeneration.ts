import { Sprites } from "./scenes/BootScene";
import { Physics } from "phaser";

import { rooms } from "../Rooms/rooms.json"

class DungeonGeneration {
    constructor(physics: Physics.Arcade.ArcadePhysics) {
        this.physics = physics;
    }

    private physics: Physics.Arcade.ArcadePhysics;
    private offsetX: number = 0;
    private offsetY: number = 0;
    private blockSize: number = 32;

    private pickLayout = (): string[] => rooms["hugeRoom"];

    buildLayout(): Phaser.GameObjects.GameObject[] {
        const selectedLayout = this.pickLayout();
        const width = selectedLayout[0].length;
        const height = selectedLayout.length;
        let room = [];
        // Create frame
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                switch (selectedLayout[j][i]) {
                    case "X":
                        room.push(this.physics.add.staticSprite(this.offsetX + i * this.blockSize, this.offsetY + j * this.blockSize, Sprites.WALL));
                        continue;
                    case "O":
                        continue;
                }
            }
        }
        this.offsetX += (width - 1) * this.blockSize;
        return room;
    }

}

export default DungeonGeneration;