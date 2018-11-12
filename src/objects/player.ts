import { Entity } from "./entity";

type WASDkeys = {
	w: Phaser.Input.Keyboard.Key
	s: Phaser.Input.Keyboard.Key
	a: Phaser.Input.Keyboard.Key
	d: Phaser.Input.Keyboard.Key
}

export class Player extends Entity {
	private cursors: CursorKeys;
	private wasd: any;
	private mouseX: number = 0;
	private mouseY: number = 0;
	private nextAllowedAttack: number = 0;
	private clock!: Phaser.Time.Clock;
	private phBody!: Phaser.Physics.Arcade.Body;
	
	public movementSpeed = 320;

	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
		super(scene, x, y, texture, frame);
		this.cursors = this.scene.input.keyboard.createCursorKeys();
		this.wasd = this.scene.input.keyboard.addKeys("w,a,s,d");
		this.clock = new Phaser.Time.Clock(this.scene);
		// TODO We had a previous check for cursors == undefined. I removed
		// would we really want to have that failure be silent? Can this method
		// even return undefined?

		this.scene.input.mouse.enabled = true;

		this.scene.input.activePointer.x;

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
		// Hvor henter man delta time for sprites?
		const now = new Date().getTime();
		if (this.scene.input.activePointer.isDown && now > this.nextAllowedAttack) {
			// Logic for shooting here
			
			this.nextAllowedAttack = now + 300;
		}

	}
}