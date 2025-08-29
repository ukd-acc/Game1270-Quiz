/* ---------- MATCHING SECTION ---------- */
function renderMatchingSection(section) {
    const wrapper = document.createElement("div");
    wrapper.className = "matching-section";
    wrapper.innerHTML = `<h2>${section.title}</h2><p>${section.instructions}</p>`;
  
    // Word bank of draggable tiles
    const bank = document.createElement("div");
    bank.className = "wordbank";
    section.word_bank.forEach(opt => {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.setAttribute("draggable", "true");
      tile.dataset.letter = opt.letter;
      tile.innerHTML = `<strong>${opt.letter}</strong> — ${opt.text}`;
      bank.appendChild(tile);
    });
    wrapper.appendChild(bank);
  
    // Prompts
    section.prompts.forEach((q, idx) => {
      const row = document.createElement("div");
      row.className = "prompt-row";
  
      const text = document.createElement("div");
      text.className = "prompt-text";
      text.textContent = `${idx + 1}. ${q.question}`;
  
      const dropSelect = document.createElement("div");
      dropSelect.className = "drop-select";
      dropSelect.dataset.idx = idx;
  
      const placeholder = document.createElement("span");
      placeholder.className = "placeholder";
      placeholder.textContent = "Drop letter here";
  
      // Dropdown as backup input
      const select = document.createElement("select");
      select.innerHTML = `<option value="">-- Select --</option>` +
        section.word_bank.map(opt => `<option value="${opt.letter}">${opt.letter}: ${opt.text}</option>`).join("");
  
      dropSelect.appendChild(placeholder);
      dropSelect.appendChild(select);
  
      // Update when dropdown is used
      select.addEventListener("change", () => {
        const val = select.value;
        state.answers[`matching-${idx}`] = val;
        placeholder.textContent = val || "Drop letter here";
      });
  
      // Update when drag/drop is used
      dropSelect.addEventListener("dragover", e => e.preventDefault());
      dropSelect.addEventListener("drop", e => {
        e.preventDefault();
      
        // Get the dragged letter
        const letter = e.dataTransfer.getData("text/plain").toUpperCase();
      
        // Save into state
        state.answers[`matching-${idx}`] = letter;
      
        // Sync dropdown + placeholder text
        select.value = letter;
        placeholder.textContent = letter;
      });
      
  
      row.appendChild(text);
      row.appendChild(dropSelect);
      wrapper.appendChild(row);
    });
  
    enableDnD();
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
  