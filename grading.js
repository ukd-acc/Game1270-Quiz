/* ---------- GRADING ---------- */
function gradeQuiz() {
  let points = 0, total = 0;
  let breakdown = { matching: { correct: 0, total: 0 },
                    tf: { correct: 0, total: 0 },
                    mc: { correct: 0, total: 0 },
                    mp: { correct: 0, total: 0 } };

  for (const section of state.quiz.sections) {
    if (section.type === "matching") {
      for (const q of section.prompts) {
        total += section.points_per_question;
        breakdown.matching.total++;
        const a = state.answers[q.qid];
        if (a && norm(a) === norm(q.answer)) {
          points += section.points_per_question;
          breakdown.matching.correct++;
        }
      }
    } else if (section.type === "true_false") {
      for (const q of section.questions) {
        total += section.points_per_question;
        breakdown.tf.total++;
        const a = state.answers[q.qid];
        if (typeof a !== "undefined" && a === q.answer) {
          points += section.points_per_question;
          breakdown.tf.correct++;
        }
      }
    } else if (section.type === "multiple_choice") {
      for (const q of section.prompts) {
        total += section.points_per_question;
        breakdown.mc.total++;
        const a = state.answers[q.qid];
        const correct = q.correct_answer;
        if (a && norm(a) === norm(correct)) {
          points += section.points_per_question;
          breakdown.mc.correct++;
        }
      }
    } else if (section.type === "matching_pictures") {
      for (const q of section.prompts) {
        total += section.points_per_question;
        breakdown.mp.total++;
        const a = state.answers[q.qid];
        if (a && norm(a) === norm(q.answer)) {
          points += section.points_per_question;
          breakdown.mp.correct++;
        }
      }
    }
  }

  return { points, total, breakdown };
}

  
  function showSummary(res) {
    alert(`You scored ${res.points}/${res.total} (${res.percent}%)`);
  }
  