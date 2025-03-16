class Assets {
    constructor() {
        this.images = {}; 
        this.sounds = {}; 

        this.imagePaths = {
            ball: "Assets/Image/ball.png",
            board: "Assets/Image/board.png",
            // Thêm nốt các ảnh
        };

        this.soundPaths = {
            hit: "Assets/Sound/hit.mp3",
            background: "Assets/Sound/bg-music.mp3"
            // thêm nốt âm thanh
        };
    }

    loadImage(key, path) {
        // Load hình ảnh
    }

    loadSound(key, path) {
        //Load âm thanh
    }

    preLoad() {
        //Load toàn bộ tài nguyên
    }

}


