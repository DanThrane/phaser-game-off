import { Player } from "../objects/player";
import { WorldGenerator } from "../objects/worldGenerator";

export class WorldScene extends Phaser.Scene {
	private map?: Phaser.Tilemaps.Tilemap = undefined;
	private tileset?: Phaser.Tilemaps.Tileset = undefined;
	private world = {
		width: 3200,
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
	}

	create() {
		// Setup tilemap
		this.map = this.make.tilemap({
			tileWidth: 16,
			tileHeight: 16,
			width: this.world.width,
			height: this.world.height
		});
		this.tileset = this.map.addTilesetImage("tiles", "tiles", 16, 16);
		let layer = this.map.createBlankDynamicLayer("layer 1", this.tileset, this.map.width, this.map.height, this.map.tileWidth, this.map.tileHeight);
		
		let worldGen = new WorldGenerator(this.map, "hugeRoom", {
			tileWidth: 16,
			tileHeight: 16,
		});
		worldGen.buildLayout();
		// layer.randomize(0, 0, this.map.width, this.map.height, [0, 1, 2]); // <- try this out instaead :)

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