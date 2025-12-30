import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Table, Badge, Button } from 'react-bootstrap';
import eventService from '../services/eventService';
import { formatDate, getStatusVariant } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants';

const MyEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyEvents();
  }, []);

  const loadMyEvents = async () => {
    try {
      const data = await eventService.getMyEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      await eventService.deleteEvent(eventId);
      setEvents(events.filter(e => e.eventId !== eventId));
    } catch (error) {
      alert('Failed to delete event: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancel = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel this event?')) {
      return;
    }
    
    try {
      await eventService.cancelEvent(eventId);
      loadMyEvents(); // Reload to get updated status
    } catch (error) {
      alert('Failed to cancel event: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">📅 My Events</h2>
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : events.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.eventId}>
                    <td style={{ fontWeight: '500' }}>{event.title}</td>
                    <td>{event.type}</td>
                    <td>{formatDate(event.startDate)}</td>
                    <td><Badge bg={getStatusVariant(event.status)} style={{ fontSize: '0.85rem', fontWeight: '600' }}>{event.status}</Badge></td>
                    <td>
                      <div className="d-flex gap-2">
                        {/* View Details */}
                        <Button 
                          as={Link}
                          to={`/events/${event.eventId}`}
                          size="sm" 
                          variant="outline-primary"
                          title="View details"
                        >
                          👁️ View
                        </Button>
                        
                        {/* Edit button for PENDING and APPROVED events */}
                        {(event.status === 'PENDING' || event.status === 'APPROVED') && (
                          <Button 
                            as={Link}
                            to={`/events/${event.eventId}/edit`}
                            size="sm" 
                            variant="outline-info"
                            title={event.status === 'APPROVED' ? 'Edit (will reset to PENDING)' : 'Edit event'}
                          >
                            ✏️ Edit
                          </Button>
                        )}
                        
                        {/* Only allow deletion for PENDING or REJECTED events */}
                        {(event.status === 'PENDING' || event.status === 'REJECTED') && (
                          <Button 
                            size="sm" 
                            variant="outline-danger"
                            onClick={() => handleDelete(event.eventId)}
                            title="Delete event"
                          >
                            🗑️ Delete
                          </Button>
                        )}
                        
                        {/* Allow cancellation for APPROVED events (admin or supervisor only) */}
                        {event.status === 'APPROVED' && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPERVISOR) && (
                          <Button 
                            size="sm" 
                            variant="warning"
                            onClick={() => handleCancel(event.eventId)}
                            title="Cancel event"
                          >
                            🚫 Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center text-muted py-5">No events created yet</p>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MyEvents;
