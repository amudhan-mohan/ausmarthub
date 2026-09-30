// ================= NATIVE ALARM FIRED LISTENER =================
function trackNativeNotificationFired(notification) {
    let firedId = notification.id;
    let task = assignments.find(a => {
        let baseId = a.notifBaseId !== undefined ? a.notifBaseId : parseInt(a.id);
        return firedId >= baseId && firedId < baseId + NOTIF_SLOTS_PER_TASK;
    });

    if (task) {
        task.notifCount = (task.notifCount || 0) + 1;
        task.lastNotified = Date.now();
        localStorage.setItem("smarthub_assignments", JSON.stringify(assignments));
        render(); // refresh the badge if the Assignments screen is open
    }
}

// ================= NOTIFICATION MANAGER =================
const NOTIFY_COOLDOWN_MS = 3 * 60 * 60 * 1000; // 3 Hours in milliseconds

async function setupNotifications() {

    // CORDOVA (real device / installed app)
    if (window.cordova && cordova.plugins?.notification?.local) {
        ensureNotificationChannel();
        return;
    }

    // PLAIN BROWSER (e.g. VS Code Live Server testing)
    if (!("Notification" in window)) {
        console.warn("This browser does not support notifications.");
        return;
    }

    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            console.log("Notification permission granted!");
        }
    }

    checkAssignmentsAndNotify();
    setInterval(checkAssignmentsAndNotify, 15 * 60 * 1000);
}

function checkAssignmentsAndNotify() {
    // Stop if we don't have permission
    if (Notification.permission !== "granted") return;

    let assignmentsData = safeJSONParse("smarthub_assignments", []);
    let now = Date.now();
    let needsSave = false;

    assignmentsData.forEach(task => {
        // MAGIC 1: If the assignment is completed, do nothing!
        if (task.completed) return;

        // Calculate days left
        let dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        let today = new Date();
        today.setHours(0, 0, 0, 0);

        let diffTime = dueDate - today;
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // MAGIC 2: Is it due Today (0) or Tomorrow (1)?
        if (diffDays === 0 || diffDays === 1) {
            let lastNotified = task.lastNotified || 0;

            // MAGIC 3: Has it been 3 hours since the last notification?
            if (now - lastNotified >= NOTIFY_COOLDOWN_MS) {

                // Dynamic text for the background checker
                let notifTitle = diffDays === 0 ? "Deadline Today!" : "Deadline Tomorrow!";
                let notifText = diffDays === 0 ? `Don't forget: "${task.title}" is due TODAY.` : `Don't forget: "${task.title}" is due tomorrow.`;

                triggerDeviceNotification(notifTitle, notifText);

                task.lastNotified = now;
                // If notifCount doesn't exist (legacy tasks), start at 0, then add 1
                task.notifCount = (task.notifCount || 0) + 1;
                needsSave = true;
            }
        }
    });

    // Save the updated timestamps back to local storage
    if (needsSave) {
        localStorage.setItem("smarthub_assignments", JSON.stringify(assignmentsData));
        // Update our global variable so it stays in sync
        assignments = assignmentsData;
    }
}

function triggerDeviceNotification(title, body) {
    // Professional approach: Try to use a Service Worker if available (best for Android)
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: body,
                vibrate: [200, 100, 200], // Haptic vibration pattern
                tag: 'assignment-reminder', // Groups notifications together
                requireInteraction: true
            });
        });
    } else {
        // Fallback for standard browsers
        new Notification(title, {
            body: body,
            vibrate: [200, 100, 200]
        });
    }
}

// ================= EXACT ALARM PERMISSION (Android 13+/14+) =================
function checkExactAlarmPermission() {
    if (!(window.cordova && cordova.plugins?.notification?.local?.canScheduleExactAlarms)) return;

    cordova.plugins.notification.local.canScheduleExactAlarms(function (granted) {
        if (!granted) {
            showExactAlarmExplanation();
        }
    });
}

function showExactAlarmExplanation() {
    if (localStorage.getItem("exact_alarm_prompt_shown")) return;

    showConfirm(
        "Allow Precise Reminders",
        "For deadline reminders to arrive exactly on time (like Calendar alerts), please allow 'Alarms & reminders' for AU Smart Hub in the next screen.",
        "Open Settings",
        () => {
            cordova.plugins.notification.local.openAlarmSettings();
        }
    );
    localStorage.setItem("exact_alarm_prompt_shown", "true");
}

// Re-check when the user comes back from Settings (e.g. after granting it)
document.addEventListener("resume", checkExactAlarmPermission, false);

// ================= NOTIFICATION ONBOARDING =================
function checkFirstTimePermissions() {
    // Only run if Cordova is ready
    if (window.cordova && cordova.plugins?.notification?.local) {
        let hasAsked = localStorage.getItem("notif_prompt_shown");

        if (!hasAsked) {
            // Check actual native permission status first
            cordova.plugins.notification.local.hasPermission(function (granted) {
                if (!granted) {
                    showPermissionExplanation();
                } else {
                    // Already granted, just mark as shown
                    localStorage.setItem("notif_prompt_shown", "true");
                }
            });
        }
    }
}

function showPermissionExplanation() {
    let overlay = document.createElement('div');
    overlay.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity";
    overlay.innerHTML = `
        <div class="bg-white dark:bg-[#1e293b] rounded-3xl p-6 w-full max-w-sm shadow-2xl transform transition-all text-center border border-gray-100 dark:border-gray-700 animate-fade-in-up">
            <div class="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
            </div>
            <h2 class="text-xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Never Miss a Deadline</h2>
            <p class="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                AU Smart Hub needs notification access to remind you when assignments are due. We will only alert you when it matters!
            </p>
            <button id="allowNotifBtn" class="w-full py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95">
                Enable Notifications
            </button>
            <button id="skipNotifBtn" class="w-full mt-3 py-2 text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all">
                Maybe Later
            </button>
        </div>
    `;
    document.body.appendChild(overlay);

    // When they click "Enable", ask the OS for permission
    document.getElementById('allowNotifBtn').onclick = () => {
        cordova.plugins.notification.local.requestPermission(function (granted) {
            localStorage.setItem("notif_prompt_shown", "true"); // Save so it never shows again
            overlay.remove();
        });
    };

    // When they click "Maybe Later", just hide it
    document.getElementById('skipNotifBtn').onclick = () => {
        localStorage.setItem("notif_prompt_shown", "true"); // Save so it never shows again
        overlay.remove();
    };
}