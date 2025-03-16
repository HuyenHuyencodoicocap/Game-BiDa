class GameWorld {
    constructor() {
        this.whiteBall = new Ball("white");
        this.redBall = []; 
        this.yellowBall = []; 
        this.AllBalls = [...this.redBall, ...this.yellowBall, this.whiteBall];

        this.stick = new Stick();
        this.board = new Board();

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
        console.log("Updating game state...");
    }

    draw() {
        // Vẽ bàn, bi, gậy lên màn hình
        console.log("Drawing game...");
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
}

