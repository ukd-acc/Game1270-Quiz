/* ---------- TRUE/FALSE SECTION ---------- */
function renderTFSection(section) {
    const wrapper = document.createElement("div");
    wrapper.className = "section truefalse";
    wrapper.innerHTML = `<h2>${section.title}</h2><p>${section.instructions}</p>`;
  
    const questions = shuffleArray(section.questions);
    questions.forEach((q, idx) => {
      const row = document.createElement("div");
      row.className = "tf-row";
      
      const text = document.createElement("div");
      text.textContent = `${idx + 1}. ${q.question}`;
  
      const answers = document.createElement("div");
      answers.className = "answers";
  
      // "True" radio
      const trueLabel = document.createElement("label");
      const trueInput = document.createElement("input");
      trueInput.type = "radio";
      trueInput.name = `tf-${idx}`;
      trueInput.value = "true";
      trueInput.onchange = () => state.answers[`tf-${idx}`] = true;
      trueLabel.appendChild(trueInput);
      trueLabel.appendChild(document.createTextNode(" True"));
  
      // "False" radio
      const falseLabel = document.createElement("label");
      const falseInput = document.createElement("input");
      falseInput.type = "radio";
      falseInput.name = `tf-${idx}`;
      falseInput.value = "false";
      falseInput.onchange = () => state.answers[`tf-${idx}`] = false;
      falseLabel.appendChild(falseInput);
      falseLabel.appendChild(document.createTextNode(" False"));
  
      answers.appendChild(trueLabel);
      answers.appendChild(falseLabel);
  
      row.appendChild(text);
      row.appendChild(answers);
      wrapper.appendChild(row);
    });
  
    return wrapper;
  }
  