let defaultTimetable = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
let timetable = safeJSONParse("smarthub_timetable", defaultTimetable);

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let currentDayName = DAYS_OF_WEEK[new Date().getDay()];
let selectedTabDay = (currentDayName === "Saturday" || currentDayName === "Sunday") ? "Monday" : currentDayName;

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

function getUpNextClass() {
    let today = DAYS_OF_WEEK[new Date().getDay()];
    let result = { current: null, next: null };
    if (!timetable[today] || timetable[today].length === 0) return result;
    
    let now = new Date();
    let currentMins = (now.getHours() * 60) + now.getMinutes();
    let todaysClasses = [...timetable[today]].sort((a, b) => timeToMins(a.start) - timeToMins(b.start));

    for (let i = 0; i < todaysClasses.length; i++) {
        let c = todaysClasses[i];
        let startMins = timeToMins(c.start), endMins = timeToMins(c.end);
        
        if (currentMins >= startMins && currentMins <= endMins) {
            result.current = c;
            if ((endMins - currentMins) <= 5 && i + 1 < todaysClasses.length) result.next = todaysClasses[i + 1];
            break;
        } else if (currentMins < startMins) {
            result.next = c; break;
        }
    }
    return result;
}

function switchTabDay(day) { selectedTabDay = day; render(); }

function renderTimetable() {
    let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    let classes = [...timetable[selectedTabDay]].sort((a, b) => timeToMins(a.start) - timeToMins(b.start));

    let html = `
        <h1 class="text-xl font-bold tracking-tight mb-5">Schedule</h1>
        <div class="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
            ${days.map(day => `<button onclick="switchTabDay('${day}')" class="px-4 py-2 rounded-xl text-sm font-bold ${selectedTabDay === day ? 'bg-blue-600 text-white' : 'bg-gray-200'}">${day}</button>`).join('')}
        </div>
        <div class="space-y-3 mb-6">
    `;

    if (classes.length === 0) {
        html += `<div class="card text-center text-gray-500 py-10">Free Day!</div>`;
    } else {
        classes.forEach((c, idx) => {
            html += `
                <div class="card p-4 flex justify-between">
                    <div>
                        <div class="text-xs font-bold text-gray-500">${formatAMPM(c.start)} - ${formatAMPM(c.end)}</div>
                        <h3 class="text-lg font-bold">${escapeHtml(c.subject)}</h3>
                        <div class="text-sm text-gray-500">Room ${escapeHtml(c.room)}</div>
                    </div>
                    <div class="flex gap-1">
                        <button onclick="showEditClassModal('${selectedTabDay}', ${idx})" class="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition" title="Edit Class">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button onclick="deleteClass('${selectedTabDay}', ${idx})" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition" title="Remove Class">
                            <svg width="18" height="18" viewBox="0 0 1024 1024" fill="currentColor">
                                <path d="M864 256H736v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zm-504-72h304v72H360v-72zm371.3 656H292.7l-24.2-512h487l-24.2 512z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        });
    }

    html += `</div><button onclick="showAddClassModal()" class="btn w-full">Add Class to ${selectedTabDay}</button>`;
    return html;
}

function showAddClassModal() {
    let existing = document.getElementById('class-modal');
    if (existing) existing.remove();

    let modal = document.createElement('div');
    modal.id = 'class-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-200';

    modal.innerHTML = `
        <div class="card p-6 w-full max-w-sm shadow-2xl transform scale-95 transition-transform duration-200">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Add to ${selectedTabDay}</h3>
            
            <div class="space-y-3 mb-6 text-left">
                <div>
                    <label class="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Subject Name</label>
                    <input type="text" id="tt-subject" class="input w-full" placeholder="e.g. Data Structures">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Room / Block</label>
                    <input type="text" id="tt-room" class="input w-full" placeholder="e.g. Block A - 204">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Start Time</label>
                        <input type="time" id="tt-start" class="input w-full">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">End Time</label>
                        <input type="time" id="tt-end" class="input w-full">
                    </div>
                </div>
            </div>
            
            <div class="flex gap-3">
                <button id="tt-cancel" class="flex-1 py-3.5 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition active:scale-95">Cancel</button>
                <button id="tt-save" class="flex-1 py-3.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition active:scale-95">Save Class</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.firstElementChild.classList.remove('scale-95');
    });

    const close = () => {
        modal.classList.add('opacity-0');
        modal.firstElementChild.classList.add('scale-95');
        setTimeout(() => modal.remove(), 200);
    };

    document.getElementById('tt-cancel').onclick = close;
    document.getElementById('tt-save').onclick = () => {
        let subj = document.getElementById('tt-subject').value.trim();
        let room = document.getElementById('tt-room').value.trim();
        let start = document.getElementById('tt-start').value;
        let end = document.getElementById('tt-end').value;

        if (!subj || !start || !end) {
            showToast("Please fill Subject and Times");
            return;
        }

        let newStartMins = timeToMins(start);
        let newEndMins = timeToMins(end);

        if (newStartMins >= newEndMins) {
            showToast("End time must be after start time");
            return;
        }

        // Check for time overlap
        let hasOverlap = timetable[selectedTabDay].some(c => {
            let existingStart = timeToMins(c.start);
            let existingEnd = timeToMins(c.end);

            // Overlap condition: (StartA < EndB) and (EndA > StartB)
            return (newStartMins < existingEnd) && (newEndMins > existingStart);
        });

        if (hasOverlap) {
            showToast("Time conflicts with an existing class!");
            return;
        }

        timetable[selectedTabDay].push({ subject: subj, room: room, start: start, end: end });
        localStorage.setItem("smarthub_timetable", JSON.stringify(timetable));
        close();
        render(); // Refresh timetable view
    };
}

function showEditClassModal(day, idx) {
    let classData = timetable[day][idx];

    let existing = document.getElementById('class-modal');
    if (existing) existing.remove();

    let modal = document.createElement('div');
    modal.id = 'class-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-200';

    modal.innerHTML = `
        <div class="card p-6 w-full max-w-sm shadow-2xl transform scale-95 transition-transform duration-200">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Edit Class</h3>
            
            <div class="space-y-3 mb-6 text-left">
                <div>
                    <label class="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Subject Name</label>
                    <input type="text" id="tt-subject" class="input w-full" value="${escapeHtml(classData.subject)}">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Room / Block</label>
                    <input type="text" id="tt-room" class="input w-full" value="${escapeHtml(classData.room)}">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Start Time</label>
                        <input type="time" id="tt-start" class="input w-full" value="${classData.start}">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">End Time</label>
                        <input type="time" id="tt-end" class="input w-full" value="${classData.end}">
                    </div>
                </div>
            </div>
            
            <div class="flex gap-3">
                <button id="tt-cancel" class="flex-1 py-3.5 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition active:scale-95">Cancel</button>
                <button id="tt-save" class="flex-1 py-3.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition active:scale-95">Update</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.firstElementChild.classList.remove('scale-95');
    });

    const close = () => {
        modal.classList.add('opacity-0');
        modal.firstElementChild.classList.add('scale-95');
        setTimeout(() => modal.remove(), 200);
    };

    document.getElementById('tt-cancel').onclick = close;
    document.getElementById('tt-save').onclick = () => {
        let subj = document.getElementById('tt-subject').value.trim();
        let room = document.getElementById('tt-room').value.trim();
        let start = document.getElementById('tt-start').value;
        let end = document.getElementById('tt-end').value;

        if (!subj || !start || !end) {
            showToast("Please fill Subject and Times");
            return;
        }

        let newStartMins = timeToMins(start);
        let newEndMins = timeToMins(end);

        if (newStartMins >= newEndMins) {
            showToast("End time must be after start time");
            return;
        }

        // Check for time overlap, EXCLUDING the current class being edited (using currentIdx !== idx)
        let hasOverlap = timetable[day].some((c, currentIdx) => {
            if (currentIdx === idx) return false;

            let existingStart = timeToMins(c.start);
            let existingEnd = timeToMins(c.end);

            return (newStartMins < existingEnd) && (newEndMins > existingStart);
        });

        if (hasOverlap) {
            showToast("Time conflicts with an existing class!");
            return;
        }

        // Save the updated data back to the array
        timetable[day][idx] = { subject: subj, room: room, start: start, end: end };
        localStorage.setItem("smarthub_timetable", JSON.stringify(timetable));

        close();
        render(); // Refresh timetable view
    };
}

function deleteClass(day, idx) {
    showConfirm("Remove Class?", "Remove this class?", "Remove", () => {
        timetable[day].splice(idx, 1);
        localStorage.setItem("smarthub_timetable", JSON.stringify(timetable));
        render();
    });
}