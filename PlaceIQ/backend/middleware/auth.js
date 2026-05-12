const jwt     = require('jsonwebtoken');
const Student  = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Admin    = require('../models/Admin');

const modelMap = { student: Student, recruiter: Recruiter, admin: Admin };

// Sign a JWT token
const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });

// Protect middleware — verifies token and attaches req.user
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'Not authorised, no token' });

    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Model   = modelMap[decoded.role];
    if (!Model)
      return res.status(401).json({ success: false, message: 'Invalid role in token' });

    const user = await Model.findById(decoded.id).select('-password');
    if (!user)
      return res.status(401).json({ success: false, message: 'User no longer exists' });

    req.user      = { id: decoded.id, role: decoded.role, data: user };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Authorize middleware — restricts to specific roles
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({
      success: false,
      message: `Role '${req.user.role}' is not allowed to access this route`
    });
  next();
};

module.exports = { signToken, protect, authorize };
