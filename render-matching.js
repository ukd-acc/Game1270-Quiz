/* ---------- MATCHING SECTION (dropdown only) ---------- */
function renderMatchingSection(section) {
  const wrapper = document.createElement("div");
  wrapper.className = "section matching";
  wrapper.innerHTML = `<h2>${section.title}</h2><p>${section.instructions}</p>`;

  const prompts = shuffleArray(section.prompts);               // shuffle question order

  prompts.forEach((q, idx) => {
    const row = document.createElement("div");
    row.className = "prompt-row";

    const text = document.createElement("div");
    text.className = "prompt-text";
    text.textContent = `${idx + 1}. ${q.question}`;

    const selectWrap = document.createElement("div");
    selectWrap.className = "drop-select";

    const select = document.createElement("select");
    const options = shuffleArray(section.word_bank || []);     // shuffle dropdown choices

    select.innerHTML =
      `<option value="">-- Select --</option>` +
      options.map(opt => `<option value="${opt.text}">${opt.text}</option>`).join("");

    // use stable qid as the name and answer key
    select.name = q.qid;
    select.addEventListener("change", () => {
      state.answers[q.qid] = select.value;
    });

    selectWrap.appendChild(select);
    row.appendChild(text);
    row.appendChild(selectWrap);
    wrapper.appendChild(row);
  });

  return wrapper;
}

  
  
  // Enable drag & drop by binding events to word bank tiles
  function enableDnD() {
    qsa(".tile").forEach(tile => {
      tile.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", tile.dataset.letter);
        tile.classList.add("dragging");
      });
      tile.addEventListener("dragend", () => tile.classList.remove("dragging"));
    });
  }
  