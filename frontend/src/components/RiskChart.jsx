import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

function RiskChart({ stats }) {
  // Use default stats if not available
  const displayStats = stats || {
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0 }
  };

  const data = [
    { name: 'Critical', value: displayStats.bySeverity?.critical ?? 0, color: '#e74c3c' },
    { name: 'High', value: displayStats.bySeverity?.high ?? 0, color: '#e67e22' },
    { name: 'Medium', value: displayStats.bySeverity?.medium ?? 0, color: '#f1c40f' },
    { name: 'Low', value: displayStats.bySeverity?.low ?? 0, color: '#27ae60' }
  ];

  // Calculate total findings
  const totalFindings = data.reduce((sum, item) => sum + item.value, 0);

  // Show empty state only if there are truly no findings at all
  if (totalFindings === 0) {
    return (
      <div className="chart-container">
        <div className="empty-state">
          <p>No risk data available. Scan a file to see the risk distribution.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container" style={{ height: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => [`${value} findings`, props.payload.name]}
            contentStyle={{ 
              background: 'white', 
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RiskChart;
