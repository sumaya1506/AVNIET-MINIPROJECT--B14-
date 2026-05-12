const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  job:       { type: mongoose.Schema.Types.ObjectId, ref: 'Job',       required: true },
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'Student',   required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
  scheduledAt: { type: Date, required: true },
  duration:    { type: Number, default: 60 },   // minutes
  mode:        { type: String, enum: ['Online','In-person','Phone'], default: 'Online' },
  meetingLink: String,
  venue:       String,
  round:       { type: String, default: 'Round 1' },
  notes:       String,
  status: {
    type: String,
    enum: ['scheduled','completed','cancelled','rescheduled'],
    default: 'scheduled'
  },
  feedback: String,
  result:   { type: String, enum: ['pending','pass','fail'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interview', interviewSchema);
