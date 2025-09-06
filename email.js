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

  // 🔹 Build details of wrong answers
  let wrongDetails = "All answers correct 🎉";
  if (result.wrongAnswers && result.wrongAnswers.length > 0) {
    wrongDetails = result.wrongAnswers.map(w =>
      `${w.type}: ${w.question}\n  Student: ${w.student}\n  Correct: ${w.correct}`
    ).join("\n\n");
  }

  const templateParams = {
    to_email: state.settings.emailRecipients.join(", "),
    name: state.user.fullName || state.user.username,
    title: state.settings.title,
    time: new Date().toLocaleString(),
    message:
      `${state.settings.title} results for ${state.user.fullName}:\n\n` +
      `The grade was ${Math.round((result.points / result.total) * 100)}%.\n` +
      `The assignment was completed in ${durationMin} minute${durationMin !== 1 ? 's' : ''}.\n\n` +
      `Incorrect answers:\n${wrongDetails}`
  };

  emailjs.send(
    state.settings.emailConfig.serviceID,
    state.settings.emailConfig.templateID,
    templateParams
  )
  .then(() => {
    alert("✅ Results emailed successfully!");
  })
  .catch(err => {
    console.error("❌ Email failed:", err);
    alert("Error sending email. Please notify your instructor.");
  });
}
