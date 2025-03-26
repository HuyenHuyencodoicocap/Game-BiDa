import SpecialCase from "../CommonHelper/Model/specialCase";
import AITrainer from "../CommonHelper/Model/algorithm";
class Bot {
    constructor(stick, balls) {
        this.stick = stick;
        this.balls = balls;
        this.specialCase = new SpecialCase(balls, new Board())
        this.aiTrainer = new AITrainer({
            whiteBall: PoolGame.getInstance().gameWorld.whiteBall,
            balls: balls,
            holes: new Board().HolePosition
        });
    }

    takeShot() {
        let special = this.specialCase.getSpecialCase()
        if (special.isBool) {
            return special.shotInfo
        }
        let bestShot = this.aiTrainer.train();
        return bestShot;
    }
    playTurn() {
        let bestShot = this.takeShot()
        this.stick.shoot(bestShot.angle, bestShot.power)
    }
}