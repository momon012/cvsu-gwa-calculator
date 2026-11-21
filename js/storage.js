// Generated with GitHub Copilot CLI, reviewed by Symon

const GWA_DATA_KEY = "gwaData";
const GWA_DRAFT_KEY = "gwaDraft";

function loadData() {
  try {
    const storedData = window.localStorage.getItem(GWA_DATA_KEY);

    if (storedData === null) {
      return { semesters: [] };
    }

    const parsedData = JSON.parse(storedData);

    if (
      !parsedData ||
      typeof parsedData !== "object" ||
      !Array.isArray(parsedData.semesters)
    ) {
      return { semesters: [] };
    }

    return parsedData;
  } catch (error) {
    return { semesters: [] };
  }
}

function saveData(data) {
  try {
    if (
      !data ||
      typeof data !== "object" ||
      !Array.isArray(data.semesters)
    ) {
      return false;
    }

    const serializedData = JSON.stringify(data);

    if (serializedData === undefined) {
      return false;
    }

    window.localStorage.setItem(GWA_DATA_KEY, serializedData);
    return true;
  } catch (error) {
    return false;
  }
}

function loadDraft() {
  try {
    const storedDraft = window.localStorage.getItem(GWA_DRAFT_KEY);

    if (storedDraft === null) {
      return null;
    }

    return JSON.parse(storedDraft);
  } catch (error) {
    return null;
  }
}

function saveDraft(draft) {
  try {
    const serializedDraft = JSON.stringify(draft);

    if (serializedDraft === undefined) {
      return false;
    }

    window.localStorage.setItem(GWA_DRAFT_KEY, serializedDraft);
    return true;
  } catch (error) {
    return false;
  }
}

window.GWA_DATA_KEY = GWA_DATA_KEY;
window.GWA_DRAFT_KEY = GWA_DRAFT_KEY;
window.loadData = loadData;
window.saveData = saveData;
window.loadDraft = loadDraft;
window.saveDraft = saveDraft;
window.CVSU_STORAGE = {
  GWA_DATA_KEY,
  GWA_DRAFT_KEY,
  loadData,
  saveData,
  loadDraft,
  saveDraft
};
