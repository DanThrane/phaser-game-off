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
	private entities: Entity[] = [];
	

	constructor() {
		super({
			key: "WorldScene"
		});
	}

	preload() {
		this.load.image("tiles", "assets/tilesheet.png");
		
		this.load.tilemapTiledJSON("tiled-map", "assets/tiled-test.json");

		this.load.spritesheet(
			"slime",
			"assets/slime.png",
			{ frameWidth: 32, frameHeight: 32 }
		);

		this.load.spritesheet(
			"dude",
			"assets/dude.png",
			{ frameWidth: 32, frameHeight: 48 }
		);
	}

	create() {
		// Setup tilemap
		this.map = this.make.tilemap({ key: "tiled-map", tileHeight: 32, tileWidth: 32});
		this.tileset = this.map.addTilesetImage("tiles");
		const layer = this.map.createStaticLayer("Tile Layer 1", this.tileset, 0, 0);
		
		// Set collision for Tile items 2 - 3 (inclusive, wall and rock) 
		this.map.setCollisionBetween(2, 3);

		this.player = new Player(this, this.map.tileToWorldX(0), this.map.tileToWorldY(0), "dude");
		let slime = new Slime(this, this.map.tileToWorldX(5), this.map.tileToWorldY(0), "slime");
		this.entities.push(this.player);
		this.entities.push(slime);
		
		// Add collider between collision tile items and player
		this.physics.add.collider(layer, this.player)
		this.physics.add.collider(this.player, this.entities)
		this.physics.add.collider(layer, this.entities)


		// Scroll to the player		
		let cam = this.cameras.main;
		cam.startFollow(this.player);

		this.entities.forEach((entity) => {
			entity.create()
		})
	}

	update(): void {
		this.entities.forEach((entity) => {
			entity.update();
		});
	}
}