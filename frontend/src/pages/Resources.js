import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceAPI } from '../services/api';
import { RESOURCE_TYPES, formatResourceType } from '../config/resourceTypes';
import { getResourceTypeImage } from '../config/resourceImages';
import '../styles/Resources.css';

const Resources = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCapacity, setFilterCapacity] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [imageErrors, setImageErrors] = useState({});
  const [imageFallbacks, setImageFallbacks] = useState({});

  useEffect(() => {
    fetchResources();
  }, [page]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await resourceAPI.getAll(page, 10);
      const data = response.data.content || response.data;
      setResources(data);
      setTotalPages(response.data.totalPages || 1);
      setFilteredResources(data);
      setImageErrors({});
      setImageFallbacks({});
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter(r => r.type === filterType);
    }

    if (filterStatus) {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    if (filterCapacity) {
      filtered = filtered.filter(r => r.capacity >= parseInt(filterCapacity, 10));
    }

    if (filterLocation) {
      filtered = filtered.filter(r => r.location?.toLowerCase().includes(filterLocation.toLowerCase()));
    }

    if (filterAvailability === 'WEEKDAY') {
      filtered = filtered.filter(r => r.weekdayOpenTime);
    } else if (filterAvailability === 'WEEKEND') {
      filtered = filtered.filter(r => r.weekendOpenTime);
    }

    setFilteredResources(filtered);
  }, [resources, searchTerm, filterType, filterStatus, filterCapacity, filterLocation, filterAvailability]);

  const getTypeColor = (type) => {
    const colors = {
      'LECTURE_HALL': '#3b82f6',
      'LAB': '#8b5cf6',
      'MEETING_ROOM': '#ec4899',
      'EQUIPMENT': '#f59e0b',
      'OUTDOOR_SPACE': '#16a34a',
      'OTHER': '#6b7280'
    };
    return colors[type] || '#6b7280';
  };

  const getResourceId = (resource) => resource.id || resource._id || resource.name;

  const handleImageError = (resource) => {
    const resourceId = getResourceId(resource);

    if (resource.imageUrl && !imageFallbacks[resourceId]) {
      setImageFallbacks(prev => ({ ...prev, [resourceId]: true }));
      return;
    }

    setImageErrors(prev => ({ ...prev, [resourceId]: true }));
  };

  const getResourceImage = (resource) => {
    const resourceId = getResourceId(resource);

    if (resource.imageUrl && !imageFallbacks[resourceId]) {
      return resource.imageUrl;
    }

    return getResourceTypeImage(resource.type).url;
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'ACTIVE': 'status-active',
      'MAINTENANCE': 'status-maintenance',
      'OUT_OF_SERVICE': 'status-inactive',
      'RETIRED': 'status-retired'
    };
    return statusMap[status] || 'status-inactive';
  };

  const resourceTypes = RESOURCE_TYPES;
  const statusTypes = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE', 'RETIRED'];
  const activeCount = resources.filter(r => r.status === 'ACTIVE').length;

  if (loading && resources.length === 0) {
    return (
      <div className="resources-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading campus resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resources-container">
      {/* Hero Header */}
      <div className="resources-hero">
        <div className="hero-content">
          <h1 className="hero-title">Campus Resources</h1>
          <p className="hero-subtitle">Discover and book available facilities, equipment, and spaces</p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-number">{resources.length}</div>
            <div className="stat-text">Total Resources</div>
          </div>
          <div className="stat-card active">
            <div className="stat-number">{activeCount}</div>
            <div className="stat-text">Available Now</div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filters-wrapper">
        <div className="search-container">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12.5 12.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search resources by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-main"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filters-row" style={{ flexWrap: 'wrap', gap: '15px' }}>
          <div className="filter-item">
            <label className="filter-label">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select-modern"
            >
              <option value="">All Types</option>
              {resourceTypes.map(type => (
                <option key={type} value={type}>
                  {formatResourceType(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select-modern"
            >
              <option value="">All Status</option>
              {statusTypes.map(status => (
                <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Min Capacity</label>
            <input
              type="number"
              value={filterCapacity}
              onChange={(e) => setFilterCapacity(e.target.value)}
              className="filter-select-modern"
              placeholder="e.g. 10"
              style={{ width: '100px' }}
            />
          </div>

          <div className="filter-item">
            <label className="filter-label">Location</label>
            <input
              type="text"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="filter-select-modern"
              placeholder="e.g. Building A"
            />
          </div>

          <div className="filter-item">
            <label className="filter-label">Availability</label>
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="filter-select-modern"
            >
              <option value="">Any Time</option>
              <option value="WEEKDAY">Weekdays</option>
              <option value="WEEKEND">Weekends</option>
            </select>
          </div>

          {(searchTerm || filterType || filterStatus || filterCapacity || filterLocation || filterAvailability) && (
            <button
              className="reset-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setFilterType('');
                setFilterStatus('');
                setFilterCapacity('');
                setFilterLocation('');
                setFilterAvailability('');
              }}
              style={{ marginTop: 'auto', marginBottom: '4px' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="resources-content">
        {filteredResources.length > 0 ? (
          <div className="resources-grid">
            {filteredResources.map(resource => (
              <div key={getResourceId(resource)} className="resource-card-modern">
                {/* Card Header with Image or Placeholder */}
                <div className="card-image-container">
                  {!imageErrors[getResourceId(resource)] ? (
                    <img
                      src={getResourceImage(resource)}
                      alt={resource.name}
                      className="card-image"
                      loading="lazy"
                      onError={() => handleImageError(resource)}
                    />
                  ) : (
                    <div className="card-placeholder" style={{ backgroundColor: getTypeColor(resource.type) }}>
                      <span className="placeholder-text">Image unavailable</span>
                    </div>
                  )}
                  <div className="card-badges">
                    <span
                      className="type-badge"
                      style={{ backgroundColor: getTypeColor(resource.type) }}
                    >
                      {formatResourceType(resource.type)}
                    </span>
                    <span className={`status-badge ${getStatusBadgeClass(resource.status)}`}>
                      {resource.status}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="card-body">
                  <h3 className="resource-name">{resource.name}</h3>
                  {resource.description && (
                    <p className="resource-desc">{resource.description}</p>
                  )}

                  {/* Resource Details */}
                  <div className="resource-info-grid">
                    {resource.capacity && (
                      <div className="info-item">
                        <span className="info-icon">👥</span>
                        <div>
                          <span className="info-label">Capacity</span>
                          <span className="info-value">{resource.capacity} people</span>
                        </div>
                      </div>
                    )}
                    {resource.location && (
                      <div className="info-item">
                        <span className="info-icon">📍</span>
                        <div>
                          <span className="info-label">Location</span>
                          <span className="info-value">{resource.location}</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Card Footer */}
                <div className="card-footer">
                  <button
                    className="btn-book"
                    onClick={() => navigate('/bookings', { state: { resourceId: resource._id, resourceName: resource.name } })}
                  >
                    📅 Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No Resources Found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button
              className="btn-reset"
              onClick={() => {
                setSearchTerm('');
                setFilterType('');
                setFilterStatus('');
                setFilterCapacity('');
                setFilterLocation('');
                setFilterAvailability('');
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-wrapper">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="pagination-btn prev-btn"
          >
            ← Previous
          </button>

          <div className="pagination-info">
            <span className="page-number">Page {page + 1}</span>
            <span className="page-divider">/</span>
            <span className="page-total">{totalPages}</span>
          </div>

          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="pagination-btn next-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Resources;
