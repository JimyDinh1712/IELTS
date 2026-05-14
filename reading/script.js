/**
 * script.js - Master Engine V4.5 (Updated MCQ Full Logic)
 * Designed by JIM - Tối ưu hiển thị MCQ & Sửa lỗi click đáp án
 */

let allPassages = [];
let allCorrectAnswers = {};
let userAnswers = {}; 
let currentIdx = 0;
let currentFontSize = 16;

document.addEventListener('DOMContentLoaded', () => {
    initDynamicLoad();
    startTimer();
});
// chặn F12
document.onkeydown = function(e) {
    if (e.keyCode == 123 || 
        (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) || 
        (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0))) {
        return false;
    }
};
async function initDynamicLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    const testId = urlParams.get('testId');

    if (!testId) {
        alert("No test ID found!");
        return;
    }

    try {
        const response = await fetch(`data/${testId}.json`);
        const data = await response.json();

        allPassages = data.passages;
        allCorrectAnswers = data.answers;

        renderFooter(); 
        loadPassage(0); 
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu bài thi:", error);
        alert("Could not load test data.");
    }
}

function loadPassage(index) {
    currentIdx = index;
    const data = allPassages[index];
    if (!data) return;

    const titleContainer = document.getElementById('passage-title');
    const textContainer = document.getElementById('passage-text');
    const labelContainer = document.getElementById('current-part-label');

    if (titleContainer) titleContainer.innerHTML = `<h2 class="reading-title">${data.title}</h2>`;
    if (textContainer) textContainer.innerHTML = data.content;
    if (labelContainer) labelContainer.innerText = `Part ${index + 1}`;
    
    renderQuestions(data.questions);
    window.scrollTo(0,0);
    updateNavigation();
}

function renderQuestions(groups) {
    const container = document.getElementById('questions-container');
    if (!container) return;
    container.innerHTML = "";

    groups.forEach(group => {
        // Render Instruction Box chung
        if (group.instruction) {
            const insBox = document.createElement('div');
            insBox.className = "instruction-box";
            insBox.innerHTML = `<h3>Questions ${group.from}-${group.to}</h3><div class="ins-text" style="margin-top:10px;">${group.instruction}</div>`;
            container.appendChild(insBox);
        }

        // --- PHÂN LOẠI NHÓM CÂU HỎI ---

      
        // 1. Dạng MCQ ABCD (Click nguyên dòng)
// 1. Dạng MCQ ABCD (Đọc trực tiếp từ mảng questions)
if (group.type === 'mcqABCD') {
    const mcqContainer = document.createElement('div');
    mcqContainer.className = "mcq-full-wrapper";
    
    let mcqHtml = "";

    // Duyệt qua mảng questions thay vì dùng Regex tách content
    group.questions.forEach(qObj => {
        const qNum = qObj.id;
        const questionText = qObj.text;
        const activeVal = userAnswers[qNum]; // Lấy đáp án đã chọn

        mcqHtml += `
            <div class="question-item" style="margin-bottom: 30px;">
                <div class="q-title" style="margin-bottom: 15px; font-size: 16px;">
                    <strong>${qNum}. ${questionText}</strong>
                </div>
                <div class="choices-container" style="display: flex; flex-direction: column; gap: 10px;">
                    ${qObj.options.map(fullOptionText => {
                        // Tách chữ cái (A, B, C, D) khỏi nội dung
                        const letterMatch = fullOptionText.trim().match(/^([A-D])/i);
                        const letter = letterMatch ? letterMatch[1].toUpperCase() : "";
                        const isSelected = activeVal === letter;
                        
                        return `
                            <div class="mcq-option-row ${isSelected ? 'active' : ''}" 
                                 onclick="selectMCQ(${qNum}, '${letter}')"
                                 style="display: flex; align-items: center; gap: 12px; padding: 12px 15px; 
                                        border: 2px solid ${isSelected ? '#2b5a84' : '#e0e0e0'}; 
                                        border-radius: 8px; cursor: pointer; transition: all 0.2s ease;
                                        background: ${isSelected ? '#f0f7ff' : '#fff'};">
                                
                                <div class="radio-circle" style="width: 18px; height: 18px; border: 2px solid ${isSelected ? '#2b5a84' : '#999'}; 
                                     border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    ${isSelected ? '<div style="width: 10px; height: 10px; background: #2b5a84; border-radius: 50%;"></div>' : ''}
                                </div>

                                <div style="font-size: 15px; color: ${isSelected ? '#2b5a84' : '#444'}; font-weight: ${isSelected ? '600' : '500'};">
                                    ${fullOptionText}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>`;
    });

    mcqContainer.innerHTML = mcqHtml;
    container.appendChild(mcqContainer);
}

       // 2. RIÊNG BIỆT: Dạng WORDLIST (Bảng tra cứu + Dropdown trong đoạn văn)
else if (group.type === 'wordlist') {
    const wordlistDiv = document.createElement('div');
    wordlistDiv.className = "wordlist-wrapper";

    // A. Bảng tra cứu Options (Giữ nguyên giao diện hộp chứa)
    const listContainer = document.createElement('div');
    listContainer.className = "matching-features-box"; 
    listContainer.style = "margin-bottom: 20px; background: #fdfdfd; border: 1px solid #2b5a84; padding: 15px; border-radius: 8px;";
    
    let listHtml = `<div style="font-weight:bold; margin-bottom:10px; color:#2b5a84; border-bottom:1px solid #eee;">${group.wordlistName || 'List of Options'}</div>`;
    listHtml += `<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px 15px;">`;
    group.options.forEach(opt => {
        listHtml += `<div style="font-size: 14px; color: #444;">${opt}</div>`;
    });
    listHtml += `</div>`;
    listContainer.innerHTML = listHtml;
    container.appendChild(listContainer);

    // B. Xử lý logic chèn Dropdown tự động
    let body = group.content || "";
    
    // Tự động trích xuất ký tự đầu tiên từ options (A, B, C... hoặc i, ii, iii...)
    const autoLetters = group.options.map(opt => {
        // Regex lấy ký tự/số La Mã đầu tiên trước dấu cách hoặc dấu chấm
        const match = opt.trim().match(/^([A-Z0-9i]+)/i);
        return match ? match[1] : "";
    }).filter(l => l !== "");

    let finalHtml = "";
    
    // Nếu trong content KHÔNG có chứa các tag (n), ta xử lý theo từng dòng
    const hasTags = /\(\d+\)/.test(body);
    
    if (!hasTags) {
        // Tách content thành các dòng và tự chèn dropdown vào cuối mỗi dòng có nội dung
        const lines = body.split('<br>').filter(l => l.trim() !== "");
        lines.forEach((line, index) => {
            const qNum = group.from + index;
            if (qNum <= group.to) {
                const currentAns = userAnswers[qNum] || "";
                const selectHtml = generateDropdownHtml(qNum, autoLetters, currentAns);
                finalHtml += `<div style="margin-bottom:10px;">${line} ${selectHtml}</div>`;
            }
        });
    } else {
        // Nếu ĐÃ CÓ tag (n) trong content, thực hiện replace như cũ
        for (let i = group.from; i <= group.to; i++) {
            const regex = new RegExp(`\\(${i}\\)`, 'g');
            const currentAns = userAnswers[i] || "";
            const selectHtml = generateDropdownHtml(i, autoLetters, currentAns);
            body = body.replace(regex, selectHtml);
        }
        finalHtml = body;
    }

    const contentBox = document.createElement('div');
    contentBox.style = "line-height: 2.2; font-size: 16px; text-align: justify;";
    contentBox.innerHTML = finalHtml;
    container.appendChild(contentBox);
}

// 3. Dạng MATCHING (Cập nhật để đọc được cả mảng questions hoặc content)
else if (group.type === 'matching') {
    const matchingDiv = document.createElement('div');
    matchingDiv.className = "matching-replace-wrapper";
    
    const opts = group.options || ["A", "B", "C", "D", "E", "F", "G"];
    let html = "";

    // KIỂM TRA DỮ LIỆU: Ưu tiên đọc từ mảng questions (cấu trúc mới của anh)
    if (group.questions && Array.isArray(group.questions)) {
        group.questions.forEach((qObj) => {
            const qNum = qObj.id;
            const currentAns = userAnswers[qNum] || "";
            const cleanText = qObj.text || "";

            html += `
                <div class="matching-item" style="margin-bottom: 15px; line-height: 1.8; font-size: 15px;">
                    <strong>${qNum}</strong> ${cleanText} &nbsp;
                    <select class="q-select" 
                            style="padding: 3px 8px; border: 1px solid #2b5a84; border-radius: 4px; font-weight: bold; background: #fffde7; cursor: pointer;"
                            onchange="saveAns(${qNum}, this.value)">
                        <option value="">--</option>
                        ${opts.map(opt => `<option value="${opt}" ${currentAns === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>
                </div>`;
        });
    } 
    // DỰ PHÒNG: Nếu vẫn dùng content dạng text cũ
    else {
        const lines = (group.content || "").split('<br>').filter(l => l.trim() !== "");
        lines.forEach((lineText, index) => {
            const qNum = group.from + index;
            if (qNum > group.to) return;
            const currentAns = userAnswers[qNum] || "";
            const cleanText = lineText.replace(/^\d+[\s\.]*/, '').trim();

            html += `
                <div class="matching-item" style="margin-bottom: 15px; line-height: 1.8; font-size: 15px;">
                    <strong>${qNum}</strong> ${cleanText} &nbsp;
                    <select class="q-select" 
                            style="padding: 3px 8px; border: 1px solid #2b5a84; border-radius: 4px; font-weight: bold; background: #fffde7; cursor: pointer;"
                            onchange="saveAns(${qNum}, this.value)">
                        <option value="">--</option>
                        ${opts.map(opt => `<option value="${opt}" ${currentAns === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>
                </div>`;
        });
    }

    matchingDiv.innerHTML = html;
    container.appendChild(matchingDiv);
}
// 4. Dạng CHỌN ĐÁP ÁN THEO DÒNG tfng, ynng
else if (['tfng', 'ynng'].includes(group.type)) {
    let currentOpts = group.options || [];
    const lines = (group.content || "").split('<br>').filter(line => line.trim() !== "");
    
    lines.forEach((lineText, index) => {
        const qNum = group.from + index;
        if (qNum > group.to) return; // Bảo vệ nếu số dòng lệch với dải câu hỏi

        const activeVal = userAnswers[qNum];
        const qRow = document.createElement('div');
        qRow.style = "margin-bottom: 25px; display: block; width: 100%;"; 
        const cleanText = lineText.replace(/^\d+[\s\.]*/, '').trim();
        
        qRow.innerHTML = `
            <div class="question-block">
                <div class="q-text" style="margin-bottom: 10px; font-size: 15px; line-height: 1.5;">
                    <strong>${qNum}.</strong> ${cleanText}
                </div>
                <div class="options-container" style="display: flex; gap: 8px; flex-wrap: nowrap; align-items: center;">
                    ${currentOpts.map(opt => {
                        const activeClass = activeVal === opt ? 'active' : '';
                        const minWidth = opt.length > 1 ? "80px" : "35px";
                        return `<div class="option-box ${activeClass}" 
                                     style="cursor:pointer; border:1px solid #ddd; min-width:${minWidth}; height:32px; padding: 0 10px; display:flex; align-items:center; justify-content:center; border-radius:4px; font-size: 12px; font-weight: 600;"
                                     onclick="selectMCQ(${qNum}, '${opt}')">${opt}</div>`;
                    }).join('')}
                </div>
            </div>`;
        container.appendChild(qRow);
    });
}
        // 5. Dạng ĐIỀN TỪ (Gap Filling)
        else if (group.type === 'form') {
            const fillDiv = document.createElement('div');
            fillDiv.className = "question-group";
            // --- PHẦN XỬ LÝ HEADING MỚI ---
    let headingHtml = "";
    if (group.heading && group.heading.trim() !== "") {
        headingHtml = `
            <div class="form-heading" style="text-align: center; margin-bottom: 15px;">
                <strong style="text-transform: uppercase; font-size: 1.1em; color: #2b5a84;">
                    ${group.heading}
                </strong>
            </div>`;
    }
    // ------------------------------
            let body = group.content || "";
            for (let i = group.from; i <= group.to; i++) {
                const regex = new RegExp(`\\(${i}\\)_*`, 'g');
                const val = userAnswers[i] || "";
                body = body.replace(regex, `
                    <span class="fill-gap-wrapper">
                        <input type="text" class="q-input" value="${val}" oninput="saveAns(${i}, this.value)" ${isReviewing ? 'readonly' : ''}>
                        <strong>(<span class="q-num-inline">${i}</span>)</strong>
                    </span>`);
            }
            fillDiv.innerHTML =headingHtml + body;
            container.appendChild(fillDiv);
        }
       // 6. Dạng Pick 2-3 options from Questions (Pick from list)
else if (group.type === 'mcq-multiple') {
    const multiContainer = document.createElement('div');
    multiContainer.className = "mcq-multiple-wrapper";
    multiContainer.style = "margin-bottom: 30px; padding: 15px; border: 1px solid #eee; border-radius: 8px;";

    // Tách dòng và lọc bỏ các dòng trống
    const lines = (group.content || "").split('<br>').map(l => l.trim()).filter(l => l !== "");
    
    // Tiêu đề là dòng đầu tiên, các dòng sau là Options
    const questionHeading = lines[0] || "Select the correct options:";
    const optionLines = lines.slice(1);

    let html = `<div style="font-weight: bold; margin-bottom: 15px; color: #2b5a84;">${questionHeading}</div>`;
    html += `<div class="options-list" style="display: flex; flex-direction: column; gap: 10px;">`;
    
    optionLines.forEach((line) => {
        // Lấy chữ cái đầu (A, B, C...)
        const letterMatch = line.match(/^([A-Z])/i);
        const letter = letterMatch ? letterMatch[1].toUpperCase() : "";
        
        // Kiểm tra xem chữ cái này đã nằm trong userAnswers từ câu 'from' đến 'to' chưa
        let isSelected = false;
        for (let i = group.from; i <= group.to; i++) {
            if (userAnswers[i] === letter) {
                isSelected = true;
                break;
            }
        }

        html += `
            <div class="multiple-option-row" 
                 onclick="handleIELTSClick(${group.from}, ${group.to}, '${letter}')"
                 style="display: flex; align-items: flex-start; gap: 12px; padding: 12px; 
                        border: 2px solid ${isSelected ? '#2b5a84' : '#e0e0e0'}; 
                        border-radius: 6px; cursor: pointer; background: ${isSelected ? '#f0f7ff' : '#fff'};">
                
                <div style="width: 20px; height: 20px; border: 2px solid ${isSelected ? '#2b5a84' : '#999'}; 
                     border-radius: 4px; display: flex; align-items: center; justify-content: center; 
                     background: ${isSelected ? '#2b5a84' : 'transparent'}; color: white; flex-shrink: 0;">
                    ${isSelected ? '✓' : ''}
                </div>
                
                <div style="flex: 1; font-size: 15px; color: ${isSelected ? '#2b5a84' : '#444'};">
                    ${line}
                </div>
            </div>`;
    });
    
    html += `</div>`;
    multiContainer.innerHTML = html;
    container.appendChild(multiContainer);
}
     });
}

function generateDropdownHtml(qNum, letters, currentAns) {
    return `
        <span class="wordlist-gap" style="display: inline-flex; align-items: center; gap: 3px;">
            <select class="q-select" 
                    style="padding: 2px; border: 1px solid #2b5a84; border-radius: 4px; font-weight: bold; background: #fffde7;"
                    onchange="saveAns(${qNum}, this.value)">
                <option value="">--</option>
                ${letters.map(l => `<option value="${l}" ${currentAns === l ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
            <strong style="color: #2b5a84; font-size: 0.9em;">(${qNum})</strong>
        </span>`;
}

function handleIELTSClick(from, to, letter) {
    if (!letter) return;

    // 1. Nếu đã chọn rồi -> Click lại là để BỎ CHỌN
    for (let i = from; i <= to; i++) {
        if (userAnswers[i] === letter) {
            delete userAnswers[i]; // Sử dụng delete để xóa sạch key
            renderQuestions(allPassages[currentIdx].questions); // Sửa testData thành allPassages
            updateNavigation(); 
            return;
        }
    }

    // 2. Nếu chưa chọn -> Tìm câu hỏi nào còn trống để điền vào
    for (let i = from; i <= to; i++) {
        if (!userAnswers[i] || userAnswers[i].trim() === "") {
            userAnswers[i] = letter; // Gán trực tiếp vào userAnswers
            renderQuestions(allPassages[currentIdx].questions); // Sửa testData thành allPassages
            updateNavigation();
            return;
        }
    }

    console.log("Maximum options selected for this group.");
}
// XỬ LÝ ĐÁP ÁN
function selectMCQ(id, value) {
    if (isReviewing) return; // Không cho click khi đã nộp bài
    
    // Gán đáp án (Nếu click lại cái cũ thì vẫn giữ nguyên, click cái mới thì đổi)
    userAnswers[id] = value; 
    
    // Render lại giao diện của Passage hiện tại
    renderQuestions(allPassages[currentIdx].questions); // Dùng allPassages cho đồng bộ
    updateNavigation(); // Cập nhật màu sắc cho các nốt tròn ở footer
}

function saveAns(id, value) {
    if (isReviewing) return;
    if (!value || value.trim() === "") {
        delete userAnswers[id];
    } else {
        // Tự động viết hoa để đồng bộ dữ liệu
        userAnswers[id] = value.trim().toUpperCase();
    }
    updateNavigation();
}

let isReviewing = false; // Biến trạng thái để kiểm tra xem có đang ở chế độ Review không

function submitTest() {
    if (!confirm("Are you sure you want to finish the test?")) return;
    isReviewing = true; 
    
    let score = 0;
    
    allPassages.forEach((passage, pIdx) => {
        const passageKey = `passage${pIdx + 1}`;
        const correctAnswers = allCorrectAnswers[passageKey] || {};

        passage.questions.forEach(group => {
            // --- DẠNG CHỌN NHIỀU (mcq-multiple) ---
            if (group.type === 'mcq-multiple') {
                // 1. Thu thập tất cả đáp án đúng của nhóm này vào một mảng (pool)
                let correctPool = [];
                for (let i = group.from; i <= group.to; i++) {
                    if (correctAnswers[i]) {
                        // Tách dấu "/" nếu có (ví dụ "B / D" thành ["B", "D"])
                        let parts = correctAnswers[i].split('/').map(s => s.trim().toUpperCase());
                        correctPool.push(...parts);
                    }
                }
                // Loại bỏ các phần tử trùng lặp trong pool nếu có
                correctPool = [...new Set(correctPool)];

                // 2. Kiểm tra câu trả lời của user
                for (let i = group.from; i <= group.to; i++) {
                    const uAns = (userAnswers[i] || "").toString().trim().toUpperCase();
                    
                    if (uAns !== "" && correctPool.includes(uAns)) {
                        score++;
                        // Quan trọng: Xóa đáp án đã dùng khỏi pool để không tính điểm 2 lần cho 1 ký tự
                        const index = correctPool.indexOf(uAns);
                        if (index > -1) correctPool.splice(index, 1);
                    }
                }
            } 
            // --- CÁC DẠNG CÒN LẠI (MCQ đơn, TFNG, Gap Fill, Matching, Wordlist) ---
            else {
                for (let i = group.from; i <= group.to; i++) {
                    const uAns = (userAnswers[i] || "").toString().trim().toUpperCase();
                    const rawCAns = (correctAnswers[i] || "").toString();
                    
                    // Xử lý đáp án đúng có dấu "/" (cho phép chọn 1 trong các phương án)
                    const validOptions = rawCAns.split('/').map(s => s.trim().toUpperCase());
                    
                    if (uAns !== "" && validOptions.includes(uAns)) {
                        score++;
                    }
                }
            }
        });
    });
    
    showResultModal(score);
    renderQuestions(allPassages[currentIdx].questions); 
    updateNavigation();
}

function renderFooter() {
    const parts = [{id:'dots-p1',s:1,e:13,idx:0},{id:'dots-p2',s:14,e:26,idx:1},{id:'dots-p3',s:27,e:40,idx:2}];
    parts.forEach(part => {
        const container = document.getElementById(part.id);
        if (!container) return;
        container.innerHTML = "";
        for (let i = part.s; i <= part.e; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.textContent = i;
            dot.setAttribute('data-id', i);
            dot.onclick = () => loadPassage(part.idx);
            container.appendChild(dot);
        }
    });
}

function updateNavigation() {
    document.querySelectorAll('.dot').forEach(dot => {
        const id = parseInt(dot.getAttribute('data-id'));
        const uAns = (userAnswers[id] || "").toString().trim().toUpperCase();
        
        // 1. Tìm Group chứa câu hỏi này để biết type (quan trọng cho chấm điểm nhóm)
        let currentGroup = null;
        let passageKey = "";
        
        allPassages.forEach((passage, pIdx) => {
            passage.questions.forEach(group => {
                if (id >= group.from && id <= group.to) {
                    currentGroup = group;
                    passageKey = `passage${pIdx + 1}`;
                }
            });
        });

        const correctAnswers = allCorrectAnswers[passageKey] || {};
        const rawCAns = (correctAnswers[id] || "").toString().trim().toUpperCase();

        // Reset class
        dot.classList.remove('answered', 'correct', 'incorrect');

        if (isReviewing) {
            // --- LOGIC CHẤM ĐIỂM KHI REVIEW ---
            
            // Trường hợp 1: Dạng chọn nhiều (mcq-multiple) - Dùng cơ chế "Pool" (Túi đáp án)
            if (currentGroup && currentGroup.type === 'mcq-multiple') {
                let correctPool = [];
                for (let i = currentGroup.from; i <= currentGroup.to; i++) {
                    if (correctAnswers[i]) {
                        // Tách dấu / nếu có và đẩy vào pool
                        let parts = correctAnswers[i].split('/').map(s => s.trim().toUpperCase());
                        correctPool.push(...parts);
                    }
                }
                // Loại bỏ trùng lặp trong pool
                correctPool = [...new Set(correctPool)];

                if (uAns !== "" && correctPool.includes(uAns)) {
                    dot.classList.add('correct');
                } else {
                    dot.classList.add('incorrect');
                }
            } 
            // Trường hợp 2: Các dạng khác (MCQ đơn, TFNG, Điền từ, Matching)
            else {
                // Hỗ trợ đáp án có dấu "/" (Ví dụ: "TRUE / T")
                const validOptions = rawCAns.split('/').map(s => s.trim().toUpperCase());
                
                if (uAns !== "" && validOptions.includes(uAns)) {
                    dot.classList.add('correct');
                } else {
                    dot.classList.add('incorrect');
                }
            }
        } else {
            // --- CHẾ ĐỘ ĐANG LÀM BÀI ---
            if (userAnswers[id] && userAnswers[id].toString().trim() !== "") {
                dot.classList.add('answered');
            }
        }
    });
}

function startTimer() {
    let timeLeft = 3600;
    const timerDisplay = document.getElementById('timer');
    const countdown = setInterval(() => {
        let mins = Math.floor(timeLeft / 60);
        let secs = timeLeft % 60;
        if (timerDisplay) timerDisplay.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        if (timeLeft <= 0) { clearInterval(countdown); submitTest(); }
        timeLeft--;
    }, 1000);
}

function showResultModal(score) {
    const band = calculateBand(score);
    const modal = document.createElement('div');
    modal.id = "result-modal";
    modal.className = "modal-overlay";
    modal.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; display: flex; align-items: center; justify-content: center;";
    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 15px; text-align: center; min-width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <h1 style="color: #2b5a84; margin-bottom: 10px;">Test Results</h1>
            <p style="font-size: 1.2rem;">Correct: <span style="color: #28a745; font-weight: bold;">${score}/40</span></p>
            <p style="font-size: 1.2rem;">Band Score: <span style="color: #d9534f; font-weight: bold; font-size: 2rem;">${band}</span></p>
            <div style="display: flex; gap: 15px; justify-content: center; margin-top:30px;">
                <button onclick="closeModalAndReview()" style="padding: 12px 25px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">REVIEW TEST</button>
                <button onclick="location.reload()" style="padding: 12px 25px; background: #2b5a84; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">NEW TEST</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
}
function closeModalAndReview() {
    const modal = document.getElementById('result-modal');
    if (modal) modal.remove();
    loadPassage(0); // Quay lại trang 1 để xem lại
}
function calculateBand(score) {
    const bands = [{s:39,b:"9.0"},{s:37,b:"8.5"},{s:35,b:"8.0"},{s:33,b:"7.5"},{s:30,b:"7.0"},{s:27,b:"6.5"},{s:23,b:"6.0"},{s:19,b:"5.5"},{s:15,b:"5.0"}];
    for (let item of bands) { if (score >= item.s) return item.b; }
    return "Below 5.0";
}
// 1. Logic Chỉnh kích thước chữ
function changeFontSize(delta) {
    currentFontSize += delta;
    
    // Giới hạn cỡ chữ từ 12px đến 30px
    if (currentFontSize < 12) currentFontSize = 12;
    if (currentFontSize > 30) currentFontSize = 30;
    
    // 1. Áp dụng cho các khung chứa chính
    const containers = document.querySelectorAll('.pane, #questions-container, .question-group');
    containers.forEach(el => {
        el.style.fontSize = currentFontSize + 'px';
    });

    // 2. Ép các thẻ input, select, và text bên trong cũng phải đổi theo
    const inputs = document.querySelectorAll('.q-input, .q-select, .q-text, .ins-text, .mcq-option-row div');
    inputs.forEach(item => {
        item.style.fontSize = currentFontSize + 'px';
    });

    // 3. Xử lý riêng cho các thẻ strong (số câu hỏi) nếu nó bị cố định font
    const strongs = document.querySelectorAll('#questions-container strong');
    strongs.forEach(s => {
        s.style.fontSize = (currentFontSize + 1) + 'px'; // Cho số câu hỏi to hơn 1 chút cho rõ
    });
}

// 2. Logic Đổi màu nền (Theme)
function setTheme(themeName) {
    // Xóa hết các theme cũ
    document.body.classList.remove('theme-sepia', 'theme-dark');
    
    // Thêm theme mới nếu không phải light
    if (themeName !== 'light') {
        document.body.classList.add('theme-' + themeName);
    }
}

// --- LOGIC HIGHLIGHT & CUSTOM CONTEXT MENU ---


// 1. Chặn menu chuột phải mặc định và hiện menu tùy chỉnh
document.addEventListener('contextmenu', function(e) {
    // Phải lấy element ở ĐÂY để đảm bảo nó đã tồn tại trong DOM
    const menu = document.getElementById('highlight-menu'); 
    if (!menu) return;

    // Kiểm tra vùng bôi đen (Khớp với ID trong HTML của Jim)
    if (e.target.closest('#reading-pane') || e.target.closest('#question-pane')) {
        e.preventDefault();
        
        const selection = window.getSelection().toString();
        if (selection.trim().length > 0) {
            menu.style.display = 'block';
            menu.style.left = e.pageX + 'px';
            menu.style.top = e.pageY + 'px';
        } else {
            menu.style.display = 'none';
        }
    } else {
        e.preventDefault(); // Khóa menu ở các vùng khác
    }
});

// 2. Ẩn menu khi click chuột trái ra ngoài
document.addEventListener('click', function(e) {
    const menu = document.getElementById('highlight-menu');
    if (menu && !e.target.closest('.context-menu')) {
        menu.style.display = 'none';
    }
});
// 3. Hàm áp dụng Highlight
function applyHighlight() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = 'highlight';
    
    try {
        range.surroundContents(span);
    } catch (e) {
        console.warn("Không thể highlight vùng chọn phức tạp");
    }
    
    // Đóng menu
    const menu = document.getElementById('highlight-menu');
    if (menu) menu.style.display = 'none';
    window.getSelection().removeAllRanges();
}

function clearHighlight() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const container = selection.anchorNode.parentElement;
    if (container && container.classList.contains('highlight')) {
        const textNode = document.createTextNode(container.textContent);
        container.parentNode.replaceChild(textNode, container);
    }
    
    // Đóng menu
    const menu = document.getElementById('highlight-menu');
    if (menu) menu.style.display = 'none';
    window.getSelection().removeAllRanges();
}
function selectUniqueMCQ(qNum, value, from, to) {
    if (isReviewing) return;

    // Nếu bấm vào cái đang chọn thì bỏ chọn
    if (userAnswers[qNum] === value) {
        delete userAnswers[qNum];
    } else {
        // KIỂM TRA TRÙNG: Duyệt các câu khác trong nhóm
        for (let i = from; i <= to; i++) {
            if (i !== qNum && userAnswers[i] === value) {
                // Nếu câu khác (ví dụ 21) đã chọn 'A' rồi mà câu này (20) cũng chọn 'A'
                // Thì xóa lựa chọn ở câu kia đi
                delete userAnswers[i];
            }
        }
        userAnswers[qNum] = value;
    }
    
    // Render lại và cập nhật nốt tròn
    renderQuestions(allPassages[currentIdx].questions);
    updateNavigation(); // Hoặc updateDots() tùy theo tên hàm của anh
}