const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMyNotifications, markAllRead, markOneRead, clearAll
} = require('../controllers/notificationController');

router.get('/',               protect, getMyNotifications);
router.put('/read-all',       protect, markAllRead);
router.put('/:id/read',       protect, markOneRead);
router.delete('/clear',       protect, clearAll);

module.exports = router;
