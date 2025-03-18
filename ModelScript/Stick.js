class Stick {
    constructor() {
        this.img = PoolGame.getInstance().assets.images['stick'];
        this.angle = 0; // Hướng gậy
        this.power = 0; // Lực gậy
    }

    getPositionDraw() {
        // Code lấy vị trí vẽ gậy dựa trên vị trí bi trắng
    }

    draw() {
        // Code vẽ gậy lên màn hình
        this.origin = new Vector2D(this.img.width + Ball.origin.x + this.power, this.img.height / 2);
        PoolGame.getInstance().myCanvas.DrawImage(
            this.img,
            PoolGame.getInstance().gameWorld.whiteBall.position,
            this.angle,
            this.origin
        );
    }

    upPower() {
        this.power += 4;
        if (this.power > 200) this.power = 200;
    }
    downPower() {
        this.power -= 4;
        if (this.power < 0) this.power = 0;
    }

    upAngle() {
        this.angle++;
        this.angle %= 360;
    }
    downAngle() {
        this.angle--;
        this.angle += 360;
        this.angle %= 360;
    }

    shoot() {
        // Hàm bắn bóng
        let dx = this.power*Math.cos(this.angle*Math.PI/180);
        let dy = this.power*Math.sin(this.angle*Math.PI/180);
        PoolGame.getInstance().gameWorld.whiteBall.vantoc = new Vector2D(dx,dy);
    }
}
