const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  name:       { type: String, required: [true,'Name required'], trim: true, minlength: 2 },
  email:      { type: String, required: [true,'Email required'], unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  password:   { type: String, required: [true,'Password required'], minlength: 6, select: false },
  role:       { type: String, default: 'student' },
  phone:      { type: String, trim: true },
  college:    { type: String, trim: true },
  department: { type: String, trim: true },
  year:       { type: String },
  cgpa:       { type: Number, min: 0, max: 10 },
  skills:     [{ type: String, trim: true }],
  resumeUrl:  { type: String },
  profilePhoto: { type: String },
  bio:        { type: String, maxlength: 500 },
  linkedin:   { type: String },
  github:     { type: String },
  appliedJobs:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  selectedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  resetPasswordToken:  String,
  resetPasswordExpire: Date,
  isActive:   { type: Boolean, default: true },
  createdAt:  { type: Date, default: Date.now }
});

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

studentSchema.methods.comparePassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
