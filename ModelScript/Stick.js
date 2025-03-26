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
        if (PoolGame.getInstance().gameWorld.lockInput) return;
        this.origin = new Vector2D(this.img.width + Ball.origin.x + this.power, this.img.height / 2);
        PoolGame.getInstance().myCanvas.DrawImage(
            this.img,
            PoolGame.getInstance().gameWorld.whiteBall.position,
            this.angle,
            this.origin
        );
    }
    resetPower() {
        this.power = 0;
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
    shoot(angle, power) {
        let dx = power / 50.0 * Math.cos(angle * Math.PI / 180);
        let dy = power / 50.0 * Math.sin(angle * Math.PI / 180);
        PoolGame.getInstance().gameWorld.whiteBall.vantoc = new Vector2D(dx, dy);
    }
    shoot() {
        // Hàm bắn bóng
        let dx = this.power / 50.0 * Math.cos(this.angle * Math.PI / 180);
        let dy = this.power / 50.0 * Math.sin(this.angle * Math.PI / 180);
        PoolGame.getInstance().gameWorld.whiteBall.vantoc = new Vector2D(dx, dy);
    }
}
