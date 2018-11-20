import { Entity } from "./entity";

export abstract class CharacterEntity extends Entity {
    
    protected abstract health: number;
    protected abstract mana: number;
    protected abstract movementSpeed: number;
    protected abstract atk:    number; 			// attack power
    protected abstract def:    number;			// resistance 

    protected abstract immortal: boolean; 		// cannot die
    protected abstract ethereal: boolean;	 	// cannot run out of mana
    protected abstract maxHealth: number;
    protected abstract maxMana:   number;
    // properties such as attack power and maxMana is bound to the "meta" class

    constructor(
        scene: Phaser.Scene, 
        x: number, y: number, 
        texture: string, 
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);
    }

    public damagedByOther(char: CharacterEntity) {
        this.health -= Math.abs(char.atk - char.def)
    }

    public get isDead() {
        return this.health <= 0;
    }

}