import { Player } from "../objects/player";
import { WorldGenerator } from "../objects/worldGenerator";
import { Entity } from "../objects/entity";
import { Slime } from "../objects/slime";
import { FOREVER } from "phaser";


export class WorldScene extends Phaser.Scene {
	public map?: Phaser.Tilemaps.Tilemap = undefined;
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

	preload(): void {
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

	create(): void {
		this.setupAnimations()

		// Setup tilemap
		this.map = this.make.tilemap({ key: "tiled-map", tileHeight: 32, tileWidth: 32});
		this.tileset = this.map.addTilesetImage("tiles");
		this.entities = []
		const layer = this.map.createStaticLayer("Tile Layer 1", this.tileset, 0, 0);
		
		// Set collision for Tile items 2 - 3 (inclusive, wall and rock) 
		this.map.setCollisionBetween(2, 3);

		this.player = new Player(this, this.map.tileToWorldX(4), this.map.tileToWorldY(4), "dude");
		
		this.entities.push(this.player);
		this.entities.push(
			new Slime(this.player, this, this.map.tileToWorldX(10), this.map.tileToWorldY(8), "slime"),
			new Slime(this.player, this, this.map.tileToWorldX(8), this.map.tileToWorldY(12), "slime"),
			new Slime(this.player, this, this.map.tileToWorldX(14), this.map.tileToWorldY(16), "slime"),
		);
		
		// Add collider between collision tile items and player
		this.physics.add.collider(layer, this.player)
		this.physics.add.collider(this.player, this.entities)
		this.physics.add.collider(layer, this.entities)


		// Scroll to the player		
		let cam = this.cameras.main;
		cam.startFollow(this.player);

		this.entities.forEach(entity => entity.create());
	}

	update(): void {
		this.entities.forEach(enemy => enemy.update());
	}

	setupAnimations(): void {
		// animations
		this.anims.create({
			key: "throw",
			frameRate: 8,
			frames: this.anims.generateFrameNumbers('slime', {
				start: 0,
				end: 4
			}),
			repeat: FOREVER
		});
		
		this.anims.create({
			key: "standing",
			frameRate: 8,
			frames: this.anims.generateFrameNumbers('slime', {
				start: 5,
				end: 10
			}),
			repeat: FOREVER
		});

		this.anims.create({
			key: "crawling",
			frameRate: 14,
			frames: this.anims.generateFrameNumbers('slime', {
				start: 11,
				end: 19
			}),
			repeat: FOREVER
		});
	}
}