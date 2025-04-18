class GeneticAlgorithm {
    constructor(populationSize, mutationRate, simulation) {
        this.populationSize = populationSize;
        this.mutationRate = mutationRate;
        this.simulation = simulation;
        this.population = new Set(); // Sử dụng Set để đảm bảo tính duy nhất
        this.bestPopulation = new Set(); // Lưu các cú đánh tốt nhất
        this.cache = {}; // Cache các kết quả simulateShot để tránh tính toán lại
    }

    // Khởi tạo quần thể ban đầu
    initializePopulation() {
        while (this.population.size < this.populationSize) {
            const individual = {
                angle: Math.random() * 360 - 180, // Góc từ -180 đến 180
                power: Math.random() * 200       // Lực từ 0 đến 200
            };

            // Thêm cá thể vào Set dưới dạng chuỗi JSON để đảm bảo tính duy nhất
            this.population.add(JSON.stringify(individual));
        }
    }

    // Đánh giá độ phù hợp (fitness) của một cú đánh
    evaluateFitness(shot) {
        const key = `${shot.angle}-${shot.power}`;
        if (this.cache[key]) return this.cache[key];

        let result = simulateShot(shot.angle, shot.power, this.simulation.whiteBall, this.simulation.balls, this.simulation.holes);
        let fitness = 0;

        if (result.success) {
            // Trường hợp thành công, ưu tiên bi vàng vào lỗ
            fitness = 3000 + result.countBallToHole.countYellowBallHole * 500 + 500;
        } else {
            let penalty = result.countBallToHole.whiteBallInHole ? 1500 : 0; // Tăng phạt cho bóng trắng vào lỗ
            fitness = -result.distanceToHole * 2 - penalty - result.countBallToHole.countRedBallHole * 100;
        }

        if (fitness > 4000 ) {
            this.bestPopulation.add(JSON.stringify({ ...shot, fitness }));
            this.population.delete(JSON.stringify(shot)); 
        }

        this.cache[key] = { fitness, distanceToHole: result.distanceToHole };
        return this.cache[key];
    }

    // Chọn cha mẹ từ quần thể
    selectParent() {
        let populationArray = Array.from(this.population).map(individual => JSON.parse(individual));

        let totalFitness = populationArray.reduce((sum, individual) =>
            sum + Math.max(0, this.evaluateFitness(individual).fitness), 0
        );

        if (totalFitness === 0) {
            return populationArray[Math.floor(Math.random() * populationArray.length)];
        }

        let randomValue = Math.random() * totalFitness;
        for (let individual of populationArray) {
            randomValue -= Math.max(0, this.evaluateFitness(individual).fitness);
            if (randomValue <= 0) return individual;
        }

        return populationArray[0];
    }

    // Lai ghép hai cá thể cha mẹ để tạo ra cá thể con
    crossover(parent1, parent2) {
        return {
            angle: ((parent1.angle + (Math.random() - 0.5) * (parent2.angle - parent1.angle)) + 180) % 360 - 180,
            power: Math.max(0, Math.min(200, parent1.power + (Math.random() - 0.5) * (parent2.power - parent1.power)))
        };
    }
    mutate(shot) {
        if (Math.random() < this.mutationRate) {
            const angleRange = Math.random() < 0.1 ? 90 : 10;
            const powerRange = Math.random() < 0.1 ? 100 : 20;
    
            shot.angle += (Math.random() - 0.5) * angleRange;
            shot.angle = ((shot.angle + 180) % 360) - 180; // Giới hạn angle trong khoảng [-180, 180]
    
            shot.power += (Math.random() - 0.5) * powerRange;
            shot.power = Math.max(0, Math.min(200, shot.power)); // Giới hạn power trong khoảng [0, 200]
        }
        return shot;
    }

    // Chạy thuật toán di truyền
    run(generations) {
        this.initializePopulation();

        for (let gen = 0; gen < generations; gen++) {
             
           console.log(this.population );
           

            let newPopulation = [];
           

            let remainingSize = this.population.size;
            while (newPopulation.length < remainingSize) {
                let parent1 = this.selectParent();
                let parent2 = this.selectParent();
                let offspring = this.crossover(parent1, parent2);
                newPopulation.push(this.mutate(offspring));
            }

            this.population = new Set(newPopulation.map(individual => JSON.stringify(individual)));
        }

        let combinedPopulation = [
            ...Array.from(this.population).map(individual => JSON.parse(individual)),
            ...Array.from(this.bestPopulation).map(individual => JSON.parse(individual))
        ];

        combinedPopulation.sort((a, b) =>
            this.evaluateFitness(b).fitness - this.evaluateFitness(a).fitness
        );

        return combinedPopulation[0];
    }
}
class MonteCarloTreeSearch {
    constructor(iterations, simulation) {
        this.simulation = simulation;
        this.iterations = iterations;
    }

    findBestShot(initialPopulationLenght) {
        let bestShot = { angle: 0, power: 0, successRate: 0, distanceToHole: Infinity };
        let population = Array.from({ length: initialPopulationLenght}, () => ({
            angle: Math.random() * 360-180,
            power: Math.random() * 200
        }));

        for (let i = 0; i < this.iterations; i++) {
            let shot = population[i % population.length];
            let { successRate, averageDistance } = this.simulateShot(shot.angle, shot.power);

            if (successRate > bestShot.successRate || (successRate === bestShot.successRate && averageDistance < bestShot.distanceToHole)) {
                bestShot = { ...shot, successRate, distanceToHole: averageDistance };
            }
        }

        return bestShot;
    }

    simulateShot(angle, power, simulations = 3) { // Tăng số lần mô phỏng
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
        let bestGeneticShot = this.geneticAlgorithm.run(10); // Giảm số thế hệ

        // Tìm cú đánh tốt nhất từ MCTS
        let bestMCTSShot = this.mcts.findBestShot(50);

        console.log("Thời gian tìm kiếm:", Date.now() - cur, "ms");

        // So sánh và chọn cú đánh tốt nhất
        if (bestMCTSShot.successRate > 0.6) {
            console.log("Chọn cú đánh từ MCTS:", bestMCTSShot);
        } else {
            console.log("Chọn cú đánh từ GA:", bestGeneticShot);
        }
        return bestMCTSShot.successRate > 0.6 ? bestMCTSShot : bestGeneticShot;
    }
}