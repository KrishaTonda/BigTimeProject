// Save form data
function saveFormData(formId) {
  const form = document.getElementById(formId);
  const formData = new FormData(form);
  const data = {};

  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }

  localStorage.setItem("formData_" + formId, JSON.stringify(data));
  console.log(`Form data saved for ${formId}:`, data);
}

// Load form data
function loadFormData(formId) {
  const savedData = localStorage.getItem("formData_" + formId);
  if (savedData) {
    const data = JSON.parse(savedData);
    const form = document.getElementById(formId);

    Object.keys(data).forEach((key) => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = data[key];
      }
    });
    console.log(`Form data loaded for ${formId}:`, data);
    return data;
  }
  return null;
}

// Clear saved form data
function clearFormData(formId) {
  localStorage.removeItem("formData_" + formId);
  console.log(`Form data cleared for ${formId}`);
}

// Check if form data exists
function hasFormData(formId) {
  return localStorage.getItem("formData_" + formId) !== null;
}

// Auto-save form data as user types
function enableAutoSave(formId, delay = 1000) {
  const form = document.getElementById(formId);
  let timeoutId;

  if (form) {
    form.addEventListener("input", function () {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveFormData(formId);
      }, delay);
    });
  }
}

// Load and display saved data summary
function showSavedDataSummary(formId) {
  const savedData = localStorage.getItem("formData_" + formId);
  if (savedData) {
    const data = JSON.parse(savedData);
    const summary = Object.entries(data)
      .filter(([key, value]) => value && value.toString().trim() !== "")
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    console.log(`Saved data for ${formId}: ${summary}`);
    return summary;
  }
  return "No saved data";
}

// Initialize form with auto-save and load functionality
function initializeForm(formId, autoSaveDelay = 1000) {
  // Load existing data when page loads
  loadFormData(formId);

  // Enable auto-save
  enableAutoSave(formId, autoSaveDelay);

  // Clear data on successful form submission
  const form = document.getElementById(formId);
  if (form) {
    form.addEventListener("submit", function () {
      // Clear saved data after successful submission
      setTimeout(() => {
        clearFormData(formId);
      }, 1000);
    });
  }
}

// Get all saved form data across the application
function getAllSavedData() {
  const allData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("formData_")) {
      const formId = key.replace("formData_", "");
      allData[formId] = JSON.parse(localStorage.getItem(key));
    }
  }
  return allData;
}

// Export form data (useful for backup or transfer)
function exportFormData(formId) {
  const data = localStorage.getItem("formData_" + formId);
  if (data) {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formId}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Import form data from file
function importFormData(formId, file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      localStorage.setItem("formData_" + formId, JSON.stringify(data));
      loadFormData(formId);
      console.log(`Form data imported for ${formId}`);
    } catch (error) {
      console.error("Error importing form data:", error);
    }
  };
  reader.readAsText(file);
}
