// main.js - wires routine + timer + UI together
import { routine, nextIndex } from "./routine.js";
import { createTimer } from "./timer.js";
import {
  renderClock, renderCountdown, renderUpcoming, renderRoutine,
  highlightActive, showStatus, resetStatus, el,
} from "./ui.js";

window.__modulesLoaded = true;
document.getElementById("modeBadge").textContent =
  location.protocol === "file:" ? "Direct File Mode: ES6 Module (file://)" : "ES6 Modules (http)";

let current = 0;
let advanceTimeout = null;

const timer = createTimer({
  onTick: renderCountdown,
  onFinish: onClassStart,
});

function loadClass(index) {
  current = index;
  renderUpcoming(routine[current]);
  highlightActive(current);
  timer.set(routine[current].duration);
}

// Timer reached zero -> notify with setTimeout, then move to the next class
function onClassStart() {
  const started = routine[current];
  showStatus(`🔔 Started: ${started.subject}!`);

  advanceTimeout = setTimeout(() => {
    loadClass(nextIndex(current));
    resetStatus();
    timer.start();
  }, 3000);
}

function cancelAdvance() {
  clearTimeout(advanceTimeout);
  advanceTimeout = null;
}

// ---- Controls (DOM event listeners) ----
el.$("startBtn").addEventListener("click", () => {
  cancelAdvance();
  if (timer.remaining === 0) loadClass(current);
  timer.start();
});

el.$("pauseBtn").addEventListener("click", () => {
  cancelAdvance();
  timer.pause();
});

el.$("resetBtn").addEventListener("click", () => {
  cancelAdvance();
  loadClass(current);
  resetStatus();
});

el.$("setBtn").addEventListener("click", () => {
  const input = el.$("secondsInput");
  const value = parseInt(input.value, 10);
  if (!Number.isFinite(value) || value <= 0) {
    showStatus("Enter a valid number of seconds.", 2000);
    return;
  }
  cancelAdvance();
  timer.set(value);
  input.value = "";
  showStatus(`Countdown set to ${value}s.`, 2000);
});

// ---- Init ----
renderRoutine();
loadClass(0);
renderClock();
setInterval(renderClock, 1000);   // live clock
