const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const toast = $('#toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

const modal = $('#voiceModal');
function openVoiceSession() {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  $('.assistant-card').classList.add('listening');
  document.body.style.overflow = 'hidden';
}
function closeVoiceSession() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  $('.assistant-card').classList.remove('listening');
  document.body.style.overflow = '';
}

$('#voiceButton').addEventListener('click', openVoiceSession);
$('#openAssistant').addEventListener('click', openVoiceSession);
$('#startInspection').addEventListener('click', openVoiceSession);
$('.close-modal').addEventListener('click', closeVoiceSession);
$('.close-session').addEventListener('click', closeVoiceSession);
modal.addEventListener('click', (event) => { if (event.target === modal) closeVoiceSession(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeVoiceSession(); });

$('#saveNote').addEventListener('click', () => {
  closeVoiceSession();
  showToast('Hive #1 inspection update saved to records');
});

$$('.check').forEach((button) => button.addEventListener('click', () => {
  const row = button.closest('.task-row');
  row.classList.toggle('completed');
  showToast(row.classList.contains('completed') ? 'Task marked complete' : 'Task reopened');
}));

$$('.apiary-row').forEach((row) => row.addEventListener('click', () => {
  $$('.apiary-row').forEach((item) => item.classList.remove('selected'));
  row.classList.add('selected');
  showToast(`${row.dataset.name} selected`);
}));

$('#addTask').addEventListener('click', () => {
  const title = window.prompt('What needs to be done?');
  if (!title?.trim()) return;
  const row = document.createElement('div');
  row.className = 'task-row';
  row.innerHTML = `<button class="check" aria-label="Complete task"></button><div class="task-title"><strong></strong><small>Hive #1 · Clover Hill</small></div><span class="due">New</span><span class="priority medium">Medium</span><button class="more">•••</button>`;
  $('strong', row).textContent = title.trim();
  $('.check', row).addEventListener('click', () => row.classList.toggle('completed'));
  $('#taskTable').appendChild(row);
  showToast('New task added');
});

$('.mobile-menu').addEventListener('click', () => $('.sidebar').classList.toggle('open'));
