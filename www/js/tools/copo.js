// ================= CO-PO STATE =================
let isMaxEdit = false;
let copoData = {
    mid1: [{ max: 20, val: 0 }, { max: 20, val: 0 }],
    mid2: [{ max: 19, val: 0 }, { max: 16, val: 0 }, { max: 5, val: 0 }]
};

let copoMode = "input";
let currentCopo = "mid1";
let copoTab = 'input'; // Automatically start on the 'input' tab

function switchCopoTab(tab) {
    copoTab = tab;
    render(); // Tell the app to redraw the screen with the new active tab
}

// ================= RENDERERS =================
function renderCOPO() {
    return `
        <div class="flex items-center justify-between mb-5 mt-2">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-blue-600 dark:text-blue-400">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <path d="M12 22V12M9 10.5L12 9l3 1.5"/>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">CO-PO Calculator</h1>
            </div>
            <div class="flex p-1 bg-gray-100/50 dark:bg-black/20 rounded-2xl backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-inner">
                <button onclick="copoMode='input'" class="px-3 py-1 rounded-xl text-sm font-bold transition-all duration-200 ${copoMode === 'input' ? 'bg-white dark:bg-[#1e293b] text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-gray-700' : 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}">
                    Input
                </button>
                <button onclick="copoMode='output'" class="px-3 py-1 rounded-xl text-sm font-bold transition-all duration-200 ${copoMode === 'output' ? 'bg-white dark:bg-[#1e293b] text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-gray-700' : 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}">
                    Analyze
                </button>
            </div>
        </div>

        <div class="flex gap-3 mb-5">
            <button onclick="switchCopo('mid1')" 
                class="flex-1 btn ${currentCopo === 'mid1' ? '' : 'btn-secondary'}">
                Mid 1
            </button>
            <button onclick="switchCopo('mid2')" 
                class="flex-1 btn ${currentCopo === 'mid2' ? '' : 'btn-secondary'}">
                Mid 2
            </button>
        </div>

        ${copoMode === "input"
            ? renderCopoInput(currentCopo === "mid1" ? "Midterm -1" : "Midterm -2", currentCopo)
            : renderCopoOutput(currentCopo === "mid1" ? "Midterm -1" : "Midterm -2", currentCopo)
        }
    `;
}

function switchCopo(key) {
    currentCopo = key;
    copoMode = "input";
    render();
}

function renderCopoInput(title, key) {
    let data = copoData[key];
    let totalVal = data.reduce((a, b) => a + b.val, 0);
    let totalMax = data.reduce((a, b) => a + b.max, 0);

    return `
        <div class="card">
            <div class="flex justify-between items-center">
                <h2>${title}</h2>
                <button onclick="toggleMaxEdit()" class="btn-secondary btn text-sm py-1">
                    ${isMaxEdit ? "Save Max" : "Edit Max"}
                </button>
            </div>

            ${data.map((d, i) => `
                <div class="grid grid-cols-3 gap-2 mt-2 items-center">
                    <span>CO ${i + 1}</span>
                    ${isMaxEdit ? `
                        <input type="number" class="input w-20" value="${d.max}" min="1" onfocus="this.select()" oninput="updateMax('${key}',${i},this)">
                    ` : `
                        <span>${d.max}</span>
                    `}
                    <input type="number" class="input w-20" value="${d.val}" data-prev="${d.val}" oninput="validateCopo('${key}',${i},this)">
                    <p id="err-${key}-${i}" class="text-red-400 text-xs hidden col-span-3"></p>
                </div>
            `).join("")}

            <div class="mt-3">
                Total: <span id="total-${key}">${totalVal}/${totalMax}</span>
            </div>

            <div class="flex gap-2 mt-3">
                <button onclick="calculateCopo()" class="btn flex-1">Submit</button>
                <button onclick="clearCopo('${key}')" class="btn-secondary btn flex-1">Clear</button>
            </div>
        </div>
    `;
}

function renderCopoOutput(title, key) {
    let data = copoData[key];
    let totalVal = data.reduce((a, b) => a + b.val, 0);
    let totalMax = data.reduce((a, b) => a + b.max, 0);

    return `
        <div class="card">
            <h2>${title}</h2>

            ${data.map((d, i) => {
                let attain = (d.val / d.max) * 100 || 0;
                let contrib = (d.val / totalVal) * 100 || 0;
                return `
                    <div class="flex justify-between mt-2">
                        <span>CO ${i + 1}</span>
                        <span>${attain.toFixed(2)}%</span>
                        <span>${contrib.toFixed(2)}%</span>
                    </div>
                `;
            }).join("")}

            <div>Total: ${totalVal}/${totalMax}</div>

            <button onclick="copoMode='input'; render()" class="btn mt-3 w-full">Edit</button>
        </div>
    `;
}

// ================= LOGIC AND VALIDATION =================
function updateCopoTotal(key) {
    let data = copoData[key];
    let totalVal = data.reduce((a, b) => a + b.val, 0);
    let totalMax = data.reduce((a, b) => a + b.max, 0);
    let el = document.getElementById(`total-${key}`);
    if (el) {
        el.innerText = `${totalVal}/${totalMax}`;
    }
}

function toggleMaxEdit() {
    isMaxEdit = !isMaxEdit;
    render();
}

function updateMax(key, i, input) {
    let val = Number(input.value);
    let data = copoData[key][i];

    if (isNaN(val) || val <= 0) {
        input.value = data.max;
        return;
    }

    data.max = val;
    if (data.val > val) {
        data.val = val;
    }
    updateCopoTotal(key);
}

function clearCopo(key) {
    let data = copoData[key];
    data.forEach((d, i) => {
        d.val = 0;
    });
    render();
}

function validateCopo(key, i, input) {
    let max = copoData[key][i].max;
    let val = input.value;
    let prev = input.dataset.prev || "";
    let err = document.getElementById(`err-${key}-${i}`);

    if (val === "") {
        input.dataset.prev = "";
        copoData[key][i].val = 0;
        if (err) err.classList.add("hidden");
        input.classList.remove("border-red-500");
        return;
    }

    let num = Number(val);

    if (isNaN(num) || num < 0 || num > max) {
        input.value = prev;
        if (err) {
            err.innerText = num > max ? "Max allowed is " + max : "Invalid value";
            err.classList.remove("hidden");
            setTimeout(() => err.classList.add("hidden"), 3000);
        }
        input.classList.add("border-red-500");
        return;
    }

    input.dataset.prev = val;
    copoData[key][i].val = num;

    if (err) err.classList.add("hidden");
    input.classList.remove("border-red-500");
    updateCopoTotal(key);
}

function calculateCopo() {
    copoMode = "output";
    render();
}