

    let music = document.getElementById("background-music");
    let soundIcon = document.getElementById("sound-icon");

    function toggleSound() {
        if (music.paused) {
            music.play();
            soundIcon.src = "../../Assets/Image/mute_button_hover.png"; // Icon bật âm thanh
        } else {
            music.pause();
            soundIcon.src = "../../Assets/Image/mute_button_pressed_hover.png"; // Icon tắt âm thanh
        }
    }

    function startGame(mode) {
        // Hiển thị ảnh quy tắc
        document.getElementById("control-container").style.display = "block";
    
        // Đợi 5 giây trước khi chuyển đến game.html
        setTimeout(function () {
            if (mode === 'pvp') {
                window.location.href = '../Game/index.html?mode=pvp';
            } else {
                window.location.href = '../Game/index.html?mode=bot';
            }
        }, 50000);
        
    }
    
    

    

