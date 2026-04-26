import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="layout">
      {/* Only show navbar for non-admin users */}
      {!isAdmin && (
        <div className="navbar">
          <div className="navbar-content">
            <div className="navbar-brand">
              <h1>Smart Campus Hub</h1>
            </div>
            
            {/* User Navigation */}
            <ul className="navbar-menu">
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/resources">Resources</Link></li>
              <li><Link to="/bookings">Bookings</Link></li>
              <li><Link to="/tickets">Tickets</Link></li>
              <li><Link to="/notifications">Notifications</Link></li>
            </ul>

            <div className="navbar-user">
              {user && (
                <>
                  <span>{user.fullName || user.name || user.email}</span>
                  <span className="role-label user">User</span>
                </>
              )}
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;
