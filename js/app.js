/* ============================================================
   Life Dashboard — vanilla JavaScript
   Sections:
     1. Storage helpers          6. Focus timer
     2. State                    7. To-do list
     3. Clock & greeting         8. Quick links
     4. Weather widget           9. Settings & theme
     5. Motivational quotes     10. Init
   ============================================================ */
'use strict';

/* ══════════ 1 · STORAGE HELPERS ══════════ */

const KEYS = {
  tasks: 'dash.tasks',
  links: 'dash.links',
  settings: 'dash.settings',
  stats: 'dash.stats'
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (err) {
    console.warn('Could not read', key, err);
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Could not save', key, err);
  }
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const $ = (id) => document.getElementById(id);

/* ══════════ 2 · STATE ══════════ */

const DEFAULT_SETTINGS = {
  name: '',
  theme: 'light',
  focusMin: 25,
  breakMin: 5,
  city: 'Kuala Lumpur',
  sound: true,
  sort: 'created-desc',
  filter: 'all'
};

const DEFAULT_LINKS = [
  { id: uid(), label: 'Gmail', url: 'https://mail.google.com' },
  { id: uid(), label: 'GitHub', url: 'https://github.com' },
  { id: uid(), label: 'YouTube', url: 'https://youtube.com' }
];

let settings = Object.assign({}, DEFAULT_SETTINGS, load(KEYS.settings, {}));
let tasks = load(KEYS.tasks, []);
let links = load(KEYS.links, DEFAULT_LINKS);
let stats = load(KEYS.stats, { date: '', rounds: 0 });

let search = '';

/* ══════════ 3 · CLOCK & GREETING ══════════ */

function greetingFor(hour) {
  if (hour < 5) return 'Still up';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

function tickClock() {
  const now = new Date();

  $('clock').textContent = now.toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  $('date').textContent = now.toLocaleDateString([], {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const name = settings.name.trim();
  $('greeting').textContent = greetingFor(now.getHours()) + (name ? `, ${name}` : '') + '.';
}

/* ══════════ 4 · WEATHER WIDGET ══════════ */
/* Uses Open-Meteo — a free API that needs no key.
   Falls back to mock data if offline or blocked.          */

const WMO = {
  0:  ['Clear sky', '☀️'],
  1:  ['Mainly clear', '🌤️'],
  2:  ['Partly cloudy', '⛅'],
  3:  ['Overcast', '☁️'],
  45: ['Fog', '🌫️'],
  48: ['Freezing fog', '🌫️'],
  51: ['Light drizzle', '🌦️'],
  53: ['Drizzle', '🌦️'],
  55: ['Heavy drizzle', '🌦️'],
  61: ['Light rain', '🌧️'],
  63: ['Rain', '🌧️'],
  65: ['Heavy rain', '🌧️'],
  71: ['Light snow', '🌨️'],
  73: ['Snow', '🌨️'],
  75: ['Heavy snow', '❄️'],
  80: ['Rain showers', '🌦️'],
  81: ['Showers', '🌦️'],
  82: ['Violent showers', '⛈️'],
  95: ['Thunderstorm', '⛈️'],
  96: ['Storm with hail', '⛈️'],
  99: ['Severe storm', '⛈️']
};

function paintWeather(temp, code, place) {
  const [desc, icon] = WMO[code] || ['—', '⛅'];
  $('wTemp').textContent = Math.round(temp) + '°C';
  $('wDesc').textContent = desc;
  $('wIcon').textContent = icon;
  $('wPlace').textContent = place;
}

function mockWeather() {
  paintWeather(30, 2, settings.city + ' · sample data');
}

async function geocode(city) {
  const url = 'https://geocoding-api.open-meteo.com/v1/search'
            + `?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  if (!data.results || !data.results.length) throw new Error('City not found');
  const hit = data.results[0];
  return { lat: hit.latitude, lon: hit.longitude, name: hit.name + ', ' + (hit.country_code || '') };
}

async function fetchWeather() {
  $('wDesc').textContent = 'Loading weather…';
  try {
    const place = await geocode(settings.city || 'Kuala Lumpur');
    const url = 'https://api.open-meteo.com/v1/forecast'
              + `?latitude=${place.lat}&longitude=${place.lon}`
              + '&current=temperature_2m,weather_code';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather failed');
    const data = await res.json();
    paintWeather(data.current.temperature_2m, data.current.weather_code, place.name);
  } catch (err) {
    console.warn('Weather unavailable, showing mock data:', err.message);
    mockWeather();
  }
}

/* ══════════ 5 · MOTIVATIONAL QUOTES ══════════ */

const QUOTES = [
  ['Small daily improvements are the key to staggering long-term results.', 'Unknown'],
  ['You do not rise to the level of your goals. You fall to the level of your systems.', 'James Clear'],
  ['The secret of getting ahead is getting started.', 'Mark Twain'],
  ['Done is better than perfect.', 'Sheryl Sandberg'],
  ['Amateurs sit and wait for inspiration. The rest of us just get up and go to work.', 'Stephen King'],
  ['It always seems impossible until it is done.', 'Nelson Mandela'],
  ['Focus is a matter of deciding what things you are not going to do.', 'John Carmack'],
  ['Patience is not the ability to wait, but to keep a good attitude while waiting.', 'Joyce Meyer'],
  ['Quality is not an act, it is a habit.', 'Aristotle'],
  ['Start where you are. Use what you have. Do what you can.', 'Arthur Ashe'],
  ['A calm mind brings inner strength and self-confidence.', 'Dalai Lama'],
  ['Motivation gets you going, but discipline keeps you growing.', 'John Maxwell'],
  ['The best way out is always through.', 'Robert Frost'],
  ['Do not watch the clock. Do what it does — keep going.', 'Sam Levenson'],
  ['Progress, not perfection.', 'Unknown']
];

function dayIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

function showQuote(index) {
  const [text, author] = QUOTES[index % QUOTES.length];
  $('quoteText').textContent = '“' + text + '”';
  $('quoteAuthor').textContent = '— ' + author;
}

/* ══════════ 6 · FOCUS TIMER ══════════ */

const timer = {
  mode: 'focus',
  remaining: settings.focusMin * 60,
  running: false,
  endAt: 0,
  handle: null
};

const RING_LENGTH = 339.29; // 2πr where r = 54

function totalSeconds() {
  return (timer.mode === 'focus' ? settings.focusMin : settings.breakMin) * 60;
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function paintTimer() {
  const total = totalSeconds();
  const left = Math.max(0, timer.remaining);

  $('timerTime').textContent = formatTime(left);
  $('timerMode').textContent = timer.mode === 'focus' ? 'Focus' : 'Break';

  const ring = $('ringFg');
  ring.style.strokeDashoffset = RING_LENGTH * (1 - left / total);
  ring.classList.toggle('break', timer.mode === 'break');

  $('startBtn').textContent = timer.running ? 'Pause' : 'Start';
  $('timerRounds').textContent = stats.rounds + (stats.rounds === 1 ? ' round today' : ' rounds today');

  document.title = timer.running ? formatTime(left) + ' · Life Dashboard' : 'Life Dashboard';
}

function beep() {
  if (!settings.sound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.22, 0.44].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.2);
    });
  } catch (err) {
    console.warn('Sound unavailable', err);
  }
}

function timerFinished() {
  clearInterval(timer.handle);
  timer.running = false;
  timer.remaining = 0;
  beep();

  if (timer.mode === 'focus') {
    stats.rounds += 1;
    save(KEYS.stats, stats);
  }

  paintTimer();

  const message = timer.mode === 'focus'
    ? 'Focus session complete. Time for a break.'
    : 'Break over. Ready for another round?';

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Life Dashboard', { body: message });
  }

  // Flip to the opposite mode, ready to start
  setMode(timer.mode === 'focus' ? 'break' : 'focus');
}

function tickTimer() {
  timer.remaining = Math.max(0, Math.round((timer.endAt - Date.now()) / 1000));
  if (timer.remaining <= 0) {
    timerFinished();
  } else {
    paintTimer();
  }
}

function startTimer() {
  if (timer.running) {           // Pause
    clearInterval(timer.handle);
    timer.running = false;
    paintTimer();
    return;
  }
  if (timer.remaining <= 0) timer.remaining = totalSeconds();

  timer.endAt = Date.now() + timer.remaining * 1000;
  timer.running = true;
  timer.handle = setInterval(tickTimer, 250);

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  paintTimer();
}

function stopTimer() {
  clearInterval(timer.handle);
  timer.running = false;
  paintTimer();
}

function resetTimer() {
  clearInterval(timer.handle);
  timer.running = false;
  timer.remaining = totalSeconds();
  paintTimer();
}

function setMode(mode) {
  timer.mode = mode;
  document.querySelectorAll('.mode-switch .chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.mode === mode);
  });
  resetTimer();
}

/* ══════════ 7 · TO-DO LIST ══════════ */

const normalise = (str) => str.trim().replace(/\s+/g, ' ').toLowerCase();

function flashWarning(message) {
  const warn = $('taskWarn');
  warn.textContent = message;
  warn.classList.add('show');
  $('taskInput').classList.add('shake');
  setTimeout(() => $('taskInput').classList.remove('shake'), 350);
  setTimeout(() => warn.classList.remove('show'), 2600);
}

function addTask(text, category) {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (!clean) return false;

  const duplicate = tasks.some((t) => normalise(t.text) === normalise(clean));
  if (duplicate) {
    flashWarning('That task is already on your list.');
    return false;
  }

  tasks.unshift({
    id: uid(),
    text: clean,
    category: category,
    done: false,
    createdAt: Date.now()
  });

  save(KEYS.tasks, tasks);
  renderTasks();
  return true;
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.done = !task.done;
  task.completedAt = task.done ? Date.now() : null;
  save(KEYS.tasks, tasks);
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save(KEYS.tasks, tasks);
  renderTasks();
}

function updateTask(id, newText) {
  const clean = newText.trim().replace(/\s+/g, ' ');
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  if (!clean) { renderTasks(); return; }

  const clash = tasks.some((t) => t.id !== id && normalise(t.text) === normalise(clean));
  if (clash) {
    flashWarning('Another task already has that name.');
    renderTasks();
    return;
  }

  task.text = clean;
  save(KEYS.tasks, tasks);
  renderTasks();
}

function beginEdit(task, textEl) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-edit';
  input.value = task.text;
  input.maxLength = 120;

  textEl.replaceWith(input);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  let settled = false;
  const commit = () => { if (!settled) { settled = true; updateTask(task.id, input.value); } };

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { settled = true; renderTasks(); }
  });
}

function visibleTasks() {
  let list = tasks.slice();

  // Filter
  const f = settings.filter;
  if (f === 'active') list = list.filter((t) => !t.done);
  else if (f === 'done') list = list.filter((t) => t.done);
  else if (f !== 'all') list = list.filter((t) => t.category === f);

  // Search
  if (search) {
    const q = normalise(search);
    list = list.filter((t) => normalise(t.text).includes(q));
  }

  // Sort
  switch (settings.sort) {
    case 'created-asc': list.sort((a, b) => a.createdAt - b.createdAt); break;
    case 'alpha':       list.sort((a, b) => a.text.localeCompare(b.text)); break;
    case 'active':      list.sort((a, b) => (a.done - b.done) || (b.createdAt - a.createdAt)); break;
    case 'category':    list.sort((a, b) => a.category.localeCompare(b.category) || (b.createdAt - a.createdAt)); break;
    default:            list.sort((a, b) => b.createdAt - a.createdAt);
  }

  return list;
}

function buildTaskRow(task) {
  const li = document.createElement('li');
  li.className = 'task' + (task.done ? ' done' : '');

  // Checkbox
  const check = document.createElement('button');
  check.type = 'button';
  check.className = 'check' + (task.done ? ' on' : '');
  check.textContent = task.done ? '✓' : '';
  check.setAttribute('aria-label', task.done ? 'Mark as not done' : 'Mark as done');
  check.addEventListener('click', () => toggleTask(task.id));

  // Body
  const main = document.createElement('div');
  main.className = 'task-main';

  const text = document.createElement('span');
  text.className = 'task-text';
  text.textContent = task.text;
  text.title = 'Double-click to edit';
  text.addEventListener('dblclick', () => beginEdit(task, text));

  const meta = document.createElement('div');
  meta.className = 'task-meta';

  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.dataset.cat = task.category;
  tag.textContent = task.category;

  const stamp = document.createElement('span');
  stamp.className = 'stamp';
  stamp.textContent = new Date(task.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' });

  meta.append(tag, stamp);
  main.append(text, meta);

  // Buttons
  const btns = document.createElement('div');
  btns.className = 'task-btns';

  const edit = document.createElement('button');
  edit.type = 'button';
  edit.className = 'mini';
  edit.textContent = '✎';
  edit.title = 'Edit task';
  edit.addEventListener('click', () => beginEdit(task, text));

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'mini del';
  del.textContent = '🗑';
  del.title = 'Delete task';
  del.addEventListener('click', () => deleteTask(task.id));

  btns.append(edit, del);
  li.append(check, main, btns);
  return li;
}

function renderTasks() {
  const list = visibleTasks();
  const ul = $('tasks');
  ul.textContent = '';
  list.forEach((task) => ul.appendChild(buildTaskRow(task)));

  $('tasksEmpty').classList.toggle('hide', list.length > 0);

  const doneCount = tasks.filter((t) => t.done).length;
  $('taskCount').textContent = doneCount + ' / ' + tasks.length;
  $('progressBar').style.width = tasks.length ? (doneCount / tasks.length * 100) + '%' : '0%';
  $('clearDoneBtn').disabled = doneCount === 0;
}

/* ══════════ 8 · QUICK LINKS ══════════ */

function tidyUrl(raw) {
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try {
    return new URL(url).href;
  } catch (err) {
    return null;
  }
}

function buildLinkTile(link) {
  const a = document.createElement('a');
  a.className = 'link';
  a.href = link.url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.title = link.url;

  const ico = document.createElement('span');
  ico.className = 'link-ico';
  ico.textContent = link.label.charAt(0).toUpperCase();

  // Try a favicon; keep the letter if it fails to load
  try {
    const host = new URL(link.url).hostname;
    const img = document.createElement('img');
    img.src = `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
    img.alt = '';
    img.addEventListener('load', () => { ico.textContent = ''; ico.appendChild(img); });
  } catch (err) { /* keep the letter */ }

  const name = document.createElement('span');
  name.className = 'link-name';
  name.textContent = link.label;

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'link-del';
  del.textContent = '×';
  del.title = 'Remove link';
  del.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    links = links.filter((l) => l.id !== link.id);
    save(KEYS.links, links);
    renderLinks();
  });

  a.append(ico, name, del);
  return a;
}

function renderLinks() {
  const box = $('links');
  box.textContent = '';
  links.forEach((link) => box.appendChild(buildLinkTile(link)));
  $('linksEmpty').classList.toggle('hide', links.length > 0);
  $('linkCount').textContent = links.length;
}

/* ══════════ 9 · SETTINGS & THEME ══════════ */

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  $('themeBtn').textContent = theme === 'dark' ? '☀️' : '🌙';
  $('themeBtn').title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
}

function openSettings() {
  $('setName').value  = settings.name;
  $('setFocus').value = settings.focusMin;
  $('setBreak').value = settings.breakMin;
  $('setCity').value  = settings.city;
  $('setSound').checked = settings.sound;
  $('settingsDialog').showModal();
}

function saveSettingsFromForm() {
  settings.name     = $('setName').value.trim().slice(0, 24);
  settings.focusMin = Math.min(180, Math.max(1, parseInt($('setFocus').value, 10) || 25));
  settings.breakMin = Math.min(60,  Math.max(1, parseInt($('setBreak').value, 10) || 5));
  settings.sound    = $('setSound').checked;

  const newCity = $('setCity').value.trim();
  const cityChanged = newCity && newCity !== settings.city;
  if (newCity) settings.city = newCity;

  save(KEYS.settings, settings);
  tickClock();
  if (!timer.running) resetTimer();
  if (cityChanged) fetchWeather();
}

/* ══════════ 10 · INIT ══════════ */

function resetDailyStats() {
  const today = new Date().toDateString();
  if (stats.date !== today) {
    stats = { date: today, rounds: 0 };
    save(KEYS.stats, stats);
  }
}

function wireEvents() {
  /* Theme */
  $('themeBtn').addEventListener('click', () => {
    settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
    applyTheme(settings.theme);
    save(KEYS.settings, settings);
  });

  /* Settings dialog */
  $('settingsBtn').addEventListener('click', openSettings);
  $('settingsForm').addEventListener('submit', (e) => {
    if (e.submitter && e.submitter.value === 'save') saveSettingsFromForm();
  });

  /* Timer */
  $('startBtn').addEventListener('click', startTimer);
  $('stopBtn').addEventListener('click', stopTimer);
  $('resetBtn').addEventListener('click', resetTimer);
  document.querySelectorAll('.mode-switch .chip').forEach((chip) => {
    chip.addEventListener('click', () => setMode(chip.dataset.mode));
  });

  /* Add task */
  $('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('taskInput');
    if (addTask(input.value, $('taskCategory').value)) input.value = '';
    input.focus();
  });

  /* Search, sort, filter */
  $('searchInput').addEventListener('input', (e) => {
    search = e.target.value;
    renderTasks();
  });

  $('sortSelect').addEventListener('change', (e) => {
    settings.sort = e.target.value;
    save(KEYS.settings, settings);
    renderTasks();
  });

  $('filters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    settings.filter = chip.dataset.filter;
    save(KEYS.settings, settings);
    document.querySelectorAll('#filters .chip').forEach((c) => {
      c.classList.toggle('active', c === chip);
    });
    renderTasks();
  });

  /* Clear completed */
  $('clearDoneBtn').addEventListener('click', () => {
    tasks = tasks.filter((t) => !t.done);
    save(KEYS.tasks, tasks);
    renderTasks();
  });

  /* Quick links */
  $('linkForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const label = $('linkLabel').value.trim();
    const url = tidyUrl($('linkUrl').value);
    if (!label || !url) return;

    links.push({ id: uid(), label: label.slice(0, 24), url: url });
    save(KEYS.links, links);
    renderLinks();
    $('linkLabel').value = '';
    $('linkUrl').value = '';
  });

  /* Weather refresh */
  $('wRefresh').addEventListener('click', fetchWeather);

  /* New quote */
  $('newQuoteBtn').addEventListener('click', () => {
    showQuote(Math.floor(Math.random() * QUOTES.length));
  });

  /* Keyboard shortcut: press "n" to jump to the task field */
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);
    if (e.key === 'n' && !typing && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      $('taskInput').focus();
    }
  });
}

function init() {
  resetDailyStats();
  applyTheme(settings.theme);

  // Restore saved sort and filter
  $('sortSelect').value = settings.sort;
  document.querySelectorAll('#filters .chip').forEach((c) => {
    c.classList.toggle('active', c.dataset.filter === settings.filter);
  });

  tickClock();
  setInterval(tickClock, 1000);

  showQuote(dayIndex());
  renderTasks();
  renderLinks();

  timer.remaining = totalSeconds();
  paintTimer();

  wireEvents();
  fetchWeather();
}

document.addEventListener('DOMContentLoaded', init);
