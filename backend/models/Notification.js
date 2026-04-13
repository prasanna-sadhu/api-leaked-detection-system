const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for backward compatibility
  },
  finding_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Finding',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low']
  },
  risk_score: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'sent', 'acknowledged'],
    default: 'pending'
  },
  sent_at: {
    type: Date
  }
}, {
  timestamps: true
});

// Only create notifications for high-risk findings (risk_score >= 60)
notificationSchema.index({ status: 1, severity: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
