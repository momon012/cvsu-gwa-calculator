// Generated with GitHub Copilot CLI, reviewed by Symon

(function () {
  "use strict";

  const plannerForm = document.getElementById("planner-form");
  const fillSavedButton = document.getElementById("fill-saved");
  const currentGwaInput = document.getElementById("current-gwa");
  const unitsCompletedInput = document.getElementById("units-completed");
  const unitsRemainingInput = document.getElementById("units-remaining");
  const targetHonorSelect = document.getElementById("target-honor");
  const neededResult = document.getElementById("needed-result");
  const neededMessage = document.getElementById("needed-message");

  const rules = window.CVSU_RULE_FUNCTIONS;
  const storage = window.CVSU_STORAGE;

  function populateHonors() {
    window.HONORS.forEach(function (honor) {
      const option = document.createElement("option");
      option.value = String(honor.maxGWA);
      option.textContent = honor.name + " (" + honor.maxGWA.toFixed(2) + ")";
      targetHonorSelect.append(option);
    });
  }

  function setError(input, errorId, message) {
    const errorElement = document.getElementById(errorId);
    errorElement.textContent = message;

    if (message) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", errorId);
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
  }

  function validateNumberInput(input, errorId, options) {
    const rawValue = input.value.trim();

    if (rawValue === "") {
      setError(input, errorId, "Enter " + options.label + ".");
      return null;
    }

    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
      setError(input, errorId, options.label + " must be numeric.");
      return null;
    }

    if (options.allowZero && value < 0) {
      setError(input, errorId, options.label + " cannot be negative.");
      return null;
    }

    if (!options.allowZero && value <= 0) {
      setError(input, errorId, options.label + " must be greater than zero.");
      return null;
    }

    setError(input, errorId, "");
    return value;
  }

  function validateFields() {
    const currentGwaRaw = currentGwaInput.value.trim();
    let currentGwa = null;

    if (currentGwaRaw === "") {
      setError(currentGwaInput, "current-gwa-error", "Enter the current GWA.");
    } else {
      const value = Number(currentGwaRaw);
      if (!Number.isFinite(value)) {
        setError(currentGwaInput, "current-gwa-error", "Current GWA must be numeric.");
      } else if (!rules.isValidGrade(value)) {
        setError(currentGwaInput, "current-gwa-error", "Current GWA must be from 1.00 to 5.00.");
      } else {
        setError(currentGwaInput, "current-gwa-error", "");
        currentGwa = value;
      }
    }

    const unitsCompleted = validateNumberInput(
      unitsCompletedInput,
      "units-completed-error",
      { label: "Units completed", allowZero: true }
    );
    const unitsRemaining = validateNumberInput(
      unitsRemainingInput,
      "units-remaining-error",
      { label: "Units remaining", allowZero: false }
    );

    let target = null;
    if (targetHonorSelect.value === "") {
      setError(targetHonorSelect, "target-honor-error", "Choose a target honor.");
    } else {
      target = Number(targetHonorSelect.value);
      setError(targetHonorSelect, "target-honor-error", "");
    }

    if (
      currentGwa === null ||
      unitsCompleted === null ||
      unitsRemaining === null ||
      target === null
    ) {
      return null;
    }

    return {
      currentGwa: currentGwa,
      unitsCompleted: unitsCompleted,
      unitsRemaining: unitsRemaining,
      target: target
    };
  }

  function fillFromSavedSemesters() {
    const data = storage.loadData();
    let weightedTotal = 0;
    let countedUnits = 0;

    data.semesters.forEach(function (semester) {
      if (!semester || !Array.isArray(semester.subjects)) {
        return;
      }

      semester.subjects.forEach(function (subject) {
        if (!subject || subject.countsTowardGWA !== true) {
          return;
        }

        const units = Number(subject.units);
        const grade = Number(subject.grade);

        if (rules.isValidUnits(units) && rules.isValidGrade(grade)) {
          weightedTotal += grade * units;
          countedUnits += units;
        }
      });
    });

    if (countedUnits === 0) {
      neededResult.textContent = "--";
      neededMessage.textContent = "No saved counted subjects were found.";
      return;
    }

    const currentGwa = weightedTotal / countedUnits;
    currentGwaInput.value = rules.roundGWA(currentGwa).toFixed(2);
    unitsCompletedInput.value = String(countedUnits);
    validateFields();
  }

  function calculateNeeded(values) {
    const needed =
      (values.target * (values.unitsCompleted + values.unitsRemaining)
        - values.currentGwa * values.unitsCompleted)
      / values.unitsRemaining;

    if (needed < 1.00) {
      neededResult.textContent = "Out of reach";
      neededMessage.textContent = "The target is out of reach.";
      return;
    }

    if (needed > 3.00) {
      neededResult.textContent = "--";
      neededMessage.textContent =
        "Any passing average keeps the target, but this check ignores lowest-grade rules.";
      return;
    }

    neededResult.textContent = rules.roundGWA(needed).toFixed(2);
    neededMessage.textContent =
      "You need a remaining GWA of " + neededResult.textContent + ".";
  }

  fillSavedButton.addEventListener("click", fillFromSavedSemesters);

  plannerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const values = validateFields();
    if (values === null) {
      neededResult.textContent = "--";
      neededMessage.textContent = "";
      return;
    }

    calculateNeeded(values);
  });

  currentGwaInput.addEventListener("input", function () {
    validateFields();
  });

  unitsCompletedInput.addEventListener("input", function () {
    validateFields();
  });

  unitsRemainingInput.addEventListener("input", function () {
    validateFields();
  });

  targetHonorSelect.addEventListener("change", function () {
    validateFields();
  });

  populateHonors();
})();
