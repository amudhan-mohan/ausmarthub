// ================= HOME SCREEN =================
function getGreeting() {
    let h = new Date().getHours();
    if (h >= 5 && h < 12) return "Good Morning";
    if (h >= 12 && h < 17) return "Good Afternoon";
    if (h >= 17 && h < 20) return "Good Evening";
    return "Good Night";
}

function getTimeBasedHillIcon() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
        return `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-orange-400 drop-shadow-md"><path d="M12 4V2M4.929 4.929L3.515 3.515M20.485 3.515L19.071 4.929" stroke-linecap="round"/><circle cx="12" cy="10" r="4" fill="currentColor" opacity="0.3"/><circle cx="12" cy="10" r="4"/><path d="M2 20C4 16 8 16 12 20M10 20C12 14 18 14 22 20" fill="currentColor" opacity="0.1"/><path d="M2 20C4 16 8 16 12 20M10 20C12 14 18 14 22 20" stroke-linecap="round"/><path d="M2 22h20" stroke-linecap="round"/></svg>`;
    } else if (hour >= 12 && hour < 17) {
        return `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-amber-400 drop-shadow-md"><circle cx="12" cy="7" r="4" fill="currentColor" opacity="0.4"/><circle cx="12" cy="7" r="4"/><path d="M12 1V3M20 7H22M2 7H4M18.364 1.636L16.95 3.05M5.636 1.636L7.05 3.05" stroke-linecap="round"/><path d="M2 20C5 15 9 15 13 20M11 20C14 13 20 13 22 20" fill="currentColor" opacity="0.2"/><path d="M2 20C5 15 9 15 13 20M11 20C14 13 20 13 22 20" stroke-linecap="round"/><path d="M2 22h20" stroke-linecap="round"/></svg>`;
    } else if (hour >= 17 && hour < 20) {
        return `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-orange-400 drop-shadow-md"><path d="M12 18A6 6 0 0 1 12 6a6 6 0 0 1 6 6" stroke-dasharray="3 3"/><circle cx="12" cy="14" r="4" fill="currentColor" opacity="0.5"/><circle cx="12" cy="14" r="4"/><path d="M2 20C6 14 10 14 14 20M10 20C13 15 18 15 22 20" fill="currentColor" opacity="0.3"/><path d="M2 20C6 14 10 14 14 20M10 20C13 15 18 15 22 20" stroke-linecap="round"/><path d="M2 22h20" stroke-linecap="round"/></svg>`;
    } else {
        return `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-sky-300 drop-shadow-md"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" fill="currentColor" opacity="0.3"/><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/><path d="M19 4v2m-1-1h2M16 11v2m-1-1h2" stroke-linecap="round"/><path d="M2 20C5 16 9 16 13 20M11 20C14 14 20 14 22 20" fill="currentColor" opacity="0.2"/><path d="M2 20C5 16 9 16 13 20M11 20C14 14 20 14 22 20" stroke-linecap="round"/><path d="M2 22h20" stroke-linecap="round"/></svg>`;
    }
}

function generateTimetableWidgetHTML() {
    let classesData = typeof getGlobalUpNext === "function" ? getGlobalUpNext() : { current: null, next: null };
    let widgetHtml = "";

    if (classesData.current || classesData.next) {
        widgetHtml = `<div class="flex flex-col gap-2.5 my-3">`;
        if (classesData.current) {
            let c = classesData.current;
            widgetHtml += `
                <div onclick="navigate('timetable')" class="card card-interactive p-4 border-blue-500/50 dark:border-blue-500/40 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/50 dark:from-blue-950/30 dark:via-slate-900 dark:to-indigo-950/20 shadow-md">
                    <div class="flex justify-between items-center mb-1.5">
                        <span class="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
                            <span>Happening Now</span>
                        </span>
                        <span class="text-xs font-bold font-mono text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">${formatAMPM(c.start)} - ${formatAMPM(c.end)}</span>
                    </div>
                    <h3 class="text-base font-extrabold text-slate-900 dark:text-white truncate">
                        <span class="text-blue-600 dark:text-blue-400">${escapeHtml(c.className)}:</span> ${escapeHtml(c.subject)}
                    </h3>
                    <div class="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span>Room: ${escapeHtml(c.room || "Main Hall")}</span>
                    </div>
                </div>
            `;
        }

        if (classesData.next) {
            let c = classesData.next;
            widgetHtml += `
                <div onclick="navigate('timetable')" class="card card-interactive p-3.5 border-purple-500/40 bg-gradient-to-r from-purple-50/60 to-white dark:from-purple-950/20 dark:to-slate-900">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                            <span>Up Next</span>
                        </span>
                        <span class="text-xs font-bold font-mono text-slate-500 dark:text-slate-400">${formatAMPM(c.start)} - ${formatAMPM(c.end)}</span>
                    </div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate">
                        <span class="text-purple-600 dark:text-purple-400">${escapeHtml(c.className)}:</span> ${escapeHtml(c.subject)}
                    </h3>
                    <div class="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span>Room: ${escapeHtml(c.room || "TBA")}</span>
                    </div>
                </div>
            `;
        }
        widgetHtml += `</div>`;
    } else {
        let currentDay = new Date().getDay();
        let isWeekend = currentDay === 0 || currentDay === 6;
        widgetHtml = `
            <div onclick="navigate('timetable')" class="card card-interactive my-3 p-3.5 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200">${isWeekend ? 'Weekend Schedule' : 'No Classes Right Now'}</h4>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">${isWeekend ? 'Enjoy your break or study ahead' : 'Tap to manage your timetable'}</p>
                    </div>
                </div>
                <span class="text-xs font-bold text-blue-600 dark:text-blue-400">View Schedule &rarr;</span>
            </div>
        `;
    }

    return widgetHtml;
}

setInterval(() => {
    if (currentScreen === "home") {
        let container = document.getElementById("home-timetable-container");
        if (container) container.innerHTML = generateTimetableWidgetHTML();
    }
}, 30000);

function renderHome() {
    let activeProfile = (profiles && profiles.length > 0) ? profiles[0] : null;
    let pendingTasks = (assignments || []).filter(a => !a.completed).length;
    let noteCount = (notes || []).length;
    let overallCgpa = activeProfile ? calculateProfileCGPA(activeProfile.semesters) : "-";

    return `
        <!-- Hero App Header Banner (AU Smart Hub Logo Theme) -->
        <div class="banner-card mb-4">
            <div class="flex justify-between items-start">
                <div class="space-y-1 z-10">
                    <div class="flex items-center gap-2">
                        <span class="banner-badge">${getGreeting()}</span>
                    </div>
                    <h2 class="text-2xl font-extrabold tracking-tight text-white mt-0.5">${activeProfile ? escapeHtml(activeProfile.name) : 'Student'}</h2>
                    <p class="banner-subtitle">Annamalai University Smart Hub</p>
                </div>
                <div class="flex items-center justify-center shrink-0 z-10 pl-2">
                    ${getTimeBasedHillIcon()}
                </div>
            </div>

            <!-- Horizontal Divider -->
            <div class="banner-divider"></div>

            <!-- Quick Snapshot Metrics -->
            <div class="grid grid-cols-3 gap-2 z-10 relative">
                <div onclick="navigate('profiles')" class="text-center cursor-pointer active:scale-95 transition banner-col-divider pr-1">
                    <div class="banner-metric-label">Current CGPA</div>
                    <div class="banner-metric-val mt-0.5">${overallCgpa}</div>
                </div>
                <div onclick="navigate('assignments')" class="text-center cursor-pointer active:scale-95 transition banner-col-divider px-1">
                    <div class="banner-metric-label">Pending Tasks</div>
                    <div class="banner-metric-val mt-0.5">${pendingTasks}</div>
                </div>
                <div onclick="navigate('notes')" class="text-center cursor-pointer active:scale-95 transition pl-1">
                    <div class="banner-metric-label">My Notes</div>
                    <div class="banner-metric-val mt-0.5">${noteCount}</div>
                </div>
            </div>
        </div>

        <!-- Live Timetable Schedule Widget -->
        <div id="home-timetable-container">
            ${generateTimetableWidgetHTML()}
        </div>

        <!-- Section: Academic Hub -->
        <div class="my-4">
            <div class="flex items-center justify-between mb-2.5 px-1">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Academic Hub</h3>
                <span class="text-[11px] font-bold text-blue-600 dark:text-blue-400 cursor-pointer" onclick="navigate('profiles')">Manage Profiles</span>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <!-- CGPA Card -->
                <div onclick="navigate('profiles')" class="card card-interactive p-4 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-slate-900 border-blue-200/60 dark:border-blue-900/40">
                    <div class="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                        <svg width="22" height="22" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M31,26c-0.6,0-1-0.4-1-1V12c0-0.6,0.4-1,1-1s1,0.4,1,1v13C32,25.6,31.6,26,31,26z"/>
                            <g><path d="M16,21c-0.2,0-0.3,0-0.5-0.1l-15-8C0.2,12.7,0,12.4,0,12s0.2-0.7,0.5-0.9l15-8c0.3-0.2,0.6-0.2,0.9,0l15,8 c0.3,0.2,0.5,0.5,0.5,0.9s-0.2,0.7-0.5,0.9l-15,8C16.3,21,16.2,21,16,21z"/></g>
                            <path d="M17.4,22.6C17,22.9,16.5,23,16,23s-1-0.1-1.4-0.4L6,18.1V22c0,3.1,4.9,6,10,6s10-2.9,10-6v-3.9L17.4,22.6z"/>
                        </svg>
                    </div>
                    <h4 class="font-extrabold text-sm text-slate-900 dark:text-white">CGPA Tracker</h4>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Semesters & GPA charts</p>
                </div>

                <!-- NPTEL Card -->
                <div onclick="navigate('nptel-profiles')" class="card card-interactive p-4 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-indigo-200/60 dark:border-indigo-900/40">
                    <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <h4 class="font-extrabold text-sm text-slate-900 dark:text-white">NPTEL Calc</h4>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Top 8 & 25% internals</p>
                </div>
            </div>
        </div>

        <!-- Section: Study & Productivity Suite -->
        <div class="my-4">
            <div class="flex items-center justify-between mb-2.5 px-1">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Study & Productivity</h3>
            </div>

            <div class="grid grid-cols-4 gap-2.5">
                <!-- Timetable -->
                <div onclick="navigate('timetable')" class="card card-interactive p-3 flex flex-col items-center text-center">
                    <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Schedule</span>
                </div>

                <!-- Focus Timer -->
                <div onclick="navigate('pomodoro')" class="card card-interactive p-3 flex flex-col items-center text-center">
                    <div class="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Timer</span>
                </div>

                <!-- Notes -->
                <div onclick="navigate('notes')" class="card card-interactive p-3 flex flex-col items-center text-center">
                    <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                            <path d="M19,14.5 L19,5.5 C19,4.67157288 18.3284271,4 17.5,4 L6.5,4 C5.67157288,4 5,4.67157288 5,5.5 L5,18.5 C5,19.3284271 5.67157288,20 6.5,20 L13.5,20 C14.3284271,20 15,19.3284271 15,18.5 C15,17.1192881 16.1192881,16 17.5,16 C18.3284271,16 19,15.3284271 19,14.5 L19,14.5 Z M18.5014408,16.7913481 C18.1948298,16.9255432 17.8561101,17 17.5,17 C16.6715729,17 16,17.6715729 16,18.5 C16,18.8561101 15.9255432,19.1948298 15.7913481,19.5014408 C16.9873685,18.9526013 17.9526013,17.9873685 18.5014408,16.7913481 L18.5014408,16.7913481 Z M4,5.5 C4,4.11928813 5.11928813,3 6.5,3 L17.5,3 C18.8807119,3 20,4.11928813 20,5.5 L20,14.5 C20,18.0898509 17.0898509,21 13.5,21 L6.5,21 C5.11928813,21 4,19.8807119 4,18.5 L4,5.5 Z M8.5,9 C8.22385763,9 8,8.77614237 8,8.5 C8,8.22385763 8.22385763,8 8.5,8 L15.5,8 C15.7761424,8 16,8.22385763 16,8.5 C16,8.77614237 15.7761424,9 15.5,9 L8.5,9 Z M8.5,12 C8.22385763,12 8,11.7761424 8,11.5 C8,11.2238576 8.22385763,11 8.5,11 L15.5,11 C15.7761424,11 16,11.2238576 16,11.5 C16,11.7761424 15.7761424,12 15.5,12 L8.5,12 Z M8.5,15 C8.22385763,15 8,14.7761424 8,14.5 C8,14.2238576 8.22385763,14 8.5,14 L13.5,14 C13.7761424,14 14,14.2238576 14,14.5 C14,14.7761424 13.7761424,15 13.5,15 L8.5,15 Z"/>
                        </svg>
                    </div>
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Notes</span>
                </div>

                <!-- Assignments -->
                <div onclick="navigate('assignments')" class="card card-interactive p-3 flex flex-col items-center text-center">
                    <div class="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1.5">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                            <path d="M9 11l3 3L22 4"></path>
                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                        </svg>
                    </div>
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Tasks</span>
                </div>
            </div>
        </div>

        <!-- Section: Essential Utilities -->
        <div class="my-4">
            <div class="flex items-center justify-between mb-2.5 px-1">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Utilities & Analytics</h3>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
                <!-- Goal Setter -->
                <div onclick="navigate('target-cgpa')" class="card card-interactive p-3.5 flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                    </div>
                    <div class="min-w-0">
                        <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">Goal Setter</h4>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Predict future GPA</p>
                    </div>
                </div>

                <!-- Quick Calc -->
                <div onclick="navigate('calculator')" class="card card-interactive p-3.5 flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
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
                    <div class="min-w-0">
                        <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">Quick Calc</h4>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Fast math & history</p>
                    </div>
                </div>

                <!-- Sci Calc -->
                <div onclick="navigate('scientific-calc')" class="card card-interactive p-3.5 flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M12.71,17.29a1,1,0,0,0-.16-.12.56.56,0,0,0-.17-.09.6.6,0,0,0-.19-.06.93.93,0,0,0-.57.06.9.9,0,0,0-.54.54A.84.84,0,0,0,11,18a1,1,0,0,0,.07.38,1.46,1.46,0,0,0,.22.33A1,1,0,0,0,12,19a.84.84,0,0,0,.38-.08,1.15,1.15,0,0,0,.33-.21A1,1,0,0,0,13,18a1,1,0,0,0-.08-.38A1,1,0,0,0,12.71,17.29ZM8.55,13.17a.56.56,0,0,0-.17-.09A.6.6,0,0,0,8.19,13a.86.86,0,0,0-.39,0l-.18.06-.18.09-.15.12A1.05,1.05,0,0,0,7,14a1,1,0,0,0,.29.71,1.15,1.15,0,0,0,.33.21A1,1,0,0,0,9,14a1.05,1.05,0,0,0-.29-.71Zm.16,4.12a1,1,0,0,0-.33-.21A1,1,0,0,0,7.8,17l-.18.06a.76.76,0,0,0-.18.09,1.58,1.58,0,0,0-.15.12,1,1,0,0,0-.21.33.94.94,0,0,0,0,.76,1.15,1.15,0,0,0,.21.33A1,1,0,0,0,8,19a.84.84,0,0,0,.38-.08,1.15,1.15,0,0,0,.33-.21,1.15,1.15,0,0,0,.21-.33.94.94,0,0,0,0-.76A1,1,0,0,0,8.71,17.29Zm2.91-4.21a1,1,0,0,0-.33.21A1.05,1.05,0,0,0,11,14a1,1,0,0,0,1.38.92,1.15,1.15,0,0,0,.33-.21A1,1,0,0,0,13,14a1.05,1.05,0,0,0-.29-.71A1,1,0,0,0,11.62,13.08Zm5.09,4.21a1.15,1.15,0,0,0-.33-.21,1,1,0,0,0-1.09.21,1,1,0,0,0-.21.33.94.94,0,0,0,0,.76,1.15,1.15,0,0,0,.21.33A1,1,0,0,0,16,19a.84.84,0,0,0,.38-.08,1.15,1.15,0,0,0,.33-.21,1.15,1.15,0,0,0,.21-1.09A1,1,0,0,0,16.71,17.29ZM16,5H8A1,1,0,0,0,7,6v4a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V6A1,1,0,0,0,16,5ZM15,9H9V7h6Zm3-8H6A3,3,0,0,0,3,4V20a3,3,0,0,0,3,3H18a3,3,0,0,0,3-3V4A3,3,0,0,0,18,1Zm1,19a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V4A1,1,0,0,1,6,3H18a1,1,0,0,1,1,1Zm-2.45-6.83a.56.56,0,0,0-.17-.09.6.6,0,0,0-.19-.06.86.86,0,0,0-.39,0l-.18.06-.18.09-.15.12A1.05,1.05,0,0,0,15,14a1,1,0,0,0,1.38.92,1.15,1.15,0,0,0,.33-.21A1,1,0,0,0,17,14a1.05,1.05,0,0,0-.29-.71Z"/>
                        </svg>
                    </div>
                    <div class="min-w-0">
                        <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">Sci-Calc</h4>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">50-button landscape</p>
                    </div>
                </div>

                <!-- CO-PO Analyzer -->
                <div onclick="navigate('copo')" class="card card-interactive p-3.5 flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            <path d="M12 22V12M9 10.5L12 9l3 1.5"/>
                        </svg>
                    </div>
                    <div class="min-w-0">
                        <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">CO-PO Analysis</h4>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Course outcomes</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}