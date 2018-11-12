import { Entity } from "./entity";
import { FOREVER } from "phaser";

export class Slime extends Entity {
	private phBody!: Phaser.Physics.Arcade.Body;

	constructor(
		scene: Phaser.Scene,
		x: number, y: number,
		texture: string,
		frame?: string | number,
		public movementSpeed = 21
	) {
		super(scene, x, y, texture, frame);

		this.scene.physics.world.enable(this);
		this.phBody = this.body as Phaser.Physics.Arcade.Body;
		this.phBody.setCircle(12, 4, 12);
	}
	
	create() {
		this.scene.anims.create({
			key: "throw",
			frameRate: 9,
			frames: this.scene.anims.generateFrameNumbers('slime', {
				start: 0,
				end: 4
			}),
			repeat: FOREVER
		});
		
		this.scene.anims.create({
			key: "standing",
			frameRate: 10,
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
		this.anims.load('standing');
		this.anims.load('throw');
	}

	update() {
		
		this.anims.play("crawling", true);
		this.setVelocityX(-this.movementSpeed)
	}
}