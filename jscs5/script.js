document.getElementById('use-sample').addEventListener('click', () => {
  document.getElementById('numbers').value = '3, 5, -2, 10, 0, 42';
});

document.getElementById('compute').addEventListener('click', () => {
  const raw = document.getElementById('numbers').value.trim();
  const arr = parseNumbers(raw);
  const resultEl = document.getElementById('result');
  if (arr.length === 0) {
    resultEl.textContent = 'No valid numbers found.';
    return;
  }
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  resultEl.innerHTML = `<p>Array: [${arr.join(', ')}]</p><p>Min: <strong>${min}</strong></p><p>Max: <strong>${max}</strong></p>`;
});

function parseNumbers(input) {
  if (!input) return [];
  const parts = input.split(/[\s,]+/).filter(s => s.length > 0);
  const nums = parts.map(s => parseFloat(s)).filter(n => !Number.isNaN(n));
  return nums;
}
