import React from 'react';

function Dashboard({ stats, loading }) {
  // Debug log every render
  console.log('📊 DASHBOARD COMPONENT - Received props:', {
    hasStats: !!stats,
    stats: stats,
    loading: loading
  });
  
  // Use default stats if stats is null/undefined
  const displayStats = stats || {
    totalFindings: 0,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    avgRiskScore: 0
  };
  
  console.log('📊 DASHBOARD - Display stats:', {
    totalFindings: displayStats.totalFindings,
    bySeverity: displayStats.bySeverity,
    avgRiskScore: displayStats.avgRiskScore
  });

  // Show loading state only on initial load before any data
  if (loading && !stats) {
    console.log('⏳ Dashboard showing loading state');
    return (
      <div className="dashboard-grid">
        {[1].map(i => (
          <div key={i} className="stat-card" style={{ height: '120px' }}>
            <div className="loading">Loading...</div>
          </div>
        ))}
      </div>
    );
  }

  console.log('📊 DASHBOARD - Rendering single stat card');

  return (
    <div className="dashboard-grid">
      {/* Total Findings Only */}
      <div className="stat-card">
        <div className="stat-value">{displayStats.totalFindings ?? 0}</div>
        <div className="stat-label">Total Findings</div>
      </div>
    </div>
  );
}

export default Dashboard;
