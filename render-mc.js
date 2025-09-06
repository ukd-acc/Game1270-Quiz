/* ---------- MULTIPLE CHOICE SECTION ---------- */
function renderMCSection(section) {
    const wrapper = document.createElement("div");
    wrapper.className = "section multiple-choice";
    wrapper.innerHTML = `<h2>${section.title}</h2><p>${section.instructions}</p>`;
  
    section.prompts.forEach((q, idx) => {
      const div = document.createElement("div");
      div.className = "mc-row";
      div.innerHTML = `<p>${idx + 1}. ${q.question}</p>`;
  
      q.answers.forEach(ans => {
        const label = document.createElement("label");
        label.className = "mc-option";
      
        const input = document.createElement("input");
        input.type = "radio";
        input.name = `mc-${idx}`;
        input.value = ans;
        input.onchange = () => state.answers[`mc-${idx}`] = ans;
      
        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + ans));
        div.appendChild(label);
      });
  
      wrapper.appendChild(div);
    });
  
    return wrapper;
  }
  