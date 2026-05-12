const Interview  = require('../models/Interview');
const Job        = require('../models/Job');
const Student    = require('../models/Student');
const sendEmail  = require('../utils/sendEmail');
const { createNotification } = require('./notificationController');

// POST /api/interviews  (recruiter)
exports.scheduleInterview = async (req, res) => {
  try {
    const { jobId, studentId, scheduledAt, duration, mode, meetingLink, venue, round, notes } = req.body;

    const job = await Job.findOne({ _id: jobId, recruiter: req.user.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const existing = await Interview.findOne({ job: jobId, student: studentId, status: 'scheduled' });
    if (existing) return res.status(400).json({ success: false, message: 'Interview already scheduled for this candidate' });

    const interview = await Interview.create({
      job: jobId, student: studentId, recruiter: req.user.id,
      scheduledAt, duration, mode, meetingLink, venue,
      round: round || 'Round 1', notes
    });

    const applicant = job.applicants.find(a => a.student.toString() === studentId);
    if (applicant) { applicant.status = 'interview'; await job.save(); }

    const dt = new Date(scheduledAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });
    await sendEmail({
      to:      student.email,
      subject: `Interview Scheduled — ${job.title} at ${job.company.name}`,
      html: `<div style="font-family:Arial;padding:24px;background:#f9f9f9;border-radius:10px;">
        <h2>🎤 Interview Scheduled</h2>
        <p>Hi <b>${student.name}</b>, your interview for <b>${job.title}</b> at <b>${job.company.name}</b> is confirmed.</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0;">
          <tr><td style="padding:8px;color:#666;">Date &amp; Time</td><td style="padding:8px;font-weight:bold;">${dt}</td></tr>
          <tr><td style="padding:8px;color:#666;">Duration</td><td style="padding:8px;">${duration || 60} min</td></tr>
          <tr><td style="padding:8px;color:#666;">Mode</td><td style="padding:8px;">${mode}</td></tr>
          ${meetingLink ? `<tr><td style="padding:8px;color:#666;">Link</td><td style="padding:8px;"><a href="${meetingLink}">${meetingLink}</a></td></tr>` : ''}
          ${venue ? `<tr><td style="padding:8px;color:#666;">Venue</td><td style="padding:8px;">${venue}</td></tr>` : ''}
        </table>
        <p>Best of luck! 🍀</p></div>`
    });

    await createNotification({
      recipientId: studentId, recipientModel: 'Student',
      type: 'interview_scheduled',
      title: `Interview Scheduled — ${job.title}`,
      message: `Your interview at ${job.company.name} is on ${dt} (${mode})`,
      link: '/Student.html',
      meta: { jobId, interviewId: interview._id }
    });

    res.status(201).json({ success: true, interview });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/interviews/my  (student)
exports.getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ student: req.user.id })
      .populate('job',       'title company type location')
      .populate('recruiter', 'name company')
      .sort({ scheduledAt: 1 });
    res.json({ success: true, interviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/interviews/recruiter  (recruiter)
exports.getRecruiterInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ recruiter: req.user.id })
      .populate('job',     'title company')
      .populate('student', 'name email phone college cgpa')
      .sort({ scheduledAt: 1 });
    res.json({ success: true, interviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/interviews/:id  (recruiter)
exports.updateInterview = async (req, res) => {
  try {
    const { status, result, feedback } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, recruiter: req.user.id })
      .populate('student', 'name email')
      .populate('job',     'title company');
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    if (status)   interview.status   = status;
    if (result)   interview.result   = result;
    if (feedback) interview.feedback = feedback;
    await interview.save();

    if (result === 'fail') {
      await sendEmail({
        to:      interview.student.email,
        subject: `Interview Update — ${interview.job.title}`,
        html:    `<p>Hi ${interview.student.name}, thank you for attending the interview for <b>${interview.job.title}</b>. We appreciate your time and will keep your profile for future opportunities.</p>`
      });
    }

    res.json({ success: true, interview });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/interviews/:id  (recruiter — cancel)
exports.cancelInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, recruiter: req.user.id })
      .populate('student', 'name email')
      .populate('job',     'title');
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    interview.status = 'cancelled';
    await interview.save();

    await sendEmail({
      to:      interview.student.email,
      subject: `Interview Cancelled — ${interview.job.title}`,
      html:    `<p>Hi ${interview.student.name}, your scheduled interview for <b>${interview.job.title}</b> has been cancelled. Watch for a rescheduling notice.</p>`
    });

    res.json({ success: true, message: 'Interview cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
