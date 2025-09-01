// email.js
function initEmail() {
    if (!state.settings || !state.settings.emailConfig) {
      console.warn("⚠️ Email configuration missing in settings.json");
      return;
    }
  
    // Initialize EmailJS with the public key from settings.json
    emailjs.init(state.settings.emailConfig.publicKey);
  }
  
  function sendResultsByEmail(result) {
    if (!state.user) {
      console.error("No user logged in, cannot send email.");
      return;
    }
    if (!state.settings || !state.settings.emailConfig) {
      console.error("No email configuration found, cannot send email.");
      return;
    }
  
    const durationMs = state.endTime - state.startTime;
    const durationMin = Math.round(durationMs / 60000);
  
    const templateParams = {
      to_email: state.settings.emailRecipients.join(", "),
      name: state.user.fullName || state.user.username,
      title: state.settings.title,
      time: new Date().toLocaleString(),
      message:  `${state.settings.title} results for ${state.user.fullName}:\n` +
                `The grade was ${Math.round((result.points / result.total) * 100)}%. ` +
                `The assignment was completed in ${durationMin} minute${durationMin !== 1 ? 's' : ''}.`
    };
  
    emailjs.send(
      state.settings.emailConfig.serviceID,
      state.settings.emailConfig.templateID,
      templateParams
    )
    .then(() => {
      alert("✅ Results emailed successfully!");
      localStorage.setItem("quizTaken" + state.user, "true");
      window.close();
    })
    .catch(err => {
      console.error("❌ Email failed:", err);
      alert("Error sending email. Please notify your instructor.");
    });
  }
  