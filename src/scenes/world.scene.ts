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
	private enemyGroup!: Phaser.GameObjects.Group;
	private bullets!: Phaser.Physics.Arcade.Group;
	private nextAllowedAttack: number = 0;
	private mouseDown = false;


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

		this.load.image("bullet", "assets/star.png");
		this.bullets = this.physics.add.group({
			defaultKey: "bullet",
			maxSize: 50
		});
		this.input.on('pointerdown', () => this.mouseDown = true, this);
		this.input.on('pointerup', () => this.mouseDown = false, this);
	}

	shoot(pointer: Phaser.Input.Pointer) {
		//this.input.mouse.requestPointerLock();
		const now = new Date().getTime();
		if (now > this.nextAllowedAttack) {
			// Logic for shooting here
			const relativeX = pointer.worldX - this.player.x;
			const relativeY = pointer.worldY - this.player.y;
			const hypothenuse = Math.sqrt(relativeX ** 2 + relativeY ** 2);
			let normalizedX = relativeX / hypothenuse;
			let normalizedY = relativeY / hypothenuse;
			const bullet = this.bullets.get(this.player.x, this.player.y);
			if (bullet) {
				bullet.setActive(true);
				bullet.setVisible(true);
				bullet.body.x = this.player.x;
				bullet.body.y = this.player.y;
				bullet.body.velocity.y = normalizedY * 1024;
				bullet.body.velocity.x = normalizedX * 1024;
			}
			this.nextAllowedAttack = now + 150;
		}

	}

	create(): void {
		this.setupAnimations()

		// Setup tilemap
		this.map = this.make.tilemap({ key: "tiled-map", tileHeight: 32, tileWidth: 32 });
		this.tileset = this.map.addTilesetImage("tiles");
		const layer = this.map.createStaticLayer("Tile Layer 1", this.tileset, 0, 0);

		// Set collision for Tile items 2 - 3 (inclusive, wall and rock) 
		this.map.setCollisionBetween(2, 3);

		this.player = new Player(this, this.map.tileToWorldX(4), this.map.tileToWorldY(4), "dude");

		this.enemyGroup = this.add.group([], {
			runChildUpdate: true,
			active: true
		})

		let refs = {
			player: this.player,
			map: this.map,
			myGroup: this.enemyGroup
		};

		this.enemyGroup.addMultiple([
			new Slime(refs, this, this.map.tileToWorldX(14), this.map.tileToWorldY(10), "slime"),
			new Slime(refs, this, this.map.tileToWorldX(10), this.map.tileToWorldY(15), "slime"),
			new Slime(refs, this, this.map.tileToWorldX(17), this.map.tileToWorldY(18), "slime")
		])

		// Add collider between collision tile items and player
		this.physics.add.collider(layer, this.player)
		let col = this.physics.add.collider(this.player, this.enemyGroup)
		this.physics.add.collider(layer, this.enemyGroup)

		// shot overlaps with enemy => damage it
		this.physics.add.overlap(this.bullets, this.enemyGroup, (slime: Phaser.GameObjects.GameObject, shot: Phaser.GameObjects.GameObject) => {
			let entitySlime = slime as Entity;
			entitySlime.damagedByOtherEntity(this.player)
			if (entitySlime.isDead) {
				// it has been deaded
				slime.emit('death');
			}
		});

		// Scroll to the player		
		let cam = this.cameras.main;
		cam.startFollow(this.player);

		this.player.create()
		this.enemyGroup.children.each((s: Entity, i: number) => s.create(), this)
	}

	update(): void {
		this.player.update()

		// Cleanup;
		this.bullets.children.each(it => {
			if (it.active && (Phaser.Math.Distance.Between(this.player.x, this.player.y, it.x, it.y) > 2000)) {
				it.setActive(false);
			}
		}, this)

		if (this.mouseDown) {
			this.shoot(this.input.activePointer)
		}
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