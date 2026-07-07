// ================= GLOBAL STATE =================
let currentScreen = "home";
let historyStack = [];

// Profile Management & Migration
function safeJSONParse(key, fallback) {
    try {
        let item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        return fallback;
    }
}

let existingSemesters = safeJSONParse("semesters", null);
let defaultProfiles = existingSemesters && existingSemesters.length > 0 
    ? [{ id: Date.now().toString(), name: "My Profile", semesters: existingSemesters }] 
    : [];

let profiles = safeJSONParse("cgpa_profiles", defaultProfiles);

let currentProfileIndex = null; // Stays null until a profile is selected
let semesters = [];
let currentSemester = 0;

// CO-PO
let isMaxEdit = false;
let copoData = {
    mid1: [{ max: 20, val: 0 }, { max: 20, val: 0 }],
    mid2: [{ max: 19, val: 0 }, { max: 16, val: 0 }, { max: 5, val: 0 }]
};

let copoMode = "input";
let currentCopo = "mid1";

// QUICK CALCULATOR STATE
let calcExpression = "";
let calcResultShown = false;
let calcHistory = safeJSONParse("calcHistory", []);

// NOTES STATE
let notes = safeJSONParse("smarthub_notes", []);
let currentNoteIndex = null; // Tracks which note is being edited

// Theme
let isDarkMode = localStorage.getItem("theme") === "dark";
let chartInstance = null;

// ================= THEME =================
function applyTheme() {
    const root = document.body;
    if (isDarkMode) {
        root.classList.remove("light");
        root.classList.add("dark");
        const icon = document.getElementById("themeIcon");
        if (icon) icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    } else {
        root.classList.remove("dark");
        root.classList.add("light");
        const icon = document.getElementById("themeIcon");
        if (icon) {
            icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        }
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    render();
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    applyTheme();
}

// ================= NAVIGATION =================
function navigate(screen) {
    if (currentScreen === screen) return;
    historyStack.push(currentScreen);
    currentScreen = screen;
    render();
    updateBackBtn();
}

function goBack() {
    currentScreen = historyStack.pop() || "home";
    render();
    updateBackBtn();
}

function updateBackBtn() {
    let btn = document.getElementById("backBtnWrapper");
    if (!btn) return;
    btn.classList.toggle("invisible", historyStack.length === 0);
}

// ================= EXIT =================
let exitTimer = null;

function exitApp() {
    if (exitTimer) {
        showConfirm(
            "Exit App", 
            "Are you sure you want to exit AU Smart Hub?", 
            "Exit",
            () => {
                if (navigator.app) navigator.app.exitApp();
            }
        );
    } else {
        showToast("Press back again to exit");
        exitTimer = setTimeout(() => exitTimer = null, 2000);
    }
}

function showToast(msg) {
    let t = document.createElement("div");
    t.innerHTML = msg;
    t.className = "toast-message";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
}

// ================= CUSTOM UI CONFIRM MODAL =================
function showConfirm(title, message, confirmText, onConfirm) {
    // Remove any existing modal just in case
    let existing = document.getElementById('custom-confirm-modal');
    if (existing) existing.remove();

    // Create the modal container
    let modal = document.createElement('div');
    modal.id = 'custom-confirm-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-200';
    
    // Inject the UI
    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-6 w-full max-w-sm shadow-2xl transform scale-95 transition-transform duration-200 border border-gray-100 dark:border-gray-800">
            <div class="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center mb-5 mx-auto">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
            
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">${title}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-7 text-center leading-relaxed">${message}</p>
            
            <div class="flex gap-3">
                <button id="confirm-cancel-btn" class="flex-1 py-3.5 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition active:scale-95">
                    Cancel
                </button>
                <button id="confirm-ok-btn" class="flex-1 py-3.5 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition active:scale-95">
                    ${confirmText}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Trigger animations (fade in + scale up)
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.firstElementChild.classList.remove('scale-95');
    });

    // Close function
    const close = () => {
        modal.classList.add('opacity-0');
        modal.firstElementChild.classList.add('scale-95');
        setTimeout(() => modal.remove(), 200); // Wait for transition to finish
    };

    // Attach click events
    document.getElementById('confirm-cancel-btn').onclick = close;
    document.getElementById('confirm-ok-btn').onclick = () => {
        close();
        if (onConfirm) onConfirm(); // Execute the actual delete action
    };
}

// ================= CUSTOM INPUT MODAL =================
function showInputModal(title, placeholder, initialValue, confirmText, onConfirm) {
    // Remove existing modal if any
    let existing = document.getElementById('custom-input-modal');
    if (existing) existing.remove();

    // Create the modal container
    let modal = document.createElement('div');
    modal.id = 'custom-input-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-200';
    
    // Safety check for empty initial value
    let safeInitial = initialValue ? escapeHtml(initialValue) : "";

    // Inject the UI
    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-6 w-full max-w-sm shadow-2xl transform scale-95 transition-transform duration-200 border border-gray-100 dark:border-gray-800">
            <div class="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center mb-5 mx-auto">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            </div>
            
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">${title}</h3>
            
            <input type="text" id="modal-input-field" autocomplete="off" class="w-full p-3.5 rounded-xl border-2 bg-black/5 text-gray-800 dark:bg-black/20 dark:text-white border-transparent focus:border-blue-500 outline-none mb-6 transition-colors text-center font-bold text-lg" placeholder="${placeholder}" value="${safeInitial}">
            
            <div class="flex gap-3">
                <button id="input-cancel-btn" class="flex-1 py-3.5 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition active:scale-95">
                    Cancel
                </button>
                <button id="input-ok-btn" class="flex-1 py-3.5 rounded-2xl font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition active:scale-95">
                    ${confirmText}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    let inputField = document.getElementById('modal-input-field');
    
    // Auto-focus the input so the mobile keyboard pops up immediately
    setTimeout(() => {
        inputField.focus();
        inputField.setSelectionRange(safeInitial.length, safeInitial.length);
    }, 100);

    // Trigger animations
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.firstElementChild.classList.remove('scale-95');
    });

    // Close function
    const close = () => {
        modal.classList.add('opacity-0');
        modal.firstElementChild.classList.add('scale-95');
        setTimeout(() => modal.remove(), 200); 
    };

    // Attach click events
    document.getElementById('input-cancel-btn').onclick = close;
    
    // Submit function
    const submit = () => {
        let val = inputField.value.trim();
        if (val !== "") {
            close();
            if (onConfirm) onConfirm(val);
        } else {
            // Flash red if they try to submit an empty name
            inputField.style.borderColor = "#ef4444";
            setTimeout(() => inputField.style.borderColor = "transparent", 400);
        }
    };

    document.getElementById('input-ok-btn').onclick = submit;
    
    // Allow pressing "Enter" on the keyboard to save
    inputField.onkeypress = (e) => {
        if (e.key === 'Enter') submit();
    };
}

// ================= GREETING =================
function getGreeting() {
    let h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
}

function getTimeBasedHillIcon() {
    const hour = new Date().getHours();
    
    // Morning (5 AM to 11 AM) - Sun rising over hills
    if (hour >= 5 && hour < 12) {
        return `
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-orange-400 drop-shadow-md">
            <path d="M12 4V2M4.929 4.929L3.515 3.515M20.485 3.515L19.071 4.929" stroke-linecap="round"/>
            <circle cx="12" cy="10" r="4" fill="currentColor" opacity="0.3"/>
            <circle cx="12" cy="10" r="4"/>
            <path d="M2 20C4 16 8 16 12 20M10 20C12 14 18 14 22 20" fill="currentColor" opacity="0.1"/>
            <path d="M2 20C4 16 8 16 12 20M10 20C12 14 18 14 22 20" stroke-linecap="round"/>
            <path d="M2 22h20" stroke-linecap="round"/>
        </svg>`;
    } 
    // Afternoon (12 PM to 4 PM) - Sun high over hills
    else if (hour >= 12 && hour < 17) {
        return `
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-amber-500 drop-shadow-md">
            <circle cx="12" cy="7" r="4" fill="currentColor" opacity="0.4"/>
            <circle cx="12" cy="7" r="4"/>
            <path d="M12 1V3M20 7H22M2 7H4M18.364 1.636L16.95 3.05M5.636 1.636L7.05 3.05" stroke-linecap="round"/>
            <path d="M2 20C5 15 9 15 13 20M11 20C14 13 20 13 22 20" fill="currentColor" opacity="0.2"/>
            <path d="M2 20C5 15 9 15 13 20M11 20C14 13 20 13 22 20" stroke-linecap="round"/>
            <path d="M2 22h20" stroke-linecap="round"/>
        </svg>`;
    } 
    // Evening (5 PM to 7 PM) - Sun setting behind hills
    else if (hour >= 17 && hour < 20) {
        return `
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-orange-600 dark:text-orange-400 drop-shadow-md">
            <path d="M12 18A6 6 0 0 1 12 6a6 6 0 0 1 6 6" stroke-dasharray="3 3"/>
            <circle cx="12" cy="14" r="4" fill="currentColor" opacity="0.5"/>
            <circle cx="12" cy="14" r="4"/>
            <path d="M2 20C6 14 10 14 14 20M10 20C13 15 18 15 22 20" fill="currentColor" opacity="0.3"/>
            <path d="M2 20C6 14 10 14 14 20M10 20C13 15 18 15 22 20" stroke-linecap="round"/>
            <path d="M2 22h20" stroke-linecap="round"/>
        </svg>`;
    } 
    // Night (8 PM to 4 AM) - Moon & stars over hills
    else {
        return `
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-blue-600 dark:text-blue-300 drop-shadow-md">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" fill="currentColor" opacity="0.3"/>
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>
            <path d="M19 4v2m-1-1h2M16 11v2m-1-1h2" stroke-linecap="round"/>
            <path d="M2 20C5 16 9 16 13 20M11 20C14 14 20 14 22 20" fill="currentColor" opacity="0.2"/>
            <path d="M2 20C5 16 9 16 13 20M11 20C14 14 20 14 22 20" stroke-linecap="round"/>
            <path d="M2 22h20" stroke-linecap="round"/>
        </svg>`;
    }
}
// ================= HOME =================
function renderHome() {
    return `
        <div class="card text-center relative overflow-hidden">
            <div class="flex justify-center mb-3 transition-transform hover:scale-105 duration-300">
                ${getTimeBasedHillIcon()}
            </div>
            
            <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">${getGreeting()}</h2>
            <p class="text-sm font-medium mt-1 text-gray-500 dark:text-gray-400">Welcome to AU Smart Hub</p>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-4">
            <div onclick="navigate('profiles')" class="card text-center cursor-pointer">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-2">
                    	<path d="M31,26c-0.6,0-1-0.4-1-1V12c0-0.6,0.4-1,1-1s1,0.4,1,1v13C32,25.6,31.6,26,31,26z"/>
                        <g>
                        <path d="M16,21c-0.2,0-0.3,0-0.5-0.1l-15-8C0.2,12.7,0,12.4,0,12s0.2-0.7,0.5-0.9l15-8c0.3-0.2,0.6-0.2,0.9,0l15,8 c0.3,0.2,0.5,0.5,0.5,0.9s-0.2,0.7-0.5,0.9l-15,8C16.3,21,16.2,21,16,21z"/>
                        </g>
                        <path d="M17.4,22.6C17,22.9,16.5,23,16,23s-1-0.1-1.4-0.4L6,18.1V22c0,3.1,4.9,6,10,6s10-2.9,10-6v-3.9L17.4,22.6z"/>
                    </svg>
                <p class="mt-2">CGPA</p>
            </div>

            <div onclick="navigate('copo')" class="card text-center cursor-pointer">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <path d="M12 22V12M9 10.5L12 9l3 1.5"/>
                </svg>
                <p class="mt-2">CO-PO</p>
            </div>
            
            <div onclick="navigate('visionmission')" class="card text-center cursor-pointer">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-2">
                    <path d="M30.9,5.6C30.8,5.2,30.4,5,30,5h-3V2c0-0.4-0.2-0.8-0.6-0.9C26,0.9,25.6,1,25.3,1.3l-4,4C21.1,5.5,21,5.7,21,6v3.6l-5.7,5.7 c-0.4,0.4-0.4,1,0,1.4c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3l5.7-5.7H26c0.3,0,0.5-0.1,0.7-0.3l4-4C31,6.4,31.1,6,30.9,5.6z"/>
                    <path d="M18.1,18.1C17.6,18.7,16.8,19,16,19s-1.6-0.3-2.1-0.9c-1.2-1.2-1.2-3.1,0-4.2l2.8-2.8C16.5,11,16.2,11,16,11 c-2.8,0-5,2.2-5,5s2.2,5,5,5s5-2.2,5-5c0-0.2,0-0.5-0.1-0.7L18.1,18.1z"/>
                    <path d="M28.1,12.1C27.6,12.7,26.8,13,26,13h-2.8l-0.7,0.7c0.3,0.7,0.4,1.5,0.4,2.3c0,3.9-3.1,7-7,7s-7-3.1-7-7s3.1-7,7-7 c0.8,0,1.6,0.2,2.3,0.4L19,8.8V6c0-0.8,0.3-1.6,0.9-2.1l1-1C19.3,2.3,17.7,2,16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14 c0-1.7-0.3-3.3-0.9-4.9L28.1,12.1z"/>
                </svg>
                <p class="mt-2">Vision & Mission</p>
            </div>

            <div onclick="navigate('target-cgpa')" class="card text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5">
                <div class="flex justify-center mb-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <line id="primary" x1="3" y1="19" x2="21" y2="19" style="fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><polyline id="primary-2" data-name="primary" points="3 15 8 9 14 12 21 5" style="fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></polyline><polyline id="primary-3" data-name="primary" points="21 10 21 5 16 5" style="fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></polyline>
                    </svg>
                </div>
                <h3 class="mt-2">Goal Setter</h3>
            </div>

            <div onclick="navigate('calculator')" class="card text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5">
                <div class="flex justify-center mb-2">
                    <svg height="32" width="32" version="1.1" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
                        <g id="Layer_1">
                        	<g>
                        		<circle class="st0" cx="31.8" cy="32" r="32"/>
                        	</g>
                        	<g>
                        		<circle cx="44" cy="37" r="2"/>
                        	</g>
                        	<g>
                        		<circle cx="44" cy="49" r="2"/>
                        	</g>
                        	<g>
                        		<path  d="M28,22c0,1.1-0.9,2-2,2H14c-1.1,0-2-0.9-2-2l0,0c0-1.1,0.9-2,2-2h12C27.1,20,28,20.9,28,22L28,22z"/>
                        	</g>
                        	<g>
                        		<path d="M52,22c0,1.1-0.9,2-2,2H38c-1.1,0-2-0.9-2-2l0,0c0-1.1,0.9-2,2-2h12C51.1,20,52,20.9,52,22L52,22z"/>
                        	</g>
                        	<g>
                        		<path d="M20,30c-1.1,0-2-0.9-2-2V16c0-1.1,0.9-2,2-2l0,0c1.1,0,2,0.9,2,2v12C22,29.1,21.1,30,20,30L20,30z"/>
                        	</g>
                        	<g>
                        		<path d="M52,43c0,1.1-0.9,2-2,2H38c-1.1,0-2-0.9-2-2l0,0c0-1.1,0.9-2,2-2h12C51.1,41,52,41.9,52,43L52,43z"/>
                        	</g>
                        	<g>
                        		<path d="M26.8,50.8c-0.8,0.8-2,0.8-2.8,0L13.2,40c-0.8-0.8-0.8-2,0-2.8l0,0c0.8-0.8,2-0.8,2.8,0L26.8,48
                        			C27.6,48.8,27.6,50,26.8,50.8L26.8,50.8z"/>
                        	</g>
                        	<g>
                        		<path d="M13.2,50.8c-0.8-0.8-0.8-2,0-2.8L24,37.2c0.8-0.8,2-0.8,2.8,0l0,0c0.8,0.8,0.8,2,0,2.8L16,50.8
                        			C15.2,51.6,14,51.6,13.2,50.8L13.2,50.8z"/>
                        	</g>
                        </g>
                        <g id="Layer_2">
                        </g>
                    </svg>
                </div>
                <h3 class="mt-2">Quick Calc</h3>
            </div>
            <div onclick="navigate('scientific-calc')" class="card text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5">
                <div class="flex justify-center mb-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M12.71,17.29a1,1,0,0,0-.16-.12.56.56,0,0,0-.17-.09.6.6,0,0,0-.19-.06.93.93,0,0,0-.57.06.9.9,0,0,0-.54.54A.84.84,0,0,0,11,18a1,1,0,0,0,.07.38,1.46,1.46,0,0,0,.22.33A1,1,0,0,0,12,19a.84.84,0,0,0,.38-.08,1.15,1.15,0,0,0,.33-.21A1,1,0,0,0,13,18a1,1,0,0,0-.08-.38A1,1,0,0,0,12.71,17.29ZM8.55,13.17a.56.56,0,0,0-.17-.09A.6.6,0,0,0,8.19,13a.86.86,0,0,0-.39,0l-.18.06-.18.09-.15.12A1.05,1.05,0,0,0,7,14a1,1,0,0,0,.29.71,1.15,1.15,0,0,0,.33.21A1,1,0,0,0,9,14a1.05,1.05,0,0,0-.29-.71Zm.16,4.12a1,1,0,0,0-.33-.21A1,1,0,0,0,7.8,17l-.18.06a.76.76,0,0,0-.18.09,1.58,1.58,0,0,0-.15.12,1,1,0,0,0-.21.33.94.94,0,0,0,0,.76,1.15,1.15,0,0,0,.21.33A1,1,0,0,0,8,19a.84.84,0,0,0,.38-.08,1.15,1.15,0,0,0,.33-.21,1.15,1.15,0,0,0,.21-.33.94.94,0,0,0,0-.76A1,1,0,0,0,8.71,17.29Zm2.91-4.21a1,1,0,0,0-.33.21A1.05,1.05,0,0,0,11,14a1,1,0,0,0,1.38.92,1.15,1.15,0,0,0,.33-.21A1,1,0,0,0,13,14a1.05,1.05,0,0,0-.29-.71A1,1,0,0,0,11.62,13.08Zm5.09,4.21a1.15,1.15,0,0,0-.33-.21,1,1,0,0,0-1.09.21,1,1,0,0,0-.21.33.94.94,0,0,0,0,.76,1.15,1.15,0,0,0,.21.33A1,1,0,0,0,16,19a.84.84,0,0,0,.38-.08,1.15,1.15,0,0,0,.33-.21,1,1,0,0,0,.21-1.09A1,1,0,0,0,16.71,17.29ZM16,5H8A1,1,0,0,0,7,6v4a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V6A1,1,0,0,0,16,5ZM15,9H9V7h6Zm3-8H6A3,3,0,0,0,3,4V20a3,3,0,0,0,3,3H18a3,3,0,0,0,3-3V4A3,3,0,0,0,18,1Zm1,19a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V4A1,1,0,0,1,6,3H18a1,1,0,0,1,1,1Zm-2.45-6.83a.56.56,0,0,0-.17-.09.6.6,0,0,0-.19-.06.86.86,0,0,0-.39,0l-.18.06-.18.09-.15.12A1.05,1.05,0,0,0,15,14a1,1,0,0,0,1.38.92,1.15,1.15,0,0,0,.33-.21A1,1,0,0,0,17,14a1.05,1.05,0,0,0-.29-.71Z"/>
                    </svg>
                </div>
                <h3 class="mt-2">Sci-Calc</h3>
            </div>
            <div onclick="navigate('notes')" class="card text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5">
                <div class="flex justify-center mb-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M19,14.5 L19,5.5 C19,4.67157288 18.3284271,4 17.5,4 L6.5,4 C5.67157288,4 5,4.67157288 5,5.5 L5,18.5 C5,19.3284271 5.67157288,20 6.5,20 L13.5,20 C14.3284271,20 15,19.3284271 15,18.5 C15,17.1192881 16.1192881,16 17.5,16 C18.3284271,16 19,15.3284271 19,14.5 L19,14.5 Z M18.5014408,16.7913481 C18.1948298,16.9255432 17.8561101,17 17.5,17 C16.6715729,17 16,17.6715729 16,18.5 C16,18.8561101 15.9255432,19.1948298 15.7913481,19.5014408 C16.9873685,18.9526013 17.9526013,17.9873685 18.5014408,16.7913481 L18.5014408,16.7913481 Z M4,5.5 C4,4.11928813 5.11928813,3 6.5,3 L17.5,3 C18.8807119,3 20,4.11928813 20,5.5 L20,14.5 C20,18.0898509 17.0898509,21 13.5,21 L6.5,21 C5.11928813,21 4,19.8807119 4,18.5 L4,5.5 Z M8.5,9 C8.22385763,9 8,8.77614237 8,8.5 C8,8.22385763 8.22385763,8 8.5,8 L15.5,8 C15.7761424,8 16,8.22385763 16,8.5 C16,8.77614237 15.7761424,9 15.5,9 L8.5,9 Z M8.5,12 C8.22385763,12 8,11.7761424 8,11.5 C8,11.2238576 8.22385763,11 8.5,11 L15.5,11 C15.7761424,11 16,11.2238576 16,11.5 C16,11.7761424 15.7761424,12 15.5,12 L8.5,12 Z M8.5,15 C8.22385763,15 8,14.7761424 8,14.5 C8,14.2238576 8.22385763,14 8.5,14 L13.5,14 C13.7761424,14 14,14.2238576 14,14.5 C14,14.7761424 13.7761424,15 13.5,15 L8.5,15 Z"/>
                    </svg>
                </div>
                <h3 class="mt-2">My Notes</h3>
            </div>
        </div>
    `;
}

// ================= PROFILES DASHBOARD =================
function renderProfiles() {
    let html = `
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-blue-600 dark:text-blue-400">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Student Profiles</h1>
            </div>
            <div class="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                ${profiles.length} Profiles
            </div>
        </div>
        
        <div class="grid gap-3">
    `;

    if (profiles.length === 0) {
        // Empty State
        html += `
            <div class="card text-center py-10 text-gray-500 dark:text-gray-400 border-dashed border-2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="mx-auto mb-3 opacity-50">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>
                </svg>
                <p class="font-medium text-gray-700 dark:text-gray-300">No profiles found</p>
                <p class="text-xs mt-1 mb-4">Create a profile for yourself or a friend to start tracking CGPA.</p>
                <button onclick="createProfile()" class="btn mx-auto flex items-center justify-center gap-2 text-white dark:text-gray-900">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Create First Profile
                </button>
            </div>
        `;
    } else {
        // List Profiles as Cards
        profiles.forEach((p, idx) => {
            let cgpaDisplay = calculateProfileCGPA(p.semesters);
            let initial = p.name.charAt(0).toUpperCase();
            
            html += `
                <div class="card flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition" onclick="openProfile(${idx})">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                            ${initial}
                        </div>
                        <div>
                            <h3 class="font-bold text-gray-800 dark:text-gray-100 text-base">${escapeHtml(p.name)}</h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Overall CGPA: <span class="${cgpaDisplay === 'RA' ? 'text-red-500' : 'text-blue-500 font-bold'}">${cgpaDisplay}</span> • ${p.semesters.length} Semesters</p>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex items-center gap-1">
                        <!-- Edit Button -->
                        <button onclick="event.stopPropagation(); editProfile(${idx})" class="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition" title="Edit Name">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        
                        <!-- Delete Button -->
                        <button onclick="event.stopPropagation(); deleteProfile(${idx})" class="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition" title="Delete Profile">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        });

        // Add Profile Button
        html += `
            <button onclick="createProfile()" class="btn mt-2 flex items-center justify-center gap-2 w-full bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
                Create New Profile
            </button>
        `;
    }

    html += `</div>`;
    return html;
}

// Profile Helper Functions
function calculateProfileCGPA(semestersArray) {
    if (!semestersArray || semestersArray.length === 0) return "-";
    let totalCredits = 0;
    let totalPoints = 0;
    let hasRA = false;

    semestersArray.forEach(sem => {
        sem.subjects.forEach(s => {
            let credit = Number(s.credit) || 0;
            let gp = getGP(s.grade);
            if (s.grade === "RA") hasRA = true;
            totalCredits += credit;
            totalPoints += credit * gp;
        });
    });

    if (totalCredits === 0) return "-";
    if (hasRA) return "RA";
    return (totalPoints / totalCredits).toFixed(2);
}

function openProfile(idx) {
    currentProfileIndex = idx;
    semesters = profiles[idx].semesters;
    navigate('cgpa');
}

function createProfile() {
    showInputModal(
        "Create New Profile", 
        "Enter student's name", 
        "", // No initial value
        "Create", 
        (name) => {
            profiles.push({
                id: Date.now().toString(),
                name: name,
                semesters: []
            });
            save();
            render();
        }
    );
}

function editProfile(idx) {
    let currentName = profiles[idx].name;
    
    showInputModal(
        "Edit Profile", 
        "Enter student's name", 
        currentName, // Pass the current name so they can edit it
        "Save Changes", 
        (newName) => {
            // Only save if the name actually changed
            if (newName !== currentName) {
                profiles[idx].name = newName;
                save();
                render();
            }
        }
    );
}

function deleteProfile(idx) {
    showConfirm(
        "Delete Profile?", 
        `Are you sure you want to delete ${profiles[idx].name}'s profile? All semester data will be lost forever.`, 
        "Delete",
        () => {
            profiles.splice(idx, 1);
            save();
            render();
        }
    );
}

// ================= CGPA =================
function renderCGPA() {
    let totalCredits = 0;
    let totalPoints = 0;
    let hasRA = false;
    let lastSemGPA = "-";

    semesters.forEach((sem, index) => {
        let semCredits = 0;
        let semPoints = 0;
        let semRA = false;

        sem.subjects.forEach(s => {
            let credit = Number(s.credit) || 0;
            let gp = getGP(s.grade);

            if (s.grade === "RA") {
                hasRA = true;
                semRA = true;
            }

            totalCredits += credit;
            totalPoints += credit * gp;

            semCredits += credit;
            semPoints += credit * gp;
        });

        if (index === semesters.length - 1) {
            lastSemGPA = (semRA || semCredits === 0) ? "RA" : (semPoints / semCredits).toFixed(2);
        }
    });

    let cgpa = (hasRA || totalCredits === 0) ? "RA" : (totalPoints / totalCredits).toFixed(2);

    let classification = "-";
    if (cgpa !== "RA") {
        let c = Number(cgpa);
        if (c >= 8.25) classification = "First Class with Distinction";
        else if (c >= 6.5) classification = "First Class";
        else if (c >= 5) classification = "Second Class";
        else classification = "Pass";
    }

    return `
        <!-- Header Section -->
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-2">
                    <path d="M31,26c-0.6,0-1-0.4-1-1V12c0-0.6,0.4-1,1-1s1,0.4,1,1v13C32,25.6,31.6,26,31,26z"/>
                    <g>
                        <path d="M16,21c-0.2,0-0.3,0-0.5-0.1l-15-8C0.2,12.7,0,12.4,0,12s0.2-0.7,0.5-0.9l15-8c0.3-0.2,0.6-0.2,0.9,0l15,8 c0.3,0.2,0.5,0.5,0.5,0.9s-0.2,0.7-0.5,0.9l-15,8C16.3,21,16.2,21,16,21z"/>
                    </g>
                    <path d="M17.4,22.6C17,22.9,16.5,23,16,23s-1-0.1-1.4-0.4L6,18.1V22c0,3.1,4.9,6,10,6s10-2.9,10-6v-3.9L17.4,22.6z"/>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
                    ${profiles[currentProfileIndex] ? escapeHtml(profiles[currentProfileIndex].name) + "'s" : ""} CGPA
                </h1>
            </div>
            <div class="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Academic Performance
            </div>
        </div>

        <!-- Stats Grid - Your Code (Perfect) -->
        <div class="grid grid-cols-2 gap-3">
            <div class="card stat-card">
                <div class="text-gray-500 dark:text-gray-400">Semesters</div>
                <div class="text-gray-900 dark:text-white font-bold">${semesters.length}</div>
            </div>
            <div class="card stat-card">
                <div class="text-gray-500 dark:text-gray-400">Total Credits</div>
                <div class="text-gray-900 dark:text-white font-bold">${totalCredits}</div>
            </div>
            <div class="card stat-card">
                <div class="text-gray-500 dark:text-gray-400">Last GPA</div>
                <div class="text-gray-900 dark:text-white font-bold">${lastSemGPA}</div>
            </div>
            <div class="card stat-card">
                <div class="text-gray-500 dark:text-gray-400">Class</div>
                <div class="text-green-600 dark:text-green-400 text-sm font-semibold">${classification}</div>
            </div>
            <div class="card stat-card col-span-2">
                <div class="text-gray-500 dark:text-gray-400">CGPA</div>
                <div class="text-blue-600 dark:text-blue-400 text-xl font-bold">${cgpa}</div>
            </div>
        </div>

        <!-- Rest of your code continues... -->
        <button onclick="createSemester()" class="btn mt-3 flex items-center justify-center gap-2 w-full text-white dark:text-gray-900">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
            </svg>
            Create Semester
        </button>

        ${semesters.map((s, i) => `
            <div onclick="openSemester(${i})" class="card flex justify-between items-center mt-2 cursor-pointer">
                <div class="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="4" width="18" height="16" rx="2"/>
                        <line x1="8" y1="10" x2="16" y2="10"/>
                    </svg>
                    <span class="text-gray-700 dark:text-gray-200">Semester ${i + 1}</span>
                </div>
                <button onclick="event.stopPropagation(); deleteSemester(${i})" class="text-red-500 dark:text-red-400 text-sm">Delete</button>
            </div>
        `).join("")}

        ${semesters.length > 0 ? `
        <div class="card mt-4">
            <h2 class="text-lg mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M3 3v18h18M18 17V9M12 17V5M6 17v-3"/>
                </svg>
                GPA Trend
            </h2>
            <canvas id="cgpaChart"></canvas>
        </div>
        ` : `
        <div class="card mt-4 text-center text-gray-500 dark:text-gray-400">
            No semester data available
        </div>
        `}

        <div class="card mt-4 text-sm">
            <h3 class="font-bold mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4l3 3"/>
                </svg>
                CGPA Formula
            </h3>
            <p class="text-gray-600 dark:text-gray-300">CGPA = Σ (Grade Point × Credit) / Σ Credits</p>
            <p class="text-xs mt-2 text-gray-500 dark:text-gray-400">
                Example: (10×4 + 9×3 + 8×3) / 10 = 9.1
            </p>
        </div>

        <!-- Calculation Formula Section -->
        <div class="card mt-4">
            <h3 class="font-bold mb-3 flex items-center gap-2 text-base text-gray-800 dark:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h4"/>
                    <path d="M18 4L20 6L18 8"/>
                    <path d="M6 4L4 6L6 8"/>
                </svg>
                Calculation Formula
            </h3>
            
            <!-- Semester CGPA -->
            <div class="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    <span class="font-bold text-blue-600 dark:text-blue-400">Semester CGPA</span>
                </div>
                <div class="text-sm space-y-2">
                    <div class="flex justify-between items-center p-2 bg-black/5 dark:bg-white/5 rounded">
                        <span class="text-gray-600 dark:text-gray-300">Formula:</span>
                        <span class="font-mono text-gray-800 dark:text-gray-200">Sum of Credit Points ÷ Sum of Credit Hours</span>
                    </div>
                    <div class="p-2 bg-black/5 dark:bg-white/5 rounded">
                        <div class="text-gray-600 dark:text-gray-300">• Credit Points = Grade × Credit Hours</div>
                        <div class="text-gray-600 dark:text-gray-300">• Reappear if any subject has 0 credits</div>
                    </div>
                    <div class="p-2 bg-black/5 dark:bg-white/5 rounded">
                        <span class="text-gray-600 dark:text-gray-300">Example:</span>
                        <span class="font-mono text-gray-800 dark:text-gray-200"> 4 hours × 5 grade = 20 Credit Points</span>
                    </div>
                </div>
            </div>
            
            <!-- Overall OGPA -->
            <div class="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2">
                        <path d="M3 3v18h18M18 17V9M12 17V5M6 17v-3"/>
                        <path d="M3 3L21 21"/>
                    </svg>
                    <span class="font-bold text-purple-600 dark:text-purple-400">Overall OGPA</span>
                </div>
                <div class="text-sm space-y-2">
                    <div class="flex justify-between items-center p-2 bg-black/5 dark:bg-white/5 rounded">
                        <span class="text-gray-600 dark:text-gray-300">Formula:</span>
                        <span class="font-mono text-gray-800 dark:text-gray-200">Sum of All CGPAs ÷ Total Number of Semesters</span>
                    </div>
                    <div class="p-2 bg-black/5 dark:bg-white/5 rounded">
                        <div class="text-gray-600 dark:text-gray-300">• Only completed semesters included</div>
                        <div class="text-gray-600 dark:text-gray-300">• Reappear semesters are excluded</div>
                    </div>
                    <div class="p-2 bg-black/5 dark:bg-white/5 rounded">
                        <span class="text-gray-600 dark:text-gray-300">Example:</span>
                        <span class="font-mono text-gray-800 dark:text-gray-200"> OGPA = (8.5 + 7.8 + 9.2) ÷ 3 = 8.5</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Credit Hours Strategy Section -->
        <div class="card mt-4">
            <h3 class="font-bold mb-3 flex items-center gap-2 text-base text-gray-800 dark:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    <path d="M8 12h8"/>
                    <path d="M12 8v8"/>
                </svg>
                Credit Hours Strategy
            </h3>
            
            <!-- High Impact -->
            <div class="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                        <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2z"/>
                    </svg>
                    <span class="font-bold text-red-600 dark:text-red-400">High Impact (4 & 3 credits)</span>
                </div>
                <ul class="list-disc ml-6 text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                    <li>Core theory subjects - Maximum weight on CGPA</li>
                    <li>Focus on getting S/A grades</li>
                    <li>1 point improvement = +0.25 CGPA boost</li>
                </ul>
            </div>
            
            <!-- Medium Impact -->
            <div class="mb-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    <span class="font-bold text-yellow-600 dark:text-yellow-400">Medium Impact (2 & 1 credits)</span>
                </div>
                <ul class="list-disc ml-6 text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                    <li>Electives & minor subjects - Moderate weight on CGPA</li>
                    <li>Maintain B+ grades or better</li>
                    <li>Good for consistency</li>
                </ul>
            </div>
            
            <!-- Lab Subjects -->
            <div class="mb-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                        <path d="M20 12H4M12 4v16"/>
                        <rect x="2" y="2" width="20" height="20" rx="2.18"/>
                    </svg>
                    <span class="font-bold text-green-600 dark:text-green-400">Lab Subjects (1.5 credits)</span>
                </div>
                <ul class="list-disc ml-6 text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                    <li>Practical/laboratory courses - Easier to score high grades</li>
                    <li>Perfect for boosting CGPA</li>
                    <li>Aim for S grades consistently</li>
                </ul>
            </div>
        </div>

        <!-- CGPA Growth Strategy -->
        <div class="card mt-3">
            <h3 class="font-bold mb-3 flex items-center gap-2 text-base text-gray-800 dark:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M2 20L22 20M4 4L20 20M8 4L16 12M12 4L14 6"/>
                </svg>
                CGPA Growth Strategy
            </h3>
            <div class="space-y-2">
                <div class="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span class="text-sm text-gray-600 dark:text-gray-300">Priority 1</span>
                    <span class="font-bold text-blue-600 dark:text-blue-400">4-credit subjects</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span class="text-sm text-gray-600 dark:text-gray-300">Priority 2</span>
                    <span class="font-bold text-blue-600 dark:text-blue-400">3-credit subjects</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span class="text-sm text-gray-600 dark:text-gray-300">Priority 3</span>
                    <span class="font-bold text-green-600 dark:text-green-400">1.5-credit labs</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span class="text-sm text-gray-600 dark:text-gray-300">Priority 4</span>
                    <span class="font-bold text-yellow-600 dark:text-yellow-400">1 & 2-credit subjects</span>
                </div>
            </div>
        </div>

        <!-- OGPA Growth Strategy -->
        <div class="card mt-3">
            <h3 class="font-bold mb-3 flex items-center gap-2 text-base text-gray-800 dark:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                OGPA Growth Strategy
            </h3>
            <ul class="list-disc ml-6 text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                <li>Consistency across all semesters</li>
                <li>Avoid reappears at all costs</li>
                <li>Early semesters set the base</li>
                <li>Later semesters can recover OGPA</li>
            </ul>
        </div>

        <!-- Quick Impact Calculation -->
        <div class="card mt-3">
            <h3 class="font-bold mb-3 flex items-center gap-2 text-base text-gray-800 dark:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <path d="M12 22V12M9 10.5L12 9l3 1.5"/>
                </svg>
                Quick Impact Calculation
            </h3>
            <div class="space-y-2 text-sm">
                <div class="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span class="text-blue-600 dark:text-blue-400">4-credit subject B → A:</span>
                    <span class="text-gray-600 dark:text-gray-300"> +9 points × 4 hours = +36 credit points</span>
                </div>
                <div class="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span class="text-blue-600 dark:text-blue-400">3-credit subject C → B:</span>
                    <span class="text-gray-600 dark:text-gray-300"> +8 points × 3 hours = +24 credit points</span>
                </div>
                <div class="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span class="text-green-600 dark:text-green-400">Perfect lab (1.5 credits):</span>
                    <span class="text-gray-600 dark:text-gray-300"> S grade = 15 credit points</span>
                </div>
            </div>
        </div>

        <!-- Your Action Plan -->
        <div class="card mt-3">
            <h3 class="font-bold mb-3 flex items-center gap-2 text-base text-gray-800 dark:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                </svg>
                Your Action Plan
            </h3>
            <ol class="list-decimal ml-6 text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                <li>Focus on 4 & 3 credit subjects first</li>
                <li>Aim for S/A grades in labs (easy boost)</li>
                <li>Maintain consistency across all semesters</li>
                <li>Never get reappear (zeros destroy CGPA)</li>
            </ol>
        </div>

        <div class="card mt-3 text-sm">
            <h3 class="font-bold mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                How to Improve CGPA
            </h3>
            <ul class="list-disc ml-4 text-gray-600 dark:text-gray-300 space-y-1">
                <li>Focus on high-credit subjects</li>
                <li>Avoid RA (arrear reduces CGPA heavily)</li>
                <li>Target minimum grade A (9 GP)</li>
                <li>Score S in core subjects</li>
                <li>Improve next semester GPA to boost overall CGPA</li>
            </ul>
        </div>
    `;
}

function createSemester() {
    semesters.push({ subjects: [] });
    save();
    render();
}

function openSemester(index) {
    currentSemester = index;
    navigate("semester");
}

function deleteSemester(i) {
    showConfirm(
        "Delete Semester?", 
        "Are you sure you want to delete this semester? This action cannot be undone.", 
        "Delete",
        () => {
            semesters.splice(i, 1);
            save();
            render();
        }
    );
}

// ================= PROFILE MANAGEMENT =================
function changeProfile(index) {
    currentProfileIndex = parseInt(index);
    semesters = profiles[currentProfileIndex].semesters;
    save();
    
    // Re-render CGPA screen and refresh chart
    render();
    if (semesters.length > 0) {
        setTimeout(() => {
            renderCGPAChart();
        }, 100);
    }
}

function addProfile() {
    let name = prompt("Enter student's name (e.g., Friend's Name):");
    
    if (name && name.trim() !== "") {
        // Create new profile object
        let newProfile = { 
            id: Date.now().toString(), 
            name: name.trim(), 
            semesters: [] 
        };
        
        profiles.push(newProfile);
        
        // Switch to the newly created profile
        currentProfileIndex = profiles.length - 1;
        semesters = profiles[currentProfileIndex].semesters;
        
        save();
        render();
    }
}

function renderCGPAChart() {
    let labels = [];
    let data = [];

    semesters.forEach((sem, index) => {
        let totalCredits = 0;
        let totalPoints = 0;
        let hasRA = false;

        sem.subjects.forEach(s => {
            let credit = Number(s.credit) || 0;
            let gp = getGP(s.grade);
            if (s.grade === "RA") hasRA = true;
            totalCredits += credit;
            totalPoints += credit * gp;
        });

        let gpa = (hasRA || totalCredits === 0) ? null : (totalPoints / totalCredits);
        labels.push("Sem " + (index + 1));
        data.push(gpa);
    });

    let ctx = document.getElementById("cgpaChart");
    if (!ctx) return;

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'GPA',
                data: data,
                tension: 0.4,
                borderColor: '#3b82f6'
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    min: 0,
                    max: 10
                }
            }
        }
    });
}

function renderSemester() {
    let sem = semesters[currentSemester] || { subjects: [] };

    let totalCredits = 0;
    let totalPoints = 0;
    let hasRA = false;

    sem.subjects.forEach(s => {
        let credit = Number(s.credit) || 0;
        let gp = getGP(s.grade);
        if (s.grade === "RA") hasRA = true;
        totalCredits += credit;
        totalPoints += credit * gp;
    });

    let gpa = (hasRA || totalCredits === 0) ? "RA" : (totalPoints / totalCredits).toFixed(2);

    return `
        <!-- Header Section -->
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Semester Details</h1>
            </div>
            <div class="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                <span class="text-sm font-medium text-blue-600 dark:text-blue-400">Semester ${currentSemester + 1}</span>
            </div>
        </div>

        <!-- Stats Card -->
        <div class="card mb-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                    <div class="text-sm text-gray-500 dark:text-gray-400">Total Credits</div>
                    <div class="text-2xl font-bold text-gray-800 dark:text-white">${totalCredits}</div>
                </div>
                <div class="text-center">
                    <div class="text-sm text-gray-500 dark:text-gray-400">Semester GPA</div>
                    <div class="text-2xl font-bold ${gpa === 'RA' ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}">${gpa}</div>
                </div>
            </div>
            ${hasRA ? `
                <div class="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg animate-pulse">
                    <div class="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-600 dark:text-red-400 flex-shrink-0">
                            <path d="M12 2L2 19h20L12 2z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <span class="text-sm text-red-600 dark:text-red-400">Reappear detected - This semester has RA grade</span>
                    </div>
                </div>
            ` : ''}
        </div>

        <!-- Subjects List -->
        <div class="mb-3">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    Subjects (${sem.subjects.length})
                </h3>
                <button onclick="addSubject()" class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add
                </button>
            </div>
        </div>

        ${sem.subjects.map((sub, i) => `
            <div class="card mb-3">
                <div class="flex justify-between items-center mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span class="text-sm font-bold text-gray-800 dark:text-gray-200">Subject ${i + 1}</span>
                    <button onclick="deleteSubject(${i})" class="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded transition" title="Delete Subject">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                
                <div class="mb-3">
                    <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 mb-1">Subject Name</label>
                    <input class="input w-full" placeholder="e.g. Mathematics I" value="${escapeHtml(sub.name)}" onchange="updateSubject(${i}, 'name', this.value)">
                </div>
                
                <div class="grid grid-cols-2 gap-3 mb-2">
                    <div>
                        <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 mb-1">Credits</label>
                        <input type="number" class="input w-full" placeholder="e.g. 4" value="${sub.credit}" onchange="updateSubject(${i}, 'credit', this.value)">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 mb-1">Grade</label>
                        <select class="input w-full" onchange="updateSubject(${i}, 'grade', this.value)">
                            ${["S", "A", "B", "C", "D", "E", "RA"].map(g => `<option ${g == sub.grade ? 'selected' : ''} class="${g === 'RA' ? 'text-red-500' : ''}">${g}</option>`).join("")}
                        </select>
                    </div>
                </div>
                
                ${sub.name ? `
                    <div class="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800/50">
                        ${getGradeImpact(sub.credit, sub.grade)}
                    </div>
                ` : ''}
            </div>
        `).join("")}

        ${sem.subjects.length === 0 ? `
        <div class="card text-center py-8 text-gray-500 dark:text-gray-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="mx-auto mb-2 opacity-50">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <p>No subjects added yet</p>
            <p class="text-xs mt-1">Click the Add button to add your first subject</p>
        </div>
        ` : ''}

        <button onclick="addSubject()" class="btn mt-3 w-full flex items-center justify-center gap-2 text-white dark:text-gray-900">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
            </svg>
            Add New Subject
        </button>
    `;
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Helper function to show grade impact
function getGradeImpact(credits, grade) {
    const gradePoints = { "S": 10, "A": 9, "B": 8, "C": 7, "D": 6, "E": 5, "RA": 0 };
    const points = gradePoints[grade] || 0;
    const totalPoints = (credits || 0) * points;

    const impactConfig = {
        'RA': {
            icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
            text: 'Reappear - This will significantly reduce your CGPA',
            color: 'text-red-600 dark:text-red-400'
        },
        'excellent': {
            icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
            text: `Excellent! +${totalPoints} credit points`,
            color: 'text-yellow-600 dark:text-yellow-400'
        },
        'good': {
            icon: '<path d="M20 6L9 17L4 12"/>',
            text: `Good! +${totalPoints} credit points`,
            color: 'text-green-600 dark:text-green-400'
        },
        'average': {
            icon: '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><path d="M8 12h8"/>',
            text: `Average impact: +${totalPoints} credit points`,
            color: 'text-blue-600 dark:text-blue-400'
        },
        'low': {
            icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
            text: `Low impact: +${totalPoints} credit points`,
            color: 'text-orange-600 dark:text-orange-400'
        }
    };

    let type;
    if (grade === "RA") type = 'RA';
    else if (points >= 9) type = 'excellent';
    else if (points >= 8) type = 'good';
    else if (points >= 6) type = 'average';
    else type = 'low';

    const config = impactConfig[type];

    return `
        <div class="flex items-center gap-2 ${config.color}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${config.icon}
            </svg>
            <span>${config.text}</span>
        </div>
    `;
}

function addSubject() {
    semesters[currentSemester].subjects.push({
        name: "",
        credit: 4,
        grade: "S"
    });
    save();
    render();
}

let renderTimer;

function smartRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => {
        render();
    }, 500);
}

function updateSubject(i, key, val) {
    if (val === "") {
        semesters[currentSemester].subjects[i][key] = "";
        return;
    }

    if (key === "credit") {
        val = Number(val);
        if (isNaN(val) || val < 0) return;
    }

    semesters[currentSemester].subjects[i][key] = val;
    save();
    smartRender();
}

function deleteSubject(i) {
    semesters[currentSemester].subjects.splice(i, 1);
    save();
    render();
}

// ================= CALCULATION =================
function getGP(g) {
    return { "S": 10, "A": 9, "B": 8, "C": 7, "D": 6, "E": 5, "RA": 0 }[g];
}

// ================= TARGET CGPA CALCULATOR =================
function renderTargetCGPA() {
    // Attempt to auto-fill based on the current profile
    let currentSems = semesters ? semesters.length : 0;
    let currentCgpaVal = calculateProfileCGPA(semesters);
    if (currentCgpaVal === "-" || currentCgpaVal === "RA") currentCgpaVal = "";

    return `
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-purple-600 dark:text-purple-400">
                    <line id="primary" x1="3" y1="19" x2="21" y2="19" style="fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><polyline id="primary-2" data-name="primary" points="3 15 8 9 14 12 21 5" style="fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></polyline><polyline id="primary-3" data-name="primary" points="21 10 21 5 16 5" style="fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></polyline>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Goal Setter</h1>
            </div>
            <div class="text-xs px-3 py-1 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                Target Tracker
            </div>
        </div>

        <div class="card mb-4 border border-purple-500/20">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Find out exactly what GPA you need in your remaining semesters to hit your target.</p>
            
            <div class="space-y-4">
                <div>
                    <label class="text-xs font-bold text-gray-600 dark:text-gray-300 ml-1">Total Semesters in Course</label>
                    <input type="number" id="tc-total-sems" class="w-full p-3 rounded-xl border bg-black/5 text-gray-800 dark:bg-white/5 dark:text-white border-gray-300 dark:border-gray-600 focus:border-purple-500 outline-none mt-1 transition-colors" value="8">
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs font-bold text-gray-600 dark:text-gray-300 ml-1">Completed Sems</label>
                        <input type="number" id="tc-completed-sems" class="w-full p-3 rounded-xl border bg-black/5 text-gray-800 dark:bg-white/5 dark:text-white border-gray-300 dark:border-gray-600 focus:border-purple-500 outline-none mt-1 transition-colors" value="${currentSems}">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-600 dark:text-gray-300 ml-1">Current CGPA</label>
                        <input type="number" step="0.01" id="tc-current-cgpa" class="w-full p-3 rounded-xl border bg-black/5 text-gray-800 dark:bg-white/5 dark:text-white border-gray-300 dark:border-gray-600 focus:border-purple-500 outline-none mt-1 transition-colors" value="${currentCgpaVal}" placeholder="e.g. 7.5">
                    </div>
                </div>

                <div>
                    <label class="text-xs font-bold text-gray-600 dark:text-gray-300 ml-1 text-gray-600 dark:text-gray-300">Your Target CGPA</label>
                    <input type="number" step="0.01" id="tc-target-cgpa" class="w-full p-3 rounded-xl border-2 bg-purple-50/50 text-gray-800 dark:bg-purple-900/10 dark:text-white border-purple-300 dark:border-purple-500 focus:border-purple-600 outline-none mt-1 transition-colors" placeholder="e.g. 8.5">
                </div>
            </div>

            <button onclick="calculateTarget()" class="btn mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white border-none shadow-lg shadow-purple-500/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Calculate Required GPA
            </button>
        </div>

        <div id="tc-result-card" class="card hidden text-center transition-all duration-300 transform scale-95 opacity-0">
            </div>
    `;
}

function calculateTarget() {
    const totalSems = parseFloat(document.getElementById('tc-total-sems').value);
    const compSems = parseFloat(document.getElementById('tc-completed-sems').value);
    const currentCgpa = parseFloat(document.getElementById('tc-current-cgpa').value);
    const targetCgpa = parseFloat(document.getElementById('tc-target-cgpa').value);
    const resultCard = document.getElementById('tc-result-card');

    if (!totalSems || !compSems || !currentCgpa || !targetCgpa) {
        alert("Please fill in all fields correctly.");
        return;
    }

    if (compSems >= totalSems) {
        alert("Completed semesters must be less than total semesters.");
        return;
    }

    const remainingSems = totalSems - compSems;
    
    // Core Formula: Assuming equal weightage per semester for predictive purposes
    const requiredGpa = ((targetCgpa * totalSems) - (currentCgpa * compSems)) / remainingSems;

    // Show animations
    resultCard.classList.remove('hidden');
    setTimeout(() => {
        resultCard.classList.remove('scale-95', 'opacity-0');
    }, 10);

    if (requiredGpa > 10) {
        resultCard.innerHTML = `
            <div class="text-red-500 mb-2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto">
                    <circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Mathematically Impossible</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">You need an average of <span class="font-bold text-red-500 text-base">${requiredGpa.toFixed(2)} GPA</span> in your next ${remainingSems} semesters. Since the maximum GPA is 10.0, you might need to adjust your target slightly.</p>
        `;
    } else if (requiredGpa <= currentCgpa) {
        resultCard.innerHTML = `
            <div class="text-green-500 mb-2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">You're on Track!</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">You only need an average of <span class="font-bold text-green-500 text-base">${requiredGpa.toFixed(2)} GPA</span> in your remaining ${remainingSems} semesters to hit ${targetCgpa}. Keep up the great work!</p>
        `;
    } else {
        resultCard.innerHTML = `
            <div class="text-purple-500 mb-2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>
                </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Time to Grind! 🚀</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">To reach your goal of ${targetCgpa}, you need to score an average of <span class="font-bold text-purple-500 text-lg">${requiredGpa.toFixed(2)} GPA</span> in your next ${remainingSems} semesters. You got this!</p>
        `;
    }
}


// ================= QUICK CALCULATOR =================
let isScientificMode = false;

function toggleScientificMode() {
    isScientificMode = !isScientificMode;
    // Refresh the screen to show/hide the advanced buttons
    let app = document.getElementById("app");
    if(app && currentScreen === "calculator") {
         app.innerHTML = renderCalculator();
    }
}

function handleCalcInput(val) {
    const display = document.getElementById("calc-display");
    if (!display) return;

    if (val === "AC") {
        calcExpression = "";
        display.innerText = "0";
        return;
    }

    if (val === "DEL") {
        if (calcResultShown) {
            calcExpression = "";
            display.innerText = "0";
            calcResultShown = false;
        } else {
            calcExpression = calcExpression.slice(0, -1);
            display.innerText = calcExpression || "0";
        }
        return;
    }
    if (val === "=") {
        try {
            // Advanced Safe Math Parser
            let safeMath = calcExpression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/MOD/g, '%')
                .replace(/asin\(/g, 'Math.asin(')
                .replace(/acos\(/g, 'Math.acos(')
                .replace(/atan\(/g, 'Math.atan(')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/√\(/g, 'Math.sqrt(')
                .replace(/∛\(/g, 'Math.cbrt(')
                .replace(/\^/g, '**')
                .replace(/²/g, '**2')
                .replace(/³/g, '**3');

            // Safely evaluate the expression
            let result = new Function('return ' + safeMath)();
            
            // Format to avoid super long decimals (allow more precision for scientific)
            if (!Number.isInteger(result)) {
                result = parseFloat(result.toFixed(8)); 
            }
            
            // Save to history
            if (calcExpression !== result.toString()) {
                calcHistory.unshift({ expression: calcExpression, result: result });
                if (calcHistory.length > 20) calcHistory.pop();
                localStorage.setItem("calcHistory", JSON.stringify(calcHistory));
                renderCalcHistory(); // Update the history UI
            }

            display.innerText = result;
            calcExpression = result.toString();
            calcResultShown = true;
        } catch (e) {
            display.innerText = "Error";
            calcExpression = "";
        }
        return;
    }

    // Reset if a new number is typed right after a result
    if (calcResultShown && !isNaN(val)) {
        calcExpression = "";
        calcResultShown = false;
    } else if (calcResultShown) {
        calcResultShown = false;
    }

    // Prevent multiple decimals or operators in a row
    const lastChar = calcExpression.slice(-1);
    const operators = ['+', '-', '×', '÷', '.'];
    if (operators.includes(val) && operators.includes(lastChar)) {
        calcExpression = calcExpression.slice(0, -1) + val;
    } else {
        calcExpression += val;
    }
    
    display.innerText = calcExpression;
}

function renderCalcHistory() {
    const container = document.getElementById("calc-history-container");
    if (!container) return;
    
    if (calcHistory.length === 0) {
        container.innerHTML = `<div class="text-center text-sm text-gray-400 dark:text-gray-500 py-4">No history yet</div>`;
        return;
    }
    
    // Updated layout with individual delete buttons
    container.innerHTML = calcHistory.map((item, index) => `
        <div class="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-xl transition">            
            <div class="text-right cursor-pointer flex-1 pl-2 active:scale-95 transition" onclick="useHistoryValue('${item.result}')">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">${item.expression.replace(/\*/g, '×').replace(/\//g, '÷')} =</div>
                <div class="font-bold text-gray-800 dark:text-gray-200">${item.result}</div>
            </div>
            <button onclick="event.stopPropagation(); deleteHistoryItem(${index})" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-full transition" title="Delete this calculation">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
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
    const display = document.getElementById("calc-display");
    if (display) display.innerText = calcExpression;
}

function renderCalculator() {
    calcExpression = "";
    calcResultShown = false;

    // Trigger history render slightly after the DOM updates
    setTimeout(() => {
        renderCalcHistory();
    }, 50);

    return `
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" class="text-blue-500">
                    <g id="Layer_1">
                    	<g>
                    		<circle class="st0" cx="31.8" cy="32" r="32"/>
                    	</g>
                    	<g>
                    		<circle cx="44" cy="37" r="2"/>
                    	</g>
                    	<g>
                    		<circle cx="44" cy="49" r="2"/>
                    	</g>
                    	<g>
                    		<path  d="M28,22c0,1.1-0.9,2-2,2H14c-1.1,0-2-0.9-2-2l0,0c0-1.1,0.9-2,2-2h12C27.1,20,28,20.9,28,22L28,22z"/>
                    	</g>
                    	<g>
                    		<path d="M52,22c0,1.1-0.9,2-2,2H38c-1.1,0-2-0.9-2-2l0,0c0-1.1,0.9-2,2-2h12C51.1,20,52,20.9,52,22L52,22z"/>
                    	</g>
                    	<g>
                    		<path d="M20,30c-1.1,0-2-0.9-2-2V16c0-1.1,0.9-2,2-2l0,0c1.1,0,2,0.9,2,2v12C22,29.1,21.1,30,20,30L20,30z"/>
                    	</g>
                    	<g>
                    		<path d="M52,43c0,1.1-0.9,2-2,2H38c-1.1,0-2-0.9-2-2l0,0c0-1.1,0.9-2,2-2h12C51.1,41,52,41.9,52,43L52,43z"/>
                    	</g>
                    	<g>
                    		<path d="M26.8,50.8c-0.8,0.8-2,0.8-2.8,0L13.2,40c-0.8-0.8-0.8-2,0-2.8l0,0c0.8-0.8,2-0.8,2.8,0L26.8,48
                    			C27.6,48.8,27.6,50,26.8,50.8L26.8,50.8z"/>
                    	</g>
                    	<g>
                    		<path d="M13.2,50.8c-0.8-0.8-0.8-2,0-2.8L24,37.2c0.8-0.8,2-0.8,2.8,0l0,0c0.8,0.8,0.8,2,0,2.8L16,50.8
                    			C15.2,51.6,14,51.6,13.2,50.8L13.2,50.8z"/>
                    	</g>
                    </g>
                    <g id="Layer_2">
                    </g>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Quick Calc</h1>
            </div>
            <div class="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                Utility
            </div>
        </div>

        <div class="card p-4 mb-4">
            <!-- Display Area -->
            <div class="calc-display-container">
                <div id="calc-display" class="calc-display-text scrollbar-hide">0</div>
            </div>

            <!-- Buttons Grid -->
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

        <!-- History Section -->
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
            <div id="calc-history-container" class="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                <!-- History injected here -->
            </div>
        </div>
    `;
}

function renderScientificCalc() {
    return `
        <div class="sci-fullscreen-container">
            <!-- 1. The Display Area (Now visible) -->
            <div class="sci-display-area" id="calc-display">
                ${calcExpression || "0"}
            </div>

            <!-- 2. The 10x5 Grid -->
            <div class="sci-ios-grid">
                <!-- Row 1 -->
                <button onclick="handleCalcInput('(')" class="s-btn s-sci">(</button>
                <button onclick="handleCalcInput(')')" class="s-btn s-sci">)</button>
                <button onclick="handleCalcInput('mc')" class="s-btn s-sci">mc</button>
                <button onclick="handleCalcInput('m+')" class="s-btn s-sci">m+</button>
                <button onclick="handleCalcInput('m-')" class="s-btn s-sci">m-</button>
                <button onclick="handleCalcInput('mr')" class="s-btn s-sci">mr</button>
                <button onclick="handleCalcInput('AC')" class="s-btn s-top">AC</button>
                <button onclick="handleCalcInput('DEL')" class="s-btn s-top">⌫</button>
                <button onclick="handleCalcInput('%')" class="s-btn s-top">%</button>
                <button onclick="handleCalcInput('÷')" class="s-btn s-op">÷</button>

                <!-- Row 2 -->
                <button onclick="handleCalcInput('2nd')" class="s-btn s-sci">2nd</button>
                <button onclick="handleCalcInput('x²')" class="s-btn s-sci">x²</button>
                <button onclick="handleCalcInput('x³')" class="s-btn s-sci">x³</button>
                <button onclick="handleCalcInput('x^y')" class="s-btn s-sci">xʸ</button>
                <button onclick="handleCalcInput('e^x')" class="s-btn s-sci">eˣ</button>
                <button onclick="handleCalcInput('10^x')" class="s-btn s-sci">10ˣ</button>
                <button onclick="handleCalcInput('7')" class="s-btn s-num">7</button>
                <button onclick="handleCalcInput('8')" class="s-btn s-num">8</button>
                <button onclick="handleCalcInput('9')" class="s-btn s-num">9</button>
                <button onclick="handleCalcInput('×')" class="s-btn s-op">×</button>

                <!-- Row 3 -->
                <button onclick="handleCalcInput('1/x')" class="s-btn s-sci">¹/x</button>
                <button onclick="handleCalcInput('√')" class="s-btn s-sci">²√x</button>
                <button onclick="handleCalcInput('∛')" class="s-btn s-sci">³√x</button>
                <button onclick="handleCalcInput('ʸ√x')" class="s-btn s-sci">ʸ√x</button>
                <button onclick="handleCalcInput('ln')" class="s-btn s-sci">ln</button>
                <button onclick="handleCalcInput('log')" class="s-btn s-sci">log</button>
                <button onclick="handleCalcInput('4')" class="s-btn s-num">4</button>
                <button onclick="handleCalcInput('5')" class="s-btn s-num">5</button>
                <button onclick="handleCalcInput('6')" class="s-btn s-num">6</button>
                <button onclick="handleCalcInput('-')" class="s-btn s-op">−</button>

                <!-- Row 4 -->
                <button onclick="handleCalcInput('x!')" class="s-btn s-sci">x!</button>
                <button onclick="handleCalcInput('sin')" class="s-btn s-sci">sin</button>
                <button onclick="handleCalcInput('cos')" class="s-btn s-sci">cos</button>
                <button onclick="handleCalcInput('tan')" class="s-btn s-sci">tan</button>
                <button onclick="handleCalcInput('e')" class="s-btn s-sci">e</button>
                <button onclick="handleCalcInput('EE')" class="s-btn s-sci">EE</button>
                <button onclick="handleCalcInput('1')" class="s-btn s-num">1</button>
                <button onclick="handleCalcInput('2')" class="s-btn s-num">2</button>
                <button onclick="handleCalcInput('3')" class="s-btn s-num">3</button>
                <button onclick="handleCalcInput('+')" class="s-btn s-op">+</button>

                <!-- Row 5 -->
                <button onclick="handleCalcInput('Rad')" class="s-btn s-sci">Rad</button>
                <button onclick="handleCalcInput('sinh')" class="s-btn s-sci">sinh</button>
                <button onclick="handleCalcInput('cosh')" class="s-btn s-sci">cosh</button>
                <button onclick="handleCalcInput('tanh')" class="s-btn s-sci">tanh</button>
                <button onclick="handleCalcInput('π')" class="s-btn s-sci">π</button>
                <button onclick="handleCalcInput('Rand')" class="s-btn s-sci">Rand</button>
                <button onclick="handleCalcInput('0')" class="s-btn s-num s-zero" style="grid-column: span 2;">0</button>
                <button onclick="handleCalcInput('.')" class="s-btn s-num">.</button>
                <button onclick="handleCalcInput('=')" class="s-btn s-op">=</button>
            </div>
        </div>
    `;
}

// ================= NOTES APP =================

function saveNotes() {
    localStorage.setItem("smarthub_notes", JSON.stringify(notes));
}

function renderNotesList() {
    let html = `
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M19,14.5 L19,5.5 C19,4.67157288 18.3284271,4 17.5,4 L6.5,4 C5.67157288,4 5,4.67157288 5,5.5 L5,18.5 C5,19.3284271 5.67157288,20 6.5,20 L13.5,20 C14.3284271,20 15,19.3284271 15,18.5 C15,17.1192881 16.1192881,16 17.5,16 C18.3284271,16 19,15.3284271 19,14.5 L19,14.5 Z M18.5014408,16.7913481 C18.1948298,16.9255432 17.8561101,17 17.5,17 C16.6715729,17 16,17.6715729 16,18.5 C16,18.8561101 15.9255432,19.1948298 15.7913481,19.5014408 C16.9873685,18.9526013 17.9526013,17.9873685 18.5014408,16.7913481 L18.5014408,16.7913481 Z M4,5.5 C4,4.11928813 5.11928813,3 6.5,3 L17.5,3 C18.8807119,3 20,4.11928813 20,5.5 L20,14.5 C20,18.0898509 17.0898509,21 13.5,21 L6.5,21 C5.11928813,21 4,19.8807119 4,18.5 L4,5.5 Z M8.5,9 C8.22385763,9 8,8.77614237 8,8.5 C8,8.22385763 8.22385763,8 8.5,8 L15.5,8 C15.7761424,8 16,8.22385763 16,8.5 C16,8.77614237 15.7761424,9 15.5,9 L8.5,9 Z M8.5,12 C8.22385763,12 8,11.7761424 8,11.5 C8,11.2238576 8.22385763,11 8.5,11 L15.5,11 C15.7761424,11 16,11.2238576 16,11.5 C16,11.7761424 15.7761424,12 15.5,12 L8.5,12 Z M8.5,15 C8.22385763,15 8,14.7761424 8,14.5 C8,14.2238576 8.22385763,14 8.5,14 L13.5,14 C13.7761424,14 14,14.2238576 14,14.5 C14,14.7761424 13.7761424,15 13.5,15 L8.5,15 Z"/>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">My Notes</h1>
            </div>
            <div class="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
                ${notes.length} Saved
            </div>
        </div>

        <button onclick="createNewNote()" class="btn mb-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:opacity-90 text-white border-none shadow-lg shadow-amber-500/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
            </svg>
            Create New Note
        </button>

        <div class="grid grid-cols-2 gap-3">
    `;

    if (notes.length === 0) {
        html += `
            <div class="col-span-2 card text-center py-10 text-gray-500 dark:text-gray-400 border-dashed border-2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="mx-auto mb-3 opacity-50">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <p class="font-medium text-gray-700 dark:text-gray-300">No notes yet</p>
                <p class="text-xs mt-1">Tap above to write your first note.</p>
            </div>
        `;
    } else {
        notes.forEach((note, idx) => {
            // Format date nicely
            let dateObj = new Date(note.updatedAt);
            let dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            
            html += `
                <div onclick="openNote(${idx})" class="card flex flex-col cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition h-40 overflow-hidden relative group p-4 border border-amber-500/10 dark:border-amber-500/20">
                    <h3 class="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1 truncate">${escapeHtml(note.title) || "Untitled Note"}</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-4 flex-1 whitespace-pre-wrap">${escapeHtml(note.body) || "..."}</p>
                    
                    <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span class="text-[10px] text-gray-400 font-medium">${dateStr}</span>
                        <button onclick="event.stopPropagation(); deleteNote(${idx})" class="text-red-400 hover:text-red-600 transition" title="Delete Note">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        });
    }

    html += `</div>`;
    return html;
}

function renderNoteEditor() {
    let note = notes[currentNoteIndex];
    if (!note) return "";

    return `
        <div class="flex flex-col h-[calc(100vh-140px)]">
            <div class="flex items-center justify-between mb-4">
                <div class="text-[10px] text-gray-400 tracking-wider uppercase font-bold">
                    ${note.title ? 'Editing Note' : 'New Note'}
                </div>
            </div>

            <!-- Added id="note-editor-card" here -->
            <div id="note-editor-card" class="flex flex-col flex-1 bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800/50 p-5">
                
                <input type="text" id="note-title" placeholder="Note Title" value="${escapeHtml(note.title)}" 
                    oninput="autoSaveNote()"
                    class="w-full text-xl font-bold bg-transparent text-gray-900 dark:text-white border-none outline-none placeholder-gray-300 dark:placeholder-gray-700 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                
                <textarea id="note-body" placeholder="Start typing your note here..." 
                    oninput="autoSaveNote()"
                    class="w-full flex-1 resize-none bg-transparent text-gray-700 dark:text-gray-300 text-sm leading-relaxed border-none outline-none placeholder-gray-300 dark:placeholder-gray-700 custom-scrollbar">${escapeHtml(note.body)}</textarea>
                
                <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <span id="note-save-status" class="text-xs text-gray-400">All changes saved</span>
                    
                    <!-- Added id="note-done-btn" here -->
                    <button id="note-done-btn" onclick="navigate('notes')" class="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-4 py-1.5 rounded-full font-bold">
                        Done
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Note Action Functions
function createNewNote() {
    let newNote = {
        title: "",
        body: "",
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    notes.unshift(newNote); // Add to beginning of array
    currentNoteIndex = 0;
    saveNotes();
    navigate("note-editor");
}

function openNote(index) {
    currentNoteIndex = index;
    navigate("note-editor");
}

let autoSaveTimeout;
function autoSaveNote() {
    let statusEl = document.getElementById('note-save-status');
    if (statusEl) statusEl.innerText = "Saving...";

    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        let titleEl = document.getElementById('note-title');
        let bodyEl = document.getElementById('note-body');
        
        if (titleEl && bodyEl && notes[currentNoteIndex]) {
            notes[currentNoteIndex].title = titleEl.value;
            notes[currentNoteIndex].body = bodyEl.value;
            notes[currentNoteIndex].updatedAt = Date.now();
            saveNotes();
            
            if (statusEl) statusEl.innerText = "Saved just now";
        }
    }, 500); // Auto-save 500ms after user stops typing
}

function deleteNote(index) {
    showConfirm(
        "Delete Note?", 
        "Are you sure you want to permanently delete this note?", 
        "Delete Note",
        () => {
            notes.splice(index, 1);
            saveNotes();
            render(); // Re-render the notes list
        }
    );
}

// ================= CO-PO =================

function renderCOPO() {
    return `
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-blue-600 dark:text-blue-400">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <path d="M12 22V12M9 10.5L12 9l3 1.5"/>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">CO-PO Calculator</h1>
            </div>
            <div class="flex gap-2">
                <button onclick="copoMode='input'" 
                    class="text-xs px-3 py-1 rounded-full transition ${copoMode === 'input' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}">
                    Input
                </button>
                <button onclick="copoMode='output'" 
                    class="text-xs px-3 py-1 rounded-full transition ${copoMode === 'output' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}">
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


// ================= VISION & MISSION DATA =================
let vmData = {
    faculties: [
        {
            id: "fac_engineering",
            name: "Faculty of Engineering and Technology",
            vision: "Providing world class quality education with strong ethical values to nurture and develop outstanding professionals fit for globally competitive environment.",
            mission: [
                "Provide quality technical education with a sound footing on basic engineering principles, technical and managerial skills, and innovative research capabilities.",
                "Transform the students into outstanding professionals and technocrats with strong ethical values capable of creating, developing and managing global engineering enterprises.",
                "Develop a Global Knowledge Hub, striving continuously in pursuit of excellence in Education, Research, Entrepreneurship and Technological services to the Industry and Society. ",
                "Inculcate the importance and methodology of life-long learning to move forward with updated knowledge to face the challenges of tomorrow."
            ],
            departments: [
                {
                    id: "dept_che",
                    name: "Department of Chemical Engineering",
                    vision: "Strive to be widely acknowledged as a department imparting Chemical Engineering with a strong three pronged commitment to education, research and extension to effectively address the societal needs fostered by a culture encompassing innovation, ethics and excellence and by embracing the good practices in education.",
                    mission: [
                        "Impart quality Chemical Engineering education through a carefully devised program garnered by a curriculum meeting the global benchmarks with an extensive exposure to fundamentals and industrial applications",
                        "Transform the students and render them to take up successful careers in Chemical Engineering and prepare them to be leaders and responsible citizens in order to contribute to the society by exhibiting highest degree of professional standards, integrity and ethics. ",
                        "Expose the students to real time industrial problems and imbibe entrepreneurship by engaging them with interactions involving experts from the industry and the alumni.",
                        "Infuse the students with social responsibility to meet the future challenges to provide pertinent solutions for sustainable development through professional competency."
                    ]
                },
                {
                    id: "dept_ce",
                    name: "Department of Civil Engineering",
                    vision: "To become School of Excellence in Civil Engineering with Conformity, Quality and Standards in teaching, research, training and consultancy towards producing globally competent Civil Engineers",
                    mission: [
                        "To promote quality of education, research and extension for satisfying the needs of infrastructure industry and society",
                        "To provide state-of-the-art facilities and resources that contributes to a congenial learning environment",
                        "To establish Centre of Excellence in emerging areas of Civil Engineering for the students to acquire domain specific expertise and also facilitate Industry- Institution interaction",
                        "To inspire the students to pursue higher education and take competitive examinations and various career enhancing programs",
                        "To instil the professional ethics and their role in Sustainable development and building corruption-free country"
                    ]
                },
                {
                    id: "dept_cz",
                    name: "Department of Civil & Structural Engineering",
                    vision: "To impart high quality education and technical expertise to the students and inculcate in them humanistic attitude, scientific temper, sense of commitment to the profession and spirit of participation in nation building.",
                    mission: [
                        "Provide quality education and knowledge base to the students in structural engineering.",
                        "Prepare the students as nationally competitive and trend setters for the future generation in the realm of technical education.",
                        "Assimilate the available theories, explore new frontiers, to propound new theories which will result in improving the quality of the life of the student community.",
                        "Develop personality of the students in a healthy way and to provide opportunity to acquire knowledge in state-of-the-art research.",
                        "Provide service to the university, engineering profession, and the public through consultancy services."
                    ]
                },
                {
                    id: "dept_cse",
                    name: "Department of Computer Science & Engineering",
                    vision: "To provide a congenial ambience for individuals to develop and blossom as academically superior, socially conscious and nationally responsible citizens.",
                    mission: [
                        "Impart high quality computer knowledge to the students through a dynamic scholastic environment wherein they learn to develop technical,communication and leadership skills to bloom as a versatile professional.",
                        "Develop life-long learning ability that allows them to be adaptive and responsive to the changes in career, society, technology, and environment.",
                        "Build student community with high ethical standards to undertake innovative research and development in thrust areas of national and international needs.",
                        "Expose the students to the emerging technological advancements for meeting the demands of the industry."
                    ]
                },
                {
                    id: "dept_eee",
                    name: "Department of Electrical and Electronics Engineering",
                    vision: "To develop the Department into a Centre of Excellence with a perspective to provide quality education and skill-based training with state-of-the-art technologies to the students, thereby enabling them to become achievers and contributors to the Industry, Society and Nation together with a sense of commitment to the profession.",
                    mission: [
                        "To impart quality education in tune with emerging technological developments in the field of Electrical and Electronics Engineering.",
                        "To provide practical hands-on-training with a view to understand the theoretical concepts and latest technological developments.",
                        "To produce employable and self-employable graduates.",
                        "To nurture the personality traits among the students in different dimensions emphasizing the ethical values and to address the diversified societal needs of the Nation.",
                        "To create futuristic ambience with the state-of-the-art facilities for pursuing research."
                    ]
                },
                {
                    id: "dept_ece",
                    name: "Department of Electronics and Communication Engineering",
                    vision: "To provide innovative, creative and technically competent Electronic and Communication Engineers for industry and society through excellence in Technical Education and Research.",
                    mission: [
                        "To provide quality education in the field of Electronics and Communication Engineering through periodically updating curriculum, effective teaching-learning process, best laboratory facilities and collaborative ventures with the industries.",
                        "To inculcate innovative skills, research aptitude, team work, ethical practices among students so as to meet the expectations of the industry as well as society.",
                        "To adopt the best educational methods to improve teaching learning process continuously.",
                        "To provide students with training on latest technology with supporting software.",
                        "To facilitate effective interactions among faculty and students, and foster networking with alumni, industries and other institutions of repute."
                    ]
                },
                {
                    id: "dept_eie",
                    name: "Department of Electronics and Instrumentation Engineering",
                    vision: "To nurture higher echelons of technology through participative education, innovative and collaborative research with a view to bring out employable graduates of International standard and to achieve excellence in all spheres of education.",
                    mission: [
                        "To establish state of the art facilities related to diverse dimensions in the field of Electronics and Instrumentation Engineering.",
                        "To foster higher quality of education with equivocal focus in theory and practical areas of Electronics, MEMS, Control and Instrumentation Engineering.",
                        "To ensure that the dissemination of knowledge reaches the stakeholders and forge the opening of a fresh flair of human resources.",
                        "To create opportunities for advancements in different facets of this discipline and offer avenues to reach the citadels of one's career.",
                        "To unveil excellence in research projects and consultancy services for the betterment of the global community."
                    ]
                },
                {
                    id: "dept_it",
                    name: "Department of Information Technology",
                    vision: "To produce globally competent, quality technocrats, to inculcate values of leadership and research qualities and to play a vital role in the socio – economic progress of the nation.",
                    mission: [
                        "To partner with the University community to understand the information technology needs of faculty, staff and students.",
                        "To develop dynamic IT professionals with globally competitive learning experience by providing high class education.",
                        "To involve graduates in understanding need based Research activities and disseminate the knowledge to develop entrepreneur skills."
                    ]
                },
                {
                    id: "dept_me",
                    name: "Department of Mechanical Engineering",
                    vision: "The Mechanical Engineering Department endeavors to be recognized globally for outstanding education and research leading to well-qualified engineers, who are innovative, entrepreneurial and successful in advanced fields of Mechanical Engineering to cater to the ever changing industrial demands and social needs.",
                    mission: [
                        "Prepare the graduates to pursue life-long learning, serve the profession and meet intellectual, ethical and career challenges.",
                        "Extend a vital, state-of-the-art infrastructure to the students and faculty with opportunities to create, interpret, apply and disseminate knowledge.",
                        "Develop the student community with wider knowledge in the emerging fields of Mechanical Engineering.",
                        "Provide set of skills, knowledge and attitude that will permit the graduates to succeed and thrive as engineers and leaders.",
                        "Create a conducive and supportive environment for all round growth of the students, faculty & staff."
                    ]
                },
                {
                    id: "dept_mf",
                    name: "Department of Manufacturing Engineering",
                    vision: "Provide high quality education to create technically competent Mechanical and Manufacturing Engineers to strive hard for the sustainable development of industry and society and to serve for the nation building.",
                    mission: [
                        "Develop the student community with wider knowledge in the emerging fields of Mechanical Engineering with more emphasis on Manufacturing Engineering.",
                        "Inculcate innovative skills, research aptitude, team work, ethical practices among students so as to meet the expectations of the industry as well as the society.",
                        "Motivate the students to pursue higher education and take competitive examinations and various career enhancing program.",
                        "Create a conducive and supportive environment for all round growth of the students, faculty & staff with emphasis on life-long learning.",
                        "Provide quality education by periodically updating curriculum, effective teaching-learning process, best laboratory facilities and collaborative ventures with the industries."
                    ]
                },
                {
                    id: "dept_ph",
                    name: "Department of Pharmacy",
                    vision: "The Department of Pharmacy is committed to create an environment and support, where the individual aspires to be a self-learner and act responsibly in her/his endeavours: Self, Society and Nation.",
                    mission: [
                        "Excel in creating scientific manpower for the Pharmaceutical sector globally.",
                        "Significantly contribute to indigenous Pharmaceutical research.",
                        "Actively participate in hospital and community health services.",
                        "Promote collaborative higher education in association with Industry and Hospitals.",
                        "Collaborate with Industry in pursuing mutually beneficial research and development for commercialization.",
                        "Be socially responsible and create mass awareness on health and environmental issues for the benefit of humanity."
                    ]
                }
            ]
        }
    ],
    selectedFaculty: null,
    selectedDepartment: null
};

function renderVisionMission() {
    const selectedFaculty = vmData.selectedFaculty ? vmData.faculties.find(f => f.id === vmData.selectedFaculty) : null;
    const selectedDepartment = selectedFaculty && vmData.selectedDepartment ?
        selectedFaculty.departments.find(d => d.id === vmData.selectedDepartment) : null;

    return `
        <!-- Header Section -->
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-white">Vision & Mission</h1>
            </div>
            <div class="text-xs px-3 py-1 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                Institutional Goals
            </div>
        </div>

        <!-- Faculty Dropdown -->
        <div class="card mb-4">
            <h3 class="font-bold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
                Select Faculty
            </h3>
            <select id="facultySelect" onchange="onFacultyChange(this.value)" 
                class="w-full p-3 rounded-xl border bg-white text-gray-800 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition">
                <option value="">-- Select a Faculty --</option>
                ${vmData.faculties.map(faculty => `
                    <option value="${faculty.id}" ${vmData.selectedFaculty === faculty.id ? 'selected' : ''}>
                        ${faculty.name}
                    </option>
                `).join("")}
            </select>
        </div>

        ${vmData.selectedFaculty ? `
        <!-- Department Dropdown -->
        <div class="card mb-4">
            <h3 class="font-bold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                </svg>
                Select Department
            </h3>
            <select id="departmentSelect" onchange="onDepartmentChange(this.value)" 
                class="w-full p-3 rounded-xl border bg-white text-gray-800 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition">
                <option value="">-- Select a Department --</option>
                ${selectedFaculty.departments.map(dept => `
                    <option value="${dept.id}" ${vmData.selectedDepartment === dept.id ? 'selected' : ''}>
                        ${dept.name}
                    </option>
                `).join("")}
            </select>
        </div>
        ` : ''}

        <!-- Faculty Vision & Mission (Always visible when faculty is selected) -->
        ${vmData.selectedFaculty ? `
        <div class="card mt-4">
            <div class="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-blue-600 dark:text-blue-400">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <h3 class="font-bold text-lg text-gray-800 dark:text-white">${selectedFaculty.name}</h3>
            </div>
            <div class="space-y-4">
                <div class="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <h4 class="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 8v4l3 3"/>
                        </svg>
                        Faculty Vision
                    </h4>
                    <p class="text-gray-700 dark:text-gray-200 leading-relaxed">${selectedFaculty.vision}</p>
                </div>
                <div class="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <h4 class="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        Faculty Mission
                    </h4>
                    <ul class="list-disc ml-5 text-gray-700 dark:text-gray-200 space-y-1">
                        ${selectedFaculty.mission.map(m => `<li>${m}</li>`).join("")}
                    </ul>
                </div>
            </div>
        </div>
        ` : ''}

        <!-- Department Vision & Mission (Shows when department is selected, otherwise shows message) -->
        ${vmData.selectedDepartment ? `
        <div class="card mt-4">
            <div class="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-purple-600 dark:text-purple-400">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18M9 21v-6h6v6"/>
                </svg>
                <h3 class="font-bold text-lg text-gray-800 dark:text-white">${selectedDepartment.name}</h3>
            </div>
            <div class="space-y-4">
                <div class="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <h4 class="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 8v4l3 3"/>
                        </svg>
                        Department Vision
                    </h4>
                    <p class="text-gray-700 dark:text-gray-200 leading-relaxed">${selectedDepartment.vision}</p>
                </div>
                <div class="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <h4 class="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        Department Mission
                    </h4>
                    <ul class="list-disc ml-5 text-gray-700 dark:text-gray-200 space-y-1">
                        ${selectedDepartment.mission.map(m => `<li>${m}</li>`).join("")}
                    </ul>
                </div>
            </div>
        </div>

        <!-- Reset Button -->
        <button onclick="resetVisionMission()" class="btn-secondary btn mt-4 w-full flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
            Clear Selection
        </button>
        ` : vmData.selectedFaculty ? `
        <!-- Message when faculty selected but no department -->
        <div class="card mt-4 text-center py-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="mx-auto mb-3 text-gray-400 dark:text-gray-500">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
            </svg>
            <p class="text-gray-600 dark:text-gray-300">Select a department to view department vision & mission</p>
        </div>
        ` : ''}
    `;
}

function onFacultyChange(facultyId) {
    vmData.selectedFaculty = facultyId || null;
    vmData.selectedDepartment = null;
    render();
}

function onDepartmentChange(departmentId) {
    vmData.selectedDepartment = departmentId || null;
    render();
}

function resetVisionMission() {
    vmData.selectedFaculty = null;
    vmData.selectedDepartment = null;
    render();
}

// Make functions globally accessible
window.onFacultyChange = onFacultyChange;
window.onDepartmentChange = onDepartmentChange;
window.resetVisionMission = resetVisionMission;


// ================= STORAGE =================
function save() {
    if (currentProfileIndex !== null && profiles[currentProfileIndex]) {
        // Sync active semesters back into the selected profile
        profiles[currentProfileIndex].semesters = semesters;
    }
    // Save the entire profiles array
    localStorage.setItem("cgpa_profiles", JSON.stringify(profiles));
}

// ================= MAIN RENDER =================
function render() {
    let app = document.getElementById("app");
    if (!app) return;

    // 1. Handle Fullscreen & Rotation Logic
    let header = document.querySelector("header");
    let footer = document.querySelector("footer");

    if (currentScreen === "scientific-calc") {
        // Hide standard UI wrappers
        if (header) header.style.display = "none";
        if (footer) footer.style.display = "none";
        
        // Remove padding so calc touches screen edges
        app.className = "m-0 p-0 max-w-full";
        
        // Force Landscape Rotation
        if (window.screen && screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(e => console.log("Orientation lock failed", e));
        }
    } else {
        // Restore standard UI wrappers
        if (header) header.style.display = "flex";
        if (footer) footer.style.display = "block";
        
        // Restore standard padding for the rest of the app
        app.className = "p-5 max-w-3xl mx-auto pb-28";
        
        // Unlock Rotation to return to Portrait
        if (window.screen && screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }
    }

    // 2. Render the actual screens
    if (currentScreen === "home") app.innerHTML = renderHome();
    if (currentScreen === "profiles") app.innerHTML = renderProfiles();
    if (currentScreen === "target-cgpa") app.innerHTML = renderTargetCGPA();
    if (currentScreen === "calculator") app.innerHTML = renderCalculator();
    if (currentScreen === "scientific-calc") app.innerHTML = renderScientificCalc();
    if (currentScreen === "notes") app.innerHTML = renderNotesList();
    if (currentScreen === "note-editor") app.innerHTML = renderNoteEditor();
    
    if (currentScreen === "cgpa") {
        app.innerHTML = renderCGPA();
        if (semesters.length > 0) {
            setTimeout(() => { renderCGPAChart(); }, 100);
        }
    }
    if (currentScreen === "semester") app.innerHTML = renderSemester();
    if (currentScreen === "copo") app.innerHTML = renderCOPO();
    if (currentScreen === "visionmission") app.innerHTML = renderVisionMission();
}

// ================= HARDWARE BACK BUTTON LOGIC =================
function handleHardwareBack(e) {
    e.preventDefault();
    e.stopPropagation();

    if (historyStack.length > 0) {
        goBack();
    } else if (currentScreen !== "home") {
        currentScreen = "home";
        render();
        updateBackBtn();
    } else {
        exitApp();
    }
}

// ================= INIT =================
document.addEventListener("deviceready", function () {
    applyTheme();
    document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);
    document.addEventListener("backbutton", handleHardwareBack, false);
    render();
}, false);

document.addEventListener("DOMContentLoaded", function () {
    if (!window.cordova) {
        applyTheme();
        document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);
        render();
    }
});