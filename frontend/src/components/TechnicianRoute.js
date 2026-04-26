import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const TechnicianRoute = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role !== 'TECHNICIAN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default TechnicianRoute;
