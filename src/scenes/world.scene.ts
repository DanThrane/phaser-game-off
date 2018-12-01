import { Player } from "../objects/player";
import { WorldGenerator } from "../objects/worldGenerator";
import { Entity } from "../objects/entity";
import { Slime } from "../objects/slime";
import { FOREVER } from "phaser";
import { SlimeKing, States } from "../objects/slimeKing";
import { CharacterEntity } from "../objects/character";


export class WorldScene extends Phaser.Scene {
	public map?: Phaser.Tilemaps.Tilemap = undefined;
	private tileset?: Phaser.Tilemaps.Tileset = undefined;
	private world = {
		width: 32000,
		height: 3200
	};
	private player!: Player;
	private boss!: Entity;
	private bullets!: Phaser.Physics.Arcade.Group;
	private gui!: Phaser.GameObjects.Container;

	constructor() {
		super({
			key: "WorldScene"
		});
	}

	preload(): void {
		this.load.image("tiles", "assets/tilesheet.png");

		this.load.tilemapTiledJSON("tiled-map", "assets/tiled-test.json");

		Player.preload(this);
		Slime.preload(this);
		SlimeKing.preload(this);

		this.load.spritesheet(
			"dude",
			"assets/dude.png",
			{ frameWidth: 32, frameHeight: 48 }
		);

		this.load.audio(Music.MUSIC_2, "assets/GameMusic2.mp3");
		this.load.image("bullet", "assets/star.png");
		this.bullets = this.physics.add.group({
			defaultKey: "bullet",
			maxSize: 50
		});

	}

	shoot(pointer: Phaser.Input.Pointer) {

		let pointerInCameraSpace = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
		let relativePos = pointerInCameraSpace.subtract(this.player.getCenter());
		const pointerToPos = relativePos.normalize();
		const firedBullets = this.player.weapon[this.player.leftLastFired ? 0 : 1].shoot(pointerToPos);
		this.player.leftLastFired = !this.player.leftLastFired;
		firedBullets.forEach(v => {
			const bullet = this.bullets.get(this.player.x, this.player.y);
			if (bullet) {
				bullet.setActive(true);
				bullet.setVisible(true);
				bullet.body.x = this.player.x;
				bullet.body.y = this.player.y;

				bullet.body.velocity.y = v.y;
				bullet.body.velocity.x = v.x;
			}
		});
	}

	create(): void {

		const sound = this.sound.add(Music.MUSIC_2, { loop: true, rate: 1.3 });
		sound.play()
		console.log(sound)
		Slime.createOnce(this);
		Player.createOnce(this);
		SlimeKing.createOnce(this);

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

		this.boss = new SlimeKing(refs, this, this.map.tileToWorldX(60), this.map.tileToWorldY(40), "slimeking")


		// Add collider between collision tile items and player
		this.physics.add.collider(this.player, this.boss);

		this.physics.add.collider(this.boss, [this.player], (boss: Phaser.GameObjects.GameObject, player: any) => {
			//console.log(boss, player)
			let slimeking = (boss as SlimeKing);

			if (slimeking.state === States.CHARGING) {
				let body = (boss.body as Phaser.Physics.Arcade.Body)
				body.setVelocity(0,0)
				body.setBounce(1,1)
				boss.emit('knockback')
				this.player.emit('knockback', boss)
			}
		})

		this.physics.add.collider(this.player, Slime.group)
		this.physics.add.collider(layer, Slime.group)
		this.physics.add.collider(this.player, layer)

		this.physics.add.collider(this.boss, Slime.group)

		this.physics.add.overlap(this.bullets, this.boss, (boss, bullet: Phaser.GameObjects.GameObject) => {
			this.boss.emit('hit', this.player.calculatedDamage, this.player);
			bullet.destroy();
		})

		this.physics.add.overlap(SlimeKing.slimePew, this.player, (player, shot) => {
			player.emit('hit', (this.boss as CharacterEntity).calculatedDamage, this.boss);
			shot.destroy()
		})


		// shot overlaps with enemy => damage it
		this.physics.add.overlap(this.bullets, Slime.group,
			(slime: Phaser.GameObjects.GameObject, shot: Phaser.GameObjects.GameObject) => {
				let entitySlime = slime as CharacterEntity;
				entitySlime.emit('hit', this.player.calculatedDamage, this.player);
				shot.destroy() // shot is consumed by damaged
			}
		);

		this.physics.add.collider(this.bullets, layer, 
			(bullet: Phaser.GameObjects.GameObject) => {
				bullet.destroy();
			}
		);

		this.physics.add.collider(Slime.slimePew, layer, (shot: Phaser.GameObjects.GameObject) => {
			shot.destroy();
		})

		this.physics.add.overlap(Slime.slimePew, this.player,
			(plaeyr: Phaser.GameObjects.GameObject, shot: Phaser.GameObjects.GameObject) => {
				let aSlime = Slime.group.getChildren()[0] as CharacterEntity;
				
				plaeyr.emit("hit", aSlime.calculatedDamage, aSlime);
				shot.destroy() // shot is consumed by damaged
			}
		);


		this.gui = this.add.container(0, 720 / 2)

		this.gui.add([
			this.add.rectangle(undefined, undefined, 600, 720, 0x2d896a),
			this.add.text(20, -330, `Player health: ${this.player.remainingHealth}`),
			this.add.text(20, -310, `Enemies remaining: ${Slime.group.getLength()}`),
			this.add.text(20, -290, `Bosses remaining: 1`)
		]);

		this.gui.setDepth(4)

		this.player.on('afterhit', () => {
			let text = this.gui.getAt(1) as Phaser.GameObjects.Text
			text.setText(`Player health: ${this.player.remainingHealth}`)
		})

		this.player.on('gotKill', () => {
			let text = this.gui.getAt(2) as Phaser.GameObjects.Text
			text.setText(`Enemies remaining: ${Slime.group.getChildren().filter((enemy) => {
				return !(enemy as CharacterEntity).isDead
			}).length}`)
		})

		this.gui.scrollFactorX = 0
		this.gui.scrollFactorY = 0


		// Scroll to the player		
		let cam = this.cameras.main;
		cam.startFollow(this.player, true, undefined, undefined, 140, 20);



		this.player.create()
		this.boss.create()
		Slime.group.children.each((slime: Entity) => slime.create(), this);
	}

	update(time: number, dt: number): void {

		this.player.update()
		this.boss.update(time, dt)

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

const enum Music {
	MUSIC_2 = "music2"
}