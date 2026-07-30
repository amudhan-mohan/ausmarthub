// ================= POMODORO STATE =================
let customStudyTime = safeJSONParse("pomoStudyTime", 25);
let customBreakTime = safeJSONParse("pomoBreakTime", 5);

let pomoMode = "study"; // "study" or "break"
let pomoTimeLeft = customStudyTime * 60;
let pomoInterval = null;
let isPomoRunning = false;

// ================= RENDERER =================
function renderPomodoro() {
    // Trigger immediate UI sync after render
    setTimeout(updatePomodoroUI, 50);

    let ringColor = pomoMode === 'study' ? 'text-blue-600 dark:text-blue-400' : 'text-amber-500 dark:text-amber-400';
    let bgColor = pomoMode === 'study' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';

    return `
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="${ringColor}">
                    <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Focus Timer</h1>
            </div>
            <div class="text-xs px-3 py-1 rounded-full font-medium ${bgColor}" id="pomo-mode-badge">
                ${pomoMode === 'study' ? 'Study Session' : 'Break Time'}
            </div>
        </div>

        <div class="card flex flex-col items-center py-10 relative">
            <div class="flex gap-2 mb-8 p-1 bg-black/5 dark:bg-white/5 rounded-xl">
                <button onclick="setPomoMode('study')" class="px-6 py-2 rounded-lg text-sm font-bold transition-all ${pomoMode === 'study' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}">Study</button>
                <button onclick="setPomoMode('break')" class="px-6 py-2 rounded-lg text-sm font-bold transition-all ${pomoMode === 'break' ? 'bg-white dark:bg-gray-700 shadow-sm text-amber-500 dark:text-amber-400' : 'text-gray-500'}">Break</button>
            </div>

            <div class="relative flex justify-center items-center mb-8">
                <svg class="transform -rotate-90 w-64 h-64">
                    <circle cx="128" cy="128" r="110" stroke="currentColor" stroke-width="12" fill="transparent" class="text-gray-100 dark:text-gray-800/50" />
                    <circle id="pomo-ring" cx="128" cy="128" r="110" stroke="currentColor" stroke-width="12" fill="transparent" 
                        stroke-dasharray="691.15" stroke-dashoffset="0" stroke-linecap="round" 
                        class="${ringColor} transition-all duration-1000 ease-linear" />
                </svg>
                <div class="absolute flex flex-col items-center justify-center transform hover:scale-105 transition cursor-pointer" onclick="editPomodoroTime()" title="Click to edit timer">
                    <div class="text-5xl font-bold text-gray-800 dark:text-white" style="font-family: var(--mono);" id="pomo-time-text">
                        --:--
                    </div>
                    <div class="flex items-center gap-1 mt-1 text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                        Tap to Edit
                    </div>
                </div>
            </div>

            <div class="flex gap-4 w-full px-6">
                <button id="pomo-toggle-btn" onclick="togglePomodoro()" class="flex-1 py-4 rounded-2xl font-bold text-white transition active:scale-95 ${pomoMode === 'study' ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30' : 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/30'}">
                    ${isPomoRunning ? 'Pause' : 'Start'}
                </button>
                <button onclick="resetPomodoro()" class="p-4 rounded-2xl font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition active:scale-95">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

// ================= TIMER CONTROLS =================
function setPomoMode(mode) {
    if (isPomoRunning) togglePomodoro(); // Pause if switching modes
    pomoMode = mode;
    pomoTimeLeft = (mode === 'study' ? customStudyTime : customBreakTime) * 60;
    render(); // Re-render to update theme colors
}

function togglePomodoro() {
    if (isPomoRunning) {
        clearInterval(pomoInterval);
        isPomoRunning = false;
        document.getElementById('pomo-toggle-btn').innerText = "Resume";
    } else {
        isPomoRunning = true;
        document.getElementById('pomo-toggle-btn').innerText = "Pause";
        pomoInterval = setInterval(() => {
            pomoTimeLeft--;
            if (pomoTimeLeft <= 0) {
                clearInterval(pomoInterval);
                isPomoRunning = false;
                playPomodoroAlert();

                // Auto-switch mode using custom times
                pomoMode = pomoMode === 'study' ? 'break' : 'study';
                pomoTimeLeft = (pomoMode === 'study' ? customStudyTime : customBreakTime) * 60;

                if (currentScreen === 'pomodoro') render(); // Refresh colors
            }
            updatePomodoroUI();
        }, 1000);
    }
}

function resetPomodoro() {
    clearInterval(pomoInterval);
    isPomoRunning = false;
    pomoTimeLeft = (pomoMode === 'study' ? customStudyTime : customBreakTime) * 60;
    let btn = document.getElementById('pomo-toggle-btn');
    if (btn) btn.innerText = "Start";
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

    let offset = 691.15 - (pomoTimeLeft / totalTime) * 691.15;
    ringEl.style.strokeDashoffset = offset;
}

function editPomodoroTime() {
    if (isPomoRunning) togglePomodoro();

    let currentVal = pomoMode === 'study' ? customStudyTime : customBreakTime;
    let modeName = pomoMode === 'study' ? "Study" : "Break";

    showInputModal(
        `Edit ${modeName} Time`,
        `Enter minutes (e.g. 38)`,
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
                showToast(`Timer updated to ${num} minutes`);
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
        playNote(880, 0, 1);       // A5 note
        playNote(1046.5, 0.3, 1.5); // C6 note slightly delayed
    } catch (e) { console.log("Audio API not supported on this browser."); }
}