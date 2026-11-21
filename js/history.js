// Generated with GitHub Copilot CLI, reviewed by Symon

(function () {
  "use strict";

  const historyBody = document.getElementById("history-body");
  const historyEmpty = document.getElementById("history-empty");
  const historyTableSection = document.getElementById("history-table-section");
  const cumulativeGwa = document.getElementById("cumulative-gwa");
  const cumulativeUnits = document.getElementById("cumulative-units");

  const rules = window.CVSU_RULE_FUNCTIONS;
  const storage = window.CVSU_STORAGE;

  function getSemesterSubjects(semester) {
    if (!semester || !Array.isArray(semester.subjects)) {
      return [];
    }

    return semester.subjects;
  }

  function getCountedSubjects(subjects) {
    return subjects.filter(function (subject) {
      if (!subject || subject.countsTowardGWA !== true) {
        return false;
      }

      return rules.isValidUnits(Number(subject.units)) &&
        rules.isValidGrade(Number(subject.grade));
    });
  }

  function getSemesterSummary(semester) {
    const countedSubjects = getCountedSubjects(getSemesterSubjects(semester));
    const gwa = rules.computeGWA(countedSubjects);
    let units = 0;

    countedSubjects.forEach(function (subject) {
      units += Number(subject.units);
    });

    return {
      countedSubjects: countedSubjects,
      countedUnits: units,
      gwa: gwa
    };
  }

  function renderSubjectDetails(details, subjects) {
    const summary = document.createElement("summary");
    summary.textContent = "View subjects";
    details.append(summary);

    if (subjects.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "No subjects saved.";
      details.append(emptyMessage);
      return;
    }

    const list = document.createElement("ul");

    subjects.forEach(function (subject) {
      const item = document.createElement("li");
      const name = typeof subject.name === "string" && subject.name.trim()
        ? subject.name
        : "Unnamed subject";
      item.textContent =
        name + " - " +
        String(subject.units) + " units - " +
        "grade " + String(subject.grade);

      if (subject.countsTowardGWA !== true) {
        item.textContent += " - not counted toward GWA";
      }

      list.append(item);
    });

    details.append(list);
  }

  function createDeleteConfirmation(row, semesterIndex) {
    const container = document.createElement("div");
    container.className = "delete-confirmation";

    const prompt = document.createElement("p");
    prompt.textContent = "Delete this semester?";

    const confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.className = "button-secondary";
    confirmButton.textContent = "Confirm delete";
    confirmButton.addEventListener("click", function () {
      deleteSemester(semesterIndex);
    });

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "button-secondary";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", function () {
      container.hidden = true;
      const deleteButton = row.querySelector(".delete-semester");
      deleteButton.hidden = false;
    });

    container.append(prompt, confirmButton, cancelButton);
    container.hidden = true;
    return container;
  }

  function createSemesterRow(semester, semesterIndex) {
    const row = document.createElement("tr");
    const summary = getSemesterSummary(semester);

    const nameCell = document.createElement("td");
    nameCell.textContent =
      typeof semester.name === "string" && semester.name.trim()
        ? semester.name
        : "Unnamed semester";

    const unitsCell = document.createElement("td");
    unitsCell.textContent = String(summary.countedUnits);

    const gwaCell = document.createElement("td");
    gwaCell.textContent =
      summary.gwa === null
        ? "--"
        : rules.roundGWA(summary.gwa).toFixed(2);

    const subjectsCell = document.createElement("td");
    const details = document.createElement("details");
    renderSubjectDetails(details, getSemesterSubjects(semester));
    subjectsCell.append(details);

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-semester button-secondary";
    deleteButton.textContent = "Delete";

    const confirmation = createDeleteConfirmation(row, semesterIndex);
    deleteButton.addEventListener("click", function () {
      deleteButton.hidden = true;
      confirmation.hidden = false;
    });

    actionCell.append(deleteButton, confirmation);
    row.append(nameCell, unitsCell, gwaCell, subjectsCell, actionCell);
    return row;
  }

  function deleteSemester(semesterIndex) {
    const data = storage.loadData();

    if (
      semesterIndex < 0 ||
      semesterIndex >= data.semesters.length
    ) {
      renderHistory();
      return;
    }

    data.semesters.splice(semesterIndex, 1);
    storage.saveData(data);
    renderHistory();
  }

  function renderCumulativeGwa() {
    const data = storage.loadData();
    const allSubjects = [];

    data.semesters.forEach(function (semester) {
      getSemesterSubjects(semester).forEach(function (subject) {
        allSubjects.push(subject);
      });
    });

    const countedSubjects = getCountedSubjects(allSubjects);
    let countedUnits = 0;

    countedSubjects.forEach(function (subject) {
      countedUnits += Number(subject.units);
    });

    const gwa = rules.computeGWA(countedSubjects);
    cumulativeUnits.textContent = String(countedUnits);
    cumulativeGwa.textContent =
      gwa === null ? "--" : rules.roundGWA(gwa).toFixed(2);
  }

  function renderHistory() {
    const data = storage.loadData();
    historyBody.replaceChildren();

    if (data.semesters.length === 0) {
      historyEmpty.hidden = false;
      historyTableSection.hidden = true;
      renderCumulativeGwa();
      return;
    }

    historyEmpty.hidden = true;
    historyTableSection.hidden = false;

    data.semesters.forEach(function (semester, semesterIndex) {
      historyBody.append(createSemesterRow(semester, semesterIndex));
    });

    renderCumulativeGwa();
  }

  renderHistory();
})();
