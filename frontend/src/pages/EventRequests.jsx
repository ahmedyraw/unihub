import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import eventRequestService from '../services/eventRequestService';
import { formatDate } from '../utils/helpers';

const EventRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventRequestService.getMyRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load requests:', error);
      setError('Failed to load requests. Please try again.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    if (!window.confirm('Are you sure you want to accept this request?')) {
      return;
    }

    try {
      await eventRequestService.acceptRequest(requestId);
      setSuccess('Request accepted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      loadRequests();
    } catch (error) {
      setError('Failed to accept request: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || reason.trim() === '') {
      return;
    }

    try {
      await eventRequestService.rejectRequest(requestId, reason);
      setSuccess('Request rejected successfully!');
      setTimeout(() => setSuccess(''), 3000);
      loadRequests();
    } catch (error) {
      setError('Failed to reject request: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(''), 5000);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ORGANIZER':
        return 'primary';
      case 'VOLUNTEER':
        return 'success';
      case 'ATTENDEE':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
            📋 Event Join Requests
          </h2>
          <p className="text-muted">
            Manage requests from users who want to join your events
          </p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading requests...</p>
        </div>
      ) : requests.length > 0 ? (
        <Row className="g-4">
          {requests.map(request => (
            <Col md={6} lg={4} key={request.requestId}>
              <Card className="h-100" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-color)' }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Badge bg={getRoleBadgeColor(request.requestedRole)} style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                      {request.requestedRole}
                    </Badge>
                    <Badge bg="warning" text="dark" style={{ fontSize: '0.75rem' }}>
                      PENDING
                    </Badge>
                  </div>

                  <Card.Title style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                    <Link to={`/events/${request.event.eventId}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {request.event.title}
                    </Link>
                  </Card.Title>

                  <div className="mb-3">
                    <div className="text-muted small mb-2">
                      <strong>👤 Requested by:</strong>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {request.user.name}
                    </div>
                    <div className="text-muted small">
                      {request.user.email}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-muted small">
                      📅 <strong>Requested:</strong> {formatDate(request.createdAt)}
                    </div>
                    {request.user.university && (
                      <div className="text-muted small">
                        🎓 <strong>University:</strong> {request.user.university.name}
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleAccept(request.requestId)}
                      style={{ flex: 1, fontWeight: '600' }}
                    >
                      ✅ Accept
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(request.requestId)}
                      style={{ flex: 1, fontWeight: '600' }}
                    >
                      ❌ Reject
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <div style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }}>📭</div>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No Pending Requests</h4>
            <p className="text-muted mb-0">
              You don't have any pending event join requests at the moment.
            </p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default EventRequests;
