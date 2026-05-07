class Collisionbox {

    constructor(scene, owner, width, height, debugShow = false){
        this.scene = scene;
        this.owner = owner;
        this.w = width;
        this.h = height;
        this.debugShow = debugShow;

        this.x = 0;
        this.y = 0;

        this.gfx = scene.add.graphics();
        this.gfx.setDepth(9999);
    }

    update(worldX, worldY){
        this.x = worldX;
        this.y = worldY;

        this.gfx.clear();
        if(!this.debugShow) return;

        this.gfx.lineStyle(1, 0x0000ff, 1);
        this.gfx.strokeRect(
            this.x - this.w/2,
            this.y - this.h/2,
            this.w,
            this.h,
        );
    }

    static overlaps(a,b){
        return(
            (Math.abs(a.x - b.x) <= (a.w/2 + b.w/2)) &&
            (Math.abs(a.y - b.y) <= (a.h/2 + b.h/2))
        );
    }

    destroy(){
        this.gfx.destroy();
    }
}