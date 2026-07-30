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

let exitTimer = null;
function exitApp() {
    if (exitTimer) {
        showConfirm("Exit App", "Are you sure you want to exit AU Smart Hub?", "Exit", () => {
            if (navigator.app) navigator.app.exitApp();
        }, "exit");
    } else {
        showToast("Press back again to exit");
        exitTimer = setTimeout(() => exitTimer = null, 2000);
    }
}

// ================= INIT =================
document.addEventListener("deviceready", function () {
    applyTheme();
    document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);

    document.addEventListener("backbutton", function (e) {
        e.preventDefault(); 
        const cancelButtons = ['task-cancel', 'tt-cancel', 'input-cancel-btn', 'confirm-cancel-btn', 'skipNotifBtn'];

        for (let btnId of cancelButtons) {
            let btn = document.getElementById(btnId);
            if (btn) {
                btn.click();
                return; 
            }
        }

        if (currentScreen !== "home") {
            goBack();
            return;
        }

        exitApp();
    }, false);

    render();
    
    // Check Cordova functions safely if setup Notifications module is abstracted out
    if (typeof setupNotifications === 'function') setupNotifications();
    
    if (window.cordova && cordova.plugins.notification.local) {
        if(typeof trackNativeNotificationFired === 'function') {
            cordova.plugins.notification.local.on('trigger', trackNativeNotificationFired);
        }
    }

    checkForUpdates();
}, false);

document.addEventListener("DOMContentLoaded", function () {
    if (!window.cordova) {
        applyTheme();
        document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);
        render();
        checkForUpdates();
    }
});

// Keyboard Auto-dismiss
document.addEventListener('touchstart', function (event) {
    if (event.target.closest('input, select, textarea, button')) return;
    let activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
        activeEl.blur();
    }
}, { passive: true });