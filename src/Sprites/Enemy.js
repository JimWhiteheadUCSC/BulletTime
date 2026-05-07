class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, health, scorePoints){
        super(scene, x, y, texture);
        scene.add.existing(this);

        this.health = health;
        this.scorePoints = scorePoints;
        this.startX = x;
        this.startY = y;
        this.firingEnabled = false;

        this.hitbox = null;
    }

    initHitbox(width, height){
        let show = this.scene.showHitboxes || false;
        this.hitbox = new Collisionbox(this.scene, this, width, height, show);
    }

    updateHitbox(worldX, worldY){
        if(this.hitbox) this.hitbox.update(worldX, worldY);
    }

    spawnBullet(enemyBulletGroup, worldX, worldY){
        let bullet = enemyBulletGroup.getFirstDead();
        if(!bullet) return null;

        bullet.makeInactive();
        bullet.makeActive();
        bullet.setTexture(this.bulletTexture);
        bullet.bulletAnim = this.bulletAnim;
        bullet.bulletHitAnim = this.bulletHitAnim;
        bullet.speed = this.shotSpeed;
        bullet.setScale(this.bulletScale);
        bullet.flipY = true;
        bullet.useVelocity = false;
        bullet.velocityX = 0;
        bullet.velocityY = 0;
        bullet.x = worldX;
        bullet.y = worldY;
        bullet.rotation = 0;

        // Twinshooter wiggle state
        bullet.wiggle = false;
        bullet.baseX = 0;
        bullet.baseY = 0;
        bullet.wiggleTime = 0;
        bullet.wiggleFrequency = 0;
        bullet.wiggleAmp = 0;
        bullet.baseAngle = 0;
        bullet.twinShotDir = 0;

        // Bomber Bomb State
        bullet.isBomb = false;
        bullet.bomberAimAngle = 0;

        if(bullet.bulletAnim){
            bullet.play(this.bulletAnim);
        } else {
            bullet.stop();
        }

        return bullet;
    }

    destroy(fromScene){
        if(this.hitbox) this.hitbox.destroy();
        super.destroy(fromScene);
    }
}

class Fighter extends Enemy{
    constructor(scene, x, y){
        super(scene, x, y, "fighter", 2, 100);
        this.setScale(2.0);
        this.flipY = true;

        this.shotSpeed = 500;
        this.firingEnabled = false;
        this.fireCooldown = 5000;
        this.fireCooldownCounter = (Math.random() * this.fireCooldown / 2.0) + (this.fireCooldown / 2.0);
        this.bulletTexture = "playerShot";
        this.bulletScale = 2.0;
        this.bulletAnim = null;
        this.bulletHitAnim = null;

        //Shotgun
        this.bulletSpreadCount = 5;
        this.bulletSpread = 10;

        //Dive Stuffs
        this.diveSpeed = 400;
        this.diving = false;
        this.reentering = false;
        this.follower = null;
        this.divePath = null;
        this.callShotGun = false;

        this.diveAngle = 0;

        this.initHitbox(28, 32);
    }

    startDive(playerX, enemyBulletGroup){
        let container = this.scene.enemyContainer;

        let worldX = this.x + container.x;
        let worldY = this.y + container.y;

        let targetX = playerX;
        let targetY = this.scene.scale.height + this.displayHeight;

        this.divePath = new Phaser.Curves.Path(worldX, worldY);
        this.divePath.lineTo(targetX, targetY);

        let pathLen = Phaser.Math.Distance.Between(worldX, worldY, targetX, targetY);
        let duration = (pathLen / this.diveSpeed) * 1000; // MS for delta

        this.follower = this.scene.add.follower(this.divePath, worldX, worldY, "fighter");
        this.follower.setScale(0); //Invisible to move enemy sprite manually
        this.follower.startFollow({
            duration: duration,
            ease: "Linear",
            repeat: 0,
            rotateToPath: false,
            onComplete: () => this.endDive()
        });

        let dx = targetX - worldX;
        let dy = targetY - worldY;
        this.diveAngle = Math.atan2(dy, dx);
        this.rotation = this.diveAngle - Math.PI / 2;

        this.diving = true;

        this.diveShotgun(worldX, worldY, enemyBulletGroup);
    }

    diveShotgun(worldX, worldY, enemyBulletGroup){
        this.callShotGun = false;
        let spreadRad = this.bulletSpread * Math.PI / 180.0;
        let initAngle = this.diveAngle - spreadRad * (this.bulletSpreadCount - 1) / 2;
        for(let i=0; i<this.bulletSpreadCount; i++){
            let angle = initAngle + i * spreadRad;
            let bullet = this.spawnBullet(enemyBulletGroup, worldX, worldY);
            if(bullet){
                bullet.useVelocity = true;
                bullet.velocityX = Math.cos(angle) * this.shotSpeed;
                bullet.velocityY = Math.sin(angle) * this.shotSpeed;
                bullet.rotation = angle - Math.PI / 2;
            }
        }
    }

    endDive(){

        if(this.follower) this.follower.destroy();
        this.divePath = null;
        
        this.diving = false;
        this.reentering = true;

        let container = this.scene.enemyContainer;
        let entryDist = 80;
        this.x = this.startX - Math.cos(this.diveAngle) * entryDist;
        this.y = -(this.displayHeight + container.y) - Math.sin(this.diveAngle) * entryDist;

        this.scene.tweens.add({
            targets: this,
            x: this.startX,
            y: this.startY,
            angle: 0,
            duration: 1000,
            ease: 'Sine.easeOut',
            onComplete: () => {
                this.reentering = false;
                this.fireCooldownCounter = this.fireCooldown;
            }
        });

    }

    update(time, delta, playerX, enemyBulletGroup){

        if(!this.firingEnabled) return;

        if(this.diving) {
            if(this.follower){

                let container = this.scene.enemyContainer;

                this.x = this.follower.x - container.x;
                this.y = this.follower.y - container.y;

                let worldX = this.follower.x;
                let worldY = this.follower.y;

                //console.log(`(${worldX}, ${worldY})`);
                this.updateHitbox(worldX, worldY);
            }
            return;
        }

        let worldX = this.x + this.scene.enemyContainer.x;
        let worldY = this.y + this.scene.enemyContainer.y;

        this.updateHitbox(worldX, worldY);

        //if(this.callShotGun) this.diveShotgun(worldX, worldY, enemyBulletGroup);
        if (this.reentering) return;

        this.fireCooldownCounter -= delta;
        if(this.fireCooldownCounter > 0) return;
        this.startDive(playerX, enemyBulletGroup);
    }
}

class Bomber extends Enemy{
    constructor(scene, x, y){
        super(scene, x, y, "bomber", 1, 100);
        this.setScale(2.0);
        this.flipY = true;

        this.shotSpeed = 250;
        this.firingEnabled = false;
        this.fireCooldown = 7500;
        this.fireCooldownCounter = (Math.random() * this.fireCooldown / 4.0) + 3.0 * (this.fireCooldown / 4.0);
        this.bulletTexture = "bomb1";
        this.bulletScale = 3.0;
        this.bulletAnim = "ANIMbomb";
        this.bulletHitAnim = "explosion";

        //Emits on explosion
        this.bulletSpreadCount = 8;
        this.bulletSpreadSpeed = 100;
        this.bulletSpreadRatio = 0.6; // When the bullets explode

        this.initHitbox(30, 30);
    }

    update(time, delta, playerX, enemyBulletGroup){

        if(!this.firingEnabled) return;

        let worldX = this.x + this.scene.enemyContainer.x;
        let worldY = this.y + this.scene.enemyContainer.y;

        this.updateHitbox(worldX, worldY);

        let dx = playerX - worldX;
        let dy = this.scene.scale.height - worldY;
        let aimAngle = Math.atan2(dy, dx);
        this.rotation = aimAngle - Math.PI / 2.0;

        this.fireCooldownCounter -= delta;
        if(this.fireCooldownCounter > 0) return;
        this.fireCooldownCounter = this.fireCooldown;

        let bullet = this.spawnBullet(enemyBulletGroup, worldX, worldY);
        if(!bullet) return;

        bullet.isBomb = true;
        bullet.bomberAimAngle = aimAngle;
        bullet.useVelocity = true;
        bullet.velocityX = Math.cos(aimAngle) * this.shotSpeed;
        bullet.velocityY = Math.sin(aimAngle) * this.shotSpeed;
        bullet.rotation = aimAngle - Math.PI / 2.0;
        bullet.bombThreshold = this.scene.scale.height * this.bulletSpreadRatio;
        bullet.enemyBulletGroup = enemyBulletGroup;
        bullet.onBombThreshold = (b, group) => this.explodeBomb(b, group);
    }

    explodeBomb(bomb, enemyBulletGroup){

        let bx = bomb.x;
        let by = bomb.y;
        let aimAngle = bomb.bomberAimAngle;
        bomb.makeInactive();

        this.scene.add.sprite(bx, by, "bomb1").setScale(this.bulletScale).play("explosion");
        

        for(let i = 0; i < this.bulletSpreadCount; i++){
            let angle = aimAngle + (i / this.bulletSpreadCount) * Math.PI * 2.0;
            let bullet = enemyBulletGroup.getFirstDead();
            if(!bullet) continue;

            bullet.makeInactive();
            bullet.makeActive();

            bullet.setTexture("playerShot");
            bullet.setScale(2.0);
            bullet.bulletAnim = null;
            bullet.stop();
            bullet.bulletHitAnim = null;
            bullet.flipY = false;
            bullet.useVelocity = true;
            bullet.isBomb = false;
            bullet.velocityX = Math.cos(angle) * this.bulletSpreadSpeed;
            bullet.velocityY = Math.sin(angle) * this.bulletSpreadSpeed;
            bullet.rotation = angle - Math.PI / 2.0;
            bullet.x = bx;
            bullet.y = by;

            const b = bullet;
            let vX = bullet.velocityX;
            let vY = bullet.velocityY;
            let endvX = vX * 8.0;
            let endvY = vY * 8.0;
            let t = {progress: 0};

            this.scene.tweens.add({
                targets: t,
                progress: 1,
                duration: 2000,
                ease: 'Sine.easeOut',
                onUpdate: () => {
                    if(!b.active) return;
                    b.velocityX = Phaser.Math.Linear(vX, endvX, t.progress);
                    b.velocityY = Phaser.Math.Linear(vY, endvY, t.progress);
                }
            });
        }

    }

    increaseBulletSpreadCount(){
        this.bulletSpreadCount *= 2;
    }
}

class TwinShooter extends Enemy{
    constructor(scene, x, y){
        super(scene, x, y, "twinshooter", 1, 50);
        this.setScale(2.0);
        this.flipY = true;

        this.shotSpeed = 400;
        this.firingEnabled = false;
        this.fireCooldown = 1200;
        this.fireCooldownCounter = (Math.random() * this.fireCooldown / 2.0) + (this.fireCooldown / 2.0);
        this.bulletTexture = "twinshot";
        this.bulletScale = 2.0;
        this.bulletAnim = null;
        this.bulletHitAnim = null;

        this.bulletSpread = 0;

        // Path Follower System
        this.follower = null;
        this.loopPath = null;
        this.pathBuild = false;

        // Wiggle
        this.wiggleFrequency = 0.75;
        this.wiggleAmp = 75.0;

        // Path Dimensions
        this.pathRadiusX = 80;
        this.pathRadiusY = 35;
        this.pathDuration = 4000; // MS

        this.initHitbox(26, 26);
    }

    buildFig8(cx, cy){

        let rx = this.pathRadiusX;
        let ry = this.pathRadiusY;

        let path = new Phaser.Curves.Path(cx, cy);

        //- Top Loop ------------------------------

        path.cubicBezierTo(
            cx + rx, cy - ry,
            cx + rx, cy,
            cx + rx, cy - ry,
        );

        path.cubicBezierTo(
            cx, cy,
            cx + rx, cy - ry * 2,
            cx - rx, cy - ry * 2,
        );

        path.cubicBezierTo(
            cx - rx, cy - ry,
            cx - rx, cy - ry * 2,
            cx - rx, cy - ry,
        );

        /*path.cubicBezierTo(
            cx, cy,
            cx - rx, cy,
            cx, cy,
        );*/

        //- Bottom Loop ---------------------------

        path.cubicBezierTo(
            cx + rx, cy + ry,
            cx + rx, cy,
            cx + rx, cy + ry,
        );

        path.cubicBezierTo(
            cx, cy,
            cx + rx, cy + ry * 2,
            cx - rx, cy + ry * 2,
        );

        path.cubicBezierTo(
            cx - rx, cy + ry,
            cx - rx, cy + ry * 2,
            cx - rx, cy + ry,
        );

        /*
        path.cubicBezierTo(
            cx, cy,
            cx - rx, cy,
            cx, cy,
        );*/

        return path;

    }

    initFollower(){

        let container = this.scene.enemyContainer;

        let cx = this.startX + container.x;
        let cy = this.startY + container.y;

        this.loopPath = this.buildFig8(cx, cy);

        this.follower = this.scene.add.follower(this.loopPath, cx, cy, "twinshooter");
        this.follower.setScale(0);
        this.follower.startFollow({
            duration: this.pathDuration,
            ease: "Linear.easeInOut",
            repeat: -1,
            rotateToPath: false,
        });

        this.pathBuild = true;
    }

    update(time, delta, playerX, enemyBulletGroup){

        if(!this.firingEnabled) return;

        if(!this.pathBuild) this.initFollower();

        let container = this.scene.enemyContainer;
        this.x = this.follower.x - container.x;
        this.y = this.follower.y - container.y;
        let worldX = this.follower.x;
        let worldY = this.follower.y;
        let dx = playerX - worldX;
        let dy = this.scene.scale.height - worldY;
        this.rotation = Math.atan2(dy, dx) - Math.PI / 2.0;

        this.updateHitbox(worldX, worldY);

        /*for(let bullet of enemyBulletGroup.getChildren()){
            if(!bullet.active || !bullet.wiggle) continue;

            bullet.wiggleTime += delta / 1000;

            let travelDist = bullet.speed * (delta / 1000);
            bullet.baseX += Math.cos(bullet.baseAngle) * travelDist;
            bullet.baseY += Math.sin(bullet.baseAngle) * travelDist;

            let perpX = -Math.sin(bullet.baseAngle);
            let perpY = Math.cos(bullet.baseAngle);

            let displacement = bullet.wiggleAmp * Math.sin(bullet.wiggleTime * bullet.wiggleFrequency * Math.PI * 2.0) * bullet.twinShotDir;

            bullet.x = bullet.baseX + perpX * displacement;
            bullet.y = bullet.baseY + perpY * displacement;
            //bullet.rotation = Math.atan(bullet.y, bullet.x) - Math.PI/2.0;
        }
        */

        this.fireCooldownCounter -= delta;
        if(this.fireCooldownCounter > 0) return;
        this.fireCooldownCounter = (Math.random() * this.fireCooldown / 2.0) + (this.fireCooldown / 2.0);;

        let forwardAngle = this.rotation + Math.PI/2.0;

        let spreadRad = this.bulletSpread * Math.PI / 180.0;
        let angles = [forwardAngle - (spreadRad / 2), forwardAngle + (spreadRad / 2)];

        //Shot 1
        let bullet1 = this.spawnBullet(enemyBulletGroup, worldX, worldY);
        if(!bullet1) return;
        bullet1.useVelocity = false;
        bullet1.rotation = angles[0] - Math.PI / 2;

        //Oscilation
        bullet1.wiggle = true;
        bullet1.baseX = worldX;
        bullet1.baseY = worldY;
        bullet1.wiggleTime = 0;
        bullet1.wiggleFrequency = this.wiggleFrequency;
        bullet1.wiggleAmp = this.wiggleAmp;
        bullet1.baseAngle = angles[0];
        bullet1.twinShotDir = -1;

        //Shot 2
        let bullet2 = this.spawnBullet(enemyBulletGroup, worldX, worldY);
        if(!bullet2) return;
        bullet2.useVelocity = false;
        bullet2.rotation = angles[1] - Math.PI / 2;

        //Oscilation
        bullet2.wiggle = true;
        bullet2.baseX = worldX;
        bullet2.baseY = worldY;
        bullet2.wiggleTime = 0;
        bullet2.wiggleFrequency = this.wiggleFrequency;
        bullet2.wiggleAmp = this.wiggleAmp;
        bullet2.baseAngle = angles[1];
        bullet2.twinShotDir = 1;
        
    }
}

class Support extends Enemy{
    constructor(scene, x, y, player){
        super(scene, x, y, "support", 1, 5);
        this.player = player;
        this.setScale(2.0);
        this.flipY = true;

        this.shotSpeed = 800;
        this.firingEnabled = false;
        this.fireCooldown = 2000;
        this.fireCooldownCounter = Math.random() * this.fireCooldown;
        this.bulletTexture = "playerShot";
        this.bulletScale = 2.0;
        this.bulletAnim = null;
        this.bulletHitAnim = null;

        this.deadzone = 30;
        this.isHovering = false;

        this.initHitbox(26, 26);
    }

    update(time, delta, playerX, enemyBulletGroup){

        if(!this.firingEnabled) return;

        let container = this.scene.enemyContainer;
        let worldX = this.x + container.x;
        let worldY = this.y + container.y;

        this.updateHitbox(worldX, worldY);

        if(!this.isHovering){
            this.isHovering = true;
            this.startHoverTween();
        }

        this.fireCooldownCounter -= delta;
        if(this.fireCooldownCounter > 0) return;
        this.fireCooldownCounter = this.fireCooldown;

        let dx = Math.abs(worldX - this.player.x);
        if(dx > this.deadzone){
            let bullet = this.spawnBullet(enemyBulletGroup, worldX, worldY);
            if(bullet) bullet.useVelocity = false;
        }
    }

    startHoverTween(){

        let container = this.scene.enemyContainer;
        let worldX = this.x + container.x;
        let playerX = this.player.x;
        let configLen = this.scene.scale.width;

        let overshoot = (Math.abs(worldX - playerX) / 2) + 20 + 10 * Math.random();
        let direction = (worldX < playerX) ? 1 : -1;
        let overshootWorld = playerX + direction * overshoot;
        overshootWorld = (overshootWorld > configLen) ? configLen - 1 : overshootWorld;
        overshootWorld = (overshootWorld < 0) ? 1 : overshootWorld;

        let targetLocalX = overshootWorld - container.x;

        this.scene.tweens.add({
            targets: this,
            x: targetLocalX,
            duration: 300 + Math.random() * 100,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.startHoverTween();
            }
        });
    }

    destroy(fromScene){

        if(this.scene && this.scene.tweens) this.scene.tweens.killTweensOf(this);
        super.destroy(fromScene);
    }
}