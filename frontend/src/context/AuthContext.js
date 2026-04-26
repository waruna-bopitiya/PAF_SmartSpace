import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const normalizeApiBaseUrl = (baseUrl) => {
  const fallback = 'http://localhost:8080/api';
  if (!baseUrl || typeof baseUrl !== 'string') {
    return fallback;
  }

  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) {
    return trimmed;
  }

  return `${trimmed}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(process.env.REACT_APP_API_BASE_URL);

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
            `${API_BASE_URL}/auth/me`,
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
      const fallbackUser = {
        email,
        fullName: fullName || 'User',
        id: email, // Use email as ID temporarily
        role: role || 'USER',
      };
      setUser(fallbackUser);
      setIsAuthenticated(true);
      setError(null);

      // Refresh user with full database-backed profile (real id, role, etc.)
      axios.get(
        `${API_BASE_URL}/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then((response) => {
        const dbUser = response.data || {};
        setUser({
          ...fallbackUser,
          ...dbUser,
          email: dbUser.email || fallbackUser.email,
          fullName: dbUser.fullName || dbUser.name || fallbackUser.fullName,
          role: dbUser.role || fallbackUser.role,
          id: dbUser.id || fallbackUser.id,
        });
      }).catch(() => {
        // Keep fallback user if backend profile fetch fails.
      });
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
      window.location.href = `${API_BASE_URL}/auth/google/callback`;
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
