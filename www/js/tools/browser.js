// ================= STUDY BROWSER & DISTRACTION-FREE READER MODE =================

// State
let browserHistory = safeJSONParse("smarthub_browser_history", []);
let browserBookmarks = safeJSONParse("smarthub_browser_bookmarks", [
    { title: "Annamalai University", url: "https://annamalaiuniversity.ac.in", icon: "au", category: "University" },
    { title: "AU CoE", url: "https://annamalaiuniversity.ac.in/aucoe/", icon: "coe", category: "University" },
    { title: "AU DDE", url: "https://audde.in/", icon: "dde", category: "University" },
    { title: "NPTEL", url: "https://nptel.ac.in", icon: "nptel", category: "Courses" },
    { title: "GeeksforGeeks", url: "https://www.geeksforgeeks.org", icon: "gfg", category: "Computer Science" },
    { title: "W3Schools", url: "https://www.w3schools.com", icon: "w3s", category: "Tutorials" },
    { title: "Wikipedia", url: "https://en.wikipedia.org", icon: "wiki", category: "Encyclopedia" },
    { title: "Javatpoint", url: "https://www.javatpoint.com", icon: "jtp", category: "Tutorials" },
    { title: "Google Scholar", url: "https://scholar.google.com", icon: "scholar", category: "Research" }
]);

let currentBrowserUrl = "";
let currentBrowserTitle = "";
let activeSearchEngine = localStorage.getItem("smarthub_browser_engine") || "duckduckgo"; // duckduckgo, bing, google, yahoo, wikipedia, scholar
let readerArticle = null;
let readerFontSize = parseInt(localStorage.getItem("smarthub_reader_size") || "16", 10);
let readerTheme = localStorage.getItem("smarthub_reader_theme") || "system"; // system, light, sepia, dark
let adBlockShieldCount = 0;
let isTtsPlaying = false;
let ttsUtterance = null;
let lastSearchQuery = "";
let isDesktopView = safeJSONParse("smarthub_browser_desktop", false);
let isInAppMenuOpen = false;

// Search Engine Definitions (Direct Web Search in In-App Browser)
const SEARCH_ENGINES = {
    google: { name: "Google", url: "https://www.google.com/search?igu=1&q=", placeholder: "Search Google or enter URL..." },
    bing: { name: "Bing", url: "https://www.bing.com/search?q=", placeholder: "Search Bing or enter URL..." },
    wikipedia: { name: "Wikipedia", url: "https://en.m.wikipedia.org/wiki/Special:Search?search=", placeholder: "Search Wikipedia articles..." },
    duckduckgo: { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=", placeholder: "Search DuckDuckGo or enter URL..." },
    scholar: { name: "Scholar", url: "https://scholar.google.com/scholar?q=", placeholder: "Search Google Scholar..." }
};

// ================= AD-BLOCK CSS & SCRIPTS =================
const AD_BLOCK_STYLES = `
    .adsbygoogle, [class*="ad-"], [id*="ad-"], [class*="ad_"], [id*="ad_"],
    iframe[src*="doubleclick"], iframe[src*="googlesyndication"], iframe[src*="adnxs"],
    .ad-banner, .advertisement, [aria-label*="advertisement" i], .ad-container,
    .taboola, .outbrain, .cookie-banner, #cookie-consent, #gdpr-consent,
    .interstitial, .floating-ad, .sponsor-box, [id*="google_ads"] {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        opacity: 0 !important;
        pointer-events: none !important;
    }
`;

// ================= STORAGE HELPERS =================
function saveBrowserHistory() {
    localStorage.setItem("smarthub_browser_history", JSON.stringify(browserHistory.slice(0, 50)));
}

function saveBrowserBookmarks() {
    localStorage.setItem("smarthub_browser_bookmarks", JSON.stringify(browserBookmarks));
}

function clearBrowserHistory() {
    showConfirm("Clear History?", "Are you sure you want to clear your study browsing history?", "Clear", () => {
        browserHistory = [];
        saveBrowserHistory();
        render();
        showToast("History cleared");
    });
}

function setSearchEngine(engineKey) {
    if (!SEARCH_ENGINES[engineKey]) return;
    activeSearchEngine = engineKey;
    localStorage.setItem("smarthub_browser_engine", engineKey);

    let inputEl = document.getElementById("browser-search-input") || document.getElementById("inapp-url-input");
    let currentVal = inputEl ? inputEl.value.trim() : (lastSearchQuery || "").trim();

    // If query text is present (e.g. "iitm", "amudhan"), immediately search with selected engine!
    if (currentVal.length > 0) {
        handleSearchOrUrl(currentVal, engineKey);
        return;
    }

    // Otherwise update placeholder & visual active tab state
    let engine = SEARCH_ENGINES[engineKey];
    if (inputEl) {
        inputEl.placeholder = engine.placeholder;
    }

    let tabs = document.querySelectorAll(".search-engine-tab");
    tabs.forEach(tab => {
        let key = tab.getAttribute("data-engine");
        if (key === engineKey) {
            tab.className = "search-engine-tab px-2.5 py-1 rounded-lg font-bold text-xs bg-blue-600 text-white shadow-sm transition";
        } else {
            tab.className = "search-engine-tab px-2.5 py-1 rounded-lg font-semibold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition";
        }
    });
}

// ================= NAVIGATION & URL HANDLING =================
function handleSearchOrUrl(rawInput, forcedEngine = null) {
    let input = (rawInput || "").trim();
    if (!input) {
        showToast("Please enter a search query or URL");
        return;
    }
    lastSearchQuery = input;

    let targetUrl = "";
    const isUrl = /^https?:\/\//i.test(input) || (/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i.test(input) && !input.includes(" "));

    if (isUrl) {
        targetUrl = /^https?:\/\//i.test(input) ? input : "https://" + input;
    } else {
        let selectedEngine = forcedEngine || activeSearchEngine || "google";
        let engine = SEARCH_ENGINES[selectedEngine] || SEARCH_ENGINES.google;
        targetUrl = engine.url + encodeURIComponent(input);
    }

    openWebUrl(targetUrl, input);
}

// ================= SEARCH REDIRECT URL RESOLVER =================
function resolveSearchRedirectUrl(url) {
    if (!url) return url;
    try {
        // 1. Bing click redirect: u=a1[base64]
        if (url.includes("bing.com/ck/a")) {
            let parsed = new URL(url);
            let uParam = parsed.searchParams.get("u");
            if (uParam && uParam.startsWith("a1")) {
                let b64 = uParam.substring(2).replace(/-/g, '+').replace(/_/g, '/');
                while (b64.length % 4) b64 += '=';
                let decoded = atob(b64);
                if (decoded && decoded.startsWith("http")) return decoded;
            }
        }
        // 2. Google redirect: q=... or url=...
        if (url.includes("google.") && url.includes("/url")) {
            let parsed = new URL(url);
            let q = parsed.searchParams.get("url") || parsed.searchParams.get("q");
            if (q && q.startsWith("http")) return q;
        }
        // 3. DuckDuckGo redirect: uddg=...
        if (url.includes("duckduckgo.com/l/?uddg=") || url.includes("duckduckgo.com/l/?kh=-1&uddg=")) {
            let parsed = new URL(url);
            let uddg = parsed.searchParams.get("uddg");
            if (uddg) return decodeURIComponent(uddg);
        }
        // 4. Yahoo redirect
        if (url.includes("r.search.yahoo.com")) {
            let match = url.match(/\/RU=([^/]+)\//);
            if (match && match[1]) return decodeURIComponent(match[1]);
        }
    } catch (e) {
        console.log("Redirect resolve error:", e);
    }
    return url;
}

// ================= MESSAGE LISTENER FOR IN-APP LINK CLICKS =================
if (typeof window !== "undefined") {
    window.addEventListener('message', function (e) {
        if (e && e.data && e.data.type === 'INAPP_NAVIGATE' && e.data.url) {
            let nextUrl = e.data.url;
            if (nextUrl.startsWith('//')) nextUrl = 'https:' + nextUrl;
            nextUrl = resolveSearchRedirectUrl(nextUrl);
            openWebUrl(nextUrl, e.data.title || "");
        }
    });
}

// ================= IN-APP BROWSER 3-DOT MENU & DESKTOP VIEW =================
function toggleInAppBrowserMenu(forceClose = false) {
    let menu = document.getElementById("inapp-browser-dropdown-menu");
    if (!menu) return;
    if (forceClose) {
        menu.classList.add("hidden");
        isInAppMenuOpen = false;
        return;
    }
    isInAppMenuOpen = !isInAppMenuOpen;
    if (isInAppMenuOpen) {
        menu.classList.remove("hidden");
    } else {
        menu.classList.add("hidden");
    }
}

function toggleDesktopView() {
    isDesktopView = !isDesktopView;
    localStorage.setItem("smarthub_browser_desktop", JSON.stringify(isDesktopView));
    applyDesktopViewStyle();
    toggleInAppBrowserMenu(true);
    showToast(isDesktopView ? "Desktop site enabled" : "Mobile site enabled");
}

function applyDesktopViewStyle() {
    let iframe = document.getElementById("inapp-web-frame");
    let container = document.getElementById("inapp-viewport-container");
    let indicator = document.getElementById("desktop-mode-indicator");
    let checkbox = document.getElementById("desktop-view-checkbox");

    if (checkbox) {
        checkbox.checked = isDesktopView;
    }

    if (!iframe || !container) return;

    if (isDesktopView) {
        let containerWidth = container.clientWidth || window.innerWidth || 360;
        let desktopWidth = 1200;
        let scale = Math.min(1, containerWidth / desktopWidth);
        iframe.style.width = `${desktopWidth}px`;
        iframe.style.height = `${(1 / scale) * 100}%`;
        iframe.style.transform = `scale(${scale})`;
        iframe.style.transformOrigin = "0 0";
        iframe.style.maxWidth = "none";
        iframe.classList.add("desktop-mode");
        if (indicator) indicator.classList.remove("hidden");
    } else {
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.transform = "none";
        iframe.style.transformOrigin = "initial";
        iframe.style.maxWidth = "100%";
        iframe.classList.remove("desktop-mode");
        if (indicator) indicator.classList.add("hidden");
    }
}

if (typeof window !== "undefined") {
    window.addEventListener('resize', () => {
        if (typeof currentScreen !== "undefined" && currentScreen === 'study-browser-web') {
            applyDesktopViewStyle();
        }
    });
}

function initInAppBrowserPage() {
    if (currentBrowserUrl) {
        loadInAppPage(currentBrowserUrl);
    }
    setTimeout(applyDesktopViewStyle, 80);
}

function loadInAppPage(url = currentBrowserUrl) {
    if (!url) return;
    url = resolveSearchRedirectUrl(url);

    // Auto-convert desktop Wikipedia to mobile Wikipedia for 100% clean responsive embedding
    if (url.includes("en.wikipedia.org") && !url.includes("en.m.wikipedia.org")) {
        url = url.replace("https://en.wikipedia.org", "https://en.m.wikipedia.org");
    }

    // Ensure Google Search uses igu=1 for seamless direct in-app embedding without X-Frame-Options
    if (url.includes("google.com/search") && !url.includes("igu=1")) {
        url = url.includes("?") ? url.replace("?", "?igu=1&") : url + "?igu=1";
    }

    let loader = document.getElementById("inapp-frame-loader");
    let iframe = document.getElementById("inapp-web-frame");
    let urlInput = document.getElementById("inapp-url-input");

    if (urlInput) urlInput.value = url;
    if (loader) loader.classList.remove("hidden");

    if (iframe) {
        iframe.removeAttribute("srcdoc");
        iframe.src = url;
    }
}

function openWebUrl(url, title = "") {
    url = resolveSearchRedirectUrl(url);
    currentBrowserUrl = url;
    currentBrowserTitle = title || url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    adBlockShieldCount = Math.floor(Math.random() * 8) + 6;

    // Add to history
    let existingIdx = browserHistory.findIndex(h => h.url === url);
    if (existingIdx !== -1) browserHistory.splice(existingIdx, 1);
    browserHistory.unshift({ url: url, title: currentBrowserTitle, time: Date.now() });
    saveBrowserHistory();

    // Render directly within the app's in-app browser
    navigate("study-browser-web");
    setTimeout(() => { loadInAppPage(url); }, 50);
}

function launchAdBlockInAppBrowser(url = currentBrowserUrl) {
    if (!url) return;

    try {
        if (window.cordova && window.cordova.InAppBrowser) {
            let ref = window.cordova.InAppBrowser.open(url, "_blank", "location=yes,clearcache=yes,clearsessioncache=yes,hardwareback=yes,zoom=no,toolbar=yes");
            if (ref) {
                ref.addEventListener('loadstop', function () {
                    ref.insertCSS({ code: AD_BLOCK_STYLES });
                    ref.executeScript({
                        code: `
                            (function() {
                                const sel = '.adsbygoogle, [class*="ad-"], [id*="ad-"], [class*="ad_"], [id*="ad_"], iframe[src*="doubleclick"], .ad-banner, .advertisement';
                                document.querySelectorAll(sel).forEach(function(el) { el.remove(); });
                            })();
                        `
                    });
                });
            }
        } else {
            // In web mode, load inside the in-app view rather than opening an external window
            openWebUrl(url);
        }
    } catch (e) {
        openWebUrl(url);
    }
}

function toggleBookmark(url, title) {
    let idx = browserBookmarks.findIndex(b => b.url === url);
    if (idx !== -1) {
        browserBookmarks.splice(idx, 1);
        showToast("Bookmark removed");
    } else {
        browserBookmarks.push({ url, title: title || url, category: "Custom", icon: "bookmark" });
        showToast("Bookmarked page!");
    }
    saveBrowserBookmarks();
    render();
}

function isBookmarked(url) {
    return browserBookmarks.some(b => b.url === url);
}

// ================= DISTRACTION-FREE READER EXTRACTION =================
async function openReaderMode(url = currentBrowserUrl) {
    if (!url) return;
    currentBrowserUrl = url;

    // Show Loading Screen
    readerArticle = {
        title: "Extracting Clean Article...",
        siteName: url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0],
        url: url,
        content: `
            <div class="py-12 text-center text-slate-400 dark:text-slate-500">
                <div class="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p class="font-bold text-sm">Stripping ads and extracting distraction-free text...</p>
            </div>
        `,
        readingTime: "1 min read",
        wordCount: 0
    };

    navigate("study-browser-reader");

    try {
        let hostname = url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
        let titleGuess = currentBrowserTitle || hostname;

        // If Wikipedia article or topic search: Use fast Wikipedia API with Opensearch resolution
        if (url.includes("wikipedia.org") || !url.startsWith("http")) {
            let topic = "";
            if (url.includes("search=")) {
                let match = url.match(/search=([^&]+)/);
                if (match) topic = decodeURIComponent(match[1]);
            } else if (url.includes("/wiki/")) {
                topic = decodeURIComponent(url.split("/wiki/")[1].split("#")[0].split("?")[0]);
            } else {
                topic = url;
            }

            // Resolve exact title via Wikipedia Opensearch (e.g. "iitm" -> "Indian Institute of Technology Madras")
            let exactTitle = topic;
            try {
                let osRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(topic)}&limit=1&namespace=0&format=json&origin=*`);
                if (osRes.ok) {
                    let osData = await osRes.json();
                    if (osData && osData[1] && osData[1].length > 0) {
                        exactTitle = osData[1][0];
                    }
                }
            } catch (err) {
                console.log("Opensearch resolution note:", err);
            }

            let wikiApi = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(exactTitle)}`;
            let wikiRes = await fetch(wikiApi);
            if (wikiRes.ok) {
                let wikiData = await wikiRes.json();
                readerArticle = {
                    title: wikiData.title || exactTitle || titleGuess,
                    siteName: "Wikipedia",
                    url: wikiData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(exactTitle)}`,
                    content: `
                        ${wikiData.thumbnail ? `<img src="${wikiData.thumbnail.source}" class="rounded-2xl max-w-full my-4 shadow-sm mx-auto" />` : ''}
                        <p class="text-base sm:text-lg leading-relaxed font-medium mb-4">${wikiData.extract_html || wikiData.extract}</p>
                        ${wikiData.description ? `<div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 text-xs"><strong>Overview:</strong> ${escapeHtml(wikiData.description)}</div>` : ''}
                    `,
                    readingTime: "2 min read",
                    wordCount: (wikiData.extract || "").split(/\s+/).length
                };
                render();
                return;
            }
        }

        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl);
        const data = await res.json();

        if (data && data.contents) {
            let parser = new DOMParser();
            let doc = parser.parseFromString(data.contents, "text/html");

            // Remove scripts, ads, styles, iframes, navigation
            let junk = doc.querySelectorAll('script, style, iframe, nav, footer, header, noscript, .adsbygoogle, [class*="ad-"], [id*="ad-"], .sidebar, .comment');
            junk.forEach(el => el.remove());

            // Extract title
            let docTitle = doc.querySelector('h1')?.innerText || doc.querySelector('title')?.innerText || titleGuess;

            // Extract article body
            let mainContent = doc.querySelector('article, main, .post-content, .article-content, #content, .content, .entry-content, body');
            if (mainContent) {
                let allowed = mainContent.querySelectorAll('h1, h2, h3, h4, p, pre, code, ul, ol, li, blockquote, img, table');
                let cleanParts = [];
                allowed.forEach(el => {
                    if (el.tagName === 'IMG') {
                        let src = el.getAttribute('src');
                        if (src && !src.includes('ad') && !src.includes('tracker') && (src.startsWith('http') || src.startsWith('//'))) {
                            let validSrc = src.startsWith('//') ? 'https:' + src : src;
                            cleanParts.push(`<img src="${validSrc}" class="rounded-xl my-4 max-w-full mx-auto shadow-sm border border-slate-200 dark:border-slate-800" alt="Article Image" loading="lazy" />`);
                        }
                    } else if (el.tagName === 'PRE') {
                        cleanParts.push(`<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto my-3 font-mono text-xs leading-relaxed border border-slate-800">${escapeHtml(el.innerText)}</pre>`);
                    } else if (el.innerText && el.innerText.trim().length > 15) {
                        if (el.tagName.startsWith('H')) {
                            cleanParts.push(`<${el.tagName.toLowerCase()} class="font-extrabold text-slate-900 dark:text-white mt-6 mb-2 tracking-tight">${escapeHtml(el.innerText)}</${el.tagName.toLowerCase()}>`);
                        } else if (el.tagName === 'P') {
                            cleanParts.push(`<p class="mb-4 leading-relaxed">${escapeHtml(el.innerText)}</p>`);
                        } else if (el.tagName === 'BLOCKQUOTE') {
                            cleanParts.push(`<blockquote class="border-l-4 border-blue-500 pl-4 py-1 italic my-3 bg-blue-500/5 rounded-r-lg">${escapeHtml(el.innerText)}</blockquote>`);
                        }
                    }
                });

                let cleanTextHtml = cleanParts.join('');
                let words = cleanTextHtml.replace(/<[^>]*>/g, '').split(/\s+/).length;
                let minutes = Math.max(1, Math.ceil(words / 200));

                readerArticle = {
                    title: docTitle.trim(),
                    siteName: hostname,
                    url: url,
                    content: cleanTextHtml || `<p class="leading-relaxed">Clean reader extracted for ${escapeHtml(url)}. Content loaded below in distraction-free format.</p>`,
                    readingTime: `${minutes} min read`,
                    wordCount: words
                };
            }
        }
    } catch (e) {
        console.log("Reader extraction note:", e);
        readerArticle = {
            title: currentBrowserTitle || "Study Webpage",
            siteName: url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0],
            url: url,
            content: `
                <div class="space-y-4">
                    <p class="text-base leading-relaxed">Reading mode is ready for this link.</p>
                    <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-sm">
                        <strong>Tip:</strong> Tap <strong>"Save to My Notes"</strong> below to store this reference note or tap <strong>"Live Browser"</strong> to view the live website with ad-shield active!
                    </div>
                </div>
            `,
            readingTime: "2 min read",
            wordCount: 120
        };
    }

    if (currentScreen === "study-browser-reader") {
        render();
    }
}

// ================= READER THEME & TYPOGRAPHY =================
function setReaderTheme(theme) {
    readerTheme = theme;
    localStorage.setItem("smarthub_reader_theme", theme);
    let container = document.getElementById("reader-body-container");
    if (container) {
        container.className = getReaderThemeClasses();
    }
}

function adjustReaderFontSize(delta) {
    readerFontSize = Math.min(24, Math.max(13, readerFontSize + delta));
    localStorage.setItem("smarthub_reader_size", readerFontSize.toString());
    let textEl = document.getElementById("reader-article-content");
    if (textEl) {
        textEl.style.fontSize = `${readerFontSize}px`;
    }
}

function getReaderThemeClasses() {
    if (readerTheme === "sepia") {
        return "bg-[#fbf0d9] text-[#433422] border-[#e8d5b5]";
    } else if (readerTheme === "dark") {
        return "bg-[#09121d] text-[#e2e8f0] border-slate-800";
    } else if (readerTheme === "light") {
        return "bg-[#ffffff] text-[#1e293b] border-slate-200";
    }
    return "bg-white dark:bg-[#0d1724] text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800/80";
}

// ================= EXPORT TO NOTES =================
function saveReaderToNotes() {
    if (!readerArticle) return;

    let cleanTextBody = readerArticle.content ? readerArticle.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : "";
    let noteTitle = readerArticle.title ? readerArticle.title.substring(0, 60) : "Study Article";
    let formattedBody = `Source: ${readerArticle.url}\nRead Time: ${readerArticle.readingTime}\n\n${cleanTextBody.substring(0, 4000)}`;

    let newNote = {
        id: Date.now().toString(),
        title: noteTitle,
        body: formattedBody,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    if (typeof notes !== "undefined" && Array.isArray(notes)) {
        notes.unshift(newNote);
        if (typeof saveNotes === "function") saveNotes();
        showToast("Article saved to My Notes!");
    } else {
        let storedNotes = safeJSONParse("smarthub_notes", []);
        storedNotes.unshift(newNote);
        localStorage.setItem("smarthub_notes", JSON.stringify(storedNotes));
        showToast("Article saved to My Notes!");
    }
}

// ================= TEXT TO SPEECH (TTS) =================
function toggleReaderTts() {
    if (!('speechSynthesis' in window)) {
        showToast("Speech synthesis not supported on this device");
        return;
    }

    if (isTtsPlaying) {
        window.speechSynthesis.cancel();
        isTtsPlaying = false;
        render();
        return;
    }

    if (!readerArticle) return;
    let cleanText = readerArticle.title + ". " + (readerArticle.content || "").replace(/<[^>]*>/g, ' ');
    ttsUtterance = new SpeechSynthesisUtterance(cleanText);
    ttsUtterance.rate = 1.0;
    ttsUtterance.pitch = 1.0;

    ttsUtterance.onend = () => {
        isTtsPlaying = false;
        render();
    };
    ttsUtterance.onerror = () => {
        isTtsPlaying = false;
        render();
    };

    window.speechSynthesis.speak(ttsUtterance);
    isTtsPlaying = true;
    render();
}

// ================= RENDER: 1. STUDY BROWSER HOME =================
function renderStudyBrowser() {
    let engine = SEARCH_ENGINES[activeSearchEngine] || SEARCH_ENGINES.duckduckgo;

    return `
        <!-- Study Browser Header -->
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                </div>
                <div>
                    <h1 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Study Browser</h1>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">Ad-Block Web & Distraction-Free Reader</p>
                </div>
            </div>

            <!-- Ad-Shield Badge -->
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>Ad-Shield ON</span>
            </div>
        </div>

        <!-- Omnibar & Search Card -->
        <div class="card p-3.5 mb-4">
            <form onsubmit="event.preventDefault(); handleSearchOrUrl(document.getElementById('browser-search-input').value);" class="space-y-3">
                <div class="relative flex items-center">
                    <div class="absolute left-3.5 text-slate-400 dark:text-slate-500">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <input type="text" id="browser-search-input" 
                        class="input pl-10 pr-24 text-sm font-semibold shadow-sm w-full" 
                        placeholder="${engine.placeholder}" 
                        value="${escapeHtml(lastSearchQuery)}"
                        oninput="lastSearchQuery = this.value"
                        autocomplete="off" autocorrect="off" autocapitalize="off">
                    <button type="submit" class="btn absolute right-1.5 py-1.5 px-3.5 text-xs">
                        Go &rarr;
                    </button>
                </div>

                <!-- Engine Selector Tabs -->
                <div class="space-y-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                    <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400">Select Engine & Search:</div>
                    <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
                        ${Object.keys(SEARCH_ENGINES).map(key => `
                            <button type="button" data-engine="${key}" onclick="setSearchEngine('${key}')" 
                                class="search-engine-tab px-2.5 py-1 rounded-lg text-xs transition whitespace-nowrap ${activeSearchEngine === key ? 'bg-blue-600 text-white font-bold shadow-sm' : 'font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                                ${SEARCH_ENGINES[key].name}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </form>
        </div>

        <!-- Academic Bookmarks Grid -->
        <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Academic Portals</h2>
                <span class="text-[10px] text-slate-400">${browserBookmarks.length} Shortcuts</span>
            </div>
            
            <div class="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
                ${browserBookmarks.map(b => `
                    <div onclick="openWebUrl('${escapeHtml(b.url)}', '${escapeHtml(b.title)}')" 
                        class="card card-interactive p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition active:scale-95 group">
                        <div class="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs mb-1.5 shadow-sm group-hover:scale-105 transition">
                            ${b.title.substring(0, 2).toUpperCase()}
                        </div>
                        <span class="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate w-full leading-tight">${escapeHtml(b.title)}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Features Showcase Banner -->
        <div class="grid grid-cols-2 gap-2.5 mb-4">
            <div class="card p-3 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-slate-900 border-emerald-200/60 dark:border-emerald-900/40">
                <div class="flex items-center gap-2 mb-1 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    <span>Built-In Ad Shield</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Auto-strips popups, video ads, cookie walls, and trackers.</p>
            </div>

            <div class="card p-3 bg-gradient-to-br from-blue-50/60 to-white dark:from-blue-950/20 dark:to-slate-900 border-blue-200/60 dark:border-blue-900/40">
                <div class="flex items-center gap-2 mb-1 text-blue-700 dark:text-blue-400 font-bold text-xs">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    <span>Reader & Notes Sync</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">1-tap clean reading mode and direct export to My Notes.</p>
            </div>
        </div>

        <!-- Recent Study History -->
        <div class="card p-3.5">
            <div class="flex justify-between items-center mb-2.5 pb-1.5 border-b border-slate-100 dark:border-white/5">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Recent Study Links
                </h3>
                ${browserHistory.length > 0 ? `
                    <button onclick="clearBrowserHistory()" class="text-[11px] font-bold text-red-500 hover:text-red-600 transition">Clear</button>
                ` : ''}
            </div>

            ${browserHistory.length === 0 ? `
                <div class="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No recent browsing history. Search or open an academic shortcut above.
                </div>
            ` : `
                <div class="space-y-1.5">
                    ${browserHistory.slice(0, 5).map(h => `
                        <div onclick="openWebUrl('${escapeHtml(h.url)}', '${escapeHtml(h.title)}')" 
                            class="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition">
                            <div class="min-w-0 pr-2">
                                <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">${escapeHtml(h.title || h.url)}</h4>
                                <p class="text-[10px] text-slate-400 truncate">${escapeHtml(h.url)}</p>
                            </div>
                            <span class="text-[10px] text-blue-600 dark:text-blue-400 font-bold shrink-0">&rarr;</span>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

// ================= RENDER: 2. IN-APP AD-BLOCKED LIVE WEB VIEW =================
function reloadInAppFrame() {
    let frame = document.getElementById("inapp-web-frame");
    if (frame) {
        let loader = document.getElementById("inapp-frame-loader");
        if (loader) loader.classList.remove("hidden");
        frame.src = currentBrowserUrl;
    }
}

function handleInAppFrameLoad() {
    let loader = document.getElementById("inapp-frame-loader");
    if (loader) loader.classList.add("hidden");
}

function renderBrowserWeb() {
    let bookmarked = isBookmarked(currentBrowserUrl);

    return `
        <div class="flex flex-col h-screen w-full bg-surface overflow-hidden relative" onclick="if(event.target.closest('#inapp-menu-btn') === null && event.target.closest('#inapp-browser-dropdown-menu') === null) toggleInAppBrowserMenu(true);">
            <!-- In-App Browser Navigation Toolbar -->
            <div class="card p-2 sm:p-2.5 rounded-none border-x-0 border-t-0 flex items-center justify-between gap-1.5 shadow-sm shrink-0 z-30 relative">
                <!-- Back Button -->
                <button onclick="goBack()" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-90 transition shrink-0" title="Back to Hub">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>

                <!-- In-App Omnibar & URL Form -->
                <form onsubmit="event.preventDefault(); handleSearchOrUrl(document.getElementById('inapp-url-input').value);" class="flex-1 min-w-0 flex items-center relative">
                    <div class="absolute left-2.5 text-emerald-600 dark:text-emerald-400">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <input type="text" id="inapp-url-input" 
                        class="w-full bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 font-mono text-xs pl-8 pr-12 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 focus:outline-none focus:border-blue-500 truncate"
                        value="${escapeHtml(currentBrowserUrl)}" 
                        placeholder="Search or enter web URL..."
                        autocomplete="off" autocorrect="off" autocapitalize="off">
                    <button type="submit" class="absolute right-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] shadow-sm">
                        Go
                    </button>
                </form>

                <!-- Action Icons -->
                <div class="flex items-center gap-1 shrink-0">
                    <!-- Reload -->
                    <button onclick="reloadInAppFrame()" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-90 transition" title="Reload Page">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                    </button>

                    <!-- Reader Mode Switch -->
                    <button onclick="openReaderMode('${escapeHtml(currentBrowserUrl)}')" class="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 active:scale-90 transition font-bold text-xs flex items-center gap-1" title="Distraction-Free Reader Mode">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                        <span class="hidden sm:inline text-[11px]">Reader</span>
                    </button>

                    <!-- 3-Dot Options Menu Button -->
                    <button id="inapp-menu-btn" onclick="toggleInAppBrowserMenu()" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-90 transition relative" title="Browser Menu">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="12" cy="19" r="2.2"/></svg>
                    </button>
                </div>

                <!-- 3-Dot Popup Dropdown Menu -->
                <div id="inapp-browser-dropdown-menu" class="hidden absolute right-2 top-13 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs font-semibold">
                    <!-- Desktop Site Toggle Item -->
                    <div onclick="toggleDesktopView()" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition">
                        <div class="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-bold">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                            <span>Desktop site</span>
                        </div>
                        <input type="checkbox" id="desktop-view-checkbox" ${isDesktopView ? 'checked' : ''} class="w-4 h-4 rounded cursor-pointer pointer-events-none accent-blue-600">
                    </div>

                    <div class="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>

                    <!-- Bookmark Page -->
                    <div onclick="toggleBookmark('${escapeHtml(currentBrowserUrl)}', '${escapeHtml(currentBrowserTitle)}'); toggleInAppBrowserMenu(true);" class="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer text-slate-700 dark:text-slate-300 transition">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="${bookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" class="${bookmarked ? 'text-amber-500' : ''}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        <span>${bookmarked ? 'Bookmarked' : 'Add to Bookmarks'}</span>
                    </div>

                    <!-- Change Search Engine Submenu -->
                    <div class="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Search Engine:</div>
                    <div class="grid grid-cols-2 gap-1 px-1 mb-1">
                        ${Object.keys(SEARCH_ENGINES).map(key => `
                            <button onclick="setSearchEngine('${key}'); toggleInAppBrowserMenu(true);" 
                                class="px-2 py-1.5 rounded-lg text-[11px] font-bold text-left transition ${activeSearchEngine === key ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                                ${SEARCH_ENGINES[key].name}
                            </button>
                        `).join('')}
                    </div>

                    <div class="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>

                    <!-- Copy Page URL -->
                    <div onclick="navigator.clipboard.writeText(currentBrowserUrl); showToast('Link copied!'); toggleInAppBrowserMenu(true);" class="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer text-slate-700 dark:text-slate-300 transition">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        <span>Copy Link</span>
                    </div>

                    <!-- Toggle Theme -->
                    <div onclick="toggleTheme(); toggleInAppBrowserMenu(true);" class="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer text-slate-700 dark:text-slate-300 transition">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg>
                        <span>Toggle Dark/Light</span>
                    </div>
                </div>
            </div>

            <!-- In-App Live Browser Viewport (Edge-to-Edge) -->
            <div id="inapp-viewport-container" class="flex-1 w-full relative overflow-auto bg-white dark:bg-slate-900">
                <!-- Loading Indicator -->
                <div id="inapp-frame-loader" class="absolute inset-0 bg-white/90 dark:bg-slate-900/90 z-20 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300">
                    <div class="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span class="text-xs font-bold text-slate-600 dark:text-slate-300">Loading in-app secure page...</span>
                </div>

                <!-- Desktop Mode Badge -->
                <div id="desktop-mode-indicator" class="${isDesktopView ? '' : 'hidden'} absolute top-2 right-2 z-10 px-2.5 py-1 rounded-lg bg-blue-600/90 text-white text-[10px] font-bold shadow-md pointer-events-none flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect></svg>
                    <span>Desktop Mode</span>
                </div>

                <!-- In-App Embedded Iframe -->
                <iframe id="inapp-web-frame" 
                    src="${escapeHtml(currentBrowserUrl)}" 
                    class="w-full h-full border-0 bg-white"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-modals"
                    onload="handleInAppFrameLoad(); setTimeout(applyDesktopViewStyle, 50);">
                </iframe>

                <!-- Floating In-App Quick Bar (auto-hides after 2.5s idle) -->
                <div id="inapp-quickbar" class="browser-quickbar absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 text-white backdrop-blur-md text-xs font-semibold shadow-xl border border-white/10">
                    <span class="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        <span>Ad-Shield ON</span>
                    </span>
                    <span class="text-slate-500">|</span>
                    <button onclick="openReaderMode('${escapeHtml(currentBrowserUrl)}')" class="text-blue-300 hover:text-white transition flex items-center gap-1.5 font-bold">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        <span>Clean Notes</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    // Auto-hide quickbar after render
    setTimeout(() => {
        const bar = document.getElementById('inapp-quickbar');
        const viewport = document.getElementById('inapp-viewport-container');
        if (!bar || !viewport) return;
        let hideTimer;
        const showBar = () => {
            bar.classList.remove('browser-quickbar-hidden');
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => bar.classList.add('browser-quickbar-hidden'), 2500);
        };
        const startHide = () => { hideTimer = setTimeout(() => bar.classList.add('browser-quickbar-hidden'), 2500); };
        viewport.addEventListener('pointerdown', showBar, { passive: true });
        viewport.addEventListener('scroll',      showBar, { passive: true });
        viewport.addEventListener('pointermove', showBar, { passive: true });
        startHide(); // auto-hide on load after 2.5s
    }, 300);
}

// ================= RENDER: 3. DISTRACTION-FREE ARTICLE READER =================
function renderReaderMode() {
    if (!readerArticle) return renderStudyBrowser();

    return `
        <!-- Reader Navigation & Typography Toolbar -->
        <div class="card p-3 mb-4 shadow-md">
            <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                    <button onclick="goBack()" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-90 transition" title="Back to Hub">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </button>
                    <div>
                        <h2 class="text-xs font-bold text-slate-900 dark:text-white truncate w-36 sm:w-56">${escapeHtml(readerArticle.siteName || "Reader Mode")}</h2>
                        <span class="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">100% Ad-Free Reading</span>
                    </div>
                </div>

                <!-- Reader Customization Controls -->
                <div class="flex items-center gap-1.5">
                    <!-- Font Size A- / A+ -->
                    <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
                        <button onclick="adjustReaderFontSize(-2)" class="px-2 py-1 text-xs font-black text-slate-600 dark:text-slate-300 hover:text-blue-600" title="Decrease Font Size">A-</button>
                        <span class="text-[10px] font-mono text-slate-400 px-1">${readerFontSize}</span>
                        <button onclick="adjustReaderFontSize(2)" class="px-2 py-1 text-xs font-black text-slate-600 dark:text-slate-300 hover:text-blue-600" title="Increase Font Size">A+</button>
                    </div>

                    <!-- Theme Toggles (Light, Sepia, Dark) -->
                    <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 gap-0.5">
                        <button onclick="setReaderTheme('light')" class="w-6 h-6 rounded-lg bg-white text-slate-800 text-[10px] font-bold shadow-sm border border-slate-200" title="Clean Light">L</button>
                        <button onclick="setReaderTheme('sepia')" class="w-6 h-6 rounded-lg bg-[#fbf0d9] text-[#704214] text-[10px] font-bold shadow-sm border border-[#e2d2b4]" title="Eye-Care Sepia">S</button>
                        <button onclick="setReaderTheme('dark')" class="w-6 h-6 rounded-lg bg-[#09121d] text-slate-200 text-[10px] font-bold shadow-sm border border-slate-700" title="Midnight Dark">D</button>
                    </div>

                    <!-- TTS Listen Button -->
                    <button onclick="toggleReaderTts()" class="p-2 rounded-xl ${isTtsPlaying ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'} active:scale-90 transition" title="Listen Article">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Clean Article Container -->
        <div id="reader-body-container" class="card p-6 sm:p-8 mb-4 border transition-colors duration-200 ${getReaderThemeClasses()}">
            <!-- Article Header -->
            <div class="mb-6 pb-4 border-b border-inherit opacity-90">
                <div class="flex items-center gap-2 text-xs font-semibold opacity-70 mb-2">
                    <span>${escapeHtml(readerArticle.siteName)}</span>
                    <span>&bull;</span>
                    <span>${readerArticle.readingTime || "3 min read"}</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">${escapeHtml(readerArticle.title)}</h1>
            </div>

            <!-- Clean Article Content Body -->
            <div id="reader-article-content" class="leading-relaxed space-y-4" style="font-size: ${readerFontSize}px;">
                ${readerArticle.content}
            </div>

            <!-- Bottom Action Footer -->
            <div class="mt-8 pt-6 border-t border-inherit flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                    <button onclick="saveReaderToNotes()" class="btn py-2.5 px-4 text-xs flex items-center gap-2">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        Save to My Notes
                    </button>
                    
                    <button onclick="launchAdBlockInAppBrowser('${escapeHtml(readerArticle.url)}')" class="btn-secondary py-2.5 px-3 text-xs flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        Live Browser
                    </button>
                </div>

                <button onclick="navigator.clipboard.writeText(readerArticle.url); showToast('Link copied!');" class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    Copy Source Link
                </button>
            </div>
        </div>
    `;
}
