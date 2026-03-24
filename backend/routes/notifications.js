const express = require('express');
const { body, query, validationResult } = require('express-validator');
const router = express.Router();

// Get user notifications
router.get('/', [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('type').optional().isIn(['claim', 'payment', 'appointment', 'system', 'medical_record']),
  query('status').optional().isIn(['pending', 'sent', 'delivered', 'failed', 'read'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const type = req.query.type;
    const status = req.query.status;

    let notifications;
    if (req.notificationService) {
      notifications = await req.notificationService.getUserNotifications(userId, limit, offset);
      
      // Filter by type and status if provided
      if (type) {
        notifications = notifications.filter(n => n.type === type);
      }
      if (status) {
        notifications = notifications.filter(n => n.status === status);
      }
    } else {
      return res.status(503).json({ error: 'Notification service not available' });
    }

    res.json({
      success: true,
      notifications,
      pagination: {
        limit,
        offset,
        total: notifications.length
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get notification statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.notificationService) {
      return res.status(503).json({ error: 'Notification service not available' });
    }

    const stats = await req.notificationService.getNotificationStats(userId);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification statistics' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { notificationId } = req.params;
    const userId = req.user.id;

    if (!req.notificationService) {
      return res.status(503).json({ error: 'Notification service not available' });
    }

    const result = await req.notificationService.markNotificationAsRead(notificationId, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark multiple notifications as read
router.patch('/mark-all-read', async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.notificationService) {
      return res.status(503).json({ error: 'Notification service not available' });
    }

    // Get all unread notifications for the user
    const notifications = await req.notificationService.getUserNotifications(userId, 1000, 0);
    const unreadNotifications = notifications.filter(n => n.status !== 'read');

    // Mark each as read
    const updatePromises = unreadNotifications.map(notification =>
      req.notificationService.markNotificationAsRead(notification.notification_id, userId)
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `Marked ${unreadNotifications.length} notifications as read`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Get user notification preferences
router.get('/preferences', async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.notificationService) {
      return res.status(503).json({ error: 'Notification service not available' });
    }

    const preferences = await req.notificationService.preferenceService.getUserPreferences(userId);

    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// Update user notification preferences
router.put('/preferences', [
  body('preferences').isObject().withMessage('Preferences must be an object'),
  body('preferences.*.email_enabled').optional().isBoolean(),
  body('preferences.*.sms_enabled').optional().isBoolean(),
  body('preferences.*.push_enabled').optional().isBoolean(),
  body('preferences.*.in_app_enabled').optional().isBoolean(),
  body('preferences.*.frequency').optional().isIn(['immediate', 'daily', 'weekly', 'never']),
  body('preferences.*.quiet_hours_start').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('preferences.*.quiet_hours_end').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { preferences } = req.body;

    if (!req.notificationService) {
      return res.status(503).json({ error: 'Notification service not available' });
    }

    const results = await req.notificationService.preferenceService.updateUserPreferences(userId, preferences);

    res.json({
      success: true,
      message: 'Notification preferences updated',
      results
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Register device token for push notifications
router.post('/register-device', [
  body('deviceToken').notEmpty().withMessage('Device token is required'),
  body('deviceType').optional().isIn(['ios', 'android', 'web']),
  body('deviceName').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { deviceToken, deviceType = 'web', deviceName } = req.body;

    if (!req.notificationService) {
      return res.status(503).json({ error: 'Notification service not available' });
    }

    const result = await req.notificationService.preferenceService.addDeviceToken(
      userId,
      deviceToken,
      deviceType,
      deviceName
    );

    res.json({
      success: true,
      message: 'Device registered successfully',
      result
    });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

// Remove device token
router.delete('/unregister-device', [
  body('deviceToken').notEmpty().withMessage('Device token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { deviceToken } = req.body;

    if (!req.notificationService) {
      return res.status(503).json({ error: 'Notification service not available' });
    }

    const result = await req.notificationService.preferenceService.removeDeviceToken(userId, deviceToken);

    res.json({
      success: true,
      message: 'Device unregistered successfully',
      result
    });
  } catch (error) {
    console.error('Error unregistering device:', error);
    res.status(500).json({ error: 'Failed to unregister device' });
  }
});

// Get user's registered devices
router.get('/devices', async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.notificationService) {
      return res.status(503).json({ error: 'Notification service not available' });
    }

    const devices = await req.notificationService.preferenceService.getUserDeviceTokens(userId);

    res.json({
      success: true,
      devices
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Test notification (for development/testing)
router.post('/test', [
  body('type').isIn(['claim', 'payment', 'appointment', 'system', 'medical_record']),
  body('template').notEmpty().withMessage('Template name is required'),
  body('data').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Test notifications not allowed in production' });
    }

    const userId = req.user.id;
    const { type, template, data = {}, priority = 'medium' } = req.body;

    if (!req.notificationService) {
      return res.status(503).json({ error: 'Notification service not available' });
    }

    const result = await req.notificationService.createNotification(userId, type, template, data, priority);

    res.json({
      success: true,
      message: 'Test notification created',
      result
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ error: 'Failed to create test notification' });
  }
});

// Get queue statistics (admin only)
router.get('/queue-stats', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!req.notificationService) {
      return res.status(503).json({ error: 'Notification service not available' });
    }

    const stats = await req.notificationService.queue.getQueueStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    res.status(500).json({ error: 'Failed to fetch queue statistics' });
  }
});

module.exports = router;
