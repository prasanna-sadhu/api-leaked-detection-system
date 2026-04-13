import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="navbar fade-in-down">
        <div className="nav-brand">SecretGuard</div>
        <div className="nav-links">
          <a href="#home" className="nav-link">Home</a>
          <a href="#about" className="nav-link">About Us</a>
          <a href="#services" className="nav-link">Services</a>
          <a href="#contact" className="nav-link">Contact</a>
          <button 
            className="btn btn-nav"
            onClick={() => onNavigate('register')}
          >
            Sign Up
          </button>
          <button 
            className="btn btn-nav"
            onClick={() => onNavigate('login')}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section slide-in-left">
        <div className="hero-content">
          <h1 className="hero-title">
            Protect Your Code from <span className="highlight">Secret Leaks</span>
          </h1>
          <p className="hero-subtitle">
            Scan your files instantly and discover exposed credentials, API keys, and sensitive information before attackers do.
          </p>
          <button 
            className="btn btn-primary btn-large pulse-animation"
            onClick={() => onNavigate('login')}
          >
            Start Scanning Now
          </button>
        </div>
        <div className="hero-image slide-in-right">
          <div className="floating-card">
            <div className="card-text">Detecting Secrets...</div>
            <div className="card-stats">
              <span className="stat-critical">Critical: 3</span>
              <span className="stat-high">High: 5</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section id="about" className="problem-section slide-in-up">
        <div className="container">
          <h2 className="section-title">About Us</h2>
          <div className="problem-grid">
            <div className="problem-card fade-in-delay-1">
              <h3>Accidental Exposure</h3>
              <p>Developers accidentally commit secrets to public repositories every day, exposing sensitive credentials to malicious actors.</p>
            </div>
            <div className="problem-card fade-in-delay-2">
              <h3>Targeted Attacks</h3>
              <p>Attackers actively scan GitHub and other platforms for leaked API keys, database passwords, and authentication tokens.</p>
            </div>
            <div className="problem-card fade-in-delay-3">
              <h3>Financial Loss</h3>
              <p>Exposed credentials can lead to unauthorized access, data breaches, and significant financial damage to organizations.</p>
            </div>
            <div className="problem-card fade-in-delay-4">
              <h3>Compliance Violations</h3>
              <p>Leaked secrets can result in regulatory non-compliance, leading to fines and reputation damage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section slide-in-up">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            <div className="service-card slide-in-left">
              <h3>AWS Credentials</h3>
              <p>Detect AWS Access Keys, Secret Keys, and IAM credentials with 95% accuracy.</p>
              <div className="service-tags">
                <span className="tag">Access Keys</span>
                <span className="tag">Secret Keys</span>
              </div>
            </div>
            <div className="service-card slide-in-right">
              <h3>GitHub Tokens</h3>
              <p>Identify Personal Access Tokens, OAuth tokens, and GitHub App credentials.</p>
              <div className="service-tags">
                <span className="tag">PAT</span>
                <span className="tag">OAuth</span>
              </div>
            </div>
            <div className="service-card slide-in-left">
              <h3>Slack & Communication</h3>
              <p>Find exposed Slack tokens, webhooks, and communication service credentials.</p>
              <div className="service-tags">
                <span className="tag">Slack</span>
                <span className="tag">Webhooks</span>
              </div>
            </div>
            <div className="service-card slide-in-right">
              <h3>Payment Gateways</h3>
              <p>Detect Stripe keys, PayPal credentials, and other payment processor secrets.</p>
              <div className="service-tags">
                <span className="tag">Stripe</span>
                <span className="tag">PayPal</span>
              </div>
            </div>
            <div className="service-card slide-in-left">
              <h3>Private Keys</h3>
              <p>Identify RSA, EC, and SSH private keys that should never be exposed.</p>
              <div className="service-tags">
                <span className="tag">RSA</span>
                <span className="tag">SSH</span>
                <span className="tag">EC</span>
              </div>
            </div>
            <div className="service-card slide-in-right">
              <h3>And 13+ More Types</h3>
              <p>Google APIs, Twilio, SendGrid, Mailgun, JWTs, database URLs, and more.</p>
              <div className="service-tags">
                <span className="tag">Google</span>
                <span className="tag">Twilio</span>
                <span className="tag">JWT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>SecretGuard</h4>
              <p>Protecting your code from secret leaks, one scan at a time.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul className="footer-links">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 SecretGuard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
