import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // Token eka save karanawa
      localStorage.setItem('jwtToken', token);
      
      // Page eka refresh karala Dashboard ekata yawannawa
      // window.location.href use karama AuthContext eka aluth token ekath ekka fresh widiyata load wenawa
      window.location.href = "/";
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  return <div>Authenticating... Please wait.</div>;
};

export default AuthSuccess;