import { FOREVER, Physics } from "phaser";
import { buildLayout } from "../DungeonGeneration";

const genres = ["rogue-like", "racing", "turn-based", "platformer", "tower defense", "last stand (Horde mode)",
  "RPG", "JRPG (Overworld + turn-based combat)", "simulator", "sport", "strategy", "beat 'em up", "shoot 'em up",
  "Dungeon Crawler"];
const hybrid = `${genres[(Math.random() * genres.length) | 0]} + ${genres[Math.random() * genres.length | 0]}`

const BLOCK_SIZE = 32;

export class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: "BootScene"
    });
  }

  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private stars: Phaser.Physics.Arcade.Group;
  private player: Phaser.Physics.Arcade.Sprite;
  private playerCanWallJump: boolean = false;

  private cursors: CursorKeys;
  private score: number = 0;
  private scoreText: Phaser.GameObjects.Text;
  private dunGenOffsetX: number = 0;
  private dunGenOffsetY: number = 200;


  preload() {
    this.load.image(Sprites.BOMB, "assets/bomb.png");
    this.load.image(Sprites.PLATFORM, "assets/platform.png");
    this.load.image(Sprites.SKY, "assets/sky.png");
    this.load.image(Sprites.STAR, "assets/star.png");
    this.load.image(Sprites.WALL, "assets/bricksdefault.png");

    this.load.spritesheet(
      Sprites.DUDE,
      "assets/dude.png",
      { frameWidth: 32, frameHeight: 48 }
    );
  }

  create() {
    this.add.image(400, 300, Sprites.SKY);

    let platforms = this.physics.add.staticGroup();

    (platforms.create(400, 568, Sprites.PLATFORM) as Phaser.Physics.Arcade.Sprite)
      .setScale(2)
      .refreshBody();

    platforms.create(600, 368, Sprites.PLATFORM);
    platforms.create(600, 400, Sprites.PLATFORM);
    platforms.create(600, 432, Sprites.PLATFORM);

    platforms.create(50, 250, Sprites.PLATFORM);
    platforms.create(50, 282, Sprites.PLATFORM);
    platforms.create(50, 314, Sprites.PLATFORM);

    platforms.create(750, 220, Sprites.PLATFORM);

    this.platforms = platforms;
    // Uncomment me out for generation
    /* for (let i = 0; i < 4; i++) {
      let { room, width, height } = buildLayout(this.dunGenOffsetX, this.dunGenOffsetY, this.physics);
      this.dunGenOffsetX += width * BLOCK_SIZE - BLOCK_SIZE; // Final block should overlap with next
      this.platforms.addMultiple(room)
    } */


    let player = this.player = this.physics.add.sprite(100, 450, Sprites.DUDE);
    player
      .setBounce(0.2)
      .setCollideWorldBounds(true)
      .setMaxVelocity(400)
      .setDrag(150);

    this.cameras.main.startFollow(player, true);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(Sprites.DUDE, { start: 0, end: 3 }),
      frameRate: 10,
      repeat: FOREVER
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: Sprites.DUDE, frame: 4 }],
      frameRate: 10,
      repeat: FOREVER
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers(Sprites.DUDE, { start: 5, end: 8 }),
      frameRate: 10,
      repeat: FOREVER
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    let stars = this.stars = this.physics.add.group({
      key: Sprites.STAR,
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });;

    this.stars.children.iterate(child => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    }, null);

    this.physics.add.collider(player, platforms, () => this.playerCanWallJump = true);
    this.physics.add.collider(stars, platforms);

    this.physics.add.overlap(player, stars, (_, star: Physics.Arcade.Sprite) => {
      star.disableBody(true, true);
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);
    }, null, this);

    this.scoreText = this.add.text(16, 16, "Score: 0",
      { fontSize: "32px", fill: "#fff" }).setScrollFactor(0);

    this.add.text(16, 48, hybrid,
      { fontSize: "16px", fill: "#fff" }).setScrollFactor(0);

    this.add.text(16, this.game.canvas.height - 32, "Move on arrow keys, wall jump by pressing up on contact",
      { fontSize: "16px", fill: "#fff" }).setScrollFactor(0);
  }

  update() {
    const movementSpeed = 320;

    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-movementSpeed + (this.cursors.shift.isDown ? -80 : 0));
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(movementSpeed + (this.cursors.shift.isDown ? 80 : 0));
      this.player.anims.play("right", true);
    } else {
      this.player.body.acceleration.set(0);
      this.player.anims.play("turn");
    }

    // Standard jump
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }

    // Wall jump, left
    if (this.cursors.up.isDown && this.playerCanWallJump) {
      if (this.player.body.touching.left) {
        this.player.setVelocityX(300)
        this.player.setVelocityY(-300);
      }

      // Wall jump, right
      if (this.player.body.touching.right) {
        this.player.setVelocityX(-300)
        this.player.setVelocityY(-300);
      }
    }
    this.playerCanWallJump = false;
  }
}

export enum Sprites {
  BOMB = "bomb",
  DUDE = "dude",
  PLATFORM = "platform",
  SKY = "sky",
  STAR = "star",
  WALL = "wall"
}