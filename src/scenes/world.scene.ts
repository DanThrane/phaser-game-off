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
	private bullets!: Phaser.Physics.Arcade.Group;
	private nextAllowedAttack: number = 0;

	constructor() {
		super({
			key: "WorldScene"
		});
	}

	preload(): void {
		this.load.image("tiles", "assets/tilesheet.png");

		this.load.tilemapTiledJSON("tiled-map", "assets/tiled-test.json");

		Slime.preload(this);

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

	}

	shoot(pointer: Phaser.Input.Pointer) {
		//this.input.mouse.requestPointerLock();
		const now = new Date().getTime();
		if (now > this.nextAllowedAttack) {
			// Logic for shooting here

			let pointerInCameraSpace = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
			let relativePos = pointerInCameraSpace.subtract(this.player.getCenter());
			const pointerToPos = relativePos.normalize();
			
			const bullet = this.bullets.get(this.player.x, this.player.y);
			if (bullet) {
				bullet.setActive(true);
				bullet.setVisible(true);
				bullet.body.x = this.player.x;
				bullet.body.y = this.player.y;

				let scaled = pointerToPos.scale(1024)
				bullet.body.velocity.y = scaled.y;
				bullet.body.velocity.x = scaled.x;
			}
			this.nextAllowedAttack = now + 150;
		}

	}

	create(): void {		
		Slime.createOnce(this);

		// Setup tilemap
		this.map = this.make.tilemap({ key: "tiled-map", tileHeight: 32, tileWidth: 32 });
		this.tileset = this.map.addTilesetImage("tiles");
		const layer = this.map.createStaticLayer("Tile Layer 1", this.tileset, 0, 0);

		// Set collision for Tile items 2 - 3 (inclusive, wall and rock) 
		this.map.setCollisionBetween(2, 3);

		this.player = new Player(this, this.map.tileToWorldX(4), this.map.tileToWorldY(4), "dude");

		let refs = {
			player: this.player,
			map: this.map
		};

		Slime.group.addMultiple([
			new Slime(refs, this, this.map.tileToWorldX(14), this.map.tileToWorldY(10), "slime"),
			new Slime(refs, this, this.map.tileToWorldX(10), this.map.tileToWorldY(15), "slime"),
			new Slime(refs, this, this.map.tileToWorldX(17), this.map.tileToWorldY(18), "slime"),
			
			new Slime(refs, this, this.map.tileToWorldX(44), this.map.tileToWorldY(41), "slime"),
			new Slime(refs, this, this.map.tileToWorldX(30), this.map.tileToWorldY(34), "slime"),
			new Slime(refs, this, this.map.tileToWorldX(37), this.map.tileToWorldY(54), "slime"),
			
			new Slime(refs, this, this.map.tileToWorldX(53), this.map.tileToWorldY(44), "slime"),
			new Slime(refs, this, this.map.tileToWorldX(62), this.map.tileToWorldY(21), "slime"),
			new Slime(refs, this, this.map.tileToWorldX(57), this.map.tileToWorldY(34), "slime")
		])

		// Add collider between collision tile items and player
		this.physics.add.collider(layer, this.player)
		this.physics.add.collider(this.player, Slime.group)
		this.physics.add.collider(layer, Slime.group)

		// shot overlaps with enemy => damage it
		this.physics.add.overlap(this.bullets, Slime.group, (slime: Phaser.GameObjects.GameObject, shot: Phaser.GameObjects.GameObject) => {
			let entitySlime = slime as Entity;
			entitySlime.damagedByOtherEntity(this.player)
			if (entitySlime.isDead) {
				// it has been deaded
				slime.emit('death');
			}
			shot.destroy() // shot is consumed by damaged
		});

		this.physics.add.collider(this.bullets, layer, (bullet: Phaser.GameObjects.GameObject) => {
			bullet.destroy();
		});

		this.physics.add.collider(Slime.slimePew, layer, (shot: Phaser.GameObjects.GameObject) => {
			shot.destroy();
		})

		this.physics.add.overlap(Slime.slimePew, this.player, (plaeyr: Phaser.GameObjects.GameObject, shot: Phaser.GameObjects.GameObject) => {
			let entity = plaeyr as Entity;
			let randomSlime = Slime.group.children.entries[0] as Entity; // stupied way of getting the attack stats... maybe the stats should be place more statically
			entity.damagedByOtherEntity(randomSlime);

			this.cameras.main.shake(600, 0.004) // feel the pain!
			
			if (entity.isDead) {
				// it has been deaded
				entity.emit('death');
			}
			shot.destroy() // shot is consumed by damaged
		});


		// Scroll to the player		
		let cam = this.cameras.main;
		cam.startFollow(this.player);

		this.player.create()
		Slime.group.children.each((slime: Entity) => slime.create(), this);
	}

	update(): void {
		this.player.update()

		// Cleanup;
		this.bullets.children.each(it => {
			if (it.active && (Phaser.Math.Distance.Between(this.player.x, this.player.y, it.x, it.y) > 2000)) {
				it.setActive(false);
			}
		}, this)

		if (this.input.activePointer.primaryDown) {
			this.shoot(this.input.activePointer)
		}
	}

}