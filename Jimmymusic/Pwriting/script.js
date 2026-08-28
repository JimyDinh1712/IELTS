// Global State
let currentTask = 1;
let currentFontSize = 14;
let secondsElapsed = 0;
let timerInterval = null;

const userAnswers = { task1: '', task2: '' };
const userPrompts = { task1: '', task2: '' };

// DOM Elements
const textArea = document.getElementById('writing-area');
const promptArea = document.getElementById('custom-prompt-area');
const wordCountEl = document.getElementById('word-count');
const timerEl = document.getElementById('timer');

// ==========================================
// 1. DỮ LIỆU TEMPLATES (PART 1 & PART 2)
// ==========================================
const templates = {
    // --- PART 1 ---
    chart_time: `The line graph (chart, bar chart, pie chart, table) illustrates (compares) the proportion (percentage, figure for, number of, amount of) [Object] in [number] different categories between [Year A] and [Year B] (from [Year A] to [Year B]).

Overall, the chart shows clear differences among categories. [Category A] consistently recorded the highest percentage of [Obj], while [Category B] remained the least engaged throughout the period. Although some fluctuations occurred, most categories followed a largely stable pattern, with the exception of a moderate downward trend in [Category].

Body 1: From [Year A] to [Year F], categories displayed contrasting patterns. [Category A] experienced a slight rise from around [NUMBER] to just [NUMBER] in [Year B], before declining noticeably to [NUMBER] by [Year F]. In contrast, [Category C] saw a sharp decrease from just [NUMBER] to [NUMBER] in [Year C], followed by a strong recovery, reaching approximately [NUMBER] by [Year F]. [Category B] consistently had the lowest figures, starting at [NUMBER], rising gradually to just [NUMBER] in [Year D], and then falling marginally to [NUMBER] in [Year F].

Body 2: Between [Year F] and [Year Z], a mild downward trend was observed across all categories. [Category A] continued to decline, reaching just [NUMBER] by the end of the period. [Category C] remained broadly stable during the early years, before falling slightly to finish at [NUMBER]. Meanwhile, [Category B] also experienced a small decrease after a decade of stability, ending at just [NUMBER], the lowest percentage among all categories.`,

    chart_trend: `The line graph (chart, bar chart, pie chart, table) illustrates (compares) the proportion (percentage, figure for, number of, amount of) [Object] in [number] different categories between [Year A] and [Year B] (from [Year A] to [Year B]).

Overall, the chart shows clear differences among categories. [Category A] consistently recorded the highest percentage of [Obj], while [Category B] remained the least engaged throughout the period. Although some fluctuations occurred, most categories followed a largely stable pattern, with the exception of a moderate downward trend in [Category].

Body 1: At the beginning of the period, the proportion of [Category A] stood at just [NUMBER], the highest value on the graph. This figure rose gradually to around [NUMBER] by [Year B], before falling steadily to slightly above [NUMBER] in [Year Z]. In contrast, [Category B] started at approximately [NUMBER], increased sharply to just over [NUMBER] in [Year B], remained relatively stable for the following [number] years, and then declined marginally to just above [NUMBER] by the end of the period.

Body 2: Regarding [Category B], (both) began the period at over [NUMBER] and experienced a (similar) decline to below [NUMBER] in [Year B]. Afterward, both categories saw notable growth, rising to nearly [NUMBER] and around [NUMBER] (, respectively). Their proportions then remained broadly stable before ending at just above [NUMBER] (for the younger group and approximately [NUMBER] for the older one) in [Year Z].`,

    process_manmade: `The illustration demonstrates how [A] is produced (from [X] materials).

Overall, it consists of [Total Number] interconnected stages, beginning with [First Step] and ending with [Final Step] (, forming a continuous cycle).

Body 1:
The first [Number] stages involve the conversion of raw materials. Initially, [raw material] is [verb - passive / Step 1]. Following this, it is [processed / transported / treated] before being [next step]. In the subsequent stages, [further processes] take place. [Step...] then [action] and prepared for further processing.

Body 2:
The remaining stages ultimately lead to the production of [B]. [Step...]. Finally, the finished product is [packaged / delivered / distributed] to [place] (, thus completing and renewing the cycle).`,

    process_natural: `The illustration demonstrates how [A] is developed / formed / evolved (from [X]).

Overall, the process consists of several interconnected stages, beginning with [First Step] and ending with [Final Step] (, forming a continuous cycle).

Body 1:
The first [Number] stages involve [initial developments]. Initially, [Step 1]. [Step...] then [action]...

Body 2:
The remaining stages ultimately lead to [the fully developed state / final result]. [Step...]. Finally, [Final step], thereby completing the cycle / process.`,

    map: `The [number] maps (drawings) illustrate (demonstrate) how [Place Name] has changed (developed) over a period of [Time frame] years (between [Year A] and [Year B]).

Overall, the area has undergone a significant transformation, shifting from a (past main feature, e.g. a predominantly rural/industrial) area to a more (present main feature, e.g. a more urbanised/recreation-oriented) region. 

The key changes include:
- The expansion of [housing]
- The introduction of [new amenities/buildings]
- The [complete] disappearance (elimination) of [farming and fishing activities]

Body 1: Past Layout
In [earlier year], [the northeastern section / northern side] was primarily used for / was mainly occupied by [land use]. [Location A] was dominated by [feature], while [Location B] contained / featured [another feature]. A [road/river/railway] ran [direction], dividing the area into [two/three] sections. The [residential/commercial] area consisted of [details of housing or buildings]. To the [north/south/east/west], [shops, hotels, markets] were located, while [natural/industrial features] were found in / was situated [specific position].

Body 2: Present Layout
At present, many of these features have been replaced or upgraded. The former [old feature] has been converted into [new feature]. The [residential/commercial] area has expanded significantly, with [new housing/roads/facilities] added. Furthermore, [old facilities] have been replaced by [new facilities], while [another feature] has been removed entirely. As a result, the area is now far more [modern/recreational/urban] than in the past.`,

    // --- PART 2 ---
    band5_65: `In recent years, [TOPIC] has become a very popular topic of discussion. People have different views about whether this is a good or bad thing. In my opinion, I believe that [NÊU QUAN ĐIỂM HOẶC DỰ ĐOÁN]. This essay will discuss both sides of the issue and give my own perspective.

Body 1:
To begin with, there are several reasons why some people support/think about [KHÍA CẠNH 1]. The main reason is that [GIẢI THÍCH CHUNG]. This means that [GIẢI THÍCH CHI TIẾT HƠN]. A clear example of this is [VÍ DỤ]. Consequently, this leads to many positive/negative impacts on our daily lives.

Body 2:
On the other hand, there are also some arguments against this idea, or some other aspects to consider. Firstly, [KHÍA CẠNH 2/VẤN ĐỀ 2]. This often happens because [NGUYÊN NHÂN/LÝ DO]. For example, [VÍ DỤ]. However, I believe that this can be solved if we take some actions, such as [GIẢI PHÁP]. By doing this, we can reduce the negative effects and make it better.

Conclusion:
In conclusion, while there are some concerns about [TOPIC], I think that the benefits outweigh the drawbacks if we manage it well. It is important for both individuals and the government to work together to find the best solutions for this issue.`,

    band65_plus: `In recent years, [TOPIC] has attracted increasing attention. While there are differing views regarding [THIS ISSUE], it is my view that [IT] represents a largely positive development overall, provided that it is appropriately managed. This essay will examine the issue in greater detail.

Body 1:
One key aspect of this issue is that [MAIN POINT 1]. This can be largely attributed to [CAUSE / EXPLANATION], which consequently leads to [EFFECT OR OUTCOME]. For instance, [SPECIFIC EXAMPLE], which clearly illustrates this tendency in practice.

Body 2:
Another important consideration is that [MAIN POINT 2]. In this sense, [FURTHER EXPLANATION], resulting in [IMPACT OR CONSEQUENCE]. However, this issue can be addressed by [SOLUTION / MITIGATING FACTOR], which may help reduce [ITS NEGATIVE EFFECTS].

Conclusion:
In conclusion, despite the challenges associated with this issue, it is reasonable to regard it as a largely positive development. As long as it is carefully managed through appropriate actions at both individual and governmental levels, its long-term benefits are likely to outweigh any potential drawbacks.`,

    nhat_huy: `Over the past few years, [TOPIC] has attracted increasing attention. While there are differing views regarding [THIS ISSUE], it is my view that [IT] represents a largely positive development overall, provided that it is appropriately managed. This essay will examine the issue in greater detail.

Body 1:
A primary dimension to consider is that [MAIN POINT 1]. This can be largely attributed to [CAUSE / EXPLANATION], which consequently leads to [EFFECT OR OUTCOME]. For instance, [SPECIFIC EXAMPLE], which clearly illustrates this tendency in practice.

Body 2:
Another important consideration is that [MAIN POINT 2]. In this sense, [FURTHER EXPLANATION], resulting in [IMPACT OR CONSEQUENCE]. Nevertheless, this issue can be addressed by [SOLUTION / MITIGATING FACTOR], which may help reduce [ITS NEGATIVE EFFECTS].

Conclusion:
To sum up, despite the challenges associated with this issue, it is reasonable to regard it as a largely positive development. As long as it is carefully managed through appropriate actions at both individual and governmental levels, its long-term benefits are likely to outweigh any potential drawbacks.`,

    dang_khoa: `In recent years, [TOPIC] has attracted increasing attention. While there are differing views regarding [THIS ISSUE], it is my view that [IT] represents a largely positive development overall, provided that it is appropriately managed. This essay will explore the factors behind this position.

Body 1:
First and foremost, [MAIN POINT 1]. This can be largely attributed to [CAUSE / EXPLANATION], which consequently leads to [EFFECT OR OUTCOME]. For instance, [SPECIFIC EXAMPLE], which clearly illustrates this tendency in practice.

Body 2:
Another important consideration is that [MAIN POINT 2]. In this sense, [FURTHER EXPLANATION], resulting in [IMPACT OR CONSEQUENCE]. Be that as it may, this issue can be addressed by [SOLUTION / MITIGATING FACTOR], which may help reduce [ITS NEGATIVE EFFECTS].

Conclusion:
In conclusion, despite the challenges associated with this issue, it is reasonable to regard it as a largely positive development. As long as it is carefully managed through appropriate actions at both individual and governmental levels, its long-term benefits are likely to outweigh any potential drawbacks.`,

    band80: `In recent years, [TOPIC] has drawn growing attention. While opinions on this issue vary, it is my view that it can be regarded as a largely positive/negative development, provided that it is managed in an effective and responsible manner. This essay will explore the issue in more depth.

Body 1:
One notable aspect of this issue is that [MAIN POINT 1]. This can largely be attributed to [CAUSE / EXPLANATION], which in turn gives rise to [EFFECT OR OUTCOME]. For instance, [SPECIFIC EXAMPLE], demonstrating how this phenomenon operates in real-world contexts.

Body 2:
Another factor worth considering is that [MAIN POINT 2]. In this regard, [FURTHER EXPLANATION], resulting in [IMPACT OR CONSEQUENCE]. Nevertheless, these challenges can be mitigated through [SOLUTION / MITIGATING MEASURE], which may help limit the associated negative effects.

Conclusion:
In conclusion, despite the challenges associated with this issue, it is reasonable to regard it as a largely positive development. As long as it is carefully managed through appropriate actions at both individual and governmental levels, its long-term benefits are likely to outweigh any potential drawbacks.`
};

// ==========================================
// 2. DỮ LIỆU TỪ VỰNG & COLLOCATIONS
// ==========================================
const vocabData = {
    chart: `
        <div class="vocab-section-title">Động từ Tăng / Giảm</div>
        <span class="vocab-item" onclick="insertVocab('increase')">increase</span>
        <span class="vocab-item" onclick="insertVocab('rise')">rise</span>
        <span class="vocab-item" onclick="insertVocab('grow')">grow</span>
        <span class="vocab-item" onclick="insertVocab('climb')">climb</span>
        <span class="vocab-item" onclick="insertVocab('surge')">surge</span>
        <span class="vocab-item" onclick="insertVocab('soar')">soar</span>
        <span class="vocab-item" onclick="insertVocab('decrease')">decrease</span>
        <span class="vocab-item" onclick="insertVocab('fall')">fall</span>
        <span class="vocab-item" onclick="insertVocab('drop')">drop</span>
        <span class="vocab-item" onclick="insertVocab('decline')">decline</span>
        <span class="vocab-item" onclick="insertVocab('plunge')">plunge</span>

        <div class="vocab-section-title">Tính từ & Trạng từ mức độ</div>
        <span class="vocab-item" onclick="insertVocab('dramatic / dramatically')">dramatic / dramatically</span>
        <span class="vocab-item" onclick="insertVocab('sharp / sharply')">sharp / sharply</span>
        <span class="vocab-item" onclick="insertVocab('significant / significantly')">significant / significantly</span>
        <span class="vocab-item" onclick="insertVocab('substantial / substantially')">substantial / substantially</span>
        <span class="vocab-item" onclick="insertVocab('steady / steadily')">steady / steadily</span>
        <span class="vocab-item" onclick="insertVocab('gradual / gradually')">gradual / gradually</span>
        <span class="vocab-item" onclick="insertVocab('slight / slightly')">slight / slightly</span>

        <div class="vocab-section-title">Dao động & Đỉnh / Đáy</div>
        <span class="vocab-item" onclick="insertVocab('fluctuate around')">fluctuate around</span>
        <span class="vocab-item" onclick="insertVocab('remain stable / steady')">remain stable / steady</span>
        <span class="vocab-item" onclick="insertVocab('reach a peak of')">reach a peak of</span>
        <span class="vocab-item" onclick="insertVocab('hit a low of')">hit a low of</span>
    `,

    map: `
        <div class="vocab-section-title">Giới từ vị trí</div>
        <span class="vocab-item" onclick="insertVocab('in the north of the...')">in the north of the...</span>
        <span class="vocab-item" onclick="insertVocab('at the northern gate of the campus')">at the northern gate of the campus</span>
        <span class="vocab-item" onclick="insertVocab('runs from the north to the south')">runs from the north to the south</span>
        <span class="vocab-item" onclick="insertVocab('is to the north of the barn')">is to the north of the barn</span>
        <span class="vocab-item" onclick="insertVocab('is on the north edge of the campus')">is on the north edge of the campus</span>

        <div class="vocab-section-title">Vị trí tương đối</div>
        <span class="vocab-item" onclick="insertVocab('A is to the west / left of B')">A is to the west / left of B</span>
        <span class="vocab-item" onclick="insertVocab('A is in front of B')">A is in front of B</span>
        <span class="vocab-item" onclick="insertVocab('A is directly opposite B')">A is directly opposite B</span>
        <span class="vocab-item" onclick="insertVocab('A is in close proximity to B')">A is in close proximity to B</span>
        <span class="vocab-item" onclick="insertVocab('A is parallel to B')">A is parallel to B</span>
        <span class="vocab-item" onclick="insertVocab('A is surrounded by B(s)')">A is surrounded by B(s)</span>
        <span class="vocab-item" onclick="insertVocab('A is in the east / on the left-hand side of the map')">A is in the east / on the left-hand side of (the map)</span>

        <div class="vocab-section-title">Hiện trạng & Động từ biến đổi</div>
        <span class="vocab-item" onclick="insertVocab('be primarily used for')">be primarily used for</span>
        <span class="vocab-item" onclick="insertVocab('be mainly occupied by')">be mainly occupied by</span>
        <span class="vocab-item" onclick="insertVocab('be dominated by')">be dominated by</span>
        <span class="vocab-item" onclick="insertVocab('built / constructed / erected')">built / constructed / erected</span>
        <span class="vocab-item" onclick="insertVocab('renovated / reconstructed / modernized')">renovated / reconstructed / modernized</span>
        <span class="vocab-item" onclick="insertVocab('converted / transformed into')">converted / transformed into</span>
        <span class="vocab-item" onclick="insertVocab('replaced by')">replaced by</span>
        <span class="vocab-item" onclick="insertVocab('extended / expanded / widened')">extended / expanded / widened</span>
        <span class="vocab-item" onclick="insertVocab('demolished / flattened / knocked down')">demolished / flattened / knocked down</span>
    `,

    process: `
        <div class="vocab-section-title">Từ nối thứ tự</div>
        <span class="vocab-item" onclick="insertVocab('first of all')">First of all</span>
        <span class="vocab-item" onclick="insertVocab('initially')">Initially</span>
        <span class="vocab-item" onclick="insertVocab('at the first stage')">At the first stage</span>
        <span class="vocab-item" onclick="insertVocab('subsequently')">Subsequently</span>
        <span class="vocab-item" onclick="insertVocab('following this')">Following this</span>
        <span class="vocab-item" onclick="insertVocab('after which')">After which</span>
        <span class="vocab-item" onclick="insertVocab('once ... is completed')">Once ... is completed</span>
        <span class="vocab-item" onclick="insertVocab('simultaneously')">Simultaneously</span>
        <span class="vocab-item" onclick="insertVocab('finally')">Finally</span>
        <span class="vocab-item" onclick="insertVocab('culminating in')">Culminating in</span>
    `,

    education: `
        <div class="vocab-section-title">Hệ thống & Loại hình giáo dục</div>
        <span class="vocab-item" onclick="insertVocab('tertiary education')">tertiary education</span>
        <span class="vocab-item" onclick="insertVocab('vocational training')">vocational training</span>
        <span class="vocab-item" onclick="insertVocab('distance learning')">distance learning</span>
        <span class="vocab-item" onclick="insertVocab('core curriculum')">core curriculum</span>
        <span class="vocab-item" onclick="insertVocab('exorbitant tuition fees')">exorbitant tuition fees</span>

        <div class="vocab-section-title">Kỹ năng & Phát triển</div>
        <span class="vocab-item" onclick="insertVocab('acquire knowledge and practical skills')">acquire knowledge and practical skills</span>
        <span class="vocab-item" onclick="insertVocab('foster critical thinking skills')">foster critical thinking skills</span>
        <span class="vocab-item" onclick="insertVocab('nurture creativity and innovation')">nurture creativity and innovation</span>
        <span class="vocab-item" onclick="insertVocab('holistic development')">holistic development</span>
        <span class="vocab-item" onclick="insertVocab('bridge the skill gap')">bridge the skill gap</span>
    `,

    government: `
        <div class="vocab-section-title">Chính sách & Ngân sách</div>
        <span class="vocab-item" onclick="insertVocab('allocate state budget for')">allocate state budget for</span>
        <span class="vocab-item" onclick="insertVocab('prioritize public spending on')">prioritize public spending on</span>
        <span class="vocab-item" onclick="insertVocab('tax revenue')">tax revenue</span>
        <span class="vocab-item" onclick="insertVocab('government intervention')">government intervention</span>
        <span class="vocab-item" onclick="insertVocab('social welfare system')">social welfare system</span>

        <div class="vocab-section-title">Hành động & Luật pháp</div>
        <span class="vocab-item" onclick="insertVocab('enact strict legislation to curb')">enact strict legislation to curb</span>
        <span class="vocab-item" onclick="insertVocab('enforce stringent regulations on')">enforce stringent regulations on</span>
        <span class="vocab-item" onclick="insertVocab('implement effective policies')">implement effective policies</span>
        <span class="vocab-item" onclick="insertVocab('address pressing social issues')">address pressing social issues</span>
    `,

    technology: `
        <div class="vocab-section-title">Công nghệ & Đổi mới</div>
        <span class="vocab-item" onclick="insertVocab('technological advancements')">technological advancements</span>
        <span class="vocab-item" onclick="insertVocab('cutting-edge technology')">cutting-edge technology</span>
        <span class="vocab-item" onclick="insertVocab('artificial intelligence and automation')">artificial intelligence and automation</span>
        <span class="vocab-item" onclick="insertVocab('tech-savvy generation')">tech-savvy generation</span>
        <span class="vocab-item" onclick="insertVocab('virtual communication')">virtual communication</span>

        <div class="vocab-section-title">Tác động & Thách thức</div>
        <span class="vocab-item" onclick="insertVocab('revolutionize the way people work')">revolutionize the way people work</span>
        <span class="vocab-item" onclick="insertVocab('enhance operational efficiency')">enhance operational efficiency</span>
        <span class="vocab-item" onclick="insertVocab('lead a sedentary lifestyle')">lead a sedentary lifestyle</span>
        <span class="vocab-item" onclick="insertVocab('pose serious cybersecurity threats')">pose serious cybersecurity threats</span>
    `,

    health: `
        <div class="vocab-section-title">Sức khỏe & Lối sống</div>
        <span class="vocab-item" onclick="insertVocab('public healthcare system')">public healthcare system</span>
        <span class="vocab-item" onclick="insertVocab('average life expectancy')">average life expectancy</span>
        <span class="vocab-item" onclick="insertVocab('preventative medicine')">preventative medicine</span>
        <span class="vocab-item" onclick="insertVocab('promote a balanced lifestyle')">promote a balanced lifestyle</span>
        <span class="vocab-item" onclick="insertVocab('excessive fast-food consumption')">excessive fast-food consumption</span>

        <div class="vocab-section-title">Bệnh tật & Giải pháp</div>
        <span class="vocab-item" onclick="insertVocab('chronic health conditions')">chronic health conditions</span>
        <span class="vocab-item" onclick="insertVocab('combat childhood obesity')">combat childhood obesity</span>
        <span class="vocab-item" onclick="insertVocab('alleviate stress and anxiety')">alleviate stress and anxiety</span>
        <span class="vocab-item" onclick="insertVocab('raise health awareness among the public')">raise health awareness among the public</span>
    `,

    environment: `
        <div class="vocab-section-title">Môi trường & Biến đổi khí hậu</div>
        <span class="vocab-item" onclick="insertVocab('mitigate environmental degradation')">mitigate environmental degradation</span>
        <span class="vocab-item" onclick="insertVocab('reduce individual carbon footprint')">reduce individual carbon footprint</span>
        <span class="vocab-item" onclick="insertVocab('harness renewable energy sources')">harness renewable energy sources</span>
        <span class="vocab-item" onclick="insertVocab('deplete non-renewable natural resources')">deplete non-renewable natural resources</span>
        <span class="vocab-item" onclick="insertVocab('phase out fossil fuels')">phase out fossil fuels</span>

        <div class="vocab-section-title">Bảo tồn & Rác thải</div>
        <span class="vocab-item" onclick="insertVocab('preserve biodiversity and ecosystems')">preserve biodiversity and ecosystems</span>
        <span class="vocab-item" onclick="insertVocab('sustainable waste management')">sustainable waste management</span>
        <span class="vocab-item" onclick="insertVocab('adopt eco-friendly alternatives')">adopt eco-friendly alternatives</span>
    `
};

let currentActiveVocabTab = null;

// ==========================================
// 3. CORE FUNCTIONS (CHUYỂN TASK, TIMER, WORD COUNT)
// ==========================================

// Khởi tạo app
window.onload = function() {
    startTimer();
    updateWordCount();
    
    // Tự động xử lý dán ảnh vào đề bài
    if (promptArea) {
        promptArea.addEventListener('paste', handlePasteImage);
    }
    
    if (textArea) {
        textArea.addEventListener('input', updateWordCount);
    }
};

// Chuyển giữa Part 1 và Part 2
function switchTask(n) {
    if (textArea) userAnswers[`task${currentTask}`] = textArea.value;
    if (promptArea) userPrompts[`task${currentTask}`] = promptArea.innerHTML;

    currentTask = n;

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`btn-task${n}`);
    if (btn) btn.classList.add('active');

    if (textArea) {
        textArea.value = userAnswers[`task${n}`] || "";
        textArea.style.fontSize = currentFontSize + 'px';
    }
    if (promptArea) {
        promptArea.innerHTML = userPrompts[`task${n}`] || "";
    }

    // Toggle Templates & Vocab
    const part1Templates = document.getElementById('templates-part1');
    const part2Templates = document.getElementById('templates-part2');
    const part1Vocab = document.getElementById('vocab-part1');
    const part2Vocab = document.getElementById('vocab-part2');
    const vocabDisplay = document.getElementById('vocab-display');

    if (n === 1) {
        if (part1Templates) part1Templates.style.display = 'flex';
        if (part2Templates) part2Templates.style.display = 'none';

        if (part1Vocab) part1Vocab.style.display = 'flex';
        if (part2Vocab) part2Vocab.style.display = 'none';
    } else {
        if (part1Templates) part1Templates.style.display = 'none';
        if (part2Templates) part2Templates.style.display = 'flex';

        if (part1Vocab) part1Vocab.style.display = 'none';
        if (part2Vocab) part2Vocab.style.display = 'flex';
    }

    if (vocabDisplay) vocabDisplay.style.display = 'none';
    currentActiveVocabTab = null;
    document.querySelectorAll('.vocab-tab-btn').forEach(b => b.classList.remove('active'));

    updatePartBanner(n);
    updateWordCount();
}

// Cập nhật Banner mô tả Part
function updatePartBanner(taskNum) {
    const labelH1 = document.querySelector('.part-label h1');
    const labelP = document.querySelector('.part-label p');

    if (taskNum === 1) {
        if (labelH1) labelH1.textContent = 'Part 1';
        if (labelP) labelP.textContent = 'You should spend about 20 minutes on this task. Write at least 150 words.';
    } else {
        if (labelH1) labelH1.textContent = 'Part 2';
        if (labelP) labelP.textContent = 'You should spend about 40 minutes on this task. Write at least 250 words.';
    }
}

// Đồng hồ đếm thời gian
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
        const secs = String(secondsElapsed % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${mins}:${secs}`;
    }, 1000);
}

// Đếm số từ
function updateWordCount() {
    if (!textArea || !wordCountEl) return;
    const text = textArea.value.trim();
    const words = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
    wordCountEl.textContent = words;
}

// Chèn Template vào bài làm
function applyTemplate(templateKey) {
    if (!templates[templateKey]) return;
    if (textArea.value.trim().length > 0) {
        if (!confirm("Thao tác này sẽ ghi đè nội dung đang có. Bạn có chắc chắn muốn chèn Template?")) {
            return;
        }
    }
    textArea.value = templates[templateKey];
    updateWordCount();
}

// Bật/tắt danh mục từ vựng
function toggleVocab(type, evt) {
    const displayArea = document.getElementById('vocab-display');
    const buttons = document.querySelectorAll('.vocab-tab-btn');

    if (currentActiveVocabTab === type) {
        displayArea.style.display = 'none';
        currentActiveVocabTab = null;
        buttons.forEach(btn => btn.classList.remove('active'));
    } else {
        displayArea.innerHTML = vocabData[type] || "";
        displayArea.style.display = 'block';
        currentActiveVocabTab = type;

        buttons.forEach(btn => btn.classList.remove('active'));
        if (evt && evt.target) {
            evt.target.classList.add('active');
        }
    }
}

// Chèn từ vựng vào vị trí con trỏ văn bản
function insertVocab(text) {
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const currentText = textArea.value;

    textArea.value = currentText.substring(0, start) + text + currentText.substring(end);
    textArea.selectionStart = textArea.selectionEnd = start + text.length;
    textArea.focus();

    updateWordCount();
}

// Thay đổi cỡ chữ bài làm
function changeFontSize(action) {
    if (action === 'increase') currentFontSize += 2;
    else if (action === 'decrease' && currentFontSize > 10) currentFontSize -= 2;
    else if (action === 'reset') currentFontSize = 14;

    if (textArea) textArea.style.fontSize = currentFontSize + 'px';
}

// Xóa nội dung đề bài
function clearCustomPrompt() {
    if (promptArea) {
        promptArea.innerHTML = '';
        userPrompts[`task${currentTask}`] = '';
    }
}

// Reset toàn bộ bài thi
function resetTest() {
    if (confirm("Bạn có chắc chắn muốn reset toàn bộ bài làm và thời gian?")) {
        userAnswers.task1 = '';
        userAnswers.task2 = '';
        userPrompts.task1 = '';
        userPrompts.task2 = '';
        if (textArea) textArea.value = '';
        if (promptArea) promptArea.innerHTML = '';
        secondsElapsed = 0;
        updateWordCount();
    }
}

// Nút Reload
function reloadData() {
    location.reload();
}

// Nút Submit
function finishTest() {
    alert(`Bài làm đã được ghi nhận!\n- Part 1: ${userAnswers.task1 ? userAnswers.task1.split(/\s+/).length : 0} từ\n- Part 2: ${userAnswers.task2 ? userAnswers.task2.split(/\s+/).length : 0} từ`);
}

// Dán hình ảnh trực tiếp vào đề bài
function handlePasteImage(e) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.style.maxWidth = '100%';
                img.style.marginTop = '10px';
                promptArea.appendChild(img);
            };
            reader.readAsDataURL(blob);
        }
    }
}