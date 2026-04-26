import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is not admin (or role is not ADMIN), redirect to user dashboard
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // User is admin, allow access to admin dashboard
  return children;
};

export default AdminRoute;
