import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../services/api';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data);
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bookings-page">
      <h1>My Bookings</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      ) : (
        <table className="table">
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
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.resourceId}</td>
                <td>{new Date(booking.startTime).toLocaleString()}</td>
                <td>{new Date(booking.endTime).toLocaleString()}</td>
                <td>{booking.purpose}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: booking.status === 'APPROVED' ? '#d4edda' : '#fff3cd'
                  }}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  {booking.status === 'APPROVED' && (
                    <button className="btn btn-danger" onClick={() => handleCancel(booking.id)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  async function handleCancel(id) {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingAPI.cancel(id);
        fetchBookings();
      } catch (err) {
        setError('Failed to cancel booking');
      }
    }
  }
};

export default Bookings;
