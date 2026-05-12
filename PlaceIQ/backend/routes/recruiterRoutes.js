const express   = require('express');
const router    = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload    = require('../middleware/upload');
const Recruiter = require('../models/Recruiter');
const Job       = require('../models/Job');

// GET /api/recruiters/profile
router.get('/profile', protect, authorize('recruiter'), async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.user.id);
    res.json({ success: true, recruiter });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/recruiters/profile  (company fields arrive as company[field] or company.field)
router.put('/profile', protect, authorize('recruiter'), upload.single('logo'), async (req, res) => {
  try {
    const updates       = {};
    const companyFields = {};

    Object.keys(req.body).forEach(key => {
      const m = key.match(/^company\[(.+)\]$/) || key.match(/^company\.(.+)$/);
      if (m) companyFields[m[1]] = req.body[key];
      else   updates[key]        = req.body[key];
    });

    Object.keys(companyFields).forEach(f => { updates[`company.${f}`] = companyFields[f]; });
    if (req.file) updates['company.logo'] = `/uploads/logos/${req.file.filename}`;

    const recruiter = await Recruiter.findByIdAndUpdate(
      req.user.id, { $set: updates }, { new: true, runValidators: false }
    );
    res.json({ success: true, recruiter });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/recruiters/jobs
router.get('/jobs', protect, authorize('recruiter'), async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/recruiters  (admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const recruiters = await Recruiter.find().sort({ createdAt: -1 });
    res.json({ success: true, recruiters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
