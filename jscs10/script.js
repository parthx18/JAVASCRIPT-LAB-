// ---- Edit these two lines with your own details ----
const DEVELOPER_NAME = "Parth Vishnu";
const DEVELOPER_PRN  = "24070521279";
// -----------------------------------------------------

const DATA_URL = "data.json";

// Embedded copy of data.json. Browsers block fetch()/$.getJSON() on file:// pages,
// so this is used as a fallback if the real request fails (e.g. opened without a server).
const FALLBACK_DATA = [{"id": 1, "name": "Parth Vishnu", "email": "parth.vishnu@symbiosis.edu.in", "roll": "24070521279", "department": "Computer Science & Engineering", "cgpa": 9.41, "attendance": 96, "status": "Dean's List", "skills": ["JavaScript", "Python", "React", "Docker"]}, {"id": 2, "name": "Priya Sharma", "email": "priya.sharma@symbiosis.edu.in", "roll": "24070521118", "department": "Artificial Intelligence & ML", "cgpa": 9.38, "attendance": 94, "status": "Dean's List", "skills": ["Python", "PyTorch", "OpenCV", "FastAPI"]}, {"id": 3, "name": "Rohan Deshmukh", "email": "rohan.deshmukh@symbiosis.edu.in", "roll": "24070521131", "department": "Computer Science & Engineering", "cgpa": 8.76, "attendance": 91, "status": "Good Standing", "skills": ["Java", "Spring Boot", "MySQL", "AWS"]}, {"id": 4, "name": "Sneha Kulkarni", "email": "sneha.kulkarni@symbiosis.edu.in", "roll": "24070521142", "department": "Data Science", "cgpa": 8.92, "attendance": 89, "status": "Good Standing", "skills": ["R", "Tableau", "SQL", "Pandas"]}, {"id": 5, "name": "Aditya Patil", "email": "aditya.patil@symbiosis.edu.in", "roll": "24070521155", "department": "Information Technology", "cgpa": 7.64, "attendance": 79, "status": "Needs Attention", "skills": ["HTML", "CSS", "PHP", "jQuery"]}, {"id": 6, "name": "Ananya Iyer", "email": "ananya.iyer@symbiosis.edu.in", "roll": "24070521163", "department": "Artificial Intelligence & ML", "cgpa": 9.57, "attendance": 98, "status": "Dean's List", "skills": ["TensorFlow", "NLP", "Python", "Keras"]}, {"id": 7, "name": "Vikram Joshi", "email": "vikram.joshi@symbiosis.edu.in", "roll": "24070521174", "department": "Information Technology", "cgpa": 8.15, "attendance": 85, "status": "Good Standing", "skills": ["Node.js", "MongoDB", "Express", "React"]}, {"id": 8, "name": "Meera Nair", "email": "meera.nair@symbiosis.edu.in", "roll": "24070521186", "department": "Data Science", "cgpa": 9.06, "attendance": 93, "status": "Dean's List", "skills": ["Power BI", "SQL", "Spark", "Python"]}, {"id": 9, "name": "Kunal Bhosale", "email": "kunal.bhosale@symbiosis.edu.in", "roll": "24070521197", "department": "Computer Science & Engineering", "cgpa": 7.28, "attendance": 74, "status": "Needs Attention", "skills": ["C++", "Linux", "Git", "Bash"]}, {"id": 10, "name": "Ishita Kapoor", "email": "ishita.kapoor@symbiosis.edu.in", "roll": "24070521208", "department": "Information Technology", "cgpa": 8.47, "attendance": 90, "status": "Good Standing", "skills": ["Angular", "TypeScript", "Firebase", "Sass"]}, {"id": 11, "name": "Arjun Menon", "email": "arjun.menon@symbiosis.edu.in", "roll": "24070521219", "department": "Computer Science & Engineering", "cgpa": 8.83, "attendance": 92, "status": "Good Standing", "skills": ["Go", "Kubernetes", "Redis", "gRPC"]}, {"id": 12, "name": "Tanvi Rao", "email": "tanvi.rao@symbiosis.edu.in", "roll": "24070521230", "department": "Artificial Intelligence & ML", "cgpa": 9.12, "attendance": 95, "status": "Dean's List", "skills": ["Scikit-learn", "Pandas", "SQL", "Python"]}];

// ---- DOM references ----
const tableBody    = document.getElementById("tableBody");
const searchBox    = document.getElementById("searchBox");
const deptFilter   = document.getElementById("deptFilter");
const statusFilter = document.getElementById("statusFilter");
const statMethod   = document.getElementById("statMethod");
const statLatency  = document.getElementById("statLatency");
const statCount    = document.getElementById("statCount");
const statStatus   = document.getElementById("statStatus");
const note         = document.getElementById("note");

document.getElementById("devName").textContent = DEVELOPER_NAME;
document.getElementById("devPrn").textContent  = DEVELOPER_PRN;

// ---- Application state ----
let students = [];
let sortKey = "id";
let sortDir = 1;     // 1 = ascending, -1 = descending

// Escape text before inserting into innerHTML
function esc(value) {
  return String(value).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// ---- Loading data: method 1 - native fetch() ----
function loadWithFetch() {
  const start = performance.now();
  setLoading("Native fetch()");

  fetch(DATA_URL)
    .then(function (response) {
      if (!response.ok) { throw new Error("HTTP " + response.status); }
      return response.json();                      // parse the JSON body
    })
    .then(function (data) {
      onLoaded(data, "Native fetch()", start, "200 OK (data.json)", "ok");
    })
    .catch(function () {
      useFallback("Native fetch()", start);
    });
}

// ---- Loading data: method 2 - jQuery $.getJSON() ----
function loadWithJQuery() {
  const start = performance.now();
  setLoading("jQuery $.getJSON()");

  $.getJSON(DATA_URL)
    .done(function (data) {
      onLoaded(data, "jQuery $.getJSON()", start, "200 OK (data.json)", "ok");
    })
    .fail(function () {
      useFallback("jQuery $.getJSON()", start);
    });
}

function setLoading(method) {
  statMethod.textContent = method;
  statStatus.textContent = "Loading...";
  statStatus.className = "stat-value warn";
  note.textContent = "";
}

// Used when the real request is blocked (typical on file:// pages)
function useFallback(method, start) {
  onLoaded(FALLBACK_DATA, method, start, "Fallback (embedded data)", "warn");
  note.textContent = "Note: the browser blocked the request for data.json (file:// protocol), so the embedded copy was used. Run with VS Code Live Server to load the real file.";
}

function onLoaded(data, method, start, statusText, statusClass) {
  students = data;
  statMethod.textContent  = method;
  statLatency.textContent = Math.round(performance.now() - start) + " ms";
  statCount.textContent   = data.length + " items";
  statStatus.textContent  = statusText;
  statStatus.className    = "stat-value " + statusClass;
  if (statusClass === "ok") { note.textContent = ""; }
  fillFilters();
  render();
}

// Fill department / status dropdowns from the loaded data
function fillFilters() {
  const depts    = Array.from(new Set(students.map(function (s) { return s.department; }))).sort();
  const statuses = Array.from(new Set(students.map(function (s) { return s.status; }))).sort();
  deptFilter.innerHTML   = '<option value="">All Departments</option>' + depts.map(function (d) { return '<option value="' + esc(d) + '">' + esc(d) + "</option>"; }).join("");
  statusFilter.innerHTML = '<option value="">All Statuses</option>'    + statuses.map(function (s) { return '<option value="' + esc(s) + '">' + esc(s) + "</option>"; }).join("");
}

// ---- Dynamic rendering: build one <tr> per record ----
function badgeClass(status) {
  if (status === "Dean's List") { return "dean"; }
  if (status === "Good Standing") { return "good"; }
  return "attn";
}

function getVisibleRows() {
  const q = searchBox.value.trim().toLowerCase();
  const dept = deptFilter.value;
  const stat = statusFilter.value;

  return students
    .filter(function (s) {
      const text = (s.name + " " + s.roll + " " + s.department + " " + s.skills.join(" ")).toLowerCase();
      return (!q || text.indexOf(q) !== -1) && (!dept || s.department === dept) && (!stat || s.status === stat);
    })
    .sort(function (a, b) {
      const x = a[sortKey], y = b[sortKey];
      if (typeof x === "number") { return (x - y) * sortDir; }
      return String(x).localeCompare(String(y)) * sortDir;
    });
}

function render() {
  const rows = getVisibleRows();

  if (students.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="9" class="empty">No data loaded. Click a load button above.</td></tr>';
  } else if (rows.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="9" class="empty">No records match your search or filters.</td></tr>';
  } else {
    let html = "";
    rows.forEach(function (s) {
      html += "<tr>" +
        "<td>#" + s.id + "</td>" +
        '<td><div class="student-name">' + esc(s.name) + '</div><div class="student-email">' + esc(s.email) + "</div></td>" +
        '<td class="roll">' + esc(s.roll) + "</td>" +
        "<td>" + esc(s.department) + "</td>" +
        '<td class="cgpa">' + s.cgpa.toFixed(2) + "</td>" +
        "<td>" + s.attendance + "%</td>" +
        '<td><span class="badge ' + badgeClass(s.status) + '">' + esc(s.status) + "</span></td>" +
        "<td>" + s.skills.map(function (k) { return '<span class="skill">' + esc(k) + "</span>"; }).join("") + "</td>" +
        '<td><button class="view-btn" data-id="' + s.id + '">👁 View</button></td>' +
        "</tr>";
    });
    tableBody.innerHTML = html;
  }
  updateArrows();
}

function updateArrows() {
  document.querySelectorAll("th[data-key]").forEach(function (th) {
    th.querySelector(".arrow").textContent = th.dataset.key === sortKey ? (sortDir === 1 ? "▲" : "▼") : "";
  });
}

// ---- Clear + Export ----
function clearTable() {
  students = [];
  document.getElementById("detail").style.display = "none";
  statMethod.textContent  = "None";
  statLatency.textContent = "-";
  statCount.textContent   = "0 items";
  statStatus.textContent  = "Idle";
  statStatus.className    = "stat-value";
  note.textContent = "";
  fillFilters();
  render();
}

function exportCSV() {
  const rows = getVisibleRows();
  if (rows.length === 0) { alert("Nothing to export. Load data first."); return; }
  const header = ["ID", "Name", "Email", "Roll No", "Department", "CGPA", "Attendance", "Status", "Skills"];
  const lines = [header.join(",")].concat(rows.map(function (s) {
    return [s.id, s.name, s.email, s.roll, s.department, s.cgpa, s.attendance, s.status, s.skills.join(" | ")]
      .map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
  }));
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "students.csv";
  link.click();
}

// ---- Event listeners ----
document.getElementById("fetchBtn").addEventListener("click", loadWithFetch);
document.getElementById("jqueryBtn").addEventListener("click", loadWithJQuery);
document.getElementById("clearBtn").addEventListener("click", clearTable);
document.getElementById("csvBtn").addEventListener("click", exportCSV);
searchBox.addEventListener("input", render);
deptFilter.addEventListener("change", render);
statusFilter.addEventListener("change", render);

document.querySelectorAll("th[data-key]").forEach(function (th) {
  th.addEventListener("click", function () {
    const key = th.dataset.key;
    sortDir = (sortKey === key) ? -sortDir : 1;
    sortKey = key;
    render();
  });
});

document.getElementById("themeBtn").addEventListener("click", function () {
  document.body.classList.toggle("dark");
  this.textContent = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// ---- "View" action: show the full record of the clicked student ----
const detail = document.getElementById("detail");
tableBody.addEventListener("click", function (e) {
  const btn = e.target.closest(".view-btn");
  if (!btn) { return; }
  const s = students.find(function (x) { return x.id === Number(btn.dataset.id); });
  detail.innerHTML = "<b>" + esc(s.name) + "</b> (" + esc(s.roll) + ") &bull; " + esc(s.email) +
    "<br>" + esc(s.department) + " &bull; CGPA " + s.cgpa.toFixed(2) + " &bull; Attendance " + s.attendance + "% &bull; " + esc(s.status) +
    "<br>Skills: " + s.skills.map(esc).join(", ");
  detail.style.display = "block";
});
