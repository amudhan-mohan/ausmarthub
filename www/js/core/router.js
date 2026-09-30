// ================= SCREEN TITLES =================
const SCREEN_TITLES = {
    "home": "AU Smart Hub",
    "profiles": "CGPA Profiles",
    "cgpa": "CGPA Details",
    "semester": "Semester Subjects",
    "target-cgpa": "Goal Setter",
    "calculator": "Quick Calculator",
    "scientific-calc": "Scientific Calculator",
    "notes": "My Notes",
    "note-editor": "Note Editor",
    "pomodoro": "Focus Timer",
    "timetable": "Class Schedule",
    "assignments": "Assignments",
    "nptel-profiles": "NPTEL Courses",
    "nptel-calc": "NPTEL Calculator",
    "study-browser": "Study Browser",
    "study-browser-web": "Ad-Block Web",
    "study-browser-reader": "Reader Mode",
    "copo": "CO-PO Calculator",
    "visionmission": "Vision & Mission",
    "more-tools": "Tools & Hub",
    "about-app": "About App",
    "about-au": "About AU",
    "dev-info": "Development & Versions",
    "about-dev": "About Developer"
};

// ================= RESET SCROLL HELPER =================
function resetScrollPosition() {
    let app = document.getElementById("app");
    if (app) {
        app.scrollTop = 0;
        app.scrollLeft = 0;
    }
    window.scrollTo(0, 0);
    if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
    }
    if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
    }
}

// ================= NAVIGATION =================
function switchBottomTab(tab) {
    triggerHaptic(12);
    if (currentScreen === tab) {
        resetScrollPosition();
        return;
    }

    // Reset history stack on primary tab switch for native tab behavior
    historyStack = [];
    if (tab !== "home") {
        try {
            if (window.history && window.history.pushState) {
                window.history.pushState({ screen: tab }, "");
            }
        } catch (e) {}
    }
    currentScreen = tab;
    render();
    updateAppHeader();
    updateBottomNav();
    resetScrollPosition();
}

function navigate(screen) {
    if (currentScreen === screen) {
        resetScrollPosition();
        return;
    }
    triggerHaptic(10);
    // Avoid pushing duplicate consecutive screens onto historyStack
    if (historyStack.length === 0 || historyStack[historyStack.length - 1] !== currentScreen) {
        historyStack.push(currentScreen);
    }
    try {
        if (window.history && window.history.pushState) {
            window.history.pushState({ screen: screen }, "");
        }
    } catch (e) {}
    currentScreen = screen;
    render();
    updateAppHeader();
    updateBottomNav();
    resetScrollPosition();
}

function goBack() {
    triggerHaptic(10);
    // If calculator settings sheet is open, dismiss it first without navigating away
    const calcOverlay = document.getElementById('calc-settings-overlay') || document.getElementById('calc-settings-sheet');
    if (calcOverlay) {
        if (typeof closeCalcSettings === "function") {
            closeCalcSettings();
        } else {
            calcOverlay.remove();
        }
        return;
    }
    // If inside a specific class timetable view, return to classes list
    if (currentScreen === "timetable" && typeof currentSelectedClassId !== "undefined" && currentSelectedClassId !== null) {
        currentSelectedClassId = null;
        render();
        resetScrollPosition();
        return;
    }
    // If inside note editor, cleanly exit note editor
    if (currentScreen === "note-editor") {
        if (typeof cleanEmptyNotes === "function") cleanEmptyNotes();
        historyStack = historyStack.filter(s => s !== "note-editor");
        currentScreen = "notes";
        render();
        updateAppHeader();
        updateBottomNav();
        resetScrollPosition();
        return;
    }
    // If inside in-app browser web or reader mode, return cleanly to study browser hub
    if (currentScreen === "study-browser-web" || currentScreen === "study-browser-reader") {
        // Strip any web / reader entries from historyStack to prevent back-forward loops
        historyStack = historyStack.filter(s => s !== "study-browser-web" && s !== "study-browser-reader");
        currentScreen = "study-browser";
        render();
        updateAppHeader();
        updateBottomNav();
        resetScrollPosition();
        return;
    }
    // If on study browser hub, return to more-tools or previous screen outside browser
    if (currentScreen === "study-browser") {
        historyStack = historyStack.filter(s => !s.startsWith("study-browser"));
        currentScreen = historyStack.pop() || "more-tools";
        render();
        updateAppHeader();
        updateBottomNav();
        resetScrollPosition();
        return;
    }
    // If on a primary bottom tab (other than home) with empty stack, return to home
    const primaryTabs = ["profiles", "timetable", "notes", "more-tools"];
    if (primaryTabs.includes(currentScreen) && historyStack.length === 0) {
        currentScreen = "home";
        render();
        updateAppHeader();
        updateBottomNav();
        resetScrollPosition();
        return;
    }

    // Strip trailing occurrences of currentScreen if any were pushed
    while (historyStack.length > 0 && historyStack[historyStack.length - 1] === currentScreen) {
        historyStack.pop();
    }

    currentScreen = historyStack.pop() || "home";
    render();
    updateAppHeader();
    updateBottomNav();
    resetScrollPosition();
}

function updateAppHeader() {
    let mainHeader = document.getElementById("mainHeader");
    let backBtn = document.getElementById("navBackBtn");
    let logoWrapper = document.getElementById("headerLogoWrapper");
    let titleEl = document.getElementById("headerScreenTitle");
    let isHome = currentScreen === "home";

    // Hide app top header entirely during in-app browsing & reading for full-screen immersive view
    if (mainHeader) {
        if (["scientific-calc", "study-browser-web", "study-browser-reader"].includes(currentScreen)) {
            mainHeader.style.display = "none";
            mainHeader.classList.add("hidden");
        } else {
            mainHeader.style.display = "";
            mainHeader.classList.remove("hidden");
        }
    }

    if (backBtn && logoWrapper) {
        if (isHome) {
            backBtn.classList.add("hidden");
            logoWrapper.classList.remove("hidden");
            if (titleEl) titleEl.classList.add("hidden");
        } else {
            backBtn.classList.remove("hidden");
            logoWrapper.classList.add("hidden");
            if (titleEl) {
                titleEl.textContent = SCREEN_TITLES[currentScreen] || "AU Smart Hub";
                titleEl.classList.remove("hidden");
            }
        }
    }
}

function updateBottomNav() {
    const tabs = ["home", "profiles", "timetable", "notes", "more-tools"];
    let activeTabId = "home";

    if (currentScreen === "home") activeTabId = "home";
    else if (["profiles", "cgpa", "semester", "target-cgpa"].includes(currentScreen)) activeTabId = "profiles";
    else if (currentScreen === "timetable") activeTabId = "timetable";
    else if (["notes", "note-editor"].includes(currentScreen)) activeTabId = "notes";
    else activeTabId = "more-tools";

    tabs.forEach(tab => {
        let btn = document.getElementById(`tab-${tab}`);
        if (btn) {
            if (tab === activeTabId) {
                btn.classList.add("active", "text-blue-600", "dark:text-blue-400");
                btn.classList.remove("text-slate-400", "dark:text-slate-500");
            } else {
                btn.classList.remove("active", "text-blue-600", "dark:text-blue-400");
                btn.classList.add("text-slate-400", "dark:text-slate-500");
            }
        }
    });

    let bottomNav = document.getElementById("bottomNav");
    if (bottomNav) {
        // Hide bottom nav on full-screen browser, reader, editor, scientific calc & dedicated about views
        const noBottomNavScreens = [
            "scientific-calc", "note-editor", "study-browser-web", "study-browser-reader",
            "about-app", "about-au", "dev-info", "about-dev"
        ];
        if (noBottomNavScreens.includes(currentScreen)) {
            bottomNav.style.display = "none";
            bottomNav.classList.add("translate-y-full", "hidden");
        } else {
            bottomNav.style.display = "";
            bottomNav.classList.remove("translate-y-full", "hidden");
        }
    }
}

// ================= MAIN RENDER =================
let lastRenderedScreen = null;

function render() {
    let app = document.getElementById("app");
    if (!app) return;

    let screenChanged = (lastRenderedScreen !== currentScreen);
    lastRenderedScreen = currentScreen;

    let header = document.getElementById("mainHeader");
    let bottomNav = document.getElementById("bottomNav");

    if (["scientific-calc", "study-browser-web", "study-browser-reader"].includes(currentScreen)) {
        if (header) {
            header.style.display = "none";
            header.classList.add("hidden");
        }
        if (bottomNav) {
            bottomNav.style.display = "none";
            bottomNav.classList.add("translate-y-full", "hidden");
        }
        app.className = "m-0 p-0 max-w-full w-full h-full overflow-hidden";

        if (currentScreen === "scientific-calc" && window.screen && screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(e => console.log("Landscape lock note:", e));
        }
    } else {
        if (header) {
            header.style.display = "";
            header.classList.remove("hidden");
        }
        if (["about-app", "about-au", "dev-info", "about-dev"].includes(currentScreen)) {
            if (bottomNav) {
                bottomNav.style.display = "none";
                bottomNav.classList.add("translate-y-full", "hidden");
            }
            app.className = "flex-1 w-full max-w-xl mx-auto px-4 py-3 pb-8 focus:outline-none overflow-y-auto custom-scrollbar";
        } else {
            if (bottomNav) {
                bottomNav.style.display = "";
                bottomNav.classList.remove("translate-y-full", "hidden");
            }
            app.className = "flex-1 w-full max-w-xl mx-auto px-4 py-3 pb-20 focus:outline-none overflow-y-auto custom-scrollbar";
        }

        if (window.screen && screen.orientation && screen.orientation.unlock) {
            try { screen.orientation.unlock(); } catch (e) {}
        }
    }

    updateAppHeader();
    updateBottomNav();

    if (currentScreen === "home") app.innerHTML = renderHome();
    else if (currentScreen === "profiles") app.innerHTML = renderProfiles();
    else if (currentScreen === "target-cgpa") app.innerHTML = renderTargetCGPA();
    else if (currentScreen === "calculator") app.innerHTML = renderCalculator();
    else if (currentScreen === "scientific-calc") app.innerHTML = renderScientificCalc();
    else if (currentScreen === "notes") app.innerHTML = renderNotesList();
    else if (currentScreen === "note-editor") app.innerHTML = renderNoteEditor();
    else if (currentScreen === "pomodoro") app.innerHTML = renderPomodoro();
    else if (currentScreen === "timetable") app.innerHTML = renderTimetable();
    else if (currentScreen === "assignments") app.innerHTML = renderAssignments();
    else if (currentScreen === "nptel-profiles") app.innerHTML = renderNptelProfiles();
    else if (currentScreen === "nptel-calc") app.innerHTML = renderNptelCalc();
    else if (currentScreen === "study-browser") app.innerHTML = renderStudyBrowser();
    else if (currentScreen === "study-browser-web") {
        app.innerHTML = renderBrowserWeb();
        setTimeout(() => { if (typeof initInAppBrowserPage === "function") initInAppBrowserPage(); }, 50);
    }
    else if (currentScreen === "study-browser-reader") app.innerHTML = renderReaderMode();
    else if (currentScreen === "cgpa") {
        app.innerHTML = renderCGPA();
        if (semesters && semesters.length > 0) {
            setTimeout(() => { renderCGPAChart(); }, 100);
        }
    }
    else if (currentScreen === "semester") app.innerHTML = renderSemester();
    else if (currentScreen === "copo") app.innerHTML = renderCOPO();
    else if (currentScreen === "visionmission") app.innerHTML = renderVisionMission();
    else if (currentScreen === "more-tools") app.innerHTML = renderMoreToolsHub();
    else if (currentScreen === "about-app") app.innerHTML = renderAboutApp();
    else if (currentScreen === "about-au")  app.innerHTML = renderAboutAU();
    else if (currentScreen === "dev-info")  app.innerHTML = renderDevInfo();
    else if (currentScreen === "about-dev") app.innerHTML = renderAboutDev();
    else app.innerHTML = renderHome();

    if (screenChanged) {
        resetScrollPosition();
        if (typeof requestAnimationFrame === "function") {
            requestAnimationFrame(() => {
                resetScrollPosition();
            });
        }
    }
}

function renderMoreToolsHub() {
    return `
        <div class="flex items-center justify-between mb-4">
            <div>
                <h1 class="text-xl font-extrabold text-slate-900 dark:text-white">Tools & Utilities</h1>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Academic & productivity suite</p>
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                9 Apps
            </span>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-6">
            <!-- Study Browser (Ad-Block & Reader) -->
            <div onclick="navigate('study-browser')" class="card card-interactive p-4 flex flex-col justify-between h-36 bg-gradient-to-br from-emerald-50/70 to-white dark:from-emerald-950/20 dark:to-slate-900 border-emerald-200/80 dark:border-emerald-800/40">
                <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                        <span>Study Browser</span>
                        <span class="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">SHIELD</span>
                    </h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ad-Block & Reader Mode</p>
                </div>
            </div>

            <!-- NPTEL Tracker -->
            <div onclick="navigate('nptel-profiles')" class="card card-interactive p-4 flex flex-col justify-between h-36 bg-gradient-to-br from-indigo-50/70 to-white dark:from-indigo-950/20 dark:to-slate-900 border-indigo-100 dark:border-indigo-900/40">
                <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 dark:text-white text-sm">NPTEL Calc</h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Top 8 Internal Tracker</p>
                </div>
            </div>

            <!-- Assignments -->
            <div onclick="navigate('assignments')" class="card card-interactive p-4 flex flex-col justify-between h-36 bg-gradient-to-br from-rose-50/70 to-white dark:from-rose-950/20 dark:to-slate-900 border-rose-100 dark:border-rose-900/40">
                <div class="w-10 h-10 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                    </svg>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 dark:text-white text-sm">Assignments</h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Reminders & Deadlines</p>
                </div>
            </div>

            <!-- Focus Timer (Pomodoro) -->
            <div onclick="navigate('pomodoro')" class="card card-interactive p-4 flex flex-col justify-between h-36 bg-gradient-to-br from-amber-50/70 to-white dark:from-amber-950/20 dark:to-slate-900 border-amber-100 dark:border-amber-900/40">
                <div class="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 dark:text-white text-sm">Focus Timer</h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pomodoro Study Ring</p>
                </div>
            </div>

            <!-- Goal Setter -->
            <div onclick="navigate('target-cgpa')" class="card card-interactive p-4 flex flex-col justify-between h-36 bg-gradient-to-br from-purple-50/70 to-white dark:from-purple-950/20 dark:to-slate-900 border-purple-100 dark:border-purple-900/40">
                <div class="w-10 h-10 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 dark:text-white text-sm">Goal Setter</h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Predict Target GPA</p>
                </div>
            </div>

            <!-- Quick Calc -->
            <div onclick="navigate('calculator')" class="card card-interactive p-4 flex flex-col justify-between h-36 bg-gradient-to-br from-cyan-50/70 to-white dark:from-cyan-950/20 dark:to-slate-900 border-cyan-100 dark:border-cyan-900/40">
                <div class="w-10 h-10 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
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
                    </svg>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 dark:text-white text-sm">Quick Calc</h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Basic Math & History</p>
                </div>
            </div>

            <!-- Sci Calc -->
            <div onclick="navigate('scientific-calc')" class="card card-interactive p-4 flex flex-col justify-between h-36 bg-gradient-to-br from-blue-50/70 to-white dark:from-blue-950/20 dark:to-slate-900 border-blue-100 dark:border-blue-900/40">
                <div class="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M12.71,17.29a1,1,0,0,0-.16-.12.56.56,0,0,0-.17-.09.6.6,0,0,0-.19-.06.93.93,0,0,0-.57.06.9.9,0,0,0-.54.54A.84.84,0,0,0,11,18a1,1,0,0,0,.07.38,1.46,1.46,0,0,0,.22.33A1,1,0,0,0,12,19a.84.84,0,0,0,.38-.08,1.15,1.15,0,0,0,.33-.21A1,1,0,0,0,13,18a1,1,0,0,0-.08-.38A1,1,0,0,0,12.71,17.29ZM8.55,13.17a.56.56,0,0,0-.17-.09A.6.6,0,0,0,8.19,13a.86.86,0,0,0-.39,0l-.18.06-.18.09-.15.12A1.05,1.05,0,0,0,7,14a1,1,0,0,0,.29.71,1.15,1.15,0,0,0,.33.21A1,1,0,0,0,9,14a1.05,1.05,0,0,0-.29-.71Zm.16,4.12a1,1,0,0,0-.33-.21A1,1,0,0,0,7.8,17l-.18.06a.76.76,0,0,0-.18.09,1.58,1.58,0,0,0-.15.12,1,1,0,0,0-.21.33.94.94,0,0,0,0,.76,1.15,1.15,0,0,0,.21.33A1,1,0,0,0,8,19a.84.84,0,0,0,.38-.08,1.15,1.15,0,0,0,.33-.21,1.15,1.15,0,0,0,.21-.33.94.94,0,0,0,0-.76A1,1,0,0,0,8.71,17.29Zm2.91-4.21a1,1,0,0,0-.33.21A1.05,1.05,0,0,0,11,14a1,1,0,0,0,1.38.92,1.15,1.15,0,0,0,.33-.21A1,1,0,0,0,13,14a1.05,1.05,0,0,0-.29-.71A1,1,0,0,0,11.62,13.08Zm5.09,4.21a1.15,1.15,0,0,0-.33-.21,1,1,0,0,0-1.09.21,1,1,0,0,0-.21.33.94.94,0,0,0,0,.76,1.15,1.15,0,0,0,.21.33A1,1,0,0,0,16,19a.84.84,0,0,0,.38-.08,1.15,1.15,0,0,0,.33-.21,1.15,1.15,0,0,0,.21-1.09A1,1,0,0,0,16.71,17.29ZM16,5H8A1,1,0,0,0,7,6v4a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V6A1,1,0,0,0,16,5ZM15,9H9V7h6Zm3-8H6A3,3,0,0,0,3,4V20a3,3,0,0,0,3,3H18a3,3,0,0,0,3-3V4A3,3,0,0,0,18,1Zm1,19a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V4A1,1,0,0,1,6,3H18a1,1,0,0,1,1,1Zm-2.45-6.83a.56.56,0,0,0-.17-.09.6.6,0,0,0-.19-.06.86.86,0,0,0-.39,0l-.18.06-.18.09-.15.12A1.05,1.05,0,0,0,15,14a1,1,0,0,0,1.38.92,1.15,1.15,0,0,0,.33-.21A1,1,0,0,0,17,14a1.05,1.05,0,0,0-.29-.71Z"/>
                    </svg>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 dark:text-white text-sm">Sci-Calc</h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Landscape 50-Key Engine</p>
                </div>
            </div>

            <!-- CO-PO Analyzer -->
            <div onclick="navigate('copo')" class="card card-interactive p-4 flex flex-col justify-between h-36 bg-gradient-to-br from-emerald-50/70 to-white dark:from-emerald-950/20 dark:to-slate-900 border-emerald-100 dark:border-emerald-900/40">
                <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <path d="M12 22V12M9 10.5L12 9l3 1.5"/>
                    </svg>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 dark:text-white text-sm">CO-PO Analysis</h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Outcomes & Attainment</p>
                </div>
            </div>

            <!-- Vision & Mission -->
            <div onclick="navigate('visionmission')" class="card card-interactive p-4 flex flex-col justify-between h-36 bg-gradient-to-br from-teal-50/70 to-white dark:from-teal-950/20 dark:to-slate-900 border-teal-100 dark:border-teal-900/40">
                <div class="w-10 h-10 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M30.9,5.6C30.8,5.2,30.4,5,30,5h-3V2c0-0.4-0.2-0.8-0.6-0.9C26,0.9,25.6,1,25.3,1.3l-4,4C21.1,5.5,21,5.7,21,6v3.6l-5.7,5.7 c-0.4,0.4-0.4,1,0,1.4c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3l5.7-5.7H26c0.3,0,0.5-0.1,0.7-0.3l4-4C31,6.4,31.1,6,30.9,5.6z"/>
                        <path d="M18.1,18.1C17.6,18.7,16.8,19,16,19s-1.6-0.3-2.1-0.9c-1.2-1.2-1.2-3.1,0-4.2l2.8-2.8C16.5,11,16.2,11,16,11 c-2.8,0-5,2.2-5,5s2.2,5,5,5s5-2.2,5-5c0-0.2,0-0.5-0.1-0.7L18.1,18.1z"/>
                        <path d="M28.1,12.1C27.6,12.7,26.8,13,26,13h-2.8l-0.7,0.7c0.3,0.7,0.4,1.5,0.4,2.3c0,3.9-3.1,7-7,7s-7-3.1-7-7s3.1-7,7-7 c0.8,0,1.6,0.2,2.3,0.4L19,8.8V6c0-0.8,0.3-1.6,0.9-2.1l1-1C19.3,2.3,17.7,2,16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14 c0-1.7-0.3-3.3-0.9-4.9L28.1,12.1z"/>
                    </svg>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 dark:text-white text-sm">Vision & Mission</h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">AU Department Info</p>
                </div>
            </div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50 text-center">
            <p class="text-xs font-semibold text-slate-600 dark:text-slate-300">AU Smart Hub · v${window.APP_VERSION || "1.0.18"}</p>
            <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Annamalai University Student Suite</p>
        </div>
    `;
}