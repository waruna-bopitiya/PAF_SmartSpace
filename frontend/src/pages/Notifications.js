import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import '../styles/Notifications.css';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread
  const [page, setPage] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (filter === 'unread') {
        response = await notificationAPI.getUnread(user?.id, page, 10);
      } else {
        response = await notificationAPI.getAll(user?.id, page, 10);
      }
      setNotifications(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filter, page]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadCount(user?.id);
      setUnreadCount(response.data.count || response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);



  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead(user?.id);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationAPI.delete(notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        await notificationAPI.deleteAll(user?.id);
        setNotifications([]);
        fetchUnreadCount();
      } catch (error) {
        console.error('Error deleting all notifications:', error);
      }
    }
  };



  if (loading && notifications.length === 0) {
    return <div className="loading">Loading notifications...</div>;
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header-card">
        <div className="notifications-header">
          <div>
            <h1>Notifications</h1>
            <p className="header-subtitle">Stay updated with bookings, tickets, and important system activity.</p>
          </div>
          <div className="header-stats">
            <span className="unread-badge">Unread: {unreadCount}</span>
          </div>
        </div>

        <div className="header-actions">
          {unreadCount > 0 && (
            <button
              className="notif-btn notif-btn-primary"
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              className="notif-btn notif-btn-danger"
              onClick={handleDeleteAll}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => {
            setFilter('all');
            setPage(0);
          }}
        >
          All Notifications
        </button>
        <button
          className={`tab ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => {
            setFilter('unread');
            setPage(0);
          }}
        >
          Unread
          {unreadCount > 0 && (
            <span className="notif-badge-danger">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {notifications.length > 0 ? (
          [...notifications]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(notification => (
            <div
              key={notification._id || notification.id}
              className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
              style={{
                padding: '15px',
                backgroundColor: notification.isRead ? '#f8f9fa' : '#e3f2fd',
                borderLeft: `4px solid ${notification.isRead ? '#ccc' : '#0056b3'}`,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '10px'
              }}
              onClick={async () => {
                if (!notification.isRead) {
                  await handleMarkAsRead(notification._id || notification.id);
                }
                
                // Navigate based on type
                if (notification.type.includes('TICKET') || notification.type === 'COMMENT_ADDED') {
                  navigate('/tickets');
                } else if (notification.type.includes('BOOKING')) {
                  navigate('/bookings');
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '1.1em', color: '#1f2937' }}>{notification.title}</strong>
                <span style={{ fontSize: '0.85em', color: '#666' }}>
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: '4px 0', color: '#444', lineHeight: '1.4' }}>{notification.message}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '0.8em', color: '#0056b3', fontWeight: 'bold' }}>
                  {notification.type.replace(/_/g, ' ')}
                </span>
                
                <button
                  className="btn-icon btn-delete"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigating when clicking delete
                    handleDelete(notification._id || notification.id);
                  }}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-notifications">
            <span className="empty-icon">🔔</span>
            <p>No {filter === 'unread' ? 'unread' : ''} notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
