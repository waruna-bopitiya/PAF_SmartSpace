import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { ticketAPI, resourceAPI, API_BASE_URL } from '../services/api';
import '../styles/Tickets.css';

const Tickets = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [attachments, setAttachments] = useState([]);   // File objects for upload
  const [previews, setPreviews] = useState([]);          // Object URLs for preview
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [ticketAttachments, setTicketAttachments] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [ticketComments, setTicketComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  // QR scan pre-fill state
  const [qrResourceId, setQrResourceId] = useState('');
  const [qrResourceName, setQrResourceName] = useState('');
  const [fromQR, setFromQR] = useState(false);
  const [formData, setFormData] = useState({
    resourceId: '',
    title: '',
    description: '',
    category: 'MAINTENANCE_REQUEST',
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
      setShowForm(true);
    }
  }, [location.search]);

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [previews]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // reset input

    const remaining = 3 - attachments.length;
    if (files.length > remaining) {
      setError(`You can only add ${remaining} more image(s). Maximum 3 total.`);
      return;
    }
    const invalid = files.find(f => !f.type.startsWith('image/'));
    if (invalid) {
      setError('Only image files are allowed (jpg, png, gif, etc.)');
      return;
    }
    const tooBig = files.find(f => f.size > 5 * 1024 * 1024);
    if (tooBig) {
      setError('Each image must be under 5MB.');
      return;
    }
    setError('');
    setAttachments(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeAttachment = (index) => {
    URL.revokeObjectURL(previews[index]);
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.resourceId) { setError('Please select a resource'); return; }
    if (!formData.title || formData.title.length < 5) { setError('Title must be at least 5 characters'); return; }
    if (!formData.description || formData.description.length < 10) { setError('Description must be at least 10 characters'); return; }

    setSubmitting(true);
    try {
      const payload = { ...formData, createdBy: user?.id };
      const res = await ticketAPI.create(payload);
      const createdTicketId = res.data?.id || res.data?._id;

      // Upload attachments one by one
      if (attachments.length > 0 && createdTicketId) {
        const uploadErrors = [];
        for (const file of attachments) {
          try {
            await ticketAPI.uploadAttachment(createdTicketId, file);
          } catch (uploadErr) {
            console.error('Attachment upload error:', uploadErr);
            uploadErrors.push(file.name);
          }
        }
        if (uploadErrors.length > 0) {
          setSuccess(`Ticket created! Some images failed to upload: ${uploadErrors.join(', ')}`);
        } else {
          setSuccess(`Ticket created successfully with ${attachments.length} image(s)!`);
        }
      } else {
        setSuccess('Ticket created successfully!');
      }

      setFormData({
        resourceId: qrResourceId || '',
        title: '',
        description: '',
        category: 'MAINTENANCE_REQUEST',
        priority: 'MEDIUM',
        preferredContactEmail: '',
        preferredContactPhone: '',
      });
      previews.forEach(url => URL.revokeObjectURL(url));
      setAttachments([]);
      setPreviews([]);
      setShowForm(false);
      setFromQR(false);
      fetchTickets();
    } catch (err) {
      console.error('Error creating ticket:', err);
      if (err.response?.status === 400) {
        if (err.response?.data?.errors && typeof err.response.data.errors === 'object') {
          const fieldErrors = Object.entries(err.response.data.errors)
            .map(([field, message]) => `${field}: ${message}`).join(', ');
          setError(fieldErrors || 'Invalid ticket details.');
        } else {
          setError(err.response?.data?.error || err.response?.data?.message || 'Invalid ticket details.');
        }
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else if (err.response?.status === 500) {
        const msg = err.response?.data?.error || err.response?.data?.message || 'Server error.';
        setError(typeof msg === 'string' ? msg : 'Server error. Please try again later.');
      } else {
        const msg = err.response?.data?.error || err.response?.data?.message || 'Error creating ticket';
        setError(typeof msg === 'string' ? msg : 'Error creating ticket');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = async (ticketId) => {
    try {
      setError('');
      const [ticketRes, commentsRes] = await Promise.all([
        ticketAPI.getById(ticketId),
        ticketAPI.getComments(ticketId),
      ]);
      setTicketDetails(ticketRes.data);
      setTicketComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);

      // Load attachments
      if (ticketRes.data?.attachmentIds?.length > 0) {
        try {
          const attRes = await ticketAPI.getAttachments(ticketId);
          setTicketAttachments(Array.isArray(attRes.data) ? attRes.data : []);
        } catch (e) {
          console.error('Could not load attachments:', e);
          setTicketAttachments([]);
        }
      } else {
        setTicketAttachments([]);
      }

      setShowDetails(true);
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load ticket details';
      setError(typeof msg === 'string' ? msg : 'Failed to load ticket details. Please try again.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !ticketDetails) return;
    try {
      setCommentLoading(true);
      const ticketId = ticketDetails.id || ticketDetails._id;
      await ticketAPI.addComment(ticketId, {
        userId: user?.id,
        userName: user?.fullName || user?.email || 'User',
        userEmail: user?.email,
        content: newComment,
        staffComment: false,
      });
      const commentsRes = await ticketAPI.getComments(ticketId);
      setTicketComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment', error);
      alert('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const ticketId = ticketDetails.id || ticketDetails._id;
      await ticketAPI.deleteComment(ticketId, commentId, user?.id);
      const commentsRes = await ticketAPI.getComments(ticketId);
      setTicketComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
    } catch (error) {
      console.error('Failed to delete comment', error);
      alert('Failed to delete comment');
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setTicketDetails(null);
    setTicketAttachments([]);
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
        const msg = err.response?.data?.error || err.response?.data?.message || 'Error deleting ticket';
        setError(typeof msg === 'string' ? msg : 'Error deleting ticket');
      }
    }
  };

  const getStatusColor = (status) => ({
    OPEN: 'info', IN_PROGRESS: 'warning', RESOLVED: 'success', CLOSED: 'secondary', REJECTED: 'danger',
  }[status] || 'secondary');

  const getPriorityColor = (priority) => ({
    LOW: 'info', MEDIUM: 'warning', HIGH: 'danger', CRITICAL: 'danger',
  }[priority] || 'secondary');

  if (loading && tickets.length === 0) {
    return <div className="loading">Loading tickets...</div>;
  }

  return (
    <div className="tickets-container">
      <div className="tickets-header">
        <h1>Maintenance Tickets</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Ticket'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Ticket Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="booking-form">
          <h2>Report Issue</h2>

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
              <div className="qr-resource-locked">
                <span className="qr-lock-icon">🔒</span>
                <span className="qr-resource-display-name">{qrResourceName}</span>
                <input type="hidden" name="resourceId" value={qrResourceId} />
              </div>
            ) : (
              <select id="resourceId" name="resourceId" value={formData.resourceId} onChange={handleInputChange} required>
                <option value="">Select a resource...</option>
                {resources.map(resource => (
                  <option key={resource._id} value={resource._id}>{resource.name} - {resource.location}</option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="title">Issue Title *</label>
            <input id="title" type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Brief description of the issue" required />
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description *</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Provide detailed information about the issue..." required></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
                <option value="DAMAGE">Damage</option>
                <option value="MALFUNCTION">Malfunction</option>
                <option value="LOST_AND_FOUND">Lost &amp; Found</option>
                <option value="MAINTENANCE_REQUEST">Maintenance Request</option>
                <option value="CLEANING">Cleaning</option>
                <option value="ACCESS_ISSUE">Access Issue</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="priority">Priority *</label>
              <select id="priority" name="priority" value={formData.priority} onChange={handleInputChange} required>
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
              <input id="preferredContactEmail" type="email" name="preferredContactEmail" value={formData.preferredContactEmail} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label htmlFor="preferredContactPhone">Phone Number</label>
              <input id="preferredContactPhone" type="tel" name="preferredContactPhone" value={formData.preferredContactPhone} onChange={handleInputChange} />
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label>Attach Images (up to 3, max 5MB each)</label>
            {attachments.length < 3 && (
              <label className="image-upload-label" htmlFor="attachments">
                <span>📷 Click to add image ({attachments.length}/3)</span>
                <input id="attachments" type="file" multiple accept="image/*" onChange={handleAttachmentChange} style={{ display: 'none' }} />
              </label>
            )}
            {previews.length > 0 && (
              <div className="image-preview-grid">
                {previews.map((url, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={url} alt={`Preview ${index + 1}`} className="image-preview-thumb" />
                    <div className="image-preview-name">{attachments[index]?.name}</div>
                    <button type="button" className="image-preview-remove" onClick={() => removeAttachment(index)}>✕ Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
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
                  <th>Images</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(ticket => (
                  <tr key={ticket.id || ticket._id}>
                    <td>{ticket.title}</td>
                    <td>{ticket.resourceId}</td>
                    <td>{ticket.category}</td>
                    <td><span className={`badge badge-${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span></td>
                    <td><span className={`badge badge-${getStatusColor(ticket.status)}`}>{ticket.status}</span></td>
                    <td>
                      {ticket.attachmentIds?.length > 0
                        ? <span title={`${ticket.attachmentIds.length} image(s)`}>🖼 {ticket.attachmentIds.length}</span>
                        : <span style={{ color: '#aaa' }}>—</span>}
                    </td>
                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => handleViewDetails(ticket.id || ticket._id)}>View</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteTicket(ticket.id || ticket._id)} style={{ marginLeft: '8px' }}>Delete</button>
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
              <button className="modal-close" onClick={handleCloseDetails} aria-label="Close">×</button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <div className="detail-field">
                  <label>Status</label>
                  <span className={`badge badge-${getStatusColor(ticketDetails.status)}`}>{ticketDetails.status}</span>
                </div>
                <div className="detail-field">
                  <label>Priority</label>
                  <span className={`badge badge-${getPriorityColor(ticketDetails.priority)}`}>{ticketDetails.priority}</span>
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

              {/* Attachments / Images */}
              {ticketAttachments.length > 0 && (
                <div className="detail-section" style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                    🖼 Attached Images ({ticketAttachments.length})
                  </label>
                  <div className="ticket-attachment-grid">
                    {ticketAttachments.map((att) => (
                      <div key={att.id} className="ticket-attachment-item">
                        <img
                          src={att.fileData ? `data:${att.fileType || 'image/jpeg'};base64,${att.fileData}` : `${API_BASE_URL}${att.fileUrl}`}
                          alt={att.fileName}
                          className="ticket-attachment-img"
                          onClick={() => {
                            const newTab = window.open();
                            newTab.document.body.innerHTML = `<img src="${att.fileData ? `data:${att.fileType || 'image/jpeg'};base64,${att.fileData}` : `${API_BASE_URL}${att.fileUrl}`}" style="max-width: 100%;">`;
                          }}
                          title={`${att.fileName} — click to open`}
                        />
                        <div className="ticket-attachment-name">{att.fileName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="detail-section" style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Comments ({ticketComments.length})</label>
                {ticketComments.length > 0 ? (
                  <ul className="ticket-comment-list" style={{ listStyle: 'none', padding: 0, margin: '10px 0' }}>
                    {ticketComments.map((comment) => (
                      <li key={comment.id || `${comment.userId}-${comment.createdAt}`} style={{ padding: '10px', backgroundColor: '#f9f9f9', borderLeft: '3px solid #0056b3', marginBottom: '8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ margin: '0 0 5px 0', fontSize: '0.85em', color: '#666' }}>
                            <strong>{comment.userName || comment.userEmail || 'Unknown'}</strong> - {new Date(comment.createdAt).toLocaleString()}
                          </p>
                          <p style={{ margin: 0 }}>{comment.content}</p>
                        </div>
                        {comment.userId === user?.id && (
                          <button onClick={() => handleDeleteComment(comment.id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '0.9em' }}>Delete</button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#888', fontStyle: 'italic', margin: '10px 0' }}>No comments for this ticket.</p>
                )}

                {ticketDetails.status !== 'CLOSED' && ticketDetails.status !== 'RESOLVED' ? (
                  <form onSubmit={handleAddComment} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a new comment..." disabled={commentLoading} required style={{ padding: '0.5rem', minHeight: '80px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }} />
                    <button type="submit" className="btn btn-primary" disabled={commentLoading || !newComment.trim()} style={{ alignSelf: 'flex-start' }}>
                      {commentLoading ? 'Adding...' : 'Add Comment'}
                    </button>
                  </form>
                ) : (
                  <div style={{ marginTop: '1rem', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px', textAlign: 'center', color: '#6c757d' }}>
                    This ticket is closed. New comments cannot be added.
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseDetails}>Close</button>
              <button className="btn btn-danger" onClick={() => handleDeleteTicket(ticketDetails.id || ticketDetails._id)}>Delete Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
