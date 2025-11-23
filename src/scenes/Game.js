import Phaser from "../lib/phaser.js";

export default class Game extends Phaser.Scene 
{
    constructor()
    {
        super('game')
    }

    preload()
    {
        this.load.image('background', 'assets/bg_layer1.png');

        // load platform PNGs
        this.load.image('platform', 'assets/ground_grass.png');
    }

    create()
    {
        this.add.image(240, 320, 'background');

        // add a platform in the middle
        this.add.image(240, 320, 'platform')
            .setScale(0.5);
    }
}