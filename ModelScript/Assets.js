class Assets {
    constructor() {
        this.images = {}; 
        this.sounds = {}; 

        this.imagePaths = {
            ball_White: "../../Assets/Image/ball_White.png",
            ball_Red: "../../Assets/Image/ball_Red.png",
            ball_Yellow: "../../Assets/Image/ball_Yellow.png",
            board: "../../Assets/Image/background_Game.png",
            stick: "../../Assets/Image/stick.png"
        };

        this.soundPaths = {
            strike: "../../Assets/Sounds/Strike.wav",
            side: "../../Assets/Sounds/Side.wav",
            hole: "../../Assets/Sounds/Hole.wav",
            ballCollide: "../../Assets/Sounds/BallsCollide.wav",
        };
    }
    playSound(key) {
        if (this.sounds[key]) {
            this.sounds[key].currentTime = 0;
            this.sounds[key].play().catch(error => {
                console.error(`Error playing sound ${key}:`, error);
            });
        } else {
            console.warn(`Sound ${key} not found.`);
        }
    }
    loadImage(key, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = path;
            img.onload = () => {
                this.images[key] = img;
                resolve(img);
            };
            img.onerror = reject;
        });
    }

    loadSound(key, path) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(path);
            audio.oncanplaythrough = () => {
                this.sounds[key] = audio;
                resolve(audio);
            };
            audio.onerror = reject;
        });
    }

    preLoad() {
        const imagePromises = Object.entries(this.imagePaths).map(([key, path]) => this.loadImage(key, path));
        const soundPromises = Object.entries(this.soundPaths).map(([key, path]) => this.loadSound(key, path));
        
        return Promise.all([...imagePromises, ...soundPromises]);
    }
}
