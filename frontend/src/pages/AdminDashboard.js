import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { userAPI, bookingAPI, ticketAPI, resourceAPI } from '../services/api';
import ResourceQRPrint from './ResourceQRPrint';
import { RESOURCE_TYPES, formatResourceType } from '../config/resourceTypes';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  
  // Users Management
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ email: '', password: '', fullName: '', role: 'USER' });
  
  // Bookings Management
  const [bookings, setBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('PENDING');
  
  // Tickets Management
  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('OPEN');
  
  // Resources Management
  const [resources, setResources] = useState([]);
  const [resourceForm, setResourceForm] = useState({ id: null, name: '', type: '', location: '', description: '', capacity: '', status: 'ACTIVE' });
  const [isEditingResource, setIsEditingResource] = useState(false);
  const [qrResource, setQrResource] = useState(null); // resource to show QR for
  
  // Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [approvalReason, setApprovalReason] = useState('');

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    openTickets: 0,
    totalResources: 0,
  });

  // Fetch errors
  const [fetchError, setFetchError] = useState('');

  // Fetch Dashboard Data — each API fetched independently so one 403 doesn't kill the rest
  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    const errors = [];

    // ── Users (ADMIN only) ──
    try {
      const res = await userAPI.getAll();
      const data = Array.isArray(res.data) ? res.data : [];
      setUsers(data);
      setStats(s => ({ ...s, totalUsers: data.length }));
    } catch (e) {
      console.error('Users fetch error:', e.response?.status, e.response?.data || e.message);
      errors.push(`Users: ${e.response?.status || ''} ${e.response?.data?.message || e.message}`);
    }

    // ── Bookings ──
    try {
      const res = await bookingAPI.getAll();
      const data = res.data?.content || res.data || [];
      setBookings(Array.isArray(data) ? data : []);
      setStats(s => ({ ...s, totalBookings: Array.isArray(data) ? data.length : 0 }));
    } catch (e) {
      console.error('Bookings fetch error:', e.response?.status, e.response?.data || e.message);
      errors.push(`Bookings: ${e.response?.status || ''} ${e.response?.data?.message || e.message}`);
    }

    // ── Tickets ──
    try {
      const res = await ticketAPI.getAll();
      const data = res.data?.content || res.data || [];
      const arr = Array.isArray(data) ? data : [];
      setTickets(arr);
      setStats(s => ({ ...s, openTickets: arr.filter(t => t.status === 'OPEN').length }));
    } catch (e) {
      console.error('Tickets fetch error:', e.response?.status, e.response?.data || e.message);
      errors.push(`Tickets: ${e.response?.status || ''} ${e.response?.data?.message || e.message}`);
    }

    // ── Resources ──
    try {
      const res = await resourceAPI.getAll();
      const data = res.data?.content || res.data || [];
      const arr = Array.isArray(data) ? data : [];
      setResources(arr);
      setStats(s => ({ ...s, totalResources: arr.length }));
    } catch (e) {
      console.error('Resources fetch error:', e.response?.status, e.response?.data || e.message);
      errors.push(`Resources: ${e.response?.status || ''} ${e.response?.data?.message || e.message}`);
    }

    if (errors.length > 0) {
      setFetchError(`Some data could not be loaded — ${errors.join(' | ')}`);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // Listen for resource create/update/delete events to keep dashboard in sync
  useEffect(() => {
    const handleResourcesUpdated = () => {
      fetchData();
    };

    window.addEventListener('resources-updated', handleResourcesUpdated);
    return () => window.removeEventListener('resources-updated', handleResourcesUpdated);
  }, [fetchData]);

  // Check for booking time conflicts
  const hasBookingConflict = (newBooking, existingBookings) => {
    return existingBookings.some(booking => {
      if (booking.id === newBooking.id || booking.status === 'REJECTED') return false;
      
      const newStart = new Date(newBooking.startTime || newBooking.startDateTime);
      const newEnd = new Date(newBooking.endTime || newBooking.endDateTime);
      const existStart = new Date(booking.startTime || booking.startDateTime);
      const existEnd = new Date(booking.endTime || booking.endDateTime);
      
      // Check if same resource and overlapping time
      return booking.resourceId === newBooking.resourceId &&
             !(newEnd <= existStart || newStart >= existEnd);
    });
  };

  // Handle Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!userForm.email || !userForm.password || !userForm.fullName) {
      alert('Please fill in all fields');
      return;
    }

    try {
      console.log('Creating user:', userForm);
      alert('User creation feature would be implemented with backend support');
      setUserForm({ email: '', password: '', fullName: '', role: 'USER' });
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await userAPI.delete(userId);
      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  // Handle Approve Booking
  const handleApproveBooking = async (booking) => {
    if (hasBookingConflict(booking, bookings)) {
      alert('⚠️ Booking conflict detected! Another booking exists for this resource at the same time.');
      return;
    }

    try {
      await bookingAPI.approve(
        booking.id,
        approvalReason,
        user?.id || user?.email || 'admin'
      );
      setBookings(bookings.map(b => 
        b.id === booking.id ? { ...b, status: 'APPROVED', approvalReason: approvalReason } : b
      ));
      setShowBookingModal(false);
      setApprovalReason('');
      alert('✅ Booking approved successfully');
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Failed to approve booking: ' + (error.response?.data?.error || error.response?.data || error.message));
    }
  };

  // Handle Reject Booking
  const handleRejectBooking = async (booking) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) return;

    if (!approvalReason?.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await bookingAPI.reject(booking.id, approvalReason.trim());
      setBookings(bookings.map(b => 
        b.id === booking.id ? { ...b, status: 'REJECTED', rejectionReason: approvalReason } : b
      ));
      setApprovalReason('');
      alert('Booking rejected');
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to reject booking: ' + (error.response?.data?.error || error.response?.data || error.message));
    }
  };

  // Handle Update Booking Status
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      if (newStatus === 'APPROVED') {
        await bookingAPI.approve(bookingId, approvalReason, user?.id || user?.email || 'admin');
      } else if (newStatus === 'REJECTED') {
        const reason = window.prompt('Enter rejection reason:') || approvalReason;
        if (!reason?.trim()) {
          alert('Rejection reason is required');
          return;
        }
        await bookingAPI.reject(bookingId, reason.trim());
      } else if (newStatus === 'CANCELLED') {
        await bookingAPI.cancel(bookingId);
      } else {
        await bookingAPI.update(bookingId, { status: newStatus });
      }

      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));
      console.log(`Booking ${bookingId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status: ' + error.message);
    }
  };

  // Handle Approve Ticket
  const handleApproveTicket = async (ticket) => {
    try {
      setTickets(tickets.map(t => 
        t.id === ticket.id ? { ...t, status: 'IN_PROGRESS' } : t
      ));
      alert('✅ Ticket approved and assigned');
    } catch (error) {
      console.error('Error approving ticket:', error);
      alert('Failed to approve ticket');
    }
  };

  // Handle Reject Ticket
  const handleRejectTicket = async (ticket) => {
    if (!window.confirm('Are you sure you want to reject this ticket?')) return;

    try {
      setTickets(tickets.map(t => 
        t.id === ticket.id ? { ...t, status: 'CLOSED' } : t
      ));
      alert('Ticket rejected and closed');
    } catch (error) {
      console.error('Error rejecting ticket:', error);
      alert('Failed to reject ticket');
    }
  };

  // Handle Add/Update Resource
  const handleSaveResource = async (e) => {
    e.preventDefault();
    if (!resourceForm.name || !resourceForm.type || !resourceForm.location || resourceForm.capacity === '') {
      alert('❌ Missing required fields: Name, Type, Location, and Capacity');
      return;
    }

    try {
      const formData = {
        name: resourceForm.name,
        type: resourceForm.type,
        location: resourceForm.location,
        capacity: parseInt(resourceForm.capacity, 10),
        description: resourceForm.description || '',
        status: resourceForm.status
      };

      if (isEditingResource) {
        // UPDATE existing resource
        const response = await resourceAPI.update(resourceForm._id || resourceForm.id, formData);
        setResources(resources.map(r => 
          (r._id || r.id) === (resourceForm._id || resourceForm.id) ? response.data : r
        ));
        alert('✅ Resource updated successfully');
      } else {
        // CREATE new resource
        const response = await resourceAPI.create(formData);
        console.log('New resource response:', response);
        console.log('Response data:', response.data);
        console.log('Current resources before add:', resources);
        const updatedResources = [...resources, response.data];
        console.log('Updated resources after add:', updatedResources);
        setResources(updatedResources);
        
        // Also fetch fresh data from server to ensure sync
        setTimeout(async () => {
          try {
            const freshRes = await resourceAPI.getAll(0, 10);
            const freshData = freshRes.data?.content || freshRes.data || [];
            console.log('Fresh resources from server:', freshData);
            setResources(freshData);
          } catch (err) {
            console.error('Error refreshing resources:', err);
          }
        }, 500);
        
        alert('✅ Resource added successfully');
      }
      setResourceForm({ id: null, name: '', type: '', location: '', description: '', capacity: '', status: 'ACTIVE' });
      setIsEditingResource(false);
    } catch (error) {
      console.error('Error saving resource:', error);
      const errorMsg = error.response?.data?.errors ? Object.entries(error.response.data.errors).map(([k, v]) => `${k}: ${v}`).join(', ') : (error.response?.data?.message || error.message);
      alert('❌ Failed to save resource: ' + errorMsg);
    }
  };

  // Handle Edit Resource
  const handleEditResource = (resource) => {
    setResourceForm(resource);
    setIsEditingResource(true);
  };

  // Handle Delete Resource
  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      // Use _id for MongoDB, fallback to id if needed
      const id = resourceId._id || resourceId;
      await resourceAPI.delete(id);
      setResources(resources.filter(r => (r._id || r.id) !== id));
      alert('✅ Resource deleted successfully');
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle Delete Booking
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      const id = typeof bookingId === 'object' ? (bookingId?.id || bookingId?._id) : bookingId;
      if (!id) {
        alert('Failed to delete booking: Invalid booking ID');
        return;
      }
      await bookingAPI.delete(id);
      setBookings(bookings.filter(b => (b._id || b.id) !== id));
      alert('✅ Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle Delete Ticket
  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
      const id = ticketId._id || ticketId;
      await ticketAPI.delete(id);
      setTickets(tickets.filter(t => (t._id || t.id) !== id));
      alert('✅ Ticket deleted successfully');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('Failed to delete ticket: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading && activeTab === 'dashboard') {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Top Navigation Bar */}
      <div className="admin-top-nav">
        <div className="admin-panel-title">Admin Panel</div>
        
        <div className="admin-nav">
          <button 
            className={`admin-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            Tickets
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </button>
        </div>

        {/* Welcome Message and Logout */}
        <div className="admin-welcome-section">
          <div className="admin-welcome-text">
            Welcome, {user?.fullName || 'Admin'}
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Content Area Starts Here */}

      {/* Content Areas */}
      <div className="admin-content">

        {/* Error Banner */}
        {fetchError && (
          <div className="admin-fetch-error">
            <span>⚠️ {fetchError}</span>
            <button className="btn-small btn-primary" onClick={fetchData} style={{ marginLeft: 16 }}>
              🔄 Retry
            </button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="admin-section">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">{stats.totalUsers}</p>
              </div>
              <div className="stat-card">
                <h3>Total Bookings</h3>
                <p className="stat-number">{stats.totalBookings}</p>
              </div>
              <div className="stat-card">
                <h3>Open Tickets</h3>
                <p className="stat-number">{stats.openTickets}</p>
              </div>
              <div className="stat-card">
                <h3>Total Resources</h3>
                <p className="stat-number">{stats.totalResources}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <h2>User Management</h2>
            
            <div className="admin-form">
              <h3>Create New User</h3>
              <form onSubmit={handleCreateUser}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={userForm.fullName}
                      onChange={(e) => setUserForm({...userForm, fullName: e.target.value})}
                      placeholder="Full Name"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                      placeholder="Password"
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-success">Create User</button>
              </form>
            </div>

            <div className="admin-table">
              <h3>All Users</h3>
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map(user => (
                      <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>{user.fullName}</td>
                        <td><span className="badge badge-role">{user.role}</span></td>
                        <td>{user.department || 'N/A'}</td>
                        <td>{user.phoneNumber || 'N/A'}</td>
                        <td><span className={`status ${user.active ? 'active' : 'inactive'}`}>{user.active ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <button 
                            className="btn btn-delete btn-sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="7" className="text-center">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="admin-section">
            <h2>Booking Management & Approval</h2>
            
            <div className="filter-group">
              <label>Filter by Status:</label>
              <select value={bookingFilter} onChange={(e) => setBookingFilter(e.target.value)}>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="ALL">All Bookings</option>
              </select>
            </div>

            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Resource</th>
                    <th>User</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length > 0 ? (
                    bookings
                      .filter(b => bookingFilter === 'ALL' || b.status === bookingFilter)
                      .map(booking => (
                      <tr key={booking.id}>
                        <td>{booking.id?.substring(0, 8)}...</td>
                        <td>{booking.resourceId}</td>
                        <td>{booking.userId}</td>
                        <td>{new Date(booking.startTime || booking.startDateTime).toLocaleString()}</td>
                        <td>{new Date(booking.endTime || booking.endDateTime).toLocaleString()}</td>
                        <td>
                          <select 
                            value={booking.status}
                            onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                            className="status-dropdown"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                              backgroundColor: 
                                booking.status === 'APPROVED' ? '#d4edda' :
                                booking.status === 'PENDING' ? '#fff3cd' :
                                booking.status === 'REJECTED' ? '#f8d7da' :
                                '#ffffff'
                            }}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </td>
                        <td>
                          {booking.status === 'PENDING' ? (
                            <>
                              <button 
                                className="btn-small btn-success" 
                                onClick={() => handleUpdateBookingStatus(booking.id, 'APPROVED')}
                              >
                                Quick Approve
                              </button>
                            </>
                          ) : (
                            <button className="btn-small btn-danger" onClick={() => handleDeleteBooking(booking.id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="7" className="text-center">No bookings found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="admin-section">
            <h2>Ticket Management & Approval</h2>
            
            <div className="filter-group">
              <label>Filter by Status:</label>
              <select value={ticketFilter} onChange={(e) => setTicketFilter(e.target.value)}>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length > 0 ? (
                    tickets
                      .filter(t => ticketFilter === 'ALL' || t.status === ticketFilter)
                      .map(ticket => (
                      <tr key={ticket.id}>
                        <td>{ticket.id?.substring(0, 8)}...</td>
                        <td>{ticket.title}</td>
                        <td>{ticket.category}</td>
                        <td><span className={`priority ${ticket.priority?.toLowerCase()}`}>{ticket.priority}</span></td>
                        <td><span className={`status ${ticket.status?.toLowerCase()}`}>{ticket.status}</span></td>
                        <td>{ticket.createdBy}</td>
                        <td>
                          {ticket.status === 'OPEN' ? (
                            <>
                              <button 
                                className="btn-small btn-success" 
                                onClick={() => handleApproveTicket(ticket)}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn-small btn-danger" 
                                onClick={() => handleRejectTicket(ticket)}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button className="btn-small btn-danger" onClick={() => handleDeleteTicket(ticket.id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="7" className="text-center">No tickets found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="admin-section">
            <h2>Resource Management</h2>
            
            <div className="admin-form">
              <h3>{isEditingResource ? 'Edit Resource' : 'Add New Resource'}</h3>
              <form onSubmit={handleSaveResource}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Resource Name</label>
                    <input
                      type="text"
                      value={resourceForm.name}
                      onChange={(e) => setResourceForm({...resourceForm, name: e.target.value})}
                      placeholder="e.g., Meeting Room A"
                    />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={resourceForm.type}
                      onChange={(e) => setResourceForm({...resourceForm, type: e.target.value})}
                    >
                      <option value="">Select Type</option>
                      {RESOURCE_TYPES.map(type => (
                        <option key={type} value={type}>{formatResourceType(type)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      value={resourceForm.location}
                      onChange={(e) => setResourceForm({...resourceForm, location: e.target.value})}
                      placeholder="e.g., Building A, Floor 2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={resourceForm.description}
                      onChange={(e) => setResourceForm({...resourceForm, description: e.target.value})}
                      placeholder="Optional description"
                      rows="2"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Capacity *</label>
                    <input
                      type="number"
                      value={resourceForm.capacity}
                      onChange={(e) => setResourceForm({...resourceForm, capacity: e.target.value})}
                      placeholder="e.g., 20"
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={resourceForm.status}
                      onChange={(e) => setResourceForm({...resourceForm, status: e.target.value})}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="OUT_OF_SERVICE">Out of Service</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="RETIRED">Retired</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-success">
                    {isEditingResource ? 'Update Resource' : 'Add Resource'}
                  </button>
                  {isEditingResource && (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setResourceForm({ id: null, name: '', type: '', location: '', description: '', capacity: '', status: 'ACTIVE' });
                        setIsEditingResource(false);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-table">
              <p style={{color: '#666', fontSize: '12px', marginBottom: '10px'}}>Total Resources: <strong>{resources.length}</strong></p>
              <table>
                <thead>
                  <tr>
                    <th>Resource ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Capacity</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.length > 0 ? (
                    resources.map(resource => (
                      <tr key={resource._id || resource.id}>
                        <td>{(resource._id || resource.id)?.substring(0, 8)}...</td>
                        <td>{resource.name}</td>
                        <td>{resource.type}</td>
                        <td>{resource.location || 'N/A'}</td>
                        <td>{resource.capacity || 'N/A'}</td>
                        <td>{resource.description || 'N/A'}</td>
                        <td><span className={`status ${resource.status?.toLowerCase()}`}>{resource.status}</span></td>
                        <td>
                          <button className="btn-small btn-primary" onClick={() => handleEditResource(resource)}>Edit</button>
                          <button className="btn-small btn-danger" onClick={() => handleDeleteResource(resource.id)}>Delete</button>
                          <button className="btn-small btn-qr" onClick={() => setQrResource(resource)} title="Print QR Code for this resource">🖨️ Print QR</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="8" className="text-center">No resources found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Resource QR Print Modal */}
      {qrResource && (
        <ResourceQRPrint
          resource={qrResource}
          onClose={() => setQrResource(null)}
        />
      )}

      {/* Booking Approval Modal */}
      {showBookingModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Approve Booking</h2>
              <button className="modal-close" onClick={() => setShowBookingModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="booking-details">
                <p><strong>Resource:</strong> {selectedBooking.resourceId}</p>
                <p><strong>User:</strong> {selectedBooking.userId}</p>
                <p><strong>Start Date:</strong> {new Date(selectedBooking.startTime || selectedBooking.startDateTime).toLocaleString()}</p>
                <p><strong>End Date:</strong> {new Date(selectedBooking.endTime || selectedBooking.endDateTime).toLocaleString()}</p>
              </div>
              <div className="form-group">
                <label>Approval Notes (Optional)</label>
                <textarea
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  placeholder="Add any notes or conditions for this approval..."
                  rows="4"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-success" onClick={() => handleApproveBooking(selectedBooking)}>
                Approve Booking
              </button>
              <button className="btn btn-secondary" onClick={() => setShowBookingModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;