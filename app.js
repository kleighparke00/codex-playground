const $ = (selector) => document.querySelector(selector);
const STORAGE_KEY = 'sip-circle-local-v2';
const SESSION_KEY = 'sip-circle-active-profile';
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('sip-circle-local-team') : null;

let currentProfile = null;
let creatingProfile = false;
let unread = 0;
let toastTimer;

function emptyState() {
  return { profiles: [], entries: [], notifications: [] };
}

function getState() {
  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(state?.profiles) && Array.isArray(state?.entries) ? state : emptyState();
  } catch {
    return emptyState();
  }
}

function saveState(state, broadcast = true) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (broadcast) channel?.postMessage({ type: 'state-changed' });
}

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function profileColor(id) {
  const colors = ['#ffd36b', '#9de0c2', '#f7b4aa', '#b8d3fa', '#cdb7f6'];
  return colors[[...id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % colors.length];
}

function showToast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2600);
}

async function hashPin(pin, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function renderProfileOptions() {
  const profiles = getState().profiles;
  $('#profileSelect').innerHTML = profiles.length
    ? `<option value="">Choose your name</option>${profiles.map((profile) => `<option value="${profile.id}">${escapeHtml(profile.name)}</option>`).join('')}`
    : '<option value="">No profiles yet — create one below</option>';
  $('#authSubmit').disabled = !creatingProfile && profiles.length === 0;
}

function setCreateMode(enabled) {
  creatingProfile = enabled;
  $('#nameFieldset').classList.toggle('hidden', !enabled);
  $('#goalFieldset').classList.toggle('hidden', !enabled);
  $('#profileFieldset').classList.toggle('hidden', enabled);
  $('#displayName').required = enabled;
  $('#profileSelect').required = !enabled;
  $('#authSubmit').textContent = enabled ? 'Create profile →' : 'Unlock my day →';
  $('#authToggle').textContent = enabled ? 'Already have a profile? Sign in' : 'New to the circle? Create a profile';
  $('#loginTitle').innerHTML = enabled ? 'Come make<br><em>waves.</em>' : 'Ready to make<br><em>waves?</em>';
  $('#loginError').textContent = '';
  renderProfileOptions();
}

async function handleLogin(event) {
  event.preventDefault();
  const pin = $('#pin').value;
  if (!/^\d{4}$/.test(pin)) {
    $('#loginError').textContent = 'Your PIN must be exactly 4 numbers.';
    return;
  }

  const state = getState();
  if (creatingProfile) {
    const name = $('#displayName').value.trim();
    const goal = Number($('#signupGoal').value);
    if (!name || goal < 8 || goal > 300) {
      $('#loginError').textContent = 'Add your name and a goal between 8 and 300 oz.';
      return;
    }
    if (state.profiles.some((profile) => profile.name.toLowerCase() === name.toLowerCase())) {
      $('#loginError').textContent = 'That name already has a profile.';
      return;
    }
    const salt = crypto.randomUUID();
    const profile = { id: crypto.randomUUID(), name, goal, salt, pinHash: await hashPin(pin, salt) };
    state.profiles.push(profile);
    saveState(state);
    enterDashboard(profile);
    return;
  }

  const profile = state.profiles.find((item) => item.id === $('#profileSelect').value);
  if (!profile || await hashPin(pin, profile.salt) !== profile.pinHash) {
    $('#loginError').textContent = 'That profile and PIN do not match.';
    return;
  }
  enterDashboard(profile);
}

function enterDashboard(profile) {
  currentProfile = profile;
  sessionStorage.setItem(SESSION_KEY, profile.id);
  $('#pin').value = '';
  $('#loginView').classList.add('hidden');
  $('#dashboard').classList.remove('hidden');
  renderDashboard();
}

function todayEntries(state = getState()) {
  const today = todayKey();
  return state.entries.filter((entry) => entry.day === today);
}

function totalsByProfile(state) {
  return todayEntries(state).reduce((totals, entry) => {
    totals[entry.profileId] = (totals[entry.profileId] || 0) + entry.amount;
    return totals;
  }, {});
}

function friendlyStatus(percent) {
  if (percent >= 100) return 'Goal glowing ✨';
  if (percent >= 75) return 'Nearly sparkling';
  if (percent >= 50) return 'Flowing nicely';
  return percent > 0 ? 'Finding their flow' : 'Ready for a first sip';
}

function renderDashboard() {
  if (!currentProfile) return;
  const state = getState();
  currentProfile = state.profiles.find((profile) => profile.id === currentProfile.id);
  if (!currentProfile) return signOut();
  const totals = totalsByProfile(state);
  const total = totals[currentProfile.id] || 0;
  const percent = Math.round(total / currentProfile.goal * 100);
  const cappedPercent = Math.min(percent, 100);
  const ownEntries = todayEntries(state).filter((entry) => entry.profileId === currentProfile.id);
  const last = ownEntries.at(-1);

  $('#dateLabel').textContent = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase();
  $('#greeting').textContent = `Hey, ${currentProfile.name}! 👋`;
  $('#encouragement').textContent = percent >= 100 ? 'You made a splash — enjoy that goal glow!' : 'Your next little sip is already a win.';
  $('#headerAvatar').textContent = initials(currentProfile.name);
  $('#headerAvatar').style.background = profileColor(currentProfile.id);
  $('#headerName').textContent = currentProfile.name;
  $('#goalButtonText').textContent = `${currentProfile.goal} oz goal`;
  $('#todayTotal').textContent = total;
  $('#goalAmount').textContent = `${currentProfile.goal} oz`;
  $('#progressPercent').textContent = `${percent}% there`;
  $('#remainingText').textContent = percent >= 100 ? `${total - currentProfile.goal} oz beyond your goal!` : `${currentProfile.goal - total} oz to go`;
  $('#progressFill').style.width = `${cappedPercent}%`;
  $('.progress-track').setAttribute('aria-valuenow', cappedPercent);
  $('#cupWater').style.height = `${cappedPercent}%`;
  $('#celebration').classList.toggle('hidden', percent < 100);
  $('#lastEntry span').textContent = last ? `Last splash: ${last.amount} oz at ${new Date(last.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'No sips logged yet — let’s make a ripple!';
  $('#undoButton').disabled = !last;
  renderTeam(state, totals);
  renderNotifications(state);
}

function renderTeam(state, totals) {
  const barColors = ['#2daccd', '#4eb982', '#ff826d', '#8a9fe8'];
  $('#teamList').innerHTML = state.profiles.map((profile, index) => {
    const total = totals[profile.id] || 0;
    const percent = Math.round(total / profile.goal * 100);
    return `<div class="team-person"><span class="avatar" style="background:${profileColor(profile.id)}">${escapeHtml(initials(profile.name))}</span><div><div class="member-name">${escapeHtml(profile.name)} ${profile.id === currentProfile.id ? '<span class="you-badge">YOU</span>' : ''}</div><div class="member-status">${friendlyStatus(percent)}</div></div><div class="member-total"><strong>${total} oz</strong><small>${percent}% of goal</small></div><div class="member-progress"><span style="width:${Math.min(percent, 100)}%;background:${barColors[index % barColors.length]}"></span></div></div>`;
  }).join('');
}

function renderNotifications(state) {
  const notifications = state.notifications.filter((note) => note.profileId !== currentProfile.id).slice(-5).reverse();
  $('#notificationList').innerHTML = notifications.length
    ? notifications.map((note) => `<div class="notification-item">💧 <strong>${escapeHtml(note.name)}</strong> added ${note.amount} oz</div>`).join('')
    : '<div class="notification-item">It’s quiet on the water — for now!</div>';
  $('#notificationCount').textContent = unread;
  $('#notificationCount').classList.toggle('hidden', unread === 0);
}

function addWater(amount) {
  const state = getState();
  const entry = { id: crypto.randomUUID(), profileId: currentProfile.id, amount, day: todayKey(), time: Date.now() };
  state.entries.push(entry);
  state.notifications.push({ profileId: currentProfile.id, name: currentProfile.name, amount, time: entry.time });
  saveState(state);
  renderDashboard();
  showToast(`💧 ${amount} oz added — lovely splash!`);
}

function undoLast() {
  const state = getState();
  const index = state.entries.findLastIndex((entry) => entry.profileId === currentProfile.id && entry.day === todayKey());
  if (index < 0) return;
  const [entry] = state.entries.splice(index, 1);
  const noteIndex = state.notifications.findLastIndex((note) => note.profileId === currentProfile.id && note.time === entry.time);
  if (noteIndex >= 0) state.notifications.splice(noteIndex, 1);
  saveState(state);
  renderDashboard();
  showToast(`↶ Undid ${entry.amount} oz`);
}

function signOut() {
  currentProfile = null;
  sessionStorage.removeItem(SESSION_KEY);
  $('#dashboard').classList.add('hidden');
  $('#loginView').classList.remove('hidden');
  renderProfileOptions();
}

$('#authToggle').addEventListener('click', () => setCreateMode(!creatingProfile));
$('#loginForm').addEventListener('submit', handleLogin);
document.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => addWater(Number(button.dataset.add))));
$('#customButton').addEventListener('click', () => { $('#customAmount').value = ''; $('#customDialog').showModal(); });
$('#customForm').addEventListener('submit', (event) => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault();
  const amount = Number($('#customAmount').value);
  if (amount > 0 && amount <= 200) { $('#customDialog').close(); addWater(amount); }
});
$('#undoButton').addEventListener('click', undoLast);
$('#goalButton').addEventListener('click', () => { $('#newGoal').value = currentProfile.goal; $('#goalDialog').showModal(); });
$('#goalForm').addEventListener('submit', (event) => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault();
  const goal = Number($('#newGoal').value);
  if (goal < 8 || goal > 300) return;
  const state = getState();
  state.profiles.find((profile) => profile.id === currentProfile.id).goal = goal;
  saveState(state);
  $('#goalDialog').close();
  renderDashboard();
  showToast('New daily tide saved! 🎯');
});
$('#logoutButton').addEventListener('click', signOut);
$('#notificationButton').addEventListener('click', () => {
  $('#notificationPopover').classList.toggle('hidden');
  unread = 0;
  renderNotifications(getState());
});

window.addEventListener('storage', () => { if (currentProfile) { unread += 1; renderDashboard(); } else renderProfileOptions(); });
channel?.addEventListener('message', () => { if (currentProfile) { unread += 1; renderDashboard(); showToast('A teammate just made a splash! 💧'); } else renderProfileOptions(); });

// Remove the retired demo-data store once; it is never imported into the PIN-based site.
localStorage.removeItem('sip-circle-v1');
renderProfileOptions();
if (getState().profiles.length === 0) setCreateMode(true);
const remembered = getState().profiles.find((profile) => profile.id === sessionStorage.getItem(SESSION_KEY));
if (remembered) enterDashboard(remembered);
