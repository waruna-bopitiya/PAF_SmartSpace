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
    bookingDate: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 1,
  });

  const generateTimeSlots = () => {
    const slots = [];
    let current = new Date();
    current.setHours(7, 45, 0, 0); // Start at 7:45 AM
    const end = new Date();
    end.setHours(20, 30, 0, 0); // End at 8:30 PM

    while (current <= end) {
      const h = current.getHours().toString().padStart(2, '0');
      const m = current.getMinutes().toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      current.setMinutes(current.getMinutes() + 15);
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  const generateDates = () => {
    const dates = [];
    let d = new Date();
    for (let i = 0; i < 14; i++) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return dates;
  };
  const availableDates = generateDates();

  const handleDateChange = (dateStr) => {
    setFormData(prev => ({ ...prev, bookingDate: dateStr, startTime: '', endTime: '' }));
  };

  const isTimeDisabled = (timeStr) => {
    if (!formData.bookingDate) return false;
    const now = new Date();
    const slotDateTime = new Date(`${formData.bookingDate}T${timeStr}:00`);
    return slotDateTime < now;
  };

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return null;
    const [startH, startM] = formData.startTime.split(':').map(Number);
    const [endH, endM] = formData.endTime.split(':').map(Number);
    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    
    if (totalMinutes <= 0) return null;
    
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    
    if (h === 0) return `${m} mins`;
    if (m === 0) return `${h} hr${h > 1 ? 's' : ''}`;
    return `${h} hr${h > 1 ? 's' : ''} ${m} mins`;
  };
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBookingQR, setSelectedBookingQR] = useState(null);

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

    if (!formData.bookingDate) {
      setError('Please select a date');
      return;
    }

    // Validate times
    const startDateTimeStr = `${formData.bookingDate}T${formData.startTime}:00`;
    const endDateTimeStr = `${formData.bookingDate}T${formData.endTime}:00`;

    const startDate = new Date(startDateTimeStr);
    const endDate = new Date(endDateTimeStr);
    
    if (endDate <= startDate) {
      setError('End time must be after start time');
      return;
    }

    if (!user?.id) {
      setError('User information not available. Please refresh and try again.');
      return;
    }

    try {
      const payload = {
        resourceId: formData.resourceId,
        startTime: startDateTimeStr,
        endTime: endDateTimeStr,
        purpose: formData.purpose,
        expectedAttendees: formData.expectedAttendees,
        userId: user?.id,
      };

      console.log('Submitting booking payload:', payload);

      // Try to create the booking
      const response = await bookingAPI.create(payload);
      
      console.log('Booking response:', response);

      if (response && (response.status === 201 || response.status === 200)) {
        setSuccess('Booking request submitted successfully!');
        setFormData({
          resourceId: '',
          bookingDate: new Date().toISOString().split('T')[0],
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

  const handleShowQRCode = async (booking) => {
    try {
      // Log the booking object for debugging
      console.log('=== QR Code Debug ===');
      console.log('Full booking object:', booking);
      console.log('booking.id:', booking.id);
      console.log('booking._id:', booking._id);
      
      // Get booking ID (handle both _id and id formats)
      const bookingId = booking.id || booking._id;
      console.log('Using bookingId:', bookingId);
      
      if (!bookingId) {
        throw new Error('Booking ID is missing. Unable to fetch QR code.');
      }
      
      // Fetch QR code if not already present
      if (!booking.qrCode) {
        console.log('API call: GET /bookings/' + bookingId + '/qr-code');
        const response = await bookingAPI.getQRCode(bookingId);
        console.log('QR code response received:', response.data);
        booking.qrCode = response.data.qrCode;
      } else {
        console.log('QR code already present, using cached value');
      }
      
      // Ensure booking has the ID field set
      if (!booking.id && booking._id) {
        booking.id = booking._id;
      }
      
      console.log('Setting selected booking QR:', booking);
      setSelectedBookingQR(booking);
      setShowQRModal(true);
    } catch (error) {
      console.error('=== Error fetching QR code ===');
      console.error('Error message:', error.message);
      console.error('Error object:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request URL:', error.config?.url);
      console.error('Request headers:', error.config?.headers);
      
      // More specific error messages
      let errorMessage = 'Failed to load QR code. Please try again.';
      if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Booking not found. It may have been deleted.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
    }
  };

  const handleDownloadQRCode = () => {
    if (!selectedBookingQR?.qrCode) return;

    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = selectedBookingQR.qrCode;
    link.download = `booking-${selectedBookingQR.id}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintQRCode = () => {
    if (!selectedBookingQR?.qrCode) return;

    // Open print dialog
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Booking QR Code - ${selectedBookingQR.id}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            img {
              max-width: 400px;
              margin: 20px 0;
            }
            h2 { color: #333; margin: 10px 0; }
            p { color: #666; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>Booking QR Code</h2>
            <img src="${selectedBookingQR.qrCode}" alt="QR Code" />
            <p>Booking ID: ${selectedBookingQR.id}</p>
            <p>Resource: ${selectedBookingQR.resourceId}</p>
            <p>Date: ${new Date(selectedBookingQR.startTime).toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
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

      {/* Booking Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form 
            onSubmit={handleSubmit} 
            className="booking-form-modal"
            onClick={(e) => e.stopPropagation()} /* Prevent click from closing modal */
          >
            <h2>Create New Booking</h2>

            <div className="form-group">
              <label>Booking Date *</label>
              <div className="date-selector-strip">
                {availableDates.map(date => {
                  const dateString = date.toISOString().split('T')[0];
                  const isSelected = formData.bookingDate === dateString;
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = date.getDate();
                  const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                  return (
                    <button
                      key={dateString}
                      type="button"
                      className={`date-box ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleDateChange(dateString)}
                    >
                      <span className="day-name">{dayName}</span>
                      <span className="day-num">{dayNum}</span>
                      <span className="month-name">{monthName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="resourceId">Select Resource *</label>
              <select
                id="resourceId"
                name="resourceId"
                value={formData.resourceId}
                onChange={handleInputChange}
                required
                className="modern-select"
              >
                <option value="">Choose a resource...</option>
                {resources.map(resource => (
                  <option key={resource._id} value={resource._id}>
                    {resource.name} - {resource.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row time-selectors">
              <div className="form-group">
                <label>Start Time *</label>
                <div className="time-grid-container">
                  {timeSlots.map(time => {
                    const disabled = isTimeDisabled(time);
                    return (
                      <button
                        key={`start-${time}`}
                        type="button"
                        className={`time-box ${formData.startTime === time ? 'selected' : ''}`}
                        onClick={() => !disabled && setFormData(prev => ({...prev, startTime: time}))}
                        disabled={disabled}
                        title={disabled ? 'Time has already passed' : ''}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label>End Time *</label>
                <div className="time-grid-container">
                  {timeSlots.map(time => {
                    const disabled = isTimeDisabled(time);
                    return (
                      <button
                        key={`end-${time}`}
                        type="button"
                        className={`time-box ${formData.endTime === time ? 'selected' : ''}`}
                        onClick={() => !disabled && setFormData(prev => ({...prev, endTime: time}))}
                        disabled={disabled}
                        title={disabled ? 'Time has already passed' : ''}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          {calculateDuration() && (
            <div className="duration-display">
              <span className="duration-icon">⏱️</span>
              <span className="duration-text">
                Duration: <strong>{calculateDuration()}</strong>
              </span>
            </div>
          )}

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
        </div>
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
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleShowQRCode(booking)}
                          title="View QR Code"
                        >
                          📱 QR Code
                        </button>
                        {booking.status === 'PENDING' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleCancel(booking._id || booking.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No bookings yet. Create your first booking!</p>
        )}

        {/* QR Code Modal */}
        {showQRModal && selectedBookingQR && (
          <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
            <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h4>Booking QR Code</h4>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowQRModal(false)}
                  aria-label="Close"
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body" style={{ textAlign: 'center' }}>
                {selectedBookingQR.qrCode ? (
                  <>
                    <img
                      src={selectedBookingQR.qrCode}
                      alt="Booking QR Code"
                      style={{ maxWidth: '300px', width: '100%', marginBottom: '20px' }}
                    />
                    <div className="booking-details" style={{ marginBottom: '20px', textAlign: 'left' }}>
                      <p><strong>Booking ID:</strong> {selectedBookingQR.id || selectedBookingQR._id}</p>
                      <p><strong>Resource:</strong> {selectedBookingQR.resourceId}</p>
                      <p>
                        <strong>Date:</strong> {new Date(selectedBookingQR.startTime).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Time:</strong> {new Date(selectedBookingQR.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} - {new Date(selectedBookingQR.endTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p><strong>Status:</strong> <span className={`badge badge-${getStatusColor(selectedBookingQR.status)}`}>
                        {selectedBookingQR.status}
                      </span></p>
                      {selectedBookingQR.qrCodeVerified && (
                        <p>
                          <strong>✓ Verified on:</strong> {new Date(selectedBookingQR.qrCodeVerificationTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p style={{ color: '#666', marginBottom: '10px' }}>QR code is being generated...</p>
                    <div style={{ display: 'inline-block', padding: '20px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #3498db',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={handleDownloadQRCode}
                  disabled={!selectedBookingQR.qrCode}
                >
                  📥 Download
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handlePrintQRCode}
                  disabled={!selectedBookingQR.qrCode}
                >
                  🖨️ Print
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowQRModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
