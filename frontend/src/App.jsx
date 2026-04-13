import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import LandingPage from './components/LandingPage';
import Loader from './components/Loader';
import Dashboard from './components/Dashboard';
import ScanForm from './components/ScanForm';
import FindingsTable from './components/FindingsTable';
import NotificationPanel from './components/NotificationPanel';
import RiskChart from './components/RiskChart';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Main Dashboard App Component
function DashboardApp({ onBackToLanding }) {
  const [findings, setFindings] = useState([]);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token, logout, isAuthenticated } = useAuth();

  // Fetch data immediately if token exists on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const activeToken = token || storedToken;
    
    console.log('🚀 Dashboard Mount Check:', {
      hasToken: !!activeToken,
      tokenSource: token ? 'context' : storedToken ? 'localStorage' : 'none',
      storedTokenLength: storedToken?.length,
      contextToken: token?.substring(0, 20),
      storedTokenPreview: storedToken?.substring(0, 20)
    });

    if (activeToken) {
      console.log('🔑 Token found, loading dashboard...');
      
      // Initialize with empty stats first to avoid null
      setStats({
        totalFindings: 0,
        bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
        avgRiskScore: 0
      });
      
      // Force a small delay to ensure auth interceptor picks up the token
      setTimeout(() => {
        console.log('⏰ Starting API calls...');
        fetchStats();
        fetchFindings();
        fetchNotifications();
      }, 100);
    } else {
      console.log('❌ No token found - user not authenticated');
      setInitialLoading(false);
    }
  }, []); // Run once on mount

  const fetchStats = async () => {
    try {
      const { reportsService } = await import('./services/api');
      const response = await reportsService.getStats();
      console.log('📊 Stats API Response:', {
        success: response.success,
        hasData: !!response.stats,
        totalFindings: response.stats?.totalFindings,
        bySeverity: response.stats?.bySeverity,
        avgRiskScore: response.stats?.avgRiskScore,
        fullStats: response.stats
      });
      
      if (response.success && response.stats) {
        console.log('✅ Setting stats with totalFindings:', response.stats.totalFindings);
        console.log('✅ Severity breakdown:', response.stats.bySeverity);
        
        // Ensure all fields are properly populated
        const formattedStats = {
          totalFindings: response.stats.totalFindings ?? 0,
          bySeverity: {
            critical: response.stats.bySeverity?.critical ?? 0,
            high: response.stats.bySeverity?.high ?? 0,
            medium: response.stats.bySeverity?.medium ?? 0,
            low: response.stats.bySeverity?.low ?? 0
          },
          avgRiskScore: response.stats.avgRiskScore ?? 0
        };
        
        setStats(formattedStats);
        console.log('✅ Stats updated successfully');
      } else {
        console.warn('⚠️ Stats response not successful, using defaults');
        setStats({
          totalFindings: 0,
          bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
          avgRiskScore: 0
        });
      }
    } catch (err) {
      console.error('❌ Failed to fetch stats:', err.message);
      setStats({
        totalFindings: 0,
        bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
        avgRiskScore: 0
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchFindings = async () => {
    try {
      const { findingsService } = await import('./services/api');
      const response = await findingsService.getAllFindings({ limit: 50 });
      console.log('📋 Findings API Response:', {
        success: response.success,
        count: response.count,
        findingsCount: response.findings?.length,
        hasData: response.findings && response.findings.length > 0
      });
      
      if (response.success) {
        const newFindings = response.findings || [];
        console.log('✅ Setting findings:', newFindings.length, 'items');
        setFindings(newFindings);
        console.log('✅ Current findings state:', newFindings.length);
      } else {
        console.warn('⚠️ Findings response not successful');
        setFindings([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch findings:', err.message);
      setFindings([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { notificationsService } = await import('./services/api');
      const response = await notificationsService.getNotifications();
      console.log('🔔 Notifications response:', response); // Debug log
      if (response.success) {
        setNotifications(response.notifications || []);
        console.log('✅ Notifications loaded:', response.notifications?.length || 0);
      } else {
        console.warn('⚠️ Notifications response not successful');
        setNotifications([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch notifications:', err.message);
      setNotifications([]);
    }
  };

  const handleScanComplete = () => {
    console.log('🔄 Scan complete detected! Refreshing all data...');
    
    // Force re-fetch all data immediately
    fetchStats();
    fetchFindings();
    fetchNotifications();
    
    // Additional refresh after a short delay to ensure DB has updated
    setTimeout(() => {
      console.log('🔄 Secondary refresh triggered...');
      fetchStats();
      fetchFindings();
      fetchNotifications();
    }, 1000);
    
    // Log to confirm refresh
    setTimeout(() => {
      console.log('📊 Post-scan stats:', stats);
      console.log('📋 Post-scan findings:', findings?.length);
      console.log('🔔 Post-scan notifications:', notifications?.length);
    }, 1500);
  };

  const handleNotificationAction = async (id, action) => {
    try {
      const { notificationsService } = await import('./services/api');
      if (action === 'sent') {
        await notificationsService.markAsSent(id);
      } else if (action === 'acknowledged') {
        await notificationsService.markAsAcknowledged(id);
      }
      // Refresh notifications
      fetchNotifications();
    } catch (err) {
      console.error('Failed to update notification:', err);
      setError('Failed to update notification status');
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>🔒 Secret Detection Dashboard</h1>
            <p>Detect and monitor exposed credentials in your codebase</p>
          </div>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ color: 'white', textAlign: 'right' }}>
                <div style={{ fontWeight: '600' }}>{user.username}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{user.email}</div>
              </div>
              <button 
                onClick={logout}
                className="btn btn-small"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} style={{ marginLeft: '1rem' }}>
              ✕
            </button>
          </div>
        )}

        {/* Stats Overview */}
        <Dashboard key={`dashboard-${stats?.totalFindings ?? 'loading'}`} stats={stats} loading={initialLoading} />

        {/* Scan Form and Notifications */}
        <div className="content-grid">
          <div className="card">
            <div className="card-header">
              <h2>Scan File</h2>
            </div>
            <div className="card-body">
              <ScanForm onScanComplete={handleScanComplete} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>High-Risk Alerts</h2>
              <span style={{ background: '#e74c3c', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                {notifications.length} Pending
              </span>
            </div>
            <div className="card-body">
              <NotificationPanel 
                notifications={notifications} 
                onAction={handleNotificationAction}
              />
            </div>
          </div>
        </div>

        {/* Findings Table */}
        <div className="card">
          <div className="card-header">
            <h2>Detected Secrets</h2>
            <span style={{ background: '#667eea', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>
              {findings.length} Total
            </span>
          </div>
          <div className="card-body">
            <FindingsTable key={`findings-${findings.length}`} findings={findings} loading={initialLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}

// Dashboard App with Auth Check
function DashboardAppWithAuth({ onBackToLanding }) {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState(null); // Start null until auth is determined

  // Listen for navigation events from child components
  useEffect(() => {
    const handleNavigateEvent = (event) => {
      const page = event.detail;
      setCurrentPage(page);
    };

    window.addEventListener('navigate', handleNavigateEvent);
    return () => window.removeEventListener('navigate', handleNavigateEvent);
  }, []);

  // Auto-redirect based on auth status - only once when auth state changes
  useEffect(() => {
    console.log('🔐 Auth state changed:', { isAuthenticated, loading, currentPage });
    
    if (!loading && currentPage === null) {
      // First time load - decide where to go
      if (isAuthenticated) {
        console.log('✅ User authenticated, going to dashboard');
        setCurrentPage('dashboard');
      } else {
        console.log('ℹ️ User not authenticated, going to landing');
        setCurrentPage('landing');
      }
    }
    
    // Don't auto-redirect after initial load unless explicitly logged out
  }, [isAuthenticated, loading]); // Removed currentPage from dependency

  const handleNavigate = (page) => {
    console.log('🧭 Navigating to:', page);
    setCurrentPage(page);
  };

  // Show loading while determining route
  if (loading || currentPage === null) {
    return (
      <div className="auth-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {currentPage === 'landing' ? (
        <LandingPage onNavigate={handleNavigate} />
      ) : currentPage === 'login' ? (
        <Login />
      ) : currentPage === 'register' ? (
        <Register />
      ) : (
        <DashboardApp onBackToLanding={() => setCurrentPage('landing')} />
      )}
    </>
  );
}

// Main App with Routing
function App() {
  const [showLoader, setShowLoader] = useState(() => {
    // Check if we've already shown the loader in this session
    const hasShownLoader = sessionStorage.getItem('loaderShown');
    return !hasShownLoader;
  });

  useEffect(() => {
    // Only show loader once per session
    if (showLoader) {
      const timer = setTimeout(() => {
        setShowLoader(false);
        // Mark loader as shown for this session
        sessionStorage.setItem('loaderShown', 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showLoader]);

  if (showLoader) {
    return <Loader />;
  }

  return (
    <Router>
      <AuthProvider>
        <DashboardAppWithAuth />
      </AuthProvider>
    </Router>
  );
}

export default App;
