// ================= STATE & MIGRATION =================
let appClasses = safeJSONParse("smarthub_app_classes", null);

// Auto-migration: If appClasses is null, check for legacy timetable data
if (!appClasses) {
    let legacyTimetable = safeJSONParse("smarthub_timetable", null);
    appClasses = [];

    if (legacyTimetable && (legacyTimetable.Monday || legacyTimetable.Tuesday)) {
        appClasses.push({
            id: Date.now().toString(),
            name: "My Timetable",
            timetable: legacyTimetable
        });
    }
    localStorage.setItem("smarthub_app_classes", JSON.stringify(appClasses));
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let currentDayName = DAYS_OF_WEEK[new Date().getDay()];
let selectedTabDay = (currentDayName === "Saturday" || currentDayName === "Sunday") ? "Monday" : currentDayName;

let currentSelectedClassId = null;

// ================= UTILITIES =================
function timeToMins(timeStr) {
    if (!timeStr) return 0;
    let [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
}

function formatAMPM(timeStr) {
    if (!timeStr) return "";
    let [h, m] = timeStr.split(':');
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
}

function getGlobalUpNext() {
    let today = DAYS_OF_WEEK[new Date().getDay()];
    let result = { current: null, next: null };
    let allTodaysSlots = [];

    appClasses.forEach(cls => {
        if (cls.timetable && cls.timetable[today]) {
            cls.timetable[today].forEach(slot => {
                allTodaysSlots.push({
                    className: cls.name,
                    subject: slot.subject,
                    room: slot.room,
                    start: slot.start,
                    end: slot.end,
                    startMins: timeToMins(slot.start),
                    endMins: timeToMins(slot.end)
                });
            });
        }
    });

    if (allTodaysSlots.length === 0) return result;
    allTodaysSlots.sort((a, b) => a.startMins - b.startMins);

    let now = new Date();
    let currentMins = (now.getHours() * 60) + now.getMinutes();

    for (let i = 0; i < allTodaysSlots.length; i++) {
        let slot = allTodaysSlots[i];
        if (currentMins >= slot.startMins && currentMins <= slot.endMins) {
            result.current = slot;
            if (i + 1 < allTodaysSlots.length) {
                result.next = allTodaysSlots[i + 1];
            }
            break;
        } else if (currentMins < slot.startMins) {
            result.next = slot;
            break;
        }
    }
    return result;
}

function getClassUpNext(cls) {
    let today = DAYS_OF_WEEK[new Date().getDay()];
    let result = { current: null, next: null };
    if (!cls.timetable || !cls.timetable[today]) return result;

    let todaysSlots = [...cls.timetable[today]].sort((a, b) => timeToMins(a.start) - timeToMins(b.start));
    let now = new Date();
    let currentMins = (now.getHours() * 60) + now.getMinutes();

    for (let i = 0; i < todaysSlots.length; i++) {
        let slot = todaysSlots[i];
        let startMins = timeToMins(slot.start), endMins = timeToMins(slot.end);

        if (currentMins >= startMins && currentMins <= endMins) {
            result.current = slot;
            if (i + 1 < todaysSlots.length) result.next = todaysSlots[i + 1];
            break;
        } else if (currentMins < startMins) {
            result.next = slot; break;
        }
    }
    return result;
}

function switchTabDay(day) {
    selectedTabDay = day;
    triggerHaptic(10);
    render();
}

function openClass(id) {
    currentSelectedClassId = id;
    triggerHaptic(10);
    render();
}

function closeClassView() {
    currentSelectedClassId = null;
    render();
}

// ================= RENDER LOGIC =================
function renderTimetable() {
    if (!currentSelectedClassId) {
        return renderClassListView();
    } else {
        return renderClassTimetableView(currentSelectedClassId);
    }
}

// ----- VIEW 1: Class List -----
function renderClassListView() {
    let html = `
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-400/15 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </div>
                <div>
                    <h1 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Class Timetables</h1>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">Manage schedules & rooms</p>
                </div>
            </div>
            <div class="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                ${appClasses.length} ${appClasses.length === 1 ? 'Class' : 'Classes'}
            </div>
        </div>

        <button onclick="showAddClassEntityModal()" class="btn mb-4 w-full flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            CREATE NEW CLASS
        </button>

        <div class="space-y-3 mb-4">
    `;

    if (appClasses.length === 0) {
        html += `
            <div class="card text-center py-10 text-slate-400 dark:text-slate-500 border-dashed border-2">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-2 opacity-40">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line>
                </svg>
                <p class="font-bold text-sm text-slate-700 dark:text-slate-300">No classes created yet</p>
                <p class="text-xs mt-1">Tap above to create your first class timetable</p>
            </div>
        `;
    } else {
        let today = DAYS_OF_WEEK[new Date().getDay()];
        let now = new Date();
        let currentMins = (now.getHours() * 60) + now.getMinutes();

        appClasses.forEach((cls, idx) => {
            let totalSubjects = 0;
            for (let d in cls.timetable) totalSubjects += cls.timetable[d].length;

            let todaysSlots = cls.timetable[today] || [];
            let todaySubjects = todaysSlots.length;
            let upcomingSubjects = todaysSlots.filter(s => timeToMins(s.start) > currentMins).length;

            let upNextData = getClassUpNext(cls);
            let upNextHtml = "";
            if (upNextData.current) {
                upNextHtml = `
                    <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-xs">
                        <span class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Happening Now
                        </span>
                        <span class="font-bold text-slate-800 dark:text-slate-200 truncate ml-2">${escapeHtml(upNextData.current.subject)} (${formatAMPM(upNextData.current.start)})</span>
                    </div>`;
            } else if (upNextData.next) {
                upNextHtml = `
                    <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-xs">
                        <span class="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-indigo-500"></span> Up Next
                        </span>
                        <span class="font-bold text-slate-800 dark:text-slate-200 truncate ml-2">${escapeHtml(upNextData.next.subject)} (${formatAMPM(upNextData.next.start)})</span>
                    </div>`;
            }

            html += `
                <div class="card p-4 cursor-pointer hover:border-blue-500/40 active:scale-[0.99] transition border border-slate-100 dark:border-white/5" onclick="openClass('${cls.id}')">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#103654] via-[#1F618D] to-[#51A5D4] text-white flex items-center justify-center font-black text-base shadow-md border border-white/20 shrink-0">
                                ${escapeHtml(cls.name).substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 class="text-base font-bold text-slate-900 dark:text-white">${escapeHtml(cls.name)}</h3>
                                <div class="flex gap-1.5 mt-1 flex-wrap">
                                    <span class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">Total: ${totalSubjects}</span>
                                    <span class="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">Today: ${todaySubjects}</span>
                                    ${upcomingSubjects > 0 ? `<span class="text-[10px] font-bold px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md">Upcoming: ${upcomingSubjects}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex gap-1">
                            <button onclick="event.stopPropagation(); showEditClassEntityModal('${cls.id}')" class="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg transition" title="Rename">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button onclick="event.stopPropagation(); deleteClassEntity(${idx})" class="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition" title="Delete">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                    ${upNextHtml}
                </div>
            `;
        });
    }

    html += `</div>`;
    return html;
}

// ----- VIEW 2: Specific Class Timetable -----
function renderClassTimetableView(classId) {
    let currentClass = appClasses.find(c => c.id === classId);
    if (!currentClass) return renderClassListView();

    let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    let daySlots = currentClass.timetable[selectedTabDay] || [];
    let classes = [...daySlots].sort((a, b) => timeToMins(a.start) - timeToMins(b.start));

    let html = `
        <!-- Class Detail Header -->
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#103654] via-[#1F618D] to-[#51A5D4] text-white flex items-center justify-center font-black text-sm shadow-md border border-white/20 shrink-0">
                    ${escapeHtml(currentClass.name).substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h1 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">${escapeHtml(currentClass.name)}</h1>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">Class Schedule</p>
                </div>
            </div>
            <div class="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                ${classes.length} ${classes.length === 1 ? 'Period' : 'Periods'}
            </div>
        </div>
        
        <!-- Day Selector Segmented Tabs -->
        <div class="flex gap-1.5 overflow-x-auto scrollbar-hide mb-4 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200/50 dark:border-white/5">
            ${days.map(day => `
                <button onclick="switchTabDay('${day}')" class="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${selectedTabDay === day ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}">
                    ${day.substring(0, 3)}
                </button>
            `).join('')}
        </div>
        
        <div class="space-y-2.5 mb-4">
    `;

    if (classes.length === 0) {
        html += `
            <div class="card text-center py-10 text-slate-400 dark:text-slate-500 border-dashed border-2">
                <p class="font-bold text-sm text-slate-700 dark:text-slate-300">No periods scheduled for ${selectedTabDay}</p>
                <p class="text-xs mt-1">Tap below to add a subject slot</p>
            </div>
        `;
    } else {
        classes.forEach((c, idx) => {
            html += `
                <div class="card p-3.5 flex justify-between items-center border border-slate-100 dark:border-white/5">
                    <div class="flex-1 min-w-0 pr-2">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">${formatAMPM(c.start)} – ${formatAMPM(c.end)}</span>
                            ${c.room ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 truncate">${escapeHtml(c.room)}</span>` : ''}
                        </div>
                        <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate">${escapeHtml(c.subject)}</h3>
                    </div>
                    <div class="flex gap-1 shrink-0">
                        <button onclick="showEditSlotModal('${classId}', '${selectedTabDay}', ${idx})" class="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg transition" title="Edit">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button onclick="deleteSlot('${classId}', '${selectedTabDay}', ${idx})" class="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition" title="Delete">
                             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        });
    }

    html += `
        </div>
        <button onclick="showAddSlotModal('${classId}')" class="btn w-full flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            ADD PERIOD
        </button>
    `;

    return html;
}

// ================= MODALS & ACTIONS =================
function showAddClassEntityModal() {
    showInputModal("Create Class", "e.g., 3rd Year CSE - Section A", "", "Create", (name) => {
        let newClass = {
            id: Date.now().toString(),
            name: name,
            timetable: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] }
        };
        appClasses.push(newClass);
        localStorage.setItem("smarthub_app_classes", JSON.stringify(appClasses));
        render();
    });
}

function showEditClassEntityModal(classId) {
    let classObj = appClasses.find(c => c.id === classId);
    if (!classObj) return;

    showInputModal("Rename Class", "e.g., 3rd Year CSE", classObj.name, "Update", (newName) => {
        classObj.name = newName;
        localStorage.setItem("smarthub_app_classes", JSON.stringify(appClasses));
        render();
    });
}

function deleteClassEntity(idx) {
    showConfirm("Delete Class?", "This will permanently remove this class and its entire timetable.", "Delete", () => {
        appClasses.splice(idx, 1);
        localStorage.setItem("smarthub_app_classes", JSON.stringify(appClasses));
        render();
    });
}

function showAddSlotModal(classId) {
    let existing = document.getElementById('class-modal');
    if (existing) existing.remove();

    let modal = document.createElement('div');
    modal.id = 'class-modal';
    modal.className = 'sheet-backdrop';

    modal.innerHTML = `
        <div class="sheet-panel">
            <div class="sheet-handle"></div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4 text-center">Add Subject to ${selectedTabDay}</h3>
            <div class="space-y-3 mb-5 text-left">
                <div>
                    <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Subject Name</label>
                    <input type="text" id="tt-subject" class="input w-full" placeholder="e.g. Operating Systems">
                </div>
                <div>
                    <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Room / Hall (Optional)</label>
                    <input type="text" id="tt-room" class="input w-full" placeholder="e.g. LH-204">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Start Time</label>
                        <input type="time" id="tt-start" class="input w-full">
                    </div>
                    <div>
                        <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">End Time</label>
                        <input type="time" id="tt-end" class="input w-full">
                    </div>
                </div>
            </div>
            <div class="flex gap-2.5">
                <button id="tt-cancel" class="flex-1 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition active:scale-95 text-xs">Cancel</button>
                <button id="tt-save" class="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition active:scale-95 text-xs">Save Period</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('active', 'show'));

    const close = () => {
        modal.classList.remove('active', 'show');
        setTimeout(() => modal.remove(), 220);
    };

    modal.onclick = (e) => {
        if (e.target === modal) close();
    };

    document.getElementById('tt-cancel').onclick = close;

    document.getElementById('tt-save').onclick = () => {
        let subj = document.getElementById('tt-subject').value.trim();
        let room = document.getElementById('tt-room').value.trim();
        let start = document.getElementById('tt-start').value;
        let end = document.getElementById('tt-end').value;

        if (!subj || !start || !end) return showToast("Please fill Subject and Times");

        let newStartMins = timeToMins(start), newEndMins = timeToMins(end);
        if (newStartMins >= newEndMins) return showToast("End time must be after start time");

        let currentClass = appClasses.find(c => c.id === classId);

        let hasOverlap = currentClass.timetable[selectedTabDay].some(c => {
            return (newStartMins < timeToMins(c.end)) && (newEndMins > timeToMins(c.start));
        });

        if (hasOverlap) return showToast("Time conflicts with an existing slot!");

        currentClass.timetable[selectedTabDay].push({ subject: subj, room: room, start: start, end: end });
        localStorage.setItem("smarthub_app_classes", JSON.stringify(appClasses));
        close();
        render();
    };
}

function showEditSlotModal(classId, day, idx) {
    let currentClass = appClasses.find(c => c.id === classId);
    let classData = currentClass.timetable[day][idx];

    let existing = document.getElementById('class-modal');
    if (existing) existing.remove();

    let modal = document.createElement('div');
    modal.id = 'class-modal';
    modal.className = 'sheet-backdrop';

    modal.innerHTML = `
        <div class="sheet-panel">
            <div class="sheet-handle sm:hidden"></div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4 text-center">Edit Period</h3>
            <div class="space-y-3 mb-5 text-left">
                <div>
                    <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Subject Name</label>
                    <input type="text" id="tt-subject" class="input w-full" value="${escapeHtml(classData.subject)}">
                </div>
                <div>
                    <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Room / Hall (Optional)</label>
                    <input type="text" id="tt-room" class="input w-full" value="${escapeHtml(classData.room)}">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Start Time</label>
                        <input type="time" id="tt-start" class="input w-full" value="${classData.start}">
                    </div>
                    <div>
                        <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">End Time</label>
                        <input type="time" id="tt-end" class="input w-full" value="${classData.end}">
                    </div>
                </div>
            </div>
            <div class="flex gap-2.5">
                <button id="tt-cancel" class="flex-1 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition active:scale-95 text-xs">Cancel</button>
                <button id="tt-save" class="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition active:scale-95 text-xs">Update Period</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('active', 'show'));

    const close = () => {
        modal.classList.remove('active', 'show');
        setTimeout(() => modal.remove(), 220);
    };

    modal.onclick = (e) => {
        if (e.target === modal) close();
    };

    document.getElementById('tt-cancel').onclick = close;

    document.getElementById('tt-save').onclick = () => {
        let subj = document.getElementById('tt-subject').value.trim();
        let room = document.getElementById('tt-room').value.trim();
        let start = document.getElementById('tt-start').value;
        let end = document.getElementById('tt-end').value;

        if (!subj || !start || !end) return showToast("Please fill Subject and Times");

        let newStartMins = timeToMins(start), newEndMins = timeToMins(end);
        if (newStartMins >= newEndMins) return showToast("End time must be after start time");

        let hasOverlap = currentClass.timetable[day].some((c, currentIdx) => {
            if (currentIdx === idx) return false;
            return (newStartMins < timeToMins(c.end)) && (newEndMins > timeToMins(c.start));
        });

        if (hasOverlap) return showToast("Time conflicts with an existing slot!");

        currentClass.timetable[day][idx] = { subject: subj, room: room, start: start, end: end };
        localStorage.setItem("smarthub_app_classes", JSON.stringify(appClasses));
        close();
        render();
    };
}

function deleteSlot(classId, day, idx) {
    showConfirm("Remove Period?", "Remove this scheduled slot?", "Remove", () => {
        let currentClass = appClasses.find(c => c.id === classId);
        currentClass.timetable[day].splice(idx, 1);
        localStorage.setItem("smarthub_app_classes", JSON.stringify(appClasses));
        render();
    });
}