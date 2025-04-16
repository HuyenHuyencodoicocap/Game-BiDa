class Board {
    constructor() {
        this.img=PoolGame.getInstance().assets.images["board"];
        
        this.HolePosition = [
            new Vector2D(73,73),    //trên trái
            new Vector2D(1427,73),  //trên phải
            new Vector2D(73,753),   //dưới trái
            new Vector2D(1427,753), //dưới phải
            new Vector2D(750,52),   //trên giữa
            new Vector2D(750,772),  //dưới giữa

        ]; // Mảng vị trí lỗ (Vector2D[])
        this.HoleRadius = 70; // Bán kính lỗ (const float)
        this.width = this.img.width; // Chiều rộng (const float)
        this.height = this.img.height; // Chiều cao (const float)
        

        // Viền của bàn chơi
        this.topWall = 60;
        this.leftWall = 60;
        this.bottomWall = 60;
        this.rightWall = 60;

        //Không đucợ thay đổi thông số của bàn bắn
        Object.freeze(this);
    }

    draw() {

        PoolGame.getInstance().myCanvas.DrawImage(this.img,new Vector2D(0,0),0);
    }
}

