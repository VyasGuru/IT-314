const express = require('express');
const router = express.Router();

// Import controller functions
const {
  sendNotificationToAll,
  getAllNotifications,
  getNotificationById
} = require('./notification_Controller');

//  No admin middleware — routes open for admin use directly

// POST /api/admin/notifications - Send notification to all users
router.post('/notifications', sendNotificationToAll);

// GET /api/admin/notifications - Get all sent notifications
router.get('/notifications', getAllNotifications);

// GET /api/admin/notifications/:id - Get specific notification
router.get('/notifications/:id', getNotificationById);

// Export router
module.exports = router;
