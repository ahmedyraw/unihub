import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import api from '../services/api';
import { validatePassword, getPasswordStrength } from '../utils/passwordValidator';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setTokenValid(false);
      setValidating(false);
      return;
    }

    try {
      const response = await api.get(`/auth/validate-reset-token?token=${token}`);
      setTokenValid(response.data.valid);
    } catch (err) {
      setTokenValid(false);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validatePassword(password);
    if (errors.length > 0) {
      setError('Password does not meet requirements: ' + errors.join(', '));
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login?reset=success'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Validating reset link...</p>
        </div>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <Card style={{ maxWidth: '500px', width: '100%' }}>
          <Card.Body className="p-5 text-center">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 className="mb-3">Invalid or Expired Link</h2>
            <p className="text-muted mb-4">
              This password reset link is invalid or has expired. Reset links are only valid for 15 minutes.
            </p>
            <Link to="/forgot-password" className="btn btn-primary me-2">
              Request New Link
            </Link>
            <Link to="/login" className="btn btn-outline-secondary">
              Back to Login
            </Link>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (success) {
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <Card style={{ maxWidth: '500px', width: '100%' }}>
          <Card.Body className="p-5 text-center">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 className="mb-3">Password Reset Successful</h2>
            <p className="text-muted mb-4">
              Your password has been reset successfully. Redirecting to login...
            </p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const strength = getPasswordStrength(password);

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <Card style={{ maxWidth: '550px', width: '100%' }}>
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>🔒 Reset Password</h2>
            <p className="text-muted">Enter your new password</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
              {password && (
                <div className="mt-2">
                  <div className="d-flex justify-content-between mb-1">
                    <small>Password Strength:</small>
                    <small className={`text-${strength.color}`}>{strength.strength}</small>
                  </div>
                  <ProgressBar 
                    now={strength.percentage} 
                    variant={strength.color}
                    style={{ height: '8px' }}
                  />
                </div>
              )}
              <Form.Text className="text-muted d-block mt-2">
                <strong>Password must contain:</strong>
                <ul className="mb-0 mt-1" style={{ paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
                  <li className={password.length >= 8 ? 'text-success' : ''}>
                    {password.length >= 8 ? '✓' : '○'} At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(password) ? 'text-success' : ''}>
                    {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(password) ? 'text-success' : ''}>
                    {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
                  </li>
                  <li className={/[0-9]/.test(password) ? 'text-success' : ''}>
                    {/[0-9]/.test(password) ? '✓' : '○'} One number
                  </li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-success' : ''}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'} One special character
                  </li>
                </ul>
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={loading}
              style={{ padding: '0.875rem', fontSize: '1.125rem', fontWeight: '600' }}
            >
              {loading ? '⏳ Resetting...' : '🔒 Reset Password'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResetPassword;
