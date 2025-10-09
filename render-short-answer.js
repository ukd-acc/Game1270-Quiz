function renderShortAnswerSection(section) {
  const wrapper = document.createElement("div");
  wrapper.className = "section shortanswer";
  wrapper.innerHTML = `<h2>${section.title}</h2><p>${section.instructions}</p>`;

  section.questions.forEach((q, idx) => {
    const questionBox = document.createElement("div");
    questionBox.className = "question-box"; // Add box around each question

    const row = document.createElement("div");
    row.className = "sa-row";

    const prompt = document.createElement("p");
    prompt.textContent = `${idx + 1}. ${q.prompt}`;
    row.appendChild(prompt);

    const textarea = document.createElement("textarea");
    textarea.className = "sa-input";
    textarea.dataset.question = idx; // Associate input with question index
    row.appendChild(textarea);

    questionBox.appendChild(row);
    wrapper.appendChild(questionBox);
  });

  return wrapper;
}