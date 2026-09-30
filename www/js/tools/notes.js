// ================= NOTES STATE =================
let notes = safeJSONParse("smarthub_notes", []);
let currentNoteIndex = null;
let notesViewMode = localStorage.getItem("smarthub_notes_view") || "card";
let notesSearchQuery = "";

// Undo/Redo & Extras State
let noteHistory = [];
let historyStep = -1;
let isUndoing = false;

// Helper: Calculate Words & Characters
function getNoteStats(text) {
    if (!text) return { words: 0, chars: 0 };
    const chars = text.length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    return { words, chars };
}

// Helper: Update Live Stats
function updateNoteStats(text) {
    let statsEl = document.getElementById('note-stats');
    if (statsEl) {
        let stats = getNoteStats(text);
        statsEl.innerText = `${stats.words} words • ${stats.chars} chars`;
    }
}

function setNotesViewMode(mode) {
    notesViewMode = mode;
    localStorage.setItem("smarthub_notes_view", mode);
    render();
}

function cleanEmptyNotes() {
    notes = notes.filter(n => (n.title && n.title.trim().length > 0) || (n.body && n.body.trim().length > 0));
    saveNotes();
}

function saveNotes() {
    localStorage.setItem("smarthub_notes", JSON.stringify(notes));
}

function filterNotes(query) {
    notesSearchQuery = (query || "").toLowerCase();
    const container = document.getElementById('notes-grid-container');
    if (container) {
        container.innerHTML = renderNotesGridItems();
    }
}

function renderNotesGridItems() {
    let filtered = notes.filter(n => {
        if (!notesSearchQuery) return true;
        return (n.title && n.title.toLowerCase().includes(notesSearchQuery)) ||
            (n.body && n.body.toLowerCase().includes(notesSearchQuery));
    });

    if (filtered.length === 0) {
        return `
            <div class="${notesViewMode === 'card' ? 'col-span-2' : 'w-full'} card text-center py-10 text-slate-400 dark:text-slate-500 border-dashed border-2">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-2 opacity-40">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <p class="font-bold text-sm text-slate-700 dark:text-slate-300">${notesSearchQuery ? 'No matching notes found' : 'No notes yet'}</p>
                <p class="text-xs mt-1">${notesSearchQuery ? 'Try a different search keyword' : 'Tap above to create your first note'}</p>
            </div>
        `;
    }

    let createOpts = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    let html = "";

    filtered.forEach((note) => {
        let realIndex = notes.indexOf(note);
        let createdDate = new Date(note.createdAt || note.updatedAt || Date.now()).toLocaleDateString(undefined, createOpts);
        let updatedDate = new Date(note.updatedAt || Date.now()).toLocaleDateString(undefined, createOpts);
        let stats = getNoteStats(note.body);

        if (notesViewMode === 'card') {
            html += `
                <div onclick="openNote(${realIndex})" class="card flex flex-col cursor-pointer active:scale-[0.98] transition h-44 overflow-hidden relative group p-3.5">
                    <div class="flex justify-between items-start gap-1 mb-1">
                        <h3 class="font-extrabold text-slate-900 dark:text-white text-sm truncate flex-1">${escapeHtml(note.title) || "Untitled Note"}</h3>
                        <button onclick="event.stopPropagation(); deleteNote(${realIndex})" class="text-red-500 hover:text-red-600 p-1 -mr-1 -mt-1 transition" title="Delete">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                        </button>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 flex-1 whitespace-pre-wrap leading-relaxed">${escapeHtml(note.body) || "..."}</p>
                    
                    <div class="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400">
                        <span>Created: ${createdDate}</span>
                        <span class="text-amber-500 font-semibold">Updated: ${updatedDate}</span>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div onclick="openNote(${realIndex})" class="card flex flex-col cursor-pointer active:scale-[0.99] transition p-4">
                    <div class="flex justify-between items-start mb-1.5">
                        <h3 class="font-extrabold text-slate-900 dark:text-white text-base truncate flex-1 pr-2">${escapeHtml(note.title) || "Untitled Note"}</h3>
                        <button onclick="event.stopPropagation(); deleteNote(${realIndex})" class="text-red-500 hover:text-red-600 p-1 -mr-1 -mt-1 transition" title="Delete">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                        </button>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">${escapeHtml(note.body) || "..."}</p>
                    
                    <div class="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-white/5 text-[11px] font-medium">
                        <span class="text-slate-500 dark:text-slate-400">Created: ${createdDate}</span>
                        <span class="text-amber-500 font-semibold">Updated: ${updatedDate}</span>
                    </div>
                </div>
            `;
        }
    });

    return html;
}

function renderNotesList() {
    cleanEmptyNotes();
    notes.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    saveNotes();

    return `
        <!-- Notes App Bar -->
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-slate-800 dark:text-white">
                    <path d="M19,14.5 L19,5.5 C19,4.67157288 18.3284271,4 17.5,4 L6.5,4 C5.67157288,4 5,4.67157288 5,5.5 L5,18.5 C5,19.3284271 5.67157288,20 6.5,20 L13.5,20 C14.3284271,20 15,19.3284271 15,18.5 C15,17.1192881 16.1192881,16 17.5,16 C18.3284271,16 19,15.3284271 19,14.5 L19,14.5 Z M18.5014408,16.7913481 C18.1948298,16.9255432 17.8561101,17 17.5,17 C16.6715729,17 16,17.6715729 16,18.5 C16,18.8561101 15.9255432,19.1948298 15.7913481,19.5014408 C16.9873685,18.9526013 17.9526013,17.9873685 18.5014408,16.7913481 L18.5014408,16.7913481 Z M4,5.5 C4,4.11928813 5.11928813,3 6.5,3 L17.5,3 C18.8807119,3 20,4.11928813 20,5.5 L20,14.5 C20,18.0898509 17.0898509,21 13.5,21 L6.5,21 C5.11928813,21 4,19.8807119 4,18.5 L4,5.5 Z M8.5,9 C8.22385763,9 8,8.77614237 8,8.5 C8,8.22385763 8.22385763,8 8.5,8 L15.5,8 C15.7761424,8 16,8.22385763 16,8.5 C16,8.77614237 15.7761424,9 15.5,9 L8.5,9 Z M8.5,12 C8.22385763,12 8,11.7761424 8,11.5 C8,11.2238576 8.22385763,11 8.5,11 L15.5,11 C15.7761424,11 16,11.2238576 16,11.5 C16,11.7761424 15.7761424,12 15.5,12 L8.5,12 Z M8.5,15 C8.22385763,15 8,14.7761424 8,14.5 C8,14.2238576 8.22385763,14 8.5,14 L13.5,14 C13.7761424,14 14,14.2238576 14,14.5 C14,14.7761424 13.7761424,15 13.5,15 L8.5,15 Z"/>
                </svg>
                <h1 class="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Notes</h1>
            </div>
            
            <!-- View Mode Toggles -->
            <div class="flex gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-sm">
                <button onclick="setNotesViewMode('card')" class="p-1.5 rounded-lg transition ${notesViewMode === 'card' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}" title="Grid View">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect></svg>
                </button>
                <button onclick="setNotesViewMode('list')" class="p-1.5 rounded-lg transition ${notesViewMode === 'list' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}" title="List View">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
                </button>
            </div>
        </div>

        <button onclick="createNewNote()" class="btn mb-4 w-full flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 5v14M5 12h14"/>
            </svg>
            Create New Note
        </button>

        <!-- Dynamic Grid Container -->
        <div id="notes-grid-container" class="${notesViewMode === 'card' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}">
            ${renderNotesGridItems()}
        </div>
    `;
}

function renderNoteEditor() {
    let note = (currentNoteIndex !== null && notes[currentNoteIndex]) ? notes[currentNoteIndex] : null;
    if (!note) {
        return `
            <div class="card text-center py-10">
                <h2 class="text-base font-bold text-slate-900 dark:text-white mb-2">No Note Selected</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Please select or create a note from your notes list.</p>
                <button onclick="navigate('notes')" class="btn mx-auto">
                    &larr; Back to My Notes
                </button>
            </div>
        `;
    }
    let stats = getNoteStats(note.body);

    setTimeout(() => {
        noteHistory = [JSON.stringify({ title: note.title, body: note.body })];
        historyStep = 0;
        updateHistoryButtons();
    }, 50);

    return `
        <div class="flex flex-col h-[calc(100vh-125px)]">
            <!-- Top Editor Navigation -->
            <div class="flex items-center justify-between mb-3 px-1">
                <div class="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                    Notes
                </div>
                
                <!-- Editor Toolbar -->
                <div class="flex gap-1 items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-white/5">
                    <button id="btn-undo" onclick="handleUndo()" class="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-500 disabled:opacity-30 rounded-lg transition" title="Undo">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path></svg>
                    </button>
                    <button id="btn-redo" onclick="handleRedo()" class="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-500 disabled:opacity-30 rounded-lg transition" title="Redo">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"></path></svg>
                    </button>
                    <div class="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5"></div>
                    <button onclick="copyCurrentNote()" class="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-500 rounded-lg transition" title="Copy Note">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>
                    </button>
                </div>
            </div>

            <!-- Editor Card Surface -->
            <div id="note-editor-card" class="flex flex-col flex-1 card p-4">
                
                <input type="text" id="note-title" placeholder="Title" value="${escapeHtml(note.title)}" 
                    oninput="autoSaveNote(true)"
                    class="w-full text-lg font-bold bg-transparent text-slate-900 dark:text-white border-none outline-none placeholder-slate-400 dark:placeholder-slate-600 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
                
                <textarea id="note-body" placeholder="Start typing your note here..." 
                    oninput="autoSaveNote(true)"
                    class="w-full flex-1 resize-none bg-transparent text-slate-700 dark:text-slate-200 text-sm leading-relaxed border-none outline-none placeholder-slate-400 dark:placeholder-slate-600 custom-scrollbar">${escapeHtml(note.body)}</textarea>
                
                <div class="flex justify-between items-center mt-2 pt-2.5 border-t border-slate-100 dark:border-white/5">
                    <div class="flex flex-col">
                        <span id="note-stats" class="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">${stats.words} words • ${stats.chars} chars</span>
                        <span id="note-save-status" class="text-[9px] text-emerald-500 font-medium">All changes saved</span>
                    </div>
                    
                    <button id="note-done-btn" onclick="exitNoteEditor()" class="text-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 px-4 py-1.5 rounded-full font-bold active:scale-95 transition">
                        Done
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createNewNote() {
    let newNote = {
        title: "",
        body: "",
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    notes.unshift(newNote);
    currentNoteIndex = 0;
    saveNotes();
    navigate("note-editor");
}

function openNote(index) {
    currentNoteIndex = index;
    navigate("note-editor");
}

function exitNoteEditor() {
    cleanEmptyNotes();
    goBack();
}

let autoSaveTimeout;
function autoSaveNote(recordHistory = true) {
    let statusEl = document.getElementById('note-save-status');
    let bodyEl = document.getElementById('note-body');

    if (statusEl) {
        statusEl.innerText = "Saving...";
        statusEl.className = "text-[9px] text-amber-500 font-medium";
    }
    if (bodyEl) updateNoteStats(bodyEl.value);

    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        let titleEl = document.getElementById('note-title');

        if (titleEl && bodyEl && notes[currentNoteIndex]) {
            notes[currentNoteIndex].title = titleEl.value;
            notes[currentNoteIndex].body = bodyEl.value;
            notes[currentNoteIndex].updatedAt = Date.now();
            saveNotes();

            if (recordHistory) pushHistoryState();
            if (statusEl) {
                statusEl.innerText = "All changes saved";
                statusEl.className = "text-[9px] text-emerald-500 font-medium";
            }
        }
    }, 400);
}

// ================= FEATURES (Undo, Redo, Copy) =================
function copyCurrentNote() {
    let title = document.getElementById('note-title').value;
    let body = document.getElementById('note-body').value;
    let fullText = title ? `${title}\n\n${body}` : body;

    navigator.clipboard.writeText(fullText).then(() => {
        let statusEl = document.getElementById('note-save-status');
        if (statusEl) {
            statusEl.innerText = "Copied to clipboard!";
            statusEl.className = "text-[9px] text-blue-500 font-medium";
            setTimeout(() => {
                statusEl.innerText = "All changes saved";
                statusEl.className = "text-[9px] text-emerald-500 font-medium";
            }, 2000);
        }
        triggerHaptic(15);
    });
}

function pushHistoryState() {
    if (isUndoing) return;

    let title = document.getElementById('note-title').value;
    let body = document.getElementById('note-body').value;
    let stateStr = JSON.stringify({ title, body });

    if (historyStep >= 0 && noteHistory[historyStep] === stateStr) return;

    if (historyStep < noteHistory.length - 1) {
        noteHistory = noteHistory.slice(0, historyStep + 1);
    }

    noteHistory.push(stateStr);

    if (noteHistory.length > 30) noteHistory.shift();
    else historyStep++;

    updateHistoryButtons();
}

function updateHistoryButtons() {
    let undoBtn = document.getElementById('btn-undo');
    let redoBtn = document.getElementById('btn-redo');
    if (undoBtn) undoBtn.disabled = historyStep <= 0;
    if (redoBtn) redoBtn.disabled = historyStep >= noteHistory.length - 1;
}

function handleUndo() {
    if (historyStep > 0) {
        historyStep--;
        restoreState(noteHistory[historyStep]);
    }
}

function handleRedo() {
    if (historyStep < noteHistory.length - 1) {
        historyStep++;
        restoreState(noteHistory[historyStep]);
    }
}

function restoreState(stateStr) {
    isUndoing = true;
    let state = JSON.parse(stateStr);

    let titleEl = document.getElementById('note-title');
    let bodyEl = document.getElementById('note-body');

    if (titleEl) titleEl.value = state.title;
    if (bodyEl) bodyEl.value = state.body;

    autoSaveNote(false);
    updateNoteStats(state.body);
    updateHistoryButtons();

    setTimeout(() => isUndoing = false, 50);
}

function deleteNote(index) {
    showConfirm(
        "Delete Note?",
        "Are you sure you want to permanently delete this note?",
        "Delete Note",
        () => {
            notes.splice(index, 1);
            saveNotes();
            render();
        }
    );
}