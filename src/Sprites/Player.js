class Player extends Phaser.GameObjects.Sprite {

    // x,y - starting sprite location
    // spriteKey - key for the sprite image asset
    // leftKey - key for moving left
    // rightKey - key for moving right
    constructor(scene, x, y, texture, frame, leftKey, rightKey, playerSpeed, showHitboxes = false) {
        super(scene, x, y, texture, frame);

        this.left = leftKey;
        this.right = rightKey;
        this.playerSpeed = playerSpeed;
        
        this.score = 0;
        this.bulletSpeed = -1000;
        this.isActive = true;

        scene.add.existing(this);

        this.hitbox = new CollisionBox(scene, this, 20, 30, showHitboxes);
        return this;
    }

    update(time, delta) {
        let dt = delta / 1000;

        if(!this.isActive) return;

        // Moving left
        if (this.left.isDown) {
            // Check to make sure the sprite can actually move left
            if (this.x > 0) {
                this.x -= this.playerSpeed * dt;
            }
        }

        // Moving right
        if (this.right.isDown) {
            // Check to make sure the sprite can actually move right
            if (this.x < (game.config.width)) {
                this.x += this.playerSpeed * dt;
            }
        }
        
        if(!this.hitbox) return;
        this.hitbox.update(this.x, this.y);
    }

    checkActive(){
        return this.isActive;
    }

    setInactive(){
        this.isActive = false;
        this.visible = false;
        this.hitbox.destroy();
    }

    setActive(){
        this.isActive = true;
        this.visible = true;
        if(this.hitbox) return;
        this.hitbox = new CollisionBox(scene, this, 20, 30, showHitboxes);
    }

    destroy(fromScene){
        if(this.hitbox) this.hitbox.destroy();
        super.destroy(fromScene);
    }

}