// 1. Dữ liệu người dùng duy nhất
const users = [
    { "username": "student", "password": "1234" },
    { "username": "ielts", "password": "anhjimydeptrai" },
    { "username": "ielts", "password": "" },
    { "username": "jimy", "password": "1234" }
];

// 2. Hàm Đăng nhập
function login() {
    let userInp = document.getElementById("username").value;
    let passInp = document.getElementById("password").value;

    let foundUser = users.find(u => u.username === userInp && u.password === passInp);

    if (foundUser) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", foundUser.username);

        updateUI(); 
        hideLoginModal();
    } else {
        document.getElementById("msg").innerText = "Sai tên đăng nhập hoặc mật khẩu!";
    }
}

// 3. Hàm Đăng xuất
function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    
    // Ẩn thanh chào và hiện lại modal
    const userHeader = document.getElementById("user-header");
    if (userHeader) userHeader.style.display = "none";
    showLoginModal();
}

// 4. Cập nhật Giao diện (Lời chào)
function updateUI() {
    const user = localStorage.getItem("user");
    const userHeader = document.getElementById("user-header");
    const greeting = document.getElementById("user-greeting");

    if (user && userHeader && greeting) {
        greeting.innerText = `Xin chào bạn-người siêng năng và chăm chỉ nhất hành tinh!`;
        userHeader.style.display = "flex";
    }
}

// 5. Hiển thị/Ẩn Modal
function showLoginModal() {
    const overlay = document.getElementById("login-overlay");
    if (overlay) {
        overlay.style.display = "flex";
        overlay.style.opacity = "1";
    }
}

function hideLoginModal() {
    const overlay = document.getElementById("login-overlay");
    if (overlay) {
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.style.display = "none";
        }, 500);
    }
}

// 6. Hợp nhất kiểm tra khi Load trang (CHỈ DÙNG 1 ĐOẠN NÀY)
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (isLoggedIn === "true") {
        updateUI();
        hideLoginModal();
    } else {
        showLoginModal();
    }

    // Cập nhật năm ở footer
    const yearEl = document.getElementById('current-year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    // Chạy khủng long
    controlDinoFacing();
});

// 7. Logic Khủng long (Giữ nguyên của bạn)
function controlDinoFacing() {
    const dinoWalker = document.querySelector('.dino-walker');
    const dinoImg = document.getElementById('dino-img');
    if (!dinoWalker || !dinoImg) return;

    let isFlipped = false;
    setInterval(() => {
        const computedStyle = window.getComputedStyle(dinoWalker);
        const currentLeft = parseFloat(computedStyle.left);
        const windowWidth = window.innerWidth;
        
        if (currentLeft > (windowWidth * 0.75) && !isFlipped) {
            dinoImg.style.transform = 'scaleX(-1)';
            isFlipped = true;
        } else if (currentLeft < (windowWidth * 0.15) && isFlipped) {
            dinoImg.style.transform = 'scaleX(1)';
            isFlipped = false;
        }
    }, 100);
}

// 8. Chuyển Tab (Giữ nguyên của bạn)
function openTab(evt, tabName) {
    const parent = evt.currentTarget.closest('.dropdown-inner');
    const tabcontent = parent.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    const tablinks = parent.getElementsByClassName("tab-link");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// 9. Chặn phím tắt F12 (Tùy chọn)
document.onkeydown = function(e) {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) || (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0))) {
        return false;
    }
};