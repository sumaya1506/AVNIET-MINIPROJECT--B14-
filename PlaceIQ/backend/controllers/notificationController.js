const Notification = require('../models/Notification');

const roleModelMap = { student: 'Student', recruiter: 'Recruiter', admin: 'Admin' };

// Internal helper used by other controllers
const createNotification = async ({ recipientId, recipientModel, type, title, message, link, meta }) => {
  try {
    await Notification.create({ recipient: recipientId, recipientModel, type, title, message, link, meta });
  } catch (e) {
    console.error('Notification error:', e.message);
  }
};

// GET /api/notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const model = roleModelMap[req.user.role] || 'Student';
    const notifications = await Notification.find({ recipient: req.user.id, recipientModel: model })
      .sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id, recipientModel: model, isRead: false
    });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    const model = roleModelMap[req.user.role] || 'Student';
    await Notification.updateMany(
      { recipient: req.user.id, recipientModel: model, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/notifications/:id/read
exports.markOneRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/notifications/clear
exports.clearAll = async (req, res) => {
  try {
    const model = roleModelMap[req.user.role] || 'Student';
    await Notification.deleteMany({ recipient: req.user.id, recipientModel: model });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createNotification = createNotification;
