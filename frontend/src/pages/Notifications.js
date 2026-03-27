import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      setError('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      setError('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationAPI.delete(id);
        fetchNotifications();
      } catch (err) {
        setError('Failed to delete notification');
      }
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button className="btn btn-primary" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card">
          <p className="text-center text-muted">No notifications</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item card ${notification.isRead ? 'read' : 'unread'}`}
            >
              <div className="notification-header">
                <h3>{notification.title}</h3>
                <span className="notification-type">{notification.type}</span>
              </div>
              <p>{notification.message}</p>
              <div className="notification-footer">
                <small className="text-muted">
                  {new Date(notification.createdAt).toLocaleString()}
                </small>
                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleMarkAsRead(notification.id)}
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(notification.id)}
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
