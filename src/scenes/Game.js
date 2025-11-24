import Phaser from "../lib/phaser.js";
import carrot from "../game/Carrot.js";

export default class Game extends Phaser.Scene 
{
    carrotsCollected = 0

    cursors
    
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

        const value = `Carrots: ${this.carrotsCollected}`
        this.carrotsCollectedText.text = value
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

        this.physics.add.collider(this.platforms, this.carrots)

        this.physics.add.overlap(
            this.player,
            this.carrots,
            this.handleCollectCarrot,
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
            this.player.setVelocityY(-300);
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

                this.addCarrotsAbove(platform);
            }
        })

        this.horizontalWrap(this.player);
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
}