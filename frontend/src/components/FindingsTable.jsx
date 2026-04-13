import React from 'react';

function FindingsTable({ findings, loading }) {
  if (loading) {
    return <div className="loading">Loading findings...</div>;
  }

  if (!findings || findings.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <p>No secrets detected yet. Start by scanning a file!</p>
      </div>
    );
  }

  const getSeverityBadge = (severity) => {
    return `badge badge-${severity}`;
  };

  const formatRiskScore = (score) => {
    return Math.round(score);
  };

  return (
    <div className="table-container">
      <table className="findings-table">
        <thead>
          <tr>
            <th>Severity</th>
            <th>Type</th>
            <th>Service</th>
            <th>Risk Score</th>
            <th>Preview</th>
            <th>Source</th>
            <th>Line</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((finding, index) => (
            <tr key={finding._id || index}>
              <td>
                <span className={getSeverityBadge(finding.severity)}>
                  {finding.severity}
                </span>
              </td>
              <td>
                <strong>{finding.type.replace(/_/g, ' ').toUpperCase()}</strong>
              </td>
              <td>{finding.service}</td>
              <td>
                <span style={{ 
                  fontWeight: 'bold',
                  color: finding.risk_score >= 80 ? '#e74c3c' : finding.risk_score >= 60 ? '#e67e22' : '#27ae60'
                }}>
                  {formatRiskScore(finding.risk_score)}
                </span>
              </td>
              <td>
                <code style={{ 
                  background: '#f8f9fa', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.85rem'
                }}>
                  {finding.preview}
                </code>
              </td>
              <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {finding.source}
              </td>
              <td>{finding.line_number || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FindingsTable;
