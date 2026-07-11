# AU Smart Hub 🎓

![Platform](https://img.shields.io/badge/Platform-Android-green)
![Framework](https://img.shields.io/badge/Apache-Cordova-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Version](https://img.shields.io/badge/Version-v1.0.14-orange)

AU Smart Hub is a premium, full-scale student productivity suite designed specifically for university students. Developed using Apache Cordova and styled with a sleek Tailwind CSS aesthetic, it combines powerful academic productivity tools with native-feeling mobile components, immersive safe-area navigation, and flawless Light/Dark mode execution.

## ✨ Features

### 📅 Core Productivity & Academic Tools
* **🎓 Advanced CGPA Tracker:** Manage multiple student profiles, track semester grades, and visualize academic performance with Dynamic, theme-aware GPA trend charts.
* **📅 Smart Timetable Module:** An interactive scheduling system that tracks classes by day, automatically highlights the class currently in progress ("Happening Now") via live background loops, and showcases what is "Up Next" directly on your dashboard.
* **⏱️ Focus Timer (Pomodoro):** A beautiful, distraction-free timer featuring a customizable animated progress ring, distinct "Study" and "Break" toggles, and native Web Audio alert system.
* **📝 Smart Notes Dashboard:** A robust Markdown-ready note-taking interface equipped with a real-time keystroke auto-saver and seamlessly switch between Grid (Card) and List layouts.
* **🎯 Target Goal Setter:** A predictive algorithm that calculates the GPA required in remaining semesters to confidently hit your desired target CGPA.
* **🧮 Dual-Mode Calculator System:** 
  * *Quick Calc:* A standard minimalist layout with dynamic cursors and custom calculation histories.
  * *Pro Sci-Calc:* A powerful, hardware-locked landscape scientific calculator featuring a 50-button layout for complex engineering formulas.
* **📊 CO-PO Analyzer:** Effortlessly evaluate internal assessments to track Course Outcomes and Program Outcomes.
* **🏛️ Institutional Hub:** Quickly access faculty and department Vision and Mission statements.

### 📱 Premium Native & UI Overhauls
* **🌓 Immersive Application-Wide UI Re-Skin:** Features elevated components across every screen with standard glassmorphism containers, refined responsive layouts, and automatic native keyboard auto-dismiss controls on background tap.
* **🔔 Native Assignment Alarms:** Leverages the Cordova Local Notification framework to push lock-screen and status-bar alerts when deadlines approach, featuring intelligent 3-hour repeat intervals and instant OS cancel scheduling upon task completion.
* **🛡️ Two-Layer "Time Travel" Blocker:** UI date picker restrictions paired with strict script calculation evaluations to prevent assignments from being saved with past due dates.
* **📍 Safe Area Geometry Adjustments:** Engineered structural alignment adjustments to the main structural navigation header and footer, completely fixing color anomalies near mobile gesture notches for edge-to-edge screens.
* **🌄 Time-Sensitive Home Engine:** Dynamically transforms the Home greeting header layout and graphical background states based on the user's current time of day (Morning, Afternoon, Evening, Night).
* **🔄 Seamless Onboarding Prompts:** Promotes higher user compliance through an elegantly integrated permission "Soft Prompt" clarifying system notification usage prior to system dialogs.
* **🚀 Git-Powered Update Alerts:** An internal release pipeline checking the installed version against the latest GitHub release to display download banners natively inside the app.

## 🛠️ Tech Stack

* **Framework:** Apache Cordova (Native Wrapper)
* **Logic Engine:** Vanilla JavaScript (ES6+ Architecture)
* **Styling Framework:** Tailwind CSS 
* **Data Layer:** HTML5 LocalStorage (Native Persistence)
* **Chart Component:** Chart.js (Optimized for Dark Theme inversion)

## 🚀 Getting Started

### Prerequisites
* Node.js & npm installed
* Cordova CLI (`npm install -g cordova`)
* Android Studio / SDK Tools (for Android builds)

### Installation

1. Clone the repository:
   
   ```bash 
   git clone https://github.com/amudhan-mohan/ausmarthub.git
   cd ausmarthub
   ```
2. Install project dependencies::
    ```bash
    npm install
    ```
3. Add the Android platform and necessary plugins:
    ```bash
    cordova platform add android
    cordova plugin add cordova-plugin-screen-orientation
    cordova plugin add cordova-plugin-splashscreen
    cordova plugin add cordova-plugin-local-notifications
    ```
4. Run the Tailwind CSS compiler (watch mode):
    ```bash
    npm run watch
    ```
5. Build the Tailwind CSS (Stop the watch process before running this command.):
    ```bash
    npm run build:css
    ```
6. Build and run on your connected device:
    ```bash
    cordova run android
    ```
7. To generate a release build:
    ```bash
    cordova build android
    ```
