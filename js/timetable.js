function generateTimetable() {
  if (subjects.length === 0) {
    alert("Add at least one subject!");
    return;
  }

  showLoading(true);
  document.getElementById("scheduleDays").innerHTML = "";

  setTimeout(() => {
    showLoading(false);
    buildFinalTimetable();
  }, 1200);
}

function buildFinalTimetable() {
  const container = document.getElementById("scheduleDays");
  showTimetable();

  const dailyHours = Number(hoursRange.value);
  const sessionsPerDay =
    Math.floor((dailyHours * 60) / STUDY_MINUTES);

  let stats = {
    days: 0,
    sessions: 0,
    breaks: 0
  };

  const today = normalizeDate(new Date());

  const examDates = subjects.map(s => normalizeDate(s.examDate));
  const lastStudyDay = new Date(Math.max(...examDates));
  lastStudyDay.setDate(lastStudyDay.getDate() - 1);

  for (let day = new Date(today);
       day <= lastStudyDay;
       day.setDate(day.getDate() + 1)) {

    const activeSubjects = subjects.filter(s =>
      normalizeDate(s.examDate) > day
    );

    if (activeSubjects.length === 0) continue;

    createDayScheduleMulti(activeSubjects, day, sessionsPerDay, container);

    stats.days++;
    stats.sessions += sessionsPerDay;
    stats.breaks += (sessionsPerDay - 1) * BREAK_MINUTES;
  }

  updateSummary(stats, dailyHours, examDates);
}

function createDayScheduleMulti(subjects, dateObj, sessions, container) {
  const dayBlock = document.createElement("div");
  dayBlock.className = "day-block";

  dayBlock.innerHTML = `
    <div class="day-header">
      ${dateObj.toLocaleDateString("en-US", { weekday: "long" })}<br />
      <small>${dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</small>
    </div>
  `;

  let minutes = START_TIME_MINUTES;
  let index = 0;

  for (let i = 0; i < sessions; i++) {
    const subject = subjects[index % subjects.length];
    dayBlock.appendChild(createSession(subject.name, minutes));
    minutes += STUDY_MINUTES;
    index++;

    if (i < sessions - 1) {
      dayBlock.appendChild(createBreak(minutes));
      minutes += BREAK_MINUTES;
    }
  }

  container.appendChild(dayBlock);
}

function createSession(title, start) {
  const div = document.createElement("div");
  div.className = "session";
  div.innerHTML = `
    <span>${title}</span>
    <span>45 min</span>
    <span>${formatTime(start)}</span>
  `;
  return div;
}

function createBreak(start) {
  const div = document.createElement("div");
  div.className = "session break";
  div.innerHTML = `
    <span>Break</span>
    <span>15 min</span>
    <span>${formatTime(start)}</span>
  `;
  return div;
}

function updateSummary(stats, dailyHours, examDates) {
  document.getElementById("studyDays").textContent = stats.days;
  document.getElementById("dailyHoursStat").textContent = dailyHours + "h";
  document.getElementById("totalSessions").textContent = stats.sessions;
  document.getElementById("breakTime").textContent = stats.breaks + "m";

  const earliest = new Date(Math.min(...examDates));
  const latest = new Date(Math.max(...examDates));

  document.getElementById("dateRange").textContent =
    earliest.toDateString().slice(4, 10) +
    " - " +
    latest.toDateString().slice(4, 10) +
    ", " +
    latest.getFullYear();
}
