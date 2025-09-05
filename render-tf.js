/* ---------- TRUE/FALSE SECTION ---------- */
function renderTFSection(section) {
  const wrapper = document.createElement("div");
  wrapper.className = "section truefalse";
  wrapper.innerHTML = `<h2>${section.title}</h2><p>${section.instructions}</p>`;

  const questions = shuffleArray(section.questions);

  questions.forEach((q, idx) => {
    const div = document.createElement("div");
    div.className = "tf-row";
    div.innerHTML = `<p>${idx + 1}. ${q.question}</p>`;

    const tfOptions = shuffleArray([
      { label: "True", value: true },
      { label: "False", value: false }
    ]);

    tfOptions.forEach(opt => {
      const input = document.createElement("input");
      input.type = "radio";
      input.name = q.qid;     // radio group name = stable qid
      input.value = String(opt.value);
      input.onchange = () => (state.answers[q.qid] = opt.value === true);

      div.appendChild(input);
      div.appendChild(document.createTextNode(" " + opt.label + " "));
    });

    wrapper.appendChild(div);
  });

  return wrapper;
}
