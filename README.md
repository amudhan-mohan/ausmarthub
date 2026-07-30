# AU Smart Hub 🎓

![Platform](https://img.shields.io/badge/Platform-Android-green)
![Framework](https://img.shields.io/badge/Apache-Cordova-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Version](https://img.shields.io/badge/Version-v1.0.16-orange)

AU Smart Hub is a modern all-in-one student productivity suite built specifically for university students. Powered by Apache Cordova with a modular JavaScript architecture and styled using Tailwind CSS, the app combines academic planning, engineering calculators, note-taking, assignment management, and NPTEL tracking into one seamless Android experience.

Designed with native Android behaviors, smart notifications, offline storage, responsive layouts, and Light/Dark mode support, AU Smart Hub delivers a fast, reliable, and distraction-free learning companion.

## ✨ Features

### 🎓 Academic Productivity

- **Advanced CGPA Tracker** — Manage multiple student profiles, semester GPAs, and visualize academic progress using interactive charts.
- **NPTEL Course Tracker** — Enter all 12 weekly assignment scores, automatically calculate the Top 8, internal marks (out of 25), and determine Elite, Silver, or Gold certificate eligibility.
- **Target Goal Setter** — Predict the GPA required in future semesters to achieve your desired CGPA.
- **CO-PO Analyzer** — Track Course Outcomes and Program Outcomes for internal assessments.
- **Institutional Hub** — Access department Vision & Mission statements anytime.

---

### 📅 Smart Planning

- **Interactive Timetable**
  - Live "Happening Now" detection
  - "Up Next" class preview
  - Automatic overlap prevention
  - Daily scheduling interface

- **Assignment Manager**
  - Multiple reminders
  - Smart notification scheduling
  - Automatic cancellation when completed
  - Due date validation

---

### 📝 Smart Notes

- Markdown-ready editor
- Automatic real-time saving
- Undo / Redo
- One-Tap Copy
- Live Word Counter
- Live Character Counter
- Grid & List layouts

---

### 🧮 Calculator Suite

#### Quick Calc

- Standard calculator
- Calculation history
- Dynamic cursor support

#### Pro Scientific Calculator

- 50-button engineering layout
- Secure math parsing engine
- Landscape-only mode
- Improved calculation accuracy
- Better display scaling

---

### ⏱️ Focus Timer

- Pomodoro Timer
- Animated progress ring
- Study & Break modes
- Native audio alerts

---

### 📱 Native Android Experience

- Android 14 Exact Alarm support
- Native Local Notifications
- Smart Hardware Back Button
- Automatic keyboard dismissal
- Edge-to-edge Safe Area support
- Dynamic Home greeting
- Light & Dark themes
- GitHub Update Checker

---

### ⚡ Performance Improvements

- Completely modular JavaScript architecture
- Faster loading
- Improved memory management
- Easier future maintenance
- Better overall responsiveness


## 🛠️ Tech Stack

- **Framework:** Apache Cordova
- **Programming Language:** Vanilla JavaScript (ES6+ Modular Architecture)
- **Frontend:** HTML5
- **Styling:** Tailwind CSS
- **Charts:** Chart.js
- **Storage:** HTML5 LocalStorage
- **Notifications:** Cordova Local Notifications
- **Screen Management:** Cordova Screen Orientation
- **Platform:** Android

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
2. Install project dependencies:
    ```bash
    npm install
    ```
3. Add the Android platform and necessary plugins:
    ```bash
    cordova platform add android
    cordova plugin add cordova-plugin-screen-orientation
    cordova plugin add cordova-plugin-splashscreen
    cordova plugin add cordova-plugin-local-notification
    cordova plugin add cordova-plugin-device
    ```
4. Run the Tailwind CSS compiler (watch mode):
    ```bash
    npm run watch
    ```
5. Build the production Tailwind CSS (Stop the watch process before running this command.):
    ```bash
    npm run build:css
    ```
6. Build and run on your connected device:
    ```bash
    cordova run android
    ```
7. To generate a release build:
    ```bash
    cordova build android --release
    ```
## 📥 Download

Download the latest APK from the Releases page.

👉 https://github.com/amudhan-mohan/ausmarthub/releases/latest

## 📄 License

This project is licensed under the MIT License.