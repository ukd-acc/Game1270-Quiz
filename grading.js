/* ---------- GRADING ---------- */
function gradeQuiz() {
  let points = 0, total = 0;
  let matchingCorrect = 0, tfCorrect = 0, mcCorrect = 0;
  let totalMatching = 0, totalTF = 0, totalMC = 0;

  const wrongAnswers = [];

  state.quiz.sections.forEach(section => {
    if (section.type === "matching") {
      section.prompts.forEach((q, idx) => {
        totalMatching++;
        total += section.points_per_question;
        const studentAnswer = state.answers[`matching-${idx}`];

        if (studentAnswer && studentAnswer.toLowerCase() === q.answer.toLowerCase()) {
          matchingCorrect++;
          points += section.points_per_question;
        } else {
          wrongAnswers.push({
            type: "Matching",
            question: q.question,
            student: studentAnswer || "(no answer)",
            correct: q.answer
          });
        }
      });
    }

    else if (section.type === "true_false") {
      section.questions.forEach((q, idx) => {
        totalTF++;
        total += section.points_per_question;
        const studentAnswer = state.answers[`tf-${idx}`];

        if (typeof studentAnswer !== "undefined" && studentAnswer === q.answer) {
          tfCorrect++;
          points += section.points_per_question;
        } else {
          wrongAnswers.push({
            type: "True/False",
            question: q.question,
            student: typeof studentAnswer === "undefined" ? "(no answer)" : studentAnswer,
            correct: q.answer
          });
        }
      });
    }

    else if (section.type === "multiple_choice") {
      section.prompts.forEach((q, idx) => {
        totalMC++;
        total += section.points_per_question;
        const studentAnswer = state.answers[`mc-${idx}`];

        if (studentAnswer && studentAnswer === q.correct_answer) {
          mcCorrect++;
          points += section.points_per_question;
        } else {
          wrongAnswers.push({
            type: "Multiple Choice",
            question: q.question,
            student: studentAnswer || "(no answer)",
            correct: q.correct_answer
          });
        }
      });
    }

    else if (section.type === "matching_pictures") {
      section.prompts.forEach((q, idx) => {
        totalMatching++;
        total += section.points_per_question;
        const studentAnswer = state.answers[`matching_pictures-${idx}`];
    
        if (studentAnswer && studentAnswer.toLowerCase() === q.answer.toLowerCase()) {
          matchingCorrect++;
          points += section.points_per_question;
        } else {
          wrongAnswers.push({
            type: "Matching (Pictures)",
            question: q.question,  // you might want to show something like "Identify this person"
            student: studentAnswer || "(no answer)",
            correct: q.answer
          });
        }
      });
    }
    
  });

  const percent = total > 0 ? Math.round((points / total) * 100) : 0;

  return { 
    matchingCorrect, totalMatching, 
    tfCorrect, totalTF, 
    mcCorrect, totalMC, 
    points, total, percent, 
    wrongAnswers 
  };
}

/* ---------- SUMMARY ---------- */
function showSummary(res) {
  const app = qs("#app");
  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h2>Quiz Summary</h2>
        <p>You scored <strong>${res.points}/${res.total}</strong> (${res.percent}%).</p>
        <h3>Incorrect Answers:</h3>
        ${res.wrongAnswers.length === 0 ? "<p>All answers correct 🎉</p>" :
          `<ul class="wrong-list">
            ${res.wrongAnswers.map(w => 
              `<li><strong>${w.type}</strong> - ${w.question}<br/>
               <span class="student">Your answer: ${w.student}</span><br/>
               <span class="correct">Correct answer: ${w.correct}</span></li>`
            ).join("")}
           </ul>`
        }
      </div>
    </div>
  `;
}
