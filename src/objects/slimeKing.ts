import { Entity, IEntityStats } from "./entity";
import { FOREVER, NONE } from "phaser";


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
	IDLE = "idle"
}

export class SlimeKing extends Entity {
	private phBody!: Phaser.Physics.Arcade.Body;
	private currentState: States = States.IDLE;
	public static slimePew: Phaser.Physics.Arcade.Group;
	public static group: Phaser.GameObjects.Group;

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
		this.phBody.syncBounds =  true;

		this.setDepth(1);
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
	}
	
	/**
	 * Per instance create method.
	 */
	public create(): void {
		this.anims.load("slimeking_idle");
		this.subscribeToEvents();
	}

	public get state() {
		return this.currentState;
	}

	public update(time: number, dt: number): void {
		let state = States.IDLE;
/*
		if (this.isDead) {
			//state = States.DEATH;
		} else {
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

			if ( isPlayerWithinDetectionRadius && !canReachPlayer && tilesInTheWay.length === 0 ) {
				//state = States.WALKING_TOWARD_PLAYER;
			} else if ( canReachPlayer && tilesInTheWay.length === 0 ) {
				//state = States.SHOOT_AT_PLAYER;
			} 
		}
*/
		this.currentState = state;
		this.emit(state, time, dt);
	}

	private subscribeToEvents() {
		this.on(States.IDLE, () => {
			this.anims.play("slimeking_idle", true)
			this.setVelocity(0, 0)
		});
	}
}