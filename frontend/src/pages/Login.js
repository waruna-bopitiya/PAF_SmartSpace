import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import '../styles/Login.css';

const Login = () => {
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccessBox, setShowSuccessBox] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorBox, setShowErrorBox] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const completeAuthSuccess = (responseData, message) => {
    const { token, email: userEmail, fullName: userFullName, role } = responseData;

    localStorage.setItem('authToken', token);
    login(userEmail, userFullName, token, role || 'USER');

    setSuccessMessage(message);
    setShowSuccessBox(true);

    setTimeout(() => {
      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }, 1200);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setShowSuccessBox(false);
    setSuccessMessage('');
    setShowErrorBox(false);
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      completeAuthSuccess(response.data, 'Login successful! Welcome back.');
    } catch (err) {
      const loginError = err.response?.data?.message || err.response?.data?.error || err.response?.data || 'Invalid email or password.';
      const parsedError = typeof loginError === 'string' ? loginError : 'Invalid email or password.';
      setError(parsedError);
      setErrorMessage(parsedError);
      setShowErrorBox(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setShowSuccessBox(false);
    setSuccessMessage('');
    setShowErrorBox(false);
    setErrorMessage('');
    setLoading(true);

    try {
      await authAPI.register({
        email,
        password,
        fullName,
        role: 'USER',
      });

      const loginResponse = await authAPI.login(email, password);
      completeAuthSuccess(loginResponse.data, 'Account created successfully. Logged in as USER.');
    } catch (err) {
      const registerError = err.response?.data?.message || err.response?.data?.error || err.response?.data || 'Account creation failed. Please try again.';
      const parsedError = typeof registerError === 'string' ? registerError : 'Account creation failed. Please try again.';
      setError(parsedError);
      setErrorMessage(parsedError);
      setShowErrorBox(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/api/oauth2/authorization/google';
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Smart Campus Hub</h1>
        <p>{isCreateMode ? 'Create your student/staff account' : 'Facilities & Maintenance Management System'}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={isCreateMode ? handleRegister : handleLogin}>
          {isCreateMode && (
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

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
            {loading ? (isCreateMode ? 'Creating account...' : 'Logging in...') : (isCreateMode ? 'Create Account' : 'Login')}
          </button>
        </form>

        <div className="divider">Or</div>

        <button className="btn-google" onClick={handleGoogleLogin} disabled={isCreateMode}>
          Sign in with Google
        </button>

        <button
          className="auth-switch"
          onClick={() => {
            setIsCreateMode(!isCreateMode);
            setError('');
            setShowSuccessBox(false);
            setSuccessMessage('');
            setShowErrorBox(false);
            setErrorMessage('');
          }}
          type="button"
        >
          {isCreateMode ? 'Already have an account? Login' : 'No account? Create one'}
        </button>
      </div>

      {showSuccessBox && (
        <div className="custom-success-overlay" role="alert" aria-live="polite">
          <div className="custom-success-box">
            <div className="success-icon">✓</div>
            <h3>Success</h3>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {showErrorBox && (
        <div className="custom-error-overlay" role="alert" aria-live="assertive">
          <div className="custom-error-box">
            <div className="error-icon">!</div>
            <h3>Login Error</h3>
            <p>{errorMessage}</p>
            <button
              type="button"
              className="error-close-btn"
              onClick={() => setShowErrorBox(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
