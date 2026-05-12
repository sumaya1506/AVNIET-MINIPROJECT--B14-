const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAnalytics, getSelectedStudents, deleteAnyJob, toggleStudent } = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/analytics',            getAnalytics);
router.get('/selected-students',    getSelectedStudents);
router.delete('/jobs/:id',          deleteAnyJob);
router.put('/students/:id/toggle',  toggleStudent);

module.exports = router;
