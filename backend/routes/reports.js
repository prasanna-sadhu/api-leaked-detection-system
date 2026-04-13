const express = require('express');
const router = express.Router();
const reportService = require('../services/reportService');
const { protect } = require('../middleware/auth');

/**
 * GET /api/reports/stats
 * Get statistics about findings (protected route)
 */
router.get('/stats', protect, async (req, res) => {
  try {
    console.log('📊 Stats request for user:', req.user.username, '(', req.user.id, ')');
    
    // Query the database directly to see what's there
    const Finding = require('../models/Finding');
    const userFindings = await Finding.find({ user: req.user.id });
    console.log('🔍 Database check - User has', userFindings.length, 'findings in DB');
    if (userFindings.length > 0) {
      console.log('  Sample findings:', userFindings.slice(0, 3).map(f => ({
        type: f.type,
        severity: f.severity,
        risk_score: f.risk_score
      })));
    }
    
    const stats = await reportService.generateStats(req.user.id);
    
    console.log('📊 Generated stats:', {
      totalFindings: stats.totalFindings,
      bySeverity: stats.bySeverity,
      avgRiskScore: stats.avgRiskScore,
      hasData: stats.totalFindings > 0
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reports/findings
 * Get filtered findings (protected route)
 */
router.get('/findings', protect, async (req, res) => {
  try {
    const filters = {
      severity: req.query.severity,
      service: req.query.service,
      type: req.query.type,
      minRiskScore: req.query.minRiskScore ? parseFloat(req.query.minRiskScore) : null,
      limit: req.query.limit ? parseInt(req.query.limit) : null
    };

    // Pass userId to filter findings by authenticated user
    const findings = await reportService.getFilteredFindings(filters, req.user.id);

    res.json({
      success: true,
      count: findings.length,
      findings
    });
  } catch (error) {
    console.error('Get filtered findings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
