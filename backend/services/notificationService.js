const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Get all pending high-risk notifications
   * @param {string} userId - User ID to filter notifications
   * @returns {Promise<Array>} - Array of notifications
   */
  async getPendingNotifications(userId = null) {
    try {
      const query = { status: 'pending' };
      
      // Filter by user if provided
      if (userId) {
        query.user = userId;
      }
      
      const notifications = await Notification.find(query)
        .populate('finding_id')
        .sort({ createdAt: -1 })
        .limit(50);

      return notifications;
    } catch (err) {
      throw new Error(`Failed to fetch notifications: ${err.message}`);
    }
  }

  /**
   * Mark a notification as sent
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} - Updated notification
   */
  async markAsSent(notificationId) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        {
          status: 'sent',
          sent_at: new Date()
        },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    } catch (err) {
      throw new Error(`Failed to update notification: ${err.message}`);
    }
  }

  /**
   * Mark a notification as acknowledged
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} - Updated notification
   */
  async markAsAcknowledged(notificationId) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { status: 'acknowledged' },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    } catch (err) {
      throw new Error(`Failed to update notification: ${err.message}`);
    }
  }

  /**
   * Get notification statistics
   * @returns {Promise<Object>} - Notification stats
   */
  async getStats() {
    try {
      const [pending, sent, acknowledged] = await Promise.all([
        Notification.countDocuments({ status: 'pending' }),
        Notification.countDocuments({ status: 'sent' }),
        Notification.countDocuments({ status: 'acknowledged' })
      ]);

      return {
        pending,
        sent,
        acknowledged,
        total: pending + sent + acknowledged
      };
    } catch (err) {
      throw new Error(`Failed to fetch notification stats: ${err.message}`);
    }
  }
}

module.exports = new NotificationService();
