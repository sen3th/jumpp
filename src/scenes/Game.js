import Phaser from "../lib/phaser.js";
import carrot from "../game/Carrot.js";
import goldenCarrot from "../game/goldenCarrot.js";
import springman from "../game/springman.js";

export default class Game extends Phaser.Scene 
{
    carrotsCollected = 0

    cursors

    init()
    {
        this.carrotsCollected = 0
    }
    
    addGoldenCarrotsAbove(sprite)
    {
        const y = sprite.y - sprite.displayHeight

        const goldenCarrot = this.goldenCarrots.get(sprite.x, y, 'goldenCarrot')

        goldenCarrot.setActive(true)
        goldenCarrot.setVisible(true)

        this.add.existing(goldenCarrot)

        this.physics.world.enable(goldenCarrot)

        goldenCarrot.body.setSize(goldenCarrot.width, goldenCarrot.height)
        return goldenCarrot
    }

    addSpringMenAbove(sprite)
    {
        const y = sprite.y - sprite.displayHeight

        const springman = this.springmen.get(sprite.x, y, 'springMan')

        springman.setActive(true)
        springman.setVisible(true)

        this.add.existing(springman)

        this.physics.world.enable(springman)

        springman.body.setSize(springman.width, springman.height)
        return springman
    }

    addCarrotsAbove(sprite)
    {
        const y = sprite.y - sprite.displayHeight

        const carrot = this.carrots.get(sprite.x, y, 'carrot')

        carrot.setActive(true)
        carrot.setVisible(true)

        this.add.existing(carrot)

        this.physics.world.enable(carrot)

        carrot.body.setSize(carrot.width, carrot.height)

        return carrot
    }
    
    handleCollectCarrot(player, carrot)
    {
        this.carrots.killAndHide(carrot)
        this.physics.world.disableBody(carrot.body)
        carrot.body.enable = false

        this.carrotsCollected++

        this.sound.play('carrotCollect')

        const value = `Carrots: ${this.carrotsCollected}`
        this.carrotsCollectedText.text = value

        if (this.carrotsCollected <= 0) {
            this.carrotsCollected = 0
            this.carrotsCollectedText.text = 'Carrots: 0'
        }
    }

    handleCollectGoldenCarrot(player, goldenCarrot)
    {
        this.goldenCarrots.killAndHide(goldenCarrot)
        this.physics.world.disableBody(goldenCarrot.body)
        goldenCarrot.body.enable = false
        this.carrotsCollected += 5
        this.sound.play('goldenCarrotCollect')

        const value = `Carrots: ${this.carrotsCollected}`
        this.carrotsCollectedText.text = value

          if (this.carrotsCollected <= 0) {
            this.carrotsCollected = 0
            this.carrotsCollectedText.text = 'Carrots: 0'
        }
    }

    handleSpringMen(player, springman)
    {
        this.springmen.killAndHide(springman)
        this.physics.world.disableBody(springman.body)
        springman.body.enable = false
        this.carrotsCollected -= 10

        const value = `Carrots: ${this.carrotsCollected}`
        this.carrotsCollectedText.text = value

          if (this.carrotsCollected <= 0) {
            this.carrotsCollected = 0
            this.carrotsCollectedText.text = 'Carrots: 0'
        }
    }

    constructor()
    {
        super('game')
    }

    preload()
    {
      this.load.image('background', 'assets/bg_layer1.png');

        // load platform PNGs
        this.load.image('platform', 'assets/ground_grass.png');

        this.load.image('bunny-stand', 'assets/bunny1_stand.png');
        
        this.load.image('carrot', 'assets/carrot.png');

        this.load.image('bunny-jump', 'assets/bunny1_jump.png')

        this.load.image('goldenCarrot', 'assets/carrot_gold.png');

        this.load.image('springMan', 'assets/springman_stand.png');

        //sound effects
        this.load.audio('jump', 'assets/sfx/phaseJump1.mp3')
        this.load.audio('carrotCollect', 'assets/sfx/pepSound1.mp3')
        this.load.audio('goldenCarrotCollect', 'assets/sfx/pepSound2.mp3')
    }

    create()
    {
        this.add.image(240, 320, 'background')
            .setScrollFactor(1, 0);

        this.platforms = this.physics.add.staticGroup();

        for (let i = 0; i < 5; ++i)
        {
            const x = Phaser.Math.Between(80, 400);
            const y = 150 * i;

            const platform = this.platforms.create(x, y, 'platform');
            platform.scale = 0.5;

            const body = platform.body;
            body.updateFromGameObject();
        }

        this.player = this.physics.add.sprite(240, 320, 'bunny-stand')
            .setScale(0.5);

        this.physics.add.collider(this.platforms, this.player);

        this.player.body.checkCollision.up = false;
        this.player.body.checkCollision.left = false;
        this.player.body.checkCollision.right = false;

        this.cameras.main.startFollow(this.player);

        // horizontal deadzone
        this.cameras.main.setDeadzone(this.scale.width * 1.5)

        this.cursors = this.input.keyboard.createCursorKeys();

        this.carrots = this.physics.add.group({
            classType: carrot
        })

        this.goldenCarrots = this.physics.add.group({
            classType: carrot
        })

        this.springmen = this.physics.add.group({
            classType: springman
        })

        this.physics.add.collider(this.platforms, this.carrots)
        this.physics.add.collider(this.platforms, this.goldenCarrots)

        this.physics.add.overlap(
            this.player,
            this.carrots,
            this.handleCollectCarrot,
            undefined,
            this
        )

        this.physics.add.overlap(
            this.player,
            this.goldenCarrots,
            this.handleCollectGoldenCarrot,
            undefined,
            this
        )

        this.physics.add.overlap(
            this.player,
            this.springmen,
            this.handleSpringMen,
            undefined,
            this
        )

        const style = { color: '#000', fontSize: 24 };
        this.carrotsCollectedText = this.add.text(240, 10, 'Carrots: 0', style)
            .setScrollFactor(0)
            .setOrigin(0.5, 0)
    }

    update()
    { 
        // finds out if the sprite is touching anything below
        const touchingDown = this.player.body.touching.down;

        if (touchingDown)
        {
            // making the bunny jump up straight
            this.player.setVelocityY(-325);
            this.player.setTexture('bunny-jump');
            this.sound.play('jump');
        }

        const vy = this.player.body.velocity.y
        if (vy > 0 && this.player.texture.key !== 'bunny-stand')
        {
            this.player.setTexture('bunny-stand');
        }

        
        // horizontal movement
        if (this.cursors.left.isDown && !touchingDown)
        {
            this.player.setVelocityX(-200)
        }
        else if (this.cursors.right.isDown && !touchingDown)
        {
            this.player.setVelocityX(200)
        }
        else
        {
            this.player.setVelocityX(0)
        }

        this.platforms.children.iterate(child => {

            const platform = child

            const scrollY = this.cameras.main.scrollY
            if (platform.y >= scrollY + 700)
            {
                platform.y = scrollY - Phaser.Math.Between(50, 100);
                platform.body.updateFromGameObject();

                // golden carrot chance
                if (Phaser.Math.Between(1, 10) === 1) {
                    this.addGoldenCarrotsAbove(platform);
                    this.addSpringMenAbove(platform);
                } else {
                    this.addCarrotsAbove(platform);
                }
            }
        })

        this.horizontalWrap(this.player);

        const bottomPlatform = this.findBottomMostPlatform()
        if (this.player.y > bottomPlatform.y + 200)
        {
            this.scene.start('game-over');
        }
    }

    horizontalWrap(sprite)
    {
        const halfWidth = sprite.displayWidth * 0.5
        const gameWidth = this.scale.width

        if (sprite.x < -halfWidth)
        {
            sprite.x = gameWidth + halfWidth
        }
        else if (sprite.x > gameWidth + halfWidth)
        {
            sprite.x = -halfWidth
        }
    }

    findBottomMostPlatform()
    {
        const platforms = this.platforms.getChildren()
        let bottomPlatform = platforms[0]

        for (let i = 1; i < platforms.length; i++)
        {
            const platform = platforms[i]

            if (platform.y < bottomPlatform.y)
            {
                continue
            }
            bottomPlatform = platform
        }
        return bottomPlatform
    }
}