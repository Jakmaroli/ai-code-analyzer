let subjects = [];

const hoursRange = document.getElementById("hoursRange");
const hoursValue = document.getElementById("hoursValue");

hoursRange.oninput = () => {
  hoursValue.textContent = hoursRange.value;
};

// Add Subject
function addSubject() {
  const name = document.getElementById("subjectName").value.trim();
  const examDate = document.getElementById("examDate").value;
  const difficulty = document.getElementById("difficulty").value;

  if (!name || !examDate) {
    alert("Please enter subject name and exam date");
    return;
  }

  subjects.push({ name, examDate, difficulty });
  renderSubjects();

  // Clear inputs for adding MORE subjects
  document.getElementById("subjectName").value = "";
  document.getElementById("examDate").value = "";
  document.getElementById("difficulty").value = "medium";
}

// Render Subject List
function renderSubjects() {
  const list = document.getElementById("subjectList");
  const count = document.getElementById("subjectCount");

  list.innerHTML = "";

  subjects.forEach((s, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${s.name} (${s.difficulty}) — Exam: ${s.examDate}`;
    list.appendChild(li);
  });

  count.textContent = `Total subjects added: ${subjects.length}`;
}

// Generate Timetable
function generate() {
  if (subjects.length === 0) {
    alert("Add at least one subject!");
    return;
  }

  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("scheduleDays").innerHTML = "";

  setTimeout(() => {
    document.getElementById("loading").classList.add("hidden");
    buildFinalTimetable();
  }, 1500);
}

// Build Timetable Logic
function buildFinalTimetable() {
  const container = document.getElementById("scheduleDays");
  const section = document.getElementById("finalTimetable");

  container.innerHTML = "";
  section.classList.remove("hidden");

  const dailyHours = Number(hoursRange.value);
  const studyMinutes = 45;
  const breakMinutes = 15;

  const sessionsPerDay = Math.floor((dailyHours * 60) / studyMinutes);

  let totalStudyDays = 0;
  let totalSessions = 0;
  let totalBreakTime = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find latest exam date
  const examDates = subjects.map(s => new Date(s.examDate));
  const lastExamDate = new Date(Math.max(...examDates));
  lastExamDate.setDate(lastExamDate.getDate() - 1); // stop before exams

  for (
    let day = new Date(today);
    day <= lastExamDate;
    day.setDate(day.getDate() + 1)
  ) {
    // Subjects still relevant on this day
    const activeSubjects = subjects.filter(s => {
      const exam = new Date(s.examDate);
      exam.setHours(0, 0, 0, 0);
      return day < exam;
    });

    if (activeSubjects.length === 0) continue;

    createDayScheduleMulti(activeSubjects, new Date(day), sessionsPerDay, container);

    totalStudyDays++;
    totalSessions += sessionsPerDay;
    totalBreakTime += (sessionsPerDay - 1) * breakMinutes;
  }

  // Summary
  document.getElementById("studyDays").textContent = totalStudyDays;
  document.getElementById("dailyHoursStat").textContent = dailyHours + "h";
  document.getElementById("totalSessions").textContent = totalSessions;
  document.getElementById("breakTime").textContent = totalBreakTime + "m";

  // Date range display
  const earliest = new Date(Math.min(...examDates));
  const latest = new Date(Math.max(...examDates));

  document.getElementById("dateRange").textContent =
    earliest.toDateString().slice(4, 10) +
    " - " +
    latest.toDateString().slice(4, 10) +
    ", " +
    latest.getFullYear();
}

// Create One Day Schedule
function createDaySchedule(subjectName, dateObj, sessions, container) {
  const dayBlock = document.createElement("div");
  dayBlock.className = "day-block";

  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  const dayDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  dayBlock.innerHTML = `
    <div class="day-header">
      ${dayName}<br />
      <small>${dayDate}</small>
    </div>
  `;

  let minutes = 9 * 60; // Start at 09:00 AM

  for (let i = 0; i < sessions; i++) {
    dayBlock.appendChild(createSession(subjectName, "45 min", minutes));
    minutes += 45;

    if (i < sessions - 1) {
      dayBlock.appendChild(createSession("Break", "15 min", minutes, true));
      minutes += 15;
    }
  }

  container.appendChild(dayBlock);
}
//Multi subjects Allocatioin
function createDayScheduleMulti(subjects, dateObj, sessions, container) {
  const dayBlock = document.createElement("div");
  dayBlock.className = "day-block";

  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  const dayDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  dayBlock.innerHTML = `
    <div class="day-header">
      ${dayName}<br />
      <small>${dayDate}</small>
    </div>
  `;

  let minutes = 9 * 60; // 09:00 AM
  let subjectIndex = 0;

  for (let i = 0; i < sessions; i++) {
    const subject = subjects[subjectIndex % subjects.length];

    dayBlock.appendChild(
      createSession(subject.name, "45 min", minutes)
    );

    minutes += 45;
    subjectIndex++;

    if (i < sessions - 1) {
      dayBlock.appendChild(
        createSession("Break", "15 min", minutes, true)
      );
      minutes += 15;
    }
  }

  container.appendChild(dayBlock);
}

// Create Session Block
function createSession(title, duration, startMinutes, isBreak = false) {
  const div = document.createElement("div");
  div.className = "session" + (isBreak ? " break" : "");

  div.innerHTML = `
    <span>${title}</span>
    <span>${duration}</span>
    <span>${formatTime(startMinutes)}</span>
  `;

  return div;
}

// Format Time
function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
