// ================= CALCULATOR STATE =================
let isScientificMode = false;
let calcExpression = "";
let calcResultShown = false;
let calcHistory = safeJSONParse("calcHistory", []);

// ================= LIVE PREVIEW CALCULATION =================
function calculatePreview() {
    if (!calcExpression || calcExpression === "0") return null;

    try {
        let safeMath = calcExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/\be\b/g, 'Math.E')
            .replace(/MOD/g, '%')
            .replace(/asin\(/g, 'Math.asin(')
            .replace(/acos\(/g, 'Math.acos(')
            .replace(/atan\(/g, 'Math.atan(')
            .replace(/sinh\(/g, 'Math.sinh(')
            .replace(/cosh\(/g, 'Math.cosh(')
            .replace(/tanh\(/g, 'Math.tanh(')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/√\(/g, 'Math.sqrt(')
            .replace(/∛\(/g, 'Math.cbrt(')
            .replace(/\^/g, '**')
            .replace(/²/g, '**2')
            .replace(/³/g, '**3')
            .replace(/(\d+)!/g, (match, p1) => {
                let n = parseInt(p1);
                let res = 1;
                for (let i = 2; i <= n; i++) res *= i;
                return res;
            });

        let result = new Function('return ' + safeMath)();

        // 1. Handle Division by Zero and invalid math (e.g., 0/0)
        if (Number.isNaN(result) || !Number.isFinite(result)) {
            return "Error";
        }

        // 3. Boundary & Limit Testing: gracefully handle scientific notation
        if (!Number.isInteger(result)) {
            if (Math.abs(result) >= 1e21 || (Math.abs(result) > 0 && Math.abs(result) < 1e-7)) {
                return Number(result.toPrecision(10)); // Switch to JS native scientific notation
            }
            result = parseFloat(result.toFixed(8));
        }

        return result;
    } catch (e) {
        return null; // Return null for incomplete typing (e.g., "5+") so it waits for completion
    }
}

function updatePreviewDisplay() {
    const exprDisplay = document.getElementById("calc-expression");
    const previewDisplay = document.getElementById("calc-preview");

    if (!exprDisplay || !previewDisplay) return;

    let cursorPos = window.calcCursorPos !== undefined && window.calcCursorPos !== null
        ? window.calcCursorPos
        : calcExpression.length;

    let textToDisplay = calcExpression || "";
    let html = "";

    if (textToDisplay === "") {
        html = `<span class="calc-cursor"></span>`;
    } else {
        html += `<span class="calc-char" data-index="0" onclick="event.stopPropagation(); setCursorPos(0)" style="cursor: pointer; padding: 0 5px;"></span>`;
        if (cursorPos === 0) {
            html += `<span class="calc-cursor"></span>`;
        }

        // Make every character draggable and clickable
        for (let i = 0; i < textToDisplay.length; i++) {
            html += `<span class="calc-char" data-index="${i + 1}" onclick="event.stopPropagation(); setCursorPos(${i + 1})" style="cursor: pointer;">${textToDisplay[i]}</span>`;
            if (i + 1 === cursorPos) {
                html += `<span class="calc-cursor"></span>`;
            }
        }
    }

    exprDisplay.innerHTML = html;

    // Run the live preview
    const preview = calculatePreview();
    if (preview !== null && preview !== undefined && calcExpression !== preview.toString() && preview !== "Error") {
        previewDisplay.textContent = preview.toLocaleString();
        previewDisplay.style.opacity = "1";
    } else {
        previewDisplay.innerHTML = "&nbsp;";
        previewDisplay.style.opacity = "0";
    }
}

// ================= LOGIC =================
function toggleScientificMode() {
    isScientificMode = !isScientificMode;
    let app = document.getElementById("app");
    if (app && currentScreen === "calculator") {
        app.innerHTML = renderCalculator();
    }
}

function moveCursor(direction) {
    let cursorPos = window.calcCursorPos !== undefined && window.calcCursorPos !== null
        ? window.calcCursorPos
        : calcExpression.length;

    if (direction === 'left' && cursorPos > 0) {
        window.calcCursorPos = cursorPos - 1;
    } else if (direction === 'right' && cursorPos < calcExpression.length) {
        window.calcCursorPos = cursorPos + 1;
    }

    // Clear the "Result Shown" state so moving the cursor allows seamless editing 
    // rather than starting a completely new calculation on the next keystroke.
    if (calcResultShown) calcResultShown = false;

    updatePreviewDisplay();
}

function setCursorPos(index) {
    // Ensure the index is within the bounds of the expression
    if (index < 0) index = 0;
    if (index > calcExpression.length) index = calcExpression.length;

    window.calcCursorPos = index;

    // Clear the "Result Shown" state so tapping allows editing without clearing the screen
    if (calcResultShown) calcResultShown = false;

    updatePreviewDisplay();
}

// ================= DRAG TO MOVE CURSOR =================
let isDraggingCursor = false;

// Unified Pointer Events (Replaces separate Mouse and Touch support)
document.addEventListener('pointerdown', (e) => {
    if (e.target.closest('#calc-expression')) {
        isDraggingCursor = true;
        // Optional: Capturing the pointer ensures the event isn't lost if the user drags slightly outside the element
        if (e.target.hasPointerCapture) {
            e.target.setPointerCapture(e.pointerId);
        }
    }
});

document.addEventListener('pointerup', () => isDraggingCursor = false);
document.addEventListener('pointercancel', () => isDraggingCursor = false);

document.addEventListener('pointermove', (e) => {
    if (isDraggingCursor) {
        // Prevent default scrolling only if it's a touch pointer type
        if (e.cancelable && e.pointerType === 'touch') {
            e.preventDefault(); 
        }
        // Pointer events directly provide clientX and clientY for all input types
        handleCursorDrag(e.clientX, e.clientY);
    }
}, { passive: false });

// 3. Position Calculation logic
function handleCursorDrag(x, y) {
    // Check exactly which element the finger/mouse is hovering over
    let el = document.elementFromPoint(x, y);

    if (el) {
        // Look for the closest character span in case of slight overlaps
        let charEl = el.closest('.calc-char');

        if (charEl) {
            let idx = parseInt(charEl.getAttribute('data-index'));

            // Only trigger an update if the cursor actually moved to a new position
            if (!isNaN(idx) && window.calcCursorPos !== idx) {
                setCursorPos(idx);
            }
        }
    }
}

function handleCalcInput(val) {
    const display = document.getElementById("calc-expression");
    if (!display) return;

    let cursorPos = window.calcCursorPos !== undefined && window.calcCursorPos !== null
        ? window.calcCursorPos
        : calcExpression.length;

    // CLEAR ERROR STATE: If the last result was "Error", clear it when they start typing
    if (calcResultShown && calcExpression === "Error" && val !== "AC" && val !== "DEL" && val !== "=") {
        calcExpression = "";
        cursorPos = 0;
        calcResultShown = false;
    }

    if (val === "AC") {
        calcExpression = "";
        calcResultShown = false;
        window.calcCursorPos = 0;
        updatePreviewDisplay();
        return;
    }

    if (val === "DEL") {
        if (calcResultShown) {
            calcExpression = "";
            calcResultShown = false;
            window.calcCursorPos = 0;
        } else {
            if (cursorPos > 0) {
                calcExpression = calcExpression.slice(0, cursorPos - 1) + calcExpression.slice(cursorPos);
                cursorPos--;
            }
            window.calcCursorPos = cursorPos;
        }
        updatePreviewDisplay();
        return;
    }

    if (val === "=") {
        const preview = calculatePreview();
        if (preview !== null) {
            const isError = preview === "Error";

            // 1. CAPTURE THE ORIGINAL EXPRESSION before it gets overwritten
            const originalExpression = calcExpression;

            // 2. Update the state for the main display
            calcExpression = preview.toString();
            calcResultShown = true;
            window.calcCursorPos = calcExpression.length;

            // 3. Save to history using the CAPTURED expression, not the new one
            if (!isError) {
                let formattedExpression = originalExpression.replace(/\*/g, '×').replace(/\//g, '÷');

                // Only save if the expression is different from the result 
                // (prevents saving "36 = 36" if the user just typed "36" and hit =)
                if (originalExpression !== preview.toString()) {
                    if (calcHistory.length === 0 || calcHistory[0].expression !== formattedExpression) {
                        calcHistory.unshift({
                            expression: formattedExpression,
                            result: preview
                        });
                        if (calcHistory.length > 20) calcHistory.pop();
                        localStorage.setItem("calcHistory", JSON.stringify(calcHistory));
                        renderCalcHistory();
                    }
                }
            }
        }
        updatePreviewDisplay();
        return;
    }

    if (calcResultShown && !isNaN(val)) {
        calcExpression = val;
        calcResultShown = false;
        cursorPos = val.length;
    } else {
        if (calcResultShown) calcResultShown = false;
        calcExpression = calcExpression.slice(0, cursorPos) + val + calcExpression.slice(cursorPos);
        cursorPos += val.length;
    }

    window.calcCursorPos = cursorPos;
    updatePreviewDisplay();
}

function renderCalcHistory() {
    const container = document.getElementById("calc-history-container");
    if (!container) return;

    if (calcHistory.length === 0) {
        container.innerHTML = `<div class="text-center text-sm text-gray-400 dark:text-gray-500 py-4">No history yet</div>`;
        return;
    }

    container.innerHTML = calcHistory.map((item, index) => `
        <div class="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-xl transition">            
            <div class="text-left cursor-pointer flex-1 pl-2 active:scale-95 transition" onclick="useHistoryValue('${item.result}')">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">${item.expression.replace(/\*/g, '×').replace(/\//g, '÷')} =</div>
                <div class="font-bold text-gray-800 dark:text-gray-200">${item.result}</div>
            </div>
            <button onclick="event.stopPropagation(); deleteHistoryItem(${index})" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-full transition" title="Delete this calculation">
                <svg width="16" height="16" viewBox="0 0 1024 1024" fill="currentColor" style="color: inherit !important;">
                    <path d="M864 256H736v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zm-504-72h304v72H360v-72zm371.3 656H292.7l-24.2-512h487l-24.2 512z"/>
                </svg>
            </button>
        </div>
    `).join('');
}

function clearCalcHistory() {
    showConfirm(
        "Clear History?",
        "Are you sure you want to clear all of your calculation history?",
        "Clear All",
        () => {
            calcHistory = [];
            localStorage.removeItem("calcHistory");
            renderCalcHistory();
        }
    );
}

function deleteHistoryItem(index) {
    calcHistory.splice(index, 1);
    localStorage.setItem("calcHistory", JSON.stringify(calcHistory));
    renderCalcHistory();
}

function useHistoryValue(val) {
    calcExpression = val.toString();
    calcResultShown = true;
    const display = document.getElementById("calc-expression");
    if (display) {
        display.textContent = calcExpression;
        window.calcCursorPos = calcExpression.length;
    }
}

// ================= RENDERERS =================
function renderCalculator() {
    calcExpression = "";
    calcResultShown = false;

    setTimeout(() => {
        renderCalcHistory();
    }, 50);

    return `
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" class="text-blue-500">
                    <g id="Layer_1">
                        <g><circle class="st0" cx="31.8" cy="32" r="32"/></g>
                        <g><circle cx="44" cy="37" r="2"/></g>
                        <g><circle cx="44" cy="49" r="2"/></g>
                        <g><path d="M28,22c0,1.1-0.9,2-2,2H14c-1.1,0-2-0.9-2-2l0,0c0-1.1,0.9-2,2-2h12C27.1,20,28,20.9,28,22L28,22z"/></g>
                        <g><path d="M52,22c0,1.1-0.9,2-2,2H38c-1.1,0-2-0.9-2-2l0,0c0-1.1,0.9-2,2-2h12C51.1,20,52,20.9,52,22L52,22z"/></g>
                        <g><path d="M20,30c-1.1,0-2-0.9-2-2V16c0-1.1,0.9-2,2-2l0,0c1.1,0,2,0.9,2,2v12C22,29.1,21.1,30,20,30L20,30z"/></g>
                        <g><path d="M52,43c0,1.1-0.9,2-2,2H38c-1.1,0-2-0.9-2-2l0,0c0-1.1,0.9-2,2-2h12C51.1,41,52,41.9,52,43L52,43z"/></g>
                        <g><path d="M26.8,50.8c-0.8,0.8-2,0.8-2.8,0L13.2,40c-0.8-0.8-0.8-2,0-2.8l0,0c0.8-0.8,2-0.8,2.8,0L26.8,48 C27.6,48.8,27.6,50,26.8,50.8L26.8,50.8z"/></g>
                        <g><path d="M13.2,50.8c-0.8-0.8-0.8-2,0-2.8L24,37.2c0.8-0.8,2-0.8,2.8,0l0,0c0.8,0.8,0.8,2,0,2.8L16,50.8 C15.2,51.6,14,51.6,13.2,50.8L13.2,50.8z"/></g>
                    </g>
                    <g id="Layer_2"></g>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Quick Calc</h1>
            </div>
        </div>
        <div class="card p-4 mb-4">
            <!-- Dual Display: Expression Left, Preview Right -->
            <div class="calc-display-container">
                <div id="calc-expression" class="calc-display-text" style="font-size: 1.8rem;">0</div>
                <div id="calc-preview" class="calc-preview-text" style="opacity: 0;">0</div>
            </div>
            <div class="calc-grid">
                <button onclick="handleCalcInput('AC')" class="calc-btn calc-col-2 calc-del">AC</button>
                <button onclick="handleCalcInput('DEL')" class="calc-btn calc-del">⌫</button>
                <button onclick="handleCalcInput('÷')" class="calc-btn calc-op">÷</button>
                <button onclick="handleCalcInput('7')" class="calc-btn calc-num">7</button>
                <button onclick="handleCalcInput('8')" class="calc-btn calc-num">8</button>
                <button onclick="handleCalcInput('9')" class="calc-btn calc-num">9</button>
                <button onclick="handleCalcInput('×')" class="calc-btn calc-op">×</button>
                <button onclick="handleCalcInput('4')" class="calc-btn calc-num">4</button>
                <button onclick="handleCalcInput('5')" class="calc-btn calc-num">5</button>
                <button onclick="handleCalcInput('6')" class="calc-btn calc-num">6</button>
                <button onclick="handleCalcInput('-')" class="calc-btn calc-op">-</button>
                <button onclick="handleCalcInput('1')" class="calc-btn calc-num">1</button>
                <button onclick="handleCalcInput('2')" class="calc-btn calc-num">2</button>
                <button onclick="handleCalcInput('3')" class="calc-btn calc-num">3</button>
                <button onclick="handleCalcInput('+')" class="calc-btn calc-op">+</button>
                <button onclick="handleCalcInput('0')" class="calc-btn calc-col-2 calc-num">0</button>
                <button onclick="handleCalcInput('.')" class="calc-btn calc-num">.</button>
                <button onclick="handleCalcInput('=')" class="calc-btn calc-eq">=</button>
            </div>
        </div>
        <div class="card p-4">
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-bold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    History
                </h3>
                <button onclick="clearCalcHistory()" class="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-2 py-1 rounded transition">Clear All</button>
            </div>
            <div id="calc-history-container" class="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar"></div>
        </div>
    `;
}

function renderScientificCalc() {
    // 1. ADD THESE LINES to completely clear out old data when opening the scientific calc
    calcExpression = "";
    calcResultShown = false;
    window.calcCursorPos = 0;

    // 2. We also remove the hardcoded "0" from the HTML below so it starts truly empty
    return `
    <div class="sci-fullscreen-container">
        <!-- Dual Display: Expression Left, Preview Right -->
        <div class="calc-display-container" style="margin-bottom: 1rem;">
            <div id="calc-expression" class="calc-display-text" style="font-size: 2rem;"><span class="calc-cursor"></span></div>
            <div id="calc-preview" class="calc-preview-text" style="opacity: 0;">&nbsp;</div>
        </div>

        <!-- 10x5 Grid with 3D Quick Calc Styling -->
        <div class="sci-ios-grid">
            <!-- Row 1 -->
            <button onclick="handleCalcInput('(')" class="calc-btn calc-sci">(</button>
            <button onclick="handleCalcInput(')')" class="calc-btn calc-sci">)</button>
            <button onclick="handleCalcInput('mc')" class="calc-btn calc-sci">mc</button>
            <button onclick="handleCalcInput('m+')" class="calc-btn calc-sci">m+</button>
            <button onclick="handleCalcInput('m-')" class="calc-btn calc-sci">m-</button>
            <button onclick="handleCalcInput('mr')" class="calc-btn calc-sci">mr</button>
            <button onclick="handleCalcInput('AC')" class="calc-btn calc-del">AC</button>
            <button onclick="handleCalcInput('DEL')" class="calc-btn calc-del">⌫</button>
            <button onclick="handleCalcInput('%')" class="calc-btn calc-top">%</button>
            <button onclick="handleCalcInput('÷')" class="calc-btn calc-op">÷</button>
            
            <!-- Row 2 -->
            <button onclick="handleCalcInput('2nd')" class="calc-btn calc-sci">2nd</button>
            <button onclick="handleCalcInput('²')" class="calc-btn calc-sci">x²</button>
            <button onclick="handleCalcInput('³')" class="calc-btn calc-sci">x³</button>
            <button onclick="handleCalcInput('^')" class="calc-btn calc-sci">xʸ</button>
            <button onclick="handleCalcInput('e^')" class="calc-btn calc-sci">eˣ</button>
            <button onclick="handleCalcInput('10^')" class="calc-btn calc-sci">10ˣ</button>
            <button onclick="handleCalcInput('7')" class="calc-btn calc-num">7</button>
            <button onclick="handleCalcInput('8')" class="calc-btn calc-num">8</button>
            <button onclick="handleCalcInput('9')" class="calc-btn calc-num">9</button>
            <button onclick="handleCalcInput('×')" class="calc-btn calc-op">×</button>
            
            <!-- Row 3 -->
            <button onclick="handleCalcInput('1÷')" class="calc-btn calc-sci">¹/x</button>
            <button onclick="handleCalcInput('√(')" class="calc-btn calc-sci">²√x</button>
            <button onclick="handleCalcInput('∛(')" class="calc-btn calc-sci">³√x</button>
            <button onclick="handleCalcInput('^(1÷')" class="calc-btn calc-sci">ʸ√x</button>
            <button onclick="handleCalcInput('ln(')" class="calc-btn calc-sci">ln</button>
            <button onclick="handleCalcInput('log(')" class="calc-btn calc-sci">log</button>
            <button onclick="handleCalcInput('4')" class="calc-btn calc-num">4</button>
            <button onclick="handleCalcInput('5')" class="calc-btn calc-num">5</button>
            <button onclick="handleCalcInput('6')" class="calc-btn calc-num">6</button>
            <button onclick="handleCalcInput('-')" class="calc-btn calc-op">−</button>
            
            <!-- Row 4 -->
            <button onclick="handleCalcInput('!')" class="calc-btn calc-sci">x!</button>
            <button onclick="handleCalcInput('sin(')" class="calc-btn calc-sci">sin</button>
            <button onclick="handleCalcInput('cos(')" class="calc-btn calc-sci">cos</button>
            <button onclick="handleCalcInput('tan(')" class="calc-btn calc-sci">tan</button>
            <button onclick="handleCalcInput('e')" class="calc-btn calc-sci">e</button>
            <button onclick="handleCalcInput('E')" class="calc-btn calc-sci">EE</button>
            <button onclick="handleCalcInput('1')" class="calc-btn calc-num">1</button>
            <button onclick="handleCalcInput('2')" class="calc-btn calc-num">2</button>
            <button onclick="handleCalcInput('3')" class="calc-btn calc-num">3</button>
            <button onclick="handleCalcInput('+')" class="calc-btn calc-op">+</button>
            
            <!-- Row 5 -->
            <button onclick="handleCalcInput('Rad')" class="calc-btn calc-sci">Rad</button>
            <button onclick="handleCalcInput('sinh(')" class="calc-btn calc-sci">sinh</button>
            <button onclick="handleCalcInput('cosh(')" class="calc-btn calc-sci">cosh</button>
            <button onclick="handleCalcInput('tanh(')" class="calc-btn calc-sci">tanh</button>
            <button onclick="handleCalcInput('π')" class="calc-btn calc-sci">π</button>
            <button onclick="handleCalcInput('Rand')" class="calc-btn calc-sci">Rand</button>
            <button onclick="handleCalcInput('0')" class="calc-btn calc-num calc-zero" style="grid-column: span 2;">0</button>
            <button onclick="handleCalcInput('.')" class="calc-btn calc-num">.</button>
            <button onclick="handleCalcInput('=')" class="calc-btn calc-eq">=</button>
        </div>
    </div>
    `;
}