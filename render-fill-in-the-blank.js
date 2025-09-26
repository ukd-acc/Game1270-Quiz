function renderFillInTheBlankSection(section) {
  const wrapper = document.createElement("div");
  wrapper.className = "section fillintheblank";
  wrapper.innerHTML = `<h2>${section.title}</h2><p>${section.instructions}</p>`;

  section.questions.forEach((q, idx) => {
    const row = document.createElement("div");
    row.className = "fib-row";

    const prompt = document.createElement("p");
    prompt.innerHTML = q.prompt.replace(/___/g, `<input type="text" class="fib-input" data-question="${idx}"/>`);
    row.appendChild(prompt);

    wrapper.appendChild(row);
  });

  return wrapper;
}