import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <Card style={{ maxWidth: '500px', width: '100%' }}>
          <Card.Body className="p-5 text-center">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✉️</div>
            <h2 className="mb-3">Check Your Email</h2>
            <p className="text-muted mb-4">
              If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
            <p className="text-muted mb-4">
              The link will expire in 15 minutes.
            </p>
            <Link to="/login" className="btn btn-primary">
              Back to Login
            </Link>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', marginTop: '150px', marginBottom: '100px' }}>
      <Card style={{ maxWidth: '500px', width: '100%' }}>
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>🔑 Forgot Password</h2>
            <p className="text-muted">Enter your email to receive a reset link</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="your.email@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mb-3"
              disabled={loading}
              style={{ padding: '0.875rem', fontSize: '1.125rem', fontWeight: '600' }}
            >
              {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
            </Button>
          </Form>

          <div className="text-center">
            <Link to="/login" className="text-decoration-none">
              ← Back to Login
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ForgotPassword;
