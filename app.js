async function init() {
  // Load settings.json (tells us which quiz files to load)
  state.settings = await loadJSON("settings.json");
  state.quiz = { title: state.settings.title, sections: [] };

  // Load each section (matching.json, truefalse.json, etc.)
  for (const sec of state.settings.sections) {
    const data = await loadJSON(sec.file);
    state.quiz.sections.push(data);
  }

  renderQuiz();
}

function renderQuiz() {
  const app = qs("#app");
  app.innerHTML = `<h1>${state.quiz.title}</h1>`;

  state.quiz.sections.forEach(sec => {
    if (sec.type === "matching") app.appendChild(renderMatchingSection(sec));
    if (sec.type === "true_false") app.appendChild(renderTFSection(sec));
  });

  const btn = document.createElement("button");
  btn.textContent = "Submit Quiz";
  btn.onclick = onSubmit;
  app.appendChild(btn);
}

function onSubmit() {
  const res = gradeQuiz();
  showSummary(res);
}

window.addEventListener("DOMContentLoaded", init);
