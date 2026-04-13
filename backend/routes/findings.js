const express = require('express');
const router = express.Router();
const Finding = require('../models/Finding');
const { protect } = require('../middleware/auth');

/**
 * GET /api/findings
 * Get all findings with optional filtering (protected route)
 */
router.get('/', protect, async (req, res) => {
  try {
    const { severity, service, type, limit } = req.query;
    
    const query = { user: req.user.id }; // Filter by logged-in user
    
    if (severity) query.severity = severity;
    if (service) query.service = service;
    if (type) query.type = type;

    const findings = await Finding.find(query)
      .sort({ risk_score: -1, createdAt: -1 })
      .limit(parseInt(limit) || 100);

    res.json({
      success: true,
      count: findings.length,
      findings
    });
  } catch (error) {
    console.error('Get findings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/findings/:id
 * Get a single finding by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const finding = await Finding.findById(req.params.id);

    if (!finding) {
      return res.status(404).json({
        success: false,
        error: 'Finding not found'
      });
    }

    res.json({
      success: true,
      finding
    });
  } catch (error) {
    console.error('Get finding error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
