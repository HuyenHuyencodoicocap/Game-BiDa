function simulateShot(angle, power, whiteBall, balls, holes) {
    let whiteBallInHole = false;
    let countRedBallHole = 0;
    let countYellowBallHole = 0;
    let haveBallInHole = [];
     
    // Tạo bóng trắng giả
    let simulatedWhiteBall = new Ball(whiteBall.position.copy(), whiteBall.color);
    simulatedWhiteBall.vantoc = new Vector2D(
        power / 50.0 * Math.cos(angle * Math.PI / 180),
        power / 50.0 * Math.sin(angle * Math.PI / 180)
    );

    // Tạo danh sách các bóng giả
    let simulatedBalls = balls.map(ball => new Ball(ball.position.copy(), ball.color));
    simulatedBalls.push(simulatedWhiteBall);

    let deltaTime = 1/100; // Giảm deltaTime để tăng độ chính xác
    let maxSteps = 100; // Tăng số bước tối đa để bù cho deltaTime nhỏ hơn    let allBallsStopped = false;
    let stepCount = 0;
    let countBallIsNotMoving = new Set(); // Đếm số bóng không di chuyển
    // Bắt đầu mô phỏng
    for (let step = 0; step < maxSteps ; step++) {

        stepCount++;

        
        for (let i = 0; i < simulatedBalls.length; i++) {
            if (simulatedBalls[i].isInHole) continue;
            simulatedBalls[i].update(deltaTime);
            for (let j = i + 1; j < simulatedBalls.length; j++) {
                if (simulatedBalls[j].isInHole) continue;
                simulatedBalls[i].CollideBall(simulatedBalls[j]);
            }
            simulatedBalls[i].CollideWall();
            simulatedBalls[i].CollideHole();
            if( ! simulatedBalls[i].isMoving() || simulatedBalls[i].isInHole){
                countBallIsNotMoving.add(simulatedBalls[i].id); // Thêm bóng vào danh sách không di chuyển
            }
        }

        // Kiểm tra bóng vào lỗ
        for (let ball of simulatedBalls) {
            if (ball.isInHole && !haveBallInHole.includes(ball.id)) {
                haveBallInHole.push(ball.id);
                if (ball.color === BallColor.YELLOW) {
                    countYellowBallHole++;
                } else if (ball.color === BallColor.WHITE) {
                    whiteBallInHole = true;
                } else {
                    countRedBallHole++;
                }
            }
        }
        if(countBallIsNotMoving.size===simulatedBalls.length){
            break; // Nếu tất cả các bóng đều không di chuyển, dừng mô phỏng
        }

    }
    //  console.log(`bong dung di chuyen:${countBallIsNotMoving.size} stepCount: ${stepCount} deltaTime: ${deltaTime} power: ${power} angle: ${angle} whiteBallInHole: ${whiteBallInHole} countRedBallHole: ${countRedBallHole} countYellowBallHole: ${countYellowBallHole}`);

    let newWhiteBall = simulatedBalls.find(item => item.color === BallColor.WHITE);


    // Kiểm tra kết quả
    if (countYellowBallHole > 0 && !whiteBallInHole && countRedBallHole === 0) {
        return {
            success: true,
            message: "Thành công",
            whiteBallPosition: newWhiteBall?.position.copy(),
            distanceToHole: 0,
            countBallToHole: { whiteBallInHole, countRedBallHole, countYellowBallHole }
        };
    }
    if (whiteBallInHole || countRedBallHole > 0) {
        return {
            success: false,
            message: "Phạm quy",
            whiteBallPosition: newWhiteBall?.position.copy(),
            distanceToHole: 0,
            countBallToHole: { whiteBallInHole, countRedBallHole, countYellowBallHole }
        };
    }

    // Trả về nếu bi vàng vào lỗ
   

    // Tính khoảng cách từ quả bóng trắng đến lỗ gần nhất nếu không có bi nào vào lỗ
    let minDistance = Infinity;
    for (let hole of holes) {
        let distance = simulatedWhiteBall.position.distanceFrom(hole);
        minDistance = Math.min(minDistance, distance);
    }

    return {
        success: false,
        message: "No ball fell into a hole.",
        whiteBallPosition: newWhiteBall?.position.copy(),
        distanceToHole: minDistance,
        countBallToHole: { whiteBallInHole, countRedBallHole, countYellowBallHole }
    };
}
