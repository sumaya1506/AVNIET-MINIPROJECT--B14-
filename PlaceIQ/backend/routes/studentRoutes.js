const express  = require('express');
const router   = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload   = require('../middleware/upload');
const {
  getProfile, updateProfile, getApplications,
  getAllStudents, deleteStudent
} = require('../controllers/studentController');

// Student — own profile
router.get('/profile',  protect, authorize('student'), getProfile);
router.put('/profile',  protect, authorize('student'),
  upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'photo', maxCount: 1 }]),
  updateProfile
);
router.get('/applications', protect, authorize('student'), getApplications);

// Admin — manage students
router.get('/',       protect, authorize('admin'), getAllStudents);
router.delete('/:id', protect, authorize('admin'), deleteStudent);

module.exports = router;
