import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      try {
        // Decode JWT to get user info (without verification, just parsing)
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const userData = {
            email: payload.email,
            name: payload.name || 'User',
          };
          
          // Use the AuthContext login function to properly set auth state
          login(userData, token);
          
          // Navigate to dashboard
          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [location, navigate, login]);

  return <div>Authenticating... Please wait.</div>;
};

export default AuthSuccess;