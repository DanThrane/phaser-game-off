import { Entity, IEntityStats } from "./entity";
import { FOREVER } from "phaser";


interface IAIMovementParameters {
	movementSpeed: number,
	detectionRadius: number,
	reach: number
}

interface IExternalReferences {
	player: Entity,
	map: Phaser.Tilemaps.Tilemap,
	myGroup: Phaser.GameObjects.Group
}

const enum States {
	IDLE = "idle",
	DEATH = "death",
	WALKING_TOWARD_PLAYER = "walkingTowardsPlayer",
	SHOOT_AT_PLAYER	= "shootAtPlayer"
}

export class Slime extends Entity {
	private phBody!: Phaser.Physics.Arcade.Body;
	private nextAllowedAttack: number = 0;
	private currentState: States = States.IDLE;

	constructor(
		private externalRefs: IExternalReferences,
		scene: Phaser.Scene,
		x: number, y: number,
		texture: string,
		frame?: string | number,
		stats: IEntityStats = {
			health: 80,
			mana: 20,
			atk: 3,
			def: 1
		},
		public movementParameters: IAIMovementParameters = {
			movementSpeed: 30,
			detectionRadius: 500,
			reach: 180
		}
	) {
		super(scene, x, y, texture, stats, frame);

		this.scene.physics.world.enable(this);
		this.phBody = this.body as Phaser.Physics.Arcade.Body;
		this.phBody.setCircle(12, 4, 12);
	}


	static preload(scene: Phaser.Scene) {
		scene.load.spritesheet(
			"slime",
			"assets/slime.png",
			{ frameWidth: 32, frameHeight: 32 }
		);
	}
	
	create(): void {
		const sceneAnims = this.scene.anims;

		sceneAnims.create({
			key: "throw",
			frameRate: 8,
			frames: sceneAnims.generateFrameNumbers('slime', {
				start: 0,
				end: 4
			}),
			repeat: FOREVER
		});

		sceneAnims.create({
			key: "standing",
			frameRate: 8,
			frames: sceneAnims.generateFrameNumbers('slime', {
				start: 5,
				end: 10
			}),
			repeat: FOREVER
		});

		sceneAnims.create({
			key: "crawling",
			frameRate: 14,
			frames: sceneAnims.generateFrameNumbers('slime', {
				start: 11,
				end: 19
			}),
			repeat: FOREVER
		});

		sceneAnims.create({
			key: "death",
			frameRate: 14,
			frames: sceneAnims.generateFrameNumbers('slime', {
				start: 20,
				end: 26
			}),
			repeat: FOREVER
		});

		this.anims.load("crawling");
		this.anims.load("standing");
		this.anims.load("throw");
		this.anims.load("death");
		this.setupEvents()
	}

	public get state() {
		return this.currentState;
	}

	update(time: number, dt: number): void {

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

		let state = States.IDLE;

		if ( isPlayerWithinDetectionRadius && !canReachPlayer && tilesInTheWay.length === 0 ) {
			state = States.WALKING_TOWARD_PLAYER;
		} else if (canReachPlayer && tilesInTheWay.length === 0 ) {
			state = States.SHOOT_AT_PLAYER; 
		}

		this.currentState = state;
		this.emit(state, time, dt);
	}

	public get state() {
		return this.currentState;
	}

	private setupEvents() {
		this.once(States.DEATH, () => {
			// I am deaded
			this.anims.play("death", true)
			this.phBody.enable = false
			this.externalRefs.myGroup.kill(this)
			this.setVelocity(0,0);
		});

		this.on(States.WALKING_TOWARD_PLAYER, () => {
			this.anims.play("crawling", true)
			let playerPos = this.externalRefs.player.getCenter()
			let pointer = playerPos.subtract(this.getCenter()).normalize();
			
			if (pointer.x > 0) {
				this.setFlipX(true)
			} else {
				this.setFlipX(false)
			}

			let movementVec = pointer.scale(this.movementParameters.movementSpeed);
			this.setVelocity(movementVec.x, movementVec.y);
		});

		this.on(States.SHOOT_AT_PLAYER, (time?: number) => {
			if (time) {
				this.anims.play("throw", true)
				this.setVelocity(0, 0);
				
				if (time > this.nextAllowedAttack) {
					this.emit("pew");
					this.nextAllowedAttack = time + 250;
				}
			}
		});

		this.on(States.IDLE, () => {
			this.anims.play("standing", true)
			this.setVelocity(0, 0)
		});
	}
}