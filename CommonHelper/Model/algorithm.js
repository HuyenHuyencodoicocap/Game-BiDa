
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
            power: Math.random() * 1800 + 200
        }));
    }

    evaluateFitness(shot) {
        let result = simulateShot(shot.angle, shot.power, this.simulation.whiteBall, this.simulation.balls, this.simulation.holes);

        let controlBonus = result.success ? 500 : 0;
        let fitness = 0;

        if (result.success) {
            // Đánh giá cú đánh thành công
            fitness = 1000 - result.distanceToHole * 5 + result.countBallToHole.countYellowBallHole * 150 + controlBonus;
        } else {
            let scoreWhiteBall = result.countBallToHole.whiteBallInHole ? 200 : 0;
            // Đánh giá cú đánh thất bại
            fitness = -result.distanceToHole * 3 - scoreWhiteBall - result.countBallToHole.countRedBallHole * 100 + result.countBallToHole.countYellowBallHole * 150;
        }

        // Trả về kết quả với điểm số và khoảng cách tới lỗ để đánh giá cú đánh
        return { fitness, distanceToHole: result.distanceToHole };
    }
    selectParent() {
        let tournamentSize = 5;  // Kích thước tournament
        let tournament = [];

        // Chọn ngẫu nhiên các cá thể tham gia vào cuộc thi
        for (let i = 0; i < tournamentSize; i++) {
            let randomIndex = Math.floor(Math.random() * this.population.length);
            tournament.push(this.population[randomIndex]);
        }

        // Sắp xếp các cá thể trong tournament và chọn cá thể có fitness tốt nhất
        tournament.sort((a, b) => this.evaluateFitness(b).fitness - this.evaluateFitness(a).fitness);

        return tournament[0];  // Trả về cá thể tốt nhất trong tournament
    }


    crossover(parent1, parent2) {
        return {
            angle: (parent1.angle + parent2.angle) / 2,
            power: (parent1.power + parent2.power) / 2
        };
    }

    mutate(shot) {
        if (Math.random() < this.mutationRate) {
            shot.angle += (Math.random() - 0.5) * 10;
            shot.power += (Math.random() - 0.5) * 20;
        }
        return shot;
    }

    run(generations) {
        this.initializePopulation();
        for (let gen = 0; gen < generations; gen++) {
            let newPopulation = [];
            let topN = 5; // Keep top 5 best solutions
            let elite = this.population.slice(0, topN);
            newPopulation.push(...elite);

            // Generate new population from parents
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

        return this.selectParent();  // Return the best shot from final population
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

    simulateShot(angle, power) {
        let success = 0;
        let totalDistance = 0;  // Biến dùng để tính tổng khoảng cách
        for (let i = 0; i < 5; i++) {
            let result = simulateShot(angle, power, this.simulation.whiteBall, this.simulation.balls, this.simulation.holes);
            if (result.success) success++;
            totalDistance += result.distanceToHole;  // Thêm khoảng cách vào tổng
        }

        let averageDistance = totalDistance / 5;  // Tính khoảng cách trung bình
        let successRate = success / 5;

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
        // Tìm cú đánh tốt nhất từ thuật toán di truyền
        let bestGeneticShot = this.geneticAlgorithm.run(10);

        // Tìm cú đánh tốt nhất từ MCTS
        let bestMCTSShot = this.mcts.findBestShot(this.geneticAlgorithm.population);

        // Tìm cú đánh phòng thủ tốt nhất
        let bestDefensiveShot = this.findDefensiveShot();

        // Kiểm tra nếu cú đánh phòng thủ tốt hơn thì chọn nó
        if (bestDefensiveShot.distanceToHole > bestGeneticShot.distanceToHole && bestDefensiveShot.distanceToHole > bestMCTSShot.distanceToHole) {
            return bestDefensiveShot;
        }

        // Nếu cú đánh từ MCTS tốt hơn thì chọn cú đánh đó
        return bestMCTSShot.successRate > 0.6 ? bestMCTSShot : bestGeneticShot;
    }

    findDefensiveShot() {
        let bestDefensiveShot = { angle: 0, power: 500, distanceToHole: Infinity };

        for (let shot of this.geneticAlgorithm.population) {
            let result = simulateShot(shot.angle, shot.power, this.state.whiteBall, this.state.balls, this.state.holes);

            let opponentBall = this.state.balls.find(b => b.color === 'RED');  // Update color check as 'RED'
            let distanceToOpponent = opponentBall ? result.whiteBallPosition.distanceFrom(opponentBall.position) : Infinity;

            if (!result.success && (result.distanceToHole > bestDefensiveShot.distanceToHole || distanceToOpponent < 50)) {
                bestDefensiveShot = { ...shot, distanceToHole: result.distanceToHole };
            }
        }

        return bestDefensiveShot;
    }


}


