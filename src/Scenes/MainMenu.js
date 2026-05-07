class MainMenu extends Phaser.Scene {
    constructor() {
        super("mainMenu");
        this.my = {sprite: {}, text: {}};
    }

    preload() {

        this.load.setPath("./assets/");

        //Player Sprites
        this.load.image("playerShip", "kenney_pixel-shmup/Ships/ship_0012.png");
        this.load.image("playerShot", "kenney_pixel-shmup/Tiles/tile_0000.png");
        
        //Fighter Sprites
        this.load.image("fighter", "kenney_pixel-shmup/Ships/ship_0002.png");

        //Bomber Sprites
        this.load.image("bomber", "kenney_pixel-shmup/Ships/ship_0003.png");
        this.load.image("bomb0", "kenney_pixel-shmup/Tiles/tile_0004.png");
        this.load.image("bomb1", "kenney_pixel-shmup/Tiles/tile_0006.png");
        this.load.image("bomb2", "kenney_pixel-shmup/Tiles/tile_0005.png");
        this.load.image("bomb3", "kenney_pixel-shmup/Tiles/tile_0007.png");
        this.load.image("bomb4", "kenney_pixel-shmup/Tiles/tile_0008.png");

        //Twinshooter Sprites
        this.load.image("twinshooter", "kenney_pixel-shmup/Ships/ship_0008.png");
        this.load.image("twinshot", "kenney_pixel-shmup/Tiles/tile_0001.png");

        //Support sprites
        this.load.image("support", "kenney_pixel-shmup/Ships/ship_0009.png");

        //Load Bitmap Font
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        // Audio
        this.load.audio("BGM", "CyberMenuSong.mp3");
        //this.load.audio("Death", "RRES.ogg");
    }

    create() {
        let my = this.my;

        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.nextScene = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        my.text.mainMenuText = this.add.bitmapText(0, 0, "rocketSquare", "JetFighter");
        my.text.mainMenuText.setScale(2.0);
        my.text.mainMenuText.scaleY *= 4.0;
        my.text.mainMenuText.x = game.config.width/2 - my.text.mainMenuText.displayWidth/2;
        my.text.mainMenuText.y = game.config.height/2 - my.text.mainMenuText.displayHeight/2;

        my.text.mainMenuText.setInteractive();

        my.text.mainMenuText.on('pointerdown', (pointer) => {
            this.scene.start("arrayBoom");
        });

        my.sprite.menuFighter = this.add.sprite(game.config.width/2, game.config.height/2, "fighter");
        my.sprite.menuFighter.setScale(12.0);
        my.sprite.menuFighter.rotation = 202.5 * (Math.PI / 180);
        my.sprite.menuFighter.setDepth(-1);

        this.mainMenuTween = this.tweens.chain({
            targets: [my.text.mainMenuText, my.sprite.menuFighter],
            tweens: [
                { y: '-= 50', duration: 1000, ease: 'Sine.easeInOut', repeat: -1, yoyo: true},
            ]
        });

        this.backgroundMusic = this.sound.add('BGM',  { volume: 0.5, loop: true });
        this.backgroundMusic.play();
    }


    //if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
    //        this.scene.start("fixedArrayBullet");
    //    }
}