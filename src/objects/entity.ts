
export class Entity extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number, y: number,
		texture: string,
		frame?: string | number
	) {
		super(scene, x, y, texture, frame);
		this.scene.add.existing(this);
	}

	public create() {}

	public static preload(scene: Phaser.Scene) {}

	public static createOnce(scene: Phaser.Scene): void {}
}

