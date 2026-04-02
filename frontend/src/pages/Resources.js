import React, { useEffect, useState } from 'react';
import { resourceAPI } from '../services/api';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    type: '',
    minCapacity: '',
    location: '',
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await resourceAPI.getAll();
      setResources(response.data);
    } catch (err) {
      setError('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await resourceAPI.search(searchParams);
      setResources(response.data);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resources-page">
      <h1>Available Resources</h1>

      <form onSubmit={handleSearch} className="search-form card">
        <div className="form-group">
          <label>Type</label>
          <select
            value={searchParams.type}
            onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>

        <div className="form-group">
          <label>Min Capacity</label>
          <input
            type="number"
            value={searchParams.minCapacity}
            onChange={(e) => setSearchParams({ ...searchParams, minCapacity: e.target.value })}
            placeholder="Minimum capacity"
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={searchParams.location}
            onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
            placeholder="Search by location"
          />
        </div>

        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading resources...</p>
        </div>
      ) : (
        <div className="resources-grid">
          {resources.map((resource) => (
            <div key={resource.id} className="resource-card card">
              <h3>{resource.name}</h3>
              <p className="resource-type">Type: {resource.type}</p>
              <p className="resource-capacity">Capacity: {resource.capacity} people</p>
              <p className="resource-location">Location: {resource.location}</p>
              <p className="resource-status" style={{
                color: resource.status === 'ACTIVE' ? 'green' : 'red'
              }}>Status: {resource.status}</p>
              <button className="btn btn-primary">Book Now</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;
