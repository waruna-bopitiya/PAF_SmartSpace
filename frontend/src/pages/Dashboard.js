import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalResources: 0,
    availableResources: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalTickets: 0,
    openTickets: 0,
  });

  useEffect(() => {
    // 1. URL eken token eka gannawa
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // 2. Token eka save karanawa
      localStorage.setItem('token', token);
      
      // 3. URL eka clean karanawa (token kalla ain karanawa)
      window.history.replaceState({}, document.title, "/dashboard");
      
      // 4. Page eka reload karanna ethakota useAuth eka aluth token eka kiyawanawa
      window.location.reload();
    } else {
      setLoading(false);
    }
  }, [location]);

  // Token eka check karana thuru 'Loading' pennanna
  if (loading && !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading SmartSpace...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* User log wela inna welawata witharak fullName pennanna */}
      <h1>Welcome, {user?.fullName || 'User'}!</h1>
      <p>Dashboard for Smart Campus Operations Hub</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Resources</h3>
          <p className="stat-value">{stats.totalResources}</p>
        </div>
        <div className="stat-card">
          <h3>Available Resources</h3>
          <p className="stat-value">{stats.availableResources}</p>
        </div>
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-value">{stats.totalBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Bookings</h3>
          <p className="stat-value">{stats.pendingBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Total Tickets</h3>
          <p className="stat-value">{stats.totalTickets}</p>
        </div>
        <div className="stat-card">
          <h3>Open Tickets</h3>
          <p className="stat-value">{stats.openTickets}</p>
        </div>
      </div>

      <div className="quick-links">
        <h2>Quick Links</h2>
        <ul>
          <li><a href="/resources">Browse Resources</a></li>
          <li><a href="/bookings">View My Bookings</a></li>
          <li><a href="/tickets">View Tickets</a></li>
          <li><a href="/notifications">View Notifications</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;