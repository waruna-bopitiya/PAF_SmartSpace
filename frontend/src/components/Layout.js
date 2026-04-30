import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { notificationAPI } from '../services/api';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user?.id && !isAdmin && !isTechnician) {
        try {
          const response = await notificationAPI.getUnreadCount(user.id);
          setUnreadCount(response.data.count || response.data.unreadCount || 0);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      }
    };

    fetchUnreadCount();
  }, [user?.id, isAdmin, isTechnician]);

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
              <li><Link to={isTechnician ? '/technician' : '/'}>{isTechnician ? 'Technician Dashboard' : 'Dashboard'}</Link></li>
              {!isTechnician && <li><Link to="/resources">Resources</Link></li>}
              {!isTechnician && <li><Link to="/bookings">Bookings</Link></li>}
              {!isTechnician && <li><Link to="/tickets">Tickets</Link></li>}
              {!isTechnician && (
                <li>
                  <Link to="/notifications" className="navbar-notification" style={{ display: 'inline-flex' }}>
                    Notifications
                    {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                  </Link>
                </li>
              )}
            </ul>

            <div className="navbar-user">
              {user && (
                <>
                  <span>{user.fullName || user.name || user.email}</span>
                  <span className={`role-label ${isTechnician ? 'technician' : 'user'}`}>
                    {isTechnician ? 'Technician' : 'User'}
                  </span>
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
