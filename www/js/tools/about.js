// ================= ABOUT & SYSTEM VIEWS =================
// Dedicated views for About App, About AU, Development & Descriptions, and About Developer
// Developed for Annamalai University students by Amudhan Mohan (Amudhan M)

// Cache for fetched GitHub release data to minimize network requests
let _githubReleasesCache = null;

// ================= 1. ABOUT APP =================
function renderAboutApp() {
    const version = window.APP_VERSION || "1.0.18";
    return `
        <div class="space-y-4 pb-6">
            <!-- Hero Card -->
            <div class="banner-card">
                <div class="flex items-center gap-3.5 mb-3">
                    <div class="w-14 h-14 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-lg border border-white/20">
                        <img src="img/au_smart_hub.png" alt="AU Smart Hub" class="w-full h-full object-contain rounded-xl">
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <h2 class="text-xl font-black text-white tracking-tight">AU Smart Hub</h2>
                            <span class="banner-badge px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                                v${version}
                            </span>
                        </div>
                        <p class="text-xs text-sky-100/90 mt-0.5 font-medium leading-relaxed">
                            Unofficial Academic Companion for Annamalai University
                        </p>
                    </div>
                </div>
                <p class="text-xs text-slate-100/90 leading-relaxed font-normal">
                    AU Smart Hub is an independent, offline-first mobile toolkit crafted specifically for students of Annamalai University (AU). Born out of real challenges faced in university classrooms and laboratories, it streamlines GPA calculations, arrear tracking, timetable planning, and academic productivity in one fast, private app.
                </p>
                <div class="flex items-center gap-2 mt-4 pt-3 border-t border-white/15 flex-wrap">
                    <button onclick="checkForUpdates()" class="btn-tactile px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white text-[#103654] hover:bg-slate-100 flex items-center gap-1.5 transition active:scale-95 shadow">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                        <span>Check Updates</span>
                    </button>
                    <button onclick="navigate('more-tools')" class="btn-tactile px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white/15 text-white hover:bg-white/25 border border-white/20 flex items-center gap-1.5 transition active:scale-95">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        <span>Explore All Tools</span>
                    </button>
                </div>
            </div>

            <!-- Unofficial Project Notice -->
            <div class="card p-3.5 border-l-4 border-l-amber-500 bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40">
                <div class="flex items-start gap-2.5">
                    <div class="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <div>
                        <h4 class="text-xs font-bold text-amber-900 dark:text-amber-200">Independent Student Initiative</h4>
                        <p class="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                            This application is an independent open-source project developed by Amudhan Mohan (student of Annamalai University) to help fellow students. It is <strong>not</strong> an official release by Annamalai University administration.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Solved Student Problems -->
            <div class="card p-4">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </div>
                    <h3 class="text-sm font-extrabold text-slate-800 dark:text-slate-100">Why AU Smart Hub Was Built</h3>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div class="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                        <div class="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                            <svg class="text-emerald-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>Annamalai University Grading</span>
                        </div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                            Calibrated to AU's official 10-point scale (S, A, B, C, D, E, RA) with accurate arrear impact modeling and target CGPA forecaster.
                        </p>
                    </div>

                    <div class="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                        <div class="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                            <svg class="text-sky-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>Engineering & Lab Tools</span>
                        </div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                            Built-in 50-key scientific calculator with Web Audio sound feedback, and CO-PO attainment calculator for NBA compliance.
                        </p>
                    </div>

                    <div class="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                        <div class="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                            <svg class="text-indigo-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>Daily Academic Schedule</span>
                        </div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                            Interactive department timetable with automatic live day highlighting, assignment countdowns, and quick note editor.
                        </p>
                    </div>

                    <div class="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                        <div class="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                            <svg class="text-purple-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>NPTEL Online Calculator</span>
                        </div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                            Easily compute 25% assignment score and 75% proctored exam weightages for NPTEL/SWAYAM certification courses.
                        </p>
                    </div>
                </div>
            </div>

            <!-- 100% Privacy Guarantee -->
            <div class="card p-4 border-l-4 border-l-emerald-500">
                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <div>
                        <h4 class="text-sm font-extrabold text-slate-800 dark:text-slate-100">Zero Cloud Storage · 100% On-Device Privacy</h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Your grades, timetable, profiles, and notes are never transmitted over the internet. Everything is safely preserved inside your device's sandboxed local storage without tracking, analytics, or advertisements.
                        </p>
                    </div>
                </div>
            </div>

            <!-- App Meta Details -->
            <div class="card p-4">
                <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Technical Specifications</h4>
                <div class="space-y-2 text-xs">
                    <div class="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                        <span class="text-slate-500 dark:text-slate-400">Application Name</span>
                        <span class="font-bold text-slate-800 dark:text-slate-200">AU Smart Hub</span>
                    </div>
                    <div class="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                        <span class="text-slate-500 dark:text-slate-400">Package Identifier</span>
                        <span class="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">com.aucse.smarthub</span>
                    </div>
                    <div class="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                        <span class="text-slate-500 dark:text-slate-400">Target University</span>
                        <span class="font-bold text-slate-800 dark:text-slate-200">Annamalai University (AU)</span>
                    </div>
                    <div class="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                        <span class="text-slate-500 dark:text-slate-400">Installed Version</span>
                        <span class="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">v${version}</span>
                    </div>
                    <div class="flex items-center justify-between py-1.5">
                        <span class="text-slate-500 dark:text-slate-400">Mobile Architecture</span>
                        <span class="font-bold text-slate-800 dark:text-slate-200">Cordova + Vanilla JavaScript Engine</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ================= 2. ABOUT AU (ANNAMALAI UNIVERSITY) =================
function renderAboutAU() {
    const AU_FACULTIES = [
        {
            num: 1,
            name: "FACULTY OF ARTS",
            est: "Est. 1929",
            desc: "One of the founding faculties of Annamalai University, offering comprehensive undergraduate, postgraduate, and doctoral research programs across humanities, social sciences, management, and commerce.",
            departments: [
                "English",
                "History",
                "Political Science and Public Administration",
                "Economics",
                "Commerce",
                "Sociology and Social Work",
                "Population Studies",
                "Business Administration",
                "Library and Information Science",
                "Philosophy",
                "Centre for Rural Development"
            ]
        },
        {
            num: 2,
            name: "FACULTY OF SCIENCE",
            est: "Est. 1929",
            desc: "A premier postgraduate science and research hub equipped with advanced DST-FIST, PURSE, and UGC-SAP instrumentation facilities across physical, mathematical, and biological sciences.",
            departments: [
                "Mathematics",
                "Statistics",
                "Physics",
                "Chemistry",
                "Botany",
                "Zoology",
                "Biochemistry and Biotechnology",
                "Earth Sciences",
                "Microbiology",
                "Computer and Information Science"
            ]
        },
        {
            num: 3,
            name: "FACULTY OF MARINE SCIENCES",
            est: "Est. 1961 (CAS 1963)",
            desc: "Situated along the Vellar Estuary in Parangipettai (Porto Novo). Centered around the prestigious Centre of Advanced Study (CAS) in Marine Biology, a globally acclaimed institute for estuarine, coastal biodiversity, mangrove, and marine biotechnology research.",
            departments: [
                "Centre of Advanced Study in Marine Biology"
            ]
        },
        {
            num: 4,
            name: "FACULTY OF INDIAN LANGUAGES",
            est: "Est. 1953",
            desc: "An internationally distinguished academic center dedicated to Dravidian linguistics, classical Tamil Sangam literature, epigraphy, comparative philology, and Indian languages.",
            departments: [
                "Tamil Studies And Research",
                "Centre of Advanced Study in Linguistics",
                "Hindi"
            ]
        },
        {
            num: 5,
            name: "FACULTY OF ENGINEERING & TECHNOLOGY",
            est: "Est. 1945",
            desc: "Widely recognized as FEAT, it is one of South India's historic centers of engineering education, fostering rigorous laboratory training, advanced computational systems, and vocational skill centers.",
            departments: [
                "Chemical Engineering",
                "Civil Engineering",
                "Civil and Structural Engineering",
                "Computer Science and Engineering",
                "Electrical Engineering",
                "Electronics and Communication Engineering",
                "Electronics and Instrumentation Engineering",
                "Information Technology",
                "Mechanical Engineering",
                "Manufacturing Engineering",
                "Pharmacy",
                "Engineering English",
                "Engineering Mathematics",
                "Engineering Physics",
                "Engineering Chemistry",
                "Diploma in Mining",
                "Centre for Skill Development"
            ]
        },
        {
            num: 6,
            name: "FACULTY OF EDUCATION",
            est: "Est. 1953",
            desc: "Pioneers teacher education, educational research, psychological counseling, athletic training, and scientific yogic research across Tamil Nadu.",
            departments: [
                "Education",
                "Psychology",
                "Physical Education",
                "Sports Sciences",
                "Centre for Yoga Studies"
            ]
        },
        {
            num: 7,
            name: "FACULTY OF FINE ARTS",
            est: "Est. 1953",
            desc: "Rooted in the historic Rajah Annamalai Music College founded in 1929, this faculty preserves and imparts classical South Indian Carnatic vocal and instrumental music, percussion, and classical dance traditions.",
            departments: [
                "Music"
            ]
        },
        {
            num: 8,
            name: "FACULTY OF AGRICULTURE",
            est: "Est. 1958",
            desc: "One of the premier agricultural faculties in Tamil Nadu, operating an expansive 200+ acre experimental research farm dedicated to sustainable crop agronomy, horticulture, soil sciences, animal husbandry, and rural extension.",
            departments: [
                "Agricultural Economics",
                "Agricultural Extension",
                "Agricultural Microbiology",
                "Agronomy",
                "Division of Animal Husbandry",
                "Entomology",
                "Genetics and Plant Breeding",
                "Horticulture",
                "Plant Pathology",
                "Soil Science And Agricultural Chemistry"
            ]
        },
        {
            num: 9,
            name: "FACULTY OF MEDICINE",
            est: "Est. 1985",
            isGovtUndertaking: true,
            status: "Undertaken by Govt. of Tamil Nadu (2021)",
            desc: "Established in 1985 under the Rajah Muthiah Institute of Health Sciences (1980), encompassing the 1,400-bed Rajah Muthiah Medical College & Hospital (RMMC&H) and Rani Meyyammai College of Nursing. In January 2021, the entire medical complex was officially taken over by the Government of Tamil Nadu, renamed as Government Medical College, Cuddalore, and placed under the direct governance of the Department of Health and Family Welfare (affiliated with The Tamil Nadu Dr. M.G.R. Medical University).",
            departments: [
                "Government Medical College, Cuddalore (formerly RMMC)",
                "Rani Meyyammai College of Nursing",
                "Division of Physical Medicine and Rehabilitation"
            ]
        },
        {
            num: 10,
            name: "FACULTY OF DENTISTRY",
            est: "Est. 1980",
            isGovtUndertaking: true,
            status: "Undertaken by Govt. of Tamil Nadu (2021)",
            desc: "Founded in 1980 as the Rajah Muthiah Dental College and Hospital (RMDCH) providing specialized dental surgery education (BDS, MDS). In January 2021, the dental college was undertaken alongside the medical college by the Government of Tamil Nadu and renamed as Government Dental College, Cuddalore, functioning as a premier state government dental healthcare and research institution.",
            departments: [
                "Government Dental College, Cuddalore (formerly RMDCH)",
                "Oral and Maxillofacial Surgery",
                "Periodontics",
                "Orthodontics",
                "Prosthodontics",
                "Conservative Dentistry and Endodontics"
            ]
        }
    ];

    return `
        <div class="space-y-4 pb-6">
            <!-- Official Annamalai University Insignia Hero Banner -->
            <div class="au-official-insignia-card px-2.5 py-4 sm:p-5 rounded-2xl text-white relative overflow-hidden select-none">
                <!-- Radial glow behind central crest -->
                <div class="absolute top-12 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-sky-500/15 rounded-full blur-2xl pointer-events-none"></div>

                <!-- Insignia Row: Left Text — Crest — Right Text (Tightly Grouped & Centered) -->
                <div class="relative z-10 au-insignia-row pt-1 pb-2">
                    <!-- Left Side: Tamil + Old English (Right-Aligned) -->
                    <div class="au-insignia-side left">
                        <div class="au-insignia-tamil-text" lang="ta">
                            அண்ணாமலைப்
                        </div>
                        <div class="au-insignia-english-text">
                            Annamalai
                        </div>
                    </div>

                    <!-- Center Crest / Logo -->
                    <div class="au-insignia-logo-wrap">
                        <img src="img/au_logo.png" alt="Annamalai University Crest">
                    </div>

                    <!-- Right Side: Tamil + Old English (Left-Aligned) -->
                    <div class="au-insignia-side right">
                        <div class="au-insignia-tamil-text" lang="ta">
                            பல்கலைக்கழகம்
                        </div>
                        <div class="au-insignia-english-text">
                            University
                        </div>
                    </div>
                </div>

                <!-- Subtitle: NAAC Accreditation & Campus Location -->
                <div class="text-center pt-2.5 border-t border-white/15 relative z-10">
                    <p class="text-[10px] sm:text-xs text-sky-200/95 font-medium tracking-tight">
                        (A State University Accredited With &lsquo;A<sup class="text-[8px] sm:text-[9px] font-bold text-amber-300">+</sup>&rsquo; Grade By NAAC)
                    </p>
                    <p class="text-[9px] sm:text-[10px] text-slate-300/80 mt-0.5 tracking-wider uppercase font-semibold">
                        Annamalainagar — 608 002, Tamil Nadu, India
                    </p>
                </div>

                <!-- University Motto Ribbon -->
                <div class="mt-3 p-2 rounded-xl bg-white/[0.06] border border-white/10 text-[11px] sm:text-xs text-white/95 font-medium flex items-center justify-center text-center gap-1.5 flex-wrap relative z-10">
                    <span class="font-bold text-amber-300">University Motto:</span>
                    <span class="font-semibold text-white">"With Courage and Faith"</span>
                    <span class="text-sky-300 font-tamil font-semibold" lang="ta">(துணிவும் நம்பிக்கையும்)</span>
                </div>

                <!-- University History Summary Paragraph -->
                <p class="text-xs text-slate-200/90 mt-3 leading-relaxed text-justify relative z-10">
                    Founded in 1929 by the visionary philanthropist Dr. Rajah Sir S. R. M. Annamalai Chettiar, Annamalai University is one of Asia's largest unitary, teaching, and residential public universities. Spanning nearly 1,500+ acres in the temple city of Chidambaram, Tamil Nadu, the university has been accredited with an 'A+' Grade by NAAC (National Assessment and Accreditation Council). It serves as a venerable center of higher learning, research, and cultural preservation across diverse fields of human endeavor.
                </p>
            </div>

            <!-- Disclaimer Notice -->
            <div class="card p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400">
                <p class="leading-relaxed">
                    <strong class="text-slate-800 dark:text-slate-200">Disclaimer:</strong> AU Smart Hub is an independent, student-led open-source project created by Mohan. It is not an official application of Annamalai University and has no official administrative endorsement.
                </p>
            </div>

            <!-- Official Grading System (From CGPA Tools) -->
            <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <h3 class="text-sm font-extrabold text-slate-800 dark:text-slate-100">Annamalai University 10-Point Grading Scale</h3>
                        <p class="text-[11px] text-slate-400 mt-0.5">As calibrated in the AU Smart Hub CGPA Calculator</p>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        Official AU Scale
                    </span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div class="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 flex items-center justify-between">
                        <div>
                            <span class="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">S</span>
                            <div class="text-[10px] text-slate-500 dark:text-slate-400">Outstanding</div>
                        </div>
                        <div class="text-right">
                            <span class="font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">10 GP</span>
                            <div class="text-[9px] text-slate-400">90 – 100</div>
                        </div>
                    </div>

                    <div class="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 flex items-center justify-between">
                        <div>
                            <span class="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">A</span>
                            <div class="text-[10px] text-slate-500 dark:text-slate-400">Excellent</div>
                        </div>
                        <div class="text-right">
                            <span class="font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">9 GP</span>
                            <div class="text-[9px] text-slate-400">80 – 89</div>
                        </div>
                    </div>

                    <div class="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 flex items-center justify-between">
                        <div>
                            <span class="font-black text-sm text-blue-600 dark:text-blue-400 font-mono">B</span>
                            <div class="text-[10px] text-slate-500 dark:text-slate-400">Very Good</div>
                        </div>
                        <div class="text-right">
                            <span class="font-extrabold text-blue-700 dark:text-blue-300 font-mono">8 GP</span>
                            <div class="text-[9px] text-slate-400">70 – 79</div>
                        </div>
                    </div>

                    <div class="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 flex items-center justify-between">
                        <div>
                            <span class="font-black text-sm text-blue-600 dark:text-blue-400 font-mono">C</span>
                            <div class="text-[10px] text-slate-500 dark:text-slate-400">Good</div>
                        </div>
                        <div class="text-right">
                            <span class="font-extrabold text-blue-700 dark:text-blue-300 font-mono">7 GP</span>
                            <div class="text-[9px] text-slate-400">60 – 69</div>
                        </div>
                    </div>

                    <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <div>
                            <span class="font-black text-sm text-slate-700 dark:text-slate-300 font-mono">D</span>
                            <div class="text-[10px] text-slate-400">Average</div>
                        </div>
                        <div class="text-right">
                            <span class="font-extrabold text-slate-700 dark:text-slate-300 font-mono">6 GP</span>
                            <div class="text-[9px] text-slate-400">55 – 59</div>
                        </div>
                    </div>

                    <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <div>
                            <span class="font-black text-sm text-slate-700 dark:text-slate-300 font-mono">E</span>
                            <div class="text-[10px] text-slate-400">Pass</div>
                        </div>
                        <div class="text-right">
                            <span class="font-extrabold text-slate-700 dark:text-slate-300 font-mono">5 GP</span>
                            <div class="text-[9px] text-slate-400">50 – 54</div>
                        </div>
                    </div>

                    <div class="p-2.5 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30 col-span-2 sm:col-span-3 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="font-black text-sm text-red-600 dark:text-red-400 font-mono">RA</span>
                            <div>
                                <span class="text-xs font-bold text-red-700 dark:text-red-300">Re-Appear (Arrear)</span>
                                <div class="text-[10px] text-red-500/80">Withholds semester GPA until cleared in supplementary examination</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="font-extrabold text-red-600 dark:text-red-400 font-mono">0 GP</span>
                        </div>
                    </div>
                </div>

                <div class="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div class="font-bold text-slate-800 dark:text-slate-200">How GPA & CGPA Are Calculated:</div>
                    <div class="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                        GPA = Σ(Course Credits × Grade Points) / Σ(Course Credits)
                    </div>
                    <p class="text-[11px] leading-relaxed">
                        Under official university regulations, obtaining an <strong>RA (Re-Appear / Arrear)</strong> grade in any registered course withholds the semester GPA until the subject is successfully cleared in subsequent examinations. The CGPA calculator faithfully models this rule.
                    </p>
                </div>
            </div>

            <!-- Faculties of Annamalai University (Exact Ordered List) -->
            <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <h3 class="text-sm font-extrabold text-slate-800 dark:text-slate-100">Faculties of Annamalai University</h3>
                        <p class="text-[11px] text-slate-400 mt-0.5">10 Statutory Faculties • 8 Academic Faculties + 2 State Govt Undertaken</p>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        10 Faculties
                    </span>
                </div>

                <div class="space-y-3">
                    ${AU_FACULTIES.map(fac => `
                        <div class="p-3.5 rounded-xl ${fac.isGovtUndertaking ? 'bg-amber-50/40 dark:bg-amber-950/15 border border-amber-300/60 dark:border-amber-500/25 shadow-sm' : 'bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10'} hover:border-blue-500/40 transition">
                            <div class="flex items-start justify-between gap-2 mb-1.5">
                                <div class="flex items-center gap-2.5">
                                    <span class="faculty-num-badge ${fac.isGovtUndertaking ? 'govt' : ''}" style="${fac.isGovtUndertaking ? 'background-color:#d97706!important;color:#ffffff!important;' : 'background-color:#2563eb!important;color:#ffffff!important;'}">
                                        ${fac.num}
                                    </span>
                                    <h4 class="text-xs font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
                                        ${fac.name}
                                    </h4>
                                </div>
                                <div class="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                                    ${fac.isGovtUndertaking ? `
                                        <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300/50">
                                            TN Govt Undertaking
                                        </span>
                                    ` : `
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30">
                                            ${fac.departments.length} Dept${fac.departments.length > 1 ? 's' : ''}
                                        </span>
                                    `}
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        ${fac.est}
                                    </span>
                                </div>
                            </div>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pl-9">
                                ${fac.desc}
                            </p>
                            ${fac.isGovtUndertaking ? `
                                <div class="mt-2.5 ml-9 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                                    <strong class="font-bold">Government of Tamil Nadu Undertaking:</strong> In January 2021, the Government of Tamil Nadu officially took over this institution from Annamalai University and transferred it to the Department of Health and Family Welfare as <em>${fac.name === 'FACULTY OF MEDICINE' ? 'Government Medical College, Cuddalore' : 'Government Dental College, Cuddalore'}</em>.
                                </div>
                            ` : ''}
                            <div class="mt-2 pl-9 flex flex-wrap gap-1.5">
                                ${fac.departments.map(dept => `
                                    <span class="text-[10px] font-medium px-2 py-0.5 rounded-md ${fac.isGovtUndertaking ? 'bg-amber-100/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200/70 dark:border-amber-900/40' : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10'}">
                                        ${dept}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Vision Mission Quick Link -->
            <div onclick="navigate('visionmission')" class="card card-interactive p-3.5 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </div>
                    <div>
                        <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Department Vision & Mission</div>
                        <p class="text-[11px] text-slate-400">View official department statements from FEAT</p>
                    </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-400"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
        </div>
    `;
}

// ================= 3. DEVELOPMENT & VERSIONs(WITH LIVE GITHUB RELEASES) =================
function renderDevInfo() {
    const localVersion = window.APP_VERSION || "1.0.18";
    // Trigger async fetch of live GitHub releases
    setTimeout(() => fetchAndRenderGitHubReleases(), 50);

    return `
        <div class="space-y-4 pb-6">
            <!-- Hero Card -->
            <div class="banner-card">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-[10px] font-mono uppercase tracking-widest text-sky-200 font-extrabold">Build & System Architecture</span>
                    <span class="banner-badge px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                        v${localVersion} (Installed)
                    </span>
                </div>
                <h2 class="text-lg font-black text-white tracking-tight">Development & Versions</h2>
                <p class="text-xs text-slate-100/90 mt-1 leading-relaxed">
                    Live release metrics from GitHub, architecture descriptions, and compilation specifications.
                </p>
            </div>

            <!-- Dynamic GitHub Releases Container -->
            <div id="github-releases-container" class="space-y-4">
                <div class="card p-5 text-center">
                    <div class="w-8 h-8 mx-auto mb-2.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div class="text-xs font-bold text-slate-700 dark:text-slate-200">Fetching Live Release from GitHub...</div>
                    <p class="text-[11px] text-slate-400 mt-0.5">Connecting to api.github.com/repos/amudhan-mohan/ausmarthub</p>
                </div>
            </div>

            <!-- Engineering Architecture Descriptions -->
            <div class="card p-4">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
                    </div>
                    <h3 class="text-sm font-extrabold text-slate-800 dark:text-slate-100">Application Architecture</h3>
                </div>

                <div class="space-y-3 text-xs">
                    <div class="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                        <div class="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span>Vanilla JS Micro-Kernel Router</span>
                        </div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            No bulky JavaScript frameworks (no React/Vue overhead). Pure direct DOM manipulation and custom history stack ensuring instant screen transitions and zero lag even on entry-level Android smartphones.
                        </p>
                    </div>

                    <div class="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                        <div class="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Single Source of Truth Build Hook</span>
                        </div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            The project version is managed in <code class="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">config.xml</code>. An automated Cordova hook (<code class="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">inject_version.js</code>) dynamically generates <code class="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">app-version.js</code> during prepare to eliminate version sync issues.
                        </p>
                    </div>

                    <div class="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                        <div class="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span>Low-Latency Web Audio API Engine</span>
                        </div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Real-time digital synthesis for calculator key feedback using oscillator nodes and linear ramp envelopes. Zero external audio file assets required, keeping the APK footprint featherweight.
                        </p>
                    </div>

                    <div class="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                        <div class="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                            <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                            <span>In-App Streaming Binary Installer</span>
                        </div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            XHR binary blob streaming with percentage progress bars. Directly downloads new APK releases from GitHub and launches Android's native package installer intent via Cordova file providers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Format raw GitHub release Markdown cleanly into styled HTML elements
function formatReleaseMarkdown(md) {
    if (!md || !md.trim()) {
        return '<p class="text-xs text-slate-400 py-2">No release notes provided for this release.</p>';
    }

    const lines = md.split(/\r?\n/);
    let html = '';
    let inList = false;

    function inlineMD(str) {
        return str
            .replace(/\*\*\*(.*?)\*\*\*/g, (m, p1) => `<strong><em>${p1.trim()}</em></strong>`)
            .replace(/\*\*(.*?)\*\*/g, (m, p1) => `<strong>${p1.trim()}</strong>`)
            .replace(/__(.*?)__/g, (m, p1) => `<strong>${p1.trim()}</strong>`)
            .replace(/\*(.*?)\*/g, (m, p1) => `<em>${p1.trim()}</em>`)
            .replace(/_((?!_).*?)_/g, (m, p1) => `<em>${p1.trim()}</em>`)
            .replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-800 text-[10px] px-1 py-0.5 rounded font-mono text-blue-600 dark:text-blue-400">$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 dark:text-blue-400 underline font-medium">$1</a>');
    }

    function closeList() {
        if (inList) {
            html += '</ul>';
            inList = false;
        }
    }

    for (let raw of lines) {
        // Strip raw emojis, pictographs, symbols and variation selectors to strictly uphold zero-emoji rule
        const clean = raw.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{FE00}-\u{FE0F}\u{200D}]/gu, '');
        const trimmed = clean.replace(/[ \t]{2,}/g, ' ').trim();
        if (!trimmed) {
            closeList();
            continue;
        }

        // Horizontal Rule (--- or ***)
        if (/^---+$|^\*\*\*+$/.test(trimmed)) {
            closeList();
            html += '<hr class="my-3 border-t border-slate-200 dark:border-white/10">';
            continue;
        }

        // H1 Heading (# Heading)
        if (/^#\s+/.test(trimmed)) {
            closeList();
            const text = inlineMD(trimmed.replace(/^#\s+/, '').trim());
            html += `<div class="mt-3.5 mb-2 pb-1.5 border-b border-slate-200/80 dark:border-white/10"><h3 class="text-sm font-black text-blue-600 dark:text-blue-400 tracking-tight">${text}</h3></div>`;
            continue;
        }

        // H2 Heading (## Heading)
        if (/^##\s+/.test(trimmed)) {
            closeList();
            const text = inlineMD(trimmed.replace(/^##\s+/, '').trim());
            html += `<h4 class="text-xs font-bold text-sky-600 dark:text-sky-300 mt-3 mb-1.5 tracking-tight flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span><span>${text}</span></h4>`;
            continue;
        }

        // H3+ Heading (### Heading)
        if (/^###+\s+/.test(trimmed)) {
            closeList();
            const text = inlineMD(trimmed.replace(/^###+\s+/, '').trim());
            html += `<h5 class="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mt-2.5 mb-1">${text}</h5>`;
            continue;
        }

        // Blockquote (> Quote / Note)
        if (/^>\s*/.test(trimmed)) {
            closeList();
            const text = inlineMD(trimmed.replace(/^>\s*/, '').trim());
            html += `<div class="my-2.5 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border-l-4 border-blue-500 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">${text}</div>`;
            continue;
        }

        // Nested List Item (indented with 2+ spaces or tabs before - * +)
        if (/^(\s{2,}|\t)[-*+]\s+/.test(clean)) {
            if (!inList) { html += '<ul class="space-y-1.5 my-2 pl-0">'; inList = true; }
            const text = inlineMD(trimmed.replace(/^[-*+]\s+/, '').trim());
            html += `<li class="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 pl-4 py-0.5 leading-relaxed"><span class="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0 mt-1.5"></span><span>${text}</span></li>`;
            continue;
        }

        // Top-level List Item (- or * or +)
        if (/^[-*+]\s+/.test(trimmed)) {
            if (!inList) { html += '<ul class="space-y-1.5 my-2 pl-0">'; inList = true; }
            const text = inlineMD(trimmed.replace(/^[-*+]\s+/, '').trim());
            html += `<li class="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-200 py-0.5 leading-relaxed"><span class="text-blue-500 font-bold shrink-0 mt-0.5">›</span><span>${text}</span></li>`;
            continue;
        }

        // Numbered List (1. Item)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
            if (!inList) { html += '<ul class="space-y-1.5 my-2 pl-0">'; inList = true; }
            const text = inlineMD(numMatch[2].trim());
            html += `<li class="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200 py-0.5 leading-relaxed"><span class="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">${numMatch[1]}</span><span>${text}</span></li>`;
            continue;
        }

        // Normal Paragraph
        closeList();
        const text = inlineMD(trimmed);
        html += `<p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">${text}</p>`;
    }

    closeList();
    return html;
}

// Fetch GitHub Releases and render into the dev-info view
async function fetchAndRenderGitHubReleases() {
    const container = document.getElementById("github-releases-container");
    if (!container) return;

    const localVersion = (window.APP_VERSION || "1.0.18").replace(/^v/, '');
    const repo = "amudhan-mohan/ausmarthub";

    try {
        let releases = _githubReleasesCache;
        if (!releases) {
            const res = await fetch(`https://api.github.com/repos/${repo}/releases`, {
                headers: { 'Accept': 'application/vnd.github.v3+json' }
            });
            if (!res.ok) throw new Error(`GitHub API returned status ${res.status}`);
            releases = await res.json();
            _githubReleasesCache = releases;
        }

        if (!Array.isArray(releases) || releases.length === 0) {
            throw new Error("No releases found on GitHub repository");
        }

        const latest = releases[0];
        const latestTag = latest.tag_name ? latest.tag_name.replace(/^v/, '') : localVersion;
        const isUpToDate = !isNewerVersion(localVersion, latestTag);

        // Find APK asset
        let apkAsset = null;
        if (latest.assets && latest.assets.length > 0) {
            apkAsset = latest.assets.find(a => a.name.toLowerCase().endsWith('.apk'));
        }

        const apkSizeMB = apkAsset ? (apkAsset.size / (1024 * 1024)).toFixed(1) + " MB" : "N/A";
        const totalDl = apkAsset ? apkAsset.download_count : 0;
        const pubDate = latest.published_at ? new Date(latest.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "Recent";

        container.innerHTML = `
            <!-- Live GitHub Release Summary Card -->
            <div class="card p-4 border border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/60 to-white dark:from-blue-950/20 dark:to-slate-900">
                <div class="flex items-center justify-between gap-2 mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </div>
                        <div>
                            <h3 class="text-sm font-extrabold text-slate-800 dark:text-slate-100">GitHub Live Release</h3>
                            <span class="text-[10px] text-slate-400">Published: ${pubDate}</span>
                        </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold font-mono ${isUpToDate ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300/40' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-300/40'}">
                        ${isUpToDate ? 'Up to date' : 'Update Available'}
                    </span>
                </div>

                <div class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 mb-1">
                    ${latest.name || latest.tag_name}
                </div>

                <!-- Metrics Grid -->
                <div class="grid grid-cols-3 gap-2 my-3 text-center">
                    <div class="p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-white/5">
                        <div class="text-[10px] text-slate-400 font-medium">Tag Version</div>
                        <div class="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">${latest.tag_name}</div>
                    </div>
                    <div class="p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-white/5">
                        <div class="text-[10px] text-slate-400 font-medium">APK Size</div>
                        <div class="font-mono text-xs font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">${apkSizeMB}</div>
                    </div>
                    <div class="p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-white/5">
                        <div class="text-[10px] text-slate-400 font-medium">Downloads</div>
                        <div class="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">${totalDl}</div>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <button onclick="window.open('${latest.html_url}', '_system')" class="btn-tactile flex-1 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1.5 transition active:scale-95 shadow">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                        <span>View on GitHub</span>
                    </button>
                    ${apkAsset ? `
                        <button onclick="window.open('${apkAsset.browser_download_url}', '_system')" class="btn-tactile px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition active:scale-95 border border-slate-200 dark:border-slate-700">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>Download APK</span>
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- Real Release Changelog Body (Cleanly Formatted Without Emojis) -->
            <div class="card p-4">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Release Notes (v${latestTag})</h3>
                    <span class="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Official GitHub Notes</span>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 max-h-80 overflow-y-auto custom-scrollbar">
                    ${formatReleaseMarkdown(latest.body)}
                </div>
            </div>

            <!-- Historical Releases Timeline -->
            <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">All Published Releases</h3>
                    <span class="text-[10px] font-bold text-slate-400">${releases.length} Releases</span>
                </div>
                <div class="space-y-2.5 text-xs">
                    ${releases.map((rel, i) => {
            const date = rel.published_at ? new Date(rel.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
            const tag = rel.tag_name || '';
            const isCurrent = tag.replace(/^v/, '') === localVersion;
            return `
                            <div class="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                                <div class="min-w-0">
                                    <div class="flex items-center gap-2">
                                        <span class="font-mono font-bold text-slate-800 dark:text-slate-200">${tag}</span>
                                        ${isCurrent ? '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">Installed</span>' : ''}
                                        ${i === 0 ? '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">Latest</span>' : ''}
                                    </div>
                                    <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">${rel.name || 'Release ' + tag}</p>
                                </div>
                                <div class="text-right shrink-0">
                                    <div class="text-[10px] text-slate-400">${date}</div>
                                    <button onclick="window.open('${rel.html_url}', '_system')" class="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline mt-0.5 block">View Notes ›</button>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    } catch (err) {
        console.warn("Could not fetch GitHub releases:", err);
        container.innerHTML = `
            <div class="card p-4 border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20">
                <div class="flex items-start gap-2.5">
                    <div class="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <div class="flex-1">
                        <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200">Could Not Connect to GitHub API</h4>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Connect to the internet to load live release metadata and download metrics from GitHub.
                        </p>
                        <button onclick="fetchAndRenderGitHubReleases()" class="mt-2.5 px-3 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 transition">
                            Retry Fetching
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// ================= 4. ABOUT DEVELOPER =================
function renderAboutDev() {
    return `
        <div class="space-y-4 pb-6">
            <!-- Hero Developer Card -->
            <div class="banner-card">
                <div class="flex items-center gap-3.5 mb-3">
                    <div class="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow backdrop-blur-md">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <h2 class="text-xl font-black text-white tracking-tight">Amudhan Mohan</h2>
                            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-200 border border-blue-300/30 font-bold">
                                Amudhan M
                            </span>
                        </div>
                        <p class="text-xs text-sky-200 font-semibold mt-0.5">Attendent at Annamalai University</p>
                        <p class="text-[11px] text-slate-200/80 font-mono mt-0.5">hello@amudhanmohan.in</p>
                    </div>
                </div>
                <p class="text-xs text-slate-100/90 leading-relaxed font-normal">
                    Built by Amudhan Mohan with deep dedication for Annamalai University students. Driven by the mission of removing academic friction, automating grade calculations, and providing students with modern, ad-free tools built around their actual university syllabus.
                </p>
                <div class="flex items-center gap-2 mt-4 pt-3 border-t border-white/15 flex-wrap">
                    <button onclick="window.open('https://github.com/amudhan-mohan/ausmarthub', '_system')" class="btn-tactile px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white text-[#103654] hover:bg-slate-100 flex items-center gap-1.5 transition active:scale-95 shadow">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                        <span>GitHub Repo</span>
                    </button>
                    <button onclick="window.open('https://amudhanmohan.in', '_system')" class="btn-tactile px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white/15 text-white hover:bg-white/25 border border-white/20 flex items-center gap-1.5 transition active:scale-95">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        <span>Website</span>
                    </button>
                </div>
            </div>

            <!-- The Student Problem Amudhan Mohan Solved -->
            <div class="card p-4">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-7 h-7 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <h3 class="text-sm font-extrabold text-slate-800 dark:text-slate-100">Why I Built This App for AU Students</h3>
                </div>

                <div class="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <p>
                        "As a student at Annamalai University, I saw firsthand the real struggles my peers and I faced each semester: calculating complex SGPA and cumulative CGPA across various subject credits, figuring out how an arrear impacts total GPA, manually drafting CO-PO matrices for engineering labs, and having no clean, offline schedule manager."
                    </p>
                    <p>
                        "Rather than waiting for a third-party solution or dealing with bloated websites filled with intrusive advertisements, I created <strong>AU Smart Hub</strong> from scratch. Every feature in this app was built to solve a concrete problem experienced right here on campus."
                    </p>
                </div>
            </div>

            <!-- Feedback & Collaboration -->
            <div class="card p-4">
                <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Get in Touch</h4>
                <div class="space-y-2">
                    <button onclick="window.open('https://github.com/amudhan-mohan/ausmarthub/issues', '_system')" class="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-white/[0.06] transition">
                        <div class="flex items-center gap-2.5">
                            <div class="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            </div>
                            <div>
                                <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Report a Bug / Request a Feature</div>
                                <div class="text-[11px] text-slate-400">Open an issue on GitHub Tracker</div>
                            </div>
                        </div>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-400"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>

                    <button onclick="window.open('mailto:hello@amudhanmohan.in?subject=AU%20Smart%20Hub%20Feedback', '_system')" class="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-white/[0.06] transition">
                        <div class="flex items-center gap-2.5">
                            <div class="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            </div>
                            <div>
                                <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Send Direct Feedback</div>
                                <div class="text-[11px] text-slate-400">hello@amudhanmohan.in</div>
                            </div>
                        </div>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-400"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
            </div>

            <!-- Footer Badge -->
            <div class="text-center py-2">
                <p class="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
                    <span>Crafted by Amudhan Mohan for Annamalai University Students</span>
                </p>
            </div>
        </div>
    `;
}
