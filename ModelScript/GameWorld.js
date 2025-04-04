class GameWorld {
    initWhiteBallPos = Object.freeze(new Vector2D(410, 825 / 2));
    constructor() {
        this.whiteBall = new Ball(this.initWhiteBallPos, BallColor.WHITE); // Đặt bóng trắng ở vị trí ban đầu

        this.redBall = [];
        this.yellowBall = [];

        this.createTriangleBalls(new Vector2D(1000, 825 / 2), 10, 25); // Vị trí gốc, số lượng bóng, khoảng cách giữa bóng
        this.AllBalls = [...this.redBall, ...this.yellowBall, this.whiteBall];

        this.stick = new Stick();
        this.board = new Board();
        this.bot = new Bot();
        this.gamePolicy = new GamePolicy(this);

        this.width = this.board.width;
        this.height = this.board.height;
        this.size = new Vector2D(this.width, this.height);

        this.isBotOn = true; // Chế độ bot
        // this.score = 0;

        this.currentNumberBallRed = this.redBall.length; // Số bi đỏ còn lại
        this.currentNumberBallYellow = this.yellowBall.length; // Số bi vàng còn lại

        this.initEventListeners();

        this.lastTime = Date.now();

    }

    update() {
        // Cập nhật trạng thái game, vị trí bóng, kiểm tra va chạm, v.v.
        let curTime = Date.now();
        let deltaTime = curTime - this.lastTime;
        deltaTime = Math.min(deltaTime, 1000 / 24.0);
        this.lastTime = curTime;
        for (let i = 0; i < this.AllBalls.length; i++) {
            if (this.AllBalls[i].isInHole) continue;
            this.AllBalls[i].update(deltaTime);
            for (let j = i + 1; j < this.AllBalls.length; j++) {
                if (this.AllBalls[j].isInHole) continue;
                this.AllBalls[i].CollideBall(this.AllBalls[j]);
            }
            this.AllBalls[i].CollideWall();
            this.AllBalls[i].CollideHole();
        }
        this.gamePolicy.update();
    }
    draw() {
        // Vẽ bàn, bi, gậy lên màn hình
        PoolGame.getInstance().myCanvas.ClearFrame();
        this.board.draw();
        for (let i = 0; i < this.AllBalls.length; i++) {
            this.AllBalls[i].draw();
        }
        this.stick.draw();
    }

    handleInput(event) {
        if (this.lockInput) return; // Nếu bóng đang lăn thì không nhận input
        if(this.gamePolicy.turn==2 && this.isBotOn)return;
        var keyCode = event.code;
        switch (keyCode) {
            case "ArrowLeft":
                this.stick.downAngle()
                break;
            case "ArrowRight":
                this.stick.upAngle()
                break;
            case "ArrowUp":
                this.stick.upPower()
                break;
            case "ArrowDown":
                this.stick.downPower()
                break;
            case "Space": case "Enter":
                if (this.stick.power == 0) return;
                this.stick.shoot();
                this.gamePolicy.lockInput = true;
                this.stick.power = 0;
                break;
            default:
                break;
        }
    }
    botProcess() {
        let bestShot = this.bot.takeShot();
        this.stick.angle = bestShot.angle
        this.stick.power = Math.min(bestShot.power, 200);
        setTimeout(() => {
            this.stick.shoot();
            this.gamePolicy.lockInput = true;
            this.stick.power = 0;
        }, 1000);
    }
    reset() {
        // Reset lại game về trạng thái ban đầu
        console.log("Game reset!");
    }


    initEventListeners() {
        document.addEventListener("keydown", (event) => this.handleInput(event));
        // document.addEventListener("mousedown", (event) => this.handleInput(event));
    }
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    createTriangleBalls(startPos, numBalls, ballRadius) { // vẽ tam giác bóng ban đầu
        let rows = 1;
        while ((rows * (rows + 1)) / 2 < numBalls) {
            rows++; // Tìm số hàng cần để xếp đủ bóng
        }

        let index = 0;
        let colorSwitch = true; // Để xen kẽ giữa đỏ và vàng
        for (let i = 0; i < rows; i++) {
            let xOffset = i * ballRadius * Math.sqrt(3); // Khoảng cách giữa các hàng theo chiều dọc
            let startY = startPos.y - (i * ballRadius); // Căn chỉnh để tạo hình tam giác đều

            for (let j = 0; j <= i; j++) {
                if (index >= numBalls) return; // Nếu đủ 10 quả bóng thì dừng

                let x = startPos.x + xOffset;
                let y = startY + j * (2 * ballRadius); // Khoảng cách giữa các bóng theo chiều ngang

                let newBall = new Ball(new Vector2D(x, y), colorSwitch ? BallColor.RED : BallColor.YELLOW);

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

