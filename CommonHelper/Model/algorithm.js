class GeneticAlgorithm {
  constructor(populationSize, mutationRate, simulation) {
    this.populationSize = populationSize;
    this.mutationRate = mutationRate;
    this.simulation = simulation;
    this.population = new Map(); // Sử dụng Set để đảm bảo tính duy nhất
    this.bestPopulation = new Map(); // Lưu các cú đánh tốt nhất
    this.potentialPopulation = new Map(); // Lưu các cú đánh tiềm năng
    this.cache = new Map(); // Cache các kết quả simulateShot để tránh tính toán lại
  }

  // Khởi tạo quần thể ban đầu
  initializePopulation() {
    while (this.population.size <= this.populationSize) {
      const individual = {
        angle: Math.random() * 360 - 180, // Góc từ -180 đến 180
        power: Math.random() * 200, // Lực từ 0 đến 200
        fitness: -Infinity,
      };

      // Thêm cá thể vào Set dưới dạng chuỗi JSON để đảm bảo tính duy nhất
      const key = this.hash(individual.angle, individual.power);
      if (!this.population.has(key)) {
        this.population.set(key, individual); // Thêm cá thể vào Map
      }
    }
  }
  hash(angle, power) {
    return `${angle.toFixed(2)}-${power.toFixed(2)}`;
  }
  // Đánh giá độ phù hợp (fitness) của một cú đánh
  evaluateFitness(keyPopulation) {
    let { angle, power } = this.population.get(keyPopulation);
    const key = this.hash(angle, power);
    if (this.cache.get(keyPopulation)) return this.cache.get(keyPopulation); // Trả về kết quả đã tính toán trước đó

    let result = simulateShot(
      angle,
      power,
      this.simulation.whiteBall,
      this.simulation.balls,
      this.simulation.holes
    );
    let fitness = 0;

    if (result.success) {
      // Trường hợp thành công, ưu tiên bi vàng vào lỗ
      fitness = 3000 + result.countBallToHole.countYellowBallHole * 500 + 500;
    } else {
      let penalty = result.countBallToHole.whiteBallInHole ? 900 : 0; // Tăng phạt cho bóng trắng vào lỗ

      fitness =
        -result.distanceToHole * 2 -
        penalty -
        result.countBallToHole.countRedBallHole * 100 +
        result.countBallToHole.countYellowBallHole * 500;
    }

    if (fitness > 0 && fitness < 4000) {
      if (!this.potentialPopulation.has(key)) {
        this.potentialPopulation.set(keyPopulation, { angle, power, fitness });
        this.population.delete(keyPopulation); // Xóa cá thể khỏi quần thể chính
      }
    }
    if (fitness >= 4000) {
      if (!this.bestPopulation.has(key)) {
        this.bestPopulation.set(keyPopulation, { angle, power, fitness });
        this.population.delete(keyPopulation); // Xóa cá thể khỏi quần thể chính
      }
    }
    this.population.set(keyPopulation, {
      angle,
      power,
      fitness: fitness,
    });
    this.cache.set(keyPopulation, { angle, power, fitness }); // Lưu kết quả vào cache
    // Lưu kết quả vào cache để tránh tính toán lại
    return this.cache.get(keyPopulation); // Trả về fitness
  }

  // Chọn cha mẹ từ quần thể
  selectParent() {
    // Chuyển đổi các giá trị trong Map thành mảng
    let populationArray = Array.from(this.population.values());

    // Tính tổng fitness của tất cả các cá thể
    let totalFitness = populationArray.reduce((sum, individual) => {
      let fitness =
        individual.fitness === -Infinity
          ? this.evaluateFitness(this.hash(individual.angle, individual.power))
              .fitness
          : individual.fitness;
      return sum + Math.max(0, fitness);
    }, 0);

    // Nếu tổng fitness bằng 0, chọn ngẫu nhiên một cá thể
    if (totalFitness === 0) {
      return populationArray[
        Math.floor(Math.random() * populationArray.length)
      ];
    }

    // Chọn cá thể dựa trên xác suất tỉ lệ với fitness
    let randomValue = Math.random() * totalFitness;
    for (let individual of populationArray) {
      randomValue -= Math.max(0, individual.fitness);
      if (randomValue <= 0) return individual;
    }

    // Trả về cá thể đầu tiên nếu không tìm được (trường hợp hiếm)
    return populationArray[0];
  }

  // Lai ghép hai cá thể cha mẹ để tạo ra cá thể con
  crossover(parent1, parent2) {
    return {
      angle:
        ((parent1.angle +
          (Math.random() - 0.5) * (parent2.angle - parent1.angle) +
          180) %
          360) -
        180,
      power: Math.max(
        0,
        Math.min(
          200,
          parent1.power +
            (Math.random() - 0.5) * (parent2.power - parent1.power)
        )
      ),
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
      let newPopulation = new Map();

      let remainingSize = this.population.size;
      while (newPopulation.size < remainingSize) {
        let parent1 = this.selectParent();
        let parent2 = this.selectParent();
        let offspring = this.mutate(this.crossover(parent1, parent2));

        const key = this.hash(offspring.angle, offspring.power);
        if (!newPopulation.has(key)) {
          newPopulation.set(key, { ...offspring, fitness: -Infinity }); // Thêm cá thể con vào quần thể mới
        }
      }

      this.population = newPopulation; // Cập nhật quần thể mới
    }
    this.population.forEach((individual, key) => {
      if (individual.fitness === -Infinity) {
        this.evaluateFitness(key); // Tính toán và cập nhật fitness
      }
    });
    this.population = new Map([
      ...this.population,
      ...this.potentialPopulation,
      ...this.bestPopulation,
    ]);

    let sortedPopulation = Array.from(this.population.values()).sort(
      (a, b) => b.fitness - a.fitness
    );

    return sortedPopulation[0];
  }
}
class MonteCarloTreeSearch {
  constructor(iterations, simulation) {
    this.simulation = simulation;
    this.iterations = iterations;
  }

  findBestShot(initialPopulation) {
    let bestShot = {
      angle: 0,
      power: 0,
      successRate: 0,
      distanceToHole: Infinity,
    };
    let populationArray = Array.from(initialPopulation.values());

    for (let i = 0; i < this.iterations; i++) {
      let shot = populationArray[i % populationArray.length];
      let { successRate, averageDistance } = this.simulateShot(
        shot.angle,
        shot.power
      );

      if (
        successRate > bestShot.successRate ||
        (successRate === bestShot.successRate &&
          averageDistance < bestShot.distanceToHole)
      ) {
        bestShot = { ...shot, successRate, distanceToHole: averageDistance };
      }
    }

    return bestShot;
  }

  simulateShot(angle, power, simulations = 3) {
    // Tăng số lần mô phỏng
    let success = 0;
    let totalDistance = 0;

    for (let i = 0; i < simulations; i++) {
      let result = simulateShot(
        angle,
        power,
        this.simulation.whiteBall,
        this.simulation.balls,
        this.simulation.holes
      );
      if (result.success && result.countBallToHole.countYellowBallHole > 0)
        success++; // Ưu tiên bi vàng
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
    let bestMCTSShot = this.mcts.findBestShot(this.geneticAlgorithm.population);

    console.log("Thời gian tìm kiếm:", Date.now() - cur, "ms");

    // So sánh và chọn cú đánh tốt nhất
    if (bestMCTSShot.successRate > 0.6) {
      console.log("Chọn cú đánh từ MCTS:", bestMCTSShot);
    } else {
      console.log("Chọn cú đánh từ GA:", bestGeneticShot);
    }
    return bestMCTSShot.successRate === 1 ? bestMCTSShot : bestGeneticShot;
  }
}
