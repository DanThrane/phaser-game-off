import { Entity } from "./entity";
import { FOREVER } from "phaser";

enum Facing {
	left = 1,
	right = 1
}

export class Slime extends Entity {
	private phBody!: Phaser.Physics.Arcade.Body;
 

	constructor(
		private playerRef: Entity,
		scene: Phaser.Scene,
		x: number, y: number,
		texture: string,
		frame?: string | number,
		public movementSpeed = 21,
		private detectionRadius = 225,
		private reach = 12
	) {
		super(scene, x, y, texture, frame);

		this.scene.physics.world.enable(this);
		this.phBody = this.body as Phaser.Physics.Arcade.Body;
		this.phBody.setCircle(12, 4, 12);
	}
	
	create() {
		this.scene.anims.create({
			key: "throw",
			frameRate: 8,
			frames: this.scene.anims.generateFrameNumbers('slime', {
				start: 0,
				end: 4
			}),
			repeat: FOREVER
		});
		
		this.scene.anims.create({
			key: "standing",
			frameRate: 8,
			frames: this.scene.anims.generateFrameNumbers('slime', {
				start: 5,
				end: 10
			}),
			repeat: FOREVER
		});

		this.scene.anims.create({
			key: "crawling",
			frameRate: 14,
			frames: this.scene.anims.generateFrameNumbers('slime', {
				start: 11,
				end: 19
			}),
			repeat: FOREVER
		});

		this.anims.load("crawling");
		this.anims.load("standing");
		this.anims.load("throw");
	}

	update() {
		
		// chase - no real path finding
		let me = this.getCenter() // this should be the center of the body instead or the player bounding circle should fit better the sprite
		let playerDist = this.playerRef.getCenter()
		let distanceToPlayer = me.distance(playerDist);

		if (distanceToPlayer <= this.detectionRadius && 
			distanceToPlayer > this.width + this.reach) {
			this.anims.play("crawling", true)
			let pointer = playerDist.subtract(me).normalize();
			
			if (pointer.x > 0) {
				this.setFlipX(true)
			} else {
				this.setFlipX(false)
			}

			let movementVec = pointer.scale(this.movementSpeed);

			this.setVelocity(movementVec.x, movementVec.y);
		} else {
			this.anims.play("standing", true)
			this.setVelocity(0, 0)
		}
	}
}