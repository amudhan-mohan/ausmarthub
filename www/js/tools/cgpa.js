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
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-blue-600 dark:text-blue-400">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Student Profiles</h1>
            </div>
            <div class="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                ${profiles.length} Profiles
            </div>
        </div>
        
        <div class="grid gap-3">
    `;

    if (profiles.length === 0) {
        // Empty State
        html += `
            <div class="card text-center py-10 text-gray-500 dark:text-gray-400 border-dashed border-2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="mx-auto mb-3 opacity-50">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>
                </svg>
                <p class="font-medium text-gray-700 dark:text-gray-300">No profiles found</p>
                <p class="text-xs mt-1 mb-4">Create a profile for yourself or a friend to start tracking CGPA.</p>
                <button onclick="createProfile()" class="btn mx-auto flex items-center justify-center gap-2 text-white dark:text-gray-900">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Create First Profile
                </button>
            </div>
        `;
    } else {
        // List Profiles as Cards
        profiles.forEach((p, idx) => {
            let cgpaDisplay = calculateProfileCGPA(p.semesters);
            let initial = p.name.charAt(0).toUpperCase();

            html += `
                <div class="card flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition" onclick="openProfile(${idx})">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                            ${initial}
                        </div>
                        <div>
                            <h3 class="font-bold text-gray-800 dark:text-gray-100 text-base">${escapeHtml(p.name)}</h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Overall CGPA: <span class="${cgpaDisplay === 'RA' ? 'text-red-500' : 'text-blue-500 font-bold'}">${cgpaDisplay}</span> • ${p.semesters.length} Semesters</p>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex items-center gap-1">
                        <!-- Edit Button -->
                        <button onclick="event.stopPropagation(); editProfile(${idx})" class="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition" title="Edit Name">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        
                        <!-- Delete Button -->
                        <button onclick="event.stopPropagation(); deleteProfile(${idx})" class="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition" title="Delete Profile">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        });

        // Add Profile Button
        html += `
            <button onclick="createProfile()" class="btn mt-2 flex items-center justify-center gap-2 w-full bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
                Create New Profile
            </button>
        `;
    }

    html += `</div>`;
    return html;
}

// Profile Helper Functions
function calculateProfileCGPA(semestersArray) {
    if (!semestersArray || semestersArray.length === 0) return "-";
    let totalCredits = 0;
    let totalPoints = 0;
    let hasRA = false;

    semestersArray.forEach(sem => {
        sem.subjects.forEach(s => {
            let credit = Number(s.credit) || 0;
            let gp = getGP(s.grade);
            if (s.grade === "RA") hasRA = true;
            totalCredits += credit;
            totalPoints += credit * gp;
        });
    });

    if (totalCredits === 0) return "-";
    if (hasRA) return "RA";
    return (totalPoints / totalCredits).toFixed(2);
}

function openProfile(idx) {
    currentProfileIndex = idx;
    semesters = profiles[idx].semesters;
    navigate('cgpa');
}

function createProfile() {
    showInputModal(
        "Create New Profile",
        "Enter student's name",
        "", // No initial value
        "Create",
        (name) => {
            profiles.push({
                id: Date.now().toString(),
                name: name,
                semesters: []
            });
            save();
            render();
        }
    );
}

function editProfile(idx) {
    let currentName = profiles[idx].name;

    showInputModal(
        "Edit Profile",
        "Enter student's name",
        currentName, // Pass the current name so they can edit it
        "Save Changes",
        (newName) => {
            // Only save if the name actually changed
            if (newName !== currentName) {
                profiles[idx].name = newName;
                save();
                render();
            }
        }
    );
}

function deleteProfile(idx) {
    showConfirm(
        "Delete Profile?",
        `Are you sure you want to delete ${profiles[idx].name}'s profile? All semester data will be lost forever.`,
        "Delete",
        () => {
            profiles.splice(idx, 1);
            save();
            render();
        }
    );
}

// ================= CGPA =================
function renderCGPA() {
    let totalCredits = 0;
    let totalPoints = 0;
    let hasRA = false;
    let lastSemGPA = "-";

    semesters.forEach((sem, index) => {
        let semCredits = 0;
        let semPoints = 0;
        let semRA = false;

        sem.subjects.forEach(s => {
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

        if (index === semesters.length - 1) {
            lastSemGPA = (semRA || semCredits === 0) ? "RA" : (semPoints / semCredits).toFixed(2);
        }
    });

    let cgpa = (hasRA || totalCredits === 0) ? "RA" : (totalPoints / totalCredits).toFixed(2);

    let classification = "-";
    if (cgpa !== "RA") {
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

    return `
        <!-- Header Section -->
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-2">
                    <path d="M31,26c-0.6,0-1-0.4-1-1V12c0-0.6,0.4-1,1-1s1,0.4,1,1v13C32,25.6,31.6,26,31,26z"/>
                    <g>
                        <path d="M16,21c-0.2,0-0.3,0-0.5-0.1l-15-8C0.2,12.7,0,12.4,0,12s0.2-0.7,0.5-0.9l15-8c0.3-0.2,0.6-0.2,0.9,0l15,8 c0.3,0.2,0.5,0.5,0.5,0.9s-0.2,0.7-0.5,0.9l-15,8C16.3,21,16.2,21,16,21z"/>
                    </g>
                    <path d="M17.4,22.6C17,22.9,16.5,23,16,23s-1-0.1-1.4-0.4L6,18.1V22c0,3.1,4.9,6,10,6s10-2.9,10-6v-3.9L17.4,22.6z"/>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
                    ${profiles[currentProfileIndex] ? escapeHtml(profiles[currentProfileIndex].name) + "'s" : ""} CGPA
                </h1>
            </div>
            <div class="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Academic Performance
            </div>
        </div>

        <!-- Stats Grid - Your Code (Perfect) -->
        <div class="grid grid-cols-2 gap-3">
            <div class="card stat-card">
                <div class="text-gray-500 dark:text-gray-400">Semesters</div>
                <div class="text-gray-900 dark:text-white font-bold">${semesters.length}</div>
            </div>
            <div class="card stat-card">
                <div class="text-gray-500 dark:text-gray-400">Total Credits</div>
                <div class="text-gray-900 dark:text-white font-bold">${totalCredits}</div>
            </div>
            <div class="card stat-card">
                <div class="text-gray-500 dark:text-gray-400">Last GPA</div>
                <div class="text-gray-900 dark:text-white font-bold">${lastSemGPA}</div>
            </div>
            <div class="card stat-card">
                <div class="text-gray-500 dark:text-gray-400">Class</div>
                <div class="text-green-600 dark:text-green-400 text-sm font-semibold">${classification}</div>
            </div>
            <div class="card stat-card col-span-2">
                <div class="text-gray-500 dark:text-gray-400">CGPA</div>
                <div class="text-blue-600 dark:text-blue-400 text-xl font-bold">${cgpa}</div>
            </div>
            <div class="card stat-card col-span-2">
                <div class="text-gray-500 dark:text-gray-400">Percentage</div>
                <div class="text-purple-600 dark:text-purple-400 text-xl font-bold">${percentage}</div>
            </div>
        </div>
        <div class="mt-4">
            <h3 class="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M31,26c-0.6,0-1-0.4-1-1V12c0-0.6,0.4-1,1-1s1,0.4,1,1v13C32,25.6,31.6,26,31,26z"/>
                    <g>
                        <path d="M16,21c-0.2,0-0.3,0-0.5-0.1l-15-8C0.2,12.7,0,12.4,0,12s0.2-0.7,0.5-0.9l15-8c0.3-0.2,0.6-0.2,0.9,0l15,8 c0.3,0.2,0.5,0.5,0.5,0.9s-0.2,0.7-0.5,0.9l-15,8C16.3,21,16.2,21,16,21z"/>
                    </g>
                    <path d="M17.4,22.6C17,22.9,16.5,23,16,23s-1-0.1-1.4-0.4L6,18.1V22c0,3.1,4.9,6,10,6s10-2.9,10-6v-3.9L17.4,22.6z"/>
                </svg>
                Semester (${semesters.length})
            </h3>
        </div>

        ${semesters.map((s, i) => `
            <div onclick="openSemester(${i})" class="card flex justify-between items-center mt-2 cursor-pointer">
                <div class="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="4" width="18" height="16" rx="2"/>
                        <line x1="8" y1="10" x2="16" y2="10"/>
                    </svg>
                    <span class="text-gray-700 dark:text-gray-200">Semester ${i + 1}</span>
                </div>
                <button onclick="event.stopPropagation(); deleteSemester(${i})" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition" title="Delete Semester">
                    <svg width="18" height="18" viewBox="0 0 1024 1024" fill="currentColor" style="color: inherit !important;">
                        <path d="M864 256H736v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zm-504-72h304v72H360v-72zm371.3 656H292.7l-24.2-512h487l-24.2 512z"/>
                    </svg>
                </button>
            </div>
        `).join("")}

        <!-- Rest of your code continues... -->
        <button onclick="createSemester()" class="btn mt-3 flex items-center justify-center gap-2 w-full text-white dark:text-gray-900">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
            </svg>
            Create Semester
        </button>

        ${semesters.length > 0 ? `
        <div class="card mt-4">
            <h2 class="text-lg mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M3 3v18h18M18 17V9M12 17V5M6 17v-3"/>
                </svg>
                GPA Trend
            </h2>
            <canvas id="cgpaChart"></canvas>
        </div>
        ` : `
        <div class="card mt-4 text-center text-gray-500 dark:text-gray-400">
            No semester data available
        </div>
        `}

        <div class="card mt-4 text-sm">
            <h3 class="font-bold mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4l3 3"/>
                </svg>
                CGPA Formula
            </h3>
            <p class="text-gray-600 dark:text-gray-300">CGPA = Σ (Grade Point × Credit) / Σ Credits</p>
            <p class="text-xs mt-2 text-gray-500 dark:text-gray-400">
                Example: (10×4 + 9×3 + 8×3) / 10 = 9.1
            </p>
        </div>

        <!-- Manual Calculation Guide Section -->
        <div class="card mt-4">
            <h3 class="font-bold mb-3 flex items-center gap-2 text-base text-gray-800 dark:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h4"/>
                    <path d="M18 4L20 6L18 8"/>
                    <path d="M6 4L4 6L6 8"/>
                </svg>
                Manual Calculation Guide
            </h3>
            
            <!-- Semester CGPA -->
            <div class="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    <span class="font-bold text-blue-600 dark:text-blue-400">Semester CGPA</span>
                </div>
                <div class="text-sm space-y-2">
                    <div class="flex justify-between items-center p-2 bg-black/5 dark:bg-white/5 rounded">
                        <span class="text-gray-600 dark:text-gray-300">Formula:</span>
                        <span class="font-mono text-gray-800 dark:text-gray-200">Sum of Credit Points ÷ Sum of Credit Hours</span>
                    </div>
                    <div class="p-2 bg-black/5 dark:bg-white/5 rounded">
                        <div class="text-gray-600 dark:text-gray-300">• Credit Points = Grade × Credit Hours</div>
                        <div class="text-gray-600 dark:text-gray-300">• Reappear if any subject has 0 credits</div>
                    </div>
                    <div class="p-2 bg-black/5 dark:bg-white/5 rounded">
                        <span class="text-gray-600 dark:text-gray-300">Example:</span>
                        <span class="font-mono text-gray-800 dark:text-gray-200"> 4 hours × 5 grade = 20 Credit Points</span>
                    </div>
                </div>
            </div>
            
            <!-- Overall OGPA -->
            <div class="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2">
                        <path d="M3 3v18h18M18 17V9M12 17V5M6 17v-3"/>
                        <path d="M3 3L21 21"/>
                    </svg>
                    <span class="font-bold text-purple-600 dark:text-purple-400">Overall OGPA</span>
                </div>
                <div class="text-sm space-y-2">
                    <div class="flex justify-between items-center p-2 bg-black/5 dark:bg-white/5 rounded">
                        <span class="text-gray-600 dark:text-gray-300">Formula:</span>
                        <span class="font-mono text-gray-800 dark:text-gray-200">Sum of All CGPAs ÷ Total Number of Semesters</span>
                    </div>
                    <div class="p-2 bg-black/5 dark:bg-white/5 rounded">
                        <div class="text-gray-600 dark:text-gray-300">• Only completed semesters included</div>
                        <div class="text-gray-600 dark:text-gray-300">• Reappear semesters are excluded</div>
                    </div>
                    <div class="p-2 bg-black/5 dark:bg-white/5 rounded">
                        <span class="text-gray-600 dark:text-gray-300">Example:</span>
                        <span class="font-mono text-gray-800 dark:text-gray-200"> OGPA = (8.5 + 7.8 + 9.2) ÷ 3 = 8.5</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Credit Hours Strategy Section -->
        <div class="card mt-4">
            <h3 class="font-bold mb-3 flex items-center gap-2 text-base text-gray-800 dark:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    <path d="M8 12h8"/>
                    <path d="M12 8v8"/>
                </svg>
                Credit Hours Strategy
            </h3>
            
            <!-- High Impact -->
            <div class="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                        <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2z"/>
                    </svg>
                    <span class="font-bold text-red-600 dark:text-red-400">High Impact (4 & 3 credits)</span>
                </div>
                <ul class="list-disc ml-6 text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                    <li>Core theory subjects - Maximum weight on CGPA</li>
                    <li>Focus on getting S/A grades</li>
                    <li>1 point improvement = +0.25 CGPA boost</li>
                </ul>
            </div>
            
            <!-- Medium Impact -->
            <div class="mb-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    <span class="font-bold text-yellow-600 dark:text-yellow-400">Medium Impact (2 & 1 credits)</span>
                </div>
                <ul class="list-disc ml-6 text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                    <li>Electives & minor subjects - Moderate weight on CGPA</li>
                    <li>Maintain B+ grades or better</li>
                    <li>Good for consistency</li>
                </ul>
            </div>
            
            <!-- Lab Subjects -->
            <div class="mb-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div class="flex items-center gap-2 mb-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                        <path d="M20 12H4M12 4v16"/>
                        <rect x="2" y="2" width="20" height="20" rx="2.18"/>
                    </svg>
                    <span class="font-bold text-green-600 dark:text-green-400">Lab Subjects (1.5 credits)</span>
                </div>
                <ul class="list-disc ml-6 text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                    <li>Practical/laboratory courses - Easier to score high grades</li>
                    <li>Perfect for boosting CGPA</li>
                    <li>Aim for S grades consistently</li>
                </ul>
            </div>
        </div>

        <!-- CGPA Growth Strategy -->
        <div class="card mt-3">
            <h3 class="font-bold mb-3 flex items-center gap-2 text-base text-gray-800 dark:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M2 20L22 20M4 4L20 20M8 4L16 12M12 4L14 6"/>
                </svg>
                CGPA Growth Strategy
            </h3>
            <div class="space-y-2">
                <div class="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span class="text-sm text-gray-600 dark:text-gray-300">Priority 1</span>
                    <span class="font-bold text-blue-600 dark:text-blue-400">4-credit subjects</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span class="text-sm text-gray-600 dark:text-gray-300">Priority 2</span>
                    <span class="font-bold text-blue-600 dark:text-blue-400">3-credit subjects</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span class="text-sm text-gray-600 dark:text-gray-300">Priority 3</span>
                    <span class="font-bold text-green-600 dark:text-green-400">1.5-credit labs</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span class="text-sm text-gray-600 dark:text-gray-300">Priority 4</span>
                    <span class="font-bold text-yellow-600 dark:text-yellow-400">1 & 2-credit subjects</span>
                </div>
            </div>
        </div>

        <!-- OGPA Growth Strategy -->
        <div class="card mt-3">
            <h3 class="font-bold mb-3 flex items-center gap-2 text-base text-gray-800 dark:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                OGPA Growth Strategy
            </h3>
            <ul class="list-disc ml-6 text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                <li>Consistency across all semesters</li>
                <li>Avoid reappears at all costs</li>
                <li>Early semesters set the base</li>
                <li>Later semesters can recover OGPA</li>
            </ul>
        </div>

        <!-- Quick Impact Calculation -->
        <div class="card mt-3">
            <h3 class="font-bold mb-3 flex items-center gap-2 text-base text-gray-800 dark:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <path d="M12 22V12M9 10.5L12 9l3 1.5"/>
                </svg>
                Quick Impact Calculation
            </h3>
            <div class="space-y-2 text-sm">
                <div class="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span class="text-blue-600 dark:text-blue-400">4-credit subject B → A:</span>
                    <span class="text-gray-600 dark:text-gray-300"> +9 points × 4 hours = +36 credit points</span>
                </div>
                <div class="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span class="text-blue-600 dark:text-blue-400">3-credit subject C → B:</span>
                    <span class="text-gray-600 dark:text-gray-300"> +8 points × 3 hours = +24 credit points</span>
                </div>
                <div class="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span class="text-green-600 dark:text-green-400">Perfect lab (1.5 credits):</span>
                    <span class="text-gray-600 dark:text-gray-300"> S grade = 15 credit points</span>
                </div>
            </div>
        </div>

        <!-- Your Action Plan -->
        <div class="card mt-3">
            <h3 class="font-bold mb-3 flex items-center gap-2 text-base text-gray-800 dark:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                </svg>
                Your Action Plan
            </h3>
            <ol class="list-decimal ml-6 text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                <li>Focus on 4 & 3 credit subjects first</li>
                <li>Aim for S/A grades in labs (easy boost)</li>
                <li>Maintain consistency across all semesters</li>
                <li>Never get reappear (zeros destroy CGPA)</li>
            </ol>
        </div>

        <div class="card mt-3 text-sm">
            <h3 class="font-bold mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                How to Improve CGPA
            </h3>
            <ul class="list-disc ml-4 text-gray-600 dark:text-gray-300 space-y-1">
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
    semesters.push({ subjects: [] });
    save();
    render();
}

function openSemester(index) {
    currentSemester = index;
    navigate("semester");
}

function deleteSemester(i) {
    showConfirm(
        "Delete Semester?",
        "Are you sure you want to delete this semester? This action cannot be undone.",
        "Delete",
        () => {
            semesters.splice(i, 1);
            save();
            render();
        }
    );
}

// ================= SEMESTER & SUBJECT MANAGEMENT =================
function changeProfile(index) {
    currentProfileIndex = parseInt(index);
    semesters = profiles[currentProfileIndex].semesters;
    save();

    // Re-render CGPA screen and refresh chart
    render();
    if (semesters.length > 0) {
        setTimeout(() => {
            renderCGPAChart();
        }, 100);
    }
}

function addProfile() {
    let name = prompt("Enter student's name (e.g., Friend's Name):");

    if (name && name.trim() !== "") {
        // Create new profile object
        let newProfile = {
            id: Date.now().toString(),
            name: name.trim(),
            semesters: []
        };

        profiles.push(newProfile);

        // Switch to the newly created profile
        currentProfileIndex = profiles.length - 1;
        semesters = profiles[currentProfileIndex].semesters;

        save();
        render();
    }
}

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
        data.push(gpa);
    });

    let ctx = document.getElementById("cgpaChart");
    if (!ctx) return;

    if (chartInstance) chartInstance.destroy();

    // Determine colors based on the current theme
    const chartTextColor = isDarkMode ? '#9ca3af' : '#6b7280'; // Light gray for dark mode, dark gray for light
    const chartGridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'; // Subtle white or black lines

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'GPA',
                data: data,
                tension: 0.4,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)', // Optional: adds a nice subtle blue fill under the line
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: {
                        color: chartGridColor,
                        borderColor: chartGridColor // Colors the main axis line
                    },
                    ticks: {
                        color: chartTextColor
                    }
                },
                y: {
                    min: 0,
                    max: 10,
                    grid: {
                        color: chartGridColor,
                        borderColor: chartGridColor // Colors the main axis line
                    },
                    ticks: {
                        color: chartTextColor
                    }
                }
            }
        }
    });
}

function renderSemester() {
    let sem = semesters[currentSemester] || { subjects: [] };

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

    let gpa = (hasRA || totalCredits === 0) ? "RA" : (totalPoints / totalCredits).toFixed(2);

    return `
        <!-- Header Section -->
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Semester Details</h1>
            </div>
            <div class="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                <span class="text-sm font-medium text-blue-600 dark:text-blue-400">Semester ${currentSemester + 1}</span>
            </div>
        </div>

        <!-- Stats Card -->
        <div class="card mb-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                    <div class="text-sm text-gray-500 dark:text-gray-400">Total Credits</div>
                    <div class="text-2xl font-bold text-gray-800 dark:text-white">${totalCredits}</div>
                </div>
                <div class="text-center">
                    <div class="text-sm text-gray-500 dark:text-gray-400">Semester GPA</div>
                    <div class="text-2xl font-bold ${gpa === 'RA' ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}">${gpa}</div>
                </div>
            </div>
            ${hasRA ? `
                <div class="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg animate-pulse">
                    <div class="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-600 dark:text-red-400 flex-shrink-0">
                            <path d="M12 2L2 19h20L12 2z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <span class="text-sm text-red-600 dark:text-red-400">Reappear detected - This semester has RA grade</span>
                    </div>
                </div>
            ` : ''}
        </div>

        <!-- Subjects List -->
        <div class="mb-3">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    Subjects (${sem.subjects.length})
                </h3>
                <button onclick="addSubject()" class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add
                </button>
            </div>
        </div>

        ${sem.subjects.map((sub, i) => `
            <div class="card mb-3">
                <div class="flex justify-between items-center mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span class="text-sm font-bold text-gray-800 dark:text-gray-200">Subject ${i + 1}</span>
                    <button onclick="deleteSubject(${i})" class="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded transition" title="Delete Subject">
                        <svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" style="color: inherit !important;">
                            <path d="M864 256H736v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zm-504-72h304v72H360v-72zm371.3 656H292.7l-24.2-512h487l-24.2 512z"/>
                        </svg>
                    </button>
                </div>
                
                <div class="mb-3">
                    <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 mb-1">Subject Name</label>
                    <input class="input w-full" placeholder="e.g. Mathematics I" value="${escapeHtml(sub.name)}" onchange="updateSubject(${i}, 'name', this.value)">
                </div>
                
                <div class="grid grid-cols-2 gap-3 mb-2">
                    <div>
                        <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 mb-1">Credits</label>
                        <input type="number" class="input w-full" placeholder="e.g. 4" value="${sub.credit}" onchange="updateSubject(${i}, 'credit', this.value)">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 mb-1">Grade</label>
                        <select class="input w-full" onchange="updateSubject(${i}, 'grade', this.value)">
                            ${["S", "A", "B", "C", "D", "E", "RA"].map(g => `<option ${g == sub.grade ? 'selected' : ''} class="${g === 'RA' ? 'text-red-500' : ''}">${g}</option>`).join("")}
                        </select>
                    </div>
                </div>
                
                ${sub.name ? `
                    <div class="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800/50">
                        ${getGradeImpact(sub.credit, sub.grade)}
                    </div>
                ` : ''}
            </div>
        `).join("")}

        ${sem.subjects.length === 0 ? `
        <div class="card text-center py-8 text-gray-500 dark:text-gray-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="mx-auto mb-2 opacity-50">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <p>No subjects added yet</p>
            <p class="text-xs mt-1">Click the Add button to add your first subject</p>
        </div>
        ` : ''}

        <button onclick="addSubject()" class="btn mt-3 w-full flex items-center justify-center gap-2 text-white dark:text-gray-900">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
            </svg>
            Add New Subject
        </button>
    `;
}

function getGradeImpact(credits, grade) {
    const gradePoints = { "S": 10, "A": 9, "B": 8, "C": 7, "D": 6, "E": 5, "RA": 0 };
    const points = gradePoints[grade] || 0;
    const totalPoints = (credits || 0) * points;

    const impactConfig = {
        'RA': {
            icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
            text: 'Reappear - This will significantly reduce your CGPA',
            color: 'text-red-600 dark:text-red-400'
        },
        'excellent': {
            icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
            text: `Excellent! +${totalPoints} credit points`,
            color: 'text-yellow-600 dark:text-yellow-400'
        },
        'good': {
            icon: '<path d="M20 6L9 17L4 12"/>',
            text: `Good! +${totalPoints} credit points`,
            color: 'text-green-600 dark:text-green-400'
        },
        'average': {
            icon: '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><path d="M8 12h8"/>',
            text: `Average impact: +${totalPoints} credit points`,
            color: 'text-blue-600 dark:text-blue-400'
        },
        'low': {
            icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
            text: `Low impact: +${totalPoints} credit points`,
            color: 'text-orange-600 dark:text-orange-400'
        }
    };

    let type;
    if (grade === "RA") type = 'RA';
    else if (points >= 9) type = 'excellent';
    else if (points >= 8) type = 'good';
    else if (points >= 6) type = 'average';
    else type = 'low';

    const config = impactConfig[type];

    return `
        <div class="flex items-center gap-2 ${config.color}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${config.icon}
            </svg>
            <span>${config.text}</span>
        </div>
    `;
}

function addSubject() {
    semesters[currentSemester].subjects.push({
        name: "",
        credit: 4,
        grade: "S"
    });
    save();
    render();
}

let renderTimer;

function smartRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => {
        let activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT')) {
            // Attach a one-time listener to safely render AS SOON AS they click away
            activeEl.addEventListener('blur', function onBlur() {
                activeEl.removeEventListener('blur', onBlur);
                setTimeout(render, 100);
            }, { once: true });
            return;
        }

        render();
    }, 200);
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
    if (key === 'grade' && document.activeElement && document.activeElement.tagName === 'SELECT') {
        document.activeElement.blur();
    }
    smartRender();
}

function deleteSubject(i) {
    semesters[currentSemester].subjects.splice(i, 1);
    save();
    render();
}

// ================= TARGET CGPA CALCULATOR =================
function renderTargetCGPA() {
    // Attempt to auto-fill based on the current profile
    let currentSems = semesters ? semesters.length : 0;
    let currentCgpaVal = calculateProfileCGPA(semesters);
    if (currentCgpaVal === "-" || currentCgpaVal === "RA") currentCgpaVal = "";

    return `
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-purple-600 dark:text-purple-400">
                    <line id="primary" x1="3" y1="19" x2="21" y2="19" style="fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><polyline id="primary-2" data-name="primary" points="3 15 8 9 14 12 21 5" style="fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></polyline><polyline id="primary-3" data-name="primary" points="21 10 21 5 16 5" style="fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></polyline>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Goal Setter</h1>
            </div>
            <div class="text-xs px-3 py-1 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                Target Tracker
            </div>
        </div>

        <div class="card mb-4 border border-purple-500/20">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Find out exactly what GPA you need in your remaining semesters to hit your target.</p>
            
            <div class="space-y-4">
                <div>
                    <label class="text-xs font-bold text-gray-600 dark:text-gray-300 ml-1">Total Semesters in Course</label>
                    <input type="number" id="tc-total-sems" class="w-full p-3 rounded-xl border bg-black/5 text-gray-800 dark:bg-white/5 dark:text-white border-gray-300 dark:border-gray-600 focus:border-purple-500 outline-none mt-1 transition-colors" value="8">
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs font-bold text-gray-600 dark:text-gray-300 ml-1">Completed Sems</label>
                        <input type="number" id="tc-completed-sems" class="w-full p-3 rounded-xl border bg-black/5 text-gray-800 dark:bg-white/5 dark:text-white border-gray-300 dark:border-gray-600 focus:border-purple-500 outline-none mt-1 transition-colors" value="${currentSems}">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-600 dark:text-gray-300 ml-1">Current CGPA</label>
                        <input type="number" step="0.01" id="tc-current-cgpa" class="w-full p-3 rounded-xl border bg-black/5 text-gray-800 dark:bg-white/5 dark:text-white border-gray-300 dark:border-gray-600 focus:border-purple-500 outline-none mt-1 transition-colors" value="${currentCgpaVal}" placeholder="e.g. 7.5">
                    </div>
                </div>

                <div>
                    <label class="text-xs font-bold text-gray-600 dark:text-gray-300 ml-1 text-gray-600 dark:text-gray-300">Your Target CGPA</label>
                    <input type="number" step="0.01" id="tc-target-cgpa" class="w-full p-3 rounded-xl border-2 bg-purple-50/50 text-gray-800 dark:bg-purple-900/10 dark:text-white border-purple-300 dark:border-purple-500 focus:border-purple-600 outline-none mt-1 transition-colors" placeholder="e.g. 8.5">
                </div>
            </div>

            <button onclick="calculateTarget()" class="btn mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white border-none shadow-lg shadow-purple-500/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Calculate Required GPA
            </button>
        </div>

        <div id="tc-result-card" class="card hidden text-center transition-all duration-300 transform scale-95 opacity-0">
            </div>
    `;
}

function calculateTarget() {
    const totalSems = parseFloat(document.getElementById('tc-total-sems').value);
    const compSems = parseFloat(document.getElementById('tc-completed-sems').value);
    const currentCgpa = parseFloat(document.getElementById('tc-current-cgpa').value);
    const targetCgpa = parseFloat(document.getElementById('tc-target-cgpa').value);
    const resultCard = document.getElementById('tc-result-card');

    if (!totalSems || !compSems || !currentCgpa || !targetCgpa) {
        alert("Please fill in all fields correctly.");
        return;
    }

    if (compSems >= totalSems) {
        alert("Completed semesters must be less than total semesters.");
        return;
    }

    const remainingSems = totalSems - compSems;

    // Core Formula: Assuming equal weightage per semester for predictive purposes
    const requiredGpa = ((targetCgpa * totalSems) - (currentCgpa * compSems)) / remainingSems;

    // Show animations
    resultCard.classList.remove('hidden');
    setTimeout(() => {
        resultCard.classList.remove('scale-95', 'opacity-0');
    }, 10);

    if (requiredGpa > 10) {
        resultCard.innerHTML = `
            <div class="text-red-500 mb-2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto">
                    <circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Mathematically Impossible</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">You need an average of <span class="font-bold text-red-500 text-base">${requiredGpa.toFixed(2)} GPA</span> in your next ${remainingSems} semesters. Since the maximum GPA is 10.0, you might need to adjust your target slightly.</p>
        `;
    } else if (requiredGpa <= currentCgpa) {
        resultCard.innerHTML = `
            <div class="text-green-500 mb-2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">You're on Track!</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">You only need an average of <span class="font-bold text-green-500 text-base">${requiredGpa.toFixed(2)} GPA</span> in your remaining ${remainingSems} semesters to hit ${targetCgpa}. Keep up the great work!</p>
        `;
    } else {
        resultCard.innerHTML = `
            <div class="text-purple-500 mb-2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>
                </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Time to Grind! 🚀</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">To reach your goal of ${targetCgpa}, you need to score an average of <span class="font-bold text-purple-500 text-lg">${requiredGpa.toFixed(2)} GPA</span> in your next ${remainingSems} semesters. You got this!</p>
        `;
    }
}