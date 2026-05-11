let countdown;
let allTestData = {}; 
let userAnswers = { task1: "", task2: "" }; 
let currentTask = 1;
let currentFontSize = 16; 

// Chuyển các khai báo này vào trong hàm để đảm bảo DOM đã load xong
let textArea;
let wordCountDisplay;

document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo phần tử sau khi DOM load
    textArea = document.getElementById('writing-area');
    wordCountDisplay = document.getElementById('word-count');
    
    // 1. Lấy tham số 'id' từ URL[cite: 1]
    const urlParams = new URLSearchParams(window.location.search);
    const testId = urlParams.get('id'); 

    initWordCounter();
    startTimer(3600); 

    // 2. Kiểm tra nếu có ID trên URL thì load, nếu không thì dùng mặc định 'writing_data'[cite: 1]
    if (testId) {
        loadTestData(testId);
    } else {
        loadTestData('writing_data'); 
    }
});

// Hàm loadTestData giữ nguyên logic cũ nhưng sẽ nhận testId linh hoạt
async function loadTestData(fileId) {
    try {
        const response = await fetch(`data/${fileId}.json`);
        if (!response.ok) throw new Error("Không tìm thấy file JSON");
        
        allTestData = await response.json();
        renderTask(1); 
    } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        document.getElementById('task-content').innerHTML = `Lỗi: Không thể tải dữ liệu cho ID "${fileId}".`;
    }
}

function switchTask(n) {
    if (textArea) userAnswers[`task${currentTask}`] = textArea.value;

    currentTask = n;
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`btn-task${n}`);
    if (btn) btn.classList.add('active');

    if (textArea) {
        textArea.value = userAnswers[`task${n}`] || "";
        // Áp dụng font size luôn cho ô nhập liệu khi chuyển task
        textArea.style.fontSize = currentFontSize + 'px';
    }
    
    updateWordCount();
    renderTask(n);
}

function renderTask(n) {
    const data = allTestData[`task${n}`];
    if (!data) return;

    document.querySelector('.part-label h1').innerText = `Part ${n}`;
    document.querySelector('.part-label p').innerText = `You should spend about ${data.suggestedTime} minutes on this task. Write at least ${data.minWords} words.`;

    const container = document.getElementById('task-content');
    container.innerHTML = `
        <div class="prompt-text">
            <p><strong>${data.instruction}</strong></p>
        </div>
        ${data.imagePath ? `
        <div class="prompt-image-container">
            <p class="image-title"><strong>${data.title}</strong></p>
            <img src="${data.imagePath}" class="prompt-image" style="max-width: 100%;">
        </div>` : ''}
    `;

    // Áp dụng cỡ chữ ngay sau khi đổ dữ liệu JSON vào
    container.style.fontSize = currentFontSize + 'px';
}

function changeFontSize(action) {
    if (action === 'increase') {
        currentFontSize += 2;
    } else if (action === 'decrease') {
        if (currentFontSize > 12) currentFontSize -= 2;
    } else if (action === 'reset') {
        currentFontSize = 16;
    }

    // Cách mới: Gán trực tiếp vào biến CSS toàn cục
    document.documentElement.style.setProperty('--test-font-size', currentFontSize + 'px');
}

function initWordCounter() {
    textArea?.addEventListener('input', updateWordCount);
}

function updateWordCount() {
    if (!textArea) return;
    const text = textArea.value.trim();
    const words = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
    wordCountDisplay.innerText = words;
}

function startTimer(seconds) {
    let timeLeft = seconds;
    const display = document.getElementById('timer');
    if (!display) return;
    
    countdown = setInterval(() => {
        timeLeft--;
        let min = Math.floor(timeLeft / 60);
        let sec = timeLeft % 60;
        display.innerText = `${min}:${sec < 10 ? '0' + sec : sec} minutes left`;
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            alert("Time is up! Your test will be submitted automatically.");
            finishTest(); // Tự động nộp khi hết giờ
        }
    }, 1000);
}function finishTest() {
    // 1. Lưu lại bài làm của task hiện tại trước khi nộp
    if (textArea) userAnswers[`task${currentTask}`] = textArea.value;

    // 2. Dừng đếm ngược
    clearInterval(countdown);

    // 3. Khóa ô nhập liệu không cho sửa nữa
    if (textArea) textArea.disabled = true;

    // 4. Hiển thị thông báo xác nhận tải bài làm
    const confirmDownload = confirm("Do you want to download your essay as a .txt file?");
    
    if (confirmDownload) {
        downloadWork();
    }
}

function downloadWork() {
    // Tạo nội dung file văn bản
    const content = `
IELTS WRITING TEST REPORT
--------------------------
PART 1:
${userAnswers.task1 || "No answer provided."}

--------------------------
PART 2:
${userAnswers.task2 || "No answer provided."}
    `;

    // Tạo blob và link giả để tải file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `IELTS_Writing_Jim_${new Date().toLocaleDateString()}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Dọn dẹp
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
// Hàm Reload: Khôi phục lại dữ liệu gần nhất trước khi người dùng lỡ tay xóa trong ô nhập liệu
function reloadData() {
    if (confirm("Do you want to reload your previous input for this task?")) {
        // Lấy lại dữ liệu từ bộ nhớ tạm (userAnswers) gán ngược vào ô nhập liệu
        textArea.value = userAnswers[`task${currentTask}`] || "";
        updateWordCount();
    }
}

// Hàm Reset: Xóa sạch toàn bộ bài làm của cả 2 Task để làm lại từ đầu
function resetTest() {
    if (confirm("Warning: This will delete ALL your answers for both tasks. Are you sure?")) {
        // Xóa dữ liệu trong bộ nhớ
        userAnswers = { task1: "", task2: "" };
        
        // Xóa dữ liệu hiển thị trên màn hình
        textArea.value = "";
        
        // Cập nhật lại số từ
        updateWordCount();
        
        // Đưa về Task 1
        switchTask(1);
        
        // Nếu timer đang chạy thì có thể reset lại timer nếu muốn (tùy Jim)
        // clearInterval(countdown);
        // startTimer(3600);
    }
}

// Cập nhật lại hàm switchTask để tự động "lưu nháp" liên tục
function switchTask(n) {
    // Lưu bài làm hiện tại vào bộ nhớ trước khi chuyển trang
    if (textArea) userAnswers[`task${currentTask}`] = textArea.value;

    currentTask = n;
    
    // UI Update nút Part 1/2
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`btn-task${n}`);
    if (btn) btn.classList.add('active');

    // Hiển thị bài làm của task mới (nếu có)
    if (textArea) {
        textArea.value = userAnswers[`task${n}`] || "";
        textArea.style.fontSize = currentFontSize + 'px';
    }
    
    updateWordCount();
    renderTask(n);
}