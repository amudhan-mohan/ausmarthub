# AU Smart Hub 🎓

AU Smart Hub is a premium, beautifully designed mobile utility application built for university students. Developed using Apache Cordova and styled with Tailwind CSS, it features a modern glassmorphism UI with seamless Light and Dark mode integration.

## ✨ Features

* **🎓 Advanced CGPA Tracker:** Manage multiple student profiles, track semester grades, and visualize academic performance with dynamic GPA trend charts.
* **🎯 Target Goal Setter:** A predictive algorithm that calculates the exact grades needed in remaining semesters to achieve a target CGPA.
* **🧮 Dual-Mode Calculator:** * *Quick Calc:* A minimalist standard calculator for everyday math.
  * *Pro Sci-Calc:* A native iOS-style, landscape-locked scientific calculator with a 50-button grid for complex engineering math.
* **📝 Smart Notes:** A distraction-free note-taking tool with real-time auto-saving and localized storage.
* **📊 CO-PO Analyzer:** Track and calculate Course Outcomes and Program Outcomes for internal assessments.
* **🏛️ Institutional Hub:** Quickly browse Faculty and Department-specific Vision and Mission statements.
* **🌓 Native Theming:** Flawless Light and Dark mode transitions with custom UI modals and immersive splash screens.

## 🛠️ Tech Stack

* **Framework:** Apache Cordova (Android/iOS)
* **Logic:** Vanilla JavaScript (ES6+)
* **Styling:** Tailwind CSS (via PostCSS CLI)
* **Storage:** HTML5 LocalStorage

## 🚀 Getting Started

### Prerequisites
* Node.js & npm installed
* Cordova CLI (`npm install -g cordova`)
* Android Studio (for Android builds)

### Installation

1. Clone the repository:
   
   ```bash 
   git clone https://github.com/amudhan-mohan/ausmarthub.git
   cd ausmarthub
2. Install Tailwind CSS dependencies (if package.json is present):
    ```bash
    npm install
3. Add the Android platform and necessary plugins:
    ```bash
       cordova platform add android
       cordova plugin add cordova-plugin-screen-orientation
       cordova plugin add cordova-plugin-splashscreen
4. Run the Tailwind CSS compiler (watch mode):
    ```bash
       npm run watch
5. Build and run on your connected device:
    ```bash
       cordova run android
