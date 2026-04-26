import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceAPI } from '../services/api';
import '../styles/Resources.css';

const Resources = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchResources();
  }, [page]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await resourceAPI.getAll(page, 10);
      setResources(response.data.content || response.data);
      setTotalPages(response.data.totalPages || 1);
      setFilteredResources(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    applyFilters(value, filterType, filterStatus);
  };

  const handleFilterType = (value) => {
    setFilterType(value);
    applyFilters(searchTerm, value, filterStatus);
  };

  const handleFilterStatus = (value) => {
    setFilterStatus(value);
    applyFilters(searchTerm, filterType, value);
  };

  const applyFilters = (search, type, status) => {
    let filtered = resources;

    if (search) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type) {
      filtered = filtered.filter(r => r.type === type);
    }
 
    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }

    setFilteredResources(filtered);
  };

  const resourceTypes = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT', 'OTHER'];
  const statusTypes = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE', 'RETIRED'];

  if (loading && resources.length === 0) {
    return <div className="loading">Loading resources...</div>;
  }

  return (
    <div className="resources-container">
      <h1>Campus Resources</h1>

      {/* Filters */}
      <div className="filters-section">
        <input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />

        <select
          value={filterType}
          onChange={(e) => handleFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="">All Types</option>
          {resourceTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => handleFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          {statusTypes.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Resources Grid */}
      <div className="resources-grid">
        {filteredResources.length > 0 ? (
          filteredResources.map(resource => (
            <div key={resource._id} className="resource-card">
              {resource.imageUrl && (
                <img src={resource.imageUrl} alt={resource.name} className="resource-image" />
              )}
              <div className="resource-content">
                <h3>{resource.name}</h3>
                <p className="resource-description">{resource.description}</p>

                <div className="resource-details">
                  <div className="detail-item">
                    <span className="label">Type:</span>
                    <span>{resource.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Capacity:</span>
                    <span>{resource.capacity} people</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Location:</span>
                    <span>{resource.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`badge badge-${resource.status.toLowerCase()}`}>
                      {resource.status}
                    </span>
                  </div>
                </div>

                <div className="resource-contact">
                  {resource.contactPerson && (
                    <p><strong>Contact:</strong> {resource.contactPerson}</p>
                  )}
                  {resource.phoneNumber && (
                    <p><strong>Phone:</strong> {resource.phoneNumber}</p>
                  )}
                  {resource.email && (
                    <p><strong>Email:</strong> {resource.email}</p>
                  )}
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/bookings', { state: { resourceId: resource._id, resourceName: resource.name } })}
                >
                  Book Resource
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No resources found</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="page-info">Page {page + 1} of {totalPages}</span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Resources;
