// ================= GLOBAL STATE =================
let currentScreen = "home";
let historyStack = [];
let isPopupOpen = false;
let currentAppScreen = 'home';

// Theme
let isDarkMode = localStorage.getItem("theme") === "dark";
let chartInstance = null;

// ================= UTILITIES =================
function safeJSONParse(key, fallback) {
    try {
        let item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        return fallback;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function triggerHaptic(ms = 20) {
    try {
        if (typeof navigator !== 'undefined') {
            if (navigator.vibrate) {
                navigator.vibrate(ms);
            } else if (navigator.notification && typeof navigator.notification.vibrate === 'function') {
                const dur = Array.isArray(ms) ? ms[0] : ms;
                navigator.notification.vibrate(dur || 20);
            }
        }
    } catch (e) {}
}

function getGP(g) {
    if (!g) return 0;
    const map = { 
        "S": 10, "A": 9, "B": 8, "C": 7, "D": 6, "E": 5, "RA": 0,
        "O": 10, "A+": 9, "B+": 7, "AB": 0, "U": 0, "W": 0 
    };
    return map[g] !== undefined ? map[g] : 0;
}

// ================= THEME =================
function applyTheme() {
    const root = document.body;
    const htmlRoot = document.documentElement;

    htmlRoot.style.colorScheme = isDarkMode ? "dark" : "light";

    if (isDarkMode) {
        root.classList.remove("light");
        root.classList.add("dark");
        htmlRoot.classList.add("dark");

        const icon = document.getElementById("themeIcon");
        if (icon) icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    } else {
        root.classList.remove("dark");
        root.classList.add("light");
        htmlRoot.classList.remove("dark");

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

// ================= AUTO UPDATE CHECKER =================
// Version is auto-injected from config.xml via hooks/before_prepare/inject_version.js
// → www/js/core/app-version.js sets window.APP_VERSION before this file loads.
const CURRENT_APP_VERSION = window.APP_VERSION || "1.0.18";
const GITHUB_REPO = "amudhan-mohan/ausmarthub";

async function checkForUpdates() {
    try {
        let response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
        let data = await response.json();

        if (data && data.tag_name) {
            let latestVersion = data.tag_name.replace('v', '');

            if (isNewerVersion(CURRENT_APP_VERSION, latestVersion)) {
                showToast(`Update v${latestVersion} is available!`);

                // Native notification
                if (window.cordova && cordova.plugins && cordova.plugins.notification && cordova.plugins.notification.local) {
                    cordova.plugins.notification.local.schedule({
                        id: 9999,
                        title: "Update Available",
                        text: `v${latestVersion} of AU Smart Hub is ready to install!`,
                        foreground: true,
                        vibrate: true,
                        icon: 'file://img/au_smart_hub.png',
                        smallIcon: 'res://notify_icon'
                    });
                } else if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("Update Available", {
                        body: `v${latestVersion} is ready to download.`,
                        vibrate: [200, 100, 200]
                    });
                }

                // Find APK asset (if uploaded to release)
                let apkUrl = null;
                if (data.assets && data.assets.length > 0) {
                    const apkAsset = data.assets.find(a =>
                        a.name.toLowerCase().endsWith('.apk') && a.browser_download_url
                    );
                    if (apkAsset) apkUrl = apkAsset.browser_download_url;
                }

                // Real changelog from GitHub release body
                const changelog = data.body || '';

                setTimeout(() => {
                    showUpdateDialog(
                        latestVersion,  // e.g. "1.0.17"
                        changelog,      // real markdown release notes
                        apkUrl,         // direct APK URL or null
                        data.html_url   // fallback: GitHub release page
                    );
                }, 1500);
            }
        }
    } catch (error) {
        console.log("Could not check for updates (offline or rate-limited).", error);
    }
}

function isNewerVersion(current, latest) {
    let currParts = current.split('.').map(Number);
    let latestParts = latest.split('.').map(Number);

    for (let i = 0; i < latestParts.length; i++) {
        if (latestParts[i] > (currParts[i] || 0)) return true;
        if (latestParts[i] < (currParts[i] || 0)) return false;
    }
    return false;
}