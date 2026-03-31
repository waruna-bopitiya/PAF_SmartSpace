import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Validate token with backend
          const response = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/auth/me`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUser(response.data);
          setIsAuthenticated(true);
          setError(null);
        } catch (err) {
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback((email, fullName, token, role = 'USER') => {
    if (token && email) {
      localStorage.setItem('authToken', token);
      const userData = {
        email,
        fullName: fullName || 'User',
        id: email, // Use email as ID temporarily
        role: role || 'USER',
      };
      setUser(userData);
      setIsAuthenticated(true);
      setError(null);
    } else {
      console.error('Login called with invalid parameters:', { email, token });
      setError('Invalid login parameters');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const handleGoogleLogin = useCallback((googleResponse) => {
    // Google OAuth2 token will be handled by backend redirect
    const token = googleResponse?.credential;
    if (token) {
      localStorage.setItem('authToken', token);
      // Redirect to auth/callback endpoint
      window.location.href = `${process.env.REACT_APP_API_BASE_URL}/auth/google/callback`;
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    handleGoogleLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
