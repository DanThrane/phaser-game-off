import { Player } from "../objects/player";
import { WorldGenerator } from "../objects/worldGenerator";

export class WorldScene extends Phaser.Scene {
	private map?: Phaser.Tilemaps.Tilemap = undefined;
	private tileset?: Phaser.Tilemaps.Tileset = undefined;
	private world = {
		width: 32000,
		height: 3200
	};
	private player!: Player;

	constructor() {
		super({
			key: "WorldScene"
		});
	}

	preload() {
		this.load.image("tiles", "assets/tilesheet.png");
		this.load.spritesheet(
			"dude",
			"assets/dude.png",
			{ frameWidth: 32, frameHeight: 48 }
		);
		this.load.tilemapTiledJSON("tiled-map", "assets/tiled-test.json");
	}

	create() {
		// Setup tilemap
		this.map = this.add.tilemap("tiled-map");
		this.tileset = this.map.addTilesetImage("tiles");
		this.map.createStaticLayer("Tile Layer 1", this.tileset, 0, 0);

		this.player = new Player(this, 0, 0, "dude");
		this.player.x = this.map.tileToWorldX(0);
		this.player.y = this.map.tileToWorldY(0);

		// Scroll to the player		
		let cam = this.cameras.main;
		cam.startFollow(this.player);
	}

	update(): void {
		this.player.update();
	}
}