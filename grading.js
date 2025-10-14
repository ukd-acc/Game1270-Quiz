/* ---------- GRADING ---------- */
function gradeShortAnswer(section) {
  const responses = [];

  section.questions.forEach((q, idx) => {
    const textarea = qs(`.sa-input[data-question="${idx}"]`);
    const userAnswer = textarea.value.trim();
    responses.push({
      question: q.prompt,
      answer: userAnswer || "(no answer)"
    });
  });

  return responses;
}

function gradeFillInTheBlank(section) {
  let correct = 0;
  const wrongAnswers = [];

  section.questions.forEach((q, idx) => {
    const inputs = qsa(`.fib-input[data-question="${idx}"]`); // Select inputs for the current question
    const usedAnswers = new Set();
    let questionCorrect = true; // Track if the entire question is correct
    const studentAnswers = []; // Collect all user answers for the question

    inputs.forEach((input, blankIdx) => {
      const userAnswer = input.value.trim().toLowerCase(); // Normalize input
      const possibleAnswers = Array.isArray(q.answers[blankIdx]) ? q.answers[blankIdx] : q.answers;

      studentAnswers.push(userAnswer || "(no answer)");

      if (possibleAnswers.includes(userAnswer) && !usedAnswers.has(userAnswer)) {
        correct++;
        usedAnswers.add(userAnswer); // Prevent duplicate credit for the same answer
      } else {
        questionCorrect = false; // Mark the question as incorrect
      }
    });

    // Add to wrongAnswers only once per question
    if (!questionCorrect) {
      wrongAnswers.push({
        type: "Fill in the Blank",
        question: q.prompt,
        student: studentAnswers.join(", "),
        correct: q.answers.map(a => a.join(", ")).join(" | ") // Combine all possible answers
      });
    }
  });

  return { correct, wrongAnswers };
}

function gradeFillInTheBlankList(section) {
  let correct = 0;
  const wrongAnswers = [];

  section.questions.forEach((q, idx) => {
    const inputs = qsa(`.fibl-input[data-question="${idx}"]`); // Select inputs for the current question
    const usedAnswers = new Set();
    let questionCorrectCount = 0; // Track correct answers for this question
    const studentAnswers = []; // Collect all user answers for the question

    // Flatten possible answers once for the entire question
    const possibleAnswers = q.answers.flat();

    inputs.forEach((input) => {
      const userAnswer = input.value.trim().toLowerCase(); // Normalize input

      studentAnswers.push(userAnswer || "(no answer)");

      if (possibleAnswers.includes(userAnswer) && !usedAnswers.has(userAnswer)) {
        questionCorrectCount++;
        correct++;
        usedAnswers.add(userAnswer); // Prevent duplicate credit for the same answer
      }
    });

    // Add a single entry to wrongAnswers for the entire question
    if (questionCorrectCount < inputs.length) {
      wrongAnswers.push({
        type: "Fill in the Blank List",
        question: q.prompt,
        student: `${questionCorrectCount}/${inputs.length} correct: ${studentAnswers.join(", ")}`,
        correct: possibleAnswers.join(", ")
      });
    }
  });

  return { correct, wrongAnswers };
}

function gradeQuiz() {
  let points = 0, total = 0;
  const wrongAnswers = [];
  const shortAnswerResponses = [];

  state.quiz.sections.forEach(section => {
    if (section.type === "matching") {
      section.prompts.forEach((q, idx) => {
        total += section.points_per_question;
        const studentAnswer = state.answers[`matching-${idx}`];

        if (studentAnswer && studentAnswer.toLowerCase() === q.answer.toLowerCase()) {
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
        total += section.points_per_question;
        const studentAnswer = state.answers[`tf-${idx}`];

        if (typeof studentAnswer !== "undefined" && studentAnswer === q.answer) {
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
        total += section.points_per_question;
        const studentAnswer = state.answers[`mc-${idx}`];

        if (studentAnswer && studentAnswer === q.correct_answer) {
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

    else if (section.type === "fill_in_the_blank") {
      const result = gradeFillInTheBlank(section);
      points += result.correct;

      // Count total blanks by counting the number of "___" in each prompt
      total += section.questions.reduce((sum, q) => {
        const blankCount = (q.prompt.match(/___/g) || []).length; // Count "___" in the prompt
        return sum + blankCount;
      }, 0);

      wrongAnswers.push(...result.wrongAnswers);
    }

    else if (section.type === "fill_in_the_blank_list") {
      const result = gradeFillInTheBlankList(section);
      points += result.correct;
      total += section.questions.reduce((sum, q) => {
        const blankCount = (q.prompt.match(/___/g) || []).length; // Count "___" in the prompt
        return sum + blankCount;
      }, 0);
      wrongAnswers.push(...result.wrongAnswers);
    }

    else if (section.type === "short_answer") {
      shortAnswerResponses.push(...gradeShortAnswer(section));
    }
  });

  const percent = total > 0 ? Math.round((points / total) * 100) : 0;

  return { points, total, percent, wrongAnswers, shortAnswerResponses };
}

/* ---------- SUMMARY ---------- */
function showSummary(res) {
  const app = qs("#app");
  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h2>Quiz Summary</h2>
        <p>You scored <strong>${res.points}/${res.total}</strong> (${res.percent}%).</p>
        <h3>Short Answer Responses:</h3>
        <ul class="short-answer-list">
          ${res.shortAnswerResponses.map(r => 
            `<li><strong>${r.question}</strong><br/>
             <span class="student">Your answer: ${r.answer}</span></li>`
          ).join("")}
        </ul>
        <h3>Incorrect Answers:</h3>
        ${res.wrongAnswers.length === 0 ? "<p>All answers correct 🎉</p>" :
          `<ul class="wrong-list">
            ${res.wrongAnswers.map(w => 
              `<li><strong>${w.type}</strong> - ${w.question}<br/>
               <span class="student">Your answer: ${w.student}</span><br/>
               <span class="correct">Correct answer: ${w.correct}</span></li>`
            ).join("")}
           </ul>`}
        <button id="logoutBtn" class="secondary">Log Out</button>
      </div>
    </div>
  `;

  qs("#logoutBtn").addEventListener("click", logout);
}
