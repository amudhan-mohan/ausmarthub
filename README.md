<div align="center">

  <img src="www/img/au_smart_hub.png" alt="AU Smart Hub Logo" width="96" height="96" style="border-radius: 22px;">

  # AU Smart Hub

  ### An All-in-One Academic Productivity Suite for Annamalai University Students

  [![Platform](https://img.shields.io/badge/Platform-Android_13--16_(API_35)-3DDC84?style=flat-square&logo=android&logoColor=white)](https://github.com/amudhan-mohan/ausmarthub)
  [![Cordova](https://img.shields.io/badge/Cordova--Android-15.1.0-E6E6E6?style=flat-square&logo=apachecordova&logoColor=black)](https://cordova.apache.org/)
  [![Version](https://img.shields.io/badge/Version-v1.0.18-blue?style=flat-square)](https://github.com/amudhan-mohan/ausmarthub/releases)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.2-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📖 About The Project

**AU Smart Hub** is an offline-ready, high-performance academic productivity application designed specifically to empower students at **Annamalai University (Chidambaram)**. Powered by the **Apache Cordova Android 15.1.0** engine, a modular Vanilla JavaScript architecture, and styled with Tailwind CSS, the application consolidates semester GPA calculations, predictive goal setting, NPTEL course tracking, class timetables, smart notes, engineering calculators, and institutional information into a unified, glassmorphism-styled mobile experience with a GPU-accelerated motion system.

---

## ✨ Key Features & Academic Modules

### 🎓 CGPA & Performance Suite
- **Multi-Profile CGPA Tracker:** Manage multiple student profiles, enter semester grades based on official Annamalai University regulations (`S`, `A`, `B`, `C`, `D`, `E`, `RA`), and visualize academic trajectory with interactive Chart.js trend curves.
- **Centered Profile Avatar:** Clean, mathematically centered empty-state avatar representation for student profile cards.
- **Target Goal Setter:** Predictive algorithm that calculates the exact semester GPA required across remaining semesters to attain a target graduating CGPA.
- **CO-PO Attainment Analyzer:** Evaluates Course Outcomes (CO) and Program Outcomes (PO) attainment percentages for continuous internal assessments (Mid 1 & Mid 2) with instant threshold indicators.
- **NPTEL Course Tracker:** 12-week assignment score tracker with an automatic **Top 8** selection algorithm, 25-mark internal calculation, and certificate eligibility forecaster (Elite, Silver, Gold).

---

### 🏛️ University Directory & Institutional Hub
- **WhatsApp-Style Overflow Menu:** Access dedicated fullscreen views via the 3-dot app header menu with an auto-hidden bottom navigation layout for maximum immersion.
- **About AU Guide & Crest Insignia:** Official founding history (Est. 1929 by Dr. Rajah Sir S. R. M. Annamalai Chettiar), residential campus profile, NAAC 'A+' accreditation credentials, and emblem insignia banner styled with authentic Old English blackletter and Tamil typography.
- **Statutory Faculties Directory:** Verified statutory listing of all 10 university faculties:
  1. *Faculty of Arts* (11 Departments & Centres)
  2. *Faculty of Science* (10 Departments & DST-FIST/PURSE instrumentation)
  3. *Faculty of Marine Sciences* (CAS in Marine Biology, Parangipettai)
  4. *Faculty of Indian Languages* (Tamil Studies, CAS in Linguistics, Hindi)
  5. *Faculty of Engineering & Technology (FEAT)* (17 Departments & Centres)
  6. *Faculty of Education* (5 Departments & Centres)
  7. *Faculty of Fine Arts* (Carnatic Music & Classical Dance)
  8. *Faculty of Agriculture* (10 Departments & 200+ Acre Experimental Farm)
  9. *Faculty of Medicine* (Government Medical College, Cuddalore — *TN Govt Undertaking*)
  10. *Faculty of Dentistry* (Government Dental College, Cuddalore — *TN Govt Undertaking*)
- **Vision & Mission Hub:** Official departmental educational objectives (PEOs) and program specific outcomes (PSOs) for engineering departments.
- **Live GitHub Releases:** Direct GitHub REST API integration displaying changelogs, published dates, and APK download links directly inside the app.

---

### 📅 Smart Planning & Schedule
- **Interactive Timetable:** Real-time **"Happening Now"** period detection with live minute countdowns, ambient radar ring animations, **"Up Next"** class preview, and timetable management.
- **Assignment Manager:** Due date tracking with priority tags (*Pending*, *Due Soon*, *Overdue*, *Completed*) and native background notification reminders.

---

### 📝 Smart Notes
- **Rich Markdown Journal:** Distraction-free study notes with real-time auto-save and offline persistence.
- **Productivity Toolkit:** Live word counter, character counter, Undo / Redo history stack, and One-Tap Copy to clipboard.
- **View Options:** Toggle between Card Grid and Compact List presentations.

---

### 🧮 Dual-Mode Calculator Suite
- **Quick Calculator:**
  - **12-Digit High-Precision Math Engine:** Delivers up to 12 significant digits in auto mode, eliminating premature rounding bugs (e.g. $\log_{10}(9999999999)$ displays accurately as `9.99999999996` while $\log_{10}(10000000000) = 10$) and sanitizing floating-point noise.
  - **Fluid & Boundary-Free Cursor Placement:** Geometric coordinate calculation (`getCursorIndexFromPoint`) enables full-width dragging and tapping the trailing edge to place the cursor at the end (`4369|`).
  - **Persistent Solid Teardrop Handle:** Solid, tactile teardrop drag handle remains visible and responsive during interactions while only the caret dims.
  - **Synchronized Audio & Native Android Vibration:** Integrated `cordova-plugin-vibration` with calibrated mobile pulse durations (`22ms` digits, `30ms` operators, `48ms` equals, `double buzz` error) and synchronized keypress audio.
  - **History Reel:** Real-time interactive calculation history with tap-to-recall.
- **Pro Scientific Calculator:** Full 50-button engineering layout featuring trigonometry, logarithms, powers, roots, factorials, and constants $\pi, e$ that automatically locks into landscape mode.

---

### ⏱️ Focus Timer
- **Pomodoro Study Timer:** Customizable study and break interval sessions with an animated circular SVG countdown ring and native audio/haptic interval alerts.

---

### 🌐 AU In-App Browser
- **Portal Shortcuts:** Quick access to the Annamalai University Examination Portal, DOTE, NPTEL, Swayam, and academic portals.
- **Desktop Mode Toggle:** Switch between mobile and desktop viewports on demand via the 3-dot overflow menu.

---

## 🎨 UI/UX & Design System

- **Modern Gesture Navigation (Android 13–16 & Samsung One UI):** Full edge-swipe back gesture support via AndroidX `OnBackPressedCallback`, `android:enableOnBackInvokedCallback="true"`, and history state synchronization.
- **Two-Step Android Exit Flow:** Safe, deliberate exit handling — the first back gesture shows a non-intrusive toast (*"Press back again to exit"*), and a second deliberate back swipe (>450ms debounce) presents the exit confirmation modal.
- **GPU-Accelerated Motion & Animation System (60/120 FPS):**
  - **Spring Page Transitions (`pageSlideIn`):** Silky-smooth vertical lift and micro-scale spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - **Staggered Cascading Cards (`cardCascadeIn`):** Progressive entry delays across dashboard cards and tool modules.
  - **Bottom Navigation Micro-Interactions:** Animated active indicator capsule pill (`.bottom-tab::after`), tactile icon bounce (`tabIconPop`), and active touch compression (`:active: scale(0.92)`).
  - **Ambient Hero Aura Float (`bannerAuraFloat`):** Soft radial glow floating behind the header banner.
  - **Live Academic Period Radar Ping (`liveRadarPing`):** Ambient radar indicator highlighting ongoing classes.
  - **Spring Toast System (`toastSpringUp`):** Tactile spring pop notification banners with auto-dismiss.
  - **Reduced Motion Support:** Respects system accessibility preferences via `@media (prefers-reduced-motion: reduce)`.
- **Authentic Institutional Typography:** Stately Old English blackletter typography (`OldEnglish.ttf`) and native Tamil script bindings (`TamilFont.ttf`).
- **Seamless Startup (No Cordova Logo):** Clean `#0d2540` launch screen transitioning directly into the signature HTML5 animated splash screen with pulsating rings and AU crest.
- **Zero-Emoji Vector Policy:** 100% scalable SVG vector icons across the interface for consistent display across all Android vendor skins (Samsung One UI, VIVO Funtouch OS, Xiaomi MIUI, ColorOS, Stock Android).
- **AU Brand Gradient:** Tailored deep navy to cyan gradient palette (`#0d2540` ➔ `#103654` ➔ `#1F618D` ➔ `#51A5D4`).
- **Adaptive Theming:** System-aware Dark Mode and Light Mode with calibrated contrast ratios.

---

## 🛠️ Architecture & Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Mobile Runtime** | Apache Cordova (`cordova-android@15.1.0` / API 35 Ready) | Hybrid native container & modern Android 15/16 back gesture bridge |
| **Frontend Core** | HTML5, Vanilla JavaScript (ES6+ Modular) | Lightweight, dependency-free application logic |
| **Styling & Motion** | Tailwind CSS v4 + GPU Motion System Tokens | Curated design system with glassmorphic styling & spring physics |
| **Math Engine** | 12-Significant-Digit Precision Math Engine | High-precision scientific calculations & floating-point sanitizer |
| **Charts** | Chart.js | Dynamic academic performance graphs |
| **Data Engine** | LocalStorage with JSON schema versioning | 100% offline, privacy-first local storage |
| **Native Plugins** | `vibration`, `screen-orientation`, `local-notification`, `inappbrowser`, `device` | Native OS capabilities and tactile haptics |

```
ausmarthub/
├── config.xml                  # Cordova configuration, permissions & plugins
├── package.json                # Project dependencies & build scripts
├── hooks/                      # Build automation hooks
│   └── before_prepare/inject_version.js   # Syncs version from config.xml → app-version.js
└── www/                        # Frontend application source
    ├── index.html              # Main single-page application entry point
    ├── fonts/                  # JetBrains Mono, Saira, TamilFont.ttf, and OldEnglish.ttf
    ├── img/                    # Official AU logo, app icons & splash assets
    ├── css/                    # input.css, style.css, and compiled output.css
    └── js/                     # Modular JavaScript architecture
        ├── main.js             # App bootstrap, event listeners & back handler
        ├── core/               # globals, ui, router, notifications, app-version
        └── tools/              # cgpa, timetable, notes, calculator, nptel, about, etc.
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Apache Cordova CLI (`npm install -g cordova`)
- [Android Studio](https://developer.android.com/studio) with Android SDK & Build Tools (API 33–35)

### Installation & Build

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amudhan-mohan/ausmarthub.git
   cd ausmarthub
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Compile Tailwind CSS:**
   ```bash
   npm run build:css
   ```

4. **Prepare the Android platform & plugins:**
   ```bash
   cordova prepare android
   ```

5. **Run on an Android device or emulator:**
   ```bash
   cordova run android
   ```

6. **Generate a production release APK:**
   ```bash
   cordova build android --release
   ```

---

## 📥 Downloads & Releases

Pre-compiled APK packages for Android are available on GitHub:

👉 **[Download Latest APK Release](https://github.com/amudhan-mohan/ausmarthub/releases/latest)**

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Developed with ❤️ for Annamalai University students by **[Amudhan Mohan](https://amudhanmohan.in)**.