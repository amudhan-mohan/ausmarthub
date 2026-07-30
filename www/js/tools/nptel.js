let nptelProfiles = safeJSONParse("smarthub_nptel", []);
let currentNptelIndex = null;

function saveNptel() { 
    localStorage.setItem("smarthub_nptel", JSON.stringify(nptelProfiles));
}

function renderNptelProfiles() {
    let html = `
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-indigo-600 dark:text-indigo-400">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">NPTEL Courses</h1>
            </div>
            <div class="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium">
                ${nptelProfiles.length} Courses
            </div>
        </div>
        
        <div class="grid gap-3">
    `;

    if (nptelProfiles.length === 0) {
        html += `
            <div class="card text-center py-10 text-gray-500 dark:text-gray-400 border-dashed border-2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="mx-auto mb-3 opacity-50">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <p class="font-medium text-gray-700 dark:text-gray-300">No NPTEL courses found</p>
                <p class="text-xs mt-1 mb-4">Create a course to start tracking internal marks.</p>
                <button onclick="createNptelProfile()" class="btn mx-auto flex items-center justify-center gap-2 text-white dark:text-gray-900">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add First Course
                </button>
            </div>
        `;
    } else {
        nptelProfiles.forEach((p, idx) => {
            let valid = p.assignments.filter(score => score !== '').map(Number);
            let avg = valid.length > 0 ? [...valid].sort((a, b) => b - a).slice(0, 8).reduce((a, b) => a + b, 0) / 8 : 0;
            let internal = ((avg * 25) / 100).toFixed(2);

            html += `
                <div class="card flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition border-l-4 ${internal >= 10 ? 'border-green-500' : 'border-indigo-500'}" onclick="openNptelProfile(${idx})">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg shadow-inner">
                            ${p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 class="font-bold text-gray-800 dark:text-gray-100 text-base">${escapeHtml(p.name)}</h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Internal Marks: <span class="font-bold ${internal >= 10 ? 'text-green-500' : 'text-gray-800 dark:text-gray-200'}">${internal}/25</span> • ${valid.length} Entered</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-1">
                        <button onclick="event.stopPropagation(); editNptelProfile(${idx})" class="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition" title="Edit Course">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        
                        <button onclick="event.stopPropagation(); deleteNptelProfile(${idx})" class="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition" title="Delete Course">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
            <button onclick="createNptelProfile()" class="btn mt-2 flex items-center justify-center gap-2 w-full bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add New Course
            </button>
        `;
    }

    html += `</div>`;
    return html;
}

function createNptelProfile() {
    showInputModal("Add NPTEL Course", "e.g. Cloud Computing", "", "Create", (name) => {
        nptelProfiles.push({ id: Date.now().toString(), name: name, assignments: Array(12).fill("") });
        saveNptel();
        render();
    });
}

function editNptelProfile(idx) {
    let currentName = nptelProfiles[idx].name;
    
    showInputModal(
        "Edit NPTEL Course",
        "e.g. Cloud Computing",
        currentName,
        "Save Changes",
        (newName) => {
            if (newName !== currentName) {
                nptelProfiles[idx].name = newName;
                saveNptel();
                render();
            }
        },
        "book"
    );
}

function openNptelProfile(idx) {
    currentNptelIndex = idx;
    navigate('nptel-calc');
}

function deleteNptelProfile(idx) {
    showConfirm("Delete Course?", `Are you sure you want to delete ${nptelProfiles[idx].name}?`, "Delete", () => {
        nptelProfiles.splice(idx, 1);
        saveNptel();
        render();
    });
}

function updateNptelScore(idx, value) {
    let profile = nptelProfiles[currentNptelIndex];
    profile.assignments[idx] = value === '' ? '' : Math.min(100, Math.max(0, parseFloat(value) || 0));
    saveNptel();
    render();
}

function resetNptelProfile() {
    showConfirm(
        "Reset Scores?", 
        "Are you sure you want to clear all 12 assignment scores? This cannot be undone.", 
        "Reset", 
        () => {
            nptelProfiles[currentNptelIndex].assignments = Array(12).fill("");
            saveNptel();
            render();
        }
    );
}

function renderNptelCalc() {
    let profile = nptelProfiles[currentNptelIndex];
    if (!profile) return "";

    let validAssignments = profile.assignments.filter(score => score !== '').map(Number);
    let bestAssignments = [...validAssignments].sort((a, b) => b - a).slice(0, 8);
    let avgAssignmentScore = bestAssignments.length > 0 ? bestAssignments.reduce((a, b) => a + b, 0) / 8 : 0;
    let internalMarks = (avgAssignmentScore * 25) / 100;
    let isEligible = internalMarks >= 10;

    let html = `
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-indigo-600 dark:text-indigo-400">
                    <rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="10" x2="16" y2="10"></line><line x1="8" y1="14" x2="16" y2="14"></line><line x1="8" y1="18" x2="16" y2="18"></line><line x1="12" y1="6" x2="12" y2="18"></line>
                </svg>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100 truncate w-48">${escapeHtml(profile.name)}</h1>
            </div>
            <div class="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium whitespace-nowrap">
                Internal Calc
            </div>
        </div>

        <div class="card mb-5">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100">Assignment Scores</h2>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter scores out of 100. Best 8 are automatically chosen.</p>
                </div>
                
                <!-- NEW: Reset Button -->
                <button onclick="resetNptelProfile()" class="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1.5 rounded-lg transition flex items-center gap-1 shrink-0 font-bold">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v6h6"></path><path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path><path d="M21 22v-6h-6"></path><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path></svg>
                    Reset
                </button>
            </div>
            
            <div class="grid grid-cols-3 gap-3 mb-2">
                ${profile.assignments.map((score, i) => `
                    <div>
                        <label class="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">A${i + 1}</label>
                        <input type="number" min="0" max="100" inputmode="decimal" class="input w-full text-center nptel-input" placeholder="-" value="${score}" 
                            onkeypress="return (event.charCode >= 48 && event.charCode <= 57) || event.charCode === 46"
                            onchange="updateNptelScore(${i}, this.value)">
                    </div>
                `).join('')}
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-lg mt-4 p-4">
                <h3 class="font-semibold text-blue-800 mb-2 flex items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <line x1="10" y1="9" x2="8" y2="9"/>
                    </svg>
                    Calculation Formula:
                </h3>
                <p class="text-blue-700 text-sm">Internal Marks = (Average of Best 8 Assignments × 25) ÷ 100</p>
            </div>
        </div>
    `;

    if (validAssignments.length > 0) {
        let progressPerc = Math.min(100, (internalMarks / 25) * 100);

        let statusText = isEligible ? 'Eligible' : 'Not Eligible';
        let statusMessage = isEligible
            ? 'Your internal marks meet the minimum requirement (≥10/25)'
            : 'You need at least 10/25 in internal marks for certificate eligibility';

        let iconSvg = isEligible
            ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22,4 12,14.01 9,11.01"></polyline>'
            : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>';

        let colorClass = isEligible ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
        let bgClass = isEligible ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20';
        let borderClass = isEligible ? 'border-green-300 dark:border-green-800/50' : 'border-red-300 dark:border-red-800/50';
        let progressColor = isEligible ? 'bg-green-500' : 'bg-red-500';

        html += `
            <div class="card !p-0 overflow-hidden mb-5">
                <div class="bg-white dark:bg-[#1c1c1e] p-6">
                    
                    <div class="flex items-center justify-center mb-6">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-800 dark:text-gray-100"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                        <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 ml-2">Internal Marks Calculation</h2>
                    </div>

                    <!-- Best Assignments Used -->
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Best 8 Assignments Used (out of ${validAssignments.length} entered):</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                            ${bestAssignments.map((score, index) => `
                                <div class="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg p-3 text-center">
                                    <div class="text-xs text-green-600 dark:text-green-400">Top Score ${index + 1}</div>
                                    <div class="font-bold text-green-800 dark:text-green-300">${score.toFixed(1)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <!-- Calculation Steps -->
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                                <svg class="mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="10" x2="16" y2="10"></line><line x1="8" y1="14" x2="16" y2="14"></line><line x1="8" y1="18" x2="16" y2="18"></line><line x1="12" y1="6" x2="12" y2="18"></line></svg>
                                Calculation Steps
                            </h3>
                            <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                <div class="flex justify-between items-center">
                                    <span>Average of Best 8:</span>
                                    <div class="text-right">
                                        <span class="font-semibold text-gray-800 dark:text-gray-200">${avgAssignmentScore.toFixed(2)}/100</span>
                                    </div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span>Weight (25%):</span>
                                    <span class="font-semibold text-gray-800 dark:text-gray-200">× 0.25</span>
                                </div>
                                <div class="border-t border-gray-200 dark:border-gray-700 pt-2">
                                    <div class="flex justify-between items-center">
                                        <span class="font-semibold text-gray-800 dark:text-gray-200">Internal Marks:</span>
                                        <span class="text-xl font-bold ${colorClass}">${internalMarks.toFixed(2)}/25</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Eligibility Status -->
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                                <svg class="mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
                                Eligibility Status
                            </h3>
                            <div class="p-4 rounded-lg ${bgClass} border ${borderClass}">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center ${colorClass}">
                                        <svg class="mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            ${iconSvg}
                                        </svg>
                                        <span class="font-semibold">${statusText}</span>
                                    </div>
                                    <span class="text-lg font-bold ${colorClass}">${internalMarks.toFixed(2)}/25</span>
                                </div>
                                <p class="text-sm mt-2 text-gray-700 dark:text-gray-300">${statusMessage}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Progress Bar -->
                    <div class="mt-6">
                        <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>Internal Marks Progress</span>
                            <span class="font-bold text-gray-800 dark:text-gray-200">${internalMarks.toFixed(2)}/25</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <div class="h-4 rounded-full transition-all duration-500 ${progressColor}" style="width: ${progressPerc}%;"></div>
                        </div>
                        <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>0</span>
                            <span class="${isEligible ? 'text-green-600 dark:text-green-400' : ''} font-semibold">Minimum: 10</span>
                            <span>25</span>
                        </div>
                    </div>

                    ${isEligible ? `
                    <!-- Theory Minimum Mark Info -->
                    <div class="mt-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
                        <h3 class="text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                            <svg class="mr-2 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14,2 14,8 20,8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                            Next Step: Theory Exam Requirement
                        </h3>
                        <div class="space-y-2 text-blue-700 dark:text-blue-400 text-sm">
                            <p class="font-semibold">Since your internal marks are ${internalMarks.toFixed(2)}/25, you have cleared the internal requirement!</p>
                            <div class="bg-white dark:bg-blue-950/50 rounded-lg p-3 border border-blue-300 dark:border-blue-800/50">
                                <p class="font-medium mb-1">To get the certificate, you also need:</p>
                                <ul class="list-disc list-inside space-y-1">
                                    <li><strong>Theory Exam Score ≥ 30/75</strong> (40%)</li>
                                    <li><strong>Final Combined Score ≥ 40/100</strong></li>
                                </ul>
                            </div>
                            <p class="text-xs italic opacity-80">Both criteria must be satisfied individually to receive the certificate.</p>
                        </div>
                    </div>

                    <!-- Certificate Criteria -->
                    <div class="mt-6 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-lg p-4">
                        <h3 class="text-base sm:text-lg font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center">
                            <svg class="mr-2 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                            Certificate Criteria 
                        </h3>
                        <div class="space-y-3">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div class="bg-gradient-to-r from-yellow-400 to-yellow-200 dark:from-yellow-600/30 dark:to-yellow-500/30 rounded-lg p-3 text-center border border-yellow-300 dark:border-yellow-600/50">
                                    <div class="font-bold text-yellow-900 dark:text-yellow-400 text-sm">≥ 90</div>
                                    <div class="font-semibold text-yellow-800 dark:text-yellow-500 text-xs">Elite + Gold</div>
                                </div>
                                <div class="bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-600/30 dark:to-gray-500/30 rounded-lg p-3 text-center border border-gray-300 dark:border-gray-600/50">
                                    <div class="font-bold text-gray-700 dark:text-gray-300 text-sm">75 - 89</div>
                                    <div class="font-semibold text-gray-600 dark:text-gray-400 text-xs">Elite + Silver</div>
                                </div>
                                <div class="bg-gradient-to-r from-blue-400 to-blue-200 dark:from-blue-600/30 dark:to-blue-500/30 rounded-lg p-3 text-center border border-blue-300 dark:border-blue-600/50">
                                    <div class="font-bold text-blue-900 dark:text-blue-400 text-sm">≥ 60</div>
                                    <div class="font-semibold text-blue-800 dark:text-blue-500 text-xs">Elite</div>
                                </div>
                                <div class="bg-gradient-to-r from-green-400 to-green-200 dark:from-green-600/30 dark:to-green-500/30 rounded-lg p-3 text-center border border-green-300 dark:border-green-600/50">
                                    <div class="font-bold text-green-900 dark:text-green-400 text-sm">40 - 59</div>
                                    <div class="font-semibold text-green-800 dark:text-green-500 text-xs">Successfully Completed</div>
                                </div>
                            </div>
                            <p class="text-purple-700 dark:text-purple-400 text-[10px] italic text-center">Note: Final Score = Internal Marks (25%) + Theory Exam (75%)</p>
                        </div>
                    </div>
                    ` : ''}

                </div>
            </div>
        `;
    }

    html += `
        <div class="mt-8 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-yellow-800 dark:text-yellow-400 mb-2 flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                About Internal Marks
            </h3>
            <ul class="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300/90 text-sm">
                <li>Internal marks contribute 25% to your final NPTEL score</li>
                <li>Best 8 assignment scores out of 12 are considered</li>
                <li>Minimum 10/25 required in internal marks for certificate eligibility</li>
                <li>Assignments include all types: quizzes, programming, essays, etc.</li>
                <li>Each assignment is scored out of 100</li>
                <li><strong class="dark:text-yellow-200">Certificate requires both: Internal Marks ≥10/25 and Theory Exam ≥30/75</strong></li>
            </ul>
        </div>
    `;

    return html;
}