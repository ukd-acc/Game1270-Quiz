async function init() {
    // Load settings.json
    state.settings = await loadJSON("settings.json");
  
    // Load users for login
    state.users = await loadUsers();
  
    // Load quiz sections
    state.quiz = { title: state.settings.title, sections: [] };
    for (const sec of state.settings.sections) {
      const data = await loadJSON(sec.file);
      state.quiz.sections.push(data);
    }
  
    // Check login
    if (localStorage.getItem("quiz_user")) {
      state.user = JSON.parse(localStorage.getItem("quiz_user"));
      renderQuiz();
    } else {
      renderLogin();
    }
  }
  
  function renderQuiz() {
    const app = qs("#app");
    app.innerHTML = `
      <div class="container">
        <div class="card">
          <div class="header">
            <h1>${state.quiz.title}</h1>
            <div class="flex">
              <span class="badge">${state.user.fullName} (${state.user.username})</span>
              <button class="secondary" id="logoutBtn">Sign out</button>
            </div>
          </div>
          <div id="sections"></div>
          <hr/>
          <div class="flex">
            <button id="submitBtn">Submit Quiz</button>
          </div>
          <div id="summary" class="summary hidden"></div>
        </div>
      </div>
    `;
  
    qs("#logoutBtn").addEventListener("click", logout);
    qs("#submitBtn").addEventListener("click", onSubmit);
  
    const container = qs("#sections");
    state.quiz.sections.forEach(sec => {
      if (sec.type === "matching") container.appendChild(renderMatchingSection(sec));
      if (sec.type === "true_false") container.appendChild(renderTFSection(sec));
    });
  }
  
  function sendEmail(res) {

    const settings = state.settings;
  
  
  
    if (settings.emailProvider === "emailjs") {
  
      // Calculate duration in minutes
  
      const durationMs = state.endTime - state.startTime;
  
      const durationMin = Math.round(durationMs / 60000);
  
  
  
      // Prepare email fields to match the "Grade" template
  
      const templateParams = {
        to_email: settings.emailRecipients[0],   // recipient list
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

  function onSubmit() {
    const res = gradeQuiz();
    showSummary(res);
    sendEmail(res);
  }
  
  window.addEventListener("DOMContentLoaded", init);
  