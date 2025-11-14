const { users, notifications } = require('./data');

// Controller function to send notification to all users
const sendNotificationToAll = (req, res) => {
  try {
    // Get notification details from request body
    const { title, message, priority } = req.body;
    
    // Validate input
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }
    
    // Create notification object
    const notification = {
      id: notifications.length + 1,
      title: title,
      message: message,
      priority: priority || "normal", // default to normal if not provided
      sentBy: "Admin User", // In real app, get from logged-in admin
      sentAt: new Date().toISOString(),
      recipients: users.length // total users who will receive this
    };
    
    // Save notification to our mock database
    notifications.push(notification);
    
    // In real app, you would:
    // 1. Save to database
    // 2. Send email/push notifications
    // 3. Create individual notification records for each user
    
    // Send success response
    res.status(201).json({
      success: true,
      message: `Notification sent to ${users.length} users successfully`,
      data: notification
    });
    
  } catch (error) {
    // Handle any errors
    res.status(500).json({
      success: false,
      message: "Error sending notification",
      error: error.message
    });
  }
};

// Controller function to get all sent notifications
const getAllNotifications = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message
    });
  }
};

// Controller function to get notification by ID
const getNotificationById = (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    
    // Find notification in our mock data
    const notification = notifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching notification",
      error: error.message
    });
  }
};

// Export all controller functions
module.exports = {
  sendNotificationToAll,
  getAllNotifications,
  getNotificationById
};