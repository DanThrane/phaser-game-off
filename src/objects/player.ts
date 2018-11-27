import { Entity } from "./entity";
import { CharacterEntity } from "./character";
import { Weapon, Pistol, Shotgun, Minigun } from "./weapon";

export class Player extends CharacterEntity {
	private cursors: Phaser.Input.Keyboard.CursorKeys;
	private wasd: any;
	private phBody!: Phaser.Physics.Arcade.Body;

	public movementSpeed = 320;
	health = 200;
	protected mana = 100;

	immortal = false;
	ethereal = false;
	maxHealth = 200;
	maxMana = 100;
	atk = 10;
	def = 5;
	weapon: [Weapon, Weapon] = [new Minigun(), new Shotgun()]
	leftLastFired: boolean = false;

	constructor(
		scene: Phaser.Scene,
		x: number, y: number,
		texture: string,
		frame?: string | number
	) {
		super(scene, x, y, texture, frame);
		this.cursors = this.scene.input.keyboard.createCursorKeys();
		this.wasd = this.scene.input.keyboard.addKeys("w,a,s,d");
		// TODO We had a previous check for cursors == undefined. I removed
		// would we really want to have that failure be silent? Can this method
		// even return undefined?
		this.scene.input.mouse.enabled = true;

		this.scene.physics.world.enable(this);
		this.phBody = this.body as Phaser.Physics.Arcade.Body;
		this.phBody.setCircle(16);
	}

	public create() {
		this.once("death", () => {
			this.phBody.enable = false // freaze, mothafooka!
			this.scene.cameras.main.fadeOut(3000, 0, 0, 0, () => {
				if (this.scene.cameras.main.zoom <= 6) {
					this.scene.cameras.main.zoom += 0.01;
				}
			});
		});
		this.setDepth(1)
	}

	public update() {
		this.handleInput();
	}

	private handleInput() {
		// Horizontal movement
		if ((this.cursors.left && this.cursors.left.isDown) || (this.wasd.a.isDown)) {
			this.phBody.setVelocityX(-this.movementSpeed);
		} else if ((this.cursors.right && this.cursors.right.isDown) || this.wasd.d.isDown) {
			this.phBody.setVelocityX(this.movementSpeed);
		} else {
			this.phBody.setVelocityX(0);
		}

		// Vertical movement
		if ((this.cursors.up && this.cursors.up.isDown) || this.wasd.w.isDown) {
			this.phBody.setVelocityY(-this.movementSpeed);
		} else if ((this.cursors.down && this.cursors.down.isDown) || this.wasd.s.isDown) {
			this.phBody.setVelocityY(this.movementSpeed);
		} else {
			this.phBody.setVelocityY(0);
		}

		// Attack

	}
}