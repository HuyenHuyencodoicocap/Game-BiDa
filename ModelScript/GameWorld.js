class GameWorld {
    constructor() {
        this.whiteBall = new Ball(new Vector2D(300, 400), "white"); // Đặt bóng trắng ở vị trí ban đầu

        this.redBall = [];
        this.yellowBall = [];

        this.createTriangleBalls(new Vector2D(500, 300), 10, 30); // Vị trí gốc, số lượng bóng, khoảng cách giữa bóng
        this.AllBalls = [...this.redBall, ...this.yellowBall, this.whiteBall];

        this.stick = new Stick();
        this.board = new Board();

        this.width = this.board.width;
        this.height = this.board.height;


        this.turn = 1; // Lượt đánh hiện tại
        this.isBotOn = false; // Chế độ bot
        this.score = 0;

        this.currentNumberBallRed = this.redBall.length; // Số bi đỏ còn lại
        this.currentNumberBallYellow = this.yellowBall.length; // Số bi vàng còn lại
        this.lockInput = false; // Nếu bóng đang lăn thì không nhận input

        this.initEventListeners();


    }

    update() {
        // Cập nhật trạng thái game, vị trí bóng, kiểm tra va chạm, v.v.
        this.draw();
    }

    draw() {
        // Vẽ bàn, bi, gậy lên màn hình
        PoolGame.getInstance().myCanvas.ClearFrame();
        this.board.draw();
        for (let i = 0; i < this.AllBalls.length; i++) {
            this.AllBalls[i].draw();
        }


    }

    handleInput(event) {
        if (this.lockInput) return; // Nếu bóng đang lăn thì không nhận input

        // Sự kiện đầu vào chuột
    }

    reset() {
        // Reset lại game về trạng thái ban đầu
        console.log("Game reset!");
    }

    isWin() {
        // Kiểm tra điều kiện thắng

    }

    initEventListeners() {
        document.addEventListener("keydown", (event) => this.handleInput(event));
    }
    gameLoop() {
        this.update();
        requestAnimationFrame(() => this.gameLoop());
    }

    createTriangleBalls(startPos, numBalls, ballRadius) {
        let rows = 1;
        while ((rows * (rows + 1)) / 2 < numBalls) {
            rows++; // Tìm số hàng cần để xếp đủ bóng
        }

        let index = 0;
        let colorSwitch = true; // Để xen kẽ giữa đỏ và vàng
        for (let i = 0; i < rows; i++) {
            let yOffset = i * ballRadius * Math.sqrt(3); // Khoảng cách giữa các hàng theo chiều dọc
            let startX = startPos.x - (i * ballRadius); // Căn chỉnh để tạo hình tam giác đều

            for (let j = 0; j <= i; j++) {
                if (index >= numBalls) return; // Nếu đủ 10 quả bóng thì dừng

                let x = startX + j * (2 * ballRadius); // Khoảng cách giữa các bóng theo chiều ngang
                let y = startPos.y + yOffset;

                let newBall = new Ball(new Vector2D(x, y), colorSwitch ? "red" : "yellow");

                if (colorSwitch) {
                    this.redBall.push(newBall);
                } else {
                    this.yellowBall.push(newBall);
                }

                colorSwitch = !colorSwitch; // Đổi màu cho bóng tiếp theo
                index++;
            }
        }
    }

}

