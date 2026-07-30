// ================= ASSIGNMENT STATE =================
let assignments = safeJSONParse("smarthub_assignments", []);

// Helper: Calculate days left for the badge
function getDaysLeftText(dateString) {
    if (!dateString) return "";
    let dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let diffTime = dueDate - today;
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: "Due Today", color: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30" };
    if (diffDays === 1) return { text: "Due Tomorrow", color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30" };
    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`, color: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30" };

    return { text: `Due in ${diffDays} days`, color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30" };
}

// Helper: Get priority colors
function getPriorityStyle(priority) {
    if (priority === 'High') return "text-red-600 border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400";
    if (priority === 'Medium') return "text-amber-600 border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-400";
    return "text-green-600 border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/10 dark:text-green-400";
}

// ================= RENDERER =================
function renderAssignments() {
    // Separate into pending and completed
    let pending = assignments.filter(a => !a.completed);
    let completed = assignments.filter(a => a.completed);

    // Sort pending by closest due date
    pending.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Shared date formatter
    const formatOpts = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };

    let html = `
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-blue-600 dark:text-blue-400">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Assignments</h1>
            </div>
            <div class="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                ${pending.length} Pending
            </div>
        </div>

        <button onclick="showAddAssignmentModal()" class="btn mb-5 w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            New Assignment
        </button>

        <div class="space-y-3">
    `;

    if (assignments.length === 0) {
        html += `
            <div class="card text-center py-10 text-gray-500 dark:text-gray-400 border-dashed border-2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="mx-auto mb-3 opacity-50">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                </svg>
                <p class="font-medium text-gray-700 dark:text-gray-300">All caught up!</p>
                <p class="text-xs mt-1">Tap above to add a new assignment.</p>
            </div>
        `;
    } else {
        // Render Pending Tasks
        pending.forEach((task) => {
            let badge = getDaysLeftText(task.dueDate);
            let prioStyle = getPriorityStyle(task.priority);

            let createdStr = task.createdAt ? new Date(task.createdAt).toLocaleString(undefined, formatOpts) : 'Unknown';
            let alerts = task.notifCount || 0;

            html += `
                <div class="card p-4 flex gap-3 items-start border-l-4 border-blue-500">
                    <button onclick="toggleAssignment('${task.id}')" class="mt-1 text-gray-400 hover:text-blue-500 transition">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>
                    </button>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start mb-1">
                            <h3 class="font-bold text-gray-900 dark:text-white leading-tight pr-2 truncate">${escapeHtml(task.title)}</h3>
                            <button onclick="deleteAssignment('${task.id}')" class="text-gray-400 hover:text-red-500 transition shrink-0">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-2 mb-3">
                            <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${badge.color}">${badge.text}</span>
                            <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${prioStyle}">${task.priority}</span>
                        </div>
                        
                        <div class="pt-2 border-t border-gray-100 dark:border-gray-800/50 flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wide">
                            <span>Added: ${createdStr}</span>
                            ${alerts > 0 ? `
                            <span class="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg> 
                                ${alerts} Alert${alerts > 1 ? 's' : ''} Sent
                            </span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        // Render Completed Tasks
        if (completed.length > 0) {
            html += `<h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mt-6 mb-2 pl-2">Completed (${completed.length})</h3>`;
            completed.forEach((task) => {
                let completedStr = task.completedAt ? new Date(task.completedAt).toLocaleString(undefined, formatOpts) : 'Unknown';

                html += `
                    <div class="card p-4 flex gap-3 items-center opacity-60 bg-gray-50 dark:bg-white/5 border-dashed border-gray-200 dark:border-gray-800">
                        <button onclick="toggleAssignment('${task.id}')" class="text-green-500 hover:text-gray-400 transition shrink-0">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </button>
                        <div class="flex-1 min-w-0">
                            <h3 class="font-bold text-gray-500 dark:text-gray-400 line-through truncate">${escapeHtml(task.title)}</h3>
                            <div class="text-[9px] font-medium tracking-wide text-gray-400 dark:text-gray-500 mt-1">
                                Completed: ${completedStr}
                            </div>
                        </div>
                        <button onclick="deleteAssignment('${task.id}')" class="text-gray-400 hover:text-red-500 transition shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                `;
            });
        }
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
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-200';

    let tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    let defaultDate = tmrw.toISOString().split('T')[0];

    modal.innerHTML = `
        <div class="card p-6 w-full max-w-sm shadow-2xl transform scale-95 transition-transform duration-200">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">New Assignment</h3>
            
            <div class="space-y-3 mb-6 text-left">
                <div>
                    <label class="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Task Description</label>
                    <input type="text" id="task-title" class="input w-full" placeholder="e.g. OOPs Assignment 1">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Due Date</label>
                    <input type="date" id="task-date" class="input w-full" value="${defaultDate}">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Priority</label>
                    <select id="task-priority" class="input w-full">
                        <option value="High">High</option>
                        <option value="Medium" selected>Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            </div>
            
            <div class="flex gap-3">
                <button id="task-cancel" class="flex-1 py-3.5 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition active:scale-95">Cancel</button>
                <button id="task-save" class="flex-1 py-3.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition active:scale-95">Save Task</button>
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
    if (!(window.cordova && cordova.plugins.notification.local && cordova.plugins.notification.local.channels)) {
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
    if (!(window.cordova && cordova.plugins.notification.local)) return;

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
                let notifTitle = label === 'today' ? "Deadline Today! 🚨" : "Deadline Tomorrow! ⏳";
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
    let task = assignments.find(a => a.id === id);
    if (task) {
        task.completed = !task.completed;

        if (task.completed) {
            task.completedAt = Date.now(); 
        } else {
            task.completedAt = null; 
        }

        if (task.completed && window.cordova && cordova.plugins.notification.local) {
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
    showConfirm("Delete Task?", "Are you sure you want to delete this assignment?", "Delete", () => {
        if (window.cordova && cordova.plugins.notification.local) {
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