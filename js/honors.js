// Generated with GitHub Copilot CLI, reviewed by Symon

(function () {
  "use strict";

  const manualGwaInput = document.getElementById("manual-gwa");
  const manualGwaError = document.getElementById("manual-gwa-error");
  const useSavedGwaButton = document.getElementById("use-saved-gwa");
  const gwaCondition = document.getElementById("gwa-condition");
  const conditionalCondition = document.getElementById("conditional-condition");
  const lowestRuleCondition = document.getElementById("lowest-rule-condition");
  const honorLevel = document.getElementById("honor-level");
  const honorReasons = document.getElementById("honor-reasons");
  const showTransferee = document.getElementById("show-transferee");
  const transfereeSection = document.getElementById("transferee-section");

  const cvsUnitsInput = document.getElementById("cvsu-units");
  const totalUnitsInput = document.getElementById("total-units");
  const previousGradeInput = document.getElementById("previous-lowest-grade");
  const unitsPercentCondition = document.getElementById("units-percent-condition");
  const previousGradeCondition = document.getElementById("previous-grade-condition");
  const transfereeIneligibleCondition = document.getElementById("transferee-ineligible-condition");

  const rules = window.CVSU_RULE_FUNCTIONS;
  const storage = window.CVSU_STORAGE;

  function getSavedSubjects() {
    const data = storage.loadData();
    const subjects = [];

    data.semesters.forEach(function (semester) {
      if (!semester || !Array.isArray(semester.subjects)) {
        return;
      }

      semester.subjects.forEach(function (subject) {
        subjects.push(subject);
      });
    });

    return subjects;
  }

  function getCumulativeSavedGwa() {
    const subjects = getSavedSubjects();
    return rules.computeGWA(subjects);
  }

  function setFieldError(input, errorElement, message) {
    errorElement.textContent = message;

    if (message) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", errorElement.id);
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
  }

  function replaceStrongText(element, prefix, status) {
    element.replaceChildren();

    const prefixText = document.createTextNode(prefix);
    const strong = document.createElement("strong");
    strong.textContent = status;
    element.append(prefixText, strong);
  }

  function validateManualGwa() {
    const rawValue = manualGwaInput.value.trim();

    if (rawValue === "") {
      setFieldError(manualGwaInput, manualGwaError, "Enter a GWA.");
      return null;
    }

    const gwa = Number(rawValue);
    if (!Number.isFinite(gwa)) {
      setFieldError(manualGwaInput, manualGwaError, "GWA must be numeric.");
      return null;
    }

    if (!rules.isValidGrade(gwa)) {
      setFieldError(manualGwaInput, manualGwaError, "GWA must be from 1.00 to 5.00.");
      return null;
    }

    setFieldError(manualGwaInput, manualGwaError, "");
    return gwa;
  }

  function addReason(message) {
    const item = document.createElement("li");
    item.textContent = message;
    honorReasons.append(item);
  }

  function getConditionalGradeSubject(subjects) {
    return subjects.find(function (subject) {
      return subject &&
        rules.isValidGrade(Number(subject.grade)) &&
        Number(subject.grade) === window.CONDITIONAL_GRADE;
    });
  }

  function updateEligibility() {
    const gwa = validateManualGwa();
    const subjects = getSavedSubjects();
    const conditionalSubject = getConditionalGradeSubject(subjects);
    const honorsLevel = gwa === null ? null : rules.getHonorsLevel(gwa);

    honorReasons.replaceChildren();

    if (gwa === null) {
      replaceStrongText(gwaCondition, "GWA range: ", "Waiting for GWA");
      replaceStrongText(conditionalCondition, "No 4.00 grade: ", "Waiting for subject data");
      replaceStrongText(lowestRuleCondition, "Lowest-grade rule: ", "rule not set");
      honorLevel.textContent = "No honor level";
      addReason("Enter a valid GWA to check honors eligibility.");
      updateTransferee(null);
      return;
    }

    if (honorsLevel) {
      replaceStrongText(
        gwaCondition,
        "GWA range: ",
        "Pass - " + honorsLevel.name
      );
    } else {
      replaceStrongText(gwaCondition, "GWA range: ", "Fail");
    }

    if (conditionalSubject) {
      replaceStrongText(conditionalCondition, "No 4.00 grade: ", "Fail");
    } else {
      replaceStrongText(conditionalCondition, "No 4.00 grade: ", "Pass");
    }

    if (window.LOWEST_GRADE_REGULAR === null) {
      replaceStrongText(lowestRuleCondition, "Lowest-grade rule: ", "rule not set");
    } else {
      replaceStrongText(lowestRuleCondition, "Lowest-grade rule: ", "Set");
    }

    if (!honorsLevel) {
      honorLevel.textContent = "No honor level";
      addReason("GWA does not fall within the listed honors ranges.");
    } else if (conditionalSubject) {
      honorLevel.textContent = honorsLevel.name;
      addReason(
        "GWA qualifies for " + honorsLevel.name +
        ", but a 4.00 in " +
        (conditionalSubject.name ? conditionalSubject.name : "one subject") +
        " disqualifies you."
      );
    } else {
      honorLevel.textContent = honorsLevel.name;
      addReason("GWA qualifies for " + honorsLevel.name + ".");
    }

    if (window.LOWEST_GRADE_REGULAR === null) {
      addReason("Lowest regular-grade rule is not set.");
    }

    updateTransferee(honorsLevel);
  }

  function validateUnitsInput(input, errorId, label) {
    const rawValue = input.value.trim();
    const errorElement = document.getElementById(errorId);

    if (rawValue === "") {
      setFieldError(input, errorElement, "Enter " + label + ".");
      return null;
    }

    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
      setFieldError(input, errorElement, label + " must be numeric.");
      return null;
    }

    if (value < 0) {
      setFieldError(input, errorElement, label + " cannot be negative.");
      return null;
    }

    setFieldError(input, errorElement, "");
    return value;
  }

  function validatePreviousGrade() {
    const rawValue = previousGradeInput.value.trim();
    const errorElement = document.getElementById("previous-lowest-grade-error");

    if (rawValue === "") {
      setFieldError(previousGradeInput, errorElement, "Enter the previous-school lowest grade.");
      return null;
    }

    const grade = Number(rawValue);
    if (!Number.isFinite(grade)) {
      setFieldError(previousGradeInput, errorElement, "Lowest grade must be numeric.");
      return null;
    }

    if (!rules.isValidGrade(grade)) {
      setFieldError(previousGradeInput, errorElement, "Lowest grade must be from 1.00 to 5.00.");
      return null;
    }

    setFieldError(previousGradeInput, errorElement, "");
    return grade;
  }

  function updateTransferee(honorsLevel) {
    if (!showTransferee.checked) {
      return;
    }

    const cvsUnits = validateUnitsInput(cvsUnitsInput, "cvsu-units-error", "CvSU units");
    const totalUnits = validateUnitsInput(totalUnitsInput, "total-units-error", "total units");
    const previousGrade = validatePreviousGrade();

    if (totalUnits === null || cvsUnits === null) {
      replaceStrongText(unitsPercentCondition, "75% of units at CvSU: ", "Waiting");
    } else if (totalUnits === 0) {
      replaceStrongText(unitsPercentCondition, "75% of units at CvSU: ", "Fail");
    } else {
      const percentage = (cvsUnits / totalUnits) * 100;
      replaceStrongText(
        unitsPercentCondition,
        "75% of units at CvSU: ",
        percentage >= window.TRANSFEREE.minUnitsPercentAtCvSU ? "Pass" : "Fail"
      );
    }

    if (previousGrade === null) {
      replaceStrongText(previousGradeCondition, "Previous-school lowest grade: ", "Waiting");
      replaceStrongText(transfereeIneligibleCondition, "2.75 or worse is ineligible: ", "Waiting");
      return;
    }

    if (previousGrade >= window.TRANSFEREE.ineligibleAt) {
      replaceStrongText(previousGradeCondition, "Previous-school lowest grade: ", "Fail");
      replaceStrongText(transfereeIneligibleCondition, "2.75 or worse is ineligible: ", "Fail");
      return;
    }

    replaceStrongText(transfereeIneligibleCondition, "2.75 or worse is ineligible: ", "Pass");

    if (!honorsLevel) {
      replaceStrongText(previousGradeCondition, "Previous-school lowest grade: ", "Waiting");
      return;
    }

    let requiredGrade = null;
    if (honorsLevel.name === "Summa Cum Laude") {
      requiredGrade = window.TRANSFEREE.lowestPreviousGrade.summa;
    } else if (honorsLevel.name === "Magna Cum Laude") {
      requiredGrade = window.TRANSFEREE.lowestPreviousGrade.magna;
    } else if (honorsLevel.name === "Cum Laude") {
      requiredGrade = window.TRANSFEREE.lowestPreviousGrade.cum;
    }

    if (requiredGrade !== null) {
      replaceStrongText(
        previousGradeCondition,
        "Previous-school lowest grade: ",
        previousGrade <= requiredGrade ? "Pass" : "Fail"
      );
    } else {
      replaceStrongText(previousGradeCondition, "Previous-school lowest grade: ", "Waiting");
    }
  }

  useSavedGwaButton.addEventListener("click", function () {
    const savedGwa = getCumulativeSavedGwa();
    if (savedGwa === null) {
      manualGwaInput.value = "";
      replaceStrongText(gwaCondition, "GWA range: ", "Waiting for GWA");
      honorReasons.replaceChildren();
      addReason("No saved counted subjects were found.");
      return;
    }

    manualGwaInput.value = rules.roundGWA(savedGwa).toFixed(2);
    updateEligibility();
  });

  manualGwaInput.addEventListener("input", updateEligibility);

  showTransferee.addEventListener("change", function () {
    if (showTransferee.checked) {
      transfereeSection.classList.remove("is-hidden");
      transfereeSection.hidden = false;
    } else {
      transfereeSection.classList.add("is-hidden");
      transfereeSection.hidden = true;
    }

    updateEligibility();
  });

  [cvsUnitsInput, totalUnitsInput, previousGradeInput].forEach(function (input) {
    input.addEventListener("input", function () {
      updateEligibility();
    });
  });

  updateEligibility();
})();
