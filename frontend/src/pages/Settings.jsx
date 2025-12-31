import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import universityService from '../services/universityService';
import { STORAGE_KEYS } from '../utils/constants';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(user?.universityId || '');
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED) !== 'false'
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const isOAuth2User = !user?.hasPassword;

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      const data = await universityService.getAllUniversities();
      setUniversities(data);
    } catch (err) {
      console.error('Failed to load universities:', err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isOAuth2User) {
        // OAuth2 user setting password for first time
        await userService.setPassword(passwords.newPassword);
        setSuccess('Password set successfully! You can now login with email and password.');
      } else {
        // Regular user changing password
        await userService.changePassword(passwords.oldPassword, passwords.newPassword);
        setSuccess('Password changed successfully');
      }
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      // Refresh user data
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = (e) => {
    const enabled = e.target.checked;
    setNotificationsEnabled(enabled);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, enabled.toString());
    setSuccess('Notification preferences updated');
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">⚙️ Settings</h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {isOAuth2User && !user?.universityId && (
        <Alert variant="warning">
          <Alert.Heading>⚠️ Complete Your Profile</Alert.Heading>
          <p>You signed in with Google. Please select your university and set a password to enable email/password login.</p>
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">University</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            setLoading(true);
            try {
              await userService.updateUniversity(selectedUniversity);
              setSuccess('University updated successfully');
              window.location.reload();
            } catch (err) {
              setError(err.response?.data?.message || 'Failed to update university');
            } finally {
              setLoading(false);
            }
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Select Your University</Form.Label>
              <Form.Select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                required
              >
                <option value="">Choose a university...</option>
                {universities.map(uni => (
                  <option key={uni.universityId} value={uni.universityId}>
                    {uni.name}
                  </option>
                ))}
              </Form.Select>
              {user?.universityName && (
                <Form.Text className="text-muted">
                  Current: {user.universityName}
                </Form.Text>
              )}
            </Form.Group>
            <Button type="submit" variant="primary" disabled={loading || !selectedUniversity}>
              {loading ? 'Updating...' : 'Update University'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Profile Information</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            setLoading(true);
            try {
              await userService.updateProfile({ name });
              setSuccess('Name updated successfully');
            } catch (err) {
              setError(err.response?.data?.message || 'Failed to update name');
            } finally {
              setLoading(false);
            }
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Name'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Notification Preferences</h5>
        </Card.Header>
        <Card.Body>
          <Form.Check
            type="switch"
            id="notifications-toggle"
            label="Enable badge promotion pop-ups"
            checked={notificationsEnabled}
            onChange={handleNotificationToggle}
          />
          <Form.Text className="text-muted">
            When enabled, you'll see a pop-up modal when you earn a new badge
          </Form.Text>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h5 className="mb-0">{isOAuth2User ? 'Set Password' : 'Change Password'}</h5>
        </Card.Header>
        <Card.Body>
          {isOAuth2User && (
            <Alert variant="info" className="mb-3">
              <strong>🔑 Set a password to enable email/password login</strong>
              <p className="mb-0 mt-2">Currently, you can only login with Google. Set a password to also login with your email.</p>
            </Alert>
          )}
          <Form onSubmit={handlePasswordChange}>
            {!isOAuth2User && (
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                  required
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                required
                minLength={6}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Updating...' : (isOAuth2User ? 'Set Password' : 'Update Password')}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Settings;
