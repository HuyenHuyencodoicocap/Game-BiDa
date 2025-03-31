class GameWorld {
    constructor() {
        this.whiteBall = new Ball(new Vector2D(410, 825 / 2), BallColor.WHITE); // Đặt bóng trắng ở vị trí ban đầu

        this.redBall = [];
        this.yellowBall = [];

        this.createTriangleBalls(new Vector2D(1000, 825 / 2), 10, 25); // Vị trí gốc, số lượng bóng, khoảng cách giữa bóng
        this.AllBalls = [...this.redBall, ...this.yellowBall, this.whiteBall];

        this.stick = new Stick();
        this.board = new Board();
        this.bot = new Bot()

        this.width = this.board.width;
        this.height = this.board.height;
        this.size = new Vector2D(this.width, this.height);

        this.turn = 1; // Lượt đánh hiện tại
        this.isBotOn = true; // Chế độ bot
        // this.score = 0;

        this.currentNumberBallRed = this.redBall.length; // Số bi đỏ còn lại
        this.currentNumberBallYellow = this.yellowBall.length; // Số bi vàng còn lại
        this.lockInput = false; // Nếu bóng đang lăn thì không nhận input

        this.initEventListeners();

        this.lastTime = Date.now();

        this.player1 = document.getElementById("player1")// người chơi 1
        this.player2 = document.getElementById("player2")
        this.player1_score = 0;
        this.player2_score = 0;
        this.player1_score_elem = document.getElementById("player1_score");
        this.player2_score_elem = document.getElementById("player2_score");
    }

    update() {
        // Cập nhật trạng thái game, vị trí bóng, kiểm tra va chạm, v.v.
        let curTime = Date.now();
        let deltaTime = curTime - this.lastTime;
        this.lastTime = curTime;
        for (let i = 0; i < this.AllBalls.length; i++) {
            if (this.AllBalls[i].isInHole) continue;
            this.AllBalls[i].update(deltaTime);
            for (let j = i + 1; j < this.AllBalls.length; j++) {
                this.AllBalls[i].CollideBall(this.AllBalls[j]);
            }
            this.AllBalls[i].CollideWall();
            this.AllBalls[i].CollideHole();
        }

        if (this.lockInput) {
            let isNextTurn = true;
            for (let ball of this.AllBalls) {
                if (ball.isMoving()) isNextTurn = false;
            }
            if (isNextTurn) {
                this.lockInput = false
                this.changeTurn();
            }

            this.player1_score = 0;
            this.player2_score = 0;
            for (let i = 0; i < this.yellowBall.length; i++) {
                if (this.yellowBall[i].isInHole) {
                    this.player1_score += 1;
                }
            }
            for (let i = 0; i < this.redBall.length; i++) {
                if (this.redBall[i].isInHole) {
                    this.player2_score += 1;
                }
            }
            this.player1_score_elem.innerHTML = this.player1_score
            this.player2_score_elem.innerHTML = this.player2_score

        }



        this.isWin();
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

        var keyCode = event.code;

        console.log(keyCode);
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
                if (this.isBotOn) {
                    let bestShot = this.bot.takeShot();
                    this.stick.shoot(bestShot.angle, bestShot.power);
                } else {
                    this.stick.shoot();
                }
                this.stick.shoot();
                this.lockInput = true;
                this.stick.power = 0;
                break;

            default:
                break;
        }

    }
    changeTurn() {
        if (this.turn == 1) {
            this.turn = 2

        } else {
            this.turn = 1
        }
        this.player1.classList.toggle("player-playing");
        this.player2.classList.toggle("player-playing");
    }

    reset() {
        // Reset lại game về trạng thái ban đầu
        console.log("Game reset!");
    }

    isWin() {
        if (this.player1_score == 5) {
            return true;
        }
        else if (this.player2_score == 5) {
            return true;
        } else {
            return false;
        }


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

    onWhiteInHole() {
        console.log("Bi trắng đã rơi vào lỗ!");

        // Đặt lại vị trí bi trắng
        this.whiteBall = new Ball(new Vector2D(410, 825 / 2), BallColor.WHITE);

        // Cập nhật lại danh sách bóng
        this.AllBalls = [...this.redBall, ...this.yellowBall, this.whiteBall];

        // Nếu đang trong chế độ chơi với bot, có thể thêm logic xử lý tùy theo yêu cầu
        if (this.isBotOn && this.turn === 2) {
            this.changeTurn(); // Chuyển lượt nếu bot đang chơi
        }

        // Chuyển lượt đánh vì đánh lỗi
        this.changeTurn();
    }

}

