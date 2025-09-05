/* ---------- GRADING ---------- */
function gradeQuiz() {
    let points = 0, total = 0;
  
    state.quiz.sections.forEach(section => {
      if (section.type === "matching") {
        section.prompts.forEach((q, idx) => {
          total += section.points_per_question;
          const studentAnswer = state.answers[`matching-${idx}`];
          if (studentAnswer && studentAnswer === q.answer) {
            points += section.points_per_question;
          }          
        });
      }
      else if (section.type === "true_false") {
        section.questions.forEach((q, idx) => {
          total += section.points_per_question;
          const studentAnswer = state.answers[`tf-${idx}`];
          if (typeof studentAnswer !== "undefined" && studentAnswer === q.answer) {
            points += section.points_per_question;
          }
        });
      }
      else if (section.type === "matching_pictures") {
        section.prompts.forEach((q, idx) => {
          total += section.points_per_question;
          const studentAnswer = state.answers[`matching_pictures-${idx}`];
          if (studentAnswer && studentAnswer === q.answer) {
            points += section.points_per_question;
          }
        });
      }
      else if (section.type === "multiple_choice") {
        section.prompts.forEach((q, idx) => {
          total += section.points_per_question;
          const studentAnswer = state.answers[`mc-${idx}`];
          if (studentAnswer && studentAnswer === q.correct_answer) {
            points += section.points_per_question;
          }
        });
      }
      
      
    });
  
    return { points, total, percent: Math.round((points/total)*100) };
  }
  
  function showSummary(res) {
    alert(`You scored ${res.points}/${res.total} (${res.percent}%)`);
  }
  