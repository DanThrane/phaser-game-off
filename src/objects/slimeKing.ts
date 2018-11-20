import { Entity } from "./entity";
import { FOREVER, NONE } from "phaser";
import { Player } from "./player";
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

const enum States {
	IDLE = "idle",
	WALKING_TOWARD_PLAYER = "WALKING_TOWARD_PLAYER",
	CHARGING = "charging",
	SHOOT_AT_PLAYER = "SHOOT_AT_PLAYER",
	DEAD = "dead"
}

interface DeadState {
	state: States.DEAD
}

interface IdleState {
	state: States.IDLE,
	update: (self: SlimeKing, player: Entity) => void,
	exitCondition: (self: SlimeKing, player: Entity) => boolean
	followStates: [States.WALKING_TOWARD_PLAYER]
}

const IdleState = (): IdleState => ({
	state: States.IDLE,
	update: (self: SlimeKing, player: Entity) => undefined,
	exitCondition: (self: SlimeKing, player: Entity) => player.getCenter().distance(self.getCenter()) < 500,
	followStates: [States.WALKING_TOWARD_PLAYER]
});

interface WalkingState {
	state: States.WALKING_TOWARD_PLAYER
	update: (self: SlimeKing, player: Entity) => void
	exitCondition: (self: SlimeKing, player: Entity) => boolean
	nextStateTransition: number
	followStates: [States.CHARGING, States.SHOOT_AT_PLAYER]
}

const WalkingState = (nextStateTransition: number): WalkingState => ({
	state: States.WALKING_TOWARD_PLAYER,
	update: (self: SlimeKing, player: Entity) => {
		let playerPos = player.getCenter()
		let pointer = playerPos.subtract(self.getCenter()).normalize();
		let movementVec = pointer.scale(self.movementSpeed);
		self.setVelocity(movementVec.x, movementVec.y);
	},
	nextStateTransition,
	exitCondition: (self: SlimeKing, player: Entity) => player.getCenter().distance(self.getCenter()) > 500,
	followStates: [States.CHARGING, States.SHOOT_AT_PLAYER]
});

interface ShootingAtPlayerState {
	state: States.SHOOT_AT_PLAYER
	update: (self: SlimeKing, player: Entity) => void
	nextShot: number
	shotsRemaining: number
	exitCondition: (self: SlimeKing, player: Entity) => boolean
	followStates: [States.WALKING_TOWARD_PLAYER]
}

const ShootingAtPlayerState = (): ShootingAtPlayerState => ({
	state: States.SHOOT_AT_PLAYER,
	update: (self: SlimeKing, player: Entity) => {
		if ((self.stateObject as ShootingAtPlayerState).nextShot < new Date().getTime()) {
			console.log((self.stateObject as ShootingAtPlayerState).nextShot)
			self.setAcceleration(0, 0);
			let pew = SlimeKing.slimePew.get(self.x, self.y);
			if (pew) {
				pew.setActive(true);
				pew.setVisible(true);
				pew.body.x = self.x;
				pew.body.y = self.y;

				let pointerToPlayer = player.getCenter().subtract(self.getCenter()).normalize();
				let speedAdded = pointerToPlayer.scale(300);
				pew.body.velocity.x = speedAdded.x;
				pew.body.velocity.y = speedAdded.y;
				(self.stateObject as ShootingAtPlayerState).nextShot = new Date().getTime() + 400;
				(self.stateObject as ShootingAtPlayerState).shotsRemaining--;
			}
		}
	},
	nextShot: new Date().getTime(),
	shotsRemaining: 3,
	exitCondition: (self: SlimeKing, player: Entity) => ((self.stateObject as ShootingAtPlayerState).shotsRemaining === 0),
	followStates: [States.WALKING_TOWARD_PLAYER]
});

interface ChargingState {
	state: States.CHARGING
	update: (self: SlimeKing, player: Entity, dt: number) => void
	chargeDistanceRemaining: number
	exitCondition: (self: SlimeKing, player: Entity) => boolean
	followStates: [States.WALKING_TOWARD_PLAYER]
}

const ChargingState = (): ChargingState => ({
	state: States.CHARGING,
	update: (self: SlimeKing, player: Entity, dt: number) => {
		let playerPos = player.getCenter()
		let pointer = playerPos.subtract(self.getCenter()).normalize();
		let movementVec = pointer.scale(self.movementSpeed * 5);
		self.setVelocity(movementVec.x, movementVec.y);
		(self.stateObject as ChargingState).chargeDistanceRemaining -= dt;
	},
	chargeDistanceRemaining: 2500,
	exitCondition: (self: SlimeKing, player: Entity) => (self.stateObject as ChargingState).chargeDistanceRemaining <= 0,
	followStates: [States.WALKING_TOWARD_PLAYER]
});


export class SlimeKing extends CharacterEntity {
	private phBody!: Phaser.Physics.Arcade.Body;
	stateObject: IdleState | WalkingState | ShootingAtPlayerState | ChargingState | DeadState = IdleState();
	public static slimePew: Phaser.Physics.Arcade.Group;
	public static group: Phaser.GameObjects.Group;

	movementSpeed = 30; // normal not charging
	protected health = 500;
	protected mana = 80;

	detectionRadius = 500
	reach = 180
	immortal = false
	ethereal = false
	maxHealth = 500
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
		this.phBody.syncBounds = true;
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
			defaultKey: "bomb"
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

	public get state() {
		return this.stateObject.state;
	}

	public update(time: number, dt: number): void {
		switch (this.stateObject.state) {
			case States.DEAD: {
				return;
			}
			case States.IDLE: {
				if (this.stateObject.exitCondition(this, this.externalRefs.player)) {
					this.stateObject = WalkingState(new Date().getTime() + 3000);
				}
				return;
			}
			case States.WALKING_TOWARD_PLAYER: {
				this.stateObject.update(this, this.externalRefs.player);
				if (this.stateObject.nextStateTransition < new Date().getTime()) {
					const nextState = this.stateObject.followStates[Math.random() * this.stateObject.followStates.length | 0];
					if (nextState === States.CHARGING) {
						this.stateObject = ChargingState();
					} else if (nextState === States.SHOOT_AT_PLAYER) {
						this.stateObject = ShootingAtPlayerState();
					}
				}
				if (this.getCenter().distance(this.externalRefs.player.getCenter()) > 800) {
					this.stateObject = IdleState();
				}
				return;
			}
			case States.CHARGING: {
				if (this.stateObject.exitCondition(this, this.externalRefs.player)) {
					this.stateObject = WalkingState(new Date().getTime() + 3000);
				} else {
					this.stateObject.update(this, this.externalRefs.player, dt);
				}
				return;
			}
			case States.SHOOT_AT_PLAYER:
				if (this.stateObject.exitCondition(this, this.externalRefs.player)) {
					this.stateObject = WalkingState(new Date().getTime() + 3000);
				}
				this.stateObject.update(this, this.externalRefs.player);
				return;
		}
		/* 
		
				if (this.isDead) {
					state = States.DEAD;
				} else if (this.state === States.IDLE) {
					// chase - no real path finding
					let playerPosition = this.externalRefs.player.getCenter()
					let distanceToPlayer = this.getCenter().distance(playerPosition);
					let canReachPlayer = distanceToPlayer <= this.width + this.movementParameters.reach;
					let isPlayerWithinDetectionRadius = distanceToPlayer <= this.movementParameters.detectionRadius;
		
					let line = new Phaser.Geom.Line(playerPosition.x, playerPosition.y, this.x, this.y);
		
					let tilesInTheWay = this.externalRefs.map.getTilesWithinShape(line, {
						isColliding: true,
						isNotEmpty: true
					}, this.scene.cameras.main);
		
					if (isPlayerWithinDetectionRadius && !canReachPlayer && tilesInTheWay.length === 0) {
						state = States.WALKING_TOWARD_PLAYER;
					} else if (canReachPlayer && tilesInTheWay.length === 0) {
						state = States.SHOOT_AT_PLAYER;
					}
				} else if (this.stateObject.state === States.CHARGING) {
		
				}
				this.emit(state, time, dt); */
	}

	private subscribeToEvents() {
		this.on(States.IDLE, () => {
			this.anims.play("slimeking_idle", true)
			this.setVelocity(0, 0)
		});
	}
}