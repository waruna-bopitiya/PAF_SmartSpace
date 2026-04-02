import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Get token from URL or localStorage (set by backend redirect)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userEmail = params.get('email');
    const fullName = params.get('fullName');
    const role = params.get('role') || 'USER';

    if (token && userEmail) {
      localStorage.setItem('authToken', token);
      login(userEmail, fullName || 'OAuth User', token, role);
      // Redirect to dashboard
      setTimeout(() => navigate('/'), 100);
    } else {
      // Fallback to login if no token
      console.error('Missing token or email from OAuth callback');
      setTimeout(() => navigate('/login'), 100);
    }
  }, [login, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#666'
    }}>
      <p>Authenticating...</p>
    </div>
  );
};

export default AuthSuccess;
