import { Entity } from "./entity";

export class Player extends Entity {
	private cursors: CursorKeys;
	private phBody!: Phaser.Physics.Arcade.Body;

	public movementSpeed = 320;

	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
		super(scene, x, y, texture, frame);

		this.cursors = this.scene.input.keyboard.createCursorKeys();
		// TODO We had a previous check for cursors == undefined. I removed
		// would we really want to have that failure be silent? Can this method
		// even return undefined?

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
		// Horizontal movement
		if (this.cursors.left && this.cursors.left.isDown) {
			this.phBody.setVelocityX(-this.movementSpeed);
		} else if (this.cursors.right && this.cursors.right.isDown) {
			this.phBody.setVelocityX(this.movementSpeed);
		} else {
			this.phBody.setVelocityX(0);
		}
		
		// Vertical movement
		if (this.cursors.up && this.cursors.up.isDown) {
			this.phBody.setVelocityY(-this.movementSpeed);
		} else if (this.cursors.down && this.cursors.down.isDown) {
			this.phBody.setVelocityY(this.movementSpeed);
		} else {
			this.phBody.setVelocityY(0);
		}
	}
}