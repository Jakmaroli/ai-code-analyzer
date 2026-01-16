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
  clearSubjectInputs();
}

// expose functions to HTML
window.addSubject = addSubject;
window.generate = generateTimetable;
