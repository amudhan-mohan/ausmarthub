// ================= CALCULATOR STATE =================
let calcExpression = "";
let calcResultShown = false;
let calcHistory = safeJSONParse("calcHistory", []);
let calcMemory = 0;
let calcIsRadMode = true;
let calcIs2ndMode = false;
window.calcCursorPos = 0;

// ================= SETTINGS STATE =================
let calcSettings = Object.assign({
    feedback: 'both',      // 'mute' | 'sound' | 'both'
    haptic: 'light',       // 'off' | 'light' | 'medium' | 'strong'
    precision: 'auto',     // 'auto' | '4' | '8'
    showThousands: false,  // thousands separator on result
    keepHistory: true,     // persist history
}, safeJSONParse("calcSettings", {}));

function saveCalcSettings() {
    localStorage.setItem("calcSettings", JSON.stringify(calcSettings));
}

// ================= SOUND ENGINE (Web Audio API) =================
let _audioCtx = null;
function getAudioCtx() {
    if (_audioCtx && _audioCtx.state === 'closed') {
        _audioCtx = null;
    }
    if (!_audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            _audioCtx = new AudioContextClass();
        }
    }
    return _audioCtx;
}

// User-gesture unlock for mobile WebView autoplay policy
function unlockAudioContext() {
    try {
        const ctx = getAudioCtx();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
    } catch (e) {}
}

if (typeof window !== "undefined") {
    ['pointerdown', 'touchstart', 'click'].forEach(evt => {
        window.addEventListener(evt, unlockAudioContext, { passive: true });
    });
}

function playCalcTone(type) {
    try {
        const ctx = getAudioCtx();
        if (!ctx) return;

        const play = () => {
            try {
                if (ctx.state === 'suspended') return;
                const now = ctx.currentTime;

                if (type === 'eq') {
                    // Two-tone harmonic chime for equals
                    const chimes = [{ f: 920, dur: 0.055, off: 0 }, { f: 1380, dur: 0.095, off: 0.045 }];
                    chimes.forEach(c => {
                        const o = ctx.createOscillator();
                        const g = ctx.createGain();
                        const tStart = now + c.off;
                        o.type = 'sine';
                        o.frequency.setValueAtTime(c.f, tStart);
                        g.gain.setValueAtTime(0.001, tStart);
                        g.gain.linearRampToValueAtTime(0.40, tStart + 0.006);
                        g.gain.linearRampToValueAtTime(0.0001, tStart + c.dur);
                        o.connect(g);
                        g.connect(ctx.destination);
                        o.start(tStart);
                        o.stop(tStart + c.dur + 0.02);
                    });
                    return;
                }

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                const toneMap = {
                    key:   { freq: 1100, dur: 0.045, gain: 0.35, wave: 'sine' },
                    op:    { freq:  820, dur: 0.055, gain: 0.38, wave: 'triangle' },
                    del:   { freq:  480, dur: 0.045, gain: 0.35, wave: 'triangle' },
                    error: { freq:  240, dur: 0.160, gain: 0.45, wave: 'sawtooth' },
                };
                const t = toneMap[type] || toneMap.key;

                osc.type = t.wave;
                osc.frequency.setValueAtTime(t.freq, now);

                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(t.gain, now + 0.006);
                gain.gain.linearRampToValueAtTime(0.0001, now + t.dur);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + t.dur + 0.02);
            } catch (err) {
                console.warn("Audio play error:", err);
            }
        };

        if (ctx.state === 'suspended') {
            ctx.resume().then(play).catch(play);
        } else {
            play();
        }
    } catch (e) {
        console.warn("Sound engine error:", e);
    }
}

function getHapticDuration(type) {
    const mult = { off: 1.0, light: 1.0, medium: 1.6, strong: 2.5 }[calcSettings.haptic] || 1.0;
    const base = { key: 22, op: 30, del: 25, eq: 48, error: [45, 35, 45] }[type] || 22;
    if (Array.isArray(base)) {
        return base.map(v => Math.round(v * mult));
    }
    return Math.round(base * mult);
}

function triggerCalcHaptic(type = 'key') {
    const dur = getHapticDuration(type);
    triggerHaptic(dur);
}

function calcFeedback(type) {
    const f = calcSettings.feedback;
    if (f === 'mute') return;

    if (f === 'sound' || f === 'both') {
        playCalcTone(type);
    }

    if (f === 'both') {
        triggerCalcHaptic(type);
    }
}

function hapticStrength() {
    return { off: 0, light: 22, medium: 35, strong: 55 }[calcSettings.haptic] || 22;
}

// ================= MATH ENGINE =================
function calculatePreview() {
    if (!calcExpression) return null;
    try {
        let expr = calcExpression;

        // Factorial pre-pass
        expr = expr.replace(/([0-9.]+)!/g, (_, n) => {
            let num = parseFloat(n);
            if (!Number.isInteger(num) || num < 0 || num > 170) return "NaN";
            let res = 1;
            for (let i = 2; i <= num; i++) res *= i;
            return res;
        });

        expr = expr
            .replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
            .replace(/π/g, 'Math.PI').replace(/MOD/g, '%')
            .replace(/\^/g, '**').replace(/²/g, '**2').replace(/³/g, '**3');

        if (calcIsRadMode) {
            expr = expr
                .replace(/\basin\(/g, 'Math.asin(').replace(/\bacos\(/g, 'Math.acos(').replace(/\batan\(/g, 'Math.atan(')
                .replace(/\basinh\(/g, 'Math.asinh(').replace(/\bacosh\(/g, 'Math.acosh(').replace(/\batanh\(/g, 'Math.atanh(')
                .replace(/\bsinh\(/g, 'Math.sinh(').replace(/\bcosh\(/g, 'Math.cosh(').replace(/\btanh\(/g, 'Math.tanh(')
                .replace(/\bsin\(/g, 'Math.sin(').replace(/\bcos\(/g, 'Math.cos(').replace(/\btan\(/g, 'Math.tan(');
        } else {
            expr = expr
                .replace(/\basin\(/g, '(x=>Math.asin(x)*180/Math.PI)(').replace(/\bacos\(/g, '(x=>Math.acos(x)*180/Math.PI)(').replace(/\batan\(/g, '(x=>Math.atan(x)*180/Math.PI)(')
                .replace(/\basinh\(/g, 'Math.asinh(').replace(/\bacosh\(/g, 'Math.acosh(').replace(/\batanh\(/g, 'Math.atanh(')
                .replace(/\bsinh\(/g, 'Math.sinh(').replace(/\bcosh\(/g, 'Math.cosh(').replace(/\btanh\(/g, 'Math.tanh(')
                .replace(/\bsin\(/g, '(x=>Math.sin(x*Math.PI/180))(').replace(/\bcos\(/g, '(x=>Math.cos(x*Math.PI/180))(').replace(/\btan\(/g, '(x=>Math.tan(x*Math.PI/180))(');
        }

        expr = expr
            .replace(/\bln\(/g, 'Math.log(')
            .replace(/log2\(/g, 'Math.log2(')
            .replace(/\blog\(/g, 'Math.log10(')
            .replace(/√\(/g, 'Math.sqrt(').replace(/∛\(/g, 'Math.cbrt(')
            .replace(/\bMR\b/g, calcMemory.toString())
            .replace(/(?<![a-zA-Z0-9_.])e(?![a-zA-Z0-9_(])/g, 'Math.E');

        let result = new Function('return ' + expr)();
        if (result === undefined || result === null) return null;
        if (!Number.isFinite(result) || Number.isNaN(result)) return "Error";

        if (Math.abs(result) < 1e-15) return 0;

        if (!Number.isInteger(result)) {
            if (calcSettings.precision === '4') return parseFloat(result.toFixed(4));
            if (calcSettings.precision === '8') return parseFloat(result.toFixed(8));

            // Auto precision: 12 significant digits for high accuracy while eliminating binary jitter
            if (Math.abs(result) >= 1e15 || Math.abs(result) < 1e-9) {
                return parseFloat(result.toPrecision(10));
            }
            result = parseFloat(result.toPrecision(12));
        }
        return result;
    } catch (e) { return null; }
}

// ================= DISPLAY =================
function updatePreviewDisplay() {
    const exprDisplay = document.getElementById("calc-expression");
    const previewDisplay = document.getElementById("calc-preview");
    if (!exprDisplay || !previewDisplay) return;

    let text = calcExpression || "";
    let cursorPos = (window.calcCursorPos !== undefined && window.calcCursorPos !== null)
        ? window.calcCursorPos : text.length;

    // Constrain cursor position strictly within [0, text.length]
    cursorPos = Math.max(0, Math.min(cursorPos, text.length));
    window.calcCursorPos = cursorPos;

    let html = "";

    for (let i = 0; i < text.length; i++) {
        if (i === cursorPos) {
            html += `<span class="calc-cursor"></span>`;
        }
        const ch = text[i] === ' ' ? '&nbsp;' : text[i];
        html += `<span class="calc-char" data-index="${i}" onclick="event.stopPropagation(); setCursorPos(event.offsetX > (this.offsetWidth / 2) ? ${i + 1} : ${i});" style="cursor:pointer;">${ch}</span>`;
    }
    if (cursorPos >= text.length) {
        html += `<span class="calc-cursor"></span>`;
    }
    // Trailing hit area that always places cursor at the end when tapped
    html += `<span class="calc-char-end" onclick="event.stopPropagation(); setCursorPos(${text.length});" style="display:inline-block;width:24px;height:1.2em;cursor:pointer;vertical-align:text-bottom;"></span>`;

    exprDisplay.innerHTML = html;

    // Auto-scroll horizontally if expression exceeds viewport
    requestAnimationFrame(() => {
        const cursorEl = exprDisplay.querySelector('.calc-cursor');
        if (cursorEl) {
            const containerWidth = exprDisplay.clientWidth;
            const scrollWidth = exprDisplay.scrollWidth;
            if (scrollWidth > containerWidth) {
                const cursorLeft = cursorEl.offsetLeft;
                if (cursorLeft < exprDisplay.scrollLeft || cursorLeft > exprDisplay.scrollLeft + containerWidth - 30) {
                    exprDisplay.scrollLeft = Math.max(0, cursorLeft - containerWidth / 2);
                }
            }
        }
    });

    const preview = calculatePreview();
    const previewStr = (preview !== null && preview !== undefined) ? preview.toString() : null;

    if (previewStr !== null && previewStr !== calcExpression && preview !== "Error") {
        try {
            let num = parseFloat(previewStr);
            previewDisplay.textContent = calcSettings.showThousands
                ? num.toLocaleString(undefined, { maximumFractionDigits: 10 })
                : previewStr;
        } catch(e) { previewDisplay.textContent = previewStr; }
        previewDisplay.style.opacity = "1";
    } else {
        previewDisplay.innerHTML = "&nbsp;";
        previewDisplay.style.opacity = "0";
    }
}

// ================= CURSOR COMPUTATION =================
function getCursorIndexFromPoint(clientX) {
    const exprDisplay = document.getElementById("calc-expression");
    if (!exprDisplay) return (calcExpression || "").length;
    const text = calcExpression || "";
    if (!text.length) return 0;

    const charEls = exprDisplay.querySelectorAll('.calc-char[data-index]');
    if (!charEls || charEls.length === 0) return text.length;

    const validChars = [];
    for (let i = 0; i < charEls.length; i++) {
        const idx = parseInt(charEls[i].getAttribute('data-index'), 10);
        if (!isNaN(idx) && idx < text.length) {
            validChars.push({ el: charEls[i], index: idx });
        }
    }

    if (validChars.length === 0) return text.length;

    const firstRect = validChars[0].el.getBoundingClientRect();
    const lastRect = validChars[validChars.length - 1].el.getBoundingClientRect();

    // If tapped to the left of the first character's center -> start (0)
    if (clientX <= firstRect.left + (firstRect.width * 0.45)) {
        return 0;
    }

    // If tapped to the right of the last character's center or anywhere beyond -> end (text.length)
    if (clientX >= lastRect.left + (lastRect.width * 0.5)) {
        return text.length;
    }

    // Check individual characters
    for (let i = 0; i < validChars.length; i++) {
        const rect = validChars[i].el.getBoundingClientRect();
        const midX = rect.left + (rect.width / 2);
        if (clientX <= midX) {
            return validChars[i].index;
        } else if (i === validChars.length - 1 || clientX < validChars[i + 1].el.getBoundingClientRect().left + (validChars[i + 1].el.getBoundingClientRect().width / 2)) {
            return validChars[i].index + 1;
        }
    }

    return text.length;
}

// ================= CURSOR MOVEMENT & POSITION =================
function moveCursor(direction) {
    let text = calcExpression || "";
    let pos = (window.calcCursorPos !== undefined && window.calcCursorPos !== null) ? window.calcCursorPos : text.length;
    if (direction === 'left' && pos > 0) window.calcCursorPos = pos - 1;
    else if (direction === 'right' && pos < text.length) window.calcCursorPos = pos + 1;
    if (calcResultShown) calcResultShown = false;
    updatePreviewDisplay();
}

function setCursorPos(index) {
    let text = calcExpression || "";
    index = Math.max(0, Math.min(index, text.length));
    window.calcCursorPos = index;
    if (calcResultShown) calcResultShown = false;
    updatePreviewDisplay();
}

// ================= TOUCH & DRAG CURSOR INTERACTION =================
let isDraggingCalcCursor = false;

function onCalcDisplayPointerDown(e) {
    const container = e.target.closest('.calc-display-container, #calc-expression');
    if (!container) return;
    if (e.target.closest('button')) return;

    isDraggingCalcCursor = true;
    const newPos = getCursorIndexFromPoint(e.clientX);
    setCursorPos(newPos);

    const cursor = document.querySelector('.calc-cursor');
    if (cursor) cursor.classList.add('dragging');
}

function onCalcDisplayPointerMove(e) {
    if (!isDraggingCalcCursor) return;
    if (e.cancelable && e.pointerType === 'touch') e.preventDefault();

    const newPos = getCursorIndexFromPoint(e.clientX);
    if (newPos !== window.calcCursorPos) {
        setCursorPos(newPos);
        const cursor = document.querySelector('.calc-cursor');
        if (cursor) cursor.classList.add('dragging');
    }
}

function onCalcDisplayPointerUp() {
    if (isDraggingCalcCursor) {
        isDraggingCalcCursor = false;
        const cursor = document.querySelector('.calc-cursor');
        if (cursor) {
            setTimeout(() => {
                if (cursor) cursor.classList.remove('dragging');
            }, 600);
        }
    }
}

document.addEventListener('pointerdown', onCalcDisplayPointerDown);
document.addEventListener('pointermove', onCalcDisplayPointerMove, { passive: false });
document.addEventListener('pointerup', onCalcDisplayPointerUp);
document.addEventListener('pointercancel', onCalcDisplayPointerUp);

// ================= MEMORY =================
function memoryClear()    { calcMemory = 0; triggerHaptic(hapticStrength()); updateMemoryIndicator(); }
function memoryAdd()      { const v = calculatePreview(); if (typeof v === 'number') calcMemory += v; triggerHaptic(hapticStrength()); updateMemoryIndicator(); }
function memorySubtract() { const v = calculatePreview(); if (typeof v === 'number') calcMemory -= v; triggerHaptic(hapticStrength()); updateMemoryIndicator(); }
function memoryRecall()   { insertAtCursor(calcMemory.toString()); updateMemoryIndicator(); }

function updateMemoryIndicator() {
    const el = document.getElementById('mem-indicator');
    if (el) {
        el.textContent = calcMemory !== 0 ? `M: ${calcMemory}` : '';
        el.style.opacity = calcMemory !== 0 ? '1' : '0';
    }
}

// ================= 2ND MODE =================
const sciButtonMap = [
    { id:'sci-sin',  normal:'sin(',  second:'asin(', normalLabel:'sin',   secondLabel:'sin⁻¹' },
    { id:'sci-cos',  normal:'cos(',  second:'acos(', normalLabel:'cos',   secondLabel:'cos⁻¹' },
    { id:'sci-tan',  normal:'tan(',  second:'atan(', normalLabel:'tan',   secondLabel:'tan⁻¹' },
    { id:'sci-sinh', normal:'sinh(', second:'asinh(',normalLabel:'sinh',  secondLabel:'sinh⁻¹'},
    { id:'sci-cosh', normal:'cosh(', second:'acosh(',normalLabel:'cosh',  secondLabel:'cosh⁻¹'},
    { id:'sci-tanh', normal:'tanh(', second:'atanh(',normalLabel:'tanh',  secondLabel:'tanh⁻¹'},
    { id:'sci-log',  normal:'log(',  second:'log2(', normalLabel:'log',   secondLabel:'log₂'  },
    { id:'sci-ln',   normal:'ln(',   second:'2**(', normalLabel:'ln',    secondLabel:'2ˣ'    },
    { id:'sci-sq',   normal:'²',     second:'√(',    normalLabel:'x²',    secondLabel:'²√x'   },
    { id:'sci-cb',   normal:'³',     second:'∛(',    normalLabel:'x³',    secondLabel:'³√x'   },
];

function toggle2ndMode() {
    calcIs2ndMode = !calcIs2ndMode;
    triggerHaptic(hapticStrength());
    sciButtonMap.forEach(({ id, normal, second, normalLabel, secondLabel }) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        if (calcIs2ndMode) { btn.setAttribute('data-val', second); btn.textContent = secondLabel; btn.classList.add('calc-2nd-active'); }
        else               { btn.setAttribute('data-val', normal);  btn.textContent = normalLabel;  btn.classList.remove('calc-2nd-active'); }
    });
    const btn2nd = document.getElementById('sci-2nd');
    if (btn2nd) btn2nd.classList.toggle('calc-2nd-active', calcIs2ndMode);
}

function toggleRadDeg() {
    calcIsRadMode = !calcIsRadMode;
    triggerHaptic(hapticStrength());
    const btn = document.getElementById('sci-rad');
    if (btn) btn.textContent = calcIsRadMode ? 'Rad' : 'Deg';
    updatePreviewDisplay();
}

// ================= INSERT HELPER =================
function insertAtCursor(val) {
    let pos = (window.calcCursorPos !== undefined && window.calcCursorPos !== null) ? window.calcCursorPos : calcExpression.length;
    calcExpression = calcExpression.slice(0, pos) + val + calcExpression.slice(pos);
    window.calcCursorPos = pos + val.length;
}

// ================= MAIN INPUT =================
function handleCalcInput(val) {
    unlockAudioContext();
    if (!document.getElementById("calc-expression")) return;

    // Determine feedback tone type
    const isNum  = /^[0-9.]$/.test(val);
    const isOp   = ['×','÷','+','-','%','(',')','!','^'].includes(val);
    const isEq   = val === '=';
    const isDel  = val === 'DEL' || val === 'AC';
    const toneType = isEq ? 'eq' : isDel ? 'del' : isOp ? 'op' : 'key';
    calcFeedback(toneType);

    let pos = (window.calcCursorPos !== undefined && window.calcCursorPos !== null) ? window.calcCursorPos : calcExpression.length;

    if (calcResultShown && calcExpression === "Error" && val !== "AC" && val !== "DEL" && val !== "=") {
        calcExpression = ""; pos = 0; window.calcCursorPos = 0; calcResultShown = false;
    }

    if (val === "AC")  { calcExpression = ""; calcResultShown = false; window.calcCursorPos = 0; updatePreviewDisplay(); return; }

    if (val === "DEL") {
        if (calcResultShown) { calcExpression = ""; calcResultShown = false; window.calcCursorPos = 0; }
        else if (pos > 0)    { calcExpression = calcExpression.slice(0, pos - 1) + calcExpression.slice(pos); window.calcCursorPos = pos - 1; }
        updatePreviewDisplay(); return;
    }

    if (val === "=") {
        const preview = calculatePreview();
        if (preview !== null) {
            const original = calcExpression;
            if (preview === "Error") { calcFeedback('error'); }
            calcExpression = preview.toString();
            calcResultShown = true;
            window.calcCursorPos = calcExpression.length;
            if (preview !== "Error" && original !== calcExpression && calcSettings.keepHistory) {
                let displayExpr = original.replace(/\*/g, '×').replace(/\b\/\b/g, '÷');
                if (!calcHistory.length || calcHistory[0].expression !== displayExpr) {
                    calcHistory.unshift({ expression: displayExpr, result: preview });
                    if (calcHistory.length > 30) calcHistory.pop();
                    localStorage.setItem("calcHistory", JSON.stringify(calcHistory));
                    renderCalcHistory();
                }
            }
        }
        updatePreviewDisplay(); return;
    }

    if (val === "mc") { memoryClear(); return; }
    if (val === "m+") { memoryAdd(); return; }
    if (val === "m-") { memorySubtract(); return; }
    if (val === "mr") { memoryRecall(); updatePreviewDisplay(); return; }
    if (val === "2nd")  { toggle2ndMode(); return; }
    if (val === "Rad")  { toggleRadDeg();  return; }

    if (val === "Rand") {
        const rand = Math.random().toFixed(8);
        if (calcResultShown) { calcExpression = rand; calcResultShown = false; window.calcCursorPos = rand.length; }
        else insertAtCursor(rand);
        updatePreviewDisplay(); return;
    }

    if (val === "%") {
        if (calcResultShown) {
            const num = parseFloat(calcExpression);
            if (!isNaN(num)) { calcExpression = (num / 100).toString(); window.calcCursorPos = calcExpression.length; updatePreviewDisplay(); return; }
        }
        insertAtCursor('/100'); updatePreviewDisplay(); return;
    }

    if (val === "e^")    { insertAtCursor("e^("); updatePreviewDisplay(); return; }
    if (val === "10^")   { insertAtCursor("10^("); updatePreviewDisplay(); return; }
    if (val === "1÷")    {
        if (calcResultShown && calcExpression) { calcExpression = "1÷(" + calcExpression + ")"; window.calcCursorPos = calcExpression.length; calcResultShown = false; }
        else insertAtCursor("1÷(");
        updatePreviewDisplay(); return;
    }
    if (val === "^(1÷(") { insertAtCursor("^(1÷("); updatePreviewDisplay(); return; }
    if (val === "E")     { insertAtCursor("×10^("); updatePreviewDisplay(); return; }

    if (calcResultShown) {
        if (/^[0-9.]$/.test(val)) { calcExpression = val; calcResultShown = false; window.calcCursorPos = 1; }
        else { calcResultShown = false; insertAtCursor(val); }
        updatePreviewDisplay(); return;
    }

    insertAtCursor(val);
    updatePreviewDisplay();
}

// ================= HISTORY =================
function renderCalcHistory() {
    const container = document.getElementById("calc-history-container");
    if (!container) return;
    if (!calcHistory.length) {
        container.innerHTML = `<div class="text-center text-sm text-slate-400 dark:text-slate-500 py-6 font-medium">No history yet</div>`;
        return;
    }
    container.innerHTML = calcHistory.map((item, index) => `
        <div class="flex items-center justify-between bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl border border-slate-100 dark:border-white/5 transition active:scale-[0.99]">
            <div class="text-left cursor-pointer flex-1 pl-1" onclick="useHistoryValue('${item.result}')">
                <div class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">${item.expression} =</div>
                <div class="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">${item.result}</div>
            </div>
            <button onclick="event.stopPropagation();deleteHistoryItem(${index})" class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition" title="Delete">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
            </button>
        </div>
    `).join('');
}

function clearCalcHistory() {
    showConfirm("Clear History?", "Are you sure you want to clear all calculation history?", "Clear All", () => {
        calcHistory = [];
        localStorage.removeItem("calcHistory");
        renderCalcHistory();
    });
}
function deleteHistoryItem(index) {
    calcHistory.splice(index, 1);
    localStorage.setItem("calcHistory", JSON.stringify(calcHistory));
    renderCalcHistory();
}
function useHistoryValue(val) {
    calcExpression = val.toString();
    calcResultShown = true;
    window.calcCursorPos = calcExpression.length;
    updatePreviewDisplay();
}

// ================= SETTINGS PANEL =================
function openCalcSettings() {
    const overlay = document.getElementById('calc-settings-overlay');
    if (overlay) { overlay.classList.add('active'); return; }

    const el = document.createElement('div');
    el.id = 'calc-settings-overlay';
    el.className = 'calc-settings-overlay';
    el.innerHTML = `
        <div class="calc-settings-backdrop" onclick="closeCalcSettings()"></div>
        <div class="calc-settings-sheet">
            <div class="calc-settings-handle"></div>

            <div class="calc-settings-header">
                <div class="flex items-center gap-2">
                    <div class="calc-settings-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"/></svg>
                    </div>
                    <div>
                        <h2 class="calc-settings-title">Calculator Settings</h2>
                        <p class="calc-settings-version">Quick Calc Pro · v${window.APP_VERSION || "1.0.18"}</p>
                    </div>
                </div>
                <button onclick="closeCalcSettings()" class="calc-settings-close" aria-label="Close Settings">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>

            <!-- Key Feedback -->
            <div class="calc-settings-section">
                <div class="calc-settings-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                    Key Feedback
                </div>
                <div class="calc-settings-tabs" id="s-feedback">
                    <button class="calc-stab ${calcSettings.feedback==='mute'?'active':''}" onclick="setCalcSetting('feedback','mute')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                        <span>Mute</span>
                    </button>
                    <button class="calc-stab ${calcSettings.feedback==='sound'?'active':''}" onclick="setCalcSetting('feedback','sound')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                        <span>Sound</span>
                    </button>
                    <button class="calc-stab ${calcSettings.feedback==='both'?'active':''}" onclick="setCalcSetting('feedback','both')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19 5v14M22 8v8"/></svg>
                        <span>Sound+Vib</span>
                    </button>
                </div>
                <p class="calc-settings-hint">Select Sound or Sound+Vib to hear a tone on each keypress.</p>
            </div>

            <!-- Haptic Strength -->
            <div class="calc-settings-section">
                <div class="calc-settings-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 2v4M15.5 2v4M8.5 18v4M15.5 18v4M2 8.5h4M2 15.5h4M18 8.5h4M18 15.5h4"/><rect x="7" y="7" width="10" height="10" rx="2"/></svg>
                    Haptic Intensity
                </div>
                <div class="calc-settings-tabs" id="s-haptic">
                    <button class="calc-stab ${calcSettings.haptic==='off'?'active':''}"    onclick="setCalcSetting('haptic','off')">Off</button>
                    <button class="calc-stab ${calcSettings.haptic==='light'?'active':''}"  onclick="setCalcSetting('haptic','light')">Light</button>
                    <button class="calc-stab ${calcSettings.haptic==='medium'?'active':''}" onclick="setCalcSetting('haptic','medium')">Medium</button>
                    <button class="calc-stab ${calcSettings.haptic==='strong'?'active':''}" onclick="setCalcSetting('haptic','strong')">Strong</button>
                </div>
            </div>

            <!-- Angle Mode -->
            <div class="calc-settings-section">
                <div class="calc-settings-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg>
                    Angle Mode
                </div>
                <div class="calc-settings-tabs">
                    <button class="calc-stab ${calcIsRadMode?'active':''}"  onclick="if(!calcIsRadMode)toggleRadDeg();updateSettingsUI();">Radians</button>
                    <button class="calc-stab ${!calcIsRadMode?'active':''}" onclick="if(calcIsRadMode)toggleRadDeg();updateSettingsUI();">Degrees</button>
                </div>
                <p class="calc-settings-hint">Affects sin, cos, tan and inverse trig functions.</p>
            </div>

            <!-- Decimal Precision -->
            <div class="calc-settings-section">
                <div class="calc-settings-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Result Precision
                </div>
                <div class="calc-settings-tabs" id="s-precision">
                    <button class="calc-stab ${calcSettings.precision==='auto'?'active':''}" onclick="setCalcSetting('precision','auto')">Auto</button>
                    <button class="calc-stab ${calcSettings.precision==='4'?'active':''}"    onclick="setCalcSetting('precision','4')">4 digits</button>
                    <button class="calc-stab ${calcSettings.precision==='8'?'active':''}"    onclick="setCalcSetting('precision','8')">8 digits</button>
                </div>
            </div>

            <!-- Thousands Separator -->
            <div class="calc-settings-section">
                <div class="calc-settings-row">
                    <div>
                        <div class="calc-settings-label" style="margin-bottom:0;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                            Thousands Separator
                        </div>
                        <p class="calc-settings-hint" style="margin-top:2px;">Show 1,000,000 instead of 1000000</p>
                    </div>
                    <label class="calc-toggle">
                        <input type="checkbox" id="toggle-thousands" ${calcSettings.showThousands?'checked':''} onchange="setCalcSetting('showThousands',this.checked)">
                        <span class="calc-toggle-slider"></span>
                    </label>
                </div>
            </div>

            <!-- Keep History -->
            <div class="calc-settings-section">
                <div class="calc-settings-row">
                    <div>
                        <div class="calc-settings-label" style="margin-bottom:0;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Save History
                        </div>
                        <p class="calc-settings-hint" style="margin-top:2px;">Persist calculation history across sessions</p>
                    </div>
                    <label class="calc-toggle">
                        <input type="checkbox" id="toggle-history" ${calcSettings.keepHistory?'checked':''} onchange="setCalcSetting('keepHistory',this.checked)">
                        <span class="calc-toggle-slider"></span>
                    </label>
                </div>
            </div>

            <!-- Version Info Card with AU Smart Hub Logo Image -->
            <div class="calc-settings-version-card">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md border border-white/20 overflow-hidden">
                        <img src="img/au_smart_hub.png" alt="AU Smart Hub Logo" class="w-full h-full object-contain rounded-lg">
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-1">
                            <h4 class="font-extrabold text-sm text-white tracking-tight">Quick Calc Pro</h4>
                            <span class="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/35 shrink-0">
                                v${window.APP_VERSION || "1.0.18"}
                            </span>
                        </div>
                        <p class="text-xs text-sky-200 mt-0.5 font-medium">AU Smart Hub · Academic Suite</p>
                    </div>
                </div>
                <div class="calc-settings-features mt-3">
                    <span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Scientific 50-Key
                    </span>
                    <span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Memory Stack
                    </span>
                    <span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Math History
                    </span>
                    <span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        2nd Functions
                    </span>
                    <span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Rad / Deg
                    </span>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(el);
    // Animate in
    requestAnimationFrame(() => el.classList.add('active'));
}

function closeCalcSettings() {
    const el = document.getElementById('calc-settings-overlay');
    if (el) {
        el.classList.remove('active');
        setTimeout(() => el.remove(), 320);
    }
}

function setCalcSetting(key, val) {
    calcSettings[key] = val;
    saveCalcSettings();
    updateSettingsUI();
    if (key === 'feedback') {
        if (val !== 'mute') {
            unlockAudioContext();
            playCalcTone('key');
        }
        if (val === 'both') {
            triggerCalcHaptic('key');
        }
    } else if (key === 'haptic') {
        if (val !== 'off') {
            triggerCalcHaptic('key');
        }
    } else {
        triggerCalcHaptic('key');
    }
}

function updateSettingsUI() {
    // Refresh all tab active states in the settings panel
    const maps = {
        's-feedback':  { key: 'feedback',  vals: ['mute','sound','both'] },
        's-haptic':    { key: 'haptic',    vals: ['off','light','medium','strong'] },
        's-precision': { key: 'precision', vals: ['auto','4','8'] },
    };
    Object.entries(maps).forEach(([id, { key, vals }]) => {
        const section = document.getElementById(id);
        if (!section) return;
        section.querySelectorAll('.calc-stab').forEach((btn, i) => {
            btn.classList.toggle('active', calcSettings[key] === vals[i]);
        });
    });
    // toggles
    const th = document.getElementById('toggle-thousands');
    if (th) th.checked = calcSettings.showThousands;
    const kh = document.getElementById('toggle-history');
    if (kh) kh.checked = calcSettings.keepHistory;
}

// ================= QUICK CALC =================
function renderCalculator() {
    calcExpression = "";
    calcResultShown = false;
    window.calcCursorPos = 0;
    setTimeout(() => renderCalcHistory(), 50);

    return `
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                    <svg width="20" height="20" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="31.8" cy="32" r="30"/>
                        <path d="M28,22c0,1.1-0.9,2-2,2H14c-1.1,0-2-0.9-2-2c0-1.1,0.9-2,2-2h12C27.1,20,28,20.9,28,22z"/>
                        <path d="M52,22c0,1.1-0.9,2-2,2H38c-1.1,0-2-0.9-2-2c0-1.1,0.9-2,2-2h12C51.1,20,52,20.9,52,22z"/>
                        <path d="M20,30c-1.1,0-2-0.9-2-2V16c0-1.1,0.9-2,2-2c1.1,0,2,0.9,2,2v12C22,29.1,21.1,30,20,30z"/>
                        <path d="M52,43c0,1.1-0.9,2-2,2H38c-1.1,0-2-0.9-2-2c0-1.1,0.9-2,2-2h12C51.1,41,52,41.9,52,43z"/>
                        <path d="M26.8,50.8c-0.8,0.8-2,0.8-2.8,0L13.2,40c-0.8-0.8-0.8-2,0-2.8c0.8-0.8,2-0.8,2.8,0L26.8,48C27.6,48.8,27.6,50,26.8,50.8z"/>
                        <path d="M13.2,50.8c-0.8-0.8-0.8-2,0-2.8L24,37.2c0.8-0.8,2-0.8,2.8,0c0.8,0.8,0.8,2,0,2.8L16,50.8C15.2,51.6,14,51.6,13.2,50.8z"/>
                    </svg>
                </div>
                <h1 class="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Quick Calc</h1>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="openCalcSettings()" class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 flex items-center justify-center active:scale-90 transition" title="Settings">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </button>
                <button onclick="navigate('scientific-calc')" class="px-3 py-1.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/15 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    Scientific
                </button>
            </div>
        </div>

        <div class="calc-card-main mb-4">
            <div class="calc-display-container">
                <div id="calc-expression" class="calc-display-text"><span class="calc-cursor"></span></div>
                <div id="calc-preview" class="calc-preview-text" style="opacity:0;">&nbsp;</div>
            </div>
            <div class="calc-grid">
                <button onclick="handleCalcInput('AC')"  class="calc-btn calc-col-2 calc-del">AC</button>
                <button onclick="handleCalcInput('DEL')" class="calc-btn calc-del" aria-label="Delete">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                        <line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/>
                    </svg>
                </button>
                <button onclick="handleCalcInput('÷')" class="calc-btn calc-op">÷</button>
                <button onclick="handleCalcInput('7')" class="calc-btn calc-num">7</button>
                <button onclick="handleCalcInput('8')" class="calc-btn calc-num">8</button>
                <button onclick="handleCalcInput('9')" class="calc-btn calc-num">9</button>
                <button onclick="handleCalcInput('×')" class="calc-btn calc-op">×</button>
                <button onclick="handleCalcInput('4')" class="calc-btn calc-num">4</button>
                <button onclick="handleCalcInput('5')" class="calc-btn calc-num">5</button>
                <button onclick="handleCalcInput('6')" class="calc-btn calc-num">6</button>
                <button onclick="handleCalcInput('-')" class="calc-btn calc-op">−</button>
                <button onclick="handleCalcInput('1')" class="calc-btn calc-num">1</button>
                <button onclick="handleCalcInput('2')" class="calc-btn calc-num">2</button>
                <button onclick="handleCalcInput('3')" class="calc-btn calc-num">3</button>
                <button onclick="handleCalcInput('+')" class="calc-btn calc-op">+</button>
                <button onclick="handleCalcInput('%')" class="calc-btn calc-top">%</button>
                <button onclick="handleCalcInput('0')" class="calc-btn calc-num">0</button>
                <button onclick="handleCalcInput('.')" class="calc-btn calc-num">.</button>
                <button onclick="handleCalcInput('=')" class="calc-btn calc-eq">=</button>
            </div>
        </div>

        <div class="calc-card-main">
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-bold text-sm flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    History
                </h3>
                <button onclick="clearCalcHistory()" class="text-xs font-semibold text-red-500 hover:text-red-600 transition">Clear All</button>
            </div>
            <div id="calc-history-container" class="max-h-44 overflow-y-auto space-y-2 pr-1 custom-scrollbar"></div>
        </div>
    `;
}

// ================= SCIENTIFIC CALC =================
function renderScientificCalc() {
    calcExpression = "";
    calcResultShown = false;
    calcIs2ndMode = false;
    window.calcCursorPos = 0;

    return `
    <div class="sci-fullscreen-container flex flex-col justify-between h-full">
        <div class="flex items-center justify-between px-3 py-1.5 bg-slate-900/40 rounded-xl mb-2 backdrop-blur-md">
            <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-xs font-bold text-slate-200 uppercase tracking-wider">Scientific Calculator</span>
                <span id="mem-indicator" class="text-[10px] font-bold text-amber-300 ml-1" style="opacity:0;transition:opacity 0.2s;"></span>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="openCalcSettings()" class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 active:scale-90 transition text-xs border border-white/10" title="Settings">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </button>
                <button onclick="goBack()" class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 active:scale-95 transition text-xs font-bold border border-rose-500/30">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Exit
                </button>
            </div>
        </div>

        <div class="calc-display-container" style="margin-bottom:0.5rem;padding:0.5rem 1rem;min-height:5.5rem;">
            <div id="calc-expression" class="calc-display-text" style="font-size:1.7rem;"><span class="calc-cursor"></span></div>
            <div id="calc-preview" class="calc-preview-text" style="opacity:0;">&nbsp;</div>
        </div>

        <div class="sci-ios-grid flex-1">
            <!-- Row 1 -->
            <button onclick="handleCalcInput('(')"  class="calc-btn calc-sci">(</button>
            <button onclick="handleCalcInput(')')"  class="calc-btn calc-sci">)</button>
            <button onclick="handleCalcInput('mc')" class="calc-btn calc-sci">mc</button>
            <button onclick="handleCalcInput('m+')" class="calc-btn calc-sci">m+</button>
            <button onclick="handleCalcInput('m-')" class="calc-btn calc-sci">m−</button>
            <button onclick="handleCalcInput('mr')" class="calc-btn calc-sci">mr</button>
            <button onclick="handleCalcInput('AC')" class="calc-btn calc-del">AC</button>
            <button onclick="handleCalcInput('DEL')" class="calc-btn calc-del" aria-label="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                    <line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/>
                </svg>
            </button>
            <button onclick="handleCalcInput('%')"  class="calc-btn calc-top">%</button>
            <button onclick="handleCalcInput('÷')"  class="calc-btn calc-op">÷</button>

            <!-- Row 2 -->
            <button id="sci-2nd" onclick="handleCalcInput('2nd')" class="calc-btn calc-sci">2nd</button>
            <button id="sci-sq"  onclick="handleCalcInput(this.getAttribute('data-val'))" data-val="²"   class="calc-btn calc-sci">x²</button>
            <button id="sci-cb"  onclick="handleCalcInput(this.getAttribute('data-val'))" data-val="³"   class="calc-btn calc-sci">x³</button>
            <button onclick="handleCalcInput('^')"   class="calc-btn calc-sci">xʸ</button>
            <button onclick="handleCalcInput('e^')"  class="calc-btn calc-sci">eˣ</button>
            <button onclick="handleCalcInput('10^')" class="calc-btn calc-sci">10ˣ</button>
            <button onclick="handleCalcInput('7')"   class="calc-btn calc-num">7</button>
            <button onclick="handleCalcInput('8')"   class="calc-btn calc-num">8</button>
            <button onclick="handleCalcInput('9')"   class="calc-btn calc-num">9</button>
            <button onclick="handleCalcInput('×')"   class="calc-btn calc-op">×</button>

            <!-- Row 3 -->
            <button onclick="handleCalcInput('1÷')"    class="calc-btn calc-sci">¹/x</button>
            <button onclick="handleCalcInput('√(')"    class="calc-btn calc-sci">²√x</button>
            <button onclick="handleCalcInput('∛(')"    class="calc-btn calc-sci">³√x</button>
            <button onclick="handleCalcInput('^(1÷(')" class="calc-btn calc-sci">ʸ√x</button>
            <button id="sci-ln"  onclick="handleCalcInput(this.getAttribute('data-val'))" data-val="ln("  class="calc-btn calc-sci">ln</button>
            <button id="sci-log" onclick="handleCalcInput(this.getAttribute('data-val'))" data-val="log(" class="calc-btn calc-sci">log</button>
            <button onclick="handleCalcInput('4')" class="calc-btn calc-num">4</button>
            <button onclick="handleCalcInput('5')" class="calc-btn calc-num">5</button>
            <button onclick="handleCalcInput('6')" class="calc-btn calc-num">6</button>
            <button onclick="handleCalcInput('-')" class="calc-btn calc-op">−</button>

            <!-- Row 4 -->
            <button onclick="handleCalcInput('!')"   class="calc-btn calc-sci">x!</button>
            <button id="sci-sin" onclick="handleCalcInput(this.getAttribute('data-val'))" data-val="sin(" class="calc-btn calc-sci">sin</button>
            <button id="sci-cos" onclick="handleCalcInput(this.getAttribute('data-val'))" data-val="cos(" class="calc-btn calc-sci">cos</button>
            <button id="sci-tan" onclick="handleCalcInput(this.getAttribute('data-val'))" data-val="tan(" class="calc-btn calc-sci">tan</button>
            <button onclick="handleCalcInput('e')"   class="calc-btn calc-sci">e</button>
            <button onclick="handleCalcInput('E')"   class="calc-btn calc-sci">EE</button>
            <button onclick="handleCalcInput('1')"   class="calc-btn calc-num">1</button>
            <button onclick="handleCalcInput('2')"   class="calc-btn calc-num">2</button>
            <button onclick="handleCalcInput('3')"   class="calc-btn calc-num">3</button>
            <button onclick="handleCalcInput('+')"   class="calc-btn calc-op">+</button>

            <!-- Row 5 -->
            <button id="sci-rad"  onclick="handleCalcInput('Rad')" class="calc-btn calc-sci">Rad</button>
            <button id="sci-sinh" onclick="handleCalcInput(this.getAttribute('data-val'))" data-val="sinh(" class="calc-btn calc-sci">sinh</button>
            <button id="sci-cosh" onclick="handleCalcInput(this.getAttribute('data-val'))" data-val="cosh(" class="calc-btn calc-sci">cosh</button>
            <button id="sci-tanh" onclick="handleCalcInput(this.getAttribute('data-val'))" data-val="tanh(" class="calc-btn calc-sci">tanh</button>
            <button onclick="handleCalcInput('π')"    class="calc-btn calc-sci">π</button>
            <button onclick="handleCalcInput('Rand')" class="calc-btn calc-sci">Rand</button>
            <button onclick="handleCalcInput('0')"  class="calc-btn calc-num calc-zero" style="grid-column:span 2;">0</button>
            <button onclick="handleCalcInput('.')"  class="calc-btn calc-num">.</button>
            <button onclick="handleCalcInput('=')"  class="calc-btn calc-eq">=</button>
        </div>
    </div>
    `;
}
