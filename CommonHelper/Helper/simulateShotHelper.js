
function simulateShot(angle, power, whiteBall, balls, holes) {
    let simulatedWhiteBall = new Ball(whiteBall.position.clone(), whiteBall.color);
    simulatedWhiteBall.vantoc = new Vector2D(
        Math.cos(angle * Math.PI / 180) * power,
        Math.sin(angle * Math.PI / 180) * power
    );

    let simulatedBalls = balls.map(ball => {
        let clone = new Ball(ball.position.clone(), ball.color);
        clone.vantoc = ball.vantoc.clone();
        return clone;
    });

    let maxSteps = 500;
    let deltaTime = 1;

    for (let step = 0; step < maxSteps; step++) {
        let allBallsStopped = true;

        for (let ball of simulatedBalls) {
            ball.update(deltaTime);
            ball.CollideWall();
            if (ball.isMoving()) allBallsStopped = false;
        }

        for (let i = 0; i < simulatedBalls.length; i++) {
            for (let j = i + 1; j < simulatedBalls.length; j++) {
                simulatedBalls[i].CollideBall(simulatedBalls[j]);
            }
        }

        for (let ball of simulatedBalls) {
            ball.CollideHole();
            if (ball.isInHole) {
                if (ball.color === BallColor.YELLOW) {
                    return { success: true, message: "Yellow ball fell into a hole!", distanceToHole: 0 };
                } else {
                    return { success: false, message: `${ball.color.toString()} ball fell into a hole (foul)!`, distanceToHole: 0 };
                }
            }
        }

        if (allBallsStopped) break;
    }

    // Nếu không có bi nào vào lỗ, tính khoảng cách bi gần lỗ nhất
    let minDistance = Infinity;
    for (let ball of simulatedBalls) {
        for (let hole of holes) {
            let distance = ball.position.distanceTo(hole.position);
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
    }

    return { success: false, message: "No ball fell into a hole.", distanceToHole: minDistance };
}
