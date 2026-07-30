// ================= NAVIGATION =================
function navigate(screen) {
    if (currentScreen === screen) return;
    historyStack.push(currentScreen);
    currentScreen = screen;
    render();
    updateBackBtn();
    window.scrollTo(0, 0);
}

function goBack() {
    currentScreen = historyStack.pop() || "home";
    render();
    updateBackBtn();
    window.scrollTo(0, 0);
}

function updateBackBtn() {
    let btn = document.getElementById("backBtnWrapper");
    if (!btn) return;
    btn.classList.toggle("invisible", historyStack.length === 0);
}

// ================= MAIN RENDER =================
function render() {
    let app = document.getElementById("app");
    if (!app) return;

    let header = document.querySelector("header");
    let footer = document.querySelector("footer");

    if (currentScreen === "scientific-calc") {
        if (header) header.style.display = "none";
        if (footer) footer.style.display = "none";
        app.className = "m-0 p-0 max-w-full";

        if (window.screen && screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(e => console.log("Orientation lock failed", e));
        }
    } else {
        if (header) header.style.display = "flex";
        if (footer) footer.style.display = "block";
        app.className = "p-5 max-w-3xl mx-auto pb-28";

        if (window.screen && screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }
    }

    if (currentScreen === "home") app.innerHTML = renderHome();
    if (currentScreen === "profiles") app.innerHTML = renderProfiles();
    if (currentScreen === "target-cgpa") app.innerHTML = renderTargetCGPA();
    if (currentScreen === "calculator") app.innerHTML = renderCalculator();
    if (currentScreen === "scientific-calc") app.innerHTML = renderScientificCalc();
    if (currentScreen === "notes") app.innerHTML = renderNotesList();
    if (currentScreen === "note-editor") app.innerHTML = renderNoteEditor();
    if (currentScreen === "pomodoro") app.innerHTML = renderPomodoro();
    if (currentScreen === "timetable") app.innerHTML = renderTimetable();
    if (currentScreen === "assignments") app.innerHTML = renderAssignments();
    if (currentScreen === "nptel-profiles") app.innerHTML = renderNptelProfiles();
    if (currentScreen === "nptel-calc") app.innerHTML = renderNptelCalc();

    if (currentScreen === "cgpa") {
        app.innerHTML = renderCGPA();
        if (semesters.length > 0) {
            setTimeout(() => { renderCGPAChart(); }, 100);
        }
    }
    if (currentScreen === "semester") app.innerHTML = renderSemester();
    if (currentScreen === "copo") app.innerHTML = renderCOPO();
    if (currentScreen === "visionmission") app.innerHTML = renderVisionMission();
}