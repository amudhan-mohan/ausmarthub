// ================= POMODORO STATE =================
let customStudyTime = safeJSONParse("pomoStudyTime", 25);
let customBreakTime = safeJSONParse("pomoBreakTime", 5);

let pomoMode = "study"; // "study" or "break"
let pomoTimeLeft = customStudyTime * 60;
let pomoInterval = null;
let isPomoRunning = false;

// ================= RENDERER =================
function renderPomodoro() {
    setTimeout(updatePomodoroUI, 50);

    let isStudy = pomoMode === 'study';
    let ringColor = isStudy ? '#3b82f6' : '#f59e0b';

    return `
        <!-- Pomodoro Header -->
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl ${isStudy ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'} flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                </div>
                <div>
                    <h1 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Focus Timer</h1>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">${isStudy ? 'Study & Deep Work' : 'Rest & Recharge'}</p>
                </div>
            </div>
            <div class="text-xs px-3 py-1 rounded-full font-bold ${isStudy ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}" id="pomo-mode-badge">
                ${isStudy ? 'Focus Mode' : 'Break Time'}
            </div>
        </div>

        <div class="card flex flex-col items-center py-7 px-4 relative overflow-hidden">
            <!-- Mode Switcher Tabs -->
            <div class="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full max-w-xs mb-4 border border-slate-200/50 dark:border-white/5">
                <button onclick="setPomoMode('study')" class="flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${isStudy ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    Study (${customStudyTime}m)
                </button>
                <button onclick="setPomoMode('break')" class="flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${!isStudy ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-500 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                    Break (${customBreakTime}m)
                </button>
            </div>

            <!-- Quick Preset Chips -->
            <div class="flex gap-2 mb-6 flex-wrap justify-center">
                ${isStudy ? `
                    <button onclick="setQuickDuration(25)" class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${customStudyTime === 25 ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} transition active:scale-95">25m Standard</button>
                    <button onclick="setQuickDuration(45)" class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${customStudyTime === 45 ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} transition active:scale-95">45m Deep</button>
                    <button onclick="setQuickDuration(60)" class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${customStudyTime === 60 ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} transition active:scale-95">60m Marathon</button>
                ` : `
                    <button onclick="setQuickDuration(5)" class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${customBreakTime === 5 ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} transition active:scale-95">5m Short</button>
                    <button onclick="setQuickDuration(10)" class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${customBreakTime === 10 ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} transition active:scale-95">10m Mid</button>
                    <button onclick="setQuickDuration(15)" class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${customBreakTime === 15 ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'} transition active:scale-95">15m Long</button>
                `}
            </div>

            <!-- Circular Progress Timer Ring -->
            <div class="relative flex justify-center items-center mb-6">
                <svg class="transform -rotate-90 w-60 h-60">
                    <circle cx="120" cy="120" r="102" stroke="currentColor" stroke-width="10" fill="transparent" class="text-slate-100 dark:text-white/[0.05]" />
                    <circle id="pomo-ring" cx="120" cy="120" r="102" stroke="${ringColor}" stroke-width="10" fill="transparent" 
                        stroke-dasharray="640.88" stroke-dashoffset="0" stroke-linecap="round" 
                        class="transition-all duration-1000 ease-linear drop-shadow-md" />
                </svg>
                
                <div class="absolute flex flex-col items-center justify-center transform active:scale-95 transition cursor-pointer" onclick="editPomodoroTime()" title="Tap to custom edit">
                    <div class="text-5xl font-black tracking-tight text-slate-900 dark:text-white font-mono" id="pomo-time-text">
                        --:--
                    </div>
                    <div class="flex items-center gap-1 mt-2 text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Custom Time
                    </div>
                </div>
            </div>

            <!-- Controls -->
            <div class="flex gap-3 w-full max-w-xs">
                <button id="pomo-toggle-btn" onclick="togglePomodoro()" class="btn flex-1">
                    ${isPomoRunning ? 'Pause' : 'Start Focus'}
                </button>
                <button onclick="resetPomodoro()" class="btn-secondary px-3.5 py-3" title="Reset">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

// ================= TIMER CONTROLS =================
function setPomoMode(mode) {
    if (isPomoRunning) togglePomodoro();
    pomoMode = mode;
    pomoTimeLeft = (mode === 'study' ? customStudyTime : customBreakTime) * 60;
    render();
}

function setQuickDuration(mins) {
    if (isPomoRunning) togglePomodoro();
    if (pomoMode === 'study') {
        customStudyTime = mins;
        localStorage.setItem("pomoStudyTime", mins);
    } else {
        customBreakTime = mins;
        localStorage.setItem("pomoBreakTime", mins);
    }
    pomoTimeLeft = mins * 60;
    triggerHaptic(15);
    render();
}

function togglePomodoro() {
    triggerHaptic(20);
    if (isPomoRunning) {
        clearInterval(pomoInterval);
        isPomoRunning = false;
        let btn = document.getElementById('pomo-toggle-btn');
        if (btn) btn.innerText = "Resume";
    } else {
        isPomoRunning = true;
        let btn = document.getElementById('pomo-toggle-btn');
        if (btn) btn.innerText = "Pause";
        pomoInterval = setInterval(() => {
            pomoTimeLeft--;
            if (pomoTimeLeft <= 0) {
                clearInterval(pomoInterval);
                isPomoRunning = false;
                playPomodoroAlert();

                pomoMode = pomoMode === 'study' ? 'break' : 'study';
                pomoTimeLeft = (pomoMode === 'study' ? customStudyTime : customBreakTime) * 60;

                if (currentScreen === 'pomodoro') render();
            }
            updatePomodoroUI();
        }, 1000);
    }
}

function resetPomodoro() {
    triggerHaptic(15);
    clearInterval(pomoInterval);
    isPomoRunning = false;
    pomoTimeLeft = (pomoMode === 'study' ? customStudyTime : customBreakTime) * 60;
    let btn = document.getElementById('pomo-toggle-btn');
    if (btn) btn.innerText = "Start Focus";
    updatePomodoroUI();
}

function updatePomodoroUI() {
    let textEl = document.getElementById('pomo-time-text');
    let ringEl = document.getElementById('pomo-ring');
    if (!textEl || !ringEl) return;

    let totalTime = (pomoMode === 'study' ? customStudyTime : customBreakTime) * 60;
    let mins = Math.floor(pomoTimeLeft / 60).toString().padStart(2, '0');
    let secs = (pomoTimeLeft % 60).toString().padStart(2, '0');

    textEl.innerText = `${mins}:${secs}`;

    let circumference = 640.88;
    let offset = circumference - (pomoTimeLeft / totalTime) * circumference;
    ringEl.style.strokeDashoffset = offset;
}

function editPomodoroTime() {
    if (isPomoRunning) togglePomodoro();

    let currentVal = pomoMode === 'study' ? customStudyTime : customBreakTime;
    let modeName = pomoMode === 'study' ? "Study" : "Break";

    showInputModal(
        `Edit ${modeName} Time`,
        `Enter minutes (e.g. 30)`,
        currentVal.toString(),
        "Save Duration",
        (val) => {
            let num = parseInt(val);
            if (!isNaN(num) && num > 0) {
                if (pomoMode === 'study') {
                    customStudyTime = num;
                    localStorage.setItem("pomoStudyTime", num);
                } else {
                    customBreakTime = num;
                    localStorage.setItem("pomoBreakTime", num);
                }
                pomoTimeLeft = num * 60;
                updatePomodoroUI();
                render();
                showToast(`Timer set to ${num} minutes`);
            } else {
                showToast("Please enter a valid number greater than 0");
            }
        }
    );
}

// ================= AUDIO ALARM =================
function playPomodoroAlert() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const playNote = (freq, startTime, duration) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
            gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
            osc.start(ctx.currentTime + startTime);
            osc.stop(ctx.currentTime + startTime + duration);
        };
        playNote(880, 0, 1);
        playNote(1046.5, 0.3, 1.5);
    } catch (e) { console.log("Audio API not supported."); }
}