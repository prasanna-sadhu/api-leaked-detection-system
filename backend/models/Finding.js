const mongoose = require('mongoose');

const findingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for backward compatibility
  },
  type: {
    type: String,
    required: true,
    enum: [
      'aws_access_key', 'aws_secret_key', 'github_token', 'github_oauth',
      'slack_token', 'slack_webhook', 'google_api_key', 'google_oauth',
      'stripe_key', 'stripe_restricted_key', 'twilio_key', 'twilio_sid',
      'sendgrid_key', 'mailgun_key', 'private_key', 'jwt_token',
      'password_in_url', 'generic_secret'
    ]
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
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    required: true
  },
  preview: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  line_number: {
    type: Number
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Index for efficient queries
findingSchema.index({ severity: 1, risk_score: -1 });
findingSchema.index({ source: 1 });
findingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Finding', findingSchema);
