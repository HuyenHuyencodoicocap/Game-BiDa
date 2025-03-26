import SpecialCase from "../CommonHelper/Model/specialCase";
import AITrainer from "../CommonHelper/Model/algorithm";
class Bot {
    constructor() {
    }


    takeShot() {
        let redBalls = PoolGame.getInstance().gameWorld.redBall
        let yellowBalls = PoolGame.getInstance().gameWorld.yellowBall
        let balls = [...redBalls, ...yellowBalls].filter(item => !item.isInHole)
        let specialCase = new SpecialCase(balls, new Board())
        let aiTrainer = new AITrainer({
            whiteBall: PoolGame.getInstance().gameWorld.whiteBall,
            balls: balls,
            holes: new Board().HolePosition
        });
        let special = specialCase.getSpecialCase()
        if (special.isBool) {
            return special.shotInfo
        }
        let bestShot = aiTrainer.train();
        return bestShot;
    }
    // playTurn() {
    //     let bestShot = this.takeShot()
    //     this.stick.shoot(bestShot.angle, bestShot.power)
    // }
}