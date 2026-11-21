// Generated with GitHub Copilot CLI, reviewed by Symon
// Source: CvSU orientation presented by students, to be confirmed with the registrar.

const HONORS = [
  { name: "Summa Cum Laude", minGWA: 1.00, maxGWA: 1.21 },
  { name: "Magna Cum Laude", minGWA: 1.22, maxGWA: 1.45 },
  { name: "Cum Laude", minGWA: 1.46, maxGWA: 1.75 }
];

const LOWEST_GRADE_REGULAR = null;

const TRANSFEREE = {
  minUnitsPercentAtCvSU: 75,
  lowestPreviousGrade: {
    summa: 2.00,
    magna: 2.25,
    cum: 2.50
  },
  ineligibleAt: 2.75
};

const CONDITIONAL_GRADE = 4.00;

const EXCLUDED_HINTS = ["NSTP", "CvSU 101"];

function computeGWA(subjects) {
  if (!Array.isArray(subjects)) {
    return null;
  }

  let weightedGradeTotal = 0;
  let unitTotal = 0;

  subjects.forEach((subject) => {
    if (!subject || subject.countsTowardGWA !== true) {
      return;
    }

    const units = Number(subject.units);
    const grade = Number(subject.grade);

    if (!isValidUnits(units) || !isValidGrade(grade)) {
      return;
    }

    weightedGradeTotal += grade * units;
    unitTotal += units;
  });

  if (unitTotal === 0) {
    return null;
  }

  return weightedGradeTotal / unitTotal;
}

function roundGWA(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Number(number.toFixed(2));
}

function getHonorsLevel(gwa) {
  const roundedGWA = roundGWA(gwa);

  if (roundedGWA === null) {
    return null;
  }

  return HONORS.find((level) =>
    roundedGWA >= level.minGWA && roundedGWA <= level.maxGWA
  ) || null;
}

function isValidGrade(g) {
  const grade = Number(g);
  return Number.isFinite(grade) && grade >= 1.00 && grade <= 5.00;
}

function isValidUnits(u) {
  const units = Number(u);
  return Number.isFinite(units) && units > 0;
}

window.HONORS = HONORS;
window.LOWEST_GRADE_REGULAR = LOWEST_GRADE_REGULAR;
window.TRANSFEREE = TRANSFEREE;
window.CONDITIONAL_GRADE = CONDITIONAL_GRADE;
window.EXCLUDED_HINTS = EXCLUDED_HINTS;
window.CVSU_RULES = {
  HONORS,
  LOWEST_GRADE_REGULAR,
  TRANSFEREE,
  CONDITIONAL_GRADE,
  EXCLUDED_HINTS
};

window.computeGWA = computeGWA;
window.roundGWA = roundGWA;
window.getHonorsLevel = getHonorsLevel;
window.isValidGrade = isValidGrade;
window.isValidUnits = isValidUnits;
window.CVSU_RULE_FUNCTIONS = {
  computeGWA,
  roundGWA,
  getHonorsLevel,
  isValidGrade,
  isValidUnits
};
