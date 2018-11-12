import { Player } from "../objects/player";
import { WorldGenerator } from "../objects/worldGenerator";
import { Entity } from "../objects/entity";
import { Slime } from "../objects/slime";

export class WorldScene extends Phaser.Scene {
	private map?: Phaser.Tilemaps.Tilemap = undefined;
	private tileset?: Phaser.Tilemaps.Tileset = undefined;
	private world = {
		width: 32000,
		height: 3200
	};
	private player!: Player;
	private entities!: Phaser.GameObjects.GameObject[];
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

		this.load.tilemapTiledJSON("tiled-map", "assets/tiled-test.json");

	}

	create() {
		// Setup tilemap
		this.map = this.make.tilemap({ key: "tiled-map", tileHeight: 32, tileWidth: 32});
		this.tileset = this.map.addTilesetImage("tiles");
		this.entities = []
		const layer = this.map.createStaticLayer("Tile Layer 1", this.tileset, 0, 0);
		
		// Set collision for Tile items 2 - 3 (inclusive, wall and rock) 
		this.map.setCollisionBetween(2, 3);

		this.player = new Player(this, 0, 0, "dude");
		this.player.x = this.map.tileToWorldX(4);
		this.player.y = this.map.tileToWorldY(4);

		// Add collider between collision tile items and player
		this.physics.add.collider(layer, this.player);
		this.physics.add.collider(layer, this.entities);

		let slime = new Slime(this, this.map.tileToWorldX(5), this.map.tileToWorldY(5), "slime")
		this.entities.push(slime);

		// Scroll to the player		
		let cam = this.cameras.main;
		cam.startFollow(this.player);
	}

	update(): void {
		this.player.update();
		this.entities.forEach(enemy => enemy.update());
	}
}