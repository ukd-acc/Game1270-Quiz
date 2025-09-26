// Shorthand for querySelector (like a DOM pointer grab).
function qs(sel) { return document.querySelector(sel); }

// Shorthand for querySelectorAll (returns array of elements).
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

// Load JSON file asynchronously.
// If the file doesn't exist, return null instead of throwing an error.
async function loadJSON(path) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + path);
    return await res.json();
  } catch (error) {
    console.warn(`Warning: ${error.message}`);
    return null; // Return null if the file doesn't exist or fails to load
  }
}
