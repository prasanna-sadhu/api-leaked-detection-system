import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Reload page to trigger auth check
        window.location.href = '/';
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-auth-container">
      {/* Left Side - Blue Section */}
      <div className="split-left">
        <div className="split-content">
          <h1> Login to Scan</h1>
          <p className="split-subtitle">Protect Your Code from Secret Leaks</p>
          <div className="split-features">
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <div>
                <h3>Detect Secrets Instantly</h3>
                <p>Scan files for exposed credentials, API keys, and sensitive information</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚠️</span>
              <div>
                <h3>Real-time Alerts</h3>
                <p>Get notified immediately when high-risk secrets are discovered</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <div>
                <h3>Detailed Reports</h3>
                <p>View comprehensive analysis and risk assessment of your codebase</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="split-right">
        <div className="auth-form-container">
          <div className="auth-header">
            <h2>Welcome Back!</h2>
            <p>Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                {error}
                <button onClick={() => setError('')} className="close-btn">×</button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { 
                e.preventDefault(); 
                const event = new CustomEvent('navigate', { detail: 'register' });
                window.dispatchEvent(event);
              }} className="auth-link">Create account</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
