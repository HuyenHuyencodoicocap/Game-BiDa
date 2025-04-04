const BallColor = Object.freeze({
    WHITE: Symbol("white"),
    RED: Symbol("red"),
    YELLOW: Symbol("yellow"),
});
class Ball {
    constructor(position, color = BallColor.WHITE) {
        this.id = this.generateId()
        this.position = position; // Vector2D
        this.color = color; // Chỉ nhận 3 màu hợp lệ kiểu enum
        this.isInHole = false; // Bóng có vào lỗ không kiểu bool
        this.vantoc = new Vector2D(0, 0); // Vận tốc ban đầu
        this.firstCollide=null;

        if (color == BallColor.YELLOW) {
            this.img = PoolGame.getInstance().assets.images["ball_Yellow"];
        } else if (color == BallColor.RED) {
            this.img = PoolGame.getInstance().assets.images["ball_Red"];
        } else {
            this.img = PoolGame.getInstance().assets.images["ball_White"];
            this.color = BallColor.WHITE; // Chỉ nhận 3 màu hợp lệ kiểu enum
        }
        Ball.origin = Object.freeze(new Vector2D(this.img.width / 2, this.img.height / 2));
    }

    update(deltaTime) {
        if (this.isMoving()) {
            //console.log(this.vantoc)
            this.position = this.position.add(this.vantoc.multiply(deltaTime));// Nếu đang di chuyển lấy vị trí hiện tại cộng thêm v*t(quãng đường vừa di chuyển deltatime)
            this.updateMoving(deltaTime);
        }
    }

    draw() {
        // Code hàm vẽ bóng tại đây
        if (this.isInHole == false) PoolGame.getInstance().myCanvas.DrawImage(this.img, this.position, 0, Ball.origin);
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
        let distance = this.position.subtract(that.position).magnitude();
        let ballRadius = this.img.width / 2;

        if (distance <= ballRadius * 2) {
            if(this.firstCollide==null){
                this.firstCollide=that;
            }
            if(that.firstCollide==null){
                that.firstCollide=this;
            }
            let normal = this.position.subtract(that.position).normalize();
            let relativeVelocity = this.vantoc.subtract(that.vantoc);
            let speed = relativeVelocity.dot(normal);

            if (speed > 0) return; // Nếu bóng đang tách xa nhau thì không xử lý

            // 🔹 Công thức va chạm hai vật có cùng khối lượng
            let newVantoc1 = this.vantoc.subtract(normal.multiply(speed));
            let newVantoc2 = that.vantoc.add(normal.multiply(speed));

            // Áp dụng ma sát từ từ
            let friction = 0.99; // Giảm tốc nhẹ dần
            this.vantoc = newVantoc1.multiply(friction);
            that.vantoc = newVantoc2.multiply(friction);
        }
    }



    CollideWall() {
        //Code bóng va chạm thành bàn ở đây
        let board = PoolGame.getInstance().gameWorld.board; // Lấy đối tượng bàn
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
        let board = PoolGame.getInstance().gameWorld.board; // Lấy đối tượng bàn
        let radius = this.img.width / 2; // Bán kính bóng

        for (let hole of board.HolePosition) {
            let distance = this.position.subtract(hole).magnitude();

            if (distance <= board.HoleRadius - radius) {
                this.isInHole = true;

                if (this.color === BallColor.WHITE) {
                    //console.log("⚠️ Bóng trắng đã vào lỗ!");
                    // Xử lý logic khi bóng trắng vào lỗ, ví dụ:
                    //PoolGame.getInstance().gameWorld.onWhiteInHole();
                }


                break;
            }
        }
    }

    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }


    isMoving() {
        return !this.isInHole && this.vantoc.magnitude() > 0;
    }
    angleToBall(that) {
        let direction = that.position.subtract(this.position);
        return Math.atan2(-direction.y, direction.x); // Đảo y để giữ hệ toán học
    }

    angleToHole(hole) {
        let direction = hole.subtract(this.position);
        return Math.atan2(-direction.y, direction.x); // Đảo y để giữ hệ toán học
    }
    resetFirstCollide(){
        this.firstCollide=null;
    }
}


