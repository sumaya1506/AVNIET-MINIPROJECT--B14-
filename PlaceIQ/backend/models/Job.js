const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  appliedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['applied','shortlisted','interview','selected','rejected'],
    default: 'applied'
  },
  note: String
});

const jobSchema = new mongoose.Schema({
  title:       { type: String, required: [true,'Title required'], trim: true },
  description: { type: String, required: [true,'Description required'] },
  skillsRequired: [{ type: String, trim: true }],
  recruiter:   { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
  company: {
    name:    { type: String, required: true },
    logo:    String,
    website: String
  },
  location: { type: String, default: 'Any' },
  type: {
    type: String,
    enum: ['Full-time','Part-time','Internship','Contract','Remote'],
    default: 'Full-time'
  },
  salary: {
    min:      Number,
    max:      Number,
    currency: { type: String, default: 'INR' }
  },
  minCGPA:    { type: Number, default: 0 },
  deadline:   Date,
  openings:   { type: Number, default: 1 },
  applicants: [applicationSchema],
  isActive:   { type: Boolean, default: true },
  tags:       [String],
  createdAt:  { type: Date, default: Date.now }
});

// Keyword-based skill match score (0-100)
jobSchema.methods.matchScore = function (studentSkills = []) {
  if (!studentSkills.length || !this.skillsRequired.length) return 0;
  const matched = studentSkills.filter(skill =>
    this.skillsRequired.some(req =>
      req.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(req.toLowerCase())
    )
  );
  return Math.round((matched.length / this.skillsRequired.length) * 100);
};

module.exports = mongoose.model('Job', jobSchema);
