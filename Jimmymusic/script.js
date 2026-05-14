const $ = document.querySelector.bind(document);

// 1. Danh sách bài hát (Playlist)
const playlist = [
    { title: 'Sợ Yêu', artist: 'Jimmy', src: 'music/Soyeu.mp3', img: 'images/1.JPG' },
    { title: 'Bước Qua Mùa Cô Đơn', artist: 'Jimmy', src: 'music/buocquamuacodon.mp3', img: 'images/2.JPG' }, 
    { title: 'Một Ngàn Nỗi Đau', artist: 'Jimmy', src: 'music/motngannoidau.mp3', img: 'images/3.JPG' },
    { title: 'Sau Lời Từ Khước', artist: 'Jimmy', src: 'music/sauloitukhuoc.mp3', img: 'images/4.JPG' },
    { title: 'Ai Khóc Nỗi Đau Này', artist: 'Jimmy', src: 'music/aikhocnoidaunay.mp3', img: 'images/5.JPG' },
  { title: 'Cô Gái Và Cây Dương Cầm', artist: 'Jimmy', src: 'music/cogaivacayduongcam.mp3', img: 'images/6.JPG' },
    { title: 'Nửa Thập Kỷ', artist: 'Jimmy', src: 'music/nuathapky.mp3', img: 'images/7.JPG' }, 
       { title: 'Your name engraved herein', artist: 'Jimmy', src: 'music/yournameengravedherein.mp3', img: 'images/22.JPG' },
    { title: 'Hoang Mang', artist: 'Jimmy', src: 'music/hoangmang.mp3', img: 'images/9.JPG' },
     { title: 'Chờ Thêm Một Đời', artist: 'Jimmy', src: 'music/chothemmotdoi.mp3', img: 'images/10.png' },
    { title: 'Thàng 4 Là Lời Nói Dối Của Em', artist: 'Jimmy', src: 'music/thang4.mp3', img: 'images/11.JPG' }, 
    { title: 'Thương EM Là Điều Anh Không Thể Ngờ', artist: 'Jimmy', src: 'music/thuongemladieuanhkhongthengo.mp3', img: 'images/12.JPG' },
    { title: 'CÓ Khi Nào Rời Xa', artist: 'Jimmy', src: 'music/cokhinaoroixa.mp3', img: 'images/13.JPG' },
     { title: 'IF', artist: 'Jimmy', src: 'music/if.mp3', img: 'images/14.JPG' },
    { title: 'Ngày Mai Người Ta Lấy Chồng', artist: 'Jimmy', src: 'music/ngaumainguoitalaychong.mp3', img: 'images/15.JPG' }, 
    { title: 'Fly Me To The Moon', artist: 'Jimmy', src: 'music/flymetothemoon.mp3', img: 'images/16.JPG' },
    { title: 'Say Something', artist: 'Jimmy', src: 'music/saysomething.mp3', img: 'images/17.JPG' },
     { title: 'Tự Khúc Mùa Đông', artist: 'Jimmy', src: 'music/tukhucmuadong.mp3', img: 'images/18.JPG' },
    { title: 'Từng Yêu', artist: 'Jimmy', src: 'music/tungyeu.mp3', img: 'images/19.JPG' }, 
    { title: 'All Of Me', artist: 'Jimmy', src: 'music/allofme.mp3', img: 'images/20.JPG' },
    { title: 'Anh ơi Ở Lại', artist: 'Jimmy', src: 'music/anhoiolai.mp3', img: 'images/21.JPG' }

];

const player = {
    currentIndex: 0,
    isPlaying: false,
    isLoop: false,
    
    // Khai báo các Elements từ DOM
    audio: $('#main-audio'),
    playBtn: $('.controls .fa-play'),
    nextBtn: $('.fa-forward-step'),
    prevBtn: $('.fa-backward-step'),
    replayBtn: $('#replay-btn'),
    progress: $('.progress'),
    progressBar: $('.progress-bar'),
    trackName: $('.track-name'),
    artistName: $('.artist-name'),

    // Định nghĩa thuộc tính currentSong
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return playlist[this.currentIndex];
            }
        });
    },

    // Tải thông tin bài hát hiện tại lên UI
    loadCurrentSong: function() {
        this.trackName.innerText = this.currentSong.title;
        this.artistName.innerText = this.currentSong.artist;
        this.audio.src = this.currentSong.src;
    },

    // Lắng nghe và xử lý các sự kiện
    handleEvents: function() {
        const _this = this;

        // Xử lý khi nhấn Play/Pause
        this.playBtn.onclick = function() {
            if (_this.isPlaying) {
                _this.audio.pause();
            } else {
                _this.audio.play();
            }
        };

        // Khi nhạc đang phát
        this.audio.onplay = function() {
            _this.isPlaying = true;
            _this.playBtn.classList.replace('fa-play', 'fa-pause');
        };

        // Khi nhạc tạm dừng
        this.audio.onpause = function() {
            _this.isPlaying = false;
            _this.playBtn.classList.replace('fa-pause', 'fa-play');
        };

        // Cập nhật thanh tiến trình theo thời gian nhạc chạy
        this.audio.ontimeupdate = function() {
            if (_this.audio.duration) {
                const progressPercent = (_this.audio.currentTime / _this.audio.duration) * 100;
                _this.progress.style.width = progressPercent + '%';
            }
        };

        // Xử lý tua nhạc khi click vào thanh progress
        this.progressBar.onclick = function(e) {
            const width = this.clientWidth;
            const clickX = e.offsetX;
            const duration = _this.audio.duration;
            if (duration) {
                _this.audio.currentTime = (clickX / width) * duration;
            }
        };

        // Chuyển bài kế tiếp
        this.nextBtn.onclick = function() {
            _this.nextSong();
            _this.audio.play();
        };

        // Quay lại bài trước
        this.prevBtn.onclick = function() {
            _this.prevSong();
            _this.audio.play();
        };

        // Bật/Tắt chế độ lặp lại (Loop)
        this.replayBtn.onclick = function() {
            _this.isLoop = !_this.isLoop;
            _this.audio.loop = _this.isLoop;
            this.style.color = _this.isLoop ? '#c5a059' : 'white'; // Sử dụng mã màu vàng kim
        };

        // Tự động chuyển bài khi kết thúc bài hát
        this.audio.onended = function() {
            if (!_this.isLoop) {
                _this.nextBtn.click();
            }
        };
    },

    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= playlist.length) this.currentIndex = 0;
        this.loadCurrentSong();
    },

    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) this.currentIndex = playlist.length - 1;
        this.loadCurrentSong();
    },

    // Hàm phát nhạc theo chỉ mục (index) khi người dùng click vào card bài hát
    playByIndex: function(index) {
        this.currentIndex = index;
        this.loadCurrentSong();
        this.audio.play();
    },

    // Khởi động trình phát nhạc
    start: function() {
        this.defineProperties();
        this.handleEvents();
        this.loadCurrentSong();
    }
};

// Kích hoạt Player
player.start();

// Gán hàm vào window để có thể gọi từ thuộc tính onclick trong HTML
window.playByIndex = (index) => player.playByIndex(index);