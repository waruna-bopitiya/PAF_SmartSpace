import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { resourceAPI, bookingAPI, ticketAPI, notificationAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalResources: 0,
    activeBookings: 0,
    openTickets: 0,
    unreadNotifications: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch statistics
        const [resourcesRes, bookingsRes, ticketsRes, notificationsRes] = await Promise.all([
          resourceAPI.getActive(),
          bookingAPI.getByUser(user?.id, 0, 5),
          ticketAPI.getCreatedBy(user?.id, 0, 5),
          notificationAPI.getUnreadCount(user?.id),
        ]);

        setStats({
          totalResources: resourcesRes.data.length,
          activeBookings: bookingsRes.data.content?.length || 0,
          openTickets: ticketsRes.data.content?.length || 0,
          unreadNotifications: notificationsRes.data.count || 0,
        });

        setRecentBookings(bookingsRes.data.content || []);
        setRecentTickets(ticketsRes.data.content || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.fullName}!</h1>
        <p>Here's your dashboard overview</p>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Total Resources</h3>
          <p className="value">{stats.totalResources}</p>
        </div>
        <div className="stat-card">
          <h3>Active Bookings</h3>
          <p className="value">{stats.activeBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Open Tickets</h3>
          <p className="value">{stats.openTickets}</p>
        </div>
        <div className="stat-card">
          <h3>Unread Notifications</h3>
          <p className="value">{stats.unreadNotifications}</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="dashboard-section">
        <h2>Recent Bookings</h2>
        {recentBookings.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Date</th>
                <th>Status</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.resourceId}</td>
                  <td>{new Date(booking.startTime).toLocaleDateString()}</td>
                  <td><span className={`booking-status status-${booking.status.toLowerCase()}`}>{booking.status}</span></td>
                  <td>{booking.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No recent bookings</p>
        )}
      </div>

      {/* Recent Tickets */}
      <div className="dashboard-section">
        <h2>Recent Tickets</h2>
        {recentTickets.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td>{ticket.title}</td>
                  <td>{ticket.category}</td>
                  <td><span className={`ticket-priority priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span></td>
                  <td><span className={`ticket-status-badge ticket-status-${ticket.status.toLowerCase()}`}>{ticket.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No recent tickets</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
