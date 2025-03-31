// import simulateShot from "../Helper/simulateShotHelper";
// import { BallColor } from "../../ModelScript/Ball";
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
        let anglePenalty = Math.abs(shot.angle - 90) / 10;
        let controlBonus = result.success ? 500 : 0;
        return result.success ? 1000 - result.distanceToHole * 10 - anglePenalty + controlBonus : -result.distanceToHole * 5 - anglePenalty;
    }

    selectParent() {
        let weighted = this.population
            .map(shot => ({ shot, fitness: this.evaluateFitness(shot) }))
            .sort((a, b) => b.fitness - a.fitness);

        return weighted[0].shot;
    }

    crossover(parent1, parent2) {
        return {
            angle: (parent1.angle + parent2.angle) / 2,
            power: (parent1.power + parent2.power) / 2
        };
    }

    mutate(shot) {
        if (Math.random() < this.mutationRate) {
            shot.angle += (Math.random() - 0.5) * 5;
            shot.power += (Math.random() - 0.5) * 10;
        }
        return shot;
    }

    run(generations) {
        this.initializePopulation();
        for (let gen = 0; gen < generations; gen++) {
            let newPopulation = this.population.map(() => {
                let parent1 = this.selectParent();
                let parent2 = this.selectParent();
                let offspring = this.crossover(parent1, parent2);
                return this.mutate(offspring);
            });

            this.population = newPopulation;
        }

        return this.selectParent();
    }
}

// ------------------- Monte Carlo Tree Search -------------------
class MonteCarloTreeSearch {
    constructor(iterations, simulation) {
        this.simulation = simulation;
        this.iterations = iterations;
    }

    findBestShot(initialPopulation) {
        let bestShot = { angle: 0, power: 0, successRate: 0 };

        for (let i = 0; i < this.iterations; i++) {
            let shot = initialPopulation[i % initialPopulation.length];
            let successRate = this.simulateShot(shot.angle, shot.power);

            if (successRate > bestShot.successRate) {
                bestShot = { ...shot, successRate };
            }
        }

        return bestShot;
    }

    simulateShot(angle, power) {
        let success = 0;
        for (let i = 0; i < 5; i++) {
            if (simulateShot(angle, power, this.simulation.whiteBall, this.simulation.balls, this.simulation.holes).success) success++;
        }
        return success / 5;
    }
}

// ------------------- AI Trainer -------------------
class AITrainer {
    constructor(state) {
        this.state = state;
        this.geneticAlgorithm = new GeneticAlgorithm(30, 0.15, state);
        this.mcts = new MonteCarloTreeSearch(100, state);
    }

    train() {
        let bestGeneticShot = this.geneticAlgorithm.run(10);
        let bestMCTSShot = this.mcts.findBestShot(this.geneticAlgorithm.population);
        if (bestMCTSShot.successRate > 0.6) {
            return bestMCTSShot;
        }

        return this.findDefensiveShot();
    }

    findDefensiveShot() {
        let bestDefensiveShot = { angle: 0, power: 500, distanceToHole: 0 };

        for (let shot of this.geneticAlgorithm.population) {
            let result = simulateShot(shot.angle, shot.power, this.state.whiteBall, this.state.balls, this.state.holes);
            let opponentBall = this.state.balls.find(b => b.color === BallColor.RED);
            let distanceToOpponent = opponentBall ? this.calculateDistance(result.whiteBallPosition, opponentBall.position) : 0;

            if (!result.success && (result.distanceToHole > bestDefensiveShot.distanceToHole || distanceToOpponent < 50)) {
                bestDefensiveShot = { ...shot, distanceToHole: result.distanceToHole };
            }
        }
        return bestDefensiveShot;
    }

    calculateDistance(pos1, pos2) {
        return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
    }
}

AITrainer;

