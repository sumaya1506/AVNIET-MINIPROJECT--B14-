const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    enum: ['Student','Recruiter','Admin'],
    required: true
  },
  type: {
    type: String,
    enum: ['application_received','status_update','new_job','shortlisted',
           'selected','rejected','interview_scheduled','system'],
    required: true
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  link:    String,
  isRead:  { type: Boolean, default: false },
  meta:    { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
