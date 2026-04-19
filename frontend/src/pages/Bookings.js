import React, { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../context/AuthContext';
import { bookingAPI, resourceAPI } from '../services/api';
import '../styles/Bookings.css';

const Bookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    resourceId: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 1,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      const response = await bookingAPI.getByUser(user?.id, 0, 10);
      setBookings(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
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
    fetchBookings();
    fetchResources();
  }, [fetchBookings, fetchResources]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'expectedAttendees' ? parseInt(value) : value,
    }));
  };
// Form submission handler with enhanced validation and error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.resourceId) {
      setError('Please select a resource');
      return;
    }
    if (!formData.startTime) {
      setError('Please select a start time');
      return;
    }
    if (!formData.endTime) {
      setError('Please select an end time');
      return;
    }
    if (!formData.purpose || formData.purpose.length < 5) {
      setError('Purpose must be at least 5 characters');
      return;
    }
    if (formData.expectedAttendees < 1) {
      setError('Expected attendees must be at least 1');
      return;
    }

    // Validate times
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    
    if (endDate <= startDate) {
      setError('End time must be after start time');
      return;
    }

    if (!user?.id) {
      setError('User information not available. Please refresh and try again.');
      return;
    }

    try {
      // Create booking payload with proper datetime formatting
      // datetime-local inputs return format like "2026-04-19T10:00"
      // We need to ensure it's properly formatted for ISO 8601
      const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return null;
        // Ensure format is YYYY-MM-DDTHH:MM:SS
        if (dateTimeString.includes(':') && !dateTimeString.includes('Z')) {
          return dateTimeString + ':00';
        }
        return dateTimeString;
      };
      
      const payload = {
        resourceId: formData.resourceId,
        startTime: formatDateTime(formData.startTime),
        endTime: formatDateTime(formData.endTime),
        purpose: formData.purpose,
        expectedAttendees: formData.expectedAttendees,
        userId: user?.id,
      };

      console.log('Submitting booking payload:', payload);

      // Try to create the booking
      const response = await bookingAPI.create(payload);
      
      console.log('Booking response:', response);
// Check for success status codes (201 Created or 200 OK)
      if (response && (response.status === 201 || response.status === 200)) {
        setSuccess('Booking request submitted successfully!');
        setFormData({
          resourceId: '',
          startTime: '',
          endTime: '',
          purpose: '',
          expectedAttendees: 1,
        });
        setShowForm(false);
        fetchBookings();
      } else {
        setError('Failed to create booking. Please try again.');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      
      // Handle specific error statuses
      if (err.response?.status === 409) {
        setError(err.response?.data?.error || 'This resource is already booked for the selected time period. Please choose a different time.');
      } else if (err.response?.status === 400) {
        // Check for validation errors from GlobalExceptionHandler
        if (err.response?.data?.errors && typeof err.response.data.errors === 'object') {
          const fieldErrors = Object.entries(err.response.data.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          setError(fieldErrors || 'Invalid booking details. Please check your input.');
        } else {
          setError(err.response?.data?.error || err.response?.data?.message || 'Invalid booking details. Please check your input.');
        }
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else if (err.response?.status === 500) {
        const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Server error. Please try again later.';
        setError(typeof errorMsg === 'string' ? errorMsg : 'Server error. Please try again later.');
      } else {
        // Extract error message from response
        const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           err.message || 
                           'An unexpected error occurred while creating the booking';
        setError(typeof errorMessage === 'string' ? errorMessage : 'An unexpected error occurred');
      }
    }
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        setError('');
        setSuccess('');
        await bookingAPI.cancel(bookingId);
        setSuccess('Booking cancelled successfully');
        fetchBookings();
      } catch (err) {
        console.error('Error cancelling booking:', err);
        console.error('Error response:', err.response?.data);
        const errorMsg = err.response?.data?.error || 
                        err.response?.data?.message || 
                        'Error cancelling booking. Please try again.';
        setError(typeof errorMsg === 'string' ? errorMsg : 'Error cancelling booking');
      }
    }
  };

  const getStatusColor = (status) => {
    return {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'danger',
      CANCELLED: 'secondary',
    }[status] || 'secondary';
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'New Booking'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Booking Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="booking-form">
          <h2>Create New Booking</h2>

          <div className="form-group">
            <label htmlFor="resourceId">Select Resource *</label>
            <select
              id="resourceId"
              name="resourceId"
              value={formData.resourceId}
              onChange={handleInputChange}
              required
            >
              <option value="">Choose a resource...</option>
              {resources.map(resource => (
                <option key={resource._id} value={resource._id}>
                  {resource.name} - {resource.location}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Date & Time *</label>
              <input
                id="startTime"
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Date & Time *</label>
              <input
                id="endTime"
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose of Booking *</label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="Describe the purpose of this booking..."
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="expectedAttendees">Expected Attendees</label>
            <input
              id="expectedAttendees"
              type="number"
              name="expectedAttendees"
              value={formData.expectedAttendees}
              onChange={handleInputChange}
              min="1"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">Submit Booking</button>
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

      {/* Bookings List */}
      <div className="bookings-list">
        <h2>Your Bookings</h2>
        {bookings.length > 0 ? (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking._id}>
                    <td>{booking.resourceId}</td>
                    <td>{new Date(booking.startTime).toLocaleString()}</td>
                    <td>{new Date(booking.endTime).toLocaleString()}</td>
                    <td>{booking.purpose}</td>
                    <td>
                      <span className={`badge badge-${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCancel(booking._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No bookings yet. Create your first booking!</p>
        )}
      </div>
    </div>
  );
};

export default Bookings;
