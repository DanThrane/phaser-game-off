
export interface IEntityStats {
	immortal?: boolean, // cannot die
	ethereal?: boolean, // cannot run out of mana
	health: number, // zero to die
	mana: number, // spell resource
	atk: number, // attack power
	def: number // resistance
}

export class Entity extends Phaser.Physics.Arcade.Sprite {
	
	constructor(
		scene: Phaser.Scene,
		x: number, y: number,
		texture: string,
		protected stats: IEntityStats,
		frame?: string | number
	) {
		super(scene, x, y, texture, frame);
		this.stats.immortal = false;
		this.stats.ethereal = false;

		this.scene.add.existing(this);
	}

	public create() {}

	public get isDead() {
		return this.stats.health <= 0;
	}

	public damagedByOtherEntity(other: Entity) {
		this.stats.health -= Math.abs(other.stats.atk - this.stats.def);
	}
}