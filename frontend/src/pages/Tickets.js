import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { ticketAPI, resourceAPI } from '../services/api';
import '../styles/Tickets.css';

const Tickets = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ticketDetails, setTicketDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  // QR scan pre-fill state
  const [qrResourceId, setQrResourceId] = useState('');
  const [qrResourceName, setQrResourceName] = useState('');
  const [fromQR, setFromQR] = useState(false);
  const [formData, setFormData] = useState({
    resourceId: '',
    title: '',
    description: '',
    category: 'MAINTENANCE',
    priority: 'MEDIUM',
    preferredContactEmail: '',
    preferredContactPhone: '',
  });

  const fetchTickets = useCallback(async () => {
    try {
      const response = await ticketAPI.getCreatedBy(user?.id, 0, 10);
      setTickets(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchResources = useCallback(async () => {
    try {
      const response = await resourceAPI.getActive();
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchResources();
  }, [fetchTickets, fetchResources]);

  // On mount, parse QR params from URL and auto-open form if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rid = params.get('resourceId');
    const rname = params.get('resourceName') || '';
    if (rid) {
      setQrResourceId(rid);
      setQrResourceName(rname ? decodeURIComponent(rname) : rid);
      setFromQR(true);
      setFormData(prev => ({ ...prev, resourceId: rid }));
      setShowForm(true); // Auto-open form
    }
  }, [location.search]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + attachments.length > 3) {
      setError('Maximum 3 attachments allowed');
      return;
    }
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.resourceId) {
      setError('Please select a resource');
      return;
    }
    if (!formData.title || formData.title.length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }
    if (!formData.description || formData.description.length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    try {
      // Create JSON payload
      const payload = {
        ...formData,
        createdBy: user?.id,
      };

      console.log('Submitting ticket payload:', payload);

      await ticketAPI.create(payload);

      setSuccess('Ticket created successfully!');
      setFormData({
        resourceId: qrResourceId || '',  // keep QR resource if present
        title: '',
        description: '',
        category: 'MAINTENANCE',
        priority: 'MEDIUM',
        preferredContactEmail: '',
        preferredContactPhone: '',
      });
      setAttachments([]);
      setShowForm(false);
      setFromQR(false);
      fetchTickets();
    } catch (err) {
      console.error('Error creating ticket:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle specific error statuses
      if (err.response?.status === 400) {
        if (err.response?.data?.errors && typeof err.response.data.errors === 'object') {
          const fieldErrors = Object.entries(err.response.data.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          setError(fieldErrors || 'Invalid ticket details. Please check your input.');
        } else {
          setError(err.response?.data?.error || err.response?.data?.message || 'Invalid ticket details.');
        }
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else if (err.response?.status === 500) {
        const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Server error. Please try again later.';
        setError(typeof errorMsg === 'string' ? errorMsg : 'Server error. Please try again later.');
      } else {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Error creating ticket';
        setError(typeof errorMessage === 'string' ? errorMessage : 'Error creating ticket');
      }
    }
  };

  const handleViewDetails = async (ticketId) => {
    try {
      console.log('Fetching ticket details for ID:', ticketId);
      setError('');
      const response = await ticketAPI.getById(ticketId);
      console.log('Ticket details response:', response.data);
      setTicketDetails(response.data);
      setShowDetails(true);
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load ticket details';
      setError(typeof errorMsg === 'string' ? errorMsg : 'Failed to load ticket details. Please try again.');
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setTicketDetails(null);
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      try {
        setError('');
        setSuccess('');
        await ticketAPI.delete(ticketId);
        setSuccess('Ticket deleted successfully');
        handleCloseDetails();
        fetchTickets();
      } catch (err) {
        console.error('Error deleting ticket:', err);
        const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Error deleting ticket';
        setError(typeof errorMsg === 'string' ? errorMsg : 'Error deleting ticket');
      }
    }
  };

  const getStatusColor = (status) => {
    return {
      OPEN: 'info',
      IN_PROGRESS: 'warning',
      RESOLVED: 'success',
      CLOSED: 'secondary',
      REJECTED: 'danger',
    }[status] || 'secondary';
  };

  const getPriorityColor = (priority) => {
    return {
      LOW: 'info',
      MEDIUM: 'warning',
      HIGH: 'danger',
      CRITICAL: 'danger',
    }[priority] || 'secondary';
  };

  if (loading && tickets.length === 0) {
    return <div className="loading">Loading tickets...</div>;
  }

  return (
    <div className="tickets-container">
      <div className="tickets-header">
        <h1>Maintenance Tickets</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'New Ticket'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Ticket Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="booking-form">
          <h2>Report Issue</h2>

          {/* QR Scan Banner */}
          {fromQR && qrResourceName && (
            <div className="qr-scan-banner">
              <span className="qr-scan-icon">📱</span>
              <div>
                <strong>Scanned via QR Code</strong>
                <p>Resource has been automatically selected for you.</p>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="resourceId">Affected Resource *</label>
            {fromQR && qrResourceId ? (
              // Read-only display when coming from QR scan
              <div className="qr-resource-locked">
                <span className="qr-lock-icon">🔒</span>
                <span className="qr-resource-display-name">{qrResourceName}</span>
                <input type="hidden" name="resourceId" value={qrResourceId} />
              </div>
            ) : (
              <select
                id="resourceId"
                name="resourceId"
                value={formData.resourceId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a resource...</option>
                {resources.map(resource => (
                  <option key={resource._id} value={resource._id}>
                    {resource.name} - {resource.location}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="title">Issue Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide detailed information about the issue..."
              required
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="DAMAGE">Damage</option>
                <option value="MALFUNCTION">Malfunction</option>
                <option value="LOST_AND_FOUND">Lost & Found</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority *</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preferredContactEmail">Contact Email</label>
              <input
                id="preferredContactEmail"
                type="email"
                name="preferredContactEmail"
                value={formData.preferredContactEmail}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredContactPhone">Phone Number</label>
              <input
                id="preferredContactPhone"
                type="tel"
                name="preferredContactPhone"
                value={formData.preferredContactPhone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label htmlFor="attachments">Attach Images (max 3)</label>
            <input
              id="attachments"
              type="file"
              multiple
              accept="image/*"
              onChange={handleAttachmentChange}
            />
            {attachments.length > 0 && (
              <div className="attachments-list">
                <p>Attachments ({attachments.length}/3):</p>
                {attachments.map((file, index) => (
                  <div key={index} className="attachment-item">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="btn-remove"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">Submit Ticket</button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tickets List */}
      <div className="bookings-list">
        <h2>Your Tickets</h2>
        {tickets.length > 0 ? (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Resource</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id || ticket._id}>
                    <td>{ticket.title}</td>
                    <td>{ticket.resourceId}</td>
                    <td>{ticket.category}</td>
                    <td>
                      <span className={`badge badge-${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleViewDetails(ticket.id || ticket._id)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteTicket(ticket.id || ticket._id)}
                        style={{ marginLeft: '8px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No tickets yet. Create your first ticket!</p>
        )}
      </div>

      {/* Ticket Details Modal */}
      {showDetails && ticketDetails && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{ticketDetails.title}</h2>
              <button
                className="modal-close"
                onClick={handleCloseDetails}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <div className="detail-field">
                  <label>Status</label>
                  <span className={`badge badge-${getStatusColor(ticketDetails.status)}`}>
                    {ticketDetails.status}
                  </span>
                </div>
                <div className="detail-field">
                  <label>Priority</label>
                  <span className={`badge badge-${getPriorityColor(ticketDetails.priority)}`}>
                    {ticketDetails.priority}
                  </span>
                </div>
                <div className="detail-field">
                  <label>Category</label>
                  <span>{ticketDetails.category}</span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-field">
                  <label>Resource</label>
                  <span>{ticketDetails.resourceId}</span>
                </div>
                <div className="detail-field">
                  <label>Created</label>
                  <span>{new Date(ticketDetails.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="detail-section">
                <label>Description</label>
                <p className="description-text">{ticketDetails.description}</p>
              </div>

              {ticketDetails.preferredContactEmail && (
                <div className="detail-field">
                  <label>Contact Email</label>
                  <span>{ticketDetails.preferredContactEmail}</span>
                </div>
              )}

              {ticketDetails.preferredContactPhone && (
                <div className="detail-field">
                  <label>Contact Phone</label>
                  <span>{ticketDetails.preferredContactPhone}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCloseDetails}
              >
                Close
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteTicket(ticketDetails.id || ticketDetails._id)}
              >
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
