class PoolGame {
    constructor() {
        PoolGame.instance=this;
        this.assets = new Assets();
        this.myCanvas = new MyCanvas();
    }
    
    static getInstance() {
        return PoolGame.instance;
    }
    
    
    init() {
        this.assets.preLoad().then(()=>{
            this.gameWorld = new GameWorld();
            window.addEventListener("keydown", (event)=>this.gameWorld.handleInput(event));
            console.log("Game initialized.");
            requestAnimationFrame(() => this.gameWorld.gameLoop());
        });
    }
}

