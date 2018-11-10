import { rooms } from "../../Rooms/rooms.json";

export type Rooms = "emptyRoom" | "pillarRoom" | "hugeRoom" | "largeRoom";

export interface IRoomOptions {
	tileWidth: number;
	tileHeight: number;
	offsetX?: number;
	offsetY?: number;
}

export class WorldGenerator {
	private map: Phaser.Tilemaps.Tilemap;
	private room: string[] = [];
	private options: IRoomOptions;

	constructor(map: Phaser.Tilemaps.Tilemap, roomId: Rooms, options: IRoomOptions) {
		this.map = map;
		this.room = this.pickLayout(roomId);
		this.options = options;
	}

	// private offsetX: number = 0;
	// private offsetY: number = 0;
	// private blockSize: number = 32;

	private pickLayout = (identifier: Rooms): string[] => rooms[identifier];

	buildLayout(): void {
		let offsetX = this.options.offsetX ? this.options.offsetX : 0;
		let offsetY = this.options.offsetY ? this.options.offsetY : 0;

		const height = this.room.length;
		for (let row = 0; row < height; row++) {
			const width = this.room[row].length;
			for (let col = 0; col < width; col++) {
				let char = this.room[row][col];
				if (char in this.charToTileMap) {
					let tile = this.charToTileMap[char];
					let x = col;//offsetX + col * this.options.tileWidth;
					let y = row;//offsetY + row * this.options.tileHeight;
					this.map.putTileAt(tile, x, y);
					console.log("Put tile", char, "at (", x, ",", y, ")");
				}
			}
		}
	}

	private charToTileMap: { [char: string]: number } = {
		"X": 1,
		" ": 0
	}
}