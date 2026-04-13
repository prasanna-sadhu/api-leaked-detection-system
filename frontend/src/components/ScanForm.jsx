import React, { useState } from 'react';
import { scanService } from '../services/api';

function ScanForm({ onScanComplete }) {
  const [filePath, setFilePath] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!filePath.trim()) {
      setMessage('Please enter a file path');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await scanService.scanFile(filePath);
      console.log('Scan response:', response); // Debug log
      
      if (response.success) {
        setMessage(`Scan complete! Found ${response.count} secret(s)`);
        setMessageType('success');
        setFilePath('');
        
        // Notify parent to refresh data
        if (onScanComplete) {
          setTimeout(() => onScanComplete(), 500);
        }
      } else {
        setMessage(response.error || 'Scan failed');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Scan error:', error);
      setMessage(error.response?.data?.error || 'Failed to scan file. Please check the path and try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="scan-form">
      {message && (
        <div className={`${messageType}-message`}>
          {message}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="filePath">File Path</label>
        <input
          type="text"
          id="filePath"
          className="form-input"
          placeholder="C:/path/to/your/file.js or /home/user/config.py"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          disabled={loading}
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-scan"
        disabled={loading}
      >
        {loading ? 'Scanning...' : '🔍 Scan File'}
      </button>

      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8f9fa', borderRadius: '6px', fontSize: '0.85rem' }}>
        <strong>💡 Tip:</strong> Try scanning files like:
        <ul style={{ margin: '0.5rem 0 0 1.5rem', color: '#7f8c8d' }}>
          <li>Configuration files (.env, .config, .yaml)</li>
          <li>Source code files (.js, .py, .java)</li>
          <li>Database connection files</li>
          <li>API integration files</li>
        </ul>
      </div>
    </form>
  );
}

export default ScanForm;
