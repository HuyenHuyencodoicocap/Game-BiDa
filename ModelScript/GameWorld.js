class GameWorld {
    initWhiteBallPos = Object.freeze(new Vector2D(410, 825 / 2));
    constructor() {
        this.whiteBall = new Ball(this.initWhiteBallPos, BallColor.WHITE); // Đặt bóng trắng ở vị trí ban đầu

        this.redBall = [];
        this.yellowBall = [];

        this.createTriangleBalls(new Vector2D(1000, 825 / 2), 10, 25); // Vị trí gốc, số lượng bóng, khoảng cách giữa bóng
        this.AllBalls = [...this.redBall, ...this.yellowBall, this.whiteBall];

        this.stick = new Stick(this.whiteBall);
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
        if (this.gamePolicy.isFoul) {
            return;
        }
        // Cập nhật trạng thái game, vị trí bóng, kiểm tra va chạm, v.v.
        let curTime = Date.now();
        let deltaTime = curTime - this.lastTime;
        deltaTime = Math.min(deltaTime, 1000 / 24.0);
        deltaTime = Math.max(deltaTime, 1);
        this.lastTime = curTime;
        this.stick.setDeltaTime(deltaTime);
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
        for (let ball of this.AllBalls) {
            if (ball.isInHole) continue;
            ball.draw();
        }

        if (!this.gamePolicy.lockInput && !this.gamePolicy.isFoul) {
            this.stick.draw();
        }
    }

    handleKeyInput(event) {
        if (this.lockInput) return; // Nếu bóng đang lăn thì không nhận input
        if (this.gamePolicy.turn == 2 && this.isBotOn) return; //lượt bot
        var keyCode = event.code;
        if (!this.gamePolicy.isFoul) {
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
                    if (this.stick.power == 0) break;
                    this.stick.shoot();
                    this.gamePolicy.lockInput = true;
                    break;
                default:
                    break;
            }
        } else {
            switch (keyCode) {
                case "ArrowLeft":
                    this.whiteBall.position.x -= 10;
                    break;
                case "ArrowRight":
                    this.whiteBall.position.x += 10;
                    break;
                case "ArrowUp":
                    this.whiteBall.position.y -= 10;
                    break;
                case "ArrowDown":
                    this.whiteBall.position.y += 10;
                    break;
                case "Space": case "Enter":
                    let validate = true;
                    for (let ball of this.AllBalls) {
                        if (ball.isInHole) continue;
                        if (ball == this.whiteBall) continue;
                        if (this.whiteBall.CollideBall(ball)) {
                            console.log(ball)
                            validate = false;
                        }
                    }
                    if (this.whiteBall.CollideWall() || this.whiteBall.CollideHole()) validate = false;
                    if (!validate) break;
                    this.gamePolicy.isFoul = false;
                    this.stick.resetPower();
                    break;
                default:
                    break;
            }
        }
    }
    handleMouseInput(event) {
        if (this.gamePolicy.lockInput) return; // Nếu bóng đang lăn thì không nhận input
        if (this.gamePolicy.turn == 2 && this.isBotOn) return; //lượt bot
        let type = event.type;
        // console.log(event)
        // console.log(type)
        if (!this.gamePolicy.isFoul) {
            switch (type) {
                case "mousedown":
                    this.mousedownPos = new Vector2D(event.x, event.y);
                    break;
                case "mousemove":
                    if (!this.mousedownPos) break;
                    let temp = this.mousedownPos.subtract(new Vector2D(event.x, event.y));
                    this.stick.setAngle(-temp.angle() / Math.PI * 180);
                    this.stick.setPower(temp.magnitude() - 20);
                    break;
                case "mouseup":
                    this.mousedownPos = null;
                    if (this.stick.power == 0) break;
                    this.stick.shoot();
                    // this.gamePolicy.lockInput = true;
                    break;
                default:
                    break;
            }
        } else {
            switch (type) {
                case "mousemove":
                    if (event.target != PoolGame.getInstance().myCanvas.canvas) break;
                    let rect = event.target.getBoundingClientRect();
                    let x = event.clientX - rect.left; //x position within the element.
                    let y = event.clientY - rect.top;  //y position within the element.
                    this.whiteBall.position = new Vector2D(x, y)
                        .subtract(PoolGame.getInstance().myCanvas.getOffset())
                        .divide(PoolGame.getInstance().myCanvas.getScale())
                    break;
                case "mouseup":
                    let validate = true;
                    for (let ball of this.AllBalls) {
                        if (ball.isInHole) continue;
                        if (ball == this.whiteBall) continue;
                        if (this.whiteBall.CollideBall(ball)) {
                            console.log(ball)
                            validate = false;
                        }
                    }
                    if (this.whiteBall.CollideWall() || this.whiteBall.CollideHole()) validate = false;
                    if (!validate) break;
                    this.gamePolicy.isFoul = false;
                    this.stick.resetPower();
                    break;
                default:
                    break;
            }
        }
    }
    botProcess() {
        if (this.gamePolicy.isFoul) this.gamePolicy.isFoul = false;
        let bestShot = this.bot.takeShot();
        this.stick.angle = bestShot.angle
        this.stick.power = Math.min(bestShot.power, 200);
        setTimeout(() => {
            this.stick.shoot();
            this.gamePolicy.lockInput = true;
        }, 1000);
    }
    reset() {
        // Reset lại game về trạng thái ban đầu
        console.log("Game reset!");
    }


    initEventListeners() {
        document.addEventListener("keydown", (event) => this.handleKeyInput(event));
        document.addEventListener("mousedown", (event) => this.handleMouseInput(event));
        document.addEventListener("mouseup", (event) => this.handleMouseInput(event));
        document.addEventListener("mousemove", (event) => this.handleMouseInput(event));
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

