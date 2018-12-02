import { Entity } from "./entity";
import { FOREVER } from "phaser";
import { CharacterEntity } from "./character";


interface IAIMovementParameters {
	movementSpeed: number,
	detectionRadius: number,
	reach: number
}

interface IExternalReferences {
	player: Entity,
	map: Phaser.Tilemaps.Tilemap
}

export const enum States {
	IDLE = "idle",
	WALKING_TOWARD_PLAYER = "WALKING_TOWARD_PLAYER",
	CHARGING = "charging",
	SHOOT_AT_PLAYER = "SHOOT_AT_PLAYER",
	DEAD = "dead",
	KNOCKBACK = "knockback"
}

const WalkingState = (time: number): [number, number, number] => [time + 3000, 0, 0];
const ShootingAtPlayerState = (time: number): [number, number, number] => [6, time, 0]
const ChargingState = (): [number, number, number] => [2500, 0, 0];

export class SlimeKing extends CharacterEntity {
	private phBody!: Phaser.Physics.Arcade.Body;
	private stateValues: [number, number, number] = [0, 0, 0];
	private currentState = States.IDLE;
	public static slimePew: Phaser.Physics.Arcade.Group;
	public static group: Phaser.GameObjects.Group;

	movementSpeed = 30; // normal not charging
	protected health = 800;
	protected mana = 80;

	detectionRadius = 500
	reach = 180
	immortal = false
	ethereal = false
	maxHealth = 800
	maxMana = 80
	atk = 6
	def = 1

	constructor(
		private externalRefs: IExternalReferences,
		scene: Phaser.Scene,
		x: number, y: number,
		texture: string,
		frame?: string | number
	) {
		super(scene, x, y, texture, frame);

		this.scene.physics.world.enable(this);
		this.phBody = this.body as Phaser.Physics.Arcade.Body;
		this.phBody.setCircle(165);
		this.phBody.syncBounds = true
		this.phBody.setImmovable(true)
	}

	static preload(scene: Phaser.Scene) {
		scene.load.spritesheet(
			"slimeking",
			"assets/slimeKing.png",
			{ frameWidth: 164, frameHeight: 128 }
		);
	}

	/**
	 * Stuff that needs to be created once, and not per instance.
	 * This is usually where you create animations because the animations 
	 * are detached by design from their sprites gameobjects
	 * @param scene scene ref
	 */
	static createOnce(scene: Phaser.Scene): void {
		scene.anims.create({
			key: "slimeking_idle",
			frameRate: 8,
			frames: scene.anims.generateFrameNumbers('slimeking', {
				start: 0,
				end: 5
			}),
			repeat: FOREVER
		});

		this.slimePew = scene.physics.add.group({
			defaultKey: "bomb",
			length: 3
		});

	}

	/**
	 * Per instance create method.
	 */
	public create(): void {
		this.anims.load("slimeking_idle");
		this.subscribeToEvents();
		
		this.setDepth(1);
	}

	public get state(): States {
		return this.currentState;
	}

	public update(time: number, dt: number): void {
		const { player } = this.externalRefs;

		if (this.isDead) {
			this.currentState = States.DEAD
			this.emit(this.currentState)
		}

		switch (this.state) {
			case States.IDLE: {
				if (player.getCenter().distance(this.getCenter()) < 500) {
					this.currentState = States.WALKING_TOWARD_PLAYER;
					this.stateValues = WalkingState(time);
				}
				return;
			}
			case States.WALKING_TOWARD_PLAYER: {
				const [nextStateTransition] = this.stateValues;
				if (player.getCenter().distance(this.getCenter()) > 1200) {
					this.setVelocity(0, 0);
					this.currentState = States.IDLE;
				} else if (nextStateTransition < time) {
					const nextState = [States.CHARGING, States.SHOOT_AT_PLAYER][Math.random() * 2 | 0];
					if (nextState === States.CHARGING) {
						this.currentState = States.CHARGING;
						this.stateValues = ChargingState();
					} else if (nextState === States.SHOOT_AT_PLAYER) {
						this.currentState = States.SHOOT_AT_PLAYER;
						this.stateValues = ShootingAtPlayerState(time);
					}
				}
				this.emit(States.WALKING_TOWARD_PLAYER, time, dt);
				return;
			}
			case States.SHOOT_AT_PLAYER: {
				const [shotsRemaining] = this.stateValues;
				if (shotsRemaining === 0) {
					this.stateValues = WalkingState(time);
					this.currentState = States.WALKING_TOWARD_PLAYER;

				}
				this.emit(States.SHOOT_AT_PLAYER, time, dt);
				return;
			}
			case States.CHARGING: {
				const [chargeDistanceRemaining] = this.stateValues;
				if (chargeDistanceRemaining <= 0) {
					this.stateValues = WalkingState(time);
					this.currentState = States.WALKING_TOWARD_PLAYER;
				}
				this.emit(States.CHARGING, time, dt);
				return;
			}
			case States.KNOCKBACK: {
				let dist: number = player.getCenter().distance(this.getCenter());

				if (dist >= 175) {
					this.currentState = States.WALKING_TOWARD_PLAYER;
					this.emit(States.WALKING_TOWARD_PLAYER, time, dt);
				}
			}
		}
	}

	private subscribeToEvents() {
		this.on(States.IDLE, () => {
			this.anims.play("slimeking_idle", true)
			this.setVelocity(0, 0)
			this.currentState = States.IDLE;
		});

		this.on(States.WALKING_TOWARD_PLAYER, () => {
			const { player } = this.externalRefs;
			let playerPos = player.getCenter()
			let pointer = playerPos.subtract(this.getCenter()).normalize();
			let movementVec = pointer.scale(this.movementSpeed);
			this.setVelocity(movementVec.x, movementVec.y);
		});

		this.on(States.SHOOT_AT_PLAYER, (time?: number) => {
			const { player } = this.externalRefs;
			const [shotsRemaining, nextShot] = this.stateValues;
			if (nextShot < time!) {
				this.setAcceleration(0, 0);
				let pew = SlimeKing.slimePew.get(this.x, this.y);
				if (pew) {
					pew.setActive(true);
					pew.setVisible(true);
					pew.body.x = this.x;
					pew.body.y = this.y;

					let pointerToPlayer = player.getCenter().subtract(this.getCenter()).normalize();
					let speedAdded = pointerToPlayer.scale(300);
					pew.body.velocity.x = speedAdded.x;
					pew.body.velocity.y = speedAdded.y;
					this.stateValues = [shotsRemaining - 1, time! + 200, 0];
				}
			}
		});

		this.on(States.CHARGING, (_?: number, dt?: number) => {
			const [chargeDistanceRemaining] = this.stateValues;
			const { player } = this.externalRefs;
			let playerPos = player.getCenter()
			let pointer = playerPos.subtract(this.getCenter()).normalize();
			let movementVec = pointer.scale(this.movementSpeed * 8);
			this.setVelocity(movementVec.x, movementVec.y);
			this.stateValues = [chargeDistanceRemaining - dt!, 0, 0];
		});

		this.on(States.KNOCKBACK, (time: number, dt: number) => {
			this.currentState = States.KNOCKBACK
			const { player } = this.externalRefs;
			this.phBody.allowDrag = true
			let pointer = player.getCenter().subtract(this.getCenter()).normalize();
			let rev = pointer.scale(-(this.movementSpeed))
			this.setVelocity(rev.x, rev.y)
		});

		this.on('hit', (damage: number, assailent?: CharacterEntity) => {
			this.health -= damage;
			console.log("boss hit", this.health)
		});

		this.once(States.DEAD, () => {
			this.setVelocity(0,0)
			this.phBody.enable = false
			this.setDepth(0);
		}) 
	}
}