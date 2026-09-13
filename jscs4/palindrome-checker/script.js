/* =========================================================
   PALINDROME CHECKER — script.js
   Demonstrates: function declarations, function expressions,
   arrow functions, variable scope, closures, try-catch
   ========================================================= */

/* ---------- 1. FUNCTION DECLARATION ----------
   Hoisted — could technically be called before this line runs. */
function cleanString(raw, ignoreSpaces, caseSensitive) {
  let output = raw;
  if (ignoreSpaces) {
    output = output.replace(/[^a-zA-Z0-9]/g, "");
  }
  if (!caseSensitive) {
    output = output.toLowerCase();
  }
  return output;
}

/* ---------- 2. FUNCTION EXPRESSION ----------
   Assigned to a variable — only usable after this line executes. */
const reverseString = function (str) {
  return str.split("").reverse().join("");
};

/* ---------- 3. ARROW FUNCTION ----------
   Concise syntax, no own `this` — perfect for a short comparison. */
const isPalindrome = (processed, reversed) => processed === reversed && processed.length > 0;

/* ---------- 4. CLOSURE ----------
   createChecker() returns a function that keeps a private
   `checkCount` variable alive in its closure — the outside
   world can never touch `checkCount` directly. */
function createChecker() {
  let checkCount = 0; // private state, function-scoped

  return function runCheck(raw, ignoreSpaces, caseSensitive) {
    checkCount++;
    const processed = cleanString(raw, ignoreSpaces, caseSensitive);
    const reversed = reverseString(processed);
    const result = isPalindrome(processed, reversed);
    return { processed, reversed, result, checkCount };
  };
}

// A single checker instance shared by both input fields —
// its internal checkCount persists across every click.
const runChecker = createChecker();

/* ---------- DOM REFERENCES ---------- */
const textInput = document.getElementById("textInput");
const seqInput = document.getElementById("seqInput");
const ignoreSpaces = document.getElementById("ignoreSpaces");
const caseSensitive = document.getElementById("caseSensitive");
const verifyBtn = document.getElementById("verifyBtn");
const clearBtn = document.getElementById("clearBtn");
const errorMsg = document.getElementById("errorMsg");
const runCountLabel = document.getElementById("runCount");
const presetChips = document.getElementById("presetChips");

/* ---------- 5. TRY-CATCH: VALIDATION ----------
   Guards against empty, non-string, or otherwise unusable input. */
function validateInput(value, label) {
  try {
    if (value === null || value === undefined) {
      throw new Error(`${label} is missing.`);
    }
    const asString = String(value).trim();
    if (asString.length === 0) {
      throw new Error(`${label} cannot be empty.`);
    }
    return asString;
  } catch (err) {
    // Re-thrown with context so the caller can display it,
    // rather than letting the app crash silently.
    throw err;
  }
}

/* ---------- RENDER HELPERS ---------- */
function renderResult(prefix, original, processed, reversed, result) {
  document.getElementById(`${prefix}Original`).textContent = original;
  document.getElementById(`${prefix}Processed`).textContent = processed || "—";
  document.getElementById(`${prefix}Reversed`).textContent = reversed || "—";
  document.getElementById(`${prefix}Length`).textContent = processed.length;

  const badge = document.getElementById(`${prefix}Badge`);
  const card = document.getElementById(`${prefix}ResultCard`);
  badge.textContent = result ? "✓ Palindrome" : "✕ Not a Palindrome";
  badge.className = "badge " + (result ? "true" : "false");
  card.className = "panel result-card " + (result ? "is-true" : "is-false");

  renderAlignment(`${prefix}Alignment`, processed);
}

function renderAlignment(containerId, processed) {
  const container = document.getElementById(containerId);
  container.innerHTML = ""; // block-scoped loop var below, container is outer scope

  const len = processed.length;
  for (let i = 0; i < len; i++) {
    // `i` is block-scoped (let) — safe to use inside this loop only
    const chip = document.createElement("span");
    chip.className = "char-chip";
    chip.textContent = processed[i] || "·";

    const mirrorChar = processed[len - 1 - i];
    if (processed[i] === mirrorChar) {
      chip.classList.add("match");
    } else {
      chip.classList.add("mismatch");
    }
    container.appendChild(chip);
  }
}

/* ---------- MAIN VERIFY HANDLER ---------- */
verifyBtn.addEventListener("click", () => {
  errorMsg.textContent = "";

  try {
    const rawText = validateInput(textInput.value, "Text input");
    const rawSeq = validateInput(seqInput.value, "Number/Sequence input");

    const ignoreOpt = ignoreSpaces.checked;
    const caseOpt = caseSensitive.checked;

    const textResult = runChecker(rawText, ignoreOpt, caseOpt);
    const seqResult = runChecker(rawSeq, ignoreOpt, caseOpt);

    renderResult("text", rawText, textResult.processed, textResult.reversed, textResult.result);
    renderResult("seq", rawSeq, seqResult.processed, seqResult.reversed, seqResult.result);

    // checkCount comes from the closure inside createChecker()
    runCountLabel.textContent = `${seqResult.checkCount} checks run`;

  } catch (err) {
    errorMsg.textContent = `⚠ ${err.message}`;
  }
});

/* ---------- CLEAR HANDLER ---------- */
clearBtn.addEventListener("click", () => {
  textInput.value = "";
  seqInput.value = "";
  errorMsg.textContent = "";
  ["text", "seq"].forEach((prefix) => {
    document.getElementById(`${prefix}Original`).textContent = "—";
    document.getElementById(`${prefix}Processed`).textContent = "—";
    document.getElementById(`${prefix}Reversed`).textContent = "—";
    document.getElementById(`${prefix}Length`).textContent = "—";
    document.getElementById(`${prefix}Badge`).textContent = "—";
    document.getElementById(`${prefix}Badge`).className = "badge";
    document.getElementById(`${prefix}ResultCard`).className = "panel result-card";
    document.getElementById(`${prefix}Alignment`).innerHTML = "";
  });
});

/* ---------- PRESET CHIPS ---------- */
presetChips.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  textInput.value = chip.dataset.text || "";
  seqInput.value = chip.dataset.seq || "";
});

/* ---------- RUN ONCE ON LOAD ---------- */
verifyBtn.click();
