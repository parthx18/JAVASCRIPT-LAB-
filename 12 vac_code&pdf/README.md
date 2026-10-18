# Campus Event & Workshop Registration System
Author: Parth Vishnu | PRN: 24070521279

## Run
Open `index.html` in a browser. Works offline (falls back to embedded data).
For real AJAX loading of `data/workshops.json`, serve the folder:
    python -m http.server 8000   ->  http://localhost:8000

## Features
- Live seat availability per session (AJAX from data/workshops.json + localStorage registrations)
- Validated registration form (name, PRN 11 digits, email, mobile, department, year, session, duplicate + full checks)
- Roster with search, session/department filters, sort (dropdown or column headers), CSV export, cancel
- Statistics: sessions, registrations, seats left, % filled, localStorage usage
- Auto-refresh timer (Off / 5 / 10 / 30 / 60 s), manual refresh, cross-tab sync via the storage event
- "Simulate other students" toggle to watch seats change in real time
- Responsive layout (table becomes cards on phones), dark mode, keyboard accessible

## Files
index.html | css/style.css | js/app.js | js/jquery.min.js (v3.7.1) | data/workshops.json
