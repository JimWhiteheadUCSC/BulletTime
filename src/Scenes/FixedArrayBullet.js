class FixedArrayBullet extends Phaser.Scene {
    constructor() {
        super("fixedArrayBullet");

        // Initialize a class variable "my" which is an object.
        // The object has one property, "sprite" which is also an object.
        // This will be used to hold bindings (pointers) to created sprites.
        this.my = {sprite: {}};

        // Create a property inside "sprite" named "bullet".
        // The bullet property has a value which is an array.
        // This array will hold bindings (pointers) to bullet sprites
        this.my.sprite.bullet = [];   
        this.maxBullets = 10;           // Don't create more than this many bullets
        this.bulletCooldown = 3;        // Number of update() calls to wait before making a new bullet
        this.bulletCooldownCounter = 0;
        
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("elephant", "elephant.png");
        this.load.image("heart", "heart.png");
    }

    create() {
        let my = this.my;

        my.sprite.elephant = this.add.sprite(game.config.width/2, game.config.height - 40, "elephant");
        my.sprite.elephant.setScale(0.25);

        // In this approach we *do* create all of the bullet sprites in create(), since we will just
        // keep reusing them
        for (let i=0; i < this.maxBullets; i++) {
            // create a sprite which is offscreen and invisible
            my.sprite.bullet.push(this.add.sprite(-100, -100, "heart"));
            my.sprite.bullet[i].visible = false;
        }

        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.nextScene = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 5;
        this.bulletSpeed = 5;

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Fixed Array Bullet.js</h2><br>A: left // D: right // Space: fire/emit // S: Next Scene'

    }

    update() {
        let my = this.my;
        this.bulletCooldownCounter--;

        // Moving left
        if (this.left.isDown) {
            // Check to make sure the sprite can actually move left
            if (my.sprite.elephant.x > (my.sprite.elephant.displayWidth/2)) {
                my.sprite.elephant.x -= this.playerSpeed;
            }
        }

        // Moving right
        if (this.right.isDown) {
            // Check to make sure the sprite can actually move right
            if (my.sprite.elephant.x < (game.config.width - (my.sprite.elephant.displayWidth/2))) {
                my.sprite.elephant.x += this.playerSpeed;
            }
        }

        // Check for bullet being fired
        if (this.space.isDown) {
            if (this.bulletCooldownCounter < 0) {
                // Check for an available bullet
                for (let bullet of my.sprite.bullet) {
                    // If the bullet is invisible, it's available
                    if (!bullet.visible) {
                        bullet.x = my.sprite.elephant.x;
                        bullet.y = my.sprite.elephant.y - (bullet.displayHeight/2);
                        bullet.visible = true;
                        this.bulletCooldownCounter = this.bulletCooldown;
                        break;    // Exit the loop, so we only activate one bullet at a time
                    }
                }
            }
            
        }

        // Make all of the bullets move
        for (let bullet of my.sprite.bullet) {
            // if the bullet is visibile it's active, so move it
            if (bullet.visible) {
                bullet.y -= this.bulletSpeed;
            }
            // Did the bullet move offscreen? If so,
            // make it inactive (make it invisible)
            // This allows us to re-use bullet sprites
            if (bullet.y < -(bullet.displayHeight/2)) {
                bullet.visible = false;
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("groupBullet");
        }

    }
}
         