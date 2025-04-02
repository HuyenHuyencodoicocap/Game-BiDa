function simulateShot(angle, power, whiteBall, balls, holes) {
    let whiteBallInHole = false;
    let countRedBallHole = 0;
    let countYellowBallHole = 0

    // Tạo bóng trắng giả
    let simulatedWhiteBall = new Ball(whiteBall.position.copy(), whiteBall.color);
    simulatedWhiteBall.vantoc = new Vector2D(
        Math.cos(angle * Math.PI / 180) * (power / 50),
        Math.sin(angle * Math.PI / 180) * (power / 50)
    );
    //console.log("Khởi tạo", simulatedWhiteBall);

    // Tạo danh sách các bóng giả
    let simulatedBalls = balls.map(ball => {
        let clone = new Ball(ball.position.copy(), ball.color);
        return clone;
    });
    simulatedBalls.push(simulatedWhiteBall)

    let maxSteps = 500;
    let i = 0
    let deltaTime = Math.random() * (18 - 15) + 15;
    let haveBallInHole = [];


    // Bắt đầu mô phỏng
    for (let step = 0; step < maxSteps; step++) {
        let allBallsStopped = true; // Khai báo và kiểm tra xem tất cả các bóng đã dừng lại chưa

        i++;

        for (let i = 0; i < simulatedBalls.length; i++) {
            if (simulatedBalls[i].isInHole) continue;
            simulatedBalls[i].update(deltaTime);
            for (let j = i + 1; j < simulatedBalls.length; j++) {
                simulatedBalls[i].CollideBall(simulatedBalls[j]);
            }
            simulatedBalls[i].CollideWall();
            simulatedBalls[i].CollideHole();
            if (simulatedBalls[i].isMoving()) {
                allBallsStopped = false;
            }
        }


        // Kiểm tra bóng vào lỗ
        for (let ball of simulatedBalls) {
            //console.log(`Vị trí bóng ${String(ball.color)}`, ball.vantoc);

            if (ball.isInHole && !haveBallInHole.includes(ball.id)) { // Kiểm tra xem bóng đã vào lỗ chưa, dùng ball.id hoặc ball.color
                haveBallInHole.push(ball.id); // Đánh dấu bóng đã vào lỗ
                // Nếu bóng vàng vào lỗ, trả về thông báo thành công
                if (ball.color === BallColor.YELLOW) {
                    countYellowBallHole++;
                }
                else if (ball.color === BallColor.WHITE) {
                    whiteBallInHole = true;
                }
                // Nếu bóng đỏ hoặc bóng khác vào lỗ
                else {
                    countRedBallHole++;
                }
            }
        }
        if (allBallsStopped) {
            break; // Dừng vòng lặp step
        }



    }
    let newWhiteBall = simulatedBalls.find(item => item.color === BallColor.WHITE)
    console.log(`Số bước ${i} ,bóng trắng vào lỗ ${whiteBallInHole},số bóng đỏ vào lỗ ${countRedBallHole},số bóng vàng vào lỗ ${countYellowBallHole}`);
    console.log(haveBallInHole);

    if (whiteBallInHole === true || countRedBallHole > 0) {
        return {
            success: false, message: `Phạm quy`, whiteBallPosition: newWhiteBall?.position.copy(), distanceToHole: 0, countBallToHole: { whiteBallInHole: whiteBallInHole, countRedBallHole: countRedBallHole, countYellowBallHole: countYellowBallHole }
        };

    }
    else {
        if (countYellowBallHole > 0) {
            return {
                success: true, message: `Thành công`, whiteBallPosition: newWhiteBall?.position.copy(), distanceToHole: 0, countBallToHole: { whiteBallInHole: whiteBallInHole, countRedBallHole: countRedBallHole, countYellowBallHole: countYellowBallHole }
            };
        }
    }


    // Nếu không có bi nào vào lỗ, tính khoảng cách từ quả bóng trắng đến lỗ gần nhất
    let minDistance = Infinity;
    for (let hole of holes) {
        let distance = simulatedWhiteBall.position.distanceFrom(hole);
        if (distance < minDistance) {
            minDistance = distance;
        }
    }

    // Trả về kết quả nếu không có quả bóng nào vào lỗ
    return {
        success: false, message: "No ball fell into a hole.", whiteBallPosition: newWhiteBall?.position.copy(), distanceToHole: minDistance, countBallToHole: { whiteBallInHole: true, countRedBallHole: countRedBallHole, countYellowBallHole: countYellowBallHole }
    }
};

