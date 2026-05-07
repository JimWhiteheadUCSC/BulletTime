class ArrayBoom extends Phaser.Scene {
    constructor() {
        super("arrayBoom");
        this.my = {sprite: {}, text: {}};

        this.playerSpeed = 600;

        this.bulletCooldown = 250;        // Number of update() calls to wait before making a new bullet
        this.bulletCooldownCounter = 0;

        this.enemies = [];
        this.enemyWaveCount = 0;
        this.wave = 1;

        //startX, startY, enemyNum
        this.levelObjectArr = [
            {   
                level: "Level 1",
                fighter: [0, 0, 0],
                bomber: [92, 92, 4],
                twinShooter: [0, 184, 1], 
                support: [128, 184, 3],
            },
            {
                level: "Level 2",
                fighter: [92, 92, 3],
                bomber: [0, 0, 0],
                twinShooter: [128, 184, 2], 
                support: [0, 0, 0],
            },
            {
                level: "Level 3",
                fighter: [128, 138, 3],
                bomber: [92, 92, 4],
                twinShooter: [0, 0, 0], 
                support: [128, 184, 7],
            },
            {
                level: "Level 4",
                fighter: [0, 0, 0],
                bomber: [0, 0, 0],
                twinShooter: [64, 92, 2], 
                support: [128, 230, 7],
            },
            {
                level: "Level 5",
                fighter: [128, 138, 3],
                bomber: [0, 92, 1],
                twinShooter: [64, 184, 4], 
                support: [128, 230, 7],
            },
        ];
        this.showHitboxes = false;
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

        // For animation
        this.load.image("whitePuff00", "whitePuff00.png");
        this.load.image("whitePuff01", "whitePuff01.png");
        this.load.image("whitePuff02", "whitePuff02.png");
        this.load.image("whitePuff03", "whitePuff03.png");

        //Load Bitmap Font
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
        
        this.load.audio("DeathEmit", "explosion.wav");
    }

    create() {
        let my = this.my;

        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.nextScene = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        my.sprite.playerShip = new Player(this, game.config.width/2, game.config.height - 40, "playerShip", null, this.left, this.right, this.playerSpeed, this.showHitboxes);
        my.sprite.playerShip.setScale(2.0);

        /////////////////////////
        // Player Bullet Group //
        /////////////////////////

        my.sprite.bulletGroup = this.add.group({
            active: true,
            defaultKey: "playerShot",
            maxSize: 5,
            runChildUpdate: true
            }
        )

        //Create bullets at once
        my.sprite.bulletGroup.createMultiple({
            classType: Bullet,
            active: false,
            key: my.sprite.bulletGroup.defaultKey,
            setScale: {
                x:2.0,
                y:2.0
            },
            repeat: my.sprite.bulletGroup.maxSize-1
        });

        my.sprite.bulletGroup.propertyValueSet("speed", -this.bulletSpeed);

        my.sprite.bulletGroup.getChildren().forEach(element => {
            element.makeInactive();
        });

        ////////////////////////
        // Enemy Bullet Group //
        ////////////////////////

        let enemyBGMax = 300;

        my.sprite.enemyBulletGroup = this.add.group({
            active: true,
            defaultKey: "playerShot",
            maxSize: enemyBGMax,
            runChildUpdate: true
            }
        )

        //Create bullets at once
        my.sprite.enemyBulletGroup.createMultiple({
            classType: Bullet,
            active: false,
            key: my.sprite.bulletGroup.defaultKey,
            setScale: {
                x:2.0,
                y:-2.0
            },
            repeat: enemyBGMax-1
        });

        my.sprite.enemyBulletGroup.propertyValueSet("speed", 400);

        my.sprite.enemyBulletGroup.getChildren().forEach(element => {
            element.makeInactive();
        });

        // Player Hit
        this.anims.create({
            key: "playerHit",
            frames: [
                { key: "bomb3" },
                { key: "bomb4" },
            ],
            frameRate: 8,    // Note: case sensitive (thank you Ivy!)
            repeat: 0,
            hideOnComplete: true
        });

        // Create white puff animation
        this.anims.create({
            key: "puff",
            frames: [
                { key: "whitePuff00" },
                { key: "whitePuff01" },
                { key: "whitePuff02" },
                { key: "whitePuff03" },
            ],
            frameRate: 20,    // Note: case sensitive (thank you Ivy!)
            repeat: 5,
            hideOnComplete: true
        });

        // Bomb animation
        this.anims.create({
            key: "ANIMbomb",
            frames: [
                { key: "bomb0" },
                { key: "bomb1" },
            ],
            frameRate: 8,    // Note: case sensitive (thank you Ivy!)
            repeat: -1,
            hideOnComplete: true
        });

        // On hit explosion
        this.anims.create({
            key: "explosion",
            frames: [
                { key: "bomb1" },
                { key: "bomb2" },
                { key: "bomb3" },
                { key: "bomb4" },
            ],
            frameRate: 8,    // Note: case sensitive (thank you Ivy!)
            repeat: 0,
            hideOnComplete: true
        });

        // Put score on screen
        my.text.score = this.add.bitmapText(game.config.width, 0, "rocketSquare", "Score " + this.game.config.score);
        my.text.score.x -= my.text.score.displayWidth + 5;

        my.text.waveText = this.add.bitmapText(0, 0, "rocketSquare", "Wave " + this.wave);
        my.text.waveText.setScale(2.0);
        my.text.waveText.x = game.config.width/2 - my.text.waveText.displayWidth/2;
        my.text.waveText.y = game.config.height/2 - my.text.waveText.displayHeight/2;

        // Game Over Text
        my.text.gameOverText = this.add.bitmapText(0, 0, "rocketSquare", "GAME OVER");
        my.text.gameOverText.setScale(2.0);
        my.text.gameOverText.x = game.config.width/2 - my.text.gameOverText.displayWidth/2;
        my.text.gameOverText.y = game.config.height/2 - my.text.gameOverText.displayHeight/2;
        my.text.gameOverText.alpha = 0;

        this.waveTween = this.tweens.chain({
            targets: my.text.waveText,
            tweens: [
                { alpha: 0, duration: 1000, ease: 'Sine.easeInOut', repeat: 2},
                {
                    alpha: 0,
                    duration: 500, 
                    onComplete: () => {
                        this.waveTween.destroy();
                        this.resetEnemies();
                    }
                }
            ]
        });

        my.explodeSFX = this.sound.add('DeathEmit',  { volume: 0.5, loop: false });

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Array Boom.js</h2><br>A: left // D: right // Space: fire/emit // S: Next Scene'
    }

    update(time, delta) {
        let my = this.my;
        let dt = delta/1000;

        this.bulletCooldownCounter -= delta;

        // Check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space) && my.sprite.playerShip.isActive) {
            if (this.bulletCooldownCounter < 0) {
                // Get the first inactive bullet, and make it active
                let bullet = my.sprite.bulletGroup.getFirstDead();
                // bullet will be null if there are no inactive (available) bullets
                if (bullet != null) {
                    this.bulletCooldownCounter = this.bulletCooldown;
                    bullet.makeInactive();
                    bullet.makeActive();
                    bullet.x = my.sprite.playerShip.x;
                    bullet.y = my.sprite.playerShip.y - (my.sprite.playerShip.displayHeight/2);
                    bullet.speed = my.sprite.playerShip.bulletSpeed;
                }
            }
        }

        // update the player avatar by by calling the playerShip's update()
        my.sprite.playerShip.update(time, delta);

        // Hit Enemy
        for(let enemy of this.enemies){
            if(!enemy.active || !enemy.visible) continue;

            enemy.firingEnabled = true;

            //Call enemy update
            //this.callEnemyUpdate(time, delta, enemy);
            enemy.update(time, delta, my.sprite.playerShip.x, my.sprite.enemyBulletGroup);

            if(!enemy.hitbox) continue;
            
            // Check for collision with the enemy
            for(let bullet of my.sprite.bulletGroup.getChildren()){
                if(!bullet.active) continue;

                let bulletBox = {
                    x: bullet.x,
                    y: bullet.y,
                    w: bullet.displayWidth,
                    h: bullet.displayHeight,
                };

                if(CollisionBox.overlaps(enemy.hitbox, bulletBox)){
                    this.hitEnemy(enemy, bullet);
                }
            }
        }
        
        // Hit Player
        for (let bullet of my.sprite.enemyBulletGroup.getChildren()) {
            if (!bullet.active) continue;

            let bulletBox = {
                    x: bullet.x,
                    y: bullet.y,
                    w: bullet.displayWidth,
                    h: bullet.displayHeight,
            };

            if(CollisionBox.overlaps(my.sprite.playerShip.hitbox, bulletBox)){
                if(bullet.bulletHitAnim){
                    console.log("ZOINKS");
                    this.explode = this.add.sprite(bullet.x, bullet.y, "bomb1").setScale(2.0).play(bullet.bulletHitAnim);
                }
                bullet.makeInactive();
                this.puff = this.add.sprite(my.sprite.playerShip.x, my.sprite.playerShip.y, "whitePuff03").setScale(0.25).play("puff");
                my.sprite.playerShip.visible = false;
                my.sprite.playerShip.isActive = false;

                //let lastPuff = this.puff;
                //lastPuff.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                //    this.scene.start("arrayBoom");
                //}, this);
                my.explodeSFX.play();
                this.gameOver();
            }
        }

        // Enemy Player Collide
        if(!my.sprite.playerShip.hitbox) return;
        for (let enemy of this.enemies) {
            if(!enemy.active || !enemy.visible || !enemy.hitbox) continue;
            if(CollisionBox.overlaps(enemy.hitbox, my.sprite.playerShip.hitbox)){
                
                enemy.health = 0;

                // start animation
                this.enemypuff = this.add.sprite(enemy.x, enemy.y, "whitePuff03").setScale(0.25).play("puff");
                this.playerpuff = this.add.sprite(my.sprite.playerShip.x, my.sprite.playerShip.y, "whitePuff03").setScale(0.25).play("puff");

                enemy.visible = false;
                enemy.x = -100;
                
                my.sprite.playerShip.visible = false;
                my.sprite.playerShip.isActive = false;

                my.explodeSFX.play();

                this.gameOver();
            }
        }

    }

    /*
    callEnemyUpdate(time, delta, enemy){

        let my = this.my;
        let type = enemy.constructor.name;

        switch(type){
            case "Fighter":
                //console.log("Fighter");
                enemy.update(time, delta, my.sprite.playerShip.x, my.sprite.enemyBulletGroup);
                break;
            case "Bomber":
                //console.log("Bomber");
                enemy.update(time, delta, my.sprite.playerShip.x, my.sprite.enemyBulletGroup);
                break;
            case "TwinShooter":
                //console.log("TwinShooter");
                enemy.update(time, delta, my.sprite.playerShip.x, my.sprite.enemyBulletGroup);
                break;
            default:
                //console.log("Support");
                enemy.update(time, delta, my.sprite.playerShip.x, my.sprite.enemyBulletGroup);
                break;
        }
    }
    */

    gameOver(){

        let my = this.my;

        my.sprite.playerShip.destroy();

        this.gameOverTween = this.tweens.chain({
            targets: my.text.gameOverText,
            tweens: [
                { 
                    alpha: 1, 
                    duration: 1000, 
                    ease: 'Sine.easeInOut', 
                },
                {
                    alpha: 0,
                    duration: 500, 
                    onComplete: () => {
                        this.resetSelf();
                        this.scene.start("scoreboard");
                    }
                }
            ]
        });
    }

    hitEnemy(enemy, bullet){

        enemy.health --;
        bullet.makeInactive();

        if(enemy.health > 0){
            this.playerHit = this.add.sprite(enemy.x, enemy.y, "bomb3").setScale(2.0).play("playerHit");
            if(enemy.constructor.name === "Bomber") enemy.increaseBulletSpreadCount();
            return;
        }

        // start animation
        this.puff = this.add.sprite(enemy.x, enemy.y, "whitePuff03").setScale(0.25).play("puff");

        enemy.visible = false;
        enemy.x = -100;
        // Update score
        this.game.config.score += enemy.scorePoints;
        this.updateScore();
        // Play sound
        this.my.explodeSFX.play();
        
        this.enemyWaveCount --;
        if(this.enemyWaveCount > 0) return;
        
        // Have new wave appear if count is 0
        let lastPuff = this.puff;
        lastPuff.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.nextWave();
        }, this);
    }

    resetEnemies(){

        let my = this.my;

        my.sprite.enemyBulletGroup.getChildren().forEach(element => {
            element.makeInactive();
        });

        for(let enemy of this.enemies){
            enemy.destroy();
        }

        this.enemies = [];

        this.levelCreator();

        if(this.enemyContainer) this.enemyContainer.destroy();
        this.enemyContainer = this.add.container(0, 0, this.enemies);

        let tweenTargets = this.enemies.filter(
            enemy => !(enemy instanceof Bomber) && 
                     !(enemy instanceof TwinShooter) && 
                     !(enemy instanceof Support)
        );

        if(this.moveXTween) this.moveXTween.destroy();
        if(tweenTargets.length > 0){
            this.moveXTween = this.tweens.add({
                targets: tweenTargets,
                x: {
                    getStart: (target) => target.startX,
                    getEnd: (target) => target.startX - 64,
                },
                duration: 500,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }

        if(this.moveYTween) this.moveYTween.destroy();
        this.moveYTween = this.tweens.add({
            targets: this.enemyContainer,
            y: {
                getStart: (target) => 0,
                getEnd: (target) => -25,
            },
            duration: 1500,
            ease: 'Quad.easeInOut',
            yoyo: true,
            repeat: -1
        });

        //this.myScore += this.wave * 1000;
        //this.wave += 1;
        //this.updateScore();

        this.enemyWaveCount = this.enemies.length;
    }

    nextWave(){
        this.game.config.score += 500;
        this.updateScore();

        this.enemyMaxWaveCount += 4;
        if(this.enemyMaxWaveCount>54){
            this.enemyMaxWaveCount = 54;
        }
        
        this.wave++;
        this.updateWave();
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.game.config.score);
        my.text.score.x = game.config.width - (my.text.score.displayWidth + 5);
    }

    updateWave(){
        let my = this.my;
        
        my.text.waveText.setText("Wave " + this.wave);
        my.text.waveText.x = game.config.width/2 - my.text.waveText.displayWidth/2;
        my.text.waveText.y = game.config.height/2 - my.text.waveText.displayHeight/2;
        //my.text.waveText.alpha = 1.0;

        this.waveTween = this.tweens.chain({
            targets: my.text.waveText,
            tweens: [
                { alpha: 1, duration: 1000, ease: 'Sine.easeInOut', repeat: 2},
                {
                    alpha: 0,
                    duration: 500, 
                    onComplete: () => {
                        this.waveTween.destroy();
                        this.resetEnemies();
                    }
                }
            ]
        });
    }

    levelCreator(){

        let lvl = this.wave - 1;
        
        if(lvl > this.levelObjectArr.length - 1) lvl = this.getIntFromRange(0, this.levelObjectArr.length - 1);

        console.log(lvl);
        let levelObj = this.levelObjectArr[lvl];

        this.createRow(levelObj.fighter[0], levelObj.fighter[1], levelObj.fighter[2], Fighter);
        this.createRow(levelObj.bomber[0], levelObj.bomber[1], levelObj.bomber[2], Bomber);
        this.createRow(levelObj.twinShooter[0], levelObj.twinShooter[1], levelObj.twinShooter[2], TwinShooter);
        this.createRow(levelObj.support[0], levelObj.support[1], levelObj.support[2], Support);
    
    }

    createRow(startX, startY, enemyNum, enemyType){

        if(enemyNum<=0) return;

        startX = (enemyNum > 1) ? startX : game.config.width/2;
        let endX = game.config.width - startX;
        let dx = endX - startX;
        let inc = (enemyNum > 1) ? dx / (enemyNum - 1) : 0;

        for(let i=0; i < enemyNum; i++){

            //let col = i % columns;
            //let row = Math.floor(i/columns);

            //let x = startX + col * size;
            //let y = startY + row * size;

            let x = startX + i * inc;
            let y = startY;

            this.enemies.push(new enemyType(this, x, y, this.my.sprite.playerShip));

        }

    }

    resetSelf(){

        this.my.sprite.playerShip.setActive();
        this.playerSpeed = 600;

        this.bulletCooldown = 250;        // Number of update() calls to wait before making a new bullet
        this.bulletCooldownCounter = 0;

        for(let enemy of this.enemies){
            enemy.destroy();
        }

        this.enemies = [];

        this.enemyWaveCount = 0;
        this.wave = 1;

    }

    getIntFromRange(min, max){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
         