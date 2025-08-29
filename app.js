const state = {
  user: null,
  answers: {},
};

function login() {
  const username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Please enter a username");
    return;
  }
  state.user = username;
  document.getElementById("login-container").classList.add("hidden");
  document.getElementById("quiz-container").classList.remove("hidden");
  loadQuiz();
}

function loadQuiz() {
  const quizForm = document.getElementById("quiz-form");
  quizForm.innerHTML = "";

  // Example Questions
  const questions = [
    {
      id: "q1",
      type: "truefalse",
      text: "The sky is blue.",
    },
    {
      id: "q2",
      type: "matching",
      text: "Match the countries with their capitals.",
      pairs: {
        "France": ["Paris", "Berlin", "Rome"],
        "Germany": ["Berlin", "Paris", "Madrid"],
      }
    },
    {
      id: "q3",
      type: "dropdown",
      text: "Select the largest planet:",
      options: ["Earth", "Mars", "Jupiter", "Venus"],
    },
    {
      id: "q4",
      type: "dragdrop",
      text: "Drag the correct letter into the box: The first letter of 'Apple' is...",
      answer: "A"
    }
  ];

  questions.forEach(q => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("question");

    const label = document.createElement("p");
    label.innerText = q.text;
    wrapper.appendChild(label);

    if (q.type === "truefalse") {
      wrapper.innerHTML += `
        <label><input type="radio" name="${q.id}" value="true"> True</label>
        <label><input type="radio" name="${q.id}" value="false"> False</label>
      `;
    }

    if (q.type === "matching") {
      const container = document.createElement("div");
      container.classList.add("matching-container");

      const left = document.createElement("div");
      left.classList.add("matching-left");
      const right = document.createElement("div");
      right.classList.add("matching-right");

      Object.keys(q.pairs).forEach((country, i) => {
        const row = document.createElement("div");
        row.innerHTML = `<strong>${country}</strong>`;
        const select = document.createElement("select");
        select.name = `${q.id}_${i}`;
        select.onchange = selectOption;
        q.pairs[country].forEach(opt => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          select.appendChild(option);
        });
        row.appendChild(select);
        left.appendChild(row);
      });

      container.appendChild(left);
      container.appendChild(right);
      wrapper.appendChild(container);
    }

    if (q.type === "dropdown") {
      const select = document.createElement("select");
      select.name = q.id;
      select.onchange = selectOption;
      q.options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
      });
      wrapper.appendChild(select);
    }

    if (q.type === "dragdrop") {
      // Draggable letter
      const dragItem = document.createElement("div");
      dragItem.classList.add("draggable");
      dragItem.draggable = true;
      dragItem.id = `drag_${q.id}`;
      dragItem.textContent = q.answer;
      dragItem.ondragstart = drag;

      // Drop target
      const dropTarget = document.createElement("div");
      dropTarget.classList.add("dropTarget");
      dropTarget.ondragover = allowDrop;
      dropTarget.ondrop = drop;
      dropTarget.dataset.qid = q.id;
      dropTarget.innerText = "Drop Here";

      wrapper.appendChild(dragItem);
      wrapper.appendChild(dropTarget);
    }

    quizForm.appendChild(wrapper);
  });
}

/* --- Drag & Drop Handlers --- */
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const draggedElement = document.getElementById(data);
  ev.target.innerText = draggedElement.innerText;
  state.answers[ev.target.dataset.qid] = draggedElement.innerText;
}

/* --- Dropdown & Matching Handler --- */
function selectOption(ev) {
  state.answers[ev.target.name] = ev.target.value;
}

/* --- Submit --- */
function submitQuiz() {
  const results = document.getElementById("results");
  results.innerHTML = `<h3>Submitted Answers:</h3><pre>${JSON.stringify(state.answers, null, 2)}</pre>`;
}
