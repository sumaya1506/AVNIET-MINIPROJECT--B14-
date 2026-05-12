const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getJobs, getJob, postJob, updateJob, deleteJob,
  applyJob, getApplicants, updateApplicantStatus, recommendJobs
} = require('../controllers/jobController');

// Public
router.get('/', getJobs);

// IMPORTANT: /recommend MUST be registered before /:id or Express matches "recommend" as an id
router.get('/recommend', protect, authorize('student'), recommendJobs);

router.get('/:id', getJob);

// Recruiter
router.post('/',    protect, authorize('recruiter'), postJob);
router.put('/:id',  protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

// Student apply
router.post('/:id/apply', protect, authorize('student'), applyJob);

// Recruiter — view & update applicants
router.get('/:id/applicants',                    protect, authorize('recruiter'), getApplicants);
router.put('/:id/applicants/:studentId',         protect, authorize('recruiter'), updateApplicantStatus);

module.exports = router;
