import React, { useEffect, useMemo, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { ticketAPI, notificationAPI, userAPI } from '../services/api';
import '../styles/TechnicianDashboard.css';

const TechnicianDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activePanel, setActivePanel] = useState('tickets');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketComments, setTicketComments] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchTechnicianData = async () => {
      try {
        setLoading(true);

        const ticketRequests = [];
        if (user?.id) {
          ticketRequests.push(ticketAPI.getAssignedTo(user.id));
        }
        if (user?.email && user?.email !== user?.id) {
          ticketRequests.push(ticketAPI.getAssignedTo(user.email));
        }

        const [ticketResponses, notificationsRes, unreadRes] = await Promise.all([
          Promise.all(ticketRequests),
          notificationAPI.getAll(user?.id || user?.email, 0, 8),
          notificationAPI.getUnreadCount(user?.id || user?.email),
        ]);

        const mergedById = new Map();
        ticketResponses.forEach((response) => {
          const data = Array.isArray(response.data) ? response.data : [];
          data.forEach((ticket) => {
            const id = ticket._id || ticket.id;
            if (id) {
              mergedById.set(id, ticket);
            }
          });
        });

        const assignedTickets = Array.from(mergedById.values());

        setTickets(assignedTickets);
        setNotifications(notificationsRes.data?.content || notificationsRes.data || []);
        setUnreadNotifications(unreadRes.data?.count || 0);
      } catch (error) {
        console.error('Error loading technician dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id || user?.email) {
      fetchTechnicianData();
    }
  }, [user?.id, user?.email]);

  const openCount = useMemo(
    () => tickets.filter((t) => t.status === 'OPEN').length,
    [tickets]
  );

  const inProgressCount = useMemo(
    () => tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    [tickets]
  );

  const closedCount = useMemo(
    () => tickets.filter((t) => t.status === 'CLOSED').length,
    [tickets]
  );

  const handleUpdateTicketStatus = async (ticket, nextStatus) => {
    const ticketId = ticket._id || ticket.id;
    if (!ticketId) {
      return;
    }

    try {
      setActionLoadingId(ticketId);
      setFeedback({ type: '', message: '' });

      let response;
      if (nextStatus === 'CLOSED') {
        response = await ticketAPI.close(ticketId);
      } else {
        response = await ticketAPI.updateStatus(ticketId, nextStatus);
      }

      const updatedTicket = response.data || { ...ticket, status: nextStatus };
      setTickets((prevTickets) =>
        prevTickets.map((item) =>
          (item._id || item.id) === ticketId
            ? { ...item, ...updatedTicket, status: updatedTicket.status || nextStatus }
            : item
        )
      );

      setFeedback({ type: 'success', message: `Ticket updated to ${nextStatus}.` });
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Failed to update ticket status.';
      setFeedback({ type: 'error', message: typeof message === 'string' ? message : 'Failed to update ticket status.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleViewDetails = async (ticket) => {
    const ticketId = ticket._id || ticket.id;
    if (!ticketId) {
      return;
    }

    try {
      setDetailsLoading(true);
      setFeedback({ type: '', message: '' });

      const [ticketRes, commentsRes] = await Promise.all([
        ticketAPI.getById(ticketId),
        ticketAPI.getComments(ticketId),
      ]);

      const ticketData = ticketRes.data || ticket;
      let createdByName = ticketData.createdBy;
      let assignedToName = ticketData.assignedTo;

      try {
        if (ticketData.createdBy) {
          const userRes = await userAPI.getById(ticketData.createdBy);
          createdByName = userRes.data?.fullName || userRes.data?.email || ticketData.createdBy;
        }
      } catch (e) {
        console.error('Failed to fetch creator details', e);
      }

      try {
        if (ticketData.assignedTo) {
          const userRes = await userAPI.getById(ticketData.assignedTo);
          assignedToName = userRes.data?.fullName || userRes.data?.email || ticketData.assignedTo;
        }
      } catch (e) {
        console.error('Failed to fetch assignee details', e);
      }

      setSelectedTicket({ ...ticketData, createdByName, assignedToName });
      setTicketComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Failed to fetch ticket details.';
      setFeedback({ type: 'error', message: typeof message === 'string' ? message : 'Failed to fetch ticket details.' });
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return 'N/A';
    }
    return new Date(value).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading technician dashboard...</div>;
  }

  return (
    <div className="technician-dashboard-container">
      <div className="technician-dashboard-header">
        <h1>Technician Dashboard</h1>
        <p>Welcome, {user?.fullName || user?.email}. Manage your assigned maintenance tickets.</p>
      </div>

      <div className="technician-panel-tabs">
        <button
          type="button"
          className={`technician-panel-tab ${activePanel === 'tickets' ? 'active' : ''}`}
          onClick={() => setActivePanel('tickets')}
        >
          Tickets ({tickets.length})
        </button>
        <button
          type="button"
          className={`technician-panel-tab ${activePanel === 'notifications' ? 'active' : ''}`}
          onClick={() => setActivePanel('notifications')}
        >
          Notifications ({unreadNotifications})
        </button>
      </div>

      {activePanel === 'tickets' && (
        <>
          <div className="technician-stats-grid">
            <div className="technician-stat-card">
              <h3>Assigned Tickets</h3>
              <p className="value">{tickets.length}</p>
            </div>
            <div className="technician-stat-card">
              <h3>Open Tickets</h3>
              <p className="value">{openCount}</p>
            </div>
            <div className="technician-stat-card">
              <h3>In Progress</h3>
              <p className="value">{inProgressCount}</p>
            </div>
            <div className="technician-stat-card">
              <h3>Closed Tickets</h3>
              <p className="value">{closedCount}</p>
            </div>
          </div>

          <div className="technician-dashboard-section">
            <h2>My Assigned Tickets</h2>
            {feedback.message && (
              <div className={`technician-feedback ${feedback.type === 'error' ? 'error' : 'success'}`}>
                {feedback.message}
              </div>
            )}
            {tickets.length > 0 ? (
              <div className="technician-table-wrapper">
                <table className="technician-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket._id || ticket.id}>
                        <td>{ticket.title}</td>
                        <td>{ticket.category}</td>
                        <td>
                          <span className={`ticket-priority priority-${String(ticket.priority || '').toLowerCase()}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`ticket-status-badge ticket-status-${String(ticket.status || '').toLowerCase()}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td>{ticket.location || 'N/A'}</td>
                        <td>
                          <div className="technician-actions">
                            {ticket.status === 'OPEN' && (
                              <button
                                className="tech-action-btn start"
                                disabled={actionLoadingId === (ticket._id || ticket.id)}
                                onClick={() => handleUpdateTicketStatus(ticket, 'IN_PROGRESS')}
                              >
                                Start Work
                              </button>
                            )}

                            {ticket.status === 'IN_PROGRESS' && (
                              <button
                                className="tech-action-btn close"
                                disabled={actionLoadingId === (ticket._id || ticket.id)}
                                onClick={() => handleUpdateTicketStatus(ticket, 'CLOSED')}
                              >
                                Mark Done
                              </button>
                            )}

                            {ticket.status === 'CLOSED' && (
                              <button
                                className="tech-action-btn reopen"
                                disabled={actionLoadingId === (ticket._id || ticket.id)}
                                onClick={() => handleUpdateTicketStatus(ticket, 'OPEN')}
                              >
                                Reopen
                              </button>
                            )}

                            <button
                              className="tech-action-btn details"
                              disabled={detailsLoading}
                              onClick={() => handleViewDetails(ticket)}
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="technician-empty">No tickets are currently assigned to you.</p>
            )}
          </div>
        </>
      )}

      {activePanel === 'notifications' && (
        <div className="technician-dashboard-section">
          <div className="technician-notifications-header">
            <h2>Related Notifications</h2>
            <span className="technician-notification-count">Unread: {unreadNotifications}</span>
          </div>

          {notifications.length > 0 ? (
            <div className="technician-notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification._id || notification.id}
                  className={`technician-notification-item ${notification.isRead ? 'read' : 'unread'}`}
                >
                  <div className="technician-notification-main">
                    <h3>{notification.title}</h3>
                    <p>{notification.message}</p>
                    <span className="technician-notification-time">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>

                  {notification.actionUrl && (
                    <div className="technician-notification-action">
                      <a href={notification.actionUrl}>View Ticket</a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="technician-empty">No related notifications yet.</p>
          )}
        </div>
      )}

      {(detailsLoading || selectedTicket) && (
        <div className="technician-dashboard-section technician-details-section">
          <div className="technician-details-header">
            <h2>Ticket Details</h2>
            {selectedTicket && (
              <button
                type="button"
                className="tech-action-btn close-panel"
                onClick={() => {
                  setSelectedTicket(null);
                  setTicketComments([]);
                }}
              >
                Close Panel
              </button>
            )}
          </div>

          {detailsLoading && <p className="technician-empty">Loading full ticket details...</p>}

          {!detailsLoading && selectedTicket && (
            <>
              <div className="ticket-details-grid">
                {(selectedTicket.id || selectedTicket._id) && (
                  <div><strong>ID:</strong> {selectedTicket.id || selectedTicket._id}</div>
                )}
                {selectedTicket.title && (
                  <div><strong>Title:</strong> {selectedTicket.title}</div>
                )}
                {selectedTicket.category && (
                  <div><strong>Category:</strong> {selectedTicket.category}</div>
                )}
                {selectedTicket.priority && (
                  <div><strong>Priority:</strong> {selectedTicket.priority}</div>
                )}
                {selectedTicket.status && (
                  <div><strong>Status:</strong> {selectedTicket.status}</div>
                )}
                {selectedTicket.resourceId && (
                  <div><strong>Resource ID:</strong> {selectedTicket.resourceId}</div>
                )}
                {(selectedTicket.createdByName || selectedTicket.createdBy) && (
                  <div><strong>Created By:</strong> {selectedTicket.createdByName || selectedTicket.createdBy}</div>
                )}
                {(selectedTicket.assignedToName || selectedTicket.assignedTo) && (
                  <div><strong>Assigned To:</strong> {selectedTicket.assignedToName || selectedTicket.assignedTo}</div>
                )}
                {selectedTicket.location && (
                  <div><strong>Location:</strong> {selectedTicket.location}</div>
                )}
                {selectedTicket.preferredContactEmail && (
                  <div><strong>Contact Email:</strong> {selectedTicket.preferredContactEmail}</div>
                )}
                {selectedTicket.preferredContactPhone && (
                  <div><strong>Contact Phone:</strong> {selectedTicket.preferredContactPhone}</div>
                )}
                {selectedTicket.createdAt && (
                  <div><strong>Created At:</strong> {formatDate(selectedTicket.createdAt)}</div>
                )}
                {selectedTicket.updatedAt && (
                  <div><strong>Updated At:</strong> {formatDate(selectedTicket.updatedAt)}</div>
                )}
                {selectedTicket.resolvedDate && (
                  <div><strong>Resolved At:</strong> {formatDate(selectedTicket.resolvedDate)}</div>
                )}
                {selectedTicket.lastResponseAt && (
                  <div><strong>Last Response:</strong> {formatDate(selectedTicket.lastResponseAt)}</div>
                )}
              </div>

              {selectedTicket.description && (
                <div className="ticket-description-block">
                  <h3>Description</h3>
                  <p>{selectedTicket.description}</p>
                </div>
              )}

              {selectedTicket.resolutionNotes && (
                <div className="ticket-description-block">
                  <h3>Resolution Notes</h3>
                  <p>{selectedTicket.resolutionNotes}</p>
                </div>
              )}

              {selectedTicket.rejectionReason && (
                <div className="ticket-description-block">
                  <h3>Rejection Reason</h3>
                  <p>{selectedTicket.rejectionReason}</p>
                </div>
              )}

              <div className="ticket-description-block">
                <h3>Comments ({ticketComments.length})</h3>
                {ticketComments.length > 0 ? (
                  <ul className="ticket-comment-list">
                    {ticketComments.map((comment) => (
                      <li key={comment.id || `${comment.userId}-${comment.createdAt}`}>
                        <p className="comment-meta">
                          {comment.userName || comment.userEmail || 'Unknown'} - {formatDate(comment.createdAt)}
                        </p>
                        <p className="comment-body">{comment.content}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="technician-empty">No comments for this ticket.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
