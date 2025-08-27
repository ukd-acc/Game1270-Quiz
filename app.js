
/* Minimal, self-contained quiz app with login, matching + T/F, and auto-grading.
   - Edit users.sample.json to set usernames/passwords, then rename to users.json.
   - Edit quiz.json to change quiz content.
   - Host the folder anywhere static (GitHub Pages, Netlify, S3, local web server).
*/

const state = {
  user: null,
  quiz: null,
  users: null,
  answers: {
    matching: {},
    tf: {}
  },
  startTime: null,
  endTime: null
};

async function loadJSON(path) {
  const res = await fetch(path, {cache: "no-store"});
  if (!res.ok) throw new Error("Failed to load " + path);
  return res.json();
}

async function init() {
    try {
        state.users = await loadJSON("users.json");
    } catch (_) {
        state.users = await loadJSON("users.sample.json");
    }

    // load settings.json
    const settings = await loadJSON("settings.json");
    state.settings = settings;
    state.quiz = { quizId: settings.quizId, title: settings.title, course: settings.course, sections: [] };

    // dynamically load each section JSON
    for (const sec of settings.sections) {
        const data = await loadJSON(sec.file);
        state.quiz.sections.push(data);
    }

    if (localStorage.getItem("quiz_user")) {
        state.user = JSON.parse(localStorage.getItem("quiz_user"));
        renderApp();
    } else {
        renderLogin();
    }
}


function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

function renderLogin() {
  document.body.innerHTML = `
    <div class="container login">
      <div class="card">
        <div class="header">
          <div>
            <div class="logo">GAME1270 Quiz Portal</div>
            <div class="notice">Sign in with your assigned username and password.</div>
          </div>
          <span class="badge">Client-side demo auth</span>
        </div>
        <div class="row">
          <div>
            <label>Username</label>
            <input id="username" placeholder="e.g. alice" autocomplete="username"/>
          </div>
          <div>
            <label>Password</label>
            <input id="password" type="password" placeholder="Your password" autocomplete="current-password"/>
          </div>
        </div>
        <div class="login-actions">
          <div class="flex">
            <button id="loginBtn">Sign In</button>
            <button class="secondary" id="showHelp">Where do passwords come from?</button>
          </div>
          <div class="notice">No account? Ask your instructor.</div>
        </div>
        <hr/>
        <div class="footer">This demo stores results on your device and allows you to download a CSV upon submission.</div>
      </div>
    </div>
  `;
  qs("#loginBtn").addEventListener("click", onLogin);
  qs("#showHelp").addEventListener("click", () => {
    alert("Passwords are defined in users.json (or users.sample.json if users.json is missing). The instructor can edit that file and redeploy.");
  });
}

function onLogin() {
  const u = qs("#username").value.trim();
  const p = qs("#password").value;
  const account = state.users.find(x => x.username === u && x.password === p);
  if (!account) {
    alert("Invalid username or password.");
    return;
  }
  state.user = { username: account.username, fullName: account.fullName || account.username };
  localStorage.setItem("quiz_user", JSON.stringify(state.user));
  renderApp();
}

function logout() {
  localStorage.removeItem("quiz_user");
  location.reload();
}

function renderApp() {
    state.startTime = new Date();
    document.body.innerHTML = `
    <div class="container">
      <div class="card">
        <div class="header">
          <img src="${state.settings.logo}" alt="Logo" style="height:60px"/>
          <div>
            <h1>${state.quiz.title}</h1>
            <div class="notice">${state.quiz.course}</div>
          </div>
          <div class="flex">
            <span class="badge">${state.user.fullName} (${state.user.username})</span>
            <button class="secondary" id="logoutBtn">Sign out</button>
          </div>
        </div>
        <div class="notice">All answers are auto-graded on submission.</div>
        <hr/>
        <div id="sections"></div>
        <hr/>
        <div class="flex">
          <button id="submitBtn">Submit Quiz</button>
          <button class="secondary" id="clearBtn">Clear Answers</button>
        </div>
        <div id="summary" class="summary hidden"></div>
      </div>
    </div>
  `;
    qs("#logoutBtn").addEventListener("click", logout);
    qs("#submitBtn").addEventListener("click", onSubmit);
    qs("#clearBtn").addEventListener("click", () => {
        if (confirm("Clear all answers?")) { state.answers = { matching: {}, tf: {} }; renderApp(); }
    });

    const container = qs("#sections");
    state.quiz.sections.forEach(sec => {
        if (sec.type === "matching") renderMatching(sec, container);
        if (sec.type === "true_false") renderTF(sec, container);
    });
}

function renderMatching(q, index, wordBank) {
  const container = document.createElement("div");
  container.className = "matching-question";

  const prompt = document.createElement("p");
  prompt.textContent = `${index + 1}. ${q.question}`;
  container.appendChild(prompt);

  // Answer area for drag-drop
  const answerArea = document.createElement("div");
  answerArea.className = "answer-area";
  answerArea.textContent = "Drop here or select...";
  answerArea.dataset.index = index;

  // Drag/drop events
  answerArea.ondrop = (e) => {
    e.preventDefault();
    const value = e.dataTransfer.getData("text/plain");
    answerArea.textContent = value;
    state.answers[`matching-${index}`] = value;
  };
  answerArea.ondragover = (e) => e.preventDefault();

  // Dropdown fallback
  const select = document.createElement("select");
  select.innerHTML = `<option value="">-- Select --</option>` +
    wordBank.map(opt => `<option value="${opt.letter}">${opt.letter}: ${opt.text}</option>`).join("");

  select.onchange = () => {
    const value = select.value;
    answerArea.textContent = value ? value : "Drop here or select...";
    state.answers[`matching-${index}`] = value;
  };

  container.appendChild(answerArea);
  container.appendChild(select);

  return container;
}


function enableDnD() {
  qsa(".tile[draggable]").forEach(t => {
    t.addEventListener("dragstart", e => {
      t.classList.add("dragging");
      e.dataTransfer.setData("text/plain", t.dataset.letter);
    });
    t.addEventListener("dragend", () => t.classList.remove("dragging"));
  });
  qsa(".drop").forEach(d => {
    d.addEventListener("dragover", e => { e.preventDefault(); });
    d.addEventListener("drop", e => {
      e.preventDefault();
      const letter = e.dataTransfer.getData("text/plain");
      const idx = d.dataset.idx;
      // If drop target already has a tile, return it to bank first
      if (d.querySelector(".tile")) {
        const existing = d.querySelector(".tile").dataset.letter;
        returnTileToBank(existing);
      }
      // If this letter is currently used elsewhere, free it
      const used = qsa(`.drop .tile[data-letter="${letter}"]`);
      used.forEach(u => {
        u.parentElement.classList.remove("filled");
        u.parentElement.innerHTML = "Drop letter here";
      });

      state.answers.matching[idx] = letter;
      d.classList.add("filled");
      d.innerHTML = `<div class="tile" data-letter="${letter}"><strong>${letter}</strong></div>`;
    });
  });

  // Return-on-click: clicking a placed tile returns it to bank
  qsa(".drop .tile").forEach(t => {
    t.addEventListener("click", () => {
      const letter = t.dataset.letter;
      const parent = t.closest(".drop");
      delete state.answers.matching[parent.dataset.idx];
      parent.classList.remove("filled");
      parent.innerHTML = "Drop letter here";
      returnTileToBank(letter);
    });
  });
}

function returnTileToBank(letter){
  const bank = qs("#wordbank");
  const existing = bank.querySelector(`.tile[data-letter="${letter}"]`);
  if (!existing) {
    const wb = state.quiz.sections.find(s => s.type === "matching").word_bank;
    const item = wb.find(x => x.letter === letter);
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.setAttribute("draggable","true");
    tile.dataset.letter = letter;
    tile.innerHTML = `<strong>${letter}</strong> — ${item.text}`;
    bank.appendChild(tile);
    // enable drag events on this new tile
    tile.addEventListener("dragstart", e => {
      tile.classList.add("dragging");
      e.dataTransfer.setData("text/plain", tile.dataset.letter);
    });
    tile.addEventListener("dragend", () => tile.classList.remove("dragging"));
  }
}

function renderTrueFalse(q, index) {
  const container = document.createElement("div");
  container.className = "truefalse-question";

  const prompt = document.createElement("p");
  prompt.textContent = `${index + 1}. ${q.question}`;
  container.appendChild(prompt);

  const trueBtn = document.createElement("input");
  trueBtn.type = "radio";
  trueBtn.name = `tf-${index}`;
  trueBtn.value = "true";
  trueBtn.onchange = () => {
    state.answers[`tf-${index}`] = true;
  };

  const falseBtn = document.createElement("input");
  falseBtn.type = "radio";
  falseBtn.name = `tf-${index}`;
  falseBtn.value = "false";
  falseBtn.onchange = () => {
    state.answers[`tf-${index}`] = false;
  };

  container.appendChild(trueBtn);
  container.appendChild(document.createTextNode("True "));
  container.appendChild(falseBtn);
  container.appendChild(document.createTextNode("False"));

  return container;
}


function gradeQuiz() {
  const matching = state.quiz.sections.find(s => s.type === "matching");
  const tf = state.quiz.sections.find(s => s.type === "true_false");
  let matchingCorrect = 0;
  const totalMatching = matching.prompts.length;
  const totalTF = tf.questions.length;
  let tfCorrect = 0;

  // Matching
  for (let i=1; i<=totalMatching; i++) {
    const ans = state.answers.matching[i] || "";
    if ((matching.answer_key[i]||"").toUpperCase() === (ans||"").toUpperCase()) {
      matchingCorrect++;
      const row = qs(`.prompt[data-idx="${i}"]`);
      if (row) row.classList.add("correct");
    } else {
      const row = qs(`.prompt[data-idx="${i}"]`);
      if (row) row.classList.add("incorrect");
    }
  }

  // TF
  for (let i=1; i<=totalTF; i++) {
    const ans = state.answers.tf[i] || "";
    if ((tf.answer_key[i]||"").toUpperCase() === (ans||"").toUpperCase()) {
      tfCorrect++;
      const row = qsa(".tf-row")[i-1];
      if (row) row.classList.add("correct");
    } else {
      const row = qsa(".tf-row")[i-1];
      if (row) row.classList.add("incorrect");
    }
  }

  const points = matchingCorrect * (matching.points_per_question||1) + tfCorrect * (tf.points_per_question||1);
  const total = totalMatching * (matching.points_per_question||1) + totalTF * (tf.points_per_question||1);

  return { matchingCorrect, totalMatching, tfCorrect, totalTF, points, total };
}

function onSubmit() {
  if (!confirm("Submit your answers? You will immediately see your score.")) return;
  state.endTime = new Date();
  const res = gradeQuiz();
  showSummary(res);
  downloadCSV(res);
}

function showSummary(res) {
  const el = qs("#summary");
  el.classList.remove("hidden");
  el.innerHTML = `
    <div class="kpi"><div>Matching</div><strong>${res.matchingCorrect}/${res.totalMatching}</strong></div>
    <div class="kpi"><div>True/False</div><strong>${res.tfCorrect}/${res.totalTF}</strong></div>
    <div class="kpi"><div>Total Points</div><strong>${res.points}/${res.total}</strong></div>
    <div class="kpi"><div>Percent</div><strong>${Math.round((res.points/res.total)*100)}%</strong></div>
  `;
  window.scrollTo({top: document.body.scrollHeight, behavior: "smooth"});
}

function onSubmit() {
    if (!confirm("Submit your answers? You will immediately see your score.")) return;
    state.endTime = new Date();
    const res = gradeQuiz();
    sendEmail(res);
}

function sendEmail(res) {
  const settings = state.settings;

  if (settings.emailProvider === "emailjs") {
    // Calculate duration in minutes
    const durationMs = state.endTime - state.startTime;
    const durationMin = Math.round(durationMs / 60000);

    // Prepare email fields to match the "Grade" template
    const templateParams = {
      to_email: settings.emailRecipients.join(", "),   // recipient list
      name: state.user.fullName || state.user.username, // student's name
      title: settings.title,                   // quiz title
      time: new Date().toLocaleString(),       // current time in local format
      message: `The grade was ${Math.round((res.points/res.total) * 100)}%. ` +
               `The assignment was completed in ${durationMin} minute${durationMin !== 1 ? 's' : ''}.`
    };

    emailjs.send(
      settings.emailConfig.serviceID,
      settings.emailConfig.templateID, // your "Grade" template
      templateParams
    ).then(() => {
      alert("✅ Results emailed successfully!");
      showSummary(res);
    }).catch(err => {
      console.error("❌ Email failed:", err);
      alert("Error sending email. Please notify your instructor.");
    });
  }
}



window.addEventListener("DOMContentLoaded", init);
