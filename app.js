async function initQuiz() {
  
  state.startTime = new Date();
  // Load settings.json (tells us which quiz files to load)
  state.settings = await loadJSON("settings.json");
  state.quiz = { title: state.settings.title, sections: [] };

  // Load each section
  for (const sec of state.settings.sections) {
    const data = await loadJSON(sec.file);
    state.quiz.sections.push(data);
  }

  renderQuiz();
    // After quiz loads
  initEmail();
}

function renderQuiz() {
  const app = qs("#app");
  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h1>${state.quiz.title}</h1>
        <div id="sections"></div>
        <hr/>
        <button id="submitBtn">Submit Quiz</button>
      </div>
    </div>
  `;

  const sectionsEl = qs("#sections");
  state.quiz.sections.forEach(sec => {
    if (sec.type === "matching") sectionsEl.appendChild(renderMatchingSection(sec));
    if (sec.type === "true_false") sectionsEl.appendChild(renderTFSection(sec));
    if (sec.type === "matching_pictures") sectionsEl.appendChild(renderMatchingPicturesSection(sec));
  });
  
  qs("#submitBtn").addEventListener("click", onSubmit);
}


function onSubmit() {
  state.endTime = new Date();
  const res = gradeQuiz();
  showSummary(res);
  //sendResultsByEmail(res);
  localStorage.setItem(state.settings.quizid + state.user, "true");
  logout(); // defined in auth.js
}