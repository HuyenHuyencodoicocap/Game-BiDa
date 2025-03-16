
class PoolGame {
    constructor() {
        this.gameWorld = new GameWorld();
        this.asset = new Asset();
        this.Canvas = new Canvas();
    }

    static getInstance() {
        if (!PoolGame.instance) {
            PoolGame.instance = new PoolGame();
        }
        return PoolGame.instance;
    }

    preload() {
        console.log("Chưa làm hàm reload tài game");
        // Thêm logic tải tài nguyên tại đây
    }

    init() {
        this.preload();
        this.gameWorld.init();
        console.log("Game initialized.");
    }
}

