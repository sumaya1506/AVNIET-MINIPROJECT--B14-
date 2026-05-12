const crypto    = require('crypto');
const Student   = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Admin     = require('../models/Admin');
const { signToken } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

const modelMap = { student: Student, recruiter: Recruiter, admin: Admin };

// POST /api/auth/register
exports.register = async (req, res) => {
  const { role = 'student', ...body } = req.body;
  const Model = modelMap[role];
  if (!Model) return res.status(400).json({ success: false, message: 'Invalid role' });

  try {
    const user  = await Model.create(body);
    const token = signToken(user._id, role);
    res.status(201).json({
      success: true, token, role,
      user: { id: user._id, name: user.name, email: user.email, role }
    });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Email already registered' });
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password, role = 'student' } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required' });

  const Model = modelMap[role];
  if (!Model) return res.status(400).json({ success: false, message: 'Invalid role' });

  try {
    const user = await Model.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token    = signToken(user._id, role);
    const userData = user.toObject();
    delete userData.password;

    res.json({ success: true, token, role, user: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email, role = 'student' } = req.body;
  const Model = modelMap[role];
  if (!Model) return res.status(400).json({ success: false, message: 'Invalid role' });

  try {
    const user = await Model.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(404).json({ success: false, message: 'No account found with that email' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken  = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password.html?token=${rawToken}&role=${role}`;

    await sendEmail({
      to:      email,
      subject: 'Password Reset — PlaceIQ',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px;">
          <h2 style="color:#1e3a5f;">🔐 Password Reset Request</h2>
          <p>Hi <b>${user.name}</b>,</p>
          <p>Click below to reset your password. This link expires in <b>15 minutes</b>.</p>
          <a href="${resetUrl}" style="display:inline-block;margin:20px 0;padding:13px 28px;background:linear-gradient(135deg,#00c8ff,#7b5ea7);color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
          <p style="font-size:12px;color:#999;">If you didn't request this, ignore this email.</p>
        </div>`
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  const { token, password, role = 'student' } = req.body;
  if (!token || !password)
    return res.status(400).json({ success: false, message: 'Token and new password required' });

  const Model      = modelMap[role];
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const user = await Model.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user)
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });

    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const authToken = signToken(user._id, role);
    res.json({ success: true, token: authToken, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
