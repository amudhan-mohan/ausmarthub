// ================= CGPA & PROFILE STATE =================
let existingSemesters = safeJSONParse("semesters", null);
let defaultProfiles = existingSemesters && existingSemesters.length > 0
    ? [{ id: Date.now().toString(), name: "My Profile", semesters: existingSemesters }]
    : [];

let profiles = safeJSONParse("cgpa_profiles", defaultProfiles);

let currentProfileIndex = null; // Stays null until a profile is selected
let semesters = [];
let currentSemester = 0;

// ================= STORAGE =================
function save() {
    if (currentProfileIndex !== null && profiles[currentProfileIndex]) {
        // Sync active semesters back into the selected profile
        profiles[currentProfileIndex].semesters = semesters;
    }
    // Save the entire profiles array
    localStorage.setItem("cgpa_profiles", JSON.stringify(profiles));
}

// ================= PROFILES DASHBOARD =================
function renderProfiles() {
    let html = `
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" class="text-blue-600 dark:text-blue-400">
                    <path d="M31,26c-0.6,0-1-0.4-1-1V12c0-0.6,0.4-1,1-1s1,0.4,1,1v13C32,25.6,31.6,26,31,26z"/>
                    <g><path d="M16,21c-0.2,0-0.3,0-0.5-0.1l-15-8C0.2,12.7,0,12.4,0,12s0.2-0.7,0.5-0.9l15-8c0.3-0.2,0.6-0.2,0.9,0l15,8 c0.3,0.2,0.5,0.5,0.5,0.9s-0.2,0.7-0.5,0.9l-15,8C16.3,21,16.2,21,16,21z"/></g>
                    <path d="M17.4,22.6C17,22.9,16.5,23,16,23s-1-0.1-1.4-0.4L6,18.1V22c0,3.1,4.9,6,10,6s10-2.9,10-6v-3.9L17.4,22.6z"/>
                </svg>
                <h1 class="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Student Profiles</h1>
            </div>
            <div class="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold">
                ${profiles.length} ${profiles.length === 1 ? 'Profile' : 'Profiles'}
            </div>
        </div>
        
        <div class="space-y-3">
    `;

    if (profiles.length === 0) {
        html += `
            <div class="card text-center py-12 text-slate-500 dark:text-slate-400 border-dashed border-2">
                <div class="w-14 h-14 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <h3 class="font-bold text-slate-800 dark:text-slate-200 text-base">No Profiles Yet</h3>
                <p class="text-xs mt-1 mb-5 max-w-xs mx-auto">Create a student profile to begin tracking semester GPA, calculating CGPA, and visualizing academic trends.</p>
                <button onclick="createProfile()" class="btn mx-auto flex items-center justify-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    CREATE NEW PROFILE
                </button>
            </div>
        `;
    } else {
        profiles.forEach((p, idx) => {
            let cgpaDisplay = calculateProfileCGPA(p.semesters);
            let initial = p.name ? p.name.charAt(0).toUpperCase() : "S";

            html += `
                <div class="card card-interactive p-4 flex justify-between items-center" onclick="openProfile(${idx})">
                    <div class="flex items-center gap-3.5 min-w-0">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#103654] via-[#1F618D] to-[#51A5D4] flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow-md border border-white/20">
                            ${initial}
                        </div>
                        <div class="min-w-0">
                            <h3 class="font-extrabold text-slate-900 dark:text-white text-base truncate">${escapeHtml(p.name)}</h3>
                            <div class="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                <span>Overall CGPA: <strong class="${cgpaDisplay === 'RA' ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'} font-mono">${cgpaDisplay}</strong></span>
                                <span>&bull;</span>
                                <span>${p.semesters.length} ${p.semesters.length === 1 ? 'Semester' : 'Semesters'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-1 shrink-0">
                        <button onclick="event.stopPropagation(); editProfile(${idx})" class="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 rounded-xl transition active:scale-90" title="Edit Profile Name">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        
                        <button onclick="event.stopPropagation(); deleteProfile(${idx})" class="p-2 text-red-500 hover:text-red-600 rounded-xl transition active:scale-90" title="Delete Profile">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
            <button onclick="createProfile()" class="btn mt-4 w-full flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
                CREATE NEW PROFILE
            </button>
        `;
    }

    html += `</div>`;
    return html;
}

// Profile Helper Functions
function calculateProfileCGPA(semestersArray) {
    if (!semestersArray || !Array.isArray(semestersArray) || semestersArray.length === 0) return "-";
    let totalCredits = 0;
    let totalPoints = 0;
    let hasRA = false;

    semestersArray.forEach(sem => {
        if (sem && sem.subjects && Array.isArray(sem.subjects)) {
            sem.subjects.forEach(s => {
                let credit = Number(s.credit) || 0;
                let gp = getGP(s.grade);
                if (s.grade === "RA") hasRA = true;
                totalCredits += credit;
                totalPoints += credit * gp;
            });
        }
    });

    if (totalCredits === 0) return "-";
    if (hasRA) return "RA";
    return (totalPoints / totalCredits).toFixed(2);
}

function openProfile(idx) {
    if (idx < 0 || idx >= profiles.length) return;
    currentProfileIndex = idx;
    semesters = (profiles[idx] && Array.isArray(profiles[idx].semesters)) ? profiles[idx].semesters : [];
    navigate('cgpa');
}

function createProfile() {
    showInputModal(
        "New Student Profile",
        "e.g. Mohan",
        "",
        "Create Profile",
        (name) => {
            profiles.push({
                id: Date.now().toString(),
                name: name,
                semesters: []
            });
            save();
            render();
            showToast(`Profile "${name}" created`);
        }
    );
}

function editProfile(idx) {
    let currentName = profiles[idx].name;

    showInputModal(
        "Edit Profile Name",
        "Enter student's name",
        currentName,
        "Save Changes",
        (newName) => {
            if (newName !== currentName) {
                profiles[idx].name = newName;
                save();
                render();
                showToast("Profile name updated");
            }
        }
    );
}

function deleteProfile(idx) {
    showConfirm(
        "Delete Profile?",
        `Are you sure you want to delete ${profiles[idx].name}'s profile? All semester data will be lost permanently.`,
        "Delete",
        () => {
            let name = profiles[idx].name;
            profiles.splice(idx, 1);
            save();
            render();
            showToast(`Deleted ${name}'s profile`);
        }
    );
}

// ================= CGPA DASHBOARD =================
function renderCGPA() {
    if (currentProfileIndex === null || !profiles[currentProfileIndex]) {
        if (profiles.length > 0) {
            currentProfileIndex = 0;
            semesters = (profiles[0] && Array.isArray(profiles[0].semesters)) ? profiles[0].semesters : [];
        } else {
            return `
                <div class="card text-center py-10">
                    <h2 class="text-base font-bold text-slate-900 dark:text-white mb-2">No Profiles Found</h2>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Please create a student profile to start tracking CGPA.</p>
                    <button onclick="navigate('profiles')" class="btn mx-auto">
                        &larr; Go to Student Profiles
                    </button>
                </div>
            `;
        }
    }

    let activeSemesters = (semesters && Array.isArray(semesters)) ? semesters : [];
    let totalCredits = 0;
    let totalPoints = 0;
    let hasRA = false;
    let lastSemGPA = "-";

    activeSemesters.forEach((sem, index) => {
        let semCredits = 0;
        let semPoints = 0;
        let semRA = false;

        (sem.subjects || []).forEach(s => {
            let credit = Number(s.credit) || 0;
            let gp = getGP(s.grade);

            if (s.grade === "RA") {
                hasRA = true;
                semRA = true;
            }

            totalCredits += credit;
            totalPoints += credit * gp;

            semCredits += credit;
            semPoints += credit * gp;
        });

        if (index === activeSemesters.length - 1) {
            if (semRA) {
                lastSemGPA = "RA";
            } else if (semCredits === 0 || !sem.subjects || sem.subjects.length === 0) {
                lastSemGPA = "-";
            } else {
                lastSemGPA = (semPoints / semCredits).toFixed(2);
            }
        }
    });

    let cgpa = "-";
    if (hasRA) {
        cgpa = "RA";
    } else if (totalCredits > 0) {
        cgpa = (totalPoints / totalCredits).toFixed(2);
    } else {
        cgpa = "-";
    }

    let classification = "-";
    if (cgpa !== "RA" && cgpa !== "-") {
        let c = Number(cgpa);
        if (c >= 8.25) classification = "First Class with Distinction";
        else if (c >= 6.5) classification = "First Class";
        else if (c >= 5) classification = "Second Class";
        else classification = "Pass";
    }

    let percentage = "-";
    if (cgpa !== "RA" && cgpa !== "-") {
        let calcPerc = (Number(cgpa) - 0.25) * 10;
        percentage = calcPerc > 0 ? calcPerc.toFixed(2) + "%" : "0.00%";
    }

    let currentProfileName = profiles[currentProfileIndex] ? profiles[currentProfileIndex].name : "Student";

    return `
        <!-- Profile Banner -->
        <div class="banner-card mb-4">
            <div class="flex items-center justify-between">
                <div>
                    <span class="text-[11px] font-bold text-blue-100 uppercase tracking-wider block">Academic Report</span>
                    <h2 class="text-xl font-extrabold text-white mt-0.5">${escapeHtml(currentProfileName)}</h2>
                </div>
                <div class="text-right">
                    <span class="text-[10px] text-blue-100 block">Overall CGPA</span>
                    <span class="text-2xl font-black font-mono text-white">${cgpa}</span>
                </div>
            </div>
        </div>

        <!-- Metric Grid -->
        <div class="grid grid-cols-2 gap-2.5 mb-4">
            <div class="stat-card">
                <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">Semesters</div>
                <div class="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">${semesters.length}</div>
            </div>
            <div class="stat-card">
                <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Credits</div>
                <div class="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">${totalCredits}</div>
            </div>
            <div class="stat-card">
                <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">Latest GPA</div>
                <div class="text-lg font-bold font-mono ${lastSemGPA === 'RA' ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'} mt-0.5">${lastSemGPA}</div>
            </div>
            <div class="stat-card">
                <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">Percentage</div>
                <div class="text-lg font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">${percentage}</div>
            </div>
            <div class="stat-card col-span-2 py-2.5 bg-green-50/60 dark:bg-green-950/20 border-green-200/70 dark:border-green-900/40">
                <div class="text-[11px] text-slate-500 dark:text-slate-400">Award Classification</div>
                <div class="text-sm font-bold text-green-700 dark:text-green-400 mt-0.5">${classification}</div>
            </div>
        </div>

        <!-- Semesters List -->
        <div class="my-4">
            <div class="flex items-center justify-between mb-2.5 px-1">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Semesters (${semesters.length})
                </h3>
                ${semesters.length > 0 ? `
                    <button onclick="createSemester()" class="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 active:scale-95 transition">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                        Add Semester
                    </button>
                ` : ''}
            </div>

            <div class="space-y-2.5">
                ${semesters.length > 0 ? `
                    ${semesters.map((s, i) => {
        let semCreds = 0, semPts = 0, semRA = false;
        (s.subjects || []).forEach(sub => {
            let c = Number(sub.credit) || 0;
            let gp = getGP(sub.grade);
            if (sub.grade === "RA") semRA = true;
            semCreds += c;
            semPts += c * gp;
        });
        let semGpa = (semRA || semCreds === 0) ? (s.subjects.length === 0 ? '-' : 'RA') : (semPts / semCreds).toFixed(2);

        return `
                            <div onclick="openSemester(${i})" class="card card-interactive p-3.5 flex justify-between items-center">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs font-mono">
                                        S${i + 1}
                                    </div>
                                    <div>
                                        <h4 class="text-sm font-bold text-slate-900 dark:text-white">Semester ${i + 1}</h4>
                                        <p class="text-[11px] text-slate-500 dark:text-slate-400">${s.subjects.length} ${s.subjects.length === 1 ? 'subject' : 'subjects'} &bull; ${semCreds} credits</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-sm font-extrabold font-mono ${semGpa === 'RA' ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}">
                                        ${semGpa === '-' ? 'No Data' : semGpa + ' GPA'}
                                    </span>
                                    <button onclick="event.stopPropagation(); deleteSemester(${i})" class="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition active:scale-90" title="Delete Semester">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        `;
    }).join("")}

                    <button onclick="createSemester()" class="btn flex items-center justify-center gap-2 w-full mt-3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        Add Another Semester
                    </button>
                ` : `
                    <div class="card text-center py-8 text-slate-500 dark:text-slate-400 border-dashed">
                        <p class="text-xs font-semibold">No semesters added yet.</p>
                        <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 mb-3">Add your first semester to begin calculating GPA & CGPA.</p>
                        <button onclick="createSemester()" class="btn mx-auto flex items-center justify-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                            Add Semester 1
                        </button>
                    </div>
                `}
            </div>
        </div>

        <!-- GPA Trend Chart -->
        ${semesters.length > 0 ? `
        <div class="card p-4 my-4">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18M18 17V9M12 17V5M6 17v-3"/></svg>
                    GPA Trend
                </h3>
            </div>
            <div class="relative w-full h-52">
                <canvas id="cgpaChart"></canvas>
            </div>
        </div>
        ` : ''}

        <!-- CGPA Formula Card -->
        <div class="card p-4 my-4 bg-slate-50 dark:bg-slate-900/60">
            <h3 class="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                CGPA Formula
            </h3>
            <div class="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs font-mono text-slate-800 dark:text-slate-200 font-semibold">
                CGPA = &Sigma; (Grade Point &times; Credit) / &Sigma; Credits
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
                Example: (10&times;4 + 9&times;3 + 8&times;3) / 10 = 9.1
            </p>
        </div>

        <!-- Manual Calculation Guide Section -->
        <div class="card p-4 my-4">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h4"/>
                    <path d="M18 4L20 6L18 8"/>
                    <path d="M6 4L4 6L6 8"/>
                </svg>
                Manual Calculation Guide
            </h3>
            
            <!-- Semester CGPA -->
            <div class="mb-3.5 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5">
                        <circle cx="12" cy="12" r="9"/>
                        <path d="M12 8v8M8 12h8"/>
                    </svg>
                    <span class="font-bold text-xs text-blue-700 dark:text-blue-300">Semester CGPA</span>
                </div>
                <div class="text-xs space-y-1.5">
                    <div class="flex justify-between items-center p-2 bg-white/70 dark:bg-white/5 rounded-xl">
                        <span class="text-slate-500 dark:text-slate-400">Formula:</span>
                        <span class="font-mono font-bold text-slate-800 dark:text-slate-200">Sum of Credit Points &divide; Sum of Credit Hours</span>
                    </div>
                    <div class="p-2 bg-white/70 dark:bg-white/5 rounded-xl space-y-0.5 text-slate-600 dark:text-slate-300">
                        <div>&bull; Credit Points = Grade &times; Credit Hours</div>
                        <div>&bull; Reappear if any subject has 0 credits</div>
                    </div>
                    <div class="p-2 bg-white/70 dark:bg-white/5 rounded-xl flex justify-between">
                        <span class="text-slate-500 dark:text-slate-400">Example:</span>
                        <span class="font-mono font-bold text-slate-800 dark:text-slate-200">4 hours &times; 5 grade = 20 Credit Points</span>
                    </div>
                </div>
            </div>
            
            <!-- Overall OGPA -->
            <div class="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9333ea" stroke-width="2.5">
                        <path d="M3 3v18h18M18 17V9M12 17V5M6 17v-3"/>
                        <path d="M3 3L21 21"/>
                    </svg>
                    <span class="font-bold text-xs text-purple-700 dark:text-purple-300">Overall OGPA</span>
                </div>
                <div class="text-xs space-y-1.5">
                    <div class="flex justify-between items-center p-2 bg-white/70 dark:bg-white/5 rounded-xl">
                        <span class="text-slate-500 dark:text-slate-400">Formula:</span>
                        <span class="font-mono font-bold text-slate-800 dark:text-slate-200">Sum of All CGPAs &divide; Total Number of Semesters</span>
                    </div>
                    <div class="p-2 bg-white/70 dark:bg-white/5 rounded-xl space-y-0.5 text-slate-600 dark:text-slate-300">
                        <div>&bull; Only completed semesters included</div>
                        <div>&bull; Reappear semesters are excluded</div>
                    </div>
                    <div class="p-2 bg-white/70 dark:bg-white/5 rounded-xl flex justify-between">
                        <span class="text-slate-500 dark:text-slate-400">Example:</span>
                        <span class="font-mono font-bold text-slate-800 dark:text-slate-200">OGPA = (8.5 + 7.8 + 9.2) &divide; 3 = 8.5</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Credit Hours Strategy Section -->
        <div class="card p-4 my-4">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                Credit Hours Strategy
            </h3>
            
            <!-- High Impact -->
            <div class="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span class="font-bold text-xs text-rose-700 dark:text-rose-300">High Impact (4 & 3 credits)</span>
                </div>
                <ul class="list-disc ml-5 text-slate-600 dark:text-slate-300 space-y-1 text-xs">
                    <li>Core theory subjects - Maximum weight on CGPA</li>
                    <li>Focus on getting S/A grades</li>
                    <li>1 point improvement = +0.25 CGPA boost</li>
                </ul>
            </div>
            
            <!-- Medium Impact -->
            <div class="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span class="font-bold text-xs text-amber-700 dark:text-amber-300">Medium Impact (2 & 1 credits)</span>
                </div>
                <ul class="list-disc ml-5 text-slate-600 dark:text-slate-300 space-y-1 text-xs">
                    <li>Electives & minor subjects - Moderate weight on CGPA</li>
                    <li>Maintain B+ grades or better</li>
                    <li>Good for consistency</li>
                </ul>
            </div>
            
            <!-- Lab Subjects -->
            <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5">
                        <path d="M20 12H4M12 4v16"/>
                        <rect x="2" y="2" width="20" height="20" rx="4"/>
                    </svg>
                    <span class="font-bold text-xs text-emerald-700 dark:text-emerald-300">Lab Subjects (1.5 credits)</span>
                </div>
                <ul class="list-disc ml-5 text-slate-600 dark:text-slate-300 space-y-1 text-xs">
                    <li>Practical/laboratory courses - Easier to score high grades</li>
                    <li>Perfect for boosting CGPA</li>
                    <li>Aim for S grades consistently</li>
                </ul>
            </div>
        </div>

        <!-- CGPA Growth Strategy -->
        <div class="card p-4 my-4">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                CGPA Growth Strategy
            </h3>
            <div class="space-y-2">
                <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl">
                    <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">Priority 1</span>
                    <span class="font-bold text-xs text-blue-600 dark:text-blue-400">4-credit subjects</span>
                </div>
                <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl">
                    <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">Priority 2</span>
                    <span class="font-bold text-xs text-blue-600 dark:text-blue-400">3-credit subjects</span>
                </div>
                <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl">
                    <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">Priority 3</span>
                    <span class="font-bold text-xs text-emerald-600 dark:text-emerald-400">1.5-credit labs</span>
                </div>
                <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl">
                    <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">Priority 4</span>
                    <span class="font-bold text-xs text-amber-600 dark:text-amber-400">1 & 2-credit subjects</span>
                </div>
            </div>
        </div>

        <!-- OGPA Growth Strategy -->
        <div class="card p-4 my-4">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                OGPA Growth Strategy
            </h3>
            <ul class="list-disc ml-5 text-slate-600 dark:text-slate-300 space-y-1.5 text-xs">
                <li>Consistency across all semesters</li>
                <li>Avoid reappears at all costs</li>
                <li>Early semesters set the base</li>
                <li>Later semesters can recover OGPA</li>
            </ul>
        </div>

        <!-- Quick Impact Calculation -->
        <div class="card p-4 my-4">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                Quick Impact Calculation
            </h3>
            <div class="space-y-2 text-xs">
                <div class="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl">
                    <span class="font-bold text-blue-600 dark:text-blue-400">4-credit subject B &rarr; A:</span>
                    <span class="text-slate-600 dark:text-slate-300 font-mono"> +9 points &times; 4 hours = +36 credit points</span>
                </div>
                <div class="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl">
                    <span class="font-bold text-blue-600 dark:text-blue-400">3-credit subject C &rarr; B:</span>
                    <span class="text-slate-600 dark:text-slate-300 font-mono"> +8 points &times; 3 hours = +24 credit points</span>
                </div>
                <div class="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl">
                    <span class="font-bold text-emerald-600 dark:text-emerald-400">Perfect lab (1.5 credits):</span>
                    <span class="text-slate-600 dark:text-slate-300 font-mono"> S grade = 15 credit points</span>
                </div>
            </div>
        </div>

        <!-- Your Action Plan -->
        <div class="card p-4 my-4">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Your Action Plan
            </h3>
            <ol class="list-decimal ml-5 text-slate-600 dark:text-slate-300 space-y-1.5 text-xs">
                <li>Focus on 4 & 3 credit subjects first</li>
                <li>Aim for S/A grades in labs (easy boost)</li>
                <li>Maintain consistency across all semesters</li>
                <li>Never get reappear (zeros destroy CGPA)</li>
            </ol>
        </div>

        <!-- How to Improve CGPA -->
        <div class="card p-4 my-4">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                How to Improve CGPA
            </h3>
            <ul class="list-disc ml-5 text-slate-600 dark:text-slate-300 space-y-1.5 text-xs">
                <li>Focus on high-credit subjects</li>
                <li>Avoid RA (arrear reduces CGPA heavily)</li>
                <li>Target minimum grade A (9 GP)</li>
                <li>Score S in core subjects</li>
                <li>Improve next semester GPA to boost overall CGPA</li>
            </ul>
        </div>
    `;
}

function createSemester() {
    triggerHaptic(10);
    semesters.push({ subjects: [] });
    save();
    render();
    showToast(`Semester ${semesters.length} created`);
}

function openSemester(index) {
    currentSemester = index;
    navigate("semester");
}

function deleteSemester(i) {
    showConfirm(
        `Delete Semester ${i + 1}?`,
        "Are you sure you want to delete this semester and all its subjects?",
        "Delete",
        () => {
            semesters.splice(i, 1);
            save();
            render();
            showToast(`Deleted Semester ${i + 1}`);
        }
    );
}

// ================= CHART RENDERING =================
function renderCGPAChart() {
    let labels = [];
    let data = [];

    semesters.forEach((sem, index) => {
        let totalCredits = 0;
        let totalPoints = 0;
        let hasRA = false;

        sem.subjects.forEach(s => {
            let credit = Number(s.credit) || 0;
            let gp = getGP(s.grade);
            if (s.grade === "RA") hasRA = true;
            totalCredits += credit;
            totalPoints += credit * gp;
        });

        let gpa = (hasRA || totalCredits === 0) ? null : (totalPoints / totalCredits);
        labels.push("Sem " + (index + 1));
        data.push(gpa !== null ? parseFloat(gpa.toFixed(2)) : null);
    });

    let ctx = document.getElementById("cgpaChart");
    if (!ctx) return;

    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    const chartTextColor = isDarkMode ? '#94a3b8' : '#64748b';
    const chartGridColor = isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Semester GPA',
                data: data,
                tension: 0.35,
                borderColor: '#2563eb',
                borderWidth: 2.5,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: isDarkMode ? '#111827' : '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDarkMode ? '#1e293b' : '#0f172a',
                    titleFont: { family: 'JetBrains Mono', size: 12 },
                    bodyFont: { family: 'JetBrains Mono', size: 12 },
                    padding: 10,
                    cornerRadius: 10
                }
            },
            scales: {
                x: {
                    grid: { color: chartGridColor },
                    ticks: { color: chartTextColor, font: { family: 'JetBrains Mono', size: 11 } }
                },
                y: {
                    min: 0,
                    max: 10,
                    grid: { color: chartGridColor },
                    ticks: { color: chartTextColor, font: { family: 'JetBrains Mono', size: 11 }, stepSize: 2 }
                }
            }
        }
    });
}

// ================= SEMESTER DETAILS =================
function renderSemester() {
    let sem = (semesters && semesters[currentSemester]) ? semesters[currentSemester] : { subjects: [] };
    let subjectsList = (sem && Array.isArray(sem.subjects)) ? sem.subjects : [];

    let totalCredits = 0;
    let totalPoints = 0;
    let hasRA = false;

    subjectsList.forEach(s => {
        let credit = Number(s.credit) || 0;
        let gp = getGP(s.grade);
        if (s.grade === "RA") hasRA = true;
        totalCredits += credit;
        totalPoints += credit * gp;
    });

    let gpa = hasRA ? 'RA' : (totalCredits === 0 ? '-' : (totalPoints / totalCredits).toFixed(2));

    return `
        <!-- Semester Overview Card -->
        <div class="banner-card mb-4">
            <div class="flex items-center justify-between">
                <div>
                    <span class="text-[11px] font-bold text-blue-100 uppercase tracking-wider block">Semester Configuration</span>
                    <h2 class="text-xl font-extrabold text-white mt-0.5">Semester ${currentSemester + 1}</h2>
                </div>
                <div class="text-right">
                    <span class="text-[10px] text-blue-100 block">Semester GPA</span>
                    <span class="text-2xl font-black font-mono text-white">${gpa}</span>
                </div>
            </div>
            
            <div class="flex gap-4 mt-3 pt-3 border-t border-white/15 text-xs text-blue-100">
                <span>Total Subjects: <strong>${sem.subjects.length}</strong></span>
                <span>&bull;</span>
                <span>Total Credits: <strong>${totalCredits}</strong></span>
            </div>
        </div>

        ${hasRA ? `
            <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>Reappear (RA) detected. Clear all arrears to compute semester GPA.</span>
            </div>
        ` : ''}

        <!-- Subjects List -->
        <div class="space-y-3 mb-4">
            ${sem.subjects.map((sub, i) => `
                <div class="card p-4 bg-white dark:bg-slate-900">
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-xs font-bold text-slate-400 font-mono">#${i + 1} SUBJECT</span>
                        <button onclick="deleteSubject(${i})" class="p-1 text-slate-400 hover:text-red-500 rounded-lg transition active:scale-90" title="Delete Subject">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>

                    <div class="space-y-3">
                        <div>
                            <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 ml-0.5">Subject Name</label>
                            <input class="input w-full" placeholder="e.g. Operating Systems" value="${escapeHtml(sub.name)}" onchange="updateSubject(${i}, 'name', this.value)">
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 ml-0.5">Credits</label>
                                <input type="number" step="any" class="input w-full font-mono font-bold" min="0" max="20" placeholder="e.g. 4" value="${sub.credit}" onchange="updateSubject(${i}, 'credit', this.value)">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 ml-0.5">Grade</label>
                                <select class="input w-full font-mono font-bold" onchange="updateSubject(${i}, 'grade', this.value)">
                                    ${["S", "A", "B", "C", "D", "E", "RA"].map(g => `<option ${g === sub.grade ? 'selected' : ''} class="${g === 'RA' ? 'text-red-500 font-bold' : ''}">${g}</option>`).join("")}
                                </select>
                            </div>
                        </div>

                        ${sub.name ? `
                            <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
                                ${getGradeImpact(sub.credit, sub.grade)}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join("")}

            ${sem.subjects.length === 0 ? `
                <div class="card text-center py-10 text-slate-500 dark:text-slate-400 border-dashed">
                    <p class="text-xs">No subjects added yet.</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">Tap below to add your first subject.</p>
                </div>
            ` : ''}
        </div>

        <button onclick="addSubject()" class="btn w-full flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Add Subject
        </button>
    `;
}

function getGradeImpact(credits, grade) {
    const points = getGP(grade);
    const totalPoints = (Number(credits) || 0) * points;

    if (grade === "RA") {
        return `
            <div class="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-semibold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>Reappear &bull; 0 Credit Points (Reduces CGPA)</span>
            </div>
        `;
    }
    return `
        <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Grade Points: <strong class="font-mono text-slate-900 dark:text-white">${points} GP</strong></span>
            <span>Total Points: <strong class="font-mono text-blue-600 dark:text-blue-400">+${totalPoints} Pts</strong></span>
        </div>
    `;
}

function addSubject() {
    triggerHaptic(10);
    semesters[currentSemester].subjects.push({
        name: "",
        credit: 4,
        grade: "S"
    });
    save();
    render();
}

function updateSubject(i, key, val) {
    if (val === "") {
        semesters[currentSemester].subjects[i][key] = "";
    } else {
        if (key === "credit") {
            val = Number(val);
            if (isNaN(val) || val < 0) return;
        }
        semesters[currentSemester].subjects[i][key] = val;
    }
    save();
    smartRender();
}

let renderTimer;
function smartRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => {
        let activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT')) {
            activeEl.addEventListener('blur', function onBlur() {
                activeEl.removeEventListener('blur', onBlur);
                setTimeout(render, 100);
            }, { once: true });
            return;
        }
        render();
    }, 200);
}

function deleteSubject(i) {
    triggerHaptic(10);
    semesters[currentSemester].subjects.splice(i, 1);
    save();
    render();
}

// ================= TARGET CGPA CALCULATOR =================
function renderTargetCGPA() {
    let currentSems = semesters ? semesters.length : 0;
    let currentCgpaVal = calculateProfileCGPA(semesters);
    if (currentCgpaVal === "-" || currentCgpaVal === "RA") currentCgpaVal = "";

    return `
        <div class="card p-5 mb-4 bg-gradient-to-br from-purple-50/60 to-white dark:from-purple-950/20 dark:to-slate-900 border-purple-200/80 dark:border-purple-900/40">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                </div>
                <div>
                    <h2 class="text-base font-extrabold text-slate-900 dark:text-white">Goal Setter</h2>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Calculate required GPA for future semesters</p>
                </div>
            </div>

            <div class="space-y-3.5 mt-4">
                <div>
                    <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 ml-0.5">Total Course Semesters</label>
                    <input type="number" id="tc-total-sems" class="input w-full font-mono font-bold" value="8">
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 ml-0.5">Completed Sems</label>
                        <input type="number" id="tc-completed-sems" class="input w-full font-mono font-bold" value="${currentSems}">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 ml-0.5">Current CGPA</label>
                        <input type="number" step="0.01" id="tc-current-cgpa" class="input w-full font-mono font-bold" value="${currentCgpaVal}" placeholder="e.g. 7.5">
                    </div>
                </div>

                <div>
                    <label class="block text-[11px] font-bold text-purple-600 dark:text-purple-400 mb-1 ml-0.5">Your Target CGPA</label>
                    <input type="number" step="0.01" id="tc-target-cgpa" class="input w-full font-mono font-extrabold text-lg border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100" placeholder="e.g. 8.5">
                </div>
            </div>

            <button onclick="calculateTarget()" class="btn mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Calculate Required GPA
            </button>
        </div>

        <div id="tc-result-card" class="card hidden text-center transition-all duration-300 p-5"></div>
    `;
}

function calculateTarget() {
    triggerHaptic(12);
    const totalSems = parseFloat(document.getElementById('tc-total-sems').value);
    const compSems = parseFloat(document.getElementById('tc-completed-sems').value);
    const currentCgpa = parseFloat(document.getElementById('tc-current-cgpa').value);
    const targetCgpa = parseFloat(document.getElementById('tc-target-cgpa').value);
    const resultCard = document.getElementById('tc-result-card');

    if (!totalSems || isNaN(compSems) || isNaN(currentCgpa) || isNaN(targetCgpa)) {
        showToast("Please fill in all fields correctly.");
        return;
    }

    if (compSems >= totalSems) {
        showToast("Completed semesters must be less than total semesters.");
        return;
    }

    const remainingSems = totalSems - compSems;
    // Core Formula preserved exactly
    const requiredGpa = ((targetCgpa * totalSems) - (currentCgpa * compSems)) / remainingSems;

    resultCard.classList.remove('hidden');

    if (requiredGpa > 10) {
        resultCard.innerHTML = `
            <div class="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </div>
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Target Out of Reach</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                You need an average of <strong class="text-red-500 font-mono text-sm">${requiredGpa.toFixed(2)} GPA</strong> across your remaining ${remainingSems} ${remainingSems === 1 ? 'semester' : 'semesters'}. Since the max scale is 10.0, consider slightly adjusting your target.
            </p>
        `;
    } else if (requiredGpa <= currentCgpa) {
        resultCard.innerHTML = `
            <div class="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Target Well on Track!</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Maintain an average of <strong class="text-green-600 dark:text-green-400 font-mono text-sm">${requiredGpa.toFixed(2)} GPA</strong> across your next ${remainingSems} ${remainingSems === 1 ? 'semester' : 'semesters'} to secure your goal of ${targetCgpa} CGPA.
            </p>
        `;
    } else {
        resultCard.innerHTML = `
            <div class="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            </div>
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Goal Strategy Ready!</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                To achieve <strong class="text-purple-600 dark:text-purple-400 font-mono">${targetCgpa} CGPA</strong>, you need to average <strong class="text-purple-600 dark:text-purple-400 font-mono text-sm">${requiredGpa.toFixed(2)} GPA</strong> in your remaining ${remainingSems} ${remainingSems === 1 ? 'semester' : 'semesters'}.
            </p>
        `;
    }
}