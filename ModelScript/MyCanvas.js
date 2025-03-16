class MyCanvas {
    constructor(canvasId) {
        // Lấy phần tử canvas từ id trong HTML
        this.canvas = document.getElementById(canvasId);
        
        if (!this.canvas) {
            throw new Error("Canvas ID không tồn tại!");
        }

        // Lấy context để vẽ
        this.context = this.canvas.getContext("2d");
    }


    DrawImage(image, position, angle) {
        // Hàm vẽ ảnh
    }

    
    ClearFrame() {
        // xóa toàn bộ frame để vẽ frame mới
    }
}
