let lastBackActionTime = 0;
let exitTimer = null;
let lastExitToastTime = 0;

function handleExitApp() {
    const now = Date.now();
    // If exit timer is active and this second back press came after the minimum gesture debounce (> 450ms)
    if (exitTimer && (now - lastExitToastTime >= 450)) {
        clearTimeout(exitTimer);
        exitTimer = null;
        lastExitToastTime = 0;
        showConfirm("Exit App", "Are you sure you want to exit AU Smart Hub?", "Exit", () => {
            if (navigator.app && typeof navigator.app.exitApp === "function") {
                navigator.app.exitApp();
            }
        }, "exit");
    } else if (!exitTimer) {
        // First back press on Home: display toast message and begin exit confirmation window
        lastExitToastTime = now;
        showToast("Press back again to exit");
        exitTimer = setTimeout(() => {
            exitTimer = null;
            lastExitToastTime = 0;
        }, 2500);
    }
}

function exitApp() {
    handleExitApp();
}

function handleHardwareBack(e) {
    const now = Date.now();
    if (now - lastBackActionTime < 350) {
        if (e && e.preventDefault) { try { e.preventDefault(); } catch (err) {} }
        return;
    }
    lastBackActionTime = now;

    // cancel buttons
    const cancelButtons = ['upd-close', 'upd-later-btn', 'task-cancel',
        'tt-cancel', 'input-cancel-btn', 'confirm-cancel-btn', 'skipNotifBtn'];
    for (let btnId of cancelButtons) {
        const btn = document.getElementById(btnId);
        if (btn) {
            if (e && e.preventDefault) e.preventDefault();
            btn.click();
            return;
        }
    }

    // confirm modal
    const confirmModal = document.getElementById('custom-confirm-modal');
    if (confirmModal) {
        if (e && e.preventDefault) e.preventDefault();
        confirmModal.remove();
        return;
    }

    // input modal
    const inputModal = document.getElementById('custom-input-modal');
    if (inputModal) {
        if (e && e.preventDefault) e.preventDefault();
        inputModal.remove();
        return;
    }

    // in-app browser menu
    if (typeof isInAppMenuOpen !== "undefined" && isInAppMenuOpen) {
        if (typeof toggleInAppBrowserMenu === "function") {
            if (e && e.preventDefault) e.preventDefault();
            toggleInAppBrowserMenu(true);
            return;
        }
    }

    // app dropdown menu
    const appMenu = document.getElementById('appDropdownMenu');
    if (appMenu && appMenu.style.display !== 'none'
        && !appMenu.classList.contains('hidden')) {
        if (e && e.preventDefault) e.preventDefault();
        closeAppMenu();
        return;
    }

    // calc settings
    const calcOverlay = document.getElementById('calc-settings-overlay')
        || document.getElementById('calc-settings-sheet');
    if (calcOverlay) {
        if (typeof closeCalcSettings === "function") {
            if (e && e.preventDefault) e.preventDefault();
            closeCalcSettings();
            return;
        }
    }

    // in-app navigation (sub-screen or non-empty history stack)
    if ((typeof currentScreen !== "undefined" && currentScreen !== "home") || (typeof historyStack !== "undefined" && historyStack.length > 0)) {
        if (e && e.preventDefault) e.preventDefault();
        goBack();
        return;
    }

    // On home screen: handle two-step exit flow (1st swipe = toast, 2nd swipe = confirm dialog)
    if (e && e.preventDefault) e.preventDefault();
    handleExitApp();
}

// ================= WHATSAPP-STYLE HEADER DROPDOWN MENU =================
function toggleAppMenu(e) {
    if (e) {
        e.stopPropagation();
    }
    const menu = document.getElementById("appDropdownMenu");
    const btn = document.getElementById("appMenuBtn");
    if (!menu) return;

    const isOpen = menu.style.display !== "none" && !menu.classList.contains("hidden");
    if (isOpen) {
        closeAppMenu();
    } else {
        openAppMenu();
    }
}

function openAppMenu() {
    const menu = document.getElementById("appDropdownMenu");
    const btn = document.getElementById("appMenuBtn");
    if (!menu) return;
    triggerHaptic(10);
    menu.classList.remove("hidden");
    menu.style.display = "block";
    btn?.setAttribute("aria-expanded", "true");

    setTimeout(() => {
        document.addEventListener("click", onAppMenuOutsideClick, { capture: true });
        document.addEventListener("touchstart", onAppMenuOutsideClick, { passive: true, capture: true });
    }, 10);
}

function closeAppMenu() {
    const menu = document.getElementById("appDropdownMenu");
    const btn = document.getElementById("appMenuBtn");
    if (!menu) return;
    menu.classList.add("hidden");
    menu.style.display = "none";
    btn?.setAttribute("aria-expanded", "false");
    document.removeEventListener("click", onAppMenuOutsideClick, { capture: true });
    document.removeEventListener("touchstart", onAppMenuOutsideClick, { capture: true });
}

function onAppMenuOutsideClick(e) {
    const menu = document.getElementById("appDropdownMenu");
    const btn = document.getElementById("appMenuBtn");
    if (!menu) return;
    if (btn && btn.contains(e.target)) return;
    if (!menu.contains(e.target)) {
        closeAppMenu();
    }
}

function handleAppMenuItem(screen) {
    closeAppMenu();
    navigate(screen);
}

// ================= INIT =================
document.addEventListener("deviceready", function () {
    applyTheme();
    document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);

    // Hardware back button & Android gesture navigation handler
    document.addEventListener("backbutton", handleHardwareBack, false);

    // Dismiss native splashscreen immediately if present
    if (navigator.splashscreen && typeof navigator.splashscreen.hide === "function") {
        navigator.splashscreen.hide();
    }

    render();
    
    // Check Cordova functions safely if setup Notifications module is abstracted out
    if (typeof setupNotifications === 'function') setupNotifications();
    
    if (window.cordova && cordova.plugins?.notification?.local) {
        if(typeof trackNativeNotificationFired === 'function') {
            cordova.plugins.notification.local.on('trigger', trackNativeNotificationFired);
        }
    }

    checkForUpdates();
}, false);

document.addEventListener("DOMContentLoaded", function () {
    // Listen for gesture navigation popstate in browser environments only
    if (!window.cordova) {
        window.addEventListener("popstate", function (e) {
            handleHardwareBack(e);
        });
    }

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