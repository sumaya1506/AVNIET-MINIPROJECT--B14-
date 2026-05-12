const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const recruiterSchema = new mongoose.Schema({
  name:  { type: String, required: [true,'Name required'], trim: true },
  email: { type: String, required: [true,'Email required'], unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  password: { type: String, required: [true,'Password required'], minlength: 6, select: false },
  role:     { type: String, default: 'recruiter' },
  phone:    String,
  designation: String,
  company: {
    name:        { type: String, required: [true,'Company name required'] },
    website:     String,
    logo:        String,
    description: String,
    industry:    String,
    size:        String,
    location:    String
  },
  postedJobs:          [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  resetPasswordToken:  String,
  resetPasswordExpire: Date,
  isActive:  { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

recruiterSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

recruiterSchema.methods.comparePassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Recruiter', recruiterSchema);
