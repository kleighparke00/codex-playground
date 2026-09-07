const PEOPLE = [
  { id: 'maya', name: 'Maya', email: 'maya@brightworks.co', goal: 80, color: '#ffd36b', initial: 56 },
  { id: 'jonah', name: 'Jonah', email: 'jonah@brightworks.co', goal: 96, color: '#9de0c2', initial: 76 },
  { id: 'priya', name: 'Priya', email: 'priya@brightworks.co', goal: 72, color: '#f7b4aa', initial: 64 },
  { id: 'theo', name: 'Theo', email: 'theo@brightworks.co', goal: 88, color: '#b8d3fa', initial: 40 }
];

const STORAGE_KEY = 'sip-circle-v1';
const $ = (selector) => document.querySelector(selector);
let selectedPerson = PEOPLE[0];
let currentPerson = null;
let unread = 0;
let toastTimer;
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('sip-circle-team') : null;

function defaultState() {
  return { date: localDateKey(), totals: Object.fromEntries(PEOPLE.map((p) => [p.id, p.initial])), entries: Object.fromEntries(PEOPLE.map((p) => [p.id, []])), notifications: [] };
}

function localDateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function getState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored?.totals || !stored?.entries || stored.date !== localDateKey()) return defaultState();
    return stored;
  } catch { return defaultState(); }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  channel?.postMessage({ type: 'update' });
}

function initials(name) { return name.slice(0, 2).toUpperCase(); }
function avatar(person, className = '') { return `<span class="avatar ${className}" style="background:${person.color}">${initials(person.name)}</span>`; }

function renderPicker() {
  $('#peoplePicker').innerHTML = PEOPLE.map((person) => `<button class="person-option ${person.id === selectedPerson.id ? 'selected' : ''}" type="button" data-person="${person.id}">${avatar(person)}<small>${person.name}</small></button>`).join('');
  document.querySelectorAll('.person-option').forEach((button) => button.addEventListener('click', () => {
    selectedPerson = PEOPLE.find((person) => person.id === button.dataset.person);
    $('#email').value = selectedPerson.email;
    $('#loginError').textContent = '';
    renderPicker();
  }));
}

function friendlyStatus(percent) {
  if (percent >= 100) return 'Goal glowing ✨';
  if (percent >= 75) return 'Nearly sparkling';
  if (percent >= 50) return 'Flowing nicely';
  return 'Finding their flow';
}

function renderDashboard() {
  if (!currentPerson) return;
  const state = getState();
  const total = state.totals[currentPerson.id] || 0;
  const percent = Math.round((total / currentPerson.goal) * 100);
  const displayPercent = Math.min(percent, 100);
  const entries = state.entries[currentPerson.id] || [];
  const last = entries.at(-1);
  $('#dateLabel').textContent = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase();
  $('#greeting').textContent = `Hey, ${currentPerson.name}! 👋`;
  $('#encouragement').textContent = percent >= 100 ? 'You made a splash — enjoy that goal glow!' : 'Your next little sip is already a win.';
  $('#headerAvatar').textContent = initials(currentPerson.name);
  $('#headerAvatar').style.background = currentPerson.color;
  $('#headerName').textContent = currentPerson.name;
  $('#streakCount').textContent = `${Math.max(1, entries.length + 2)} day streak`;
  $('#todayTotal').textContent = total;
  $('#goalAmount').textContent = `${currentPerson.goal} oz`;
  $('#progressPercent').textContent = `${percent}% there`;
  $('#remainingText').textContent = percent >= 100 ? `${total - currentPerson.goal} oz beyond your goal!` : `${currentPerson.goal - total} oz to go`;
  $('#progressFill').style.width = `${displayPercent}%`;
  $('.progress-track').setAttribute('aria-valuenow', displayPercent);
  $('#cupWater').style.height = `${displayPercent}%`;
  $('#celebration').classList.toggle('hidden', percent < 100);
  $('#lastEntry span').textContent = last ? `Last splash: ${last.amount} oz at ${new Date(last.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'No sips logged yet — let’s make a ripple!';
  $('#undoButton').disabled = !last;
  renderTeam(state);
  renderNotifications(state);
}

function renderTeam(state) {
  const colors = ['#2daccd', '#4eb982', '#ff826d', '#8a9fe8'];
  $('#teamList').innerHTML = PEOPLE.map((person, index) => {
    const total = state.totals[person.id] || 0;
    const percent = Math.round(total / person.goal * 100);
    return `<div class="team-person">${avatar(person)}<div><div class="member-name">${person.name} ${person.id === currentPerson.id ? '<span class="you-badge">YOU</span>' : ''}</div><div class="member-status">${friendlyStatus(percent)}</div></div><div class="member-total"><strong>${total} oz</strong><small>${percent}% of goal</small></div><div class="member-progress"><span style="width:${Math.min(percent, 100)}%;background:${colors[index]}"></span></div></div>`;
  }).join('');
}

function renderNotifications(state) {
  const notes = state.notifications.filter((note) => note.personId !== currentPerson.id).slice(-5).reverse();
  $('#notificationList').innerHTML = notes.length ? notes.map((note) => `<div class="notification-item">💧 <strong>${note.name}</strong> added ${note.amount} oz <span>· ${timeAgo(note.time)}</span></div>`).join('') : '<div class="notification-item">It’s quiet on the water — for now!</div>';
  $('#notificationCount').textContent = unread;
  $('#notificationCount').classList.toggle('hidden', unread === 0);
}

function timeAgo(time) {
  const minutes = Math.floor((Date.now() - time) / 60000);
  return minutes < 1 ? 'just now' : `${minutes}m ago`;
}

function showToast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2600);
}

function addWater(amount) {
  const state = getState();
  const oldTotal = state.totals[currentPerson.id] || 0;
  const entry = { amount, time: Date.now() };
  state.totals[currentPerson.id] = oldTotal + amount;
  state.entries[currentPerson.id] ||= [];
  state.entries[currentPerson.id].push(entry);
  state.notifications.push({ ...entry, personId: currentPerson.id, name: currentPerson.name });
  saveState(state);
  renderDashboard();
  if (oldTotal < currentPerson.goal && state.totals[currentPerson.id] >= currentPerson.goal) showToast('🎉 Goal made! You’re making waves!');
  else showToast(`💧 ${amount} oz added — lovely splash!`);
}

function login(event) {
  event.preventDefault();
  const email = $('#email').value.trim().toLowerCase();
  if (email !== selectedPerson.email) {
    $('#loginError').textContent = `That email doesn’t match ${selectedPerson.name}’s demo profile.`;
    return;
  }
  currentPerson = selectedPerson;
  sessionStorage.setItem('sip-circle-user', currentPerson.id);
  $('#loginView').classList.add('hidden');
  $('#dashboard').classList.remove('hidden');
  renderDashboard();
}

renderPicker();
$('#email').value = selectedPerson.email;
$('#loginForm').addEventListener('submit', login);
document.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => addWater(Number(button.dataset.add))));
$('#customButton').addEventListener('click', () => { $('#customAmount').value = ''; $('#customDialog').showModal(); setTimeout(() => $('#customAmount').focus(), 0); });
$('#customForm').addEventListener('submit', (event) => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault();
  const amount = Number($('#customAmount').value);
  if (amount > 0 && amount <= 200) { $('#customDialog').close(); addWater(amount); }
});
$('#undoButton').addEventListener('click', () => {
  const state = getState();
  const entry = state.entries[currentPerson.id].pop();
  if (!entry) return;
  state.totals[currentPerson.id] = Math.max(0, state.totals[currentPerson.id] - entry.amount);
  const noteIndex = state.notifications.findLastIndex((note) => note.personId === currentPerson.id && note.time === entry.time);
  if (noteIndex >= 0) state.notifications.splice(noteIndex, 1);
  saveState(state); renderDashboard(); showToast(`↶ Undid ${entry.amount} oz`);
});
$('#logoutButton').addEventListener('click', () => { currentPerson = null; sessionStorage.removeItem('sip-circle-user'); $('#dashboard').classList.add('hidden'); $('#loginView').classList.remove('hidden'); });
$('#notificationButton').addEventListener('click', () => { const popover = $('#notificationPopover'); popover.classList.toggle('hidden'); const open = !popover.classList.contains('hidden'); $('#notificationButton').setAttribute('aria-expanded', open); if (open) { unread = 0; renderNotifications(getState()); } });
window.addEventListener('storage', () => { if (currentPerson) { unread += 1; renderDashboard(); showToast('A teammate just made a splash! 💧'); } });
channel?.addEventListener('message', () => { if (currentPerson) { unread += 1; renderDashboard(); showToast('A teammate just made a splash! 💧'); } });

const remembered = PEOPLE.find((person) => person.id === sessionStorage.getItem('sip-circle-user'));
if (remembered) { currentPerson = selectedPerson = remembered; $('#loginView').classList.add('hidden'); $('#dashboard').classList.remove('hidden'); renderDashboard(); }
