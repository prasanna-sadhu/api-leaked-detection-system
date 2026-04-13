import React from 'react';

function NotificationPanel({ notifications, onAction }) {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">✅</div>
        <p>No pending notifications</p>
        <p style={{ fontSize: '0.85rem', color: '#95a5a6' }}>All clear! No high-risk secrets detected.</p>
      </div>
    );
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getTypeIcon = (type) => {
    if (type.includes('aws')) return '☁️';
    if (type.includes('github')) return '🐙';
    if (type.includes('slack')) return '💬';
    if (type.includes('google')) return '🔑';
    if (type.includes('stripe')) return '💳';
    if (type.includes('key')) return '🔐';
    return '⚠️';
  };

  return (
    <div className="notification-list">
      {notifications.map((notification) => (
        <div 
          key={notification._id} 
          className={`notification-item ${notification.severity}`}
        >
          <div className="notification-header">
            <span className="notification-title">
              {getTypeIcon(notification.type)} {notification.type.replace(/_/g, ' ').toUpperCase()}
            </span>
            <span className="notification-time">{formatTime(notification.createdAt)}</span>
          </div>
          
          <div className="notification-message">
            <strong>Service:</strong> {notification.service}<br />
            <strong>Risk Score:</strong> {notification.risk_score}<br />
            {notification.message}
          </div>

          <div className="notification-actions">
            <button 
              className="btn btn-small btn-outline"
              onClick={() => onAction(notification._id, 'sent')}
            >
              Mark as Sent
            </button>
            <button 
              className="btn btn-small btn-outline"
              onClick={() => onAction(notification._id, 'acknowledged')}
            >
              Acknowledge
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationPanel;
