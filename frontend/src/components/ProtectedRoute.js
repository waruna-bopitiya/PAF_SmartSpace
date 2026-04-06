import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // Check both context state and localStorage for token
  const jwtToken = localStorage.getItem('jwtToken');
  const hasValidAuth = isAuthenticated || !!jwtToken;

  if (hasValidAuth) {
    return children;
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;