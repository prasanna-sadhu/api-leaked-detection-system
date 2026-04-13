import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();

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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      console.log('🔵 Attempting registration with:', { username: formData.username, email: formData.email });
      const result = await register(formData.username, formData.email, formData.password);
      console.log('🟢 Registration result:', result);
      
      if (result.success) {
        console.log('✅ Registration successful! Redirecting to dashboard...');
        // Give it a moment then reload
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        console.error('❌ Registration failed:', result.error);
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      if (err.response) {
        // Backend responded with error
        setError(err.response.data?.error || 'Registration failed');
      } else if (err.request) {
        // Request was made but no response
        setError('Cannot connect to backend server. Please make sure it\'s running.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-auth-container">
      {/* Left Side - Blue Section */}
      <div className="split-left">
        <div className="split-content">
          <h1> Create Account</h1>
          <p className="split-subtitle">Start Scanning Your Code Today</p>
          <div className="split-features">
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <div>
                <h3>95% Detection Accuracy</h3>
                <p>Identify AWS keys, GitHub tokens, API credentials, and more</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <div>
                <h3>Lightning Fast</h3>
                <p>Scan thousands of files in seconds with our advanced detector</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔐</span>
              <div>
                <h3>Secure & Private</h3>
                <p>Your code is analyzed locally and never stored on our servers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="split-right">
        <div className="auth-form-container">
          <div className="auth-header">
            <h2>Get Started Free</h2>
            <p>Create your account in seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                {error}
                <button onClick={() => setError('')} className="close-btn">×</button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                disabled={loading}
              />
            </div>

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
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { 
                e.preventDefault(); 
                const event = new CustomEvent('navigate', { detail: 'login' });
                window.dispatchEvent(event);
              }} className="auth-link">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
