const Student = require('../models/Student');
const Job     = require('../models/Job');

// GET /api/students/profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).populate('appliedJobs selectedJobs');
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/students/profile  (multipart form — handled by upload middleware in route)
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name','phone','college','department','year','cgpa','bio','linkedin','github'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    // Skills can arrive as skills[] array or comma-separated string
    if (req.body['skills[]']) {
      const raw = req.body['skills[]'];
      updates.skills = Array.isArray(raw) ? raw : [raw];
    } else if (req.body.skills) {
      updates.skills = Array.isArray(req.body.skills)
        ? req.body.skills
        : req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (req.files) {
      if (req.files.resume) updates.resumeUrl    = `/uploads/resumes/${req.files.resume[0].filename}`;
      if (req.files.photo)  updates.profilePhoto = `/uploads/photos/${req.files.photo[0].filename}`;
    }

    if (updates.cgpa !== undefined) updates.cgpa = parseFloat(updates.cgpa);

    const student = await Student.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/students/applications
exports.getApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ 'applicants.student': req.user.id });
    const applications = jobs.map(job => {
      const app = job.applicants.find(a => a.student.toString() === req.user.id);
      return {
        job: { _id: job._id, title: job.title, company: job.company, type: job.type, location: job.location },
        status: app.status, appliedAt: app.appliedAt, note: app.note
      };
    });
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/students  (admin only — with search/filter/pagination)
exports.getAllStudents = async (req, res) => {
  try {
    const { search, college, department, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search)     query.$or = [{ name: { $regex: search, $options:'i' } }, { email: { $regex: search, $options:'i' } }];
    if (college)    query.college    = { $regex: college,    $options: 'i' };
    if (department) query.department = { $regex: department, $options: 'i' };

    const students = await Student.find(query)
      .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Student.countDocuments(query);
    res.json({ success: true, count: students.length, total, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/students/:id  (admin only)
exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
