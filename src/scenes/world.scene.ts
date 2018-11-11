import { Player } from "../objects/player";
import { WorldGenerator } from "../objects/worldGenerator";
import { Entity } from "../objects/entity";
import { Slime } from "../objects/slime";

export class WorldScene extends Phaser.Scene {
	private map?: Phaser.Tilemaps.Tilemap = undefined;
	private tileset?: Phaser.Tilemaps.Tileset = undefined;
	private world = {
		width: 3200,
		height: 3200
	};
	private player!: Player;
	private enemies: Entity[] = [];
	
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

		this.load.spritesheet(
			"slime",
			"assets/slime.png",
			{ frameWidth: 32, frameHeight: 32 }
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

		let slime = new Slime(this, this.map.tileToWorldX(5), this.map.tileToWorldY(0), "slime")
		this.enemies.push(slime);

		// Scroll to the player		
		let cam = this.cameras.main;
		cam.startFollow(this.player);
	}

	update(): void {
		this.player.update();
		this.enemies.forEach((enemy) => {
			enemy.update();
		});
	}
}