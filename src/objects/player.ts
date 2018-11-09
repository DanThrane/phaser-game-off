import { Entity } from "./entity";

export class Player extends Entity {
	private cursors?: CursorKeys;
	private phBody!: Phaser.Physics.Arcade.Body;

	public movementSpeed = 320;

	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
		super(scene, x, y, texture, frame);

		this.cursors = this.scene.input.keyboard.createCursorKeys();

		this.scene.physics.world.enable(this);
		this.phBody = this.body as Phaser.Physics.Arcade.Body;
		this.phBody.setCircle(16);
	}
	
	create() {
	}

	update() {
		this.handleInput();
	}

	private handleInput() {
		// TODO: This is particularly annoying to have these checks for undefined...
		if (this.cursors === undefined){
			return;
		}

		// Horizontal movement
		if (this.cursors.left && this.cursors.left.isDown) {
			this.phBody.setVelocityX(-this.movementSpeed /*+ (this.cursors.shift.isDown ? -80 : 0)*/);
			// this.anims.play("left", true);
			// animSet = true;
		} else if (this.cursors.right && this.cursors.right.isDown) {
			this.phBody.setVelocityX(this.movementSpeed /*+ (this.cursors.shift.isDown ? 80 : 0)*/);
			// this.player.anims.play("right", true);
			// animSet = true;
		} else {
			this.phBody.setVelocityX(0);
			// this.player.anims.play("turn", true);
		}
		
		// Vertical movement
		if (this.cursors.up && this.cursors.up.isDown) {
			this.phBody.setVelocityY(-this.movementSpeed /*+ (this.cursors.shift.isDown ? -80 : 0)*/);
			// this.anims.play("left", true);
			// animSet = true;
		} else if (this.cursors.down && this.cursors.down.isDown) {
			this.phBody.setVelocityY(this.movementSpeed /*+ (this.cursors.shift.isDown ? 80 : 0)*/);
			// this.player.anims.play("right", true);
			// animSet = true;
		} else {
			this.phBody.setVelocityY(0);
			// this.player.anims.play("turn", true);
		}
	}

}