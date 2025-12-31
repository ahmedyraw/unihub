import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants';
import adminService from '../services/adminService';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [universities, setUniversities] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.STUDENT,
    universityId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [emailError, setEmailError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    loadUniversities();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('At least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('At least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('At least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('At least one special character (!@#$%^&*...)');
    }
    return errors;
  };

  const handleEmailBlur = () => {
    if (formData.email && !validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address (e.g., user@university.edu)');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordBlur = () => {
    if (formData.password) {
      setPasswordErrors(validatePassword(formData.password));
    }
  };

  const loadUniversities = async () => {
    try {
      const data = await adminService.getAllUniversities();
      // Ensure data is always an array
      const universitiesArray = Array.isArray(data) ? data : [];
      setUniversities(universitiesArray);
      if (universitiesArray.length > 0) {
        setFormData(prev => ({ ...prev, universityId: universitiesArray[0].universityId }));
      }
    } catch (err) {
      console.error('Failed to load universities:', err);
      setUniversities([]); // Set empty array on error
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Email validation
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Password validation
    const pwdErrors = validatePassword(formData.password);
    if (pwdErrors.length > 0) {
      setError('Password does not meet requirements: ' + pwdErrors.join(', '));
      return;
    }

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        universityId: parseInt(formData.universityId)
      };

      await register(registerData);
      setRegistrationSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', marginTop: '150px', marginBottom: '100px' }}>
      <Card style={{ maxWidth: '500px', width: '100%' }}>
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>🎓 UniHub</h2>
            <p className="text-muted">Create your account</p>
          </div>

          {registrationSuccess ? (
            <>
              <Alert variant="success">
                <Alert.Heading>Registration Successful! 🎉</Alert.Heading>
                <p>
                  We've sent a verification email to <strong>{formData.email}</strong>.
                  Please check your inbox and click the verification link to activate your account.
                </p>
                <hr />
                <p className="mb-0">
                  Didn't receive the email? <Button variant="link" className="p-0 text-decoration-none" style={{verticalAlign: 'baseline'}} onClick={async () => {
                    try {
                      await api.post('/auth/resend-verification', { email: formData.email });
                      setError('');
                      alert('Verification email sent! Please check your inbox.');
                    } catch (err) {
                      setError('Failed to resend verification email. Please try again.');
                    }
                  }}>Resend verification email</Button>
                </p>
              </Alert>
              <div className="text-center mt-3">
                <Link to="/login" className="btn btn-primary">Go to Login</Link>
              </div>
            </>
          ) : (
            <>
              {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="custom-input"
                required
                minLength={2}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>University Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="your.email@university.edu"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                className="custom-input"
                required
                isInvalid={!!emailError}
              />
              {emailError && (
                <Form.Text className="text-danger d-block mt-1">
                  {emailError}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>University</Form.Label>
              <Form.Select
                name="universityId"
                value={formData.universityId}
                onChange={handleChange}
                className="custom-input"
                required
              >
                <option value="">Select University</option>
                {Array.isArray(universities) && universities.map(uni => (
                  <option key={uni.universityId} value={uni.universityId}>
                    {uni.name}{uni.emailDomain ? ` (@${uni.emailDomain})` : ''}
                  </option>
                ))}
              </Form.Select>
              {formData.universityId && universities.find(u => u.universityId === parseInt(formData.universityId))?.emailDomain && (
                <Form.Text className="text-muted d-block mt-1">
                  Use your @{universities.find(u => u.universityId === parseInt(formData.universityId)).emailDomain} email
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handlePasswordBlur}
                className="custom-input"
                required
                isInvalid={passwordErrors.length > 0 && formData.password}
              />
              <Form.Text className="text-muted d-block mt-2" style={{ fontSize: '0.875rem' }}>
                <strong>Password must contain:</strong>
                <ul className="mb-0 mt-1" style={{ paddingLeft: '1.25rem' }}>
                  <li className={formData.password.length >= 8 ? 'text-success' : ''}>
                    {formData.password.length >= 8 ? '✓' : '○'} At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'text-success' : ''}>
                    {/[A-Z]/.test(formData.password) ? '✓' : '○'} One uppercase letter (A-Z)
                  </li>
                  <li className={/[a-z]/.test(formData.password) ? 'text-success' : ''}>
                    {/[a-z]/.test(formData.password) ? '✓' : '○'} One lowercase letter (a-z)
                  </li>
                  <li className={/[0-9]/.test(formData.password) ? 'text-success' : ''}>
                    {/[0-9]/.test(formData.password) ? '✓' : '○'} One number (0-9)
                  </li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-success' : ''}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? '✓' : '○'} One special character (!@#$%...)
                  </li>
                </ul>
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="custom-input"
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
              {loading ? '⏳ Creating account...' : '🚀 Register'}
            </Button>
          </Form>

          <div className="text-center">
            <Link to="/login" className="text-decoration-none">
              Already have an account? Login here
            </Link>
          </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;
