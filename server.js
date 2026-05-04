// =============================================
//   LUMINA E-LEARNING — server.js (Node/Express)
// =============================================

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// ── IN-MEMORY DATA ──────────────────────────────────────────────
const courses = [
  {
    id: 1, category: 'design',
    title: 'UI/UX Masterclass', instructor: 'Riya Desai',
    level: 'Beginner', duration: '14h 30m', rating: 4.9, reviews: 1240,
    price: 'Free', emoji: '📐',
    color: '#e8f8f4', badge: 'Bestseller', badgeBg: '#0d9488', badgeColor: '#fff'
  },
  {
    id: 2, category: 'web',
    title: 'Full-Stack Web Development', instructor: 'Karan Shah',
    level: 'Intermediate', duration: '28h 10m', rating: 4.8, reviews: 980,
    price: '₹1,499', emoji: '💻',
    color: '#eef2ff', badge: 'New', badgeBg: '#7c3aed', badgeColor: '#fff'
  },
  {
    id: 3, category: 'data',
    title: 'Data Science with Python', instructor: 'Ananya Iyer',
    level: 'Intermediate', duration: '22h 45m', rating: 4.7, reviews: 870,
    price: '₹1,299', emoji: '📊',
    color: '#fff7ed', badge: 'Popular', badgeBg: '#e85d4a', badgeColor: '#fff'
  },
  {
    id: 4, category: 'business',
    title: 'Product Management 101', instructor: 'Mihir Joshi',
    level: 'Beginner', duration: '10h 20m', rating: 4.6, reviews: 540,
    price: 'Free', emoji: '📈',
    color: '#fefce8', badge: 'Free', badgeBg: '#e8a020', badgeColor: '#fff'
  },
  {
    id: 5, category: 'ai',
    title: 'Machine Learning Foundations', instructor: 'Deepa Nair',
    level: 'Advanced', duration: '30h 00m', rating: 4.9, reviews: 1560,
    price: '₹1,999', emoji: '🤖',
    color: '#f5f3ff', badge: 'Trending', badgeBg: '#7c3aed', badgeColor: '#fff'
  },
  {
    id: 6, category: 'design',
    title: 'Brand Identity Design', instructor: 'Priya Bose',
    level: 'Intermediate', duration: '12h 15m', rating: 4.8, reviews: 720,
    price: '₹999', emoji: '🎨',
    color: '#fff1f2', badge: 'Hot', badgeBg: '#e85d4a', badgeColor: '#fff'
  },
];

// In-memory signups list
const signups = [];

// ── API ROUTES ───────────────────────────────────────────────────

// GET all courses (optionally filter by category)
app.get('/api/courses', (req, res) => {
  const { category, search } = req.query;
  let result = [...courses];

  if (category && category !== 'all') {
    result = result.filter(c => c.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }
  res.json({ success: true, courses: result });
});

// GET single course by ID
app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
  res.json({ success: true, course });
});

// POST signup
app.post('/api/signup', (req, res) => {
  const { name, email, goal } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required.' });
  }

  // Simple duplicate check
  const exists = signups.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ success: false, message: 'This email is already registered.' });
  }

  const newUser = { id: signups.length + 1, name, email, goal: goal || 'General', createdAt: new Date() };
  signups.push(newUser);

  console.log(`✅ New signup: ${name} <${email}> → ${goal}`);
  res.json({ success: true, message: `Welcome, ${name}! Your account is ready.` });
});

// POST search (can also use GET /api/courses?search=...)
app.post('/api/search', (req, res) => {
  const { query } = req.body;
  if (!query) return res.json({ success: true, courses: [] });

  const q = query.toLowerCase();
  const result = courses.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.instructor.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q)
  );
  res.json({ success: true, courses: result });
});

// GET stats
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      students: 12000,
      courses: courses.length,
      satisfaction: 98,
      instructors: 500
    }
  });
});

// Catch-all: serve frontend for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── START SERVER ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Lumina server running → http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/courses\n`);
});
