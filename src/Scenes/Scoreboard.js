class Scoreboard extends Phaser.Scene {
    constructor() {
        super("scoreboard");
        this.my = {sprite: {}, text: {}};
    }

    preload() {

        this.load.setPath("./assets/");

        //Load Bitmap Font
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

    }

    create() {
        let my = this.my;

        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.nextScene = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        my.text.scoreBoard = this.add.bitmapText(0, 0, "rocketSquare", "Scoreboard");
        my.text.scoreBoard.setScale(2.0);
        my.text.scoreBoard.x = game.config.width/2 - my.text.scoreBoard.displayWidth/2
        my.text.scoreBoard.y = 10;

        my.text.scoreText = this.add.bitmapText(0, 0, "rocketSquare", "Score: 0");
        my.text.scoreText.setScale(1.0);
        my.text.scoreText.x = game.config.width/2 - my.text.scoreText.displayWidth/2;
        my.text.scoreText.y = game.config.height/2 - my.text.scoreText.displayHeight/2;

        my.text.menuText = this.add.bitmapText(0, 0, "rocketSquare", "Main Menu");
        my.text.menuText.setScale(1.0);
        my.text.menuText.x = 5;
        my.text.menuText.y = game.config.height - my.text.menuText.displayHeight - 5;
        my.text.menuText.setInteractive();

        my.text.menuText.on('pointerdown', (pointer) => {
            this.game.config.score = 0;
            this.scene.start("mainMenu");
        });

        my.text.returnText = this.add.bitmapText(0, 0, "rocketSquare", "Return?");
        my.text.returnText.setScale(1.0);
        my.text.returnText.x = game.config.width - my.text.returnText.displayWidth;
        my.text.returnText.y = game.config.height - my.text.returnText.displayHeight - 5;
        my.text.returnText.setInteractive();

        my.text.returnText.on('pointerdown', (pointer) => {
            this.game.config.score = 0;
            this.scene.start("arrayBoom");
        });

        let t = {progress: 0};

        let scoreScale = 1.0;

        if(this.game.config.score >= 1000){
            scoreScale = 1.5;
        } if(this.game.config.score >= 5000){
            scoreScale = 1.75;
        } if(this.game.config.score >= 10000){
            scoreScale = 2.0;
        }

        this.scoreTween = this.tweens.add({
            targets: [t, my.text.scoreText],
            scale: scoreScale,
            progress: 1,
            duration: 10000,
            ease: 'Expo.easeIn',
            onUpdate: () => {
                let scorePrint = this.game.config.score * t.progress;

                my.text.scoreText.setText(`Score: ${(this.game.config.score * t.progress).toFixed(0)}`);
                my.text.scoreText.x = game.config.width/2 - my.text.scoreText.displayWidth/2;
                my.text.scoreText.y = game.config.height/2 - my.text.scoreText.displayHeight/2;
            },
            onComplete: () => {
                this.game.config.score = 0;
                //console.log(this.game.config.score);
            }
        });


/*
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
        */
    }
    //if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
    //        this.scene.start("fixedArrayBullet");
    //    }
}