const BallColor = Object.freeze({
    WHITE:  Symbol("white"),
    RED:   Symbol("red"),
    YELLOW: Symbol("yellow"),
});
class Ball {
    constructor(position, color = BallColor.WHITE) {
        
        this.position = position; // Vector2D
        this.color = color; // Chỉ nhận 3 màu hợp lệ kiểu enum
        this.isInHole = false; // Bóng có vào lỗ không kiểu bool
        this.vantoc = new Vector2D(0, 0); // Vận tốc ban đầu

        if(color==BallColor.YELLOW){
            this.img=PoolGame.getInstance().assets.images["ball_Yellow"];
        }else if(color== BallColor.RED){
            this.img=PoolGame.getInstance().assets.images["ball_Red"];
        }else{
            this.img=PoolGame.getInstance().assets.images["ball_White"];
            this.color = BallColor.WHITE; // Chỉ nhận 3 màu hợp lệ kiểu enum
        }
        Ball.origin  = Object.freeze(new Vector2D(this.img.width/2,this.img.height/2));
    }

    update(deltaTime) { 
        if (this.isMoving()) {
            console.log(this.vantoc)
            this.position = this.position.add(this.vantoc.multiply(deltaTime));// Nếu đang di chuyển lấy vị trí hiện tại cộng thêm v*t(quãng đường vừa di chuyển deltatime)
            this.updateMoving(deltaTime);
        }
    }

    draw() {
        // Code hàm vẽ bóng tại đây
        PoolGame.getInstance().myCanvas.DrawImage(this.img,this.position,0,Ball.origin);
    }

    updateMoving(deltaTime) { // update vị trí của bóng
        const friction = 0.99; // Ma sát để bóng giảm tốc
        this.vantoc = this.vantoc.multiply(friction);
        //magnitude() là hàm tính độ lớn của vector (định lý Pitago)
        if (this.vantoc.magnitude() < 0.01) {
            this.vantoc = new Vector2D(0, 0); // Dừng bóng nếu tốc độ quá nhỏ
        }
    }

    CollideBall(that) {
       // Code bóng va chạm nhau ở đây
       let distance = this.position.subtract(that.position).magnitude();
       let ballRadius = this.img.width / 2;
       
       if (distance <= ballRadius * 2) { // Nếu hai bóng chạm nhau
           let normal = this.position.subtract(that.position).normalize();
           let relativeVelocity = this.vantoc.subtract(that.vantoc);
           let speed = relativeVelocity.dot(normal);
   
           if (speed > 0) return; // Bóng đang tách xa nhau, không xử lý
   
           // Công thức tính vận tốc sau va chạm đàn hồi
           let impulse = normal.multiply(-2 * speed);
           this.vantoc = this.vantoc.add(impulse);
           that.vantoc = that.vantoc.subtract(impulse);
       }
    }

    CollideWall() {
        //Code bóng va chạm thành bàn ở đây
        let board = PoolGame.getInstance().board; // Lấy đối tượng bàn
        let radius = this.img.width / 2; // Bán kính bóng

        // Kiểm tra va chạm với viền trái & phải
        if (this.position.x - radius <= board.leftWall || this.position.x + radius >= board.width - board.rightWall) {
            this.vantoc.x *= -1; // Đảo ngược hướng X
            this.position.x = Math.max(board.leftWall + radius, Math.min(this.position.x, board.width - board.rightWall - radius));
        }

        // Kiểm tra va chạm với viền trên & dưới
        if (this.position.y - radius <= board.topWall || this.position.y + radius >= board.height - board.bottomWall) {
            this.vantoc.y *= -1; // Đảo ngược hướng Y
            this.position.y = Math.max(board.topWall + radius, Math.min(this.position.y, board.height - board.bottomWall - radius));
        }
    }

    CollideHole() {
        //Code bóng vào lỗ ở đây
        let board = PoolGame.getInstance().board; // Lấy đối tượng bàn
        let radius = this.img.width / 2; // Bán kính bóng

        for (let hole of board.HolePosition) {
            let distance = this.position.subtract(hole).magnitude();
            if (distance <= board.HoleRadius - radius) {
                this.isInHole = true;
                PoolGame.getInstance().removeBall(this); // Xóa bóng khỏi bàn
                break;
            }
        }
    }


    isMoving() {
        return this.vantoc.magnitude() > 0;
    }
}

