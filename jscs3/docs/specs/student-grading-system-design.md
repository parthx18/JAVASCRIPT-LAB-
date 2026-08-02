# Student Grading System - Design Document

## 1. Overview
The Student Grading System is an interactive web page built with HTML, CSS, and JavaScript. It accepts student details and subject marks, validates inputs using JavaScript control structures, calculates total marks, percentage, letter grade, and pass/fail status, and renders a summary table, a detailed report card, and an academic explanation of JavaScript concepts used in the implementation.

## 2. Requirements & UI Specification

### Header
- Page Title: **Student Grading System**
- Subtitle: *Experiment 03 — Control structures & form validation*

### Card 1: Enter Student Details (Form)
- **Student Name** (`text` input, required)
- **Roll No.** (`text` or `number` input, required)
- **Subject Marks (5 subjects)**:
  - English (0 - 100)
  - Maths (0 - 100)
  - Science (0 - 100)
  - Physics (0 - 100)
  - Chemistry (0 - 100)
- **Action Buttons**:
  - `Calculate Grade` (Green primary button `#28a745` / `#198754`)
  - `Reset` (Blue secondary button `#0d6efd`)

### Card 2: Results Summary Table
- Columns: `#`, `NAME`, `ROLL`, `TOTAL`, `%`, `GRADE`, `STATUS`
- Dynamic display of calculated results with color-coded badges:
  - Grade: `A+`, `A`, `B+`, `B`, `C`, `F` (Styled pill tag)
  - Status: `PASS` (Green badge) or `FAIL` (Red badge)

### Card 3: Report Card (Detailed Subject Breakdown)
- Student Details Header: Name and Roll Number
- Subject Marks Table:
  - `SUBJECT` | `MARKS` | `STATUS`
  - Shows each subject score (e.g. `98 / 100`) and individual subject Pass (`≥ 40`) or Fail status pill.
- Total Summary Bar:
  - `Total: XXX / 500`
  - `Percentage: XX.XX%`
  - `Grade: [Badge]`
  - `STATUS: [PASS / FAIL]`

### Card 4: JS Concepts Used
- Table mapping JavaScript control structures to their exact role in the code:
  - `if / else`: Form validation — checks empty fields, numeric ranges (0-100), and subject/overall pass/fail logic.
  - `switch`: Maps percentage ranges to letter grades (`A+`, `A`, `B+`, `B`, `C`, `F`).
  - `for`: Iterates through the 5 subject mark inputs for validation, summing total marks, and generating subject rows.
  - `while`: Scans marks array to count subjects scoring distinction (≥ 75).

## 3. Technology Stack & Design System
- **HTML5**: Semantic tags (`<main>`, `<section>`, `<table>`, `<form>`).
- **CSS3**: Modern clean UI with custom CSS properties, flexbox/grid layout, responsive design, pill badges, and soft card shadows. Font: Inter / Segoe UI.
- **JavaScript (Vanilla ES6+)**: Form validation, event handling, dynamic HTML creation, control structures (`if/else`, `switch`, `for`, `while`).

## 4. Verification & Testing
- Test form validation with empty fields and invalid numbers (< 0 or > 100).
- Verify grade boundaries (≥90 -> A+, ≥80 -> A, ≥70 -> B+, ≥60 -> B, ≥50 -> C, <50 -> F).
- Verify pass/fail logic (Pass if all individual subjects ≥ 40 and percentage ≥ 40).
- Test reset functionality.
