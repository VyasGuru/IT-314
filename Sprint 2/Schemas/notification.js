const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notification_id: { type: String, unique: true, required: true },
  user_firebase_uid: { type: String, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  notification_type: { type: String, enum: ['system', 'listing_update', 'message', 'verification'], required: true },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
