const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  scheduleInterview, getMyInterviews,
  getRecruiterInterviews, updateInterview, cancelInterview
} = require('../controllers/interviewController');

router.post('/',         protect, authorize('recruiter'), scheduleInterview);
router.get('/my',        protect, authorize('student'),   getMyInterviews);
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterInterviews);
router.put('/:id',       protect, authorize('recruiter'), updateInterview);
router.delete('/:id',    protect, authorize('recruiter'), cancelInterview);

module.exports = router;
