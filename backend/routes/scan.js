const express = require('express');
const router = express.Router();
const detectorService = require('../services/detectorService');
const fs = require('fs');
const { protect } = require('../middleware/auth');

/**
 * POST /api/scan
 * Scan a file for secrets (protected route)
 */
router.post('/', protect, async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }

    // Check if file exists before scanning
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: `File not found: ${filePath}. Please check the path and ensure the file exists.`
      });
    }

    // Check if file is readable
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
    } catch (err) {
      return res.status(403).json({
        success: false,
        error: `Cannot read file: ${filePath}. Permission denied.`
      });
    }

    console.log(`🔍 Scanning file: ${filePath} for user: ${req.user.username} (${req.user.id})`);
    const findings = await detectorService.scanFile(filePath);
    
    console.log(`✅ Detector found ${findings.length} secrets:`, 
      findings.map(f => ({ type: f.type, severity: f.severity, risk_score: f.risk_score }))
    );

    // Save findings with user reference
    const savedFindings = await detectorService.saveFindings(findings, req.user.id);
    
    console.log(`💾 Saved ${savedFindings.length} findings to database`);
    
    // Log each saved finding for debugging
    savedFindings.forEach((f, i) => {
      console.log(`  Finding ${i+1}:`, {
        _id: f._id,
        type: f.type,
        service: f.service,
        severity: f.severity,
        risk_score: f.risk_score,
        user: f.user ? f.user.toString() : 'NO USER ID',
        severityType: typeof f.severity,
        severityExists: !!f.severity,
        isValidSeverity: ['critical', 'high', 'medium', 'low'].includes(f.severity)
      });
    });
    
    // CRITICAL: Check actual MongoDB documents directly
    const Finding = require('../models/Finding');
    console.log('🔍 Direct MongoDB query immediately after save...');
    
    // Get raw documents without Mongoose transformation
    const rawDocs = await Finding.find({ user: req.user.id }).lean().limit(5);
    console.log('📊 RAW MongoDB documents:', rawDocs.length);
    rawDocs.forEach((doc, i) => {
      console.log(`  Doc ${i+1}:`, {
        _id: doc._id,
        severity: doc.severity,
        severity_type: typeof doc.severity,
        has_severity: !!doc.severity,
        all_keys: Object.keys(doc)
      });
    });
    
    // Check aggregation query directly
    console.log('🧪 Testing aggregation query...');
    const testAggregation = await Finding.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('📊 Aggregation result:', JSON.stringify(testAggregation, null, 2));
    
    // Verify the saved data by querying normally
    const verifySave = await Finding.find({ user: req.user.id }).limit(5);
    console.log('✅ Verification - User now has', verifySave.length, 'findings');
    if (verifySave.length > 0) {
      console.log('  Verified severities:', verifySave.map(f => ({ 
        severity: f.severity, 
        type: f.type,
        severityType: typeof f.severity,
        isValid: ['critical', 'high', 'medium', 'low'].includes(f.severity)
      })));
      
      // Check if ANY document has severity field
      const docsWithSeverity = verifySave.filter(f => f.severity && ['critical', 'high', 'medium', 'low'].includes(f.severity));
      console.log(`📊 Documents WITH valid severity: ${docsWithSeverity.length} out of ${verifySave.length}`);
      
      if (docsWithSeverity.length === 0) {
        console.error('❌ CRITICAL ISSUE: NO documents have valid severity field!');
        console.error('⚠️ This is why charts show zero!');
      } else {
        console.log('✅ All documents have valid severity - charts should work!');
      }
    } else {
      console.warn('⚠️ No findings found for user in database');
    }

    res.json({
      success: true,
      count: findings.length,
      findings: savedFindings
    });
  } catch (error) {
    console.error('❌ Scan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
