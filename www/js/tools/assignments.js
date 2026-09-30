// ================= ASSIGNMENT STATE =================
let assignments = safeJSONParse("smarthub_assignments", []);
let assignmentFilterTab = "all"; // 'all' | 'pending' | 'completed'

// Helper: Calculate days left for the badge
function getDaysLeftText(dateString) {
    if (!dateString) return { text: "", color: "" };
    let dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let diffTime = dueDate - today;
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: "Due Today", color: "text-rose-600 bg-rose-500/10 dark:text-rose-400" };
    if (diffDays === 1) return { text: "Due Tomorrow", color: "text-amber-600 bg-amber-500/10 dark:text-amber-400" };
    if (diffDays < 0) return { text: `Overdue (${Math.abs(diffDays)}d)`, color: "text-rose-600 bg-rose-500/10 dark:text-rose-400 font-bold" };

    return { text: `${diffDays} days left`, color: "text-blue-600 bg-blue-500/10 dark:text-blue-400" };
}

function getPriorityStyle(priority) {
    if (priority === 'High') return "text-rose-600 bg-rose-500/10 dark:text-rose-400 border-rose-500/20";
    if (priority === 'Medium') return "text-amber-600 bg-amber-500/10 dark:text-amber-400 border-amber-500/20";
    return "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 border-emerald-500/20";
}

function switchAssignmentFilter(tab) {
    assignmentFilterTab = tab;
    triggerHaptic(10);
    render();
}

// ================= RENDERER =================
function renderAssignments() {
    let pending = assignments.filter(a => !a.completed);
    let completed = assignments.filter(a => a.completed);

    pending.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    completed.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

    let displayList = [];
    if (assignmentFilterTab === 'pending') displayList = pending;
    else if (assignmentFilterTab === 'completed') displayList = completed;
    else displayList = [...pending, ...completed];

    const formatOpts = { month: 'short', day: 'numeric' };

    let html = `
        <!-- Assignments Header -->
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-400/15 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                    </svg>
                </div>
                <div>
                    <h1 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Assignments</h1>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">${pending.length} pending • ${completed.length} done</p>
                </div>
            </div>
            <div class="text-xs px-2.5 py-1 rounded-full ${pending.length > 0 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'} font-bold">
                ${pending.length > 0 ? `${pending.length} Due` : 'Caught Up'}
            </div>
        </div>

        <!-- Filter Segmented Tabs -->
        <div class="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl mb-4 border border-slate-200/50 dark:border-white/5">
            <button onclick="switchAssignmentFilter('all')" class="flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${assignmentFilterTab === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}">
                All (${assignments.length})
            </button>
            <button onclick="switchAssignmentFilter('pending')" class="flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${assignmentFilterTab === 'pending' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}">
                Pending (${pending.length})
            </button>
            <button onclick="switchAssignmentFilter('completed')" class="flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${assignmentFilterTab === 'completed' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}">
                Done (${completed.length})
            </button>
        </div>

        <button onclick="showAddAssignmentModal()" class="btn mb-4 w-full flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            ADD NEW ASSIGNMENT
        </button>

        <div class="space-y-2.5 mb-4">
    `;

    if (displayList.length === 0) {
        html += `
            <div class="card text-center py-10 text-slate-400 dark:text-slate-500 border-dashed border-2">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-2 opacity-40">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                </svg>
                <p class="font-bold text-sm text-slate-700 dark:text-slate-300">${assignmentFilterTab === 'completed' ? 'No completed assignments yet' : 'All caught up!'}</p>
                <p class="text-xs mt-1">${assignmentFilterTab === 'completed' ? 'Tasks you mark complete will appear here' : 'Tap above to schedule a new task'}</p>
            </div>
        `;
    } else {
        displayList.forEach((task) => {
            let isDone = task.completed;
            let badge = getDaysLeftText(task.dueDate);
            let prioStyle = getPriorityStyle(task.priority);
            let dateStr = new Date(task.dueDate).toLocaleDateString(undefined, formatOpts);

            html += `
                <div class="card p-3.5 flex gap-3 items-start border border-slate-100 dark:border-white/5 ${isDone ? 'opacity-60 bg-slate-50 dark:bg-white/[0.02]' : ''}">
                    <!-- Custom Checkbox -->
                    <button onclick="toggleAssignment('${task.id}')" class="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 active:scale-90 ${isDone ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500'}">
                        ${isDone ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}
                    </button>

                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start mb-1">
                            <h3 class="font-bold text-slate-900 dark:text-white text-sm leading-snug truncate pr-2 ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}">${escapeHtml(task.title)}</h3>
                            <button onclick="deleteAssignment('${task.id}')" class="text-slate-400 hover:text-red-500 p-1 -mr-1 -mt-1 transition shrink-0">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>

                        <div class="flex flex-wrap gap-1.5 mt-1.5 items-center">
                            <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${badge.color}">${badge.text}</span>
                            <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${prioStyle}">${task.priority}</span>
                            <span class="text-[10px] text-slate-400 ml-auto font-mono">Due: ${dateStr}</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += `</div>`;
    return html;
}

// ================= MODAL & TASK CREATION =================
function showAddAssignmentModal() {
    isPopupOpen = true;

    let existing = document.getElementById('assignment-modal');
    if (existing) existing.remove();

    let modal = document.createElement('div');
    modal.id = 'assignment-modal';
    modal.className = 'sheet-backdrop';

    let tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    let defaultDate = tmrw.toISOString().split('T')[0];

    modal.innerHTML = `
        <div class="sheet-panel">
            <div class="sheet-handle sm:hidden"></div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4 text-center">New Assignment</h3>
            
            <div class="space-y-3 mb-5 text-left">
                <div>
                    <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Title / Task Name</label>
                    <input type="text" id="task-title" class="input w-full" placeholder="e.g. Unit 3 Quiz & Report">
                </div>
                <div>
                    <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Due Date</label>
                    <input type="date" id="task-date" class="input w-full" value="${defaultDate}">
                </div>
                <div>
                    <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Priority Level</label>
                    <select id="task-priority" class="input w-full">
                        <option value="High">High Priority</option>
                        <option value="Medium" selected>Medium Priority</option>
                        <option value="Low">Low Priority</option>
                    </select>
                </div>
            </div>
            
            <div class="flex gap-2.5">
                <button type="button" id="task-cancel" class="flex-1 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition active:scale-95 text-xs cursor-pointer">Cancel</button>
                <button type="button" id="task-save" class="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition active:scale-95 text-xs cursor-pointer">Save Assignment</button>
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

    document.getElementById('task-cancel').onclick = close;

    document.getElementById('task-save').onclick = () => {
        let title = document.getElementById('task-title').value.trim();
        let date = document.getElementById('task-date').value;
        let priority = document.getElementById('task-priority').value;

        if (!title || !date) {
            showToast("Please enter a title and due date");
            return;
        }

        let selectedDateObj = new Date(date);
        selectedDateObj.setHours(0, 0, 0, 0);

        let todayObj = new Date();
        todayObj.setHours(0, 0, 0, 0);

        if (selectedDateObj < todayObj) {
            showToast("Cannot set a deadline in the past!");
            return;
        }

        let taskId = Math.floor(Date.now() / 1000).toString();
        let notifBaseId = reserveNotifIdBlock();

        let newTask = {
            id: taskId,
            title: title,
            dueDate: date,
            priority: priority,
            completed: false,
            createdAt: Date.now(),
            notifCount: 0,
            notifBaseId: notifBaseId
        };

        scheduleAssignmentNotifications(newTask, notifBaseId);

        assignments.push(newTask);
        localStorage.setItem("smarthub_assignments", JSON.stringify(assignments));
        close();
        render();
    };

    setTimeout(() => {
        const dateInput = document.getElementById('task-date');
        if (dateInput) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            const todayFormatted = now.toISOString().split('T')[0];
            dateInput.setAttribute('min', todayFormatted);
            if (!dateInput.value) {
                dateInput.value = todayFormatted;
            }
        }
    }, 50);
}

// ================= CORDOVA NOTIFICATION SCHEDULER =================
const NOTIF_HOURS = [9, 12, 15, 18, 21];
const NOTIF_SLOTS_PER_TASK = NOTIF_HOURS.length * 2;
const NOTIF_CHANNEL_ID = 'assignment_reminders';

function reserveNotifIdBlock() {
    let nextId = parseInt(localStorage.getItem("smarthub_next_notif_id") || "20000000", 10);
    localStorage.setItem("smarthub_next_notif_id", (nextId + NOTIF_SLOTS_PER_TASK).toString());
    return nextId;
}

function ensureNotificationChannel(callback) {
    if (!(window.cordova && cordova.plugins?.notification?.local?.channels)) {
        if (callback) callback();
        return;
    }
    cordova.plugins.notification.local.channels.create({
        id: NOTIF_CHANNEL_ID,
        description: 'Assignment deadline reminders',
        importance: 4,
        vibration: true,
        sound: true,
        led: true
    }, function () {
        if (callback) callback();
    });
}

function scheduleAssignmentNotifications(task, baseId) {
    if (!(window.cordova && cordova.plugins?.notification?.local)) return;

    let dueDateObj = new Date(task.dueDate);
    dueDateObj.setHours(0, 0, 0, 0);

    let tomorrowDay = new Date(dueDateObj);
    tomorrowDay.setDate(tomorrowDay.getDate() - 1);

    let scheduledNotifs = [];
    let idCounter = 0;

    function buildWindow(dayDate, label) {
        NOTIF_HOURS.forEach(hour => {
            let fireDate = new Date(dayDate);
            fireDate.setHours(hour, 0, 0, 0);

            if (fireDate.getTime() > Date.now()) {
                let notifTitle = label === 'today' ? "Deadline Today!" : "Deadline Tomorrow!";
                let notifText = label === 'today'
                    ? `"${task.title}" is due TODAY. Tap to open Smart Hub.`
                    : `"${task.title}" is due tomorrow. Tap to open Smart Hub.`;

                scheduledNotifs.push({
                    id: baseId + idCounter,
                    title: notifTitle,
                    text: notifText,
                    foreground: true,
                    vibrate: true,
                    icon: 'file://img/au_smart_hub.png',
                    smallIcon: 'res://notify_icon',
                    channel: NOTIF_CHANNEL_ID,
                    androidAllowWhileIdle: true,
                    priority: 2,
                    trigger: { at: fireDate }
                });
            }
            idCounter++;
        });
    }

    buildWindow(tomorrowDay, 'tomorrow');
    buildWindow(dueDateObj, 'today');

    if (scheduledNotifs.length === 0) return;

    ensureNotificationChannel(function () {
        cordova.plugins.notification.local.requestPermission(function (granted) {
            if (granted) {
                cordova.plugins.notification.local.schedule(scheduledNotifs);
            }
        });
    });
}

function toggleAssignment(id) {
    triggerHaptic(20);
    let task = assignments.find(a => a.id === id);
    if (task) {
        task.completed = !task.completed;

        if (task.completed) {
            task.completedAt = Date.now();
        } else {
            task.completedAt = null;
        }

        if (task.completed && window.cordova && cordova.plugins?.notification?.local) {
            let baseId = task.notifBaseId !== undefined ? task.notifBaseId : parseInt(task.id);
            let idsToCancel = [];
            for (let i = 0; i < NOTIF_SLOTS_PER_TASK; i++) {
                idsToCancel.push(baseId + i);
            }
            cordova.plugins.notification.local.cancel(idsToCancel, function () {
                console.log("All batched alarms cancelled");
            });
        }

        localStorage.setItem("smarthub_assignments", JSON.stringify(assignments));
        render();
    }
}

function deleteAssignment(id) {
    showConfirm("Delete Assignment?", "Are you sure you want to delete this assignment?", "Delete", () => {
        if (window.cordova && cordova.plugins?.notification?.local) {
            let task = assignments.find(a => a.id === id);
            let baseId = (task && task.notifBaseId !== undefined) ? task.notifBaseId : parseInt(id);
            let idsToCancel = [];
            for (let i = 0; i < NOTIF_SLOTS_PER_TASK; i++) {
                idsToCancel.push(baseId + i);
            }
            cordova.plugins.notification.local.cancel(idsToCancel);
        }

        assignments = assignments.filter(a => a.id !== id);
        localStorage.setItem("smarthub_assignments", JSON.stringify(assignments));
        render();
    });
}