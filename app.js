const people = [
  { id: "maya", name: "Maya", goal: 64, entries: [12, 16], color: "#ff9b88", pale: "#fff0ed" },
  { id: "theo", name: "Theo", goal: 80, entries: [20, 20, 16], color: "#43afcf", pale: "#e7f8fd" },
  { id: "leila", name: "Leila", goal: 72, entries: [12, 12, 8, 20], color: "#e9b83f", pale: "#fff8df" },
  { id: "jordan", name: "Jordan", goal: 64, entries: [16, 16, 16, 20], color: "#5bc29e", pale: "#e8faf4" },
  { id: "sam", name: "Sam", goal: 88, entries: [20, 12], color: "#9d8dde", pale: "#f2efff" },
];

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
}

function renderTeam() {
  elements.teamGrid.innerHTML = people.map((person) => {
    const total = totalFor(person);
    const percent = Math.round((total / person.goal) * 100);
    const isComplete = total >= person.goal;
    return `
      <article class="teammate ${person.id === selectedId ? "selected" : ""}">
        <div class="teammate-top">
          <span class="avatar" style="background:${person.pale}; color:${person.color}">${person.name.charAt(0)}</span>
          <div>
            <h3>${person.name}</h3>
            <p class="teammate-status">${isComplete ? "Making waves! ✨" : `${total} of ${person.goal} fl oz`}</p>
          </div>
        </div>
        <div class="mini-track" role="progressbar" aria-label="${person.name}'s progress" aria-valuemin="0" aria-valuemax="${person.goal}" aria-valuenow="${Math.min(total, person.goal)}">
          <div class="mini-fill" style="width:${Math.min(percent, 100)}%; background:${person.color}"></div>
        </div>
      </article>`;
  }).join("");
}

function render() {
  renderSelectedPerson();
  renderTeam();
}

function addWater(amount) {
  selectedPerson().entries.push(amount);
  elements.formError.textContent = "";
  render();
}

document.querySelectorAll(".amount-button").forEach((button) => {
  button.addEventListener("click", () => addWater(Number(button.dataset.amount)));
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
  addWater(amount);
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
