async function initQuiz() {
  
  state.startTime = new Date();
  // Load settings.json (tells us which quiz files to load)
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
    <!-- floating timer (independent of quiz card) -->
    <div id="timerContainer">
      <div id="timer" class="timer">00:00</div>
      <button id="toggleTimerBtn" class="secondary">Hide Timer</button>
    </div>

    <div class="container">
      <div class="card">
        <h1>${state.quiz.title}</h1>
        <div id="sections"></div>
        <hr/>
        <button id="submitBtn">Submit Quiz</button>
      </div>
    </div>
  `;

  // Sections
  const sectionsEl = qs("#sections");
  state.quiz.sections.forEach(sec => {
    if (sec.type === "matching") sectionsEl.appendChild(renderMatchingSection(sec));
    if (sec.type === "true_false") sectionsEl.appendChild(renderTFSection(sec));
    if (sec.type === "matching_pictures") sectionsEl.appendChild(renderMatchingPicturesSection(sec));
    if (sec.type === "multiple_choice") sectionsEl.appendChild(renderMCSection(sec));
  });

  qs("#submitBtn").addEventListener("click", onSubmit);

  // Timer logic
  state.startTime = new Date();
  startTimer();

  qs("#toggleTimerBtn").addEventListener("click", () => {
    const timerEl = qs("#timer");
    if (timerEl.style.display === "none") {
      timerEl.style.display = "block";
      qs("#toggleTimerBtn").textContent = "Hide Timer";
    } else {
      timerEl.style.display = "none";
      qs("#toggleTimerBtn").textContent = "Show Timer";
    }
  });
}

function startTimer() {
  const timerEl = qs("#timer");
  function update() {
    const now = new Date();
    const elapsed = Math.floor((now - state.startTime) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");
    timerEl.textContent = `${minutes}:${seconds}`;
  }
  update();
  state.timerInterval = setInterval(update, 1000);
}

function onSubmit() {
  state.endTime = new Date();
  const res = gradeQuiz();
  showSummary(res);
  //sendResultsByEmail(res);
  localStorage.setItem(state.settings.quizid + state.user, "true");
  logout(); // defined in auth.js
}