function simulateShot(angle, power, whiteBall, balls, holes) {
    let whiteBallInHole = false;
    let countRedBallHole = 0;
    let countYellowBallHole = 0;
    let haveBallInHole = [];

    // Tạo bóng trắng giả
    let simulatedWhiteBall = new Ball(whiteBall.position.copy(), whiteBall.color);
    simulatedWhiteBall.vantoc = new Vector2D(
        Math.cos(angle * Math.PI / 180) * (power / 50),
        Math.sin(angle * Math.PI / 180) * (power / 50)
    );

    // Tạo danh sách các bóng giả
    let simulatedBalls = balls.map(ball => new Ball(ball.position.copy(), ball.color));
    simulatedBalls.push(simulatedWhiteBall);

    let maxSteps = 300;
    let allBallsStopped = false;
    let stepCount = 0;
    let deltaTime = 16; // Thời gian giữa các bước mô phỏng (16ms tương đương 60 FPS)

    // Bắt đầu mô phỏng
    for (let step = 0; step < maxSteps && !allBallsStopped; step++) {
        allBallsStopped = true; // Mặc định cho đến khi có bóng còn di chuyển
        stepCount++;

        for (let i = 0; i < simulatedBalls.length; i++) {
            let ball = simulatedBalls[i];
            if (ball.isInHole) continue; // Bỏ qua bóng đã vào lỗ

            ball.update(deltaTime); // Cập nhật tốc độ và vị trí của bóng

            // Kiểm tra va chạm bóng
            for (let j = i + 1; j < simulatedBalls.length; j++) {
                if (!simulatedBalls[j].isInHole) {
                    ball.CollideBall(simulatedBalls[j]);
                }
            }
            ball.CollideWall(); // Kiểm tra va chạm với tường
            ball.CollideHole(); // Kiểm tra va chạm với lỗ

            if (ball.isMoving()) {
                allBallsStopped = false; // Nếu có bóng còn di chuyển
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

    }

    let newWhiteBall = simulatedBalls.find(item => item.color === BallColor.WHITE);
    console.log(`So buoc mo phong: ${stepCount}`);
    console.log(`Bong trang vao lo: ${whiteBallInHole}, So luong bi do vao lo: ${countRedBallHole}, So luong bi vang vao lo: ${countYellowBallHole}`);
    console.log(haveBallInHole);

    // Kiểm tra kết quả
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
    if (countYellowBallHole > 0) {
        return {
            success: true,
            message: "Thành công",
            whiteBallPosition: newWhiteBall?.position.copy(),
            distanceToHole: 0,
            countBallToHole: { whiteBallInHole, countRedBallHole, countYellowBallHole }
        };
    }

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
