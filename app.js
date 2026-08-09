const people = createPeople();

let selectedId = people[0].id;

const elements = {
  personSelect: document.querySelector("#person-select"),
  greetingName: document.querySelector("#greeting-name"),
  encouragement: document.querySelector("#encouragement"),
  total: document.querySelector("#total-amount"),
  goal: document.querySelector("#goal-amount"),
  progressFill: document.querySelector("#progress-fill"),
  progressTrack: document.querySelector(".progress-track"),
  progressPercent: document.querySelector("#progress-percent"),
  remaining: document.querySelector("#remaining-amount"),
  celebration: document.querySelector("#celebration"),
  teamGrid: document.querySelector("#team-grid"),
  customForm: document.querySelector("#custom-form"),
  customAmount: document.querySelector("#custom-amount"),
  formError: document.querySelector("#form-error"),
  undoButton: document.querySelector("#undo-button"),
  todayLabel: document.querySelector("#today-label"),
  goalLink: document.querySelector("#goal-link"),
  splashLayer: document.querySelector("#splash-layer"),
};

function totalFor(person) {
  return person.entries.reduce((total, amount) => total + amount, 0);
}

function selectedPerson() {
  return people.find((person) => person.id === selectedId);
}

function encouragingMessage(total, goal) {
  const progress = total / goal;
  if (progress >= 1) return "You’re fully refreshed — what a splashy success!";
  if (progress >= 0.75) return "You’re in the home stream. Just a little more!";
  if (progress >= 0.4) return "Lovely flow! Your goal is getting closer.";
  if (total > 0) return "A bright start — every sip makes a ripple.";
  return "Ready when you are. Let’s make the first ripple!";
}

function renderPersonOptions() {
  elements.personSelect.innerHTML = people
    .map((person) => `<option value="${person.id}">${person.name}</option>`)
    .join("");
  elements.personSelect.value = selectedId;
}

function renderSelectedPerson() {
  const person = selectedPerson();
  const total = totalFor(person);
  const percent = Math.round((total / person.goal) * 100);
  const visiblePercent = Math.min(percent, 100);
  const remaining = Math.max(person.goal - total, 0);

  elements.greetingName.textContent = person.name;
  elements.encouragement.textContent = encouragingMessage(total, person.goal);
  elements.total.textContent = total;
  elements.goal.textContent = person.goal;
  elements.progressFill.style.width = `${visiblePercent}%`;
  elements.progressTrack.setAttribute("aria-valuemax", person.goal);
  elements.progressTrack.setAttribute("aria-valuenow", Math.min(total, person.goal));
  elements.progressPercent.textContent = `${percent}% refreshed`;
  elements.remaining.textContent = remaining ? `${remaining} fl oz to your goal` : "Goal complete!";
  elements.celebration.hidden = total < person.goal;
  elements.undoButton.disabled = person.entries.length === 0;
  elements.goalLink.href = `goal.html?person=${person.id}`;
}

function renderTeam() {
  elements.teamGrid.innerHTML = people.map((person) => {
    const total = totalFor(person);
    const percent = Math.round((total / person.goal) * 100);
    const isComplete = total >= person.goal;
    return `
      <article class="teammate ${person.id === selectedId ? "selected" : ""}" style="--person-color:${person.color}; --person-pale:${person.pale}; --person-progress:${Math.min(percent, 100) * 3.6}deg">
        <div class="progress-orb" role="img" aria-label="${person.name} is ${percent}% toward their goal">
          <div class="orb-center">
            <span class="person-symbol" aria-hidden="true">${person.symbol}</span>
            <strong>${percent}%</strong>
          </div>
        </div>
        <h3>${person.name}</h3>
        <p class="teammate-status">${isComplete ? "Goal glowing! ✨" : `${total} of ${person.goal} fl oz`}</p>
        <p class="support-note">${isComplete ? "A magical finish" : `${Math.max(person.goal - total, 0)} fl oz until goal`}</p>
      </article>`;
  }).join("");
}

function render() {
  renderSelectedPerson();
  renderTeam();
}

function showSplash(source) {
  const sourceBox = source.getBoundingClientRect();
  const layerBox = elements.splashLayer.getBoundingClientRect();
  const splash = document.createElement("span");
  splash.className = "button-splash";
  splash.textContent = "✦  💧  ✦";
  splash.style.left = `${sourceBox.left + sourceBox.width / 2 - layerBox.left}px`;
  splash.style.top = `${sourceBox.top - layerBox.top}px`;
  elements.splashLayer.append(splash);
  window.setTimeout(() => splash.remove(), 700);
}

function addWater(amount, source) {
  selectedPerson().entries.push(amount);
  elements.formError.textContent = "";
  if (source) showSplash(source);
  render();
}

document.querySelectorAll(".amount-button").forEach((button) => {
  button.addEventListener("click", () => addWater(Number(button.dataset.amount), button));
});

elements.personSelect.addEventListener("change", (event) => {
  selectedId = event.target.value;
  elements.formError.textContent = "";
  render();
});

elements.customForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const amount = Number(elements.customAmount.value);
  if (!Number.isFinite(amount) || amount < 1 || amount > 200) {
    elements.formError.textContent = "Please enter an amount from 1 to 200 fl oz.";
    elements.customAmount.focus();
    return;
  }
  addWater(amount, event.submitter);
  elements.customForm.reset();
});

elements.undoButton.addEventListener("click", () => {
  selectedPerson().entries.pop();
  render();
});

elements.todayLabel.textContent = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
}).format(new Date());

renderPersonOptions();
render();
