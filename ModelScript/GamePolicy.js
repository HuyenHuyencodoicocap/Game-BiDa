class GamePolicy {
    constructor(gameWorld) {
        this.gameWorld = gameWorld;
        this.turn = 1;
        this.lockInput = false;
        this.firstTurn = true;
        this.goHole = false;
        this.isFoul = false;

        this.player1_color = BallColor.RED;
        this.player2_color = BallColor.YELLOW;
        this.player1 = document.getElementById("player1")// người chơi 1
        this.player2 = document.getElementById("player2")
        this.player1_score = 0;
        this.player2_score = 0;
        this.player1_score_elem = document.getElementById("player1_score");// Hiển thị điểm
        this.player2_score_elem = document.getElementById("player2_score");

        this.namePlayerWinner1 = document.getElementById("namePlayerWinner");// Hiển thị người chơi chiến thắng
        this.namePlayerWinner2 = document.getElementById("namePlayerWinner");
        this.displayWinner = document.getElementById("displayWinner");

        this.namePlayer2 = document.getElementById("player2_name")
        if (!this.gameWorld.IsBotOn()) {
            this.namePlayer2.innerHTML = "Player2";
        }
    }
    update() {
        if (this.lockInput) {
            let isNextTurn = true;
            for (let ball of this.gameWorld.AllBalls) {
                if (ball.isMoving()) isNextTurn = false;
            }
            //nếu chưa có ai win thì đổi lượt
            if (isNextTurn && !this.isWin()) {
                this.changeTurn();
            }
        }
        for (let redBall of this.gameWorld.redBall) {
            if (redBall.isInHole && !redBall.check) {
                this.player1_score += 1;
                redBall.check=true;
                if(this.turn==1)this.goHole=true;
            }
        }
        for (let yellowBall of  this.gameWorld.yellowBall) {
            if (yellowBall.isInHole && !yellowBall.check) {
                this.player2_score += 1;
                yellowBall.check=true;
                if(this.turn==2)this.goHole=true;
            }
        }
        this.player1_score_elem.innerHTML = this.player1_score
        this.player2_score_elem.innerHTML = this.player2_score
    }
    changeTurn() {
        //đổi lượt
        if (
            this.gameWorld.whiteBall.isInHole
            || this.gameWorld.whiteBall.firstCollide == null
            || (!this.matchColor(this.gameWorld.whiteBall.firstCollide.color) && !this.firstTurn)
            || this.gameWorld.whiteBall.isInHole
        ) {
            this.gameWorld.whiteBall.position = new Vector2D(this.gameWorld.initWhiteBallPos.x, this.gameWorld.initWhiteBallPos.y);
            this.gameWorld.whiteBall.isInHole = false;
            this.gameWorld.whiteBall.vantoc = new Vector2D(0, 0);
            this.isFoul = true;
        }
        if (!this.goHole || this.isFoul) {
            this.turn = 3 - this.turn;
            this.player1.classList.toggle("player-red-playing");
            this.player2.classList.toggle("player-yellow-playing");
        }
        //thiết lập lai các tham số
        if (this.gameWorld.whiteBall.firstCollide != null) {
            this.firstTurn = false;
        }
        this.goHole = false;
        this.gameWorld.stick.resetPower();
        this.gameWorld.whiteBall.resetFirstCollide();
        if (this.turn == 2 && this.gameWorld.isBotOn) {
            this.lockInput = false;
            this.gameWorld.botProcess();
        } else {
            this.lockInput = false;
        }
    }
    matchColor(color) {
        return (this.turn == 1 && color == this.player1_color) || (this.turn == 2 && color == this.player2_color)
    }
    isWin() {
        if (this.player1_score == 5 && this.player2_score == 5) {
            this.namePlayerWinner1.innerHTML = "Player1 and Player2"
            this.displayWinner.style.display = "block";
            return true;
        } else if (this.player1_score == 5) {
            this.namePlayerWinner1.innerHTML = "Player1"
            this.displayWinner.style.display = "block";
            return true;
        }
        else if (this.player2_score == 5) {
            if (this.gameWorld.IsBotOn()) {
                this.namePlayerWinner2.innerHTML = "Computer"
            }
            else
                this.namePlayerWinner2.innerHTML = "Player2"
            this.displayWinner.style.display = "block";
            return true;
        } else {
            return false;
        }
    }

}