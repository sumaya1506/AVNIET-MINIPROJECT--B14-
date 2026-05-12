const Job     = require('../models/Job');
const Student = require('../models/Student');
const sendEmail = require('../utils/sendEmail');

// GET /api/jobs  (public — paginated + filtered)
exports.getJobs = async (req, res) => {
  try {
    const { search, type, location, skills, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (search) query.$or = [
      { title:        { $regex: search, $options: 'i' } },
      { 'company.name': { $regex: search, $options: 'i' } }
    ];
    if (type)     query.type     = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (skills)   query.skillsRequired = { $in: skills.split(',').map(s => new RegExp(s.trim(), 'i')) };

    const jobs  = await Job.find(query)
      .populate('recruiter', 'name email company')
      .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Job.countDocuments(query);
    res.json({ success: true, count: jobs.length, total, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/jobs/recommend  (student — AI skill match)
exports.recommendJobs = async (req, res) => {
  try {
    const student = req.user.data;
    const jobs    = await Job.find({ isActive: true });
    const scored  = jobs
      .map(job => ({ job, score: job.matchScore(student.skills || []) }))
      .filter(j => j.score > 0)
      .sort((a, b) => b.score - a.score);
    res.json({
      success: true,
      recommendations: scored.map(s => ({ ...s.job.toObject(), matchScore: s.score }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/jobs/:id
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name email company');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/jobs  (recruiter only)
exports.postJob = async (req, res) => {
  try {
    const recruiter = req.user.data;
    const job = await Job.create({
      ...req.body,
      recruiter: req.user.id,
      company: {
        name:    recruiter.company.name,
        logo:    recruiter.company.logo    || '',
        website: recruiter.company.website || ''
      }
    });
    res.status(201).json({ success: true, job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/jobs/:id  (recruiter — owns job)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, recruiter: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/jobs/:id  (recruiter — owns job)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, recruiter: req.user.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/jobs/:id/apply  (student only)
exports.applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job)           return res.status(404).json({ success: false, message: 'Job not found' });
    if (!job.isActive)  return res.status(400).json({ success: false, message: 'Job is no longer active' });
    if (job.deadline && new Date(job.deadline) < new Date())
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });

    const already = job.applicants.some(a => a.student.toString() === req.user.id);
    if (already)  return res.status(400).json({ success: false, message: 'Already applied to this job' });

    job.applicants.push({ student: req.user.id });
    await job.save();
    await Student.findByIdAndUpdate(req.user.id, { $addToSet: { appliedJobs: job._id } });

    const student = req.user.data;
    await sendEmail({
      to:      student.email,
      subject: `Application Received — ${job.title}`,
      html:    `<div style="font-family:Arial;padding:20px;"><h3>Hi ${student.name},</h3><p>Your application for <b>${job.title}</b> at <b>${job.company.name}</b> was received! We'll update you on the status.</p></div>`
    });

    res.json({ success: true, message: 'Applied successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/jobs/:id/applicants  (recruiter — owns job)
exports.getApplicants = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.user.id })
      .populate('applicants.student', 'name email skills cgpa college department phone resumeUrl profilePhoto bio linkedin github year');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, applicants: job.applicants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/jobs/:id/applicants/:studentId  (recruiter — update status)
exports.updateApplicantStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.user.id })
      .populate('applicants.student', 'name email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const applicant = job.applicants.find(a => a.student._id.toString() === req.params.studentId);
    if (!applicant) return res.status(404).json({ success: false, message: 'Applicant not found' });

    applicant.status = status;
    if (note) applicant.note = note;
    await job.save();

    if (status === 'selected')
      await Student.findByIdAndUpdate(req.params.studentId, { $addToSet: { selectedJobs: job._id } });

    const statusMessages = {
      shortlisted: 'Congratulations! You have been shortlisted.',
      interview:   'You have been selected for an interview round!',
      selected:    '🎉 Congratulations! You have been SELECTED!',
      rejected:    'Thank you for applying. Unfortunately you were not selected this time.'
    };
    if (statusMessages[status]) {
      await sendEmail({
        to:      applicant.student.email,
        subject: `Application Update — ${job.title}`,
        html:    `<div style="font-family:Arial;padding:20px;"><h3>Hi ${applicant.student.name},</h3><p>${statusMessages[status]}</p><p>Role: <b>${job.title}</b> at <b>${job.company.name}</b></p>${note ? `<p>Note: ${note}</p>` : ''}</div>`
      });
    }

    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
