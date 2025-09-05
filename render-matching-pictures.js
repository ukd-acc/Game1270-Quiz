/* ---------- MATCHING WITH PICTURES ---------- */
function renderMatchingPicturesSection(section) {
  const wrapper = document.createElement("div");
  wrapper.className = "section matching-pictures";
  wrapper.innerHTML = `<h2>${section.title}</h2><p>${section.instructions}</p>`;

  const prompts = shuffleArray(section.prompts);

  prompts.forEach((q, idx) => {
    const row = document.createElement("div");
    row.className = "prompt-row";

    const media = document.createElement("div");
    media.className = "prompt-media";
    media.innerHTML = `
      <img src="${q.image}" alt="Prompt ${idx + 1}" class="prompt-image" />
      <div class="prompt-caption">${q.question || ""}</div>
    `;

    const selectWrap = document.createElement("div");
    selectWrap.className = "answer-select";

    const select = document.createElement("select");
    const options = shuffleArray(section.word_bank || []);
    select.innerHTML =
      `<option value="">-- Select --</option>` +
      options.map(opt => `<option value="${opt.text}">${opt.text}</option>`).join("");

    select.name = q.qid;
    select.addEventListener("change", () => {
      state.answers[q.qid] = select.value;
    });

    selectWrap.appendChild(select);
    row.appendChild(media);
    row.appendChild(selectWrap);
    wrapper.appendChild(row);
  });

  return wrapper;
}

  