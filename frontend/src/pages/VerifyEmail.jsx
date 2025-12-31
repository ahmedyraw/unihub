import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Card, Spinner, Alert } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import websocketService from '../services/websocketService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        console.log('Verification response:', response.data);
        setUser(response.data);
        
        // Connect to WebSocket
        websocketService.connect(() => {
          console.log('WebSocket connected after email verification');
        });
        
        setStatus('success');
        setMessage('Email verified successfully! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.response?.data?.error || error.response?.data?.message || error.message || 'Verification failed');
      }
    };

    verifyEmail();
  }, [searchParams, navigate, setUser]);

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ maxWidth: '500px', width: '100%' }}>
        <Card.Body className="text-center p-5">
          {status === 'verifying' && (
            <>
              <Spinner animation="border" variant="primary" className="mb-3" />
              <h4>Verifying your email...</h4>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="text-success mb-3" style={{ fontSize: '3rem' }}>✓</div>
              <Alert variant="success">{message}</Alert>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="text-danger mb-3" style={{ fontSize: '3rem' }}>✗</div>
              <Alert variant="danger">{message}</Alert>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerifyEmail;
