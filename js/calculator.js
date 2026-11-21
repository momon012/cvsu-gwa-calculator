// Generated with GitHub Copilot CLI, reviewed by Symon

(function () {
  "use strict";

  const subjectsBody = document.getElementById("subjects-body");
  const addRowButton = document.getElementById("add-row");
  const gwaResult = document.getElementById("gwa-result");
  const countedUnits = document.getElementById("counted-units");
  const saveSemesterForm = document.getElementById("save-semester-form");
  const semesterNameInput = document.getElementById("semester-name");
  const semesterNameError = document.getElementById("semester-name-error");
  const saveStatus = document.getElementById("save-status");

  const rules = window.CVSU_RULE_FUNCTIONS;
  const storage = window.CVSU_STORAGE;

  let nextRowId = 1;

  function createRow(subject) {
    const row = subject || {
      name: "",
      units: "",
      grade: "",
      countsTowardGWA: true
    };

    const rowId = nextRowId++;
    const tr = document.createElement("tr");
    tr.dataset.rowId = String(rowId);

    const nameCell = document.createElement("td");
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = typeof row.name === "string" ? row.name : "";
    nameInput.placeholder = "Subject name";
    nameInput.dataset.field = "name";
    nameInput.setAttribute("aria-label", "Subject name");
    nameInput.id = "subject-name-" + rowId;

    const nameError = document.createElement("p");
    nameError.className = "field-error subject-field-error";
    nameError.id = "subject-name-error-" + rowId;
    nameError.setAttribute("aria-live", "polite");

    nameInput.setAttribute("aria-describedby", nameError.id);
    nameInput.addEventListener("input", function () {
      if (matchesExcludedHint(nameInput.value)) {
        countsCheckbox.checked = false;
      }
      validateAndSave();
    });

    nameCell.append(nameInput, nameError);

    const unitsCell = document.createElement("td");
    const unitsInput = document.createElement("input");
    unitsInput.type = "text";
    unitsInput.inputMode = "decimal";
    unitsInput.value = row.units === undefined || row.units === null ? "" : String(row.units);
    unitsInput.placeholder = "e.g. 3";
    unitsInput.dataset.field = "units";
    unitsInput.setAttribute("aria-label", "Units");
    unitsInput.id = "subject-units-" + rowId;

    const unitsError = document.createElement("p");
    unitsError.className = "field-error subject-field-error";
    unitsError.id = "subject-units-error-" + rowId;
    unitsError.setAttribute("aria-live", "polite");

    unitsInput.setAttribute("aria-describedby", unitsError.id);
    unitsInput.addEventListener("input", validateAndSave);

    unitsCell.append(unitsInput, unitsError);

    const gradeCell = document.createElement("td");
    const gradeInput = document.createElement("input");
    gradeInput.type = "text";
    gradeInput.inputMode = "decimal";
    gradeInput.value = row.grade === undefined || row.grade === null ? "" : String(row.grade);
    gradeInput.placeholder = "1.00";
    gradeInput.dataset.field = "grade";
    gradeInput.setAttribute("aria-label", "Grade");
    gradeInput.id = "subject-grade-" + rowId;

    const gradeError = document.createElement("p");
    gradeError.className = "field-error subject-field-error";
    gradeError.id = "subject-grade-error-" + rowId;
    gradeError.setAttribute("aria-live", "polite");

    gradeInput.setAttribute("aria-describedby", gradeError.id);
    gradeInput.addEventListener("input", validateAndSave);

    gradeCell.append(gradeInput, gradeError);

    const countsCell = document.createElement("td");
    const checkboxLabel = document.createElement("label");
    checkboxLabel.className = "checkbox-label";
    const countsCheckbox = document.createElement("input");
    countsCheckbox.type = "checkbox";
    countsCheckbox.checked = row.countsTowardGWA === true;
    countsCheckbox.dataset.field = "countsTowardGWA";
    countsCheckbox.setAttribute("aria-label", "Counts toward GWA");

    checkboxLabel.append(countsCheckbox);
    countsCell.append(checkboxLabel);
    countsCheckbox.addEventListener("change", validateAndSave);

    const removeCell = document.createElement("td");
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-row button-secondary";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {
      tr.remove();
      validateAndSave();
    });
    removeCell.append(removeButton);

    tr.append(nameCell, unitsCell, gradeCell, countsCell, removeCell);
    subjectsBody.append(tr);

    validateRow(tr);
  }

  function matchesExcludedHint(name) {
    if (typeof name !== "string") {
      return false;
    }

    const normalizedName = name.trim().toLowerCase();
    return window.EXCLUDED_HINTS.some(function (hint) {
      return normalizedName.includes(hint.toLowerCase());
    });
  }

  function getUnitsError(value) {
    const trimmedValue = value.trim();

    if (trimmedValue === "") {
      return "Enter units.";
    }

    const numberValue = Number(trimmedValue);
    if (!Number.isFinite(numberValue)) {
      return "Units must be numeric.";
    }

    if (numberValue <= 0) {
      return "Units must be greater than zero.";
    }

    return "";
  }

  function getGradeError(value) {
    const trimmedValue = value.trim();

    if (trimmedValue === "") {
      return "Enter a grade.";
    }

    const numberValue = Number(trimmedValue);
    if (!Number.isFinite(numberValue)) {
      return "Grade must be numeric.";
    }

    if (!rules.isValidGrade(numberValue)) {
      return "Grade must be from 1.00 to 5.00.";
    }

    return "";
  }

  function validateRow(row) {
    const nameInput = row.querySelector('[data-field="name"]');
    const unitsInput = row.querySelector('[data-field="units"]');
    const gradeInput = row.querySelector('[data-field="grade"]');

    const nameError = row.querySelector('[id*="-name-error-"]');
    const unitsError = row.querySelector('[id*="-units-error-"]');
    const gradeError = row.querySelector('[id*="-grade-error-"]');

    const nameMessage = nameInput.value.trim() === "" ? "Enter a subject name." : "";
    const unitsMessage = getUnitsError(unitsInput.value);
    const gradeMessage = getGradeError(gradeInput.value);

    setFieldError(nameInput, nameError, nameMessage);
    setFieldError(unitsInput, unitsError, unitsMessage);
    setFieldError(gradeInput, gradeError, gradeMessage);

    return nameMessage === "" && unitsMessage === "" && gradeMessage === "";
  }

  function setFieldError(input, errorElement, message) {
    errorElement.textContent = message;
    if (message) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  }

  function readSubjects() {
    const subjectRows = subjectsBody.querySelectorAll("tr");
    const subjects = [];

    subjectRows.forEach(function (row) {
      subjects.push({
        name: row.querySelector('[data-field="name"]').value,
        units: row.querySelector('[data-field="units"]').value,
        grade: row.querySelector('[data-field="grade"]').value,
        countsTowardGWA: row.querySelector('[data-field="countsTowardGWA"]').checked
      });
    });

    return subjects;
  }

  function updateResults() {
    const subjectRows = subjectsBody.querySelectorAll("tr");
    const subjectsForCalculation = [];
    let totalUnits = 0;

    subjectRows.forEach(function (row) {
      const name = row.querySelector('[data-field="name"]').value;
      const unitsValue = row.querySelector('[data-field="units"]').value;
      const gradeValue = row.querySelector('[data-field="grade"]').value;
      const countsTowardGWA = row.querySelector('[data-field="countsTowardGWA"]').checked;
      const units = Number(unitsValue);
      const grade = Number(gradeValue);

      if (
        countsTowardGWA &&
        rules.isValidUnits(units) &&
        rules.isValidGrade(grade)
      ) {
        subjectsForCalculation.push({
          name: name,
          units: units,
          grade: grade,
          countsTowardGWA: countsTowardGWA
        });
      }

      if (countsTowardGWA && rules.isValidUnits(units)) {
        totalUnits += units;
      }
    });

    const gwa = rules.computeGWA(subjectsForCalculation);
    const roundedGwa = gwa === null ? null : rules.roundGWA(gwa);

    gwaResult.textContent = roundedGwa === null ? "--" : roundedGwa.toFixed(2);
    countedUnits.textContent = String(totalUnits);
  }

  function saveDraft() {
    storage.saveDraft({
      subjects: readSubjects(),
      semesterName: semesterNameInput.value
    });
  }

  function validateAndSave() {
    subjectRows().forEach(validateRow);
    updateResults();
    saveDraft();
    saveStatus.textContent = "";
  }

  function subjectRows() {
    return Array.from(subjectsBody.querySelectorAll("tr"));
  }

  function restoreDraft() {
    const draft = storage.loadDraft();

    if (!draft || !Array.isArray(draft.subjects)) {
      addRow();
      return;
    }

    semesterNameInput.value =
      typeof draft.semesterName === "string" ? draft.semesterName : "";

    if (draft.subjects.length === 0) {
      addRow();
      return;
    }

    draft.subjects.forEach(function (subject) {
      let countsTowardGWA = subject.countsTowardGWA !== false;

      if (
        typeof subject.name === "string" &&
        matchesExcludedHint(subject.name) &&
        subject.countsTowardGWA !== true
      ) {
        countsTowardGWA = false;
      }

      createRow({
        name: subject.name,
        units: subject.units,
        grade: subject.grade,
        countsTowardGWA: countsTowardGWA
      });
    });

    updateResults();
  }

  function addRow() {
    createRow();
    updateResults();
    saveDraft();
  }

  addRowButton.addEventListener("click", addRow);

  semesterNameInput.addEventListener("input", function () {
    if (semesterNameInput.value.trim() === "") {
      semesterNameError.textContent = "";
    } else {
      semesterNameError.textContent = "";
    }
    saveDraft();
  });

  saveSemesterForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const semesterName = semesterNameInput.value.trim();
    if (semesterName === "") {
      semesterNameError.textContent = "Enter a semester name.";
      semesterNameInput.setAttribute("aria-invalid", "true");
      saveStatus.textContent = "";
      return;
    }

    semesterNameInput.removeAttribute("aria-invalid");
    semesterNameError.textContent = "";

    const rows = subjectRows();
    if (rows.length === 0) {
      saveStatus.textContent = "Add at least one subject.";
      return;
    }

    let allRowsValid = true;
    const subjects = [];

    rows.forEach(function (row) {
      const rowIsValid = validateRow(row);
      allRowsValid = allRowsValid && rowIsValid;

      subjects.push({
        name: row.querySelector('[data-field="name"]').value.trim(),
        units: Number(row.querySelector('[data-field="units"]').value),
        grade: Number(row.querySelector('[data-field="grade"]').value),
        countsTowardGWA: row.querySelector('[data-field="countsTowardGWA"]').checked
      });
    });

    if (!allRowsValid) {
      saveStatus.textContent = "Fix the highlighted fields before saving.";
      return;
    }

    const data = storage.loadData();
    data.semesters.push({
      id: "semester-" + Date.now(),
      name: semesterName,
      subjects: subjects
    });

    if (!storage.saveData(data)) {
      saveStatus.textContent = "The semester could not be saved.";
      return;
    }

    semesterNameInput.value = "";
    subjectsBody.replaceChildren();
    updateResults();
    storage.saveDraft({ subjects: [], semesterName: "" });
    saveStatus.textContent = "Semester saved.";
  });

  restoreDraft();
})();
