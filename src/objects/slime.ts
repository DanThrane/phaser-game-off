import { Entity } from "./entity";

export class Slime extends Entity {
	private phBody!: Phaser.Physics.Arcade.Body;

	constructor(
		scene: Phaser.Scene,
		x: number, y: number,
		texture: string,
		frame?: string | number,
		public movementSpeed = 180
	) {
		super(scene, x, y, texture, frame);

		this.scene.physics.world.enable(this);
		this.phBody = this.body as Phaser.Physics.Arcade.Body;
		this.phBody.setCircle(16);
	}
	
	create() { }

	update() { }
}