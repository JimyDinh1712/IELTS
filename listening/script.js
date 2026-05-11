/* IELTS Listening Engine - Optimized Logic - Designed by JIM */
let userAnswers = {};
let currentIdx = 0;
let testData = null; 
let correctAnswers = {}; 
let globalTestId = 'tester1'; 

const questionRanges = [
    { start: 1, end: 10 }, { start: 11, end: 20 },
    { start: 21, end: 30 }, { start: 31, end: 40 }
];

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    globalTestId = urlParams.get('id') || 'tester1'; 
    let fileName = globalTestId.endsWith('.json') ? globalTestId : `${globalTestId}.json`;
    loadFullTestData(`data/${fileName}`, globalTestId); 
});
// chặn F12
      document.onkeydown = function(e) {
    if (e.keyCode == 123 || 
        (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) || 
        (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0))) {
        return false;
    }

};

async function loadFullTestData(fileName, testId) {
   try {
        const response = await fetch(fileName + '?v=' + Date.now());
        if (!response.ok) throw new Error("File not found");
        testData = await response.json();
        correctAnswers = testData.correctAnswers || {};
        const savedData = localStorage.getItem(`ielts_ans_${testId}`);
        if (savedData) userAnswers = JSON.parse(savedData);
        initExam(); 
    } catch (e) { console.error(e); }
}

function initExam() {
    const audio = document.getElementById('main-audio');
    
    // 1. Nạp tiêu đề bài thi vào thông báo
    if (testData?.testTitle) {
        const titleEl = document.getElementById('display-test-title');
        if (titleEl) titleEl.innerText = testData.testTitle;
    }

    // 2. Chuẩn bị Audio nhưng chưa phát
    if (testData?.audioUrl && audio) { 
        audio.src = testData.audioUrl; 
        audio.load(); 
    }

    // 3. Hiển thị nội dung Part 1 sẵn ở phía dưới
    loadPassage(0); 
    
    // KHÔNG gọi startTimer(30) ở đây nữa để đợi người dùng nhấn nút
}

/* Hàm mới: Xử lý khi nhấn nút "START TEST" */
function confirmAndStart() {
    const overlay = document.getElementById('exam-start-overlay');
    const audio = document.getElementById('main-audio');

    // 1. Ẩn bảng thông báo
    if (overlay) overlay.style.display = 'none';

    // 2. Phát Audio (Giải quyết vấn đề Autoplay)
    if (audio) {
        audio.play().catch(e => console.warn("Trình duyệt chặn audio:", e));
    }

    // 3. Bắt đầu đếm ngược thời gian
    startTimer(30); 
    
    console.log("Test started by JIM");
}

function loadPassage(index) {
    if (!testData || !testData.sections[index]) return;
    currentIdx = index;
    const section = testData.sections[index];
    const mainContainer = document.getElementById('info-content-container');
    
    document.getElementById('current-part-label').innerText = `Part ${section.sectionNumber}`;

    let fullHTML = ""; // Biến tạm để gom toàn bộ nội dung Part

    section.groups.forEach((group, gIdx) => {
        if (gIdx > 0) fullHTML += `<hr style="border:0; border-top: 1px dashed #ccc; margin: 30px 0;">`;
        
        const rangeLabel = `Questions ${group.from}-${group.to}`;
        fullHTML += `
            <div class="group-header" style="margin-bottom: 20px;">
                <div style="font-weight: bold; font-size: 1.1em;">${rangeLabel}</div>
                <div style="font-style: italic; color: #444;">${group.instruction || ""}</div>
            </div>`;

        switch (group.type) {
            case 'form': 
            // Hiển thị heading nếu có (ví dụ: "Registration Form")
                if (group.heading) {
                    fullHTML += `<div class="form-heading" style="font-weight: bold; font-size: 1.2em; text-align: center; margin-bottom: 15px; text-transform: uppercase; color: #2d3748;">${group.heading}</div>`;
                }
                // XỬ LÝ GỐC: Xóa mọi dấu chấm (kể cả 1 dấu hay nhiều dấu) bám quanh số (1)
                // Chúng ta để processInputs xử lý hậu kỳ cho chuẩn
                fullHTML += `<div class="form-content">${group.content}</div>`;
                break;

            case 'labeling':
                fullHTML += `
                    <div style="display: flex; gap: 20px; margin-top:10px;">
                        <div style="width: 50%;"><img src="${group.image}" style="max-width: 100%; border: 1px solid #ccc;"></div>
                        <div style="flex: 1;">${renderMapTable(group.questions, group.options)}</div>
                    </div>`;
                break;

            case 'wordlist':
                fullHTML += renderMatchingDrag(group);
                break;

            case 'mcq-single':
                fullHTML += renderMCQSingleHTML(group); 
                break;

            case 'mcq-multiple':
                // Chỗ này cần gọi hàm return chuỗi thay vì innerHTML trực tiếp
                fullHTML += renderMCQMultipleHTML(group);
                break;
        }
    });

    // ĐỔ VÀO CONTAINER 1 LẦN DUY NHẤT
    mainContainer.innerHTML = fullHTML;

    // CHẠY HÀM QUÉT SẠCH DẤU CHẤM VÀ TẠO INPUT
    processInputs(mainContainer);
    updateNavigation();
}
function renderMCQMultipleHTML(group) {
    const lines = (group.content || "").split('<br>').map(l => l.trim()).filter(l => l !== "");
    const questionHeading = lines[0] || "";
    const optionLines = lines.slice(1);

    let html = `<div class="mcq-multiple-container" style="margin-bottom: 25px;">
        <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px;">
            <div style="font-weight: 600; color: #1e293b;">${questionHeading}</div>
        </div>
        <div style="margin-left: 65px; display: flex; flex-direction: column; gap: 10px;">`;

    optionLines.forEach(line => {
        const letterMatch = line.match(/^([A-G])/i);
        const letter = letterMatch ? letterMatch[1].toUpperCase() : "";
        
        let isSelected = false;
        for (let i = group.from; i <= group.to; i++) {
            if (userAnswers[i] === letter) { isSelected = true; break; }
        }

        html += `
            <div onclick="handleMCQMultipleClick(${group.from}, ${group.to}, '${letter}')" 
                 style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                <div style="width: 18px; height: 18px; border: 2px solid ${isSelected ? '#2b5a84' : '#cbd5e0'}; 
                     border-radius: 4px; background: ${isSelected ? '#2b5a84' : 'transparent'}; 
                     display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: 0.2s;">
                    ${isSelected ? '<span style="color: white; font-size: 12px; font-weight: bold;">✓</span>' : ''}
                </div>
                <div style="color: ${isSelected ? '#2b5a84' : '#444'}; font-size: 15px; font-weight: ${isSelected ? '600' : '400'};">${line}</div>
            </div>`;
    });
    return html + `</div></div>`;
}
function renderMCQSingleHTML(group) {
    if (!group.questions || !Array.isArray(group.questions)) return "";

    // Tăng width lên 100% hoặc 90% để tránh bị bó hẹp
    let html = `<div class="mcq-modern-wrapper" style="display: flex; flex-direction: column; gap: 30px; width: 100%; max-width: 800px; margin-bottom: 40px;">`;

    group.questions.forEach(qObj => {
        const qNum = qObj.id;
        const questionText = qObj.text;
        const activeVal = userAnswers[qNum];

        html += `
            <div class="question-item" style="margin-bottom: 10px;">
                <div class="q-title" style="margin-bottom: 18px; font-size: 16px; display: flex; gap: 15px; align-items: flex-start;">
                    <span style="font-weight: bold; min-width: 25px;">${qNum}</span>
                    <div style="color: #1e293b; line-height: 1.5; font-weight: 500;">${questionText}</div>
                </div>

                <div class="choices-container" style="display: flex; flex-direction: column; gap: 12px; margin-left: 40px;">
                    ${qObj.options.map(fullOptionText => {
                        const letterMatch = fullOptionText.trim().match(/^([A-E])/i);
                        const letter = letterMatch ? letterMatch[1].toUpperCase() : "";
                        const isSelected = activeVal === letter;
                        
                        // Loại bỏ chữ cái A, B, C thừa ở đầu nội dung nếu cần
                        const cleanOptionText = fullOptionText.replace(/^[A-E][\.\s]*/i, '').trim();

                        return `
                            <div class="mcq-option-row" 
                                 onclick="handleMCQSingleClick(${qNum}, '${letter}')"
                                 style="display: flex; align-items: flex-start; gap: 15px; cursor: pointer; group;">
                                
                                <div class="radio-circle" style="width: 20px; height: 20px; border: 1.5px solid ${isSelected ? '#2b5a84' : '#cbd5e0'}; 
                                     border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; 
                                     background: ${isSelected ? '#2b5a84' : 'white'}; margin-top: 2px; transition: 0.2s;">
                                    ${isSelected ? '<span style="color: white; font-size: 12px;">✓</span>' : ''}
                                </div>

                                <div style="font-size: 15px; color: #444; line-height: 1.5;">
                                    <strong style="margin-right: 5px;">${letter}</strong> ${cleanOptionText}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>`;
    });

    html += `</div>`;
    return html;
}

function handleMCQSingleClick(qNum, letter) {
    // Nếu đã nộp bài thì không cho sửa
    if (typeof isSubmitted !== 'undefined' && isSubmitted) return;
    if (!letter) return;

    // Logic: Nếu click vào đáp án đang chọn -> Bỏ chọn. Nếu click cái mới -> Đổi đáp án.
    if (userAnswers[qNum] === letter) {
        delete userAnswers[qNum];
    } else {
        userAnswers[qNum] = letter;
    }
    
    // Render lại giao diện và nốt tròn
    loadPassage(currentIdx); 
    updateNavigation();
    
    // Lưu dữ liệu vào localStorage
    if (typeof persistData === 'function') {
        persistData();
    }
}
function handleMCQMultipleClick(from, to, letter) {
    if (typeof isSubmitted !== 'undefined' && isSubmitted) return;
    if (!letter) return;

    // 1. Kiểm tra xem ký tự này đã chọn trong nhóm (from-to) chưa. Nếu có rồi thì BỎ CHỌN.
    for (let i = from; i <= to; i++) {
        if (userAnswers[i] === letter) {
            delete userAnswers[i];
            loadPassage(currentIdx);
            updateNavigation();
            if (typeof persistData === 'function') persistData();
            return;
        }
    }

    // 2. Nếu chưa chọn -> Tìm câu nào còn trống trong nhóm để điền vào.
    for (let i = from; i <= to; i++) {
        if (!userAnswers[i] || userAnswers[i].trim() === "") {
            userAnswers[i] = letter;
            loadPassage(currentIdx);
            updateNavigation();
            if (typeof persistData === 'function') persistData();
            return;
        }
    }
}
function renderMCQSingle(container, group) {
   group.questions.forEach(q => {
        // Kiểm tra xem text có bắt đầu bằng chính q.id không
       const idStr = q.id.toString();
    // Regex kiểm tra: Bắt đầu bằng id, theo sau là ký tự không phải số hoặc là kết thúc chuỗi
    const hasCorrectNumber = new RegExp(`^${idStr}([^0-9]|$)`).test(q.text.trim());

    const displayTitle = hasCorrectNumber 
                         ? q.text 
                         : `${q.id}. ${q.text}`;

        let html = `<div class="mcq-single-block" style="margin-bottom: 20px;">
                        <div style="font-weight: bold; margin-bottom: 10px;">${displayTitle}</div>
                        <div style="display: grid; gap: 8px;">`;
        
        // Luôn ưu tiên dùng options trong từng câu hỏi
        const options = q.options || [];
        options.forEach(opt => {
            const char = opt.trim().charAt(0);
            const isSel = userAnswers[q.id] === char;
                
            html += `
                <div onclick="setMCQSingle(${q.id}, '${char}')" 
                     style="padding: 10px 15px; border: 1px solid ${isSel ? '#3182ce' : '#ddd'}; 
                            border-radius: 8px; cursor: pointer; background: ${isSel ? '#f0f7ff' : 'white'};
                            transition: 0.2s; display: flex; align-items: center;">
                    <b style="color: #3182ce; width: 30px;">${char}</b> 
                    <span>${opt.substring(1).trim()}</span>
                </div>`;
        });
        container.innerHTML += html + `</div></div>`;
    });
}

function setMCQSingle(id, char) {
    userAnswers[id] = char;
    loadPassage(currentIdx);
    persistData();
}
function renderMCQMultiple(container, group) {
    const qIds = group.questions.map(q => q.id);
    
    // 1. Chuyển <br> thành khoảng trắng để Regex quét mượt hơn
    const rawContent = group.content.replace(/<br\s*\/?>/gi, ' ');

    // 2. Tìm câu hỏi: Lấy mọi thứ từ đầu đến trước chữ "A "
    // Nếu không tìm thấy, mặc định lấy phần đầu trước khi gặp bất kỳ chữ cái option nào
    const titleMatch = rawContent.match(/^.*?(?=\s[A-E]\s|[A-E]\s)/);
    let groupTitle = titleMatch ? titleMatch[0].trim() : "Which TWO...";

    // 3. Regex Lookahead: Tìm chữ cái A-E và lấy nội dung đến khi gặp chữ cái tiếp theo hoặc hết chuỗi
    // Cách này xử lý được cả trường hợp "reading?A Encourage...B Allow..."
    const sharedOptions = rawContent.match(/[A-E]\s+.*?(?=\s[A-E]\s|$)/g) || [];

    let html = `<div class="mcq-multiple-box" style="margin-bottom: 30px; border: 1px solid #edf2f7; padding: 20px; border-radius: 12px; background: #fafafa;">
                    <div style="font-weight: bold; margin-bottom: 15px; color: #2d3748; font-size: 1.1em; line-height:1.4;">${groupTitle}</div>
                    <div style="display: flex; flex-direction: column; gap: 10px;">`;

    sharedOptions.forEach(opt => {
        const char = opt.trim().charAt(0);
        const text = opt.trim().substring(1).replace(/^[\s\.]+/, '').trim();
        
        if (!text) return;

        const isSel = qIds.some(id => userAnswers[id] === char);

        html += `
            <div onclick="handleMultipleSelect('${char}', ${JSON.stringify(qIds)}, ${group.numToSelect})" 
                 style="padding: 12px 15px; border: 2px solid ${isSel ? 'gold' : '#e2e8f0'}; 
                        border-radius: 8px; cursor: pointer; background: ${isSel ? '#fffdf0' : 'white'};
                        display: flex; align-items: flex-start; transition: 0.2s;">
                <b style="color: #3182ce; min-width: 25px;">${char}</b>
                <span style="flex: 1; color: #4a5568;">${text}</span>
            </div>`;
    });

    html += `</div></div>`;
    container.innerHTML += html;
}
// 1. Logic FORM: Biến (x) thành Input
function processInputs(container) {
    // Chỉ thực hiện thay thế input trong các div có class là form-content
    const formSections = container.querySelectorAll('.form-content');
    
    formSections.forEach(section => {
        let html = section.innerHTML.replace(/\.{2,}/g, '');
        html = html.replace(/[\u2026\u22EF]/g, '');

        // Regex này sẽ tìm (1), (2)... nhưng chỉ trong phần section điền từ
        const gapRegex = /\((\d+)\)/g; 
        
        section.innerHTML = html.replace(gapRegex, (match, qNum) => {
            const val = userAnswers[qNum] || "";
            let reviewClass = "";

            if (isSubmitted) {
                const correctAnsRaw = (correctAnswers[qNum] || "").toString().trim().toLowerCase();
                const possibleAnswers = correctAnsRaw.split('/').map(a => a.trim());
                const isCorrect = possibleAnswers.includes(val.trim().toLowerCase()) && val !== "";
                reviewClass = isCorrect ? 'dot-correct' : 'dot-wrong';
            }

            return `
                <span class="ielts-input-wrapper ${reviewClass}" style="display: inline-flex; align-items: center; margin: 0 4px;">
                    <span class="q-number" style="font-weight: bold; margin-right: 4px;">(${qNum})</span>
                    <input type="text" class="ielts-input" id="q-${qNum}" value="${val}" 
                           ${isSubmitted ? 'disabled' : ''} oninput="saveAns(${qNum}, this.value)" 
                           style="width: 120px; border: none; background: transparent; outline: none; padding: 2px 5px;"
                           autocomplete="off">
                </span>`;
        });
    });
}

// 2. Logic LABELING: Bảng chọn A, B, C
function renderMapTable(qs, options) {
    let html = `<table style="width:100%; border-collapse: collapse; margin-top: 10px;">
                <tr style="background: #cadef3; border-bottom: 2px solid #e2e8f0;">
                    <th style="padding: 10px; text-align: left; color: #64748b; font-size: 0.9em;">Question</th>
                    ${options.map(o => `<th style="padding: 10px; color: #64748b;">${o.charAt(0)}</th>`).join('')}
                </tr>`;

    qs.forEach(q => {
        const isAnswered = userAnswers[q.id];
        html += `<tr style="border-bottom: 1px solid #edf2f7;">
                    <td style="padding: 12px 10px; font-size: 15px; color: #1e293b;">
                        <b style="color: #2b5a84; margin-right: 8px;">${q.id}</b> ${q.text || ""}
                    </td>`;
        
        options.forEach(opt => {
            const char = opt.charAt(0);
            const isSel = userAnswers[q.id] === char;
            
            // Logic hiển thị màu sắc khi Review (nếu đã nộp bài)
            let cellStyle = "";
            if (isSubmitted) {
                const isCorrect = (correctAnswers[q.id] || "").toString().toUpperCase() === char;
                if (isSel) {
                    cellStyle = isCorrect ? 'background: #2f855a; color: white;' : 'background: #e53e3e; color: white;';
                } else if (isCorrect) {
                    cellStyle = 'background: #f0fff4; border: 2px dashed #2f855a;';
                }
            } else if (isSel) {
                cellStyle = 'background: #3182ce; color: white;';
            }

            html += `<td onclick="setChoice(${q.id}, '${char}', this)" 
                         style="cursor:pointer; text-align:center; border:1px solid #e2e8f0; width: 40px; transition: 0.2s; ${cellStyle}">
                         ${char}
                     </td>`;
        });
        html += `</tr>`;
    });
    return html + `</table>`;
}

// 3. Logic MATCHING: Kéo thả (Drag & Drop)
function renderMatchingDrag(group) {
    const titleText = group.wordlistName || "Options Bank";

    return `
    <div class="matching-wrapper" 
         style="display: grid; 
                grid-template-columns: 50% 1fr; 
                gap: 30px; 
                margin-top: 20px; 
                align-items: flex-start; 
                width: 100%; 
                box-sizing: border-box;">
        
        <div class="questions-column" style="display: flex; flex-direction: column; gap: 8px;">
            ${group.questions.map(q => {
               const idStr = q.id.toString();

    // Bước 1: Xác định tiêu đề hiển thị (sử dụng Regex để kiểm tra số ID chính xác)
    // Regex này đảm bảo sau số ID phải là một ký tự không phải số (khoảng trắng, dấu chấm...) hoặc kết thúc chuỗi
    const hasCorrectNumber = new RegExp(`^${idStr}([^0-9]|$)`).test(q.text.trim());

    let cleanText = hasCorrectNumber 
                    ? q.text 
                    : `${q.id}. ${q.text}`;
    
    // Bước 2: Xử lý xóa bỏ các dấu "....." và "_____" dư thừa
    // Loại bỏ các cụm có từ 2 dấu chấm hoặc 2 dấu gạch dưới trở lên
    cleanText = cleanText.replace(/\.{2,}/g, '').replace(/_{2,}/g, '').trim();
                
                return `
                <div class="matching-row" 
                     style="display: flex; align-items: center; justify-content: space-between; 
                            padding: 12px 15px; background: #fff; border: 1px solid #e2e8f0; 
                            border-radius: 8px; box-sizing: border-box; width: 100%;">
                    
                    <span style="font-weight: 500; color: #334155; font-size: 1.02em; flex: 1; padding-right: 15px;">
                        ${cleanText}
                    </span>
                    
                    <div class="drop-zone ${userAnswers[q.id] ? 'has-item' : ''}" 
                         ondragover="event.preventDefault()" 
                         ondrop="handleDrop(event, ${q.id})"
                         style="width: 130px; height: 38px; border: 1.5px solid #cbd5e0; 
                                background: #f8fafc; border-radius: 6px; text-align: center; 
                                line-height: 36px; color: #2b5a84; font-weight: 700;
                                flex-shrink: 0;">
                         ${userAnswers[q.id] || ''}
                    </div>
                </div>`;
            }).join('')}
        </div>
        
        <div class="options-column" 
             style="background: #f1f5f9; padding: 15px; border-radius: 12px; 
                    border: 1px solid #e2e8f0; position: sticky; top: 10px; 
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); 
                    overflow: hidden;">
            
            <div style="font-size: 0.8em; text-transform: uppercase; letter-spacing: 0.05em;
                        color: #64748b; margin-bottom: 12px; font-weight: 700; border-bottom: 1px solid #cbd5e0; padding-bottom: 8px;">
                ${titleText}
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${group.options.map(opt => `
                    <div draggable="true" 
                         ondragstart="event.dataTransfer.setData('text', '${opt.charAt(0)}')"
                         class="draggable-option"
                         style="padding: 10px 12px; background: white; border: 1px solid #cbd5e0; 
                                border-radius: 6px; cursor: grab; font-size: 0.9em; color: #1e293b;
                                box-shadow: 0 1px 2px rgba(0,0,0,0.05); 
                                display: flex; align-items: flex-start;
                                word-break: break-word;
                                transition: all 0.2s ease;">
                         <b style="color: #2b5a84; margin-right: 8px; flex-shrink: 0;">${opt.charAt(0)}</b> 
                         <span>${opt.substring(1).replace(/^[\s\.]+/, '').trim()}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>`;
}
function handleMultipleSelect(char, qIds, max) {
    // Lấy tất cả đáp án hiện tại của các câu hỏi trong nhóm
    let allSelected = [];
    qIds.forEach(id => {
        if (userAnswers[id]) allSelected.push(userAnswers[id]);
    });

    if (allSelected.includes(char)) {
        // Nếu đã chọn rồi thì bỏ chọn
        allSelected = allSelected.filter(item => item !== char);
    } else {
        // Nếu chưa chọn và chưa quá giới hạn thì thêm vào
        if (allSelected.length < max) {
            allSelected.push(char);
        }
    }

    // Cập nhật lại userAnswers theo từng ID (Ví dụ: ID 17 lấy cái đầu, ID 18 lấy cái thứ 2)
    qIds.forEach((id, index) => {
        userAnswers[id] = allSelected[index] || "";
    });

    loadPassage(currentIdx); // Re-render giao diện
    persistData();
}
// --- HÀM LƯU TRỮ VÀ SỰ KIỆN ---
function saveAns(id, val) { 
    if (isSubmitted) return; // Nếu đã nộp bài thì không lưu nữa
    userAnswers[id] = val; 
    persistData(); 
}

function setChoice(id, val, el) {
    userAnswers[id] = val;
    loadPassage(currentIdx); // Re-render để cập nhật màu sắc
}

function setMCQ(id, char, isMulti, max, el) {
    if (!isMulti) {
        userAnswers[id] = char;
    } else {
        let current = userAnswers[id] || "";
        if (current.includes(char)) {
            current = current.replace(char, "");
        } else {
            if (current.length < max) current += char;
        }
        userAnswers[id] = current.split('').sort().join('');
    }
    loadPassage(currentIdx);
}

function handleDrop(e, qId) {
    e.preventDefault();
    userAnswers[qId] = e.dataTransfer.getData("text");
    loadPassage(currentIdx);
}

function persistData() {
    localStorage.setItem(`ielts_ans_${globalTestId}`, JSON.stringify(userAnswers));
    updateNavigation();
}

function startTimer(mins) {
    let time = mins * 60;
    const el = document.getElementById('timer');
    setInterval(() => {
        if(time <= 0) return;
        time--;
        let m = Math.floor(time / 60);
        let s = time % 60;
        if(el) el.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    }, 1000);
}
// Hàm đổi cỡ chữ
function changeFontSize(size) {
    const container = document.getElementById('info-content-container');
    if (!container) return;

    // 1. Xóa toàn bộ class font cũ
    container.classList.remove('font-small', 'font-medium', 'font-large');
    
    // 2. Thêm class font mới
    container.classList.add('font-' + size);
    
    // 3. Cập nhật trạng thái hiển thị của các nút (xóa class active cũ)
    document.querySelectorAll('.setting-group button').forEach(btn => {
        btn.classList.remove('active');
        // Thêm active cho đúng nút vừa nhấn dựa trên tham số size
        if(btn.getAttribute('onclick').includes(size)) {
            btn.classList.add('active');
        }
    });
}
function showResultModal(score, total, details) {
    let resultHTML = `
        <div id="result-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; justify-content:center; align-items:center; z-index:9999;">
            <div style="background:white; padding:30px; border-radius:15px; max-width:550px; width:95%; max-height:85vh; display:flex; flex-direction:column; text-align:center; position:relative; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                
                <h2 style="color:#2b5a84; margin-top:0;">Test Result</h2>
                
                <div style="font-size:48px; font-weight:bold; margin:10px 0; color:#3182ce;">
                    ${score} / ${total}
                </div>
                <p style="font-size:1.2em;">Your Band Score: <b style="color:#2b5a84;">${calculateBand(score)}</b></p>
                
                <hr style="width:100%; border:0; border-top:1px solid #eee; margin:15px 0;">
                
                <h4 style="text-align:left; margin-bottom:10px;">Review All Answers:</h4>
                
                <div class="review-list" style="text-align:left; overflow-y:auto; flex:1; padding-right:10px; border-bottom: 1px solid #eee;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        ${details.map(d => `
                            <div style="margin-bottom:8px; font-size:14px; padding:5px; border-bottom:1px solid #f9f9f9;">
                                <b style="display:inline-block; width:35px;">Q${d.qNum}:</b> 
                                <span style="color:${d.status === 'correct' ? '#2f855a' : '#e53e3e'}; font-weight:600;">${d.user || '---'}</span> 
                                ${d.status === 'wrong' ? `<div style="color:#718096; font-size:12px; margin-left:35px;">Correct: ${d.correct}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <button onclick="document.getElementById('result-overlay').remove()" 
                        style="margin-top:20px; padding:12px 0; background:#2b5a84; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px; width:100%;">
                    CLOSE REVIEW
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', resultHTML);
}

// Hàm quy đổi Band Score cơ bản cho Listening
function calculateBand(score) {
    if (score >= 39) return "9.0";
    if (score >= 37) return "8.5";
    if (score >= 35) return "8.0";
    if (score >= 32) return "7.5";
    if (score >= 30) return "7.0";
    if (score >= 26) return "6.5";
    if (score >= 23) return "6.0";
    if (score >= 18) return "5.5";
    return "Below 5.0";
}
let isSubmitted = false; // Biến kiểm soát trạng thái nộp bài

function submitTest() {
    if (!confirm("Are you sure you want to submit your test?")) return;
    
    isSubmitted = true; 
    let score = 0;
    const totalQuestions = 40;
    const resultsSummary = {}; // Dùng để tô màu Dot
    const detailsForModal = []; // Dùng để hiện list trong Modal

    for (let i = 1; i <= totalQuestions; i++) {
        const userAns = (userAnswers[i] || "").toString().trim().toLowerCase();
        const correctAnsRaw = (correctAnswers[i] || "").toString().trim().toLowerCase();
        
        const possibleAnswers = correctAnsRaw.split('/').map(a => a.trim());
        const isCorrect = possibleAnswers.includes(userAns) && userAns !== "";
        
        if (isCorrect) score++;
        
        // Lưu trạng thái cho Dot
        resultsSummary[i] = isCorrect ? 'correct' : 'wrong';
        
        // Lưu data cho Modal
        detailsForModal.push({
            qNum: i,
            user: userAnswers[i] || "---",
            correct: correctAnswers[i] || "---",
            status: isCorrect ? 'correct' : 'wrong'
        });
    }

    // 1. Hiển thị Modal kết quả
    showResultModal(score, totalQuestions, detailsForModal);
    
    // 2. Cập nhật màu sắc các Dot ở Footer (Xanh/Đỏ)
    updateNavigationWithResults(resultsSummary);
    
    // 3. Khóa không cho nhập liệu thêm (Optional)
    const inputs = document.querySelectorAll('.ielts-input');
    inputs.forEach(input => input.disabled = true);
}

function updateNavigation() {
    questionRanges.forEach((range, idx) => {
        const dotBox = document.getElementById(`dots-p${idx + 1}`);
        if (!dotBox) return;
        dotBox.innerHTML = '';
        
        for (let i = range.start; i <= range.end; i++) {
            const val = (userAnswers[i] || "").toString().trim().toLowerCase();
            const isAns = val !== "";
            
            let statusClass = '';
            
            if (isSubmitted) {
                // CHẾ ĐỘ REVIEW: Kiểm tra đúng hay sai
                const correctAnsRaw = (correctAnswers[i] || "").toString().trim().toLowerCase();
                const possibleAnswers = correctAnsRaw.split('/').map(a => a.trim());
                const isCorrect = possibleAnswers.includes(val) && val !== "";
                
                statusClass = isCorrect ? 'dot-correct' : 'dot-wrong';
            } else {
                // CHẾ ĐỘ ĐANG LÀM BÀI: Chỉ hiện màu xanh khi đã điền
                statusClass = isAns ? 'answered' : '';
            }

            // Xác định xem part này có đang được xem không để hiện viền vàng (active)
            const activeClass = (idx === currentIdx) ? 'active' : '';
            
            dotBox.innerHTML += `<div class="dot ${statusClass} ${activeClass}" onclick="loadPassage(${idx})">${i}</div>`;
        }
    });
}