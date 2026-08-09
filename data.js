const SAMPLE_PEOPLE = [
  { id: "maya", name: "Maya", goal: 64, entries: [12, 16], color: "#e875aa", pale: "#fdeaf2", symbol: "✿" },
  { id: "theo", name: "Theo", goal: 80, entries: [20, 20, 16], color: "#5f9ed7", pale: "#eaf4ff", symbol: "✦" },
  { id: "leila", name: "Leila", goal: 72, entries: [12, 12, 8, 20], color: "#d89c32", pale: "#fff5dc", symbol: "☀" },
  { id: "jordan", name: "Jordan", goal: 64, entries: [16, 16, 16, 20], color: "#56ae91", pale: "#e5f8f1", symbol: "❧" },
  { id: "sam", name: "Sam", goal: 88, entries: [20, 12], color: "#8b72ca", pale: "#f0ebff", symbol: "☾" },
];

function getSavedGoals() {
  try {
    return JSON.parse(localStorage.getItem("daily-drip-goals")) || {};
  } catch {
    return {};
  }
}

function createPeople() {
  const goals = getSavedGoals();
  return SAMPLE_PEOPLE.map((person) => ({
    ...person,
    goal: goals[person.id] || person.goal,
    entries: [...person.entries],
  }));
}

function saveGoal(personId, goal) {
  const goals = getSavedGoals();
  goals[personId] = goal;
  localStorage.setItem("daily-drip-goals", JSON.stringify(goals));
}
