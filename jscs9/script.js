// ---- Edit these two lines with your own details ----
const DEVELOPER_NAME = "Parth Vishnu";
const DEVELOPER_PRN  = "24070521279";
// -----------------------------------------------------

const STORAGE_KEY = "theme";

const select  = document.getElementById("themeSelect");
const message = document.getElementById("message");
const statusPill = document.getElementById("themeStatus");

document.getElementById("devName").textContent = DEVELOPER_NAME;
document.getElementById("devPrn").textContent  = DEVELOPER_PRN;

// Apply a theme to the page (Light / Dark)
function applyTheme(theme) {
  document.body.className = theme;
  select.value = theme;
  statusPill.textContent = (theme === "dark" ? "DARK" : "WHITE") + " THEME ACTIVE";
}

function showMessage(icon, text) {
  message.textContent = icon + "  " + text;
}

// Save permanently (no expiry) using localStorage
document.getElementById("saveLocalBtn").addEventListener("click", function () {
  localStorage.setItem(STORAGE_KEY, select.value);
  applyTheme(select.value);
  showMessage("💾", "Theme saved using localStorage.");
});

// Save for the current browser session only using sessionStorage
document.getElementById("saveSessionBtn").addEventListener("click", function () {
  sessionStorage.setItem(STORAGE_KEY, select.value);
  applyTheme(select.value);
  showMessage("⏱️", "Theme saved using sessionStorage.");
});

// Remove the stored preferences from both storages
document.getElementById("clearBtn").addEventListener("click", function () {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  applyTheme("light");
  showMessage("🗑️", "Preferences cleared. Default theme restored.");
});

// Live preview when the dropdown value changes (not saved until a button is clicked)
select.addEventListener("change", function () {
  applyTheme(select.value);
  showMessage("👁️", "Previewing " + select.value.toUpperCase() + " theme. Click a save button to keep it.");
});

// Restore the saved preference when the page loads
window.addEventListener("load", function () {
  const sessionTheme = sessionStorage.getItem(STORAGE_KEY);
  const localTheme   = localStorage.getItem(STORAGE_KEY);

  if (sessionTheme) {
    applyTheme(sessionTheme);
    showMessage("⏱️", "Theme restored from sessionStorage (" + sessionTheme.toUpperCase() + ").");
  } else if (localTheme) {
    applyTheme(localTheme);
    showMessage("💾", "Theme restored from localStorage (" + localTheme.toUpperCase() + ").");
  } else {
    applyTheme("light");
  }
});
