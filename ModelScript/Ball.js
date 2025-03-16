const BallColor = {
    WHITE: "white",
    RED: "red",
    YELLOW: "yellow"
};

class Ball {
    constructor(position, color = BallColor.WHITE) {
        // Kiểm tra nếu màu không hợp lệ, gán mặc định là WHITE
        if (!Object.values(BallColor).includes(color)) {
            console.warn(`Invalid color '${color}', defaulting to WHITE.`);
            color = BallColor.WHITE;
        }

        this.position = position; // Vector2D
        this.offset = new Vector2D(0, 0); // Không thay đổi
        this.color = color; // Chỉ nhận 3 màu hợp lệ kiểu enum
        this.isInHole = false; // Bóng có vào lỗ không kiểu bool
        this.vantoc = new Vector2D(0, 0); // Vận tốc ban đầu
    }

    update(deltaTime) { 
        if (this.isMoving()) {
            this.position = this.position.add(this.vantoc.multiply(deltaTime));// Nếu đang di chuyển lấy vị trí hiện tại cộng thêm v*t(quãng đường vừa di chuyển deltatime)
            this.updateMoving(deltaTime);
        }
    }

    draw() {
        // Code hàm vẽ bóng tại đây
    }

    updateMoving(deltaTime) { // update vị trí của bóng
        const friction = 0.98; // Ma sát để bóng giảm tốc
        this.vantoc = this.vantoc.multiply(friction);
        //magnitude() là hàm tính độ lớn của vector (định lý Pitago)
        if (this.vantoc.magnitude() < 0.01) {
            this.vantoc = new Vector2D(0, 0); // Dừng bóng nếu tốc độ quá nhỏ
        }
    }

    CollideBall(that) {
       // Code bóng va chạm nhau ở đây
    }

    CollideWall() {
        //Code bóng va chạm thành bàn ở đây
    }

    CollideHole() {
        //Code bóng vào lỗ ở đây
    }

     isMoving() {
        return this.vantoc.magnitude() > 0;
    }
}

