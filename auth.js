// auth.js
// Handles login/logout only. Relies on app.js to load/render the quiz.
// Relies on email.js for email sending after submit.

async function initAuth() {
    try {
      state.users = await loadJSON("users.json");
    } catch (_) {
      state.users = await loadJSON("users.sample.json");
    }
    
    // If already logged in, go to quiz directly
    if (localStorage.getItem("quiz_user")) {
      state.user = JSON.parse(localStorage.getItem("quiz_user"));
      if(localStorage.getItem("quizTaken" + state.user) === "true") {
        alert("You already took the quiz!");
        renderLogin();
        return;
     }
      initQuiz(); // defined in app.js
    } else {
      renderLogin();
    }
  }
  
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
      alert("Passwords are in users.json (or users.sample.json).");
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
    if(localStorage.getItem("quizTaken" + state.user) === "true") {
        alert("You already took the quiz!");
        renderLogin();
        return;
     }
  
    state.user = { username: account.username, fullName: account.fullName || account.username };
    localStorage.setItem("quiz_user", JSON.stringify(state.user));
        
    initQuiz(); // defined in app.js
  }
  
  function logout() {
    localStorage.removeItem("quiz_user");
    location.reload();
  }
  
  // Kick off authentication flow
  window.addEventListener("DOMContentLoaded", initAuth);
  