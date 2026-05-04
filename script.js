// =============================================
//   LUMINA E-LEARNING — script.js
//   All API calls go to /api/* on the same server
// =============================================

// ── CONFIG ──────────────────────────────────────────────────────
// Change this if running backend on a different port during dev
const API_BASE = '';   // '' = same origin; set to 'http://localhost:3000' if needed

// ── STATE ───────────────────────────────────────────────────────
let activeFilter = 'all';
let allCourses   = [];

// ── DOM READY ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavScroll();
  initScrollReveal();
  animateStats();
  animateHeroProgress();
  loadCourses();
});

// ── NAVBAR SCROLL SHADOW ────────────────────────────────────────
function initNavScroll() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ── SCROLL REVEAL ───────────────────────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ── COUNTER ANIMATION ───────────────────────────────────────────
function animateStats() {
  const nums = document.querySelectorAll('.stat-num');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el    = e.target;
      const target = +el.dataset.count;
      const dur   = 1800;
      const step  = 16;
      const inc   = target / (dur / step);
      let cur = 0;
      const timer = setInterval(() => {
        cur += inc;
        if (cur >= target) { cur = target; clearInterval(timer); }
        el.textContent = target >= 1000
          ? Math.floor(cur).toLocaleString('en-IN')
          : Math.floor(cur);
      }, step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => obs.observe(n));
}

// ── HERO PROGRESS BAR ───────────────────────────────────────────
function animateHeroProgress() {
  setTimeout(() => {
    const bar = document.getElementById('heroProgress');
    if (bar) bar.style.width = '44%';
  }, 800);
}

// ── FETCH COURSES FROM API ──────────────────────────────────────
async function loadCourses(category = 'all') {
  const grid    = document.getElementById('coursesGrid');
  const loading = document.getElementById('coursesLoading');
  const errBox  = document.getElementById('coursesError');

  grid.style.display    = 'none';
  errBox.style.display  = 'none';
  loading.style.display = 'flex';

  try {
    const url = category === 'all'
      ? `${API_BASE}/api/courses`
      : `${API_BASE}/api/courses?category=${category}`;

    const res  = await fetch(url);
    const data = await res.json();

    if (!data.success) throw new Error(data.message || 'Server error');

    allCourses = data.courses;
    renderCourses(data.courses);

    loading.style.display = 'none';
    grid.style.display    = 'grid';
  } catch (err) {
    console.error('loadCourses error:', err);
    loading.style.display = 'none';
    errBox.style.display  = 'flex';
  }
}

// ── RENDER COURSE CARDS ─────────────────────────────────────────
function renderCourses(courses) {
  const grid = document.getElementById('coursesGrid');

  if (courses.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--muted);">
        <div style="font-size:2.5rem;margin-bottom:1rem;">🔍</div>
        <p>No courses found. Try a different filter.</p>
      </div>`;
    return;
  }

  grid.innerHTML = courses.map(c => `
    <div class="course-card" onclick="showToast('Opening: ${c.title}')">
      <div class="course-thumb" style="background:${c.color};">
        <span>${c.emoji}</span>
        <div class="course-badge" style="background:${c.badgeBg};color:${c.badgeColor};">
          ${c.badge}
        </div>
      </div>
      <div class="course-body">
        <div class="course-meta">
          <span class="course-level">📶 ${c.level}</span>
          <span class="course-dur-tag">⏱ ${c.duration}</span>
        </div>
        <div class="course-name">${c.title}</div>
        <div class="course-instructor">by ${c.instructor}</div>
        <div class="course-footer">
          <div class="course-rating">
            <span class="stars">★</span> ${c.rating}
            <span style="color:var(--muted);font-weight:400;font-size:.78rem;">(${c.reviews.toLocaleString('en-IN')})</span>
          </div>
          <div class="course-price ${c.price === 'Free' ? 'free' : ''}">${c.price}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// ── FILTER TABS ─────────────────────────────────────────────────
function setFilter(btn, category) {
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = category;
  loadCourses(category);
  document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
}

// ── CATEGORY CARDS (from categories section) ────────────────────
function filterCourses(category) {
  activeFilter = category;
  // Update tab UI
  document.querySelectorAll('.filter-tab').forEach(b => {
    b.classList.toggle('active', b.textContent.toLowerCase().trim() === category ||
      (category === 'all' && b.textContent.trim() === 'All'));
  });
  loadCourses(category);
  document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
}

// ── SEARCH ──────────────────────────────────────────────────────
async function handleSearch() {
  const query = document.getElementById('heroSearch').value.trim();
  if (!query) return;

  const grid    = document.getElementById('coursesGrid');
  const loading = document.getElementById('coursesLoading');
  const errBox  = document.getElementById('coursesError');

  grid.style.display    = 'none';
  errBox.style.display  = 'none';
  loading.style.display = 'flex';

  try {
    const url = `${API_BASE}/api/courses?search=${encodeURIComponent(query)}`;
    const res  = await fetch(url);
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    renderCourses(data.courses);
    loading.style.display = 'none';
    grid.style.display    = 'grid';

    // Reset filter tabs
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    document.querySelector('.filter-tab').classList.add('active');

    document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    console.error('Search error:', err);
    loading.style.display = 'none';
    errBox.style.display  = 'flex';
  }
}

// ── SIGN-UP MODAL ───────────────────────────────────────────────
function openModal()  { document.getElementById('modalOverlay').classList.add('open'); }
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }
function closeModalOutside(e) { if (e.target.id === 'modalOverlay') closeModal(); }

async function handleSignup() {
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const goal  = document.getElementById('regGoal').value;

  if (!name || !email) {
    showToast('Please fill in your name and email.', 'error');
    return;
  }
  if (!email.includes('@')) {
    showToast('Please enter a valid email.', 'error');
    return;
  }

  // Disable button during request
  const btn = document.querySelector('.modal .btn-primary');
  btn.textContent = 'Creating account…';
  btn.disabled = true;

  try {
    const res  = await fetch(`${API_BASE}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, goal })
    });
    const data = await res.json();

    if (data.success) {
      closeModal();
      showToast(data.message);
      // Clear form
      document.getElementById('regName').value  = '';
      document.getElementById('regEmail').value = '';
      document.getElementById('regGoal').value  = '';
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Server not reachable. Please try again.', 'error');
  } finally {
    btn.textContent = 'Create My Account →';
    btn.disabled    = false;
  }
}

// ── TOAST NOTIFICATION ───────────────────────────────────────────
function showToast(msg, type = 'success') {
  const toast   = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const icon    = type === 'error' ? '❌' : '✅';

  toast.firstChild.textContent = icon + ' ';
  toastMsg.textContent = msg;
  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), 3500);
}
