// ================= SHARED UI COMPONENTS =================
function showToast(message, type = 'info') {
    triggerHaptic(10);
    let existing = document.getElementById('app-toast');
    if (existing) existing.remove();

    let toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900/90 dark:bg-slate-100/90 backdrop-blur-md text-white dark:text-slate-900 px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold tracking-wide flex items-center gap-2 max-w-[90vw] truncate transition-all duration-200';

    let icon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    toast.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 14px) scale(0.95)';
        setTimeout(() => toast.remove(), 220);
    }, 2200);
}

// ================= PROFESSIONAL UPDATE DIALOG =================
function showUpdateDialog(version, changelog, apkUrl, releasePageUrl) {
    triggerHaptic(15);
    let existing = document.getElementById('upd-dialog');
    if (existing) existing.remove();

    const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');

    // Simple markdown → readable HTML
    function parseChangelog(md) {
        if (!md || md.trim() === '') {
            return '<p style="color:#94a3b8;font-size:0.8rem;margin:0;">See GitHub release page for full details.</p>';
        }

        // 1. Strip ONLY dangerous tags (script, iframe, event attrs) — allow <strong>, <em>, <code> etc.
        function sanitize(str) {
            return str
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
                .replace(/\s+on\w+="[^"]*"/gi, '')
                .replace(/\s+on\w+='[^']*'/gi, '');
        }

        // 2. Convert markdown inline syntax → HTML (runs on already-sanitized text)
        function inlineMD(str) {
            return str
                .replace(/\*\*\*(.*?)\*\*\*/g,  '<strong><em>$1</em></strong>')
                .replace(/\*\*(.*?)\*\*/g,       '<strong>$1</strong>')
                .replace(/__(.*?)__/g,            '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g,            '<em>$1</em>')
                .replace(/_((?!_).*?)_/g,         '<em>$1</em>')
                .replace(/`([^`]+)`/g,            '<code style="background:rgba(81,165,212,0.12);padding:1px 5px;border-radius:4px;font-size:0.85em;font-family:monospace;">$1</code>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#51A5D4;text-decoration:underline;" target="_blank">$1</a>');
        }

        const accent    = isDark ? '#7dd3fc' : '#1F618D';
        const itemColor = isDark ? '#cbd5e1' : '#334155';
        const paraColor = isDark ? '#94a3b8' : '#64748b';
        const codeStyle = isDark ? 'background:#1e3048;color:#7dd3fc' : 'background:#eff6ff;color:#1d4ed8';

        let html = '';
        const lines = md.split('\n');
        let inList = false;

        for (let raw of lines) {
            const line = raw.trimEnd();
            const trimmed = line.trim();

            if (!trimmed) {
                if (inList) { html += '</ul>'; inList = false; }
                continue;
            }

            // Headings (##, ###)
            if (/^#{1,3}\s/.test(trimmed)) {
                if (inList) { html += '</ul>'; inList = false; }
                const text = inlineMD(sanitize(trimmed.replace(/^#+\s*/, '')));
                html += `<p style="font-size:0.72rem;font-weight:800;color:${accent};margin:10px 0 4px;text-transform:uppercase;letter-spacing:0.06em;">${text}</p>`;

            // Bullet list items (-, *, +, or ✓ ✅ 🔸 emoji prefixes)
            } else if (/^[-*+]\s/.test(trimmed) || /^[✓✅🔸🔹🟡🟢🔴›•]\s/.test(trimmed)) {
                if (!inList) { html += `<ul style="margin:2px 0 6px;padding-left:0;list-style:none;">`; inList = true; }
                const text = inlineMD(sanitize(trimmed.replace(/^[-*+✓✅🔸🔹🟡🟢🔴›•]\s*/, '')));
                html += `<li style="font-size:0.79rem;color:${itemColor};line-height:1.65;margin-bottom:2px;display:flex;gap:6px;align-items:flex-start;"><span style="color:${accent};font-weight:700;flex-shrink:0;margin-top:1px;">›</span><span>${text}</span></li>`;

            // Numbered list
            } else if (/^\d+\.\s/.test(trimmed)) {
                if (!inList) { html += `<ul style="margin:2px 0 6px;padding-left:0;list-style:none;">`; inList = true; }
                const text = inlineMD(sanitize(trimmed.replace(/^\d+\.\s*/, '')));
                html += `<li style="font-size:0.79rem;color:${itemColor};line-height:1.65;margin-bottom:2px;display:flex;gap:6px;align-items:flex-start;"><span style="color:${accent};font-weight:700;flex-shrink:0;margin-top:1px;">›</span><span>${text}</span></li>`;

            // Horizontal rule
            } else if (/^---+$|^\*\*\*+$/.test(trimmed)) {
                if (inList) { html += '</ul>'; inList = false; }
                html += `<hr style="border:none;border-top:1px solid ${isDark?'#1e3048':'#e2e8f0'};margin:8px 0;">`;

            // Normal paragraph
            } else {
                if (inList) { html += '</ul>'; inList = false; }
                const text = inlineMD(sanitize(trimmed));
                html += `<p style="font-size:0.79rem;color:${paraColor};line-height:1.6;margin-bottom:3px;">${text}</p>`;
            }
        }
        if (inList) html += '</ul>';
        return html || '<p style="color:#94a3b8;font-size:0.8rem;margin:0;">See GitHub release page for full details.</p>';
    }

    const bg0  = isDark ? '#0d1724' : '#ffffff';
    const bg1  = isDark ? '#0a1520' : '#f8fafc';

    const brd  = isDark ? '#1e3048' : '#e2e8f0';
    const txt  = isDark ? '#e2e8f0' : '#1e293b';
    const sub  = isDark ? '#64748b' : '#94a3b8';
    const btnC = isDark ? '#152233' : '#f1f5f9';
    const btnT = isDark ? '#94a3b8' : '#475569';
    const btnB = isDark ? '#1e3048' : '#e2e8f0';

    const overlay = document.createElement('div');
    overlay.id = 'upd-dialog';
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:99998',
        'display:flex', 'align-items:flex-end', 'justify-content:center',
        'background:rgba(0,0,0,0.72)', 'backdrop-filter:blur(10px)',
        '-webkit-backdrop-filter:blur(10px)',
        'opacity:0', 'transition:opacity 0.26s ease'
    ].join(';');

    overlay.innerHTML = `
<div id="upd-panel" style="
    width:100%;max-width:28rem;
    background:${bg0};
    border-radius:1.75rem 1.75rem 0 0;
    overflow:hidden;max-height:92dvh;
    display:flex;flex-direction:column;
    transform:translateY(100%);
    transition:transform 0.33s cubic-bezier(0.32,0.72,0,1);
    box-shadow:0 -16px 60px rgba(0,0,0,0.5);
    border:1.5px solid ${brd};border-bottom:none;">

    <!-- HEADER GRADIENT -->
    <div style="background:linear-gradient(140deg,#061626 0%,#0d2e4a 35%,#1F618D 100%);padding:1.5rem 1.4rem 1.4rem;position:relative;overflow:hidden;flex-shrink:0;">
        <!-- Decorative blobs -->
        <div style="position:absolute;top:-50px;right:-50px;width:180px;height:180px;border-radius:50%;background:rgba(81,165,212,0.07);"></div>
        <div style="position:absolute;bottom:-40px;left:-20px;width:130px;height:130px;border-radius:50%;background:rgba(255,255,255,0.03);"></div>

        <!-- Close button -->
        <button id="upd-close" style="position:absolute;top:14px;right:14px;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.14);color:rgba(255,255,255,0.7);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;" aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div style="display:flex;align-items:center;gap:14px;position:relative;">
            <!-- App icon -->
            <div style="width:58px;height:58px;border-radius:20px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.16);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
                <img src="img/au_smart_hub.png" style="width:40px;height:40px;object-fit:contain;border-radius:10px;">
            </div>
            <div>
                <div style="font-size:0.58rem;font-weight:700;color:rgba(255,255,255,0.45);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:3px;">AU Smart Hub</div>
                <div style="font-size:1.2rem;font-weight:900;color:#fff;line-height:1.1;letter-spacing:-0.02em;">Update Available</div>
                <!-- Animated version badge -->
                <div style="display:inline-flex;align-items:center;gap:5px;margin-top:6px;padding:3px 11px;border-radius:99px;background:rgba(125,211,252,0.12);border:1px solid rgba(125,211,252,0.28);">
                    <span style="width:6px;height:6px;border-radius:50%;background:#34d399;display:inline-block;animation:updDot 1.5s ease-in-out infinite;"></span>
                    <span style="font-size:0.68rem;font-weight:800;color:#7dd3fc;letter-spacing:0.04em;">v${escapeHtml(version)} Ready to Install</span>
                </div>
            </div>
        </div>
    </div>

    <!-- SCROLLABLE BODY -->
    <div style="flex:1;overflow-y:auto;padding:1.2rem 1.4rem 0.4rem;scrollbar-width:none;">

        <!-- Version diff strip -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1rem;background:${bg1};border:1.5px solid ${brd};border-radius:14px;margin-bottom:1rem;">
            <div style="text-align:center;flex:1;">
                <div style="font-size:0.58rem;font-weight:700;color:${sub};letter-spacing:0.1em;text-transform:uppercase;margin-bottom:3px;">Current</div>
                <div style="font-size:0.92rem;font-weight:800;color:#ef4444;">v${escapeHtml(window.APP_VERSION || '?')}</div>
            </div>
            <div style="flex:0.8;display:flex;align-items:center;justify-content:center;gap:2px;">
                <div style="height:1.5px;flex:1;background:linear-gradient(90deg,transparent,${brd});"></div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${sub}" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                <div style="height:1.5px;flex:1;background:linear-gradient(90deg,${brd},transparent);"></div>
            </div>
            <div style="text-align:center;flex:1;">
                <div style="font-size:0.58rem;font-weight:700;color:${sub};letter-spacing:0.1em;text-transform:uppercase;margin-bottom:3px;">New</div>
                <div style="font-size:0.92rem;font-weight:800;color:#22c55e;">v${escapeHtml(version)}</div>
            </div>
        </div>

        <!-- Changelog -->
        <div style="margin-bottom:1rem;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${isDark ? '#7dd3fc' : '#1F618D'}" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span style="font-size:0.68rem;font-weight:800;color:${isDark ? '#7dd3fc' : '#1F618D'};text-transform:uppercase;letter-spacing:0.08em;">What's New in v${escapeHtml(version)}</span>
            </div>
            <div id="upd-changelog" style="background:${bg1};border:1.5px solid ${brd};border-radius:13px;padding:0.9rem 1rem;max-height:155px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:${brd} transparent;">
                ${parseChangelog(changelog)}
            </div>
        </div>

    </div>

    <!-- DOWNLOAD PROGRESS (hidden) -->
    <div id="upd-prog-wrap" style="display:none;padding:0 1.4rem 0.2rem;flex-shrink:0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
            <span id="upd-dl-label" style="font-size:0.73rem;font-weight:700;color:${isDark ? '#7dd3fc' : '#1F618D'};">Preparing download…</span>
            <span id="upd-dl-pct" style="font-size:0.73rem;font-weight:800;color:${txt};">0%</span>
        </div>
        <div style="height:9px;background:${brd};border-radius:99px;overflow:hidden;margin-bottom:5px;">
            <div id="upd-prog-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#103654,#1F618D,#51A5D4);border-radius:99px;transition:width 0.25s ease;position:relative;overflow:hidden;">
                <div style="position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.25) 50%,transparent 100%);animation:updShimmer 1.4s linear infinite;"></div>
            </div>
        </div>
        <div style="display:flex;justify-content:space-between;">
            <span id="upd-dl-size" style="font-size:0.63rem;color:${sub};font-weight:600;"></span>
            <span id="upd-dl-speed" style="font-size:0.63rem;color:${sub};font-weight:600;"></span>
        </div>
    </div>

    <!-- BUTTONS -->
    <div style="padding:0.9rem 1.4rem 1.7rem;flex-shrink:0;display:flex;gap:0.65rem;">
        <button id="upd-later-btn" style="flex:1;padding:0.9rem;border-radius:14px;font-weight:700;font-size:0.84rem;background:${btnC};color:${btnT};border:1.5px solid ${btnB};cursor:pointer;transition:all 0.15s;">
            Later
        </button>
        <button id="upd-dl-btn" style="flex:2.5;padding:0.9rem;border-radius:14px;font-weight:800;font-size:0.84rem;background:linear-gradient(135deg,#0e3553,#1F618D);color:#fff;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(14,53,83,0.45);display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.2s;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Update Now
        </button>
    </div>
</div>

<style>
@keyframes updDot     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
@keyframes updShimmer { from{transform:translateX(-100%)} to{transform:translateX(200%)} }
#upd-changelog::-webkit-scrollbar { width:4px; }
#upd-changelog::-webkit-scrollbar-thumb { background:${brd}; border-radius:4px; }
</style>`;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        document.getElementById('upd-panel').style.transform = 'translateY(0)';
    });

    const closeDialog = () => {
        overlay.style.opacity = '0';
        const panel = document.getElementById('upd-panel');
        if (panel) panel.style.transform = 'translateY(100%)';
        setTimeout(() => overlay.remove(), 340);
    };

    overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay) closeDialog(); });
    document.getElementById('upd-close').onclick = closeDialog;
    document.getElementById('upd-later-btn').onclick = closeDialog;

    // ── Download & Install ──────────────────────────────────────
    document.getElementById('upd-dl-btn').onclick = function () {
        const hasApk = apkUrl && apkUrl.toLowerCase().endsWith('.apk');
        if (!hasApk) {
            // No APK asset uploaded → open GitHub release page
            window.open(releasePageUrl || apkUrl, '_system');
            closeDialog();
            return;
        }
        startDownload(apkUrl);
    };

    function startDownload(url) {
        const dlBtn     = document.getElementById('upd-dl-btn');
        const laterBtn  = document.getElementById('upd-later-btn');
        const progWrap  = document.getElementById('upd-prog-wrap');
        const progBar   = document.getElementById('upd-prog-bar');
        const pctLabel  = document.getElementById('upd-dl-pct');
        const sizeLabel = document.getElementById('upd-dl-size');
        const speedLabel= document.getElementById('upd-dl-speed');
        const dlLabel   = document.getElementById('upd-dl-label');

        // Disable buttons, show progress
        dlBtn.disabled   = true;
        laterBtn.disabled= true;
        dlBtn.style.opacity = '0.55';
        dlBtn.innerHTML  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Downloading…`;
        progWrap.style.display = 'block';

        const startTime = Date.now();
        let   prevLoaded = 0;
        let   speedSamples = [];

        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';

        xhr.onprogress = (e) => {
            if (!e.lengthComputable) { dlLabel.textContent = 'Downloading…'; return; }

            const pct   = Math.round((e.loaded / e.total) * 100);
            const bytes = e.loaded - prevLoaded;
            prevLoaded  = e.loaded;

            // Rolling average speed
            speedSamples.push(bytes / 1024);
            if (speedSamples.length > 8) speedSamples.shift();
            const avgKBs = speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length;

            progBar.style.width = pct + '%';
            pctLabel.textContent = pct + '%';
            dlLabel.textContent = 'Downloading update…';
            sizeLabel.textContent = `${(e.loaded / 1048576).toFixed(1)} MB of ${(e.total / 1048576).toFixed(1)} MB`;
            speedLabel.textContent = avgKBs > 1024
                ? (avgKBs / 1024).toFixed(1) + ' MB/s'
                : Math.round(avgKBs) + ' KB/s';
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                progBar.style.width = '100%';
                pctLabel.textContent = '100%';
                dlLabel.textContent  = 'Complete! Starting install…';
                triggerHaptic(50);
                setTimeout(() => installApkBlob(xhr.response, url, closeDialog), 600);
            } else {
                dlLabel.textContent = `Error ${xhr.status} — opening browser…`;
                setTimeout(() => { window.open(releasePageUrl, '_system'); closeDialog(); }, 1500);
            }
        };

        xhr.onerror = () => {
            dlLabel.textContent = 'Connection failed — opening browser…';
            setTimeout(() => { window.open(releasePageUrl, '_system'); closeDialog(); }, 1500);
        };

        xhr.send();
    }
}

// ── APK blob → install ───────────────────────────────────────────
function installApkBlob(blob, fallbackUrl, onDone) {
    if (window.cordova) {
        const fileName = 'au_smarthub_update.apk';
        const targetDir = (window.cordova.file && cordova.file.externalDataDirectory) ||
                          (window.cordova.file && cordova.file.dataDirectory);
        if (targetDir && window.resolveLocalFileSystemURL) {
            window.resolveLocalFileSystemURL(targetDir, (dir) => {
                dir.getFile(fileName, { create: true, exclusive: false }, (fileEntry) => {
                    fileEntry.createWriter((writer) => {
                        writer.onwriteend = () => {
                            const native = fileEntry.nativeURL;
                            if (window.cordova.plugins && cordova.plugins.fileOpener2) {
                                cordova.plugins.fileOpener2.open(native, 'application/vnd.android.package-archive', {
                                    error: () => window.open(fallbackUrl, '_system')
                                });
                            } else {
                                window.open(native, '_system');
                            }
                            if (onDone) onDone();
                        };
                        writer.onerror = () => { window.open(fallbackUrl, '_system'); if (onDone) onDone(); };
                        writer.write(blob);
                    });
                }, () => { window.open(fallbackUrl, '_system'); if (onDone) onDone(); });
            }, () => { window.open(fallbackUrl, '_system'); if (onDone) onDone(); });
            return;
        }
    }
    // Web / fallback: trigger browser download
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'au_smarthub_update.apk';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(blobUrl); a.remove(); }, 1000);
    if (onDone) onDone();
}

// ================= STANDARD CONFIRM DIALOG =================
function showConfirm(title, message, confirmText, onConfirm, iconType = 'delete') {
    triggerHaptic(15);
    let existing = document.getElementById('custom-confirm-modal');
    if (existing) existing.remove();

    let iconHtml = '';
    let iconBgColorClass = 'bg-red-500/10 text-red-500';
    let actionBtnColorClass = 'bg-red-500 hover:bg-red-600 shadow-red-500/25';

    if (iconType === 'exit') {
        iconHtml = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h3a2 2 0 0 1 2 2v1m-5 13h3a2 2 0 0 0 2-2v-1M4.425 19.428l6 1.8A2 2 0 0 0 13 19.312V4.688a2 2 0 0 0-2.575-1.916l-6 1.8A2 2 0 0 0 3 6.488v11.024a2 2 0 0 0 1.425 1.916zM9.001 12H9m7 0h5m0 0-2-2m2 2-2 2"></path></svg>`;
    } else {
        iconHtml = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
    }

    let backdrop = document.createElement('div');
    backdrop.id = 'custom-confirm-modal';
    backdrop.className = 'sheet-backdrop';

    backdrop.innerHTML = `
        <div class="sheet-panel text-center">
            <div class="sheet-handle sm:hidden"></div>
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 mx-auto ${iconBgColorClass}">
                ${iconHtml}
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1.5">${escapeHtml(title)}</h3>
            <p class="text-slate-500 dark:text-slate-400 text-xs mb-6 max-w-xs mx-auto leading-relaxed">${escapeHtml(message)}</p>
            <div class="flex gap-3">
                <button type="button" id="confirm-cancel-btn" class="flex-1 py-3.5 rounded-2xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition text-sm cursor-pointer">Cancel</button>
                <button type="button" id="confirm-ok-btn" class="flex-1 py-3.5 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition text-sm cursor-pointer ${actionBtnColorClass}">${escapeHtml(confirmText)}</button>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);
    requestAnimationFrame(() => { backdrop.classList.add('active', 'show'); });

    const close = () => { backdrop.classList.remove('active', 'show'); setTimeout(() => backdrop.remove(), 220); };
    backdrop.onclick = (e) => { if (e.target === backdrop) close(); };
    document.getElementById('confirm-cancel-btn').onclick = close;
    document.getElementById('confirm-ok-btn').onclick = () => { close(); if (onConfirm) onConfirm(); };
}

// ================= INPUT MODAL =================
function showInputModal(title, placeholder, initialValue, confirmText, onConfirm, iconType = 'user') {
    triggerHaptic(10);
    let existing = document.getElementById('custom-input-modal');
    if (existing) existing.remove();

    let backdrop = document.createElement('div');
    backdrop.id = 'custom-input-modal';
    backdrop.className = 'sheet-backdrop';

    let safeInitial = initialValue ? escapeHtml(initialValue) : "";

    let iconSvg = '';
    if (iconType === 'book') {
        iconSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
    } else {
        iconSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    }

    backdrop.innerHTML = `
        <div class="sheet-panel">
            <div class="sheet-handle sm:hidden"></div>
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    ${iconSvg}
                </div>
                <div>
                    <h3 class="text-base font-bold text-slate-900 dark:text-white">${escapeHtml(title)}</h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">Please enter details below</p>
                </div>
            </div>

            <input type="text" id="modal-input-field" autocomplete="off"
                class="w-full p-3.5 rounded-2xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none mb-5 transition text-base font-semibold"
                placeholder="${placeholder}" value="${safeInitial}">

            <div class="flex gap-3">
                <button type="button" id="input-cancel-btn" class="flex-1 py-3.5 rounded-2xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition text-sm cursor-pointer">Cancel</button>
                <button type="button" id="input-ok-btn" class="flex-1 py-3.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 active:scale-95 transition text-sm cursor-pointer">${escapeHtml(confirmText)}</button>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);
    let inputField = document.getElementById('modal-input-field');

    requestAnimationFrame(() => {
        backdrop.classList.add('active', 'show');
        if (inputField) {
            inputField.focus();
            if (safeInitial) inputField.setSelectionRange(safeInitial.length, safeInitial.length);
        }
    });

    const close = () => { backdrop.classList.remove('active', 'show'); setTimeout(() => backdrop.remove(), 220); };
    backdrop.onclick = (e) => { if (e.target === backdrop) close(); };
    document.getElementById('input-cancel-btn').onclick = close;

    const submit = () => {
        let val = inputField.value.trim();
        if (val !== "") {
            close();
            if (onConfirm) onConfirm(val);
        } else {
            inputField.classList.add("border-red-500");
            inputField.focus();
            setTimeout(() => inputField.classList.remove("border-red-500"), 400);
        }
    };

    document.getElementById('input-ok-btn').onclick = submit;
    inputField.onkeydown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
        else if (e.key === 'Escape') close();
    };
}