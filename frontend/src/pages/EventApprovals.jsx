import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Alert } from 'react-bootstrap';
import eventService from '../services/eventService';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants';

const EventApprovals = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadPendingEvents();
  }, []);

  const loadPendingEvents = async () => {
    try {
      const data = await eventService.getAllEvents({ status: 'PENDING' });
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load pending events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await eventService.approveEvent(id);
      setEvents(events.filter(e => e.eventId !== id));
    } catch (error) {
      console.error('Failed to approve event:', error);
      alert('Failed to approve event. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    setProcessingId(id);
    try {
      await eventService.rejectEvent(id, reason);
      setEvents(events.filter(e => e.eventId !== id));
    } catch (error) {
      console.error('Failed to reject event:', error);
      alert('Failed to reject event. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Container className="py-4">
      <Alert variant="warning" style={{ fontWeight: '500', border: '2px solid #ffc107', boxShadow: '0 2px 8px rgba(255, 193, 7, 0.2)' }}>
        <strong>👨‍🏫 {user.role === USER_ROLES.ADMIN ? 'Admin' : 'Supervisor'} View:</strong> Review and approve/reject pending events from your university.
      </Alert>
      <h2 className="mb-4" style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>⏳ Event Approvals</h2>
      <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', border: 'none', borderRadius: '1rem' }}>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : events.length > 0 ? (
            <Table responsive hover>
              <thead style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <tr>
                  <th style={{ fontWeight: '600', padding: '1rem' }}>Title</th>
                  <th style={{ fontWeight: '600', padding: '1rem' }}>Creator</th>
                  <th style={{ fontWeight: '600', padding: '1rem' }}>Type</th>
                  <th style={{ fontWeight: '600', padding: '1rem' }}>Date</th>
                  <th style={{ fontWeight: '600', padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.eventId} style={{ borderLeft: '4px solid #ffc107' }}>
                    <td style={{ fontWeight: '500', padding: '1rem' }}>{event.title}</td>
                    <td style={{ padding: '1rem' }}>
                      <div><strong>{event.creator?.name}</strong></div>
                      <div className="text-muted small">{event.creator?.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}><Badge bg="secondary">{event.type}</Badge></td>
                    <td style={{ padding: '1rem' }}>{formatDate(event.startDate)}</td>
                    <td style={{ padding: '1rem' }}>
                      <div className="d-flex gap-2">
                        <Button 
                          size="sm" 
                          variant="success" 
                          onClick={() => handleApprove(event.eventId)}
                          disabled={processingId === event.eventId}
                          style={{ fontWeight: '600', minWidth: '90px' }}
                        >
                          {processingId === event.eventId ? '⏳ Processing...' : '✅ Approve'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger" 
                          onClick={() => handleReject(event.eventId)}
                          disabled={processingId === event.eventId}
                          style={{ fontWeight: '600', minWidth: '90px' }}
                        >
                          {processingId === event.eventId ? '⏳ Processing...' : '❌ Reject'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: '0.3' }}>✅</div>
              <h4 style={{ color: '#6c757d', fontWeight: '600' }}>All Clear!</h4>
              <p className="text-muted">No pending event approvals at the moment.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EventApprovals;
