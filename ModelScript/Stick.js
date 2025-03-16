class Stick {
    constructor(angle, power) {
        Object.defineProperty(this, "length", {
            value: 100, // Giá trị cố định 100px
            writable: false // Ngăn thay đổi chiều dài
        });

        this.angle = angle; // Hướng gậy
        this.power = power; // Lực gậy
    }

    getPositionDraw() {
        // Code lấy vị trí vẽ gậy dựa trên vị trí bi trắng
    }

    draw() {
        // Code vẽ gậy lên màn hình
    }

    setPower(power) {
        this.power = power;
    }

    setAngle(angle) {
        this.angle = angle;
    }

    shoot() {
        // Hàm bắn bóng
    }
}
