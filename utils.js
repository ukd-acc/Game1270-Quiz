// Shorthand for querySelector (like a DOM pointer grab).
function qs(sel) { return document.querySelector(sel); }

// Shorthand for querySelectorAll (returns array of elements).
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

// Load JSON file asynchronously.
// Equivalent to fopen + parse JSON in C++.
// fetch() returns a Promise (like a future) → await resolves it.
async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load " + path);
  return res.json();
}
