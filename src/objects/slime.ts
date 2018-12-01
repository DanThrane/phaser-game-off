import { Entity } from "./entity";
import { FOREVER, NONE } from "phaser";
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
	DEATH = "death",
	WALKING_TOWARD_PLAYER = "walkingTowardsPlayer",
	SHOOT_AT_PLAYER	= "shootAtPlayer"
}

export class Slime extends CharacterEntity {
	private phBody!: Phaser.Physics.Arcade.Body;
	private nextAllowedAttack: number = 0;
	private currentState: States = States.IDLE;
	public static slimePew: Phaser.Physics.Arcade.Group;
	public static group: Phaser.GameObjects.Group;

	protected health = 80;
	protected mana = 20;
	movementSpeed = 20;
	immortal = false;
	ethereal = false;
	maxHealth = 80;
	maxMana = 20;
	atk = 3;
	def = 1;
	detectionRadius = 500;
	reach = 180;

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
		this.phBody.setCircle(12, 4, 12);
	}


	static preload(scene: Phaser.Scene) {
		scene.load.spritesheet(
			"slime",
			"assets/slime.png",
			{ frameWidth: 32, frameHeight: 32 }
		);
		scene.load.image("bomb", "assets/bomb.png");
	}

	/**
	 * Stuff that needs to be created once, and not per instance.
	 * This is usually where you create animations because the animations 
	 * are detached by design from their sprites gameobjects
	 * @param scene scene ref
	 */
	static createOnce(scene: Phaser.Scene): void {
		const sceneAnims = scene.anims;

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
			})
		});

		this.slimePew = scene.physics.add.group({
			defaultKey: "bomb"
		});

		Slime.group = scene.add.group([], {
			runChildUpdate: true,
			active: true
		})
	}
	
	/**
	 * Per instance create method.
	 */
	public create(): void {
		this.anims.load("crawling");
		this.anims.load("standing");
		this.anims.load("throw");
		this.anims.load("death");
		this.subscribeToEvents();
		this.setDepth(1);
	}

	public get state() {
		return this.currentState;
	}

	public update(time: number, dt: number): void {
		let state = States.IDLE;

		if (this.isDead) {
			state = States.DEATH;
		} else {
			// chase - no real path finding
			let playerPosition = this.externalRefs.player.getCenter()
			let distanceToPlayer = this.getCenter().distance(playerPosition);
			let canReachPlayer = distanceToPlayer <= this.width + this.reach;
			let isPlayerWithinDetectionRadius = distanceToPlayer <= this.detectionRadius;
	
			let line = new Phaser.Geom.Line(playerPosition.x, playerPosition.y, this.x, this.y);
	
			let tilesInTheWay = this.externalRefs.map.getTilesWithinShape(line, {
				isColliding: true,
				isNotEmpty: true
			}, this.scene.cameras.main);

			if ( isPlayerWithinDetectionRadius && !canReachPlayer && tilesInTheWay.length === 0 ) {
				state = States.WALKING_TOWARD_PLAYER;
			} else if ( canReachPlayer && tilesInTheWay.length === 0 ) {
				state = States.SHOOT_AT_PLAYER;
			}
		}

		this.currentState = state;
		this.emit(state, time, dt);
	}

	private subscribeToEvents() {
		this.once(States.DEATH, () => {
			this.setVelocity(0,0);

			// order here is very important
			this.anims.play("death")
			this.once('animationcomplete', () => {
				this.phBody.enable = false
				Slime.group.kill(this)
				this.externalRefs.player.emit('gotKill', this)
				this.setDepth(0);
			})			
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

			let movementVec = pointer.scale(this.movementSpeed);
			this.setVelocity(movementVec.x, movementVec.y);
		});

		this.on(States.SHOOT_AT_PLAYER, (time?: number) => {
			if (time) {
				this.anims.play("throw", true)
				this.setVelocity(0, 0);
				
				if (time > this.nextAllowedAttack) {
					let pew = Slime.slimePew.get(this.x, this.y);
					if (pew) {
						pew.setActive(true);
						pew.setVisible(true);
						pew.body.x = this.x;
						pew.body.y = this.y;

						let pointerToPlayer = this.externalRefs.player.getCenter().subtract(this.getCenter()).normalize();
						let speedAdded = pointerToPlayer.scale(300);
						pew.body.velocity.x = speedAdded.x;
						pew.body.velocity.y = speedAdded.y;
					}
					this.nextAllowedAttack = time + 250;
				}
			}
		});

		this.on(States.IDLE, () => {
			this.anims.play("standing", true)
			this.setVelocity(0, 0)
		});

		this.on('hit', (damage: number, assailant?: CharacterEntity) => {
			this.health -= damage;
		})
	}
}