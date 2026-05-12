const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
require('dotenv').config();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static: uploaded files (resumes, logos, photos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Static: serve the entire frontend folder so you can open
//         http://localhost:5000/  in any browser, no extra server needed
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/jobs',          require('./routes/jobRoutes'));
app.use('/api/students',      require('./routes/studentRoutes'));
app.use('/api/recruiters',    require('./routes/recruiterRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));
app.use('/api/interviews',    require('./routes/interviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// ── SPA Fallback: any non-API GET → serve index.html ───────
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ── MongoDB ─────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeiqDB';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected:', MONGO_URI))
  .catch(err => { console.error('❌ MongoDB Error:', err.message); process.exit(1); });

// ── Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 PlaceIQ running → http://localhost:${PORT}`);
  console.log(`📁 Frontend       → http://localhost:${PORT}/`);
  console.log(`🔌 API base       → http://localhost:${PORT}/api`);
});
