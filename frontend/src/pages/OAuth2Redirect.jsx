import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const OAuth2Redirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleOAuth2Redirect = async () => {
      const error = searchParams.get('error');

      if (error) {
        navigate('/login?error=oauth2_failed', { replace: true });
        return;
      }

      try {
        // Token is in httpOnly cookie, just fetch user data
        const userData = await authService.checkSession();
        setUser(userData);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('OAuth2 redirect error:', err);
        navigate('/login?error=oauth2_failed', { replace: true });
      }
    };

    handleOAuth2Redirect();
  }, [searchParams, navigate, setUser]);

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Processing authentication...</p>
      </div>
    </Container>
  );
};

export default OAuth2Redirect;