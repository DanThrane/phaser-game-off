import { Entity, IEntityStats } from "./entity";


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

export class Slime extends Entity {
	private phBody!: Phaser.Physics.Arcade.Body;
	private nextAllowedAttack: number = 0;
 
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
	
	create() {
		this.anims.load("crawling");
		this.anims.load("standing");
		this.anims.load("throw");
		this.setupEvents()
	}

	update() {

		// chase - no real path finding does not check visiblity too
		let me = this.getCenter() // this should be the center of the body instead or the player bounding circle should fit better the sprite
		let playerDist = this.externalRefs.player.getCenter()
		let distanceToPlayer = me.distance(playerDist);

		let canReachPlayer = distanceToPlayer <= this.width + this.movementParameters.reach;

		if (
			!this.externalRefs.player.isDead &&
			distanceToPlayer <= this.movementParameters.detectionRadius && 
			distanceToPlayer > this.width + this.movementParameters.reach
		) {
			this.anims.play("crawling", true)
			let pointer = playerDist.subtract(me).normalize();
			
			if (pointer.x > 0) {
				this.setFlipX(true)
			} else {
				this.setFlipX(false)
			}

			let movementVec = pointer.scale(this.movementParameters.movementSpeed);

			this.setVelocity(movementVec.x, movementVec.y);
		} else if (!this.externalRefs.player.isDead && canReachPlayer) {
			this.anims.play("throw", true)
			this.setVelocity(0, 0);

			const now = new Date().getTime();
			if (now > this.nextAllowedAttack) {
				this.emit('pew');
				this.nextAllowedAttack = now + 250;
			}

		} else {
			this.anims.play("standing", true)
			this.setVelocity(0, 0)
		}
	}

	private setupEvents() {
		this.once('death', () => {
			// I am deaded
			this.phBody.enable = false
			this.externalRefs.myGroup.kill(this)
			this.setVelocity(0,0);
		});
	}
}