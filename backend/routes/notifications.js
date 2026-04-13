const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { protect } = require('../middleware/auth');

/**
 * GET /api/notifications
 * Get all pending notifications (protected route)
 */
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await notificationService.getPendingNotifications(req.user.id);

    res.json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/notifications/:id/sent
 * Mark notification as sent
 */
router.post('/:id/sent', async (req, res) => {
  try {
    const notification = await notificationService.markAsSent(req.params.id);

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Mark as sent error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/notifications/:id/acknowledge
 * Mark notification as acknowledged
 */
router.post('/:id/acknowledge', async (req, res) => {
  try {
    const notification = await notificationService.markAsAcknowledged(req.params.id);

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Mark as acknowledged error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
