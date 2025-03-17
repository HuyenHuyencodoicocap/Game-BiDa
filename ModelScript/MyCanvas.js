class MyCanvas {
    constructor() {
        this.canvas = document.getElementById("myCanvas");
        // this.img = document.getElementById("imageCanvas"); // Lấy thẻ <img> từ HTML
        
        if (!this.canvas) {
            throw new Error("Canvas ID không tồn tại!");
        }
        
        this.context = this.canvas.getContext("2d");
       
        // Đặt kích thước canvas full màn hình
        this.resizeCanvas();

        // Lắng nghe sự kiện resize
        window.addEventListener("resize", () => this.resizeCanvas());
    }
    getScale(){
        try{
            return Math.min(
                this.canvas.width*1.0/PoolGame.getInstance().gameWorld.width,
                this.canvas.height*1.0/PoolGame.getInstance().gameWorld.height
            );
        }catch (e){
            return 1;
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    DrawImage(image, position, angle) {
        if (!image.complete) {
            console.warn("Hình ảnh chưa được load hoàn toàn.");
            return;
        }
        
        const { x, y } = position*this.getScale();

        const imageWidth = image.width;
        const imageHeight = image.height;
        const newWidth = imageWidth * this.getScale();
        const newHeight = imageHeight * this.getScale();
        const radians = (angle * Math.PI) / 180; 
        
        
        this.context.save(); 
        this.context.translate(x, y); // Di chuyển đến vị trí vẽ
        this.context.rotate(radians); // Xoay ảnh
        
        this.context.drawImage(image, 0, 0,newWidth,newHeight); // Vẽ ảnh với tâm tại vị trí 0,0, kích thước tùy chỉnh
        
        this.context.restore(); // Khôi phục trạng thái ban đầu
    }

    ClearFrame() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
