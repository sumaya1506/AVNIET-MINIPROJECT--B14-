const Student   = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Job       = require('../models/Job');

// GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const [totalStudents, totalRecruiters, totalJobs, activeJobs] = await Promise.all([
      Student.countDocuments(),
      Recruiter.countDocuments(),
      Job.countDocuments(),
      Job.countDocuments({ isActive: true })
    ]);

    const jobs = await Job.find().populate('applicants.student', 'name email college department');
    let totalApplications = 0, totalSelected = 0;
    const departmentMap = {}, companyMap = {};

    jobs.forEach(job => {
      totalApplications += job.applicants.length;
      job.applicants.forEach(app => {
        if (app.status === 'selected') totalSelected++;
        const dept = app.student?.department || 'Unknown';
        departmentMap[dept] = (departmentMap[dept] || 0) + 1;
      });
      const co = job.company.name;
      companyMap[co] = (companyMap[co] || 0) +
        job.applicants.filter(a => a.status === 'selected').length;
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStudents = await Student.aggregate([
      { $match:  { createdAt: { $gte: sixMonthsAgo } } },
      { $group:  { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort:   { '_id.year': 1, '_id.month': 1 } }
    ]);

    const topCompanies = Object.entries(companyMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, selected]) => ({ name, selected }));

    const byDepartment = Object.entries(departmentMap)
      .map(([dept, count]) => ({ dept, count }));

    res.json({
      success: true,
      stats: {
        totalStudents, totalRecruiters, totalJobs, activeJobs,
        totalApplications, totalSelected,
        placementRate: totalApplications
          ? Math.round((totalSelected / totalApplications) * 100) : 0
      },
      monthlyStudents, topCompanies, byDepartment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/selected-students
exports.getSelectedStudents = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('applicants.student', 'name email college department cgpa');
    const selected = [];
    jobs.forEach(job => {
      job.applicants
        .filter(a => a.status === 'selected')
        .forEach(app => selected.push({
          student:    app.student,
          company:    job.company.name,
          role:       job.title,
          selectedAt: app.appliedAt
        }));
    });
    res.json({ success: true, selected });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/jobs/:id
exports.deleteAnyJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/students/:id/toggle
exports.toggleStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    student.isActive = !student.isActive;
    await student.save();
    res.json({ success: true, message: `Student ${student.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
