class Stick {
    constructor(whiteBall) {
        this.img = PoolGame.getInstance().assets.images['stick'];
        this.angle = 0; // Hướng gậy
        this.power = 0; // Lực gậy
        this.whiteBall=whiteBall;
    }

    draw() {
        // Code vẽ gậy lên màn hình
        this.origin = new Vector2D(this.img.width + this.whiteBall.origin.x + this.power, this.img.height / 2);
        PoolGame.getInstance().myCanvas.DrawImage(
            this.img,
            this.whiteBall.position,
            this.angle,
            this.origin
        );
        if(this.aimLine==null || this.aimLine.angle!=this.angle)
            this.aimLine=this.calculateAimLine(this.angle);
        PoolGame.getInstance().myCanvas.DrawLine(this.whiteBall.position,this.aimLine.endpos);
        PoolGame.getInstance().myCanvas.DrawCircle(this.aimLine.endpos,this.whiteBall.radius);
        PoolGame.getInstance().myCanvas.DrawLine(this.aimLine.endpos,this.aimLine.endpos.add(this.aimLine.thisVanToc.multiply(100)));
        PoolGame.getInstance().myCanvas.DrawLine(this.aimLine.thatpos,this.aimLine.thatpos.add(this.aimLine.thatVanToc.multiply(100)));
    }
    resetPower() {
        this.power = 0;
        this.aimLine=this.calculateAimLine(this.angle);
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
        this.whiteBall.vantoc = new Vector2D(dx, dy);
    }
    shoot() {
        // Hàm bắn bóng
        let dx = this.power / 50.0 * Math.cos(this.angle * Math.PI / 180);
        let dy = this.power / 50.0 * Math.sin(this.angle * Math.PI / 180);
        this.whiteBall.vantoc = new Vector2D(dx, dy);
    }

    calculateAimLine(angle) {
        let tempPower = 1;
        let tempBall= new Ball(this.whiteBall.position);
        let tempVantoc=new Vector2D(Math.cos(angle * Math.PI / 180),Math.sin(angle * Math.PI / 180)).multiply(tempPower);
        let index=0;
        while(index<10000){
            tempBall.vantoc=tempVantoc
            tempBall.update(1);
            for(let ball of PoolGame.getInstance().gameWorld.AllBalls){
                if(ball.isInHole || ball.color==BallColor.WHITE) continue;
                if(tempBall.CollideBall(ball)){
                    let thisVanToc=tempBall.vantoc;
                    let thatVanToc=ball.vantoc;
                    ball.vantoc=new Vector2D(0,0);
                    return{
                        endpos: tempBall.position,
                        thisVanToc,
                        thatpos: ball.position,
                        thatVanToc,
                        angle
                    }
                };
            }
            if(tempBall.CollideWall()){
                return{
                    endpos: tempBall.position,
                    thisVanToc: tempBall.vantoc,
                    thatpos: tempBall.position,
                    thatVanToc: new Vector2D(0,0),
                    angle,
                }
            }
            index++;
        }
        return{
            endpos: this.whiteBall.position,
            thisVanToc: new Vector2D(0,0),
            thatpos: this.whiteBall.position,
            thatVanToc: new Vector2D(0,0),
            angle
        }
    }
    
}
