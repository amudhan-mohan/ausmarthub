// ================= NOTES STATE =================
let notes = safeJSONParse("smarthub_notes", []);
let currentNoteIndex = null;
let notesViewMode = localStorage.getItem("smarthub_notes_view") || "card";

// NEW: Undo/Redo & Extras State
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

// View Toggle Function
function setNotesViewMode(mode) {
    notesViewMode = mode;
    localStorage.setItem("smarthub_notes_view", mode);
    render(); // Re-render the screen to show the new layout
}

function saveNotes() {
    localStorage.setItem("smarthub_notes", JSON.stringify(notes));
}

function renderNotesList() {
    // 1. Sort notes by latest 'updatedAt' time
    notes.sort((a, b) => b.updatedAt - a.updatedAt);
    saveNotes();

    let html = `
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M19,14.5 L19,5.5 C19,4.67157288 18.3284271,4 17.5,4 L6.5,4 C5.67157288,4 5,4.67157288 5,5.5 L5,18.5 C5,19.3284271 5.67157288,20 6.5,20 L13.5,20 C14.3284271,20 15,19.3284271 15,18.5 C15,17.1192881 16.1192881,16 17.5,16 C18.3284271,16 19,15.3284271 19,14.5 L19,14.5 Z M18.5014408,16.7913481 C18.1948298,16.9255432 17.8561101,17 17.5,17 C16.6715729,17 16,17.6715729 16,18.5 C16,18.8561101 15.9255432,19.1948298 15.7913481,19.5014408 C16.9873685,18.9526013 17.9526013,17.9873685 18.5014408,16.7913481 L18.5014408,16.7913481 Z M4,5.5 C4,4.11928813 5.11928813,3 6.5,3 L17.5,3 C18.8807119,3 20,4.11928813 20,5.5 L20,14.5 C20,18.0898509 17.0898509,21 13.5,21 L6.5,21 C5.11928813,21 4,19.8807119 4,18.5 L4,5.5 Z M8.5,9 C8.22385763,9 8,8.77614237 8,8.5 C8,8.22385763 8.22385763,8 8.5,8 L15.5,8 C15.7761424,8 16,8.22385763 16,8.5 C16,8.77614237 15.7761424,9 15.5,9 L8.5,9 Z M8.5,12 C8.22385763,12 8,11.7761424 8,11.5 C8,11.2238576 8.22385763,11 8.5,11 L15.5,11 C15.7761424,11 16,11.2238576 16,11.5 C16,11.7761424 15.7761424,12 15.5,12 L8.5,12 Z M8.5,15 C8.22385763,15 8,14.7761424 8,14.5 C8,14.2238576 8.22385763,14 8.5,14 L13.5,14 C13.7761424,14 14,14.2238576 14,14.5 C14,14.7761424 13.7761424,15 13.5,15 L8.5,15 Z"/>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">My Notes</h1>
            </div>
            
            <!-- View Mode Toggles -->
            <div class="flex gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                <button onclick="setNotesViewMode('card')" class="p-1.5 rounded-md transition ${notesViewMode === 'card' ? 'bg-white dark:bg-gray-700 shadow-sm text-amber-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}" title="Card View">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </button>
                <button onclick="setNotesViewMode('list')" class="p-1.5 rounded-md transition ${notesViewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-amber-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}" title="List View">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </button>
            </div>
        </div>

        <button onclick="createNewNote()" class="btn mb-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:opacity-90 text-white border-none shadow-lg shadow-amber-500/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
            </svg>
            Create New Note
        </button>
    `;

    // 2. Render container based on the selected mode
    html += notesViewMode === 'card'
        ? `<div class="grid grid-cols-2 gap-3">`
        : `<div class="flex flex-col gap-3">`;

    if (notes.length === 0) {
        html += `
            <div class="${notesViewMode === 'card' ? 'col-span-2' : 'w-full'} card text-center py-10 text-gray-500 dark:text-gray-400 border-dashed border-2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="mx-auto mb-3 opacity-50">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <p class="font-medium text-gray-700 dark:text-gray-300">No notes yet</p>
                <p class="text-xs mt-1">Tap above to write your first note.</p>
            </div>
        `;
    } else {
        notes.forEach((note, idx) => {
            let createOpts = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            let createdDate = new Date(note.createdAt).toLocaleString(undefined, createOpts);
            let updatedDate = new Date(note.updatedAt).toLocaleString(undefined, createOpts);

            if (notesViewMode === 'card') {
                // CARD VIEW (Grid layout)
                html += `
                    <div onclick="openNote(${idx})" class="card flex flex-col cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition h-44 overflow-hidden relative group p-4 border border-amber-500/10 dark:border-amber-500/20">
                        <h3 class="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1 truncate">${escapeHtml(note.title) || "Untitled Note"}</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 flex-1 whitespace-pre-wrap">${escapeHtml(note.body) || "..."}</p>
                        
                        <div class="flex justify-between items-end mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <div class="flex flex-col gap-0.5">
                                <span class="text-[9px] text-gray-400 font-medium tracking-tight">Created: ${createdDate}</span>
                                <span class="text-[9px] text-amber-500/80 dark:text-amber-400/80 font-medium tracking-tight">Updated: ${updatedDate}</span>
                            </div>
                            
                            <button onclick="event.stopPropagation(); deleteNote(${idx})" class="text-red-400 hover:text-red-600 transition pb-0.5" title="Delete Note">
                                <svg width="20" height="20" viewBox="0 0 1024 1024" fill="currentColor" style="color: inherit !important;">
                                    <path d="M864 256H736v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zm-504-72h304v72H360v-72zm371.3 656H292.7l-24.2-512h487l-24.2 512z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            } else {
                // LIST VIEW (Vertical layout)
                html += `
                    <div onclick="openNote(${idx})" class="card flex flex-col cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition p-4 border border-amber-500/10 dark:border-amber-500/20">
                        <div class="flex justify-between items-start mb-1">
                            <h3 class="font-bold text-gray-800 dark:text-gray-100 text-sm truncate flex-1 pr-2">${escapeHtml(note.title) || "Untitled Note"}</h3>
                            <button onclick="event.stopPropagation(); deleteNote(${idx})" class="text-red-400 hover:text-red-600 transition p-1" title="Delete Note">
                                <svg width="20" height="20" viewBox="0 0 1024 1024" fill="currentColor" style="color: inherit !important;">
                                    <path d="M864 256H736v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zm-504-72h304v72H360v-72zm371.3 656H292.7l-24.2-512h487l-24.2 512z"/>
                                </svg>
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 whitespace-pre-wrap">${escapeHtml(note.body) || "..."}</p>
                        
                        <div class="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                            <span class="text-[10px] text-gray-400 font-medium tracking-tight">Created: ${createdDate}</span>
                            <span class="text-[10px] text-amber-500/80 dark:text-amber-400/80 font-medium tracking-tight">Updated: ${updatedDate}</span>
                        </div>
                    </div>
                `;
            }
        });
    }

    html += `</div>`;
    return html;
}

function renderNoteEditor() {
    let note = notes[currentNoteIndex];
    if (!note) return "";
    let stats = getNoteStats(note.body);

    // Initialize history on first load
    setTimeout(() => {
        noteHistory = [JSON.stringify({ title: note.title, body: note.body })];
        historyStep = 0;
        updateHistoryButtons();
    }, 50);

    return `
        <div class="flex flex-col h-[calc(100vh-140px)]">
            <div class="flex items-center justify-between mb-4">
                <div class="text-[10px] text-gray-400 tracking-wider uppercase font-bold">
                    ${note.title ? 'Editing Note' : 'New Note'}
                </div>
                
                <!-- Editor Toolbar (Undo, Redo, Copy) -->
                <div class="flex gap-2 items-center">
                    <button id="btn-undo" onclick="handleUndo()" class="p-1.5 text-gray-400 hover:text-amber-500 disabled:opacity-30 transition" title="Undo">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path></svg>
                    </button>
                    <button id="btn-redo" onclick="handleRedo()" class="p-1.5 text-gray-400 hover:text-amber-500 disabled:opacity-30 transition" title="Redo">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"></path></svg>
                    </button>
                    <div class="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                    <button onclick="copyCurrentNote()" class="p-1.5 text-gray-400 hover:text-blue-500 transition" title="Copy Note">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>
                    </button>
                </div>
            </div>

            <div id="note-editor-card" class="flex flex-col flex-1 bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800/50 p-5">
                
                <input type="text" id="note-title" placeholder="Note Title" value="${escapeHtml(note.title)}" 
                    oninput="autoSaveNote(true)"
                    class="w-full text-xl font-bold bg-transparent text-gray-900 dark:text-white border-none outline-none placeholder-gray-300 dark:placeholder-gray-700 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                
                <textarea id="note-body" placeholder="Start typing your note here..." 
                    oninput="autoSaveNote(true)"
                    class="w-full flex-1 resize-none bg-transparent text-gray-700 dark:text-gray-300 text-sm leading-relaxed border-none outline-none placeholder-gray-300 dark:placeholder-gray-700 custom-scrollbar">${escapeHtml(note.body)}</textarea>
                
                <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <!-- NEW: Live Stats Display -->
                    <div class="flex flex-col gap-0.5">
                        <span id="note-stats" class="text-[10px] font-bold text-gray-500 dark:text-gray-400">${stats.words} words • ${stats.chars} chars</span>
                        <span id="note-save-status" class="text-[9px] text-gray-400">All changes saved</span>
                    </div>
                    
                    <button id="note-done-btn" onclick="navigate('notes')" class="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-4 py-1.5 rounded-full font-bold">
                        Done
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Note Action Functions
function createNewNote() {
    let newNote = {
        title: "",
        body: "",
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    notes.unshift(newNote); // Add to beginning of array
    currentNoteIndex = 0;
    saveNotes();
    navigate("note-editor");
}

function openNote(index) {
    currentNoteIndex = index;
    navigate("note-editor");
}

let autoSaveTimeout;
function autoSaveNote(recordHistory = true) {
    let statusEl = document.getElementById('note-save-status');
    let bodyEl = document.getElementById('note-body');
    
    if (statusEl) statusEl.innerText = "Saving...";
    if (bodyEl) updateNoteStats(bodyEl.value); // Update stats live while typing

    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        let titleEl = document.getElementById('note-title');

        if (titleEl && bodyEl && notes[currentNoteIndex]) {
            notes[currentNoteIndex].title = titleEl.value;
            notes[currentNoteIndex].body = bodyEl.value;
            notes[currentNoteIndex].updatedAt = Date.now();
            saveNotes();
            
            if (recordHistory) pushHistoryState(); // Save to undo stack
            if (statusEl) statusEl.innerText = "Saved just now";
        }
    }, 500);
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
            setTimeout(() => { statusEl.innerText = "All changes saved"; }, 2000);
        }
    });
}

function pushHistoryState() {
    if (isUndoing) return; // Prevent overwriting history while actively undoing
    
    let title = document.getElementById('note-title').value;
    let body = document.getElementById('note-body').value;
    let stateStr = JSON.stringify({ title, body });

    // Ignore if identical to current state
    if (historyStep >= 0 && noteHistory[historyStep] === stateStr) return;

    // Truncate future history if user branches off after an Undo
    if (historyStep < noteHistory.length - 1) {
        noteHistory = noteHistory.slice(0, historyStep + 1);
    }

    noteHistory.push(stateStr);
    
    // Keep memory lean (stores last 30 actions)
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
    
    // Trigger save but skip creating a new history entry
    autoSaveNote(false); 
    updateNoteStats(state.body);
    updateHistoryButtons();
    
    // Re-enable history tracking after a brief delay
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
            render(); // Re-render the notes list
        }
    );
}