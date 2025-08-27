/* Quiz app with login, matching + T/F, auto-grading, and emailjs integration */

const state = {
  user: null,
  quiz: null,
  users: null,
  answers: {},
  startTime: null,
  endTime: null,
  settings: null
};

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
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

function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

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
          <img src="${state.settings.logo}" alt="Logo" style="max-width:100%; height:auto"/>
          <h1>${state.quiz.title}</h1>
          <div class="notice">${state.quiz.course}</div>
          <div class="flex">
            <span class="badge">${state.user.fullName} (${state.user.username})</span>
            <button class="secondary" id="logoutBtn">Sign out</button>
          </div>
        </div>
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
    if (confirm("Clear all answers?")) { state.answers = {}; renderApp(); }
  });

  const container = qs("#sections");
  state.quiz.sections.forEach(sec => {
    if (sec.type === "matching") {
      container.appendChild(renderMatchingSection(sec));
    }
    if (sec.type === "true_false") {
      container.appendChild(renderTFSection(sec));
    }
  });
}

/* ---------- MATCHING ---------- */
function renderMatchingSection(section) {
  const wrapper = document.createElement("div");
  wrapper.className = "section matching";
  wrapper.innerHTML = `<h2>${section.title}</h2><p>${section.instructions}</p>`;

  // Word bank
  const bank = document.createElement("div");
  bank.id = "wordbank";
  bank.className = "word-bank";
  section.word_bank.forEach(item => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.setAttribute("draggable", "true");
    tile.dataset.letter = item.letter;
    tile.innerHTML = `<strong>${item.letter}</strong> — ${item.text}`;
    tile.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", item.letter);
    });
    bank.appendChild(tile);
  });
  wrapper.appendChild(bank);

  // Prompts
  section.prompts.forEach((q, idx) => {
    const div = document.createElement("div");
    div.className = "prompt";
    div.dataset.idx = idx;

    div.innerHTML = `<p>${idx + 1}. ${q.question}</p>
      <div class="drop" data-idx="${idx}">Drop letter here</div>
      <select>
        <option value="">-- Select --</option>
        ${section.word_bank.map(opt => `<option value="${opt.letter}">${opt.letter}: ${opt.text}</option>`).join("")}
      </select>`;

    const drop = div.querySelector(".drop");
    drop.addEventListener("dragover", e => e.preventDefault());
    drop.addEventListener("drop", e => {
      e.preventDefault();
      const letter = e.dataTransfer.getData("text/plain");
      state.answers[`matching-${idx}`] = letter;
      drop.innerHTML = `<div class="tile" data-letter="${letter}"><strong>${letter}</strong></div>`;
    });

    const select = div.querySelector("select");
    select.addEventListener("change", () => {
      const val = select.value;
      state.answers[`matching-${idx}`] = val;
      drop.innerHTML = val ? `<div class="tile" data-letter="${val}"><strong>${val}</strong></div>` : "Drop letter here";
    });

    wrapper.appendChild(div);
  });

  return wrapper;
}

/* ---------- TRUE/FALSE ---------- */
function renderTFSection(section) {
  const wrapper = document.createElement("div");
  wrapper.className = "section truefalse";
  wrapper.innerHTML = `<h2>${section.title}</h2><p>${section.instructions}</p>`;

  section.questions.forEach((q, idx) => {
    const div = document.createElement("div");
    div.className = "tf-row";
    div.innerHTML = `<p>${idx + 1}. ${q.question}</p>`;

    const trueInput = document.createElement("input");
    trueInput.type = "radio";
    trueInput.name = `tf-${idx}`;
    trueInput.value = "true";
    trueInput.onchange = () => state.answers[`tf-${idx}`] = true;

    const falseInput = document.createElement("input");
    falseInput.type = "radio";
    falseInput.name = `tf-${idx}`;
    falseInput.value = "false";
    falseInput.onchange = () => state.answers[`tf-${idx}`] = false;

    div.appendChild(trueInput);
    div.appendChild(document.createTextNode("True "));
    div.appendChild(falseInput);
    div.appendChild(document.createTextNode("False"));

    wrapper.appendChild(div);
  });

  return wrapper;
}

/* ---------- GRADING ---------- */
function gradeQuiz() {
  let points = 0, total = 0, matchingCorrect = 0, tfCorrect = 0, totalMatching = 0, totalTF = 0;

  state.quiz.sections.forEach(section => {
    if (section.type === "matching") {
      section.prompts.forEach((q, idx) => {
        totalMatching++;
        total += section.points_per_question;
        const studentAnswer = state.answers[`matching-${idx}`];
        if (studentAnswer && studentAnswer.toUpperCase() === q.answer.toUpperCase()) {
          matchingCorrect++;
          points += section.points_per_question;
        }
      });
    } else if (section.type === "true_false") {
      section.questions.forEach((q, idx) => {
        totalTF++;
        total += section.points_per_question;
        const studentAnswer = state.answers[`tf-${idx}`];
        if (typeof studentAnswer !== "undefined" && studentAnswer === q.answer) {
          tfCorrect++;
          points += section.points_per_question;
        }
      });
    }
  });

  return { matchingCorrect, totalMatching, tfCorrect, totalTF, points, total };
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
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function onSubmit() {
  if (!confirm("Submit your answers? You will immediately see your score.")) return;
  state.endTime = new Date();
  const res = gradeQuiz();
  sendEmail(res);
}

/* ---------- EMAIL ---------- */
function sendEmail(res) {
  const settings = state.settings;
  if (settings.emailProvider === "emailjs") {
    const durationMs = state.endTime - state.startTime;
    const durationMin = Math.round(durationMs / 60000);

    const templateParams = {
      to_email: settings.emailRecipients.join(", "),
      name: state.user.fullName || state.user.username,
      title: settings.title,
      time: new Date().toLocaleString(),
      message: `The grade was ${Math.round((res.points / res.total) * 100)}%. ` +
               `The assignment was completed in ${durationMin} minute${durationMin !== 1 ? 's' : ''}.`
    };

    emailjs.send(
      settings.emailConfig.serviceID,
      settings.emailConfig.templateID,
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
