const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const musicBtn = document.getElementById('musicBtn');
const hint = document.getElementById('hint');
const card = document.getElementById('card');
const questionnaire = document.getElementById('questionnaire');
const qStack = document.getElementById('qStack');
const resultCard = document.getElementById('resultCard');
const resultTitle = document.getElementById('resultTitle');
const resultSub = document.getElementById('resultSub');
const replayBtn = document.getElementById('replayBtn');
const qCards = Array.from(document.querySelectorAll('.q-card'));

let noClicks = 0;
let currentStep = 0;

const petNames = ['cutu', 'bubba', 'sweetu', 'gooshie'];

function cap(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function randomPet(exclude = []) {
  const pool = petNames.filter((p) => !exclude.includes(p));
  return pool[Math.floor(Math.random() * pool.length)] || petNames[0];
}

function applyRandomPetNames() {
  const used = [];
  ['pet1', 'pet2', 'pet3', 'pet4', 'pet5', 'pet6'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const pick = randomPet(used.length < petNames.length ? used : []);
    if (used.length < petNames.length) used.push(pick);
    el.textContent = cap(pick);
  });
}

noBtn.addEventListener('click', dodgeNo);
noBtn.addEventListener('touchstart', dodgeNo, { passive: true });

function dodgeNo() {
  noClicks++;
  const messages = [
    'Are you sure? 🥺',
    'Think again 😏',
    'That button is shy today 👀',
    'Come on, say yes 💕',
    'This is our special moment 🍥'
  ];
  hint.textContent = messages[Math.min(noClicks - 1, messages.length - 1)];

  const x = Math.random() * 140 - 70;
  const y = Math.random() * 56 - 28;
  noBtn.style.transform = `translate(${x}px, ${y}px)`;
}

yesBtn.addEventListener('click', () => {
  resetQuestionnaire();
  card.classList.add('hidden');
  questionnaire.classList.remove('hidden');
  questionnaire.scrollIntoView({ behavior: 'smooth', block: 'start' });
  currentStep = 0;
  updateStack();
  launchConfetti();
});

applyRandomPetNames();

function updateStack() {
  qCards.forEach((cardEl, idx) => {
    cardEl.classList.remove('active', 'next', 'queued');
    if (idx === currentStep) cardEl.classList.add('active');
    else if (idx === currentStep + 1) cardEl.classList.add('next');
    else if (idx === currentStep + 2) cardEl.classList.add('queued');
  });

  const active = qCards[currentStep];
  if (active) {
    qStack.style.minHeight = `${Math.max(420, active.offsetHeight + 26)}px`;
  }
}

for (const btn of document.querySelectorAll('.q-btn')) {
  btn.addEventListener('click', () => {
    const cardEl = btn.closest('.q-card');
    const idx = Number(cardEl.dataset.step || 0);

    if (idx !== currentStep) return;
    if (cardEl.dataset.locked === 'true') return;

    const group = btn.closest('.q-actions');
    const feedback = cardEl.querySelector('.q-feedback');

    group.querySelectorAll('.q-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    feedback.textContent = `✅ Perfect answer, ${cap(randomPet())} 💞`;
    cardEl.dataset.locked = 'true';

    group.querySelectorAll('.q-btn').forEach(b => {
      if (b !== btn) {
        b.classList.add('locked');
        b.disabled = true;
      }
    });

    if (idx === qCards.length - 1) {
      setTimeout(showFinalCard, 550);
    } else {
      cardEl.classList.add('swipe-out');
      setTimeout(() => {
        currentStep += 1;
        updateStack();
        const nextCard = qCards[currentStep];
        nextCard.classList.add('swipe-in');
        setTimeout(() => nextCard.classList.remove('swipe-in'), 420);
      }, 380);
    }
  });
}

function typeWriter(el, text, speed = 36) {
  el.textContent = '';
  let i = 0;
  const timer = setInterval(() => {
    el.textContent += text[i] || '';
    i += 1;
    if (i >= text.length) clearInterval(timer);
  }, speed);
}

function showFinalCard() {
  qStack.classList.add('hidden');
  resultCard.classList.remove('hidden');
  typeWriter(resultTitle, 'Best Girlfriend Ever 💖', 42);
  setTimeout(() => typeWriter(resultSub, `I love you always — my ${cap(randomPet())} 😚`, 28), 420);
  launchConfetti();
}

function resetQuestionnaire() {
  qStack.classList.remove('hidden');
  resultCard.classList.add('hidden');
  resultTitle.textContent = '';
  resultSub.textContent = '';

  qCards.forEach((cardEl) => {
    cardEl.dataset.locked = 'false';
    cardEl.classList.remove('swipe-out', 'swipe-in');
    cardEl.querySelectorAll('.q-btn').forEach((b) => {
      b.disabled = false;
      b.classList.remove('selected', 'locked');
    });
    const feedback = cardEl.querySelector('.q-feedback');
    if (feedback) feedback.textContent = '';
  });
}

replayBtn.addEventListener('click', () => {
  currentStep = 0;
  resetQuestionnaire();
  applyRandomPetNames();
  updateStack();
  questionnaire.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

let audioCtx;
let musicTimer;
let musicOn = false;

function playNote(freq, duration = 0.35, gainVal = 0.04) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(gainVal, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

function startMusic() {
  if (musicOn) return;
  const progression = [293.66, 349.23, 392.0, 440.0, 392.0, 349.23, 293.66, 261.63];
  let i = 0;
  musicTimer = setInterval(() => {
    playNote(progression[i % progression.length]);
    i++;
  }, 450);
  musicOn = true;
  musicBtn.textContent = '🎵 Naruto Theme (soft): On';
}

function stopMusic() {
  clearInterval(musicTimer);
  musicOn = false;
  musicBtn.textContent = '🎵 Naruto Theme (soft): Off';
}

musicBtn.addEventListener('click', () => {
  if (musicOn) stopMusic();
  else startMusic();
});

window.addEventListener('load', () => {
  try { startMusic(); } catch (e) {}
});
window.addEventListener('click', () => {
  if (!musicOn) {
    try { startMusic(); } catch (e) {}
  }
}, { once: true });

const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let pieces = [];

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener('resize', resize);
resize();

function launchConfetti() {
  pieces = Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.4,
    r: 2 + Math.random() * 4,
    v: 1 + Math.random() * 3,
    c: ['#ff8a00', '#ffb347', '#6ee7ff', '#ff6b81'][Math.floor(Math.random() * 4)],
    a: Math.random() * Math.PI * 2
  }));
  requestAnimationFrame(tick);
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(p => {
    p.y += p.v;
    p.x += Math.sin(p.a += 0.05);
    ctx.fillStyle = p.c;
    ctx.fillRect(p.x, p.y, p.r, p.r * 1.6);
  });
  pieces = pieces.filter(p => p.y < canvas.height + 30);
  if (pieces.length) requestAnimationFrame(tick);
}
