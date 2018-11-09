// import { FOREVER } from "phaser";
// import DungeonGeneration from "../DungeonGeneration";


// export class BootScene extends Phaser.Scene {
//   constructor() {
//     super({
//       key: "BootScene"
//     });
//   }

//   private platforms: Phaser.Physics.Arcade.StaticGroup;
//   private stars: Phaser.Physics.Arcade.Group;
//   private player: Phaser.Physics.Arcade.Sprite;
//   private playerCanWallJump: boolean = false;

//   private cursors: CursorKeys;
//   private score: number = 0;
//   private scoreText: Phaser.GameObjects.Text;

//   private dungeonGeneration: DungeonGeneration;

//   preload() {
//     this.load.image(Sprites.BOMB, "assets/bomb.png");
//     this.load.image(Sprites.PLATFORM, "assets/platform.png");
//     this.load.image(Sprites.SKY, "assets/sky.png");
//     this.load.image(Sprites.STAR, "assets/star.png");
//     this.load.image(Sprites.WALL, "assets/bricksdefault.png");

//     this.load.spritesheet(
//       Sprites.DUDE,
//       "assets/dude.png",
//       { frameWidth: 32, frameHeight: 48 }
//     );
//   }

//   create() {
//     let platforms = this.physics.add.staticGroup();

//     this.dungeonGeneration = new DungeonGeneration(this.physics);

//     this.platforms = platforms;
//     this.platforms.addMultiple(this.dungeonGeneration.buildLayout());

//     let player = this.player = this.physics.add.sprite(100, 450, Sprites.DUDE);
//     player.setCollideWorldBounds(true);
//     this.physics.add.collider(player, platforms);
//     this.cameras.main.startFollow(player, true);

//     this.anims.create({
//       key: "left",
//       frames: this.anims.generateFrameNumbers(Sprites.DUDE, { start: 0, end: 3 }),
//       frameRate: 10,
//       repeat: FOREVER
//     });

//     this.anims.create({
//       key: "turn",
//       frames: [{ key: Sprites.DUDE, frame: 4 }],
//       frameRate: 10,
//       repeat: FOREVER
//     });

//     this.anims.create({
//       key: "right",
//       frames: this.anims.generateFrameNumbers(Sprites.DUDE, { start: 5, end: 8 }),
//       frameRate: 10,
//       repeat: FOREVER
//     });

//     this.cursors = this.input.keyboard.createCursorKeys();

//     this.scoreText = this.add.text(16, 16, "Score: 0",
//       { fontSize: "32px", fill: "#fff" }).setScrollFactor(0);

//     this.add.text(16, this.game.canvas.height - 32, "Move on arrow keys",
//       { fontSize: "16px", fill: "#fff" }).setScrollFactor(0);
//   }

//   update() {
//     const movementSpeed = 320;
//     let animSet = false;
//     if (this.cursors.left.isDown) {
//       this.player.setVelocityX(-movementSpeed + (this.cursors.shift.isDown ? -80 : 0));
//       this.player.anims.play("left", true);
//       animSet = true;
//     } else if (this.cursors.right.isDown) {
//       this.player.setVelocityX(movementSpeed + (this.cursors.shift.isDown ? 80 : 0));
//       this.player.anims.play("right", true);
//       animSet = true;
//     } else {
//       this.player.body.setVelocityX(0);
//       this.player.anims.play("turn", true);
//     }

//     if (this.cursors.up.isDown) {
//       this.player.setVelocityY(-movementSpeed + (this.cursors.shift.isDown ? -80 : 0));
//       if (!animSet) {
//         this.player.anims.play("left", true);
//         animSet = true;
//       }
//     } else if (this.cursors.down.isDown) {
//       this.player.setVelocityY(movementSpeed + (this.cursors.shift.isDown ? 80 : 0));
//       if (!animSet) {
//         this.player.anims.play("right", true);
//         animSet = true;
//       }
//     } else {
//       this.player.body.setVelocityY(0);
//       if (!animSet) {
//         this.player.anims.play("turn", true);
//         animSet = true;
//       }
//     }
//   }
// }

// export enum Sprites {
//   BOMB = "bomb",
//   DUDE = "dude",
//   PLATFORM = "platform",
//   SKY = "sky",
//   STAR = "star",
//   WALL = "wall"
// }