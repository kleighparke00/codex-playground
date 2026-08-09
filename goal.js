const people = createPeople();
const params = new URLSearchParams(window.location.search);
const requestedPerson = params.get("person");

const personSelect = document.querySelector("#goal-person");
const personName = document.querySelector("#goal-person-name");
const customGoal = document.querySelector("#custom-goal");
const goalForm = document.querySelector("#goal-form");
const goalError = document.querySelector("#goal-error");
const savedMessage = document.querySelector("#saved-message");

personSelect.innerHTML = people.map((person) => `<option value="${person.id}">${person.name}</option>`).join("");
personSelect.value = people.some((person) => person.id === requestedPerson) ? requestedPerson : people[0].id;

function currentPerson() {
  return people.find((person) => person.id === personSelect.value);
}

function showPersonGoal() {
  const person = currentPerson();
  personName.textContent = `${person.name}’s`;
  customGoal.value = person.goal;
  document.querySelectorAll("[name='preset-goal']").forEach((option) => {
    option.checked = Number(option.value) === person.goal;
  });
  savedMessage.textContent = "";
}

personSelect.addEventListener("change", showPersonGoal);

document.querySelectorAll("[name='preset-goal']").forEach((option) => {
  option.addEventListener("change", () => {
    customGoal.value = option.value;
  });
});

customGoal.addEventListener("input", () => {
  document.querySelectorAll("[name='preset-goal']").forEach((option) => {
    option.checked = Number(option.value) === Number(customGoal.value);
  });
});

goalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const goal = Number(customGoal.value);
  if (!Number.isFinite(goal) || goal < 8 || goal > 200) {
    goalError.textContent = "Choose a daily goal between 8 and 200 fl oz.";
    return;
  }
  currentPerson().goal = goal;
  saveGoal(currentPerson().id, goal);
  goalError.textContent = "";
  savedMessage.textContent = "Goal saved! Your next chapter is ready. ✨";
});

showPersonGoal();
