

export abstract class Weapon {
    fireRate: number = 0;
    nextAllowedAttack: number = 0;
    shotsPerFire: number = 0;
    shotSpeed: number = 0;
    abstract shoot(normalizedVector: Phaser.Math.Vector2): Phaser.Math.Vector2[];
}


export class Pistol extends Weapon {
    fireRate: 250 = 250;
    nextAllowedAttack: number = 0;
    shotsPerFire: number = 1;
    shotSpeed: number = 1024;
    shoot(normalizedVector: Phaser.Math.Vector2): Phaser.Math.Vector2[] {
        const now = new Date().getTime();
        if (this.nextAllowedAttack < now) {
            this.nextAllowedAttack = now + this.fireRate;
            // FIXME: Play sound
            return [normalizedVector.scale(this.shotSpeed)];
        }
        return [];
    }
}

export class Shotgun extends Weapon {
    fireRate: 750 = 750;
    nextAllowedAttack: number = 0;
    shotsPerFire: number = 8;
    shotSpeed: number = 768;
    shoot = (normalizedVector: Phaser.Math.Vector2): Phaser.Math.Vector2[] => {
        const now = new Date().getTime();
        if (this.nextAllowedAttack < now) {
            this.nextAllowedAttack = now + this.fireRate;
            // FIXME: Play sound
            normalizedVector.scale(this.shotSpeed);
            return [...Array(this.shotsPerFire).keys()].map(_ =>
                new Phaser.Math.Vector2(normalizedVector.x + rand(100, 200), normalizedVector.y + rand(100, 200))
            );
        }
        return [];
    }
}

export class Minigun extends Weapon {
    fireRate: 100 = 100;
    nextAllowedAttack: number = 0;
    shotsPerFire: number = 1;
    shotSpeed: number = 1500;

    shoot = (normalizedVector: Phaser.Math.Vector2): Phaser.Math.Vector2[] => {
        const now = new Date().getTime();
        if (this.nextAllowedAttack < now) {
            this.nextAllowedAttack = now + this.fireRate;
            // FIXME: Play sound
            normalizedVector.scale(this.shotSpeed);
            return [new Phaser.Math.Vector2(normalizedVector.x + rand(20, 50), normalizedVector.y + rand(20, 50))]
        }
        return [];
    }
}

const rand = (offset: number, maxRand: number) => Math.random() * maxRand + offset;