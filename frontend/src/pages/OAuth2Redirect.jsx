import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';

const OAuth2Redirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      // Force reload to ensure AuthContext picks up the token
      window.location.href = '/dashboard';
    } else if (error) {
      navigate('/login?error=oauth2_failed');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

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