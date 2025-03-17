class Board {
    constructor() {
        this.img=PoolGame.getInstance().assets.images["board"];
        
        this.HolePosition = []; // Mảng vị trí lỗ (Vector2D[])
        this.HoleRadius = 55; // Bán kính lỗ (const float)
        this.width = this.img.width; // Chiều rộng (const float)
        this.height = this.img.height; // Chiều cao (const float)
        

        // Viền của bàn chơi
        this.topWall = 0;
        this.leftWall = 0;
        this.bottomWall = 0;
        this.rightWall = 0;

        //Không đucợ thay đổi thông số của bàn bắn
        Object.freeze(this);
    }

    draw() {

        PoolGame.getInstance().myCanvas.DrawImage(this.img,new Vector2D(0,0),0);
    }
}

