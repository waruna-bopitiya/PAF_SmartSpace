import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalResources: 0,
    availableResources: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalTickets: 0,
    openTickets: 0,
  });

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.fullName}!</h1>
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
