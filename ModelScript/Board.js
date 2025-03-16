class Board {
    constructor(holePositions, holeRadius, width, height) {
        this.HolePosition = Object.freeze(holePositions); // Mảng vị trí lỗ (Vector2D[])
        this.HoleRadius = holeRadius; // Bán kính lỗ (const float)
        this.width = width; // Chiều rộng (const float)
        this.height = height; // Chiều cao (const float)

        // Viền của bàn chơi
        this.topWall = 0;
        this.leftWall = 0;
        this.bottomWall = 0;
        this.rightWall = 0;

        //Không đucợ thay đổi thông số của bàn bắn
        Object.freeze(this);
    }

    draw() {
        // Vẽ lên màn hình
    }
}

