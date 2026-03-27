import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For demo purposes, we'll simulate a login
      // In production, this would call an auth endpoint
      const userData = {
        id: 1,
        email,
        fullName: 'User Name',
        role: 'USER',
      };
      const token = 'demo-jwt-token-' + Date.now();
      
      login(userData, token);
      navigate('/');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google OAuth login
    // window.location.href = 'http://localhost:8080/api/oauth2/authorization/google';
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Smart Campus Hub</h1>
        <p>Facilities & Maintenance Management System</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="divider">Or</div>

        <button className="btn-google" onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
