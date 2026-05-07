class Bullet extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {        
        super(scene, x, y, texture, frame);
        this.visible = false;
        this.active = false;

        this.bulletAnim = null;
        this.bulletHitAnim = null;
        this.speed = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.useVelocity = false;
        
        // Twinshooter wiggle state
        this.wiggle = false;
        this.baseX = 0;
        this.baseY = 0;
        this.wiggleTime = 0;
        this.wiggleFrequency = 0;
        this.wiggleAmp = 0;
        this.baseAngle = 0;
        this.twinShotDir = 0;

        // Bomber Bomb State
        this.isBomb = false;
        this.bomberAimAngle = 0;
        this.bombThreshold = 0;
        this.onBombThreshold = null;
        this.enemyBulletGroup = null;

    }

    update(time, delta) {
        let dt = delta / 1000;
        if (this.active) {
            if(this.wiggle){

                this.wiggleTime += dt;

                let travelDist = this.speed * (delta / 1000);
                this.baseX += Math.cos(this.baseAngle) * travelDist;
                this.baseY += Math.sin(this.baseAngle) * travelDist;

                let perpX = -Math.sin(this.baseAngle);
                let perpY = Math.cos(this.baseAngle);

                let displacement = this.wiggleAmp * Math.sin(this.wiggleTime * this.wiggleFrequency * Math.PI * 2.0) * this.twinShotDir;

                this.x = this.baseX + perpX * displacement;
                this.y = this.baseY + perpY * displacement;
            }
            else{
                if(this.useVelocity){
                    this.x += this.velocityX * dt;
                    this.y += this.velocityY * dt;
                } else {
                    this.y += this.speed * dt;
                }
            }

            if(this.isBomb && this.onBombThreshold && this.y >= this.bombThreshold){
                let cb = this.onBombThreshold;
                let group = this.enemyBulletGroup;

                this.onBombThreshold = null;
                this.enemyBulletGroup = null;
                cb(this, group);
            }

            if (
                this.y < -(this.displayHeight/2) ||
                this.y > this.scene.scale.height + this.displayHeight ||
                this.x < -(this.displayWidth/2) ||
                this.x > this.scene.scale.width + this.displayWidth
            ) {
                this.makeInactive();
            }
        }
    }

    makeActive() {
        this.visible = true;
        this.active = true;
    }

    makeInactive() {

        this.visible = false;
        this.active = false;
        if(this.anims) this.anims.stop();

        this.bulletAnim = null;
        this.bulletHitAnim = null;
        this.speed = 0;
        this.useVelocity = false;
        this.velocityX = 0;
        this.velocityY = 0;
        this.flipY = false;
        this.rotation = 0;

        // Twinshooter wiggle state
        this.wiggle = false;
        this.baseX = 0;
        this.baseY = 0;
        this.wiggleTime = 0;
        this.wiggleFrequency = 0;
        this.wiggleAmp = 0;
        this.baseAngle = 0;
        this.twinShotDir = 0;

        // Bomber Bomb State
        this.isBomb = false;
        this.bomberAimAngle = 0;
        this.bombThreshold = 0;
        this.onBombThreshold = null;
        this.enemyBulletGroup = null;
    }

}