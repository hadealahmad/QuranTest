/**
 * Application State Configuration
 * Stores the current session's state including language, progress, and score.
 */
const CONFIG = {
    currentLang: 'en', // 'en' | 'ar'
    currentLevelIndex: null, // Index of the currently selected quiz level
    currentQuestionIndex: 0, // Index of the current question within the level
    score: 0, // User's current score
    answers: [] // Log of user answers for review/analytics
};

/**
 * UI Translation Dictionary
 * Contains all static text strings used in the interface for both supported languages.
 */
const UI_TEXT = {
    en: {
        app_title: "Quran Quiz",
        select_level: "Select a Level",
        start_quiz: "Start Quiz",
        question: "Question",
        next: "Next",
        finish: "Finish",
        result_title: "Quiz Completed!",
        your_score: "Your Score",
        perfect_score: "Mashallah! Perfect!",
        good_score: "Great Job!",
        try_again: "Keep Learning!",
        share_result: "Share Result",
        home: "Back to Home",
        download_image: "Download Image",
        exit_dialog_title: "Quit Quiz?",
        exit_dialog_desc: "Are you sure you want to quit current quiz? Your progress will be lost.",
        cancel: "Cancel",
        confirm_exit: "Quit Quiz",
    },
    ar: {
        app_title: "مسابقة القرآن",
        select_level: "اختر مستوى",
        start_quiz: "ابدأ المسابقة",
        question: "السؤال",
        next: "التالي",
        finish: "إنهاء",
        result_title: "أتممت المسابقة!",
        your_score: "نتيجتك",
        perfect_score: "ما شاء الله! ممتاز!",
        good_score: "عمل رائع!",
        try_again: "ثابر على التعلم!",
        share_result: "شارك النتيجة",
        home: "العودة للرئيسية",
        download_image: "تحميل الصورة",
        exit_dialog_title: "مغادرة المسابقة؟",
        exit_dialog_desc: "هل أنت متأكد من مغادرة المسابقة؟ سيفقد تقدمك الحالي.",
        cancel: "إلغاء",
        confirm_exit: "مغادرة",
    }
};

// --- DOM Elements Reference ---
const app = document.getElementById('app');
const appLogo = document.getElementById('app-logo');
const contentArea = document.getElementById('content-area');
const langToggle = document.getElementById('lang-toggle');
// Dialog Elements
const exitDialog = document.getElementById('exit-dialog');
const exitDialogTitle = document.getElementById('exit-dialog-title');
const exitDialogDesc = document.getElementById('exit-dialog-desc');
const exitCancelBtn = document.getElementById('exit-cancel-btn');
const exitConfirmBtn = document.getElementById('exit-confirm-btn');

/**
 * App Initialization
 * Sets up the initial view and event listeners when the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    lucide.createIcons();
});

/**
 * Resets the app to the entry state (Level Selector).
 */
function initApp() {
    CONFIG.currentLevelIndex = null;
    renderLevelSelector();
    updateTextDirection();
}

// --- Language Handling ---

/**
 * Language Toggle Handler
 * Switches between English and Arabic, updating the UI direction and re-rendering the current view.
 */
langToggle.addEventListener('click', () => {
    CONFIG.currentLang = CONFIG.currentLang === 'en' ? 'ar' : 'en';
    const langName = CONFIG.currentLang === 'en' ? 'العربية' : 'English';
    langToggle.querySelector('.current-lang').textContent = langName;
    updateTextDirection();

    // Re-render current view to apply language changes
    if (CONFIG.currentLevelIndex === null) {
        renderLevelSelector();
    } else if (CONFIG.answers.length === getCurrentLevelData().questions.length) {
        renderResult();
    } else {
        // If mid-quiz, maybe restart or just translate? 
        // For simplicity, let's restart level to avoid confusion
        resetQuizState();
        renderLevelSelector();
    }
});



/**
 * Updates the document direction (ltr/rtl) and font family based on the selected language.
 */
function updateTextDirection() {
    const isRTL = CONFIG.currentLang === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = CONFIG.currentLang;

    // Update body font class
    if (isRTL) {
        document.body.classList.add('font-arabic');
    } else {
        document.body.classList.remove('font-arabic');
    }

    // Update static translations
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.dataset.translate;
        if (UI_TEXT[CONFIG.currentLang][key]) {
            el.textContent = UI_TEXT[CONFIG.currentLang][key];
        }
    });

    closeExitDialog();
}

/**
 * App Logo Click Handler
 * Prompts user to end quiz if in progress, otherwise returns home.
 */
appLogo.addEventListener('click', () => {
    // If we are currently in a level (or result screen)
    if (CONFIG.currentLevelIndex !== null) {
        const levelData = getCurrentLevelData();
        const isFinished = CONFIG.answers.length === levelData.questions.length;

        if (isFinished) {
            // If finished, just go home without prompt
            initApp();
        } else {
            // If in progress, show custom dialog
            openExitDialog();
        }
    } else {
        // Already on home screen, just re-init to be safe/refresh
        initApp();
    }
});

/**
 * Open Exit Dialog
 */
function openExitDialog() {
    exitDialogTitle.textContent = t('exit_dialog_title');
    exitDialogDesc.textContent = t('exit_dialog_desc');
    exitCancelBtn.textContent = t('cancel');
    exitConfirmBtn.textContent = t('confirm_exit');

    exitDialog.classList.remove('hidden');
}

/**
 * Close Exit Dialog
 */
function closeExitDialog() {
    exitDialog.classList.add('hidden');
}

// Dialog Event Listeners
exitCancelBtn.addEventListener('click', closeExitDialog);
exitConfirmBtn.addEventListener('click', () => {
    closeExitDialog();
    initApp();
});

/**
 * Helper to get translated string for a key.
 */
function t(key) {
    return UI_TEXT[CONFIG.currentLang][key] || key;
}

/**
 * Retrieves the full dataset for the current language.
 */
function getCurrentData() {
    return window.QUIZ_DATA[CONFIG.currentLang];
}

/**
 * Retrieves the data for the currently selected level.
 */
function getCurrentLevelData() {
    return getCurrentData()[CONFIG.currentLevelIndex];
}

// --- Views ---

/**
 * Renders the Home Screen with Level Selection Cards.
 * Dynamically builds HTML based on the available levels in the data.
 */
function renderLevelSelector() {
    const data = getCurrentData();

    const cardsHtml = data.map((level, index) => `
        <div onclick="startLevel(${index})" 
             class="group bg-card hover:bg-secondary/50 border border-border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-scale-in"
             style="animation-delay: ${index * 100}ms">
            <div class="flex justify-between items-start mb-4">
                <div class="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <i data-lucide="${getIconForLevel(index)}" class="w-6 h-6 text-primary"></i>
                </div>
                <span class="text-xs font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border/50">
                    ${level.age_group}
                </span>
            </div>
            <h3 class="text-lg font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">${level.level}</h3>
            <div class="text-muted-foreground text-sm font-medium mb-1">${level.title}</div>
        </div>
    `).join('');

    contentArea.innerHTML = `
        <div class="space-y-6">
            <div class="text-center space-y-2 mb-8 animate-fade-in">
                <h2 class="text-3xl font-bold tracking-tight text-foreground">${t('select_level')}</h2>
            </div>
            <div class="grid grid-cols-1 gap-4">
                ${cardsHtml}
            </div>
        </div>
    `;
    lucide.createIcons();
}

/**
 * Returns a specific Lucide icon name based on the level index.
 */
function getIconForLevel(index) {
    const icons = ['sprout', 'book-open', 'star', 'users'];
    return icons[index] || 'circle';
}

/**
 * Starts a selected quiz level.
 * @param {number} index - Index of the level to start.
 */
window.startLevel = function (index) {
    CONFIG.currentLevelIndex = index;
    resetQuizState();
    renderQuestion();
};

/**
 * Resets the internal quiz state trackers.
 */
function resetQuizState() {
    CONFIG.currentQuestionIndex = 0;
    CONFIG.score = 0;
    CONFIG.answers = [];
}

/**
 * Renders the current question card with options.
 * Handles progress bar calculation and layout.
 */
function renderQuestion() {
    const levelData = getCurrentLevelData();
    const question = levelData.questions[CONFIG.currentQuestionIndex];
    const progress = ((CONFIG.currentQuestionIndex) / levelData.questions.length) * 100;

    contentArea.innerHTML = `
        <div class="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8 animate-scale-in relative overflow-hidden">
            <!-- Progress Bar -->
            <div class="absolute top-0 left-0 w-full h-1.5 bg-muted">
                <div class="h-full bg-primary transition-all duration-500 ease-out" style="width: ${progress}%"></div>
            </div>

            <div class="flex justify-between items-center mb-6 mt-2">
                <span class="text-sm font-medium text-muted-foreground">
                    ${t('question')} ${CONFIG.currentQuestionIndex + 1} / ${levelData.questions.length}
                </span>
                <span class="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    ${levelData.level}
                </span>
            </div>

            <h2 class="text-xl md:text-2xl font-bold leading-tight mb-8 text-foreground">
                ${question.question}
            </h2>

            <div class="space-y-3">
                ${question.options.map((option, idx) => `
                    <button onclick="handleAnswer('${option.replace(/'/g, "\\'")}', this)" 
                            class="w-full text-start p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-secondary/30 transition-all duration-200 text-lg font-medium group relative overflow-hidden">
                        <div class="flex items-center gap-3 relative z-10">
                            <span class="w-8 h-8 flex items-center justify-center rounded-lg bg-muted group-hover:bg-background border border-border text-sm font-bold text-muted-foreground transition-colors">
                                ${String.fromCharCode(65 + idx)}
                            </span>
                            <span>${option}</span>
                        </div>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * User Interaction: Handles option selection.
 * Validates answer, shows feedback, and advances to next question.
 * @param {string} selectedOption - The text of the selected option.
 * @param {HTMLElement} btnElement - The button element triggered.
 */
window.handleAnswer = function (selectedOption, btnElement) {
    // Prevent multiple clicks
    if (contentArea.querySelector('button[disabled]')) return;

    // Disable all buttons
    const buttons = contentArea.querySelectorAll('button');
    buttons.forEach(b => {
        b.disabled = true;
        b.classList.add('opacity-70', 'cursor-not-allowed');
    });

    const levelData = getCurrentLevelData();
    const question = levelData.questions[CONFIG.currentQuestionIndex];
    const isCorrect = selectedOption === question.correct_answer;

    // Visual Feedback
    btnElement.classList.remove('border-border', 'hover:border-primary/50', 'hover:bg-secondary/30');
    if (isCorrect) {
        // Correct Answer Styling
        btnElement.classList.add('border-primary', 'bg-green-100', 'text-primary');
        // Add check icon
        const icon = document.createElement('i');
        icon.className = 'w-6 h-6 text-primary absolute right-4 top-1/2 -translate-y-1/2';
        icon.setAttribute('data-lucide', 'check-circle-2');
        btnElement.querySelector('div').appendChild(icon);
        CONFIG.score++;

        // Small confetti for correct answer
        confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#22c55e', '#ffffff']
        });
    } else {
        // Incorrect Answer Styling
        btnElement.classList.add('border-destructive', 'bg-red-50', 'text-destructive');
        // Highlight correct one
        const correctBtn = Array.from(buttons).find(b => b.textContent.includes(question.correct_answer));
        if (correctBtn) {
            correctBtn.classList.remove('border-border', 'opacity-70');
            correctBtn.classList.add('border-primary', 'bg-green-50', 'text-primary');
        }
    }
    lucide.createIcons();

    CONFIG.answers.push({
        question: question.question,
        selected: selectedOption,
        correct: question.correct_answer,
        isCorrect
    });

    // Wait and go to next
    setTimeout(() => {
        CONFIG.currentQuestionIndex++;
        if (CONFIG.currentQuestionIndex < levelData.questions.length) {
            renderQuestion();
        } else {
            renderResult();
        }
    }, 1500);
};

// --- Result & Sharing ---

/**
 * Renders the final result screen with score and reaction.
 */
function renderResult() {
    const levelData = getCurrentLevelData();
    const percentage = (CONFIG.score / levelData.questions.length) * 100;

    let message = t('good_score');
    let reactionIcon = 'star';

    if (percentage === 100) {
        message = t('perfect_score');
        reactionIcon = 'trophy';
        // Big Confetti
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 }
        });
    } else if (percentage < 50) {
        message = t('try_again');
        reactionIcon = 'book-open';
    }

    contentArea.innerHTML = `
        <div class="bg-card border border-border rounded-2xl shadow-xl p-8 text-center animate-scale-in">
            <div class="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <i data-lucide="${reactionIcon}" class="w-10 h-10 text-primary"></i>
            </div>
            
            <h2 class="text-3xl font-bold mb-2 text-foreground">${t('result_title')}</h2>
            <p class="text-muted-foreground mb-8 text-lg">${message}</p>
            
            <div class="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
                <!-- Circular Progress SVG -->
                <svg class="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" stroke-width="12" fill="transparent" class="text-muted" />
                    <circle cx="96" cy="96" r="88" stroke="currentColor" stroke-width="12" fill="transparent" 
                            stroke-dasharray="553" stroke-dashoffset="${553 - (553 * percentage) / 100}"
                            class="text-primary transition-all duration-1000 ease-out" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-4xl font-bold text-foreground">${Math.round(percentage)}%</span>
                    <span class="text-sm text-muted-foreground">${CONFIG.score} / ${levelData.questions.length}</span>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-3">
                <button onclick="shareResult()" class="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                    <i data-lucide="share-2" class="w-5 h-5"></i>
                    ${t('share_result')}
                </button>
                <button onclick="initApp()" class="w-full py-3 px-4 bg-secondary text-secondary-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all flex items-center justify-center gap-2">
                    <i data-lucide="home" class="w-5 h-5"></i>
                    ${t('home')}
                </button>
            </div>
        </div>
    `;
    lucide.createIcons();
}

/**
 * Generates a social-media ready image of the score using HTML5 Canvas.
 * Downloads the image to the user's device.
 */
window.shareResult = async function () {
    const canvas = document.getElementById('share-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size (square for social media)
    canvas.width = 1080;
    canvas.height = 1080;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#dcfce7'); // green-100
    gradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative circles
    ctx.fillStyle = 'rgba(22, 163, 74, 0.1)';
    ctx.beginPath();
    ctx.arc(100, 100, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(980, 980, 400, 0, Math.PI * 2);
    ctx.fill();

    // Text Config
    const isRTL = CONFIG.currentLang === 'ar';
    ctx.textAlign = 'center';

    // Check if fonts are loaded (basic check)
    await document.fonts.ready;

    // Title
    ctx.fillStyle = '#16a34a'; // Primary Green
    ctx.font = 'bold 80px "Inter", "Amiri", sans-serif';
    ctx.fillText(UI_TEXT[CONFIG.currentLang].app_title, 540, 200);

    // Level
    const levelData = getCurrentLevelData();
    ctx.fillStyle = '#374151'; // Gray-700
    ctx.font = '60px "Inter", "Amiri", sans-serif';
    ctx.fillText(levelData.level, 540, 320);

    // Score Circle
    ctx.lineWidth = 40;
    ctx.strokeStyle = '#e5e7eb'; // Gray-200
    ctx.beginPath();
    ctx.arc(540, 560, 180, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#16a34a';
    const percentage = CONFIG.score / levelData.questions.length;
    ctx.beginPath();
    ctx.arc(540, 560, 180, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * percentage));
    ctx.stroke();

    // Score Text
    ctx.fillStyle = '#111827'; // Gray-900
    ctx.font = 'bold 120px "Inter", sans-serif'; // Numbers always Inter
    ctx.fillText(`${Math.round(percentage * 100)}%`, 540, 580);

    ctx.font = '50px "Inter", sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(`${CONFIG.score} / ${levelData.questions.length}`, 540, 660);

    // Message
    ctx.fillStyle = '#16a34a';
    ctx.font = 'bold 70px "Inter", "Amiri", sans-serif';
    const msg = percentage === 1 ? UI_TEXT[CONFIG.currentLang].perfect_score : UI_TEXT[CONFIG.currentLang].good_score;
    ctx.fillText(msg, 540, 880);

    // Convert to Image and download
    const link = document.createElement('a');
    link.download = `quran-quiz-score-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
};
