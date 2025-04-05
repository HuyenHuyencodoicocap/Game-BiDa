
class GeneticAlgorithm {
    constructor(populationSize, mutationRate, simulation) {
        this.populationSize = populationSize;
        this.mutationRate = mutationRate;
        this.simulation = simulation;
        this.population = [];
    }

    initializePopulation() {
        this.population = Array.from({ length: this.populationSize }, () => ({
            angle: Math.random() * 360,
            power: Math.random() * 200
        }));
    }

    evaluateFitness(shot) {
        let result = simulateShot(shot.angle, shot.power, this.simulation.whiteBall, this.simulation.balls, this.simulation.holes);

        let controlBonus = result.success ? 500 : 0;
        let fitness = 0;

        if (result.success) {
            // Đánh giá cú đánh thành công
            fitness = 1200 + result.countBallToHole.countYellowBallHole * 150 + controlBonus;
        } else {
            let scoreWhiteBall = result.countBallToHole.whiteBallInHole ? 200 : 0;
            // Đánh giá cú đánh thất bại
            fitness = -result.distanceToHole * 3 - scoreWhiteBall - result.countBallToHole.countRedBallHole * 100 + result.countBallToHole.countYellowBallHole * 150;
        }

        // Trả về kết quả với điểm số và khoảng cách tới lỗ để đánh giá cú đánh
        return { fitness, distanceToHole: result.distanceToHole };
    }
    selectParent() {
        let tournamentSize = 5;
        let tournament = [];
        let bestFitness = -Infinity;
        let bestIndividual = null;

        // Chọn và đánh giá từng cá thể một, giữ lại cá thể tốt nhất
        for (let i = 0; i < tournamentSize; i++) {
            let randomIndex = Math.floor(Math.random() * this.population.length);
            let individual = this.population[randomIndex];
            let fitness = this.evaluateFitness(individual).fitness;

            if (fitness > bestFitness) {
                bestFitness = fitness;
                bestIndividual = individual;
            }
        }

        return bestIndividual;  // Trả về cá thể tốt nhất tìm thấy
    }


    crossover(parent1, parent2) {
        return {
            angle: (parent1.angle + parent2.angle) / 2,
            power: (parent1.power + parent2.power) / 2
        };
    }

    mutate(shot) {
        if (Math.random() < this.mutationRate) {
            // Sử dụng phần trăm tương đối cho cả góc và lực
            const angleRange = 10; // ±5% của 360 độ
            const powerRange = 20; // ±10% của khoảng lực (0-200)

            shot.angle += (Math.random() - 0.5) * angleRange;
            // Giữ góc trong khoảng 0-360
            shot.angle = (shot.angle + 360) % 360;

            shot.power += (Math.random() - 0.5) * powerRange;
            // Giữ lực trong khoảng hợp lệ
            shot.power = Math.max(0, Math.min(200, shot.power));
        }
        return shot;
    }

    run(generations) {
        this.initializePopulation();

        for (let gen = 0; gen < generations; gen++) {
            // Đánh giá và sắp xếp quần thể theo độ phù hợp (từ cao đến thấp)
            this.population.sort((a, b) =>
                this.evaluateFitness(b).fitness - this.evaluateFitness(a).fitness
            );

            let newPopulation = [];
            let topN = 5; // Giữ 5 giải pháp tốt nhất

            // Thêm elite vào quần thể mới (đã được sắp xếp ở trên)
            newPopulation.push(...this.population.slice(0, topN));

            // Tạo quần thể mới từ các cha mẹ
            for (let i = topN; i < this.populationSize; i++) {
                let parent1 = this.selectParent();
                let parent2;
                do {
                    parent2 = this.selectParent();
                } while (parent1 === parent2);

                let offspring = this.crossover(parent1, parent2);
                newPopulation.push(this.mutate(offspring));
            }

            this.population = newPopulation;
        }

        // Đánh giá lại và trả về cá thể tốt nhất
        this.population.sort((a, b) =>
            this.evaluateFitness(b).fitness - this.evaluateFitness(a).fitness
        );
        return this.population[0];
    }
}

class MonteCarloTreeSearch {
    constructor(iterations, simulation) {
        this.simulation = simulation;
        this.iterations = iterations;
    }

    findBestShot(initialPopulation) {
        let bestShot = { angle: 0, power: 0, successRate: 0, distanceToHole: Infinity };  // Thêm `distanceToHole` vào kết quả ban đầu

        for (let i = 0; i < this.iterations; i++) {
            let shot = initialPopulation[i % initialPopulation.length];
            let { successRate, averageDistance } = this.simulateShot(shot.angle, shot.power);

            // So sánh và chọn cú đánh tốt nhất
            if (successRate > bestShot.successRate || (successRate === bestShot.successRate && averageDistance < bestShot.distanceToHole)) {
                bestShot = { ...shot, successRate, distanceToHole: averageDistance };
            }
        }

        return bestShot;
    }

    simulateShot(angle, power, simulations = 3) { // Tăng lên 10 lần mô phỏng, có thể điều chỉnh
        let success = 0;
        let totalDistance = 0;
        for (let i = 0; i < simulations; i++) {
            let result = simulateShot(angle, power, this.simulation.whiteBall, this.simulation.balls, this.simulation.holes);
            if (result.success) success++;
            totalDistance += result.distanceToHole;
        }

        let averageDistance = totalDistance / simulations;
        let successRate = success / simulations;

        return { successRate, averageDistance };
    }
}

class AITrainer {
    constructor(state) {
        this.state = state;
        this.geneticAlgorithm = new GeneticAlgorithm(50, 0.25, state);
        this.mcts = new MonteCarloTreeSearch(100, state);
    }

    train() {
        let cur = Date.now()
        // Tìm cú đánh tốt nhất từ thuật toán di truyền
        let bestGeneticShot = this.geneticAlgorithm.run(8);

        // Tìm cú đánh tốt nhất từ MCTS
        let bestMCTSShot = this.mcts.findBestShot(this.geneticAlgorithm.population);

        // Tìm cú đánh phòng thủ tốt nhất
        let bestDefensiveShot = this.findDefensiveShot();

        // Kiểm tra nếu cú đánh phòng thủ tốt hơn thì chọn nó
        if (bestDefensiveShot.distanceToHole > bestGeneticShot.distanceToHole && bestDefensiveShot.distanceToHole > bestMCTSShot.distanceToHole) {
            return bestDefensiveShot;
        }
        console.log("Thời gian tìm kiếm cú đánh tốt nhất:", Date.now() - cur, "ms");

        // Nếu cú đánh từ MCTS tốt hơn thì chọn cú đánh đó
        return bestMCTSShot.successRate > 0.6 ? bestMCTSShot : bestGeneticShot;
    }

    findDefensiveShot() {
        let bestDefensiveShot = { angle: 0, power: 50, distanceToHole: Infinity, score: -Infinity };

        for (let shot of this.geneticAlgorithm.population) {
            let result = simulateShot(shot.angle, shot.power, this.state.whiteBall, this.state.balls, this.state.holes);

            // Tìm vị trí của các bi đối thủ
            let opponentBalls = this.state.balls.filter(b => b.color === 'RED');

            // Tính điểm phòng thủ dựa trên nhiều yếu tố
            let defensiveScore = 0;

            // 1. Bóng trắng càng xa lỗ càng tốt
            defensiveScore += result.distanceToHole * 0.5;

            // 2. Bóng trắng nên cách xa các bóng đối thủ
            let minDistanceToOpponent = Infinity;
            for (let opponentBall of opponentBalls) {
                let distance = result.whiteBallPosition.distanceFrom(opponentBall.position);
                minDistanceToOpponent = Math.min(minDistanceToOpponent, distance);
            }
            defensiveScore += minDistanceToOpponent * 2;

            // 3. Phạt nếu bóng trắng vào lỗ hoặc bóng đỏ vào lỗ
            if (result.countBallToHole.whiteBallInHole || result.countBallToHole.countRedBallHole > 0) {
                defensiveScore -= 1000;
            }

            // 4. Thưởng nếu đưa bóng vàng vào lỗ
            defensiveScore += result.countBallToHole.countYellowBallHole * 500;

            // Cập nhật cú đánh phòng thủ tốt nhất
            if (defensiveScore > bestDefensiveShot.score) {
                bestDefensiveShot = {
                    ...shot,
                    distanceToHole: result.distanceToHole,
                    score: defensiveScore
                };
            }
        }

        return bestDefensiveShot;
    }


}


