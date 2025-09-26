function shuffleArray(arr) {
  const a = [...arr]; // copy
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// app.js
async function initApp() {
  // load settings once
  state.settings = await loadJSON("settings.json");

  // init auth (users)
  await initAuth();

  initEmail();
  renderLogin();
  
}



async function initQuiz() {
  state.settings = await loadJSON("settings.json");
  state.quiz = { title: state.settings.title, sections: [] };

  const quizFolder = state.selectedQuizFolder; // Use the folder selected during login

  for (const secMeta of state.settings.sections) {
    const sec = await loadJSON(`${quizFolder}/${secMeta.file}`);

    // Shuffle once here
    if (sec.type === "matching") {
      sec.prompts = shuffleArray(sec.prompts);
      sec.word_bank = shuffleArray(sec.word_bank);   // shuffle dropdown answers
    }
    else if (sec.type === "true_false") {
      sec.questions = shuffleArray(sec.questions);
    }
    else if (sec.type === "multiple_choice") {
      sec.prompts = shuffleArray(sec.prompts);
      // also shuffle the answer options for each question
      sec.prompts.forEach(q => {
        q.answers = shuffleArray(q.answers || q.answer); 
      });
    }
    else if (sec.type === "matching_pictures") {
      sec.prompts = shuffleArray(sec.prompts);
      sec.word_bank = shuffleArray(sec.word_bank);
    }

    state.quiz.sections.push(sec);
  }

  renderQuiz();
}

function renderQuiz() {
  const app = qs("#app");
  app.innerHTML = `
    <!-- floating timer (independent of quiz card) -->
      <div id="timerContainer">
        <button id="toggleTimerBtn" class="secondary">Hide Timer</button>
        <div id="timer" class="timer">00:00</div>
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
  sendResultsByEmail(res);
}

window.addEventListener("DOMContentLoaded", initApp);