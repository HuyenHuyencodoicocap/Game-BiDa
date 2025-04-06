class GeneticAlgorithm {
    constructor(populationSize, mutationRate, simulation) {
        this.populationSize = populationSize;
        this.mutationRate = mutationRate;
        this.simulation = simulation;
        this.population = [];
        this.cache = {}; // Cache các kết quả simulateShot để tránh tính lại
    }

    initializePopulation() {
        this.population = Array.from({ length: this.populationSize }, () => ({
            angle: Math.random() * 360,
            power: Math.random() * 200
        }));
    }

    evaluateFitness(shot) {
        // Sử dụng cache để tránh tính toán lại
        const key = `${shot.angle}-${shot.power}`;
        if (this.cache[key]) return this.cache[key];

        let result = simulateShot(shot.angle, shot.power, this.simulation.whiteBall, this.simulation.balls, this.simulation.holes);
        let fitness = 0;

        if (result.success) {
            fitness = 3000 + result.countBallToHole.countYellowBallHole * 500;
        } else {
            let penalty = result.countBallToHole.whiteBallInHole ? 500 : 0;
            fitness = -result.distanceToHole * 2 - penalty - result.countBallToHole.countRedBallHole * 100;
        }

        // Cache kết quả
        this.cache[key] = { fitness, distanceToHole: result.distanceToHole };
        return this.cache[key];
    }

    selectParent() {
        let totalFitness = this.population.reduce((sum, individual) => sum + Math.max(0, this.evaluateFitness(individual).fitness), 0);
        let randomValue = Math.random() * totalFitness;

        for (let individual of this.population) {
            randomValue -= Math.max(0, this.evaluateFitness(individual).fitness);
            if (randomValue <= 0) return individual;
        }
        return this.population[0];
    }

    crossover(parent1, parent2) {
        // Sử dụng uniform crossover để tạo ra sự đa dạng
        return {
            angle: Math.random() > 0.5 ? parent1.angle : parent2.angle,
            power: Math.random() > 0.5 ? parent1.power : parent2.power
        };
    }

    mutate(shot) {
        if (Math.random() < this.mutationRate) {
            const angleRange = 10;
            const powerRange = 20;

            shot.angle += (Math.random() - 0.5) * angleRange;
            shot.angle = (shot.angle + 360) % 360;

            shot.power += (Math.random() - 0.5) * powerRange;
            shot.power = Math.max(0, Math.min(200, shot.power));
        }
        return shot;
    }

    run(generations) {
        this.initializePopulation();

        for (let gen = 0; gen < generations; gen++) {
            this.population.sort((a, b) =>
                this.evaluateFitness(b).fitness - this.evaluateFitness(a).fitness
            );

            let newPopulation = [];
            let topN = Math.floor(this.populationSize * 0.2);
            newPopulation.push(...this.population.slice(0, topN));

            while (newPopulation.length < this.populationSize) {
                let parent1 = this.selectParent();
                let parent2 = this.selectParent();
                let offspring = this.crossover(parent1, parent2);
                newPopulation.push(this.mutate(offspring));
            }

            this.population = newPopulation;
        }

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
        let bestShot = { angle: 0, power: 0, successRate: 0, distanceToHole: Infinity };

        for (let i = 0; i < this.iterations; i++) {
            let shot = initialPopulation[i % initialPopulation.length];
            let { successRate, averageDistance } = this.simulateShot(shot.angle, shot.power);

            if (successRate > bestShot.successRate || (successRate === bestShot.successRate && averageDistance < bestShot.distanceToHole)) {
                bestShot = { ...shot, successRate, distanceToHole: averageDistance };
            }
        }

        return bestShot;
    }

    simulateShot(angle, power, simulations = 10) { // Tăng số lần mô phỏng
        let success = 0;
        let totalDistance = 0;

        for (let i = 0; i < simulations; i++) {
            let result = simulateShot(angle, power, this.simulation.whiteBall, this.simulation.balls, this.simulation.holes);
            if (result.success && result.countBallToHole.countYellowBallHole > 0) success++; // Ưu tiên bi vàng
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
        this.geneticAlgorithm = new GeneticAlgorithm(50, 0.15, state);
        this.mcts = new MonteCarloTreeSearch(100, state);
    }

    train() {
        let cur = Date.now();

        // Tìm cú đánh tốt nhất từ thuật toán di truyền
        let bestGeneticShot = this.geneticAlgorithm.run(5); // Giảm số thế hệ

        // Tìm cú đánh tốt nhất từ MCTS
        let bestMCTSShot = this.mcts.findBestShot(this.geneticAlgorithm.population);

        console.log("Thời gian tìm kiếm:", Date.now() - cur, "ms");

        // So sánh và chọn cú đánh tốt nhất
        return bestMCTSShot.successRate > 0.6 ? bestMCTSShot : bestGeneticShot;
    }
}
