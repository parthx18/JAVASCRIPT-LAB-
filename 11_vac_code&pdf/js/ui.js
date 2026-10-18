// ui.js - all DOM updates (textContent only, no page reload)
import { routine } from "./routine.js";

const $ = (id) => document.getElementById(id);

const DEFAULT_STATUS = "Ready for next class.";
let statusTimeout = null;

export function formatCountdown(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function renderClock() {
  $("clock").textContent = new Date().toLocaleTimeString("en-US");
}

export function renderCountdown(seconds) {
  $("countdown").textContent = formatCountdown(seconds);
}

export function renderUpcoming(item) {
  $("upcoming").textContent = `Upcoming: ${item.subject} (${item.venue})`;
}

export function highlightActive(index) {
  document.querySelectorAll("#routineList li").forEach((li, i) => {
    li.classList.toggle("active", i === index);
  });
}

export function renderRoutine() {
  const list = $("routineList");
  list.innerHTML = "";
  routine.forEach((c) => {
    const li = document.createElement("li");
    li.innerHTML = `<b></b><span></span><span></span>`;
    li.children[0].textContent = c.subject;
    li.children[1].textContent = `(${c.venue})`;
    li.children[2].textContent = `${c.duration}s`;
    list.appendChild(li);
  });
}

// setTimeout(): clear a temporary message after a short time
export function showStatus(message, clearAfterMs = 0) {
  clearTimeout(statusTimeout);
  $("status").textContent = message;
  if (clearAfterMs > 0) {
    statusTimeout = setTimeout(() => {
      $("status").textContent = DEFAULT_STATUS;
    }, clearAfterMs);
  }
}

export function resetStatus() {
  showStatus(DEFAULT_STATUS);
}

export const el = { $ };
