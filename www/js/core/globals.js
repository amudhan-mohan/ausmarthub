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

function getGP(g) {
    return { "S": 10, "A": 9, "B": 8, "C": 7, "D": 6, "E": 5, "RA": 0 }[g];
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
const CURRENT_APP_VERSION = "1.0.16";
const GITHUB_REPO = "amudhan-mohan/ausmarthub";

async function checkForUpdates() {
    try {
        let response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
        let data = await response.json();

        if (data && data.tag_name) {
            let latestVersion = data.tag_name.replace('v', '');

            if (isNewerVersion(CURRENT_APP_VERSION, latestVersion)) {
                showToast(`Update v${latestVersion} is available!`);

                if (window.cordova && cordova.plugins.notification.local) {
                    cordova.plugins.notification.local.schedule({
                        id: 9999,
                        title: "Update Available! 🚀",
                        text: `Version v${latestVersion} of AU Smart Hub is ready. Tap to download!`,
                        foreground: true,
                        vibrate: true,
                        icon: 'file://img/au_smart_hub.png',
                        smallIcon: 'res://notify_icon'
                    });
                } else if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("Update Available! 🚀", {
                        body: `Version v${latestVersion} is ready to download.`,
                        vibrate: [200, 100, 200]
                    });
                }

                setTimeout(() => {
                    showConfirm(
                        "Update Available! 🚀",
                        `A new version (v${latestVersion}) of AU Smart Hub is ready. Please update to get the latest features and bug fixes.`,
                        "Download Update",
                        () => {
                            window.open(data.html_url, "_system");
                        },
                        "update" 
                    );
                }, 1500);
            }
        }
    } catch (error) {
        console.log("Could not check for updates (maybe offline).", error);
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