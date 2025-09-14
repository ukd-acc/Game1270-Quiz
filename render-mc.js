/* ---------- MULTIPLE CHOICE SECTION ---------- */
function renderMCSection(section) {
  const wrapper = document.createElement("div");
  wrapper.className = "section multiplechoice";
  wrapper.innerHTML = `<h2>${section.title}</h2><p>${section.instructions}</p>`;

  section.prompts.forEach((q, idx) => {
    const div = document.createElement("div");
    div.className = "mc-row"; // Ensure this wraps all options

    const questionEl = document.createElement("p");
    questionEl.textContent = `${idx + 1}. ${q.question}`;
    div.appendChild(questionEl);

    q.answers.forEach(ans => {
      const label = document.createElement("label");
      label.className = "mc-option";

      /*
      // Radio button
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `mc-${idx}`;
      input.value = ans;
      input.onchange = () => {
        state.answers[`mc-${idx}`] = ans;
      };*/

      // Answer text in span
      const textSpan = document.createElement("span");
      textSpan.textContent = ans;

      // Build label
      //label.appendChild(input);
      label.appendChild(textSpan);

      div.appendChild(label);
    });

    wrapper.appendChild(div);
  });

  return wrapper;
}

