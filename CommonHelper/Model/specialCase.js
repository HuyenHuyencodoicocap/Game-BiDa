
class SpecialCase {
    constructor(balls, board) {
        this.balls = balls;
        this.board = board;
    }
    //Kiểm tra có bóng nào giữa 2 bóng k
    isBlockedToTarget(whiteBall, targetBall) {
        for (let ball of this.balls) {
            if (ball === whiteBall || ball === targetBall) continue;

            let angle = Math.abs(whiteBall.angleToBall(targetBall) - whiteBall.angleToBall(ball));
            if (angle < 0.1) { // Nếu bi nằm gần đường thẳng (±5px)
                return true; // Có bi chắn
            }
        }
        return false; // Không có bi chắn
    }
    //Kiểm tra có bóng nào giữa bóng mục tiêu và lỗ k

    isBlockedToHole(whiteBall, targetBall, hole) {
        for (let ball of this.balls) {
            if (ball === whiteBall || ball === targetBall) continue;

            let angle = Math.abs(targetBall.angleToBall(ball) - ball.angleToHole(hole));
            if (angle < 0.1 && targetBall.position.distanceFrom(this.hole) > ball.distanceFrom(hole)) { // Nếu bi nằm gần đường thẳng (±5px)
                return true; // Có bi chắn
            }
        }
        return false; // Không có bi chắn
    }

    // Khi bi chủ và bi mục tiêu nằm trên một đường thẳng hướng vào lỗ, chỉ cần căn lực hợp lý là có thể đưa bi vào.
    isStraightShot(whiteBall) {
        for (let ball of this.balls) {
            if (this.isBlockedToTarget(whiteBall, ball)) continue; // Bi trắng bị chắn
            for (let hole of this.board.HolePosition) {
                if (this.isBlockedToHole(whiteBall, ball, hole)) continue // Bi mục tiêu bị chắn
                let angle = Math.abs(ball.angleToHole(hole) - whiteBall.angleToBall(ball));
                if (angle < 0.1) {
                    return {
                        isBool: true,
                        shotInfo: this.calculateAngle("straight"),
                    }; // Góc cực nhỏ, gần như thẳng
                };
            }
        }
        return { isBool: false };
    }
    // Bi mục tiêu nằm gần lỗ nhưng tạo một góc nhẹ với bi chủ.

    // Chỉ cần căn chỉnh chính xác là có thể đưa bi vào lỗ mà không cần kỹ thuật đặc biệt    
    isEasyAngleShot(whiteBall) {
        for (let ball of this.balls) {
            if (this.isBlockedToTarget(whiteBall, ball)) continue; // Bi trắng bị chắn
            for (let hole of this.board.HolePosition) {
                if (this.isBlockedToHole(whiteBall, ball, hole)) continue // Bi mục tiêu bị chắn
                let angle = Math.abs(ball.angleToHole(hole) - this.whiteBall.angleTo(ball));
                if (angle < 0.5 && this.targetBall.position.distanceFrom(this.hole.position) < 50) {
                    return {
                        isBool: true,
                        shotInfo: this.calculateAngle("easyAngle"),

                    };
                };
            }
        }
        return { isBool: false };

    }
    // Bi mục tiêu đã gần như rơi vào lỗ, chỉ cần đẩy nhẹ là có thể đưa bi xuống.

    isNearHole(whiteBall) {
        for (let ball of this.balls) {
            if (this.isBlockedToTarget(whiteBall, ball)) continue; // Bi trắng bị chắn
            for (let hole of this.board.HolePosition) {
                if (ball.position.distanceFrom(hole) < 5) {
                    return {
                        isBool: true,
                        shotInfo: this.calculateAngle("nearHole"),

                    };
                };
            }
        }
        return { isBool: false };

    }
    // Bi mục tiêu sát băng nhưng ở vị trí dễ điều chỉnh đường đi.

    // Chỉ cần đánh vào băng một góc chính xác, bi sẽ phản xạ đúng hướng vào lỗ     
    isAlongRail(whiteBall) {
        for (let ball of this.balls) {
            if (this.isBlockedToTarget(whiteBall, ball)) continue; // Bi trắng bị chắn
            for (let hole of this.board.HolePosition) {
                if (this.isBlockedToHole(whiteBall, ball, hole)) continue // Bi mục tiêu bị chắn
                if (ball.position.y < 10 || ball.position.y > this.board.height - 10) {
                    return {
                        isBool: true,
                        shotInfo: this.calculateAngle("rail"),

                    };
                };
            }
        }
        return { isBool: false };
    }
    // Bi mục tiêu nằm sát băng, gần lỗ.,Chỉ cần đánh bi chủ chạm vào bi mục tiêu, bi mục tiêu sẽ đập vào băng và lăn vào lỗ theo hướng dễ đoán.
    isSingleBankShot(whiteBall) {
        for (let ball of this.balls) {
            if (this.isBlockedToTarget(whiteBall, ball)) continue; // Bi trắng bị chắn
            for (let hole of this.board.HolePosition) {
                if (this.isBlockedToHole(whiteBall, ball, hole)) continue // Bi mục tiêu bị chắn
                let predictedPath = predictPathAfterBank(ball);

                if (predictedPath.distanceFrom(hole.position) < 5) {
                    return {
                        isBool: true,
                        shotInfo: this.calculateAngle("singleBankShot"),
                    };
                };
            }
        }
        return { isBool: false };
    }
    //  Bi mục tiêu không nằm trên đường thẳng đến lỗ nhưng có thể đánh đôn(bật băng) để đi vào.

    // Đánh bi mục tiêu vào băng với góc phản xạ hợp lý để nó rơi vào lỗ.
    isClearBankShot(whiteBall) {
        for (let ball of this.balls) {
            if (this.isBlockedToTarget(whiteBall, ball)) continue; // Bi trắng bị chắn
            for (let hole of this.board.HolePosition) {
                if (this.isBlockedToHole(whiteBall, ball, hole)) continue // Bi mục tiêu bị chắn
                let bouncePath = predictBankShot(ball);

                if (bouncePath.distanceFrom(hole.position) < 10) {
                    return {
                        isBool: true,
                        shotInfo: this.calculateAngle("bankShot"),
                    };
                };
            }
        }
        return { isBool: false };

    }
    //     Có một bi trung gian nằm giữa bi mục tiêu và lỗ.

    // Thay vì đánh trực tiếp, ta dùng bi trung gian để đẩy bi mục tiêu vào lỗ.
    isEasyCombo() {
        for (let ball of this.balls) {
            let existBall = this.balls.filter(b => b !== ball);
            for (let secondaryBall of existBall) {
                for (let hole of this.board.HolePosition) {
                    let angle = Math.abs(ball.angleToBall(secondaryBall) - ball.angleToHole(hole));
                    if (angle < 0.3 && this.targetBall?.position.distanceFrom(this.secondaryBall.position) < 20) {
                        return {
                            isBool: true,
                            shotInfo: this.calculateAngle("easyCombo"),
                        };
                    }

                }

            }
            return { isBool: false };


        }
    }
    calculateBankAngle(targetBall, hole) {
        // Xác định cạnh băng gần nhất
        let boardWidth = this.board.width;
        let boardHeight = this.board.height;

        let bounceX, bounceY;

        // Kiểm tra bi sẽ chạm vào băng ngang hay băng dọc
        if (targetBall.position.x < hole.position.x) {
            bounceX = 0; // Bi chạm vào băng trái
        } else if (targetBall.position.x > hole.position.x) {
            bounceX = boardWidth; // Bi chạm vào băng phải
        } else {
            bounceX = targetBall.position.x; // Không chạm vào băng dọc
        }

        if (targetBall.position.y < hole.position.y) {
            bounceY = 0; // Bi chạm vào băng trên
        } else if (targetBall.position.y > hole.position.y) {
            bounceY = boardHeight; // Bi chạm vào băng dưới
        } else {
            bounceY = targetBall.position.y; // Không chạm vào băng ngang
        }

        // Tạo điểm chạm băng
        let bouncePoint = { x: bounceX, y: bounceY };

        // Tính góc phản xạ
        let angleToBounce = targetBall.angleTo(bouncePoint);
        let angleToHole = bouncePoint.angleTo(hole);

        // Góc phản xạ phải bằng góc tới => tính góc bù
        let bankAngle = 2 * angleToBounce - angleToHole;

        return bankAngle;
    }

    calculateAngle(shootType) {
        let shotInfo = {
            angle: 0,
            power: 0
        };

        // Tính góc giữa bi trắng và bi mục tiêu
        let angleToTarget = this.whiteBall.angleToBall(this.targetBall);

        // Tính góc giữa bi mục tiêu và lỗ
        let angleToHole = this.targetBall.angleToHole(this.hole);

        switch (shotType) {
            case "straight":
                shotInfo.power = this.calculatePower(shootType);
                shotInfo.angle = angleToTarget;
                break;
            case "easyAngle":
                shotInfo.power = this.calculatePower(shootType);
                shotInfo.angle = angleToTarget + (angleToHole - angleToTarget) / 2; // Điều chỉnh góc
                break;
            case "nearHole":
                shotInfo.power = this.calculatePower(shootType);
                shotInfo.angle = angleToTarget;
                break;
            case "rail":
                shootType.power = this.calculatePower(shootType);
                shotInfo.angle = angleToTarget + 10; // Điều chỉnh góc phản xạ
                break;
            case "bankShot":
                shootType.power = this.calculatePower(shootType);
                shotInfo.angle = this.calculateBankAngle(this.targetBall, this.hole);
                break;
            case "singleBankShot": // ⚡ Bổ sung cú đánh bật băng đơn
                shootType.power = this.calculatePower(shootType);
                shotInfo.angle = this.calculateBankAngle(this.targetBall, this.hole) + 5;
                break;
            case "easyCombo": // ⚡ Bổ sung cú đánh combo
                shootType.power = this.calculatePower(shootType);
                shootType.angle = this.targetBall.angleToBall(this.secondaryBall) + (this.secondaryBall.angleToHole(this.hole) - this.targetBall.angleToBall(this.secondaryBall))
                break;
            default:
                shootType.power = this.calculatePower(shootType);
                shotInfo.angle = angleToTarget;
                break;
        }
        return shotInfo;
    }

    calculatePower(shotType) {
        let distanceToTarget = whiteBall.position.distanceFrom(targetBall.position);
        let distanceToHole = targetBall.position.distanceFrom(hole.position);

        let power = 1000; // Mặc định lực trung bình

        switch (shotType) {
            case "straight":
                power = Math.min(2000, Math.max(200, distanceToTarget * 15 - distanceToHole * 3));
                break;
            case "easyAngle":
                power = Math.min(1800, Math.max(200, distanceToTarget * 12 - distanceToHole * 2.5));
                break;
            case "nearHole":
                power = Math.max(200, 500 - distanceToHole * 5); // Giữ lực nhẹ để tránh bật lỗ
                break;
            case "rail":
                power = Math.min(1700, Math.max(200, distanceToTarget * 13 - distanceToHole * 2));
                break;
            case "bankShot":
                power = Math.min(2000, Math.max(200, distanceToTarget * 18 - distanceToHole * 2));
                break;
            case "singleBankShot": // ⚡ Bổ sung cú đánh bật băng đơn
                power = Math.min(1900, Math.max(200, distanceToTarget * 16 - distanceToHole * 2));
                break;
            case "easyCombo": // ⚡ Bổ sung cú đánh combo
                power = Math.min(1600, Math.max(200, distanceToTarget * 10 - distanceToHole * 1.5));
                break;
            default:
                power = Math.min(1900, Math.max(200, distanceToTarget * 14 - distanceToHole * 2.5));
                break;
        }

        return power;
    }

    predictPathAfterBank(targetBall) {
        let predictedPath = { x: targetBall.position.x, y: targetBall.position.y };

        // Xác định bi va vào băng nào (trên, dưới, trái, phải)
        if (targetBall.position.y <= 10) {
            // Va băng trên
            predictedPath.y = Math.abs(targetBall.position.y);
        } else if (targetBall.position.y >= this.board.height - 10) {
            // Va băng dưới
            predictedPath.y = this.board.height - Math.abs(this.board.height - targetBall.position.y);
        }

        if (targetBall.position.x <= 10) {
            // Va băng trái
            predictedPath.x = Math.abs(targetBall.position.x);
        } else if (targetBall.position.x >= this.board.width - 10) {
            // Va băng phải
            predictedPath.x = this.board.width - Math.abs(this.board.width - targetBall.position.x);
        }

        return predictedPath;
    }
    predictBankShot(targetBall) {
        let closestRail = this.getClosestRail(targetBall);
        let bankPoint = this.getBankPoint(targetBall, closestRail);

        return bankPoint;
    }

    // Xác định băng gần nhất để bi mục tiêu bật vào
    getClosestRail(targetBall) {
        let rails = [
            { x: targetBall.position.x, y: 0 }, // Băng trên
            { x: targetBall.position.x, y: this.board.height }, // Băng dưới
            { x: 0, y: targetBall.position.y }, // Băng trái
            { x: this.board.width, y: targetBall.position.y } // Băng phải
        ];

        let closestRail = rails.reduce((closest, rail) => {
            let distance = targetBall.position.distanceFrom(rail);
            return distance < closest.distance ? { point: rail, distance } : closest;
        }, { point: null, distance: Infinity });

        return closestRail.point;
    }

    // Xác định điểm mà bi mục tiêu sẽ bật vào băng
    getBankPoint(targetBall, rail) {
        return {
            x: rail.x === 0 ? targetBall.position.x * -1 : rail.x === this.board.width ? this.board.width - targetBall.position.x : targetBall.position.x,
            y: rail.y === 0 ? targetBall.position.y * -1 : rail.y === this.board.height ? this.board.height - targetBall.position.y : targetBall.position.y
        };
    }
    getSpecialCase(whiteBall) {
        if (this.isStraightShot(whiteBall).isBool) {
            return this.isStraightShot(whiteBall)
        }
        if (this.isEasyAngleShot(whiteBall).isBool) {
            return this.isEasyAngleShot(whiteBall)
        }
        if (this.isNearHole(whiteBall).isBool) {
            return this.isNearHole(whiteBall)
        }
        if (this.isAlongRail(whiteBall).isBool) {
            return this.isAlongRail(whiteBall)
        }
        if (this.isSingleBankShot(whiteBall).isBool) {
            return this.isSingleBankShot(whiteBall)
        }
        if (this.isClearBankShot(whiteBall).isBool) {
            return this.isClearBankShot(whiteBall)
        }
        if (this.isEasyCombo(whiteBall).isBool) {
            return this.isEasyCombo(whiteBall)
        }
        return { isBool: false }



    }
}