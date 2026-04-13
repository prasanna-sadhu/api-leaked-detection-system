const Finding = require('../models/Finding');

class ReportService {
  /**
   * Generate statistics about findings
   * @param {string} userId - User ID to filter stats (optional for admin)
   * @returns {Promise<Object>} - Statistics object
   */
  async generateStats(userId = null) {
    try {
      // Build query - filter by user if provided
      const matchQuery = {};
      if (userId) {
        matchQuery.user = userId;
      }
      
      console.log('🔍 Generating stats with query:', JSON.stringify(matchQuery));
      
      // First, check what findings exist - get RAW documents from MongoDB
      const allUserFindings = await Finding.find(matchQuery).lean(); // .lean() gives raw JS objects
      console.log('📋 Found', allUserFindings.length, 'findings for user');
      if (allUserFindings.length > 0) {
        console.log('  Sample findings (RAW from DB):', allUserFindings.slice(0, 3).map(f => ({
          _id: f._id,
          type: f.type,
          severity: f.severity,
          severity_type: typeof f.severity,
          severity_exists: !!f.severity,
          risk_score: f.risk_score,
          user: f.user
        })));
        
        // Check unique severities
        const uniqueSeverities = [...new Set(allUserFindings.map(f => f.severity))];
        console.log('🎨 Unique severities found:', uniqueSeverities);
        
        // Check if severity field exists and is valid
        const invalidFindings = allUserFindings.filter(f => !f.severity || !['critical', 'high', 'medium', 'low'].includes(f.severity));
        if (invalidFindings.length > 0) {
          console.warn('⚠️ Found', invalidFindings.length, 'findings with invalid severity:', 
            invalidFindings.map(f => ({ severity: f.severity, severityType: typeof f.severity, type: f.type })));
        } else {
          console.log('✅ All findings have valid severity values!');
        }
        
        // Show ALL severities in the results
        console.log('📊 All severity values in DB:', allUserFindings.map(f => f.severity));
      }
      
      const totalFindings = await Finding.countDocuments(matchQuery);
      console.log('📊 Total findings count:', totalFindings);

      // Group by severity
      const bySeverity = await Finding.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        }
      ]);
      
      console.log('📊 Raw bySeverity aggregation:', JSON.stringify(bySeverity, null, 2));

      // Group by service
      const byService = await Finding.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$service',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // Group by type
      const byType = await Finding.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            avgRiskScore: { $avg: '$risk_score' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // Calculate average risk score
      const avgRiskResult = await Finding.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            avgRiskScore: { $avg: '$risk_score' }
          }
        }
      ]);

      const avgRiskScore = avgRiskResult.length > 0 ? avgRiskResult[0].avgRiskScore : 0;

      // Get recent findings for this user
      const recentFindings = await Finding.find(matchQuery)
        .sort({ createdAt: -1 })
        .limit(10);

      const formattedBySeverity = this._formatAggregation(bySeverity);
      console.log('📊 Formatted bySeverity:', formattedBySeverity);
      
      // Ensure all severity levels are present even if 0
      const completeBySeverity = {
        critical: formattedBySeverity.critical || 0,
        high: formattedBySeverity.high || 0,
        medium: formattedBySeverity.medium || 0,
        low: formattedBySeverity.low || 0
      };
      
      console.log('📊 Complete bySeverity:', completeBySeverity);

      return {
        totalFindings,
        avgRiskScore: Math.round((avgRiskScore || 0) * 10) / 10,
        bySeverity: completeBySeverity,
        byService: this._formatAggregation(byService),
        byType: byType.map(item => ({
          type: item._id,
          count: item.count,
          avgRiskScore: Math.round((item.avgRiskScore || 0) * 10) / 10
        })),
        recentFindings
      };
    } catch (err) {
      console.error('❌ Error in generateStats:', err);
      throw new Error(`Failed to generate stats: ${err.message}`);
    }
  }

  /**
   * Format aggregation results
   * @param {Array} aggregation - MongoDB aggregation result
   * @returns {Object} - Formatted object
   */
  _formatAggregation(aggregation) {
    const result = {};
    aggregation.forEach(item => {
      result[item._id] = item.count;
    });
    return result;
  }

  /**
   * Get findings filtered by criteria
   * @param {Object} filters - Filter criteria
   * @param {string} userId - User ID to filter by (required for security)
   * @returns {Promise<Array>} - Array of findings
   */
  async getFilteredFindings(filters = {}, userId = null) {
    try {
      const query = {};

      // ALWAYS filter by userId for security (unless admin)
      if (userId) {
        query.user = userId;
      }

      if (filters.severity) {
        query.severity = filters.severity;
      }

      if (filters.service) {
        query.service = filters.service;
      }

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.minRiskScore) {
        query.risk_score = { $gte: filters.minRiskScore };
      }

      const findings = await Finding.find(query)
        .sort({ risk_score: -1, createdAt: -1 })
        .limit(filters.limit || 100);

      return findings;
    } catch (err) {
      throw new Error(`Failed to fetch findings: ${err.message}`);
    }
  }
}

module.exports = new ReportService();
