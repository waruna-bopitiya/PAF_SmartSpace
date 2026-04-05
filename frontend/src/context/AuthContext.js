import React, { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('jwtToken');
  });

  // --- Aluth Logic eka: Google Token handle kirima ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl) {
      // 1. Token eka save karanawa (Backend eka JWT ekak ewwa kiyala hithamu)
      localStorage.setItem('jwtToken', tokenFromUrl);
      setIsAuthenticated(true);

      // 2. Token eka decode karala user data ganna (Optional) 
      // Nathnam nikanma User data set wenakan reload karanna
      // URL eka clean karala page eka refresh karanawa
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.reload();
    }
  }, []);
  // ------------------------------------------------

  const login = useCallback((userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('jwtToken', token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('jwtToken');
    window.location.href = '/login'; // Logout wunama login ekata yawanna
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};