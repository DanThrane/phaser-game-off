import { FOREVER, Physics } from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: "BootScene"
    });
  }

  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private stars: Phaser.Physics.Arcade.Group;
  private player: Phaser.Physics.Arcade.Sprite;
  private cursors: CursorKeys;
  private score: number = 0;
  private scoreText: Phaser.GameObjects.Text;

  preload() {
    this.load.image(Sprites.BOMB, "assets/bomb.png");
    this.load.image(Sprites.PLATFORM, "assets/platform.png");
    this.load.image(Sprites.SKY, "assets/sky.png");
    this.load.image(Sprites.STAR, "assets/star.png");

    this.load.spritesheet(
      Sprites.DUDE,
      "assets/dude.png",
      { frameWidth: 32, frameHeight: 48 }
    );
  }

  create() {
    this.add.image(400, 300, Sprites.SKY);
    this.add.image(400, 300, Sprites.STAR);

    let platforms = this.physics.add.staticGroup();

    (platforms.create(400, 568, Sprites.PLATFORM) as Phaser.Physics.Arcade.Sprite)
      .setScale(2)
      .refreshBody();

    platforms.create(600, 400, Sprites.PLATFORM);
    platforms.create(50, 250, Sprites.PLATFORM);
    platforms.create(750, 220, Sprites.PLATFORM);

    this.platforms = platforms;

    let player = this.player = this.physics.add.sprite(100, 450, Sprites.DUDE);
    player
      .setBounce(0.2)
      .setCollideWorldBounds(true);

    this.cameras.main.startFollow(this.player, true);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(Sprites.DUDE, { start: 0, end: 3 }),
      frameRate: 10,
      repeat: FOREVER
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: Sprites.DUDE, frame: 5 }],
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

    this.stars.children.iterate((child) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    }, null);

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);

    this.physics.add.overlap(player, stars, (_, star: Physics.Arcade.Sprite) => {
      star.disableBody(true, true)

      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);
    }, null, this);

    this.scoreText = this.add.text(16, 16, "Score: 0",
      { fontSize: "32px", fill: "#fff" }).setScrollFactor(0);
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
}

enum Sprites {
  BOMB = "bomb",
  DUDE = "dude",
  PLATFORM = "platform",
  SKY = "sky",
  STAR = "star"
}