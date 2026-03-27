import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import '../styles/Notifications.css';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [user?.id, filter, page]);

  const fetchNotifications = async () => {
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
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount(user?.id);
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING_CREATED':
      case 'BOOKING_APPROVED':
      case 'BOOKING_REJECTED':
        return '📅';
      case 'TICKET_CREATED':
      case 'TICKET_ASSIGNED':
      case 'TICKET_CLOSED':
        return '🎟️';
      case 'COMMENT_ADDED':
        return '💬';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'BOOKING_APPROVED':
      case 'TICKET_CLOSED':
        return 'success';
      case 'BOOKING_REJECTED':
      case 'TICKET_ASSIGNED':
        return 'warning';
      case 'BOOKING_CREATED':
      case 'TICKET_CREATED':
        return 'info';
      case 'SYSTEM':
        return 'secondary';
      default:
        return 'primary';
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
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
            >
              <div className="notification-icon">
                <span>{getNotificationIcon(notification.type)}</span>
              </div>

              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
                {notification.actionUrl && (
                  <span className="notification-action">
                    <a href={notification.actionUrl}>View details →</a>
                  </span>
                )}
              </div>

              <div className="notification-badge">
                <span className={`badge badge-${getNotificationColor(notification.type)}`}>
                  {notification.type.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="notification-actions">
                {!notification.isRead && (
                  <button
                    className="btn-icon"
                    onClick={() => handleMarkAsRead(notification._id)}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(notification._id)}
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
