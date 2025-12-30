import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import { formatDate, truncateText, getStatusVariant } from '../utils/helpers';
import { EVENT_STATUS, USER_ROLES } from '../utils/constants';
import adminService from '../services/adminService';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [filters, setFilters] = useState({
    status: user && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPERVISOR) ? '' : 'APPROVED',
    type: '',
    search: '',
    // IMPORTANT: universityId uses dropdown selection, NOT user's registered university
    // Empty string = "All Universities", otherwise uses selected university ID from dropdown
    universityId: '',
    timeFilter: 'ALL' // ALL, ACTIVE, FUTURE, COMPLETED
  });
  const [loading, setLoading] = useState(true);

  const loadUniversities = async () => {
    try {
      const data = await adminService.getUniversities();
      // Filter out "Example University"
      const filtered = Array.isArray(data) ? data.filter(uni => uni.name !== 'Example University') : [];
      setUniversities(filtered);
    } catch (error) {
      console.error('Failed to load universities:', error);
      setUniversities([]);
    }
  };

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      // Send dropdown-selected universityId to backend (independent of user's university)
      const filterParams = {
        status: filters.status || undefined,
        universityId: filters.universityId || undefined
      };
      
      console.log('🔍 Loading events with filters:', filterParams);
      let data = await eventService.getAllEvents(filterParams);
      console.log('📦 Received events from backend:', data.length, 'events');
      
      // Ensure each event has universityId for filtering
      data = Array.isArray(data) ? data.map(event => ({
        ...event,
        universityId: event.university?.universityId || event.universityId
      })) : [];
      
      console.log('✅ After normalization:', data.length, 'events');
      if (filters.universityId) {
        console.log('🎯 Filtering for universityId:', filters.universityId);
        console.log('📋 Sample event universityIds:', data.slice(0, 3).map(e => ({
          title: e.title,
          universityId: e.universityId,
          universityName: e.university?.name
        })));
      }
      
      // Client-side type filtering (backend doesn't support type parameter)
      if (filters.type) {
        data = data.filter(event => event.type === filters.type);
        console.log('🔧 After type filter:', data.length, 'events');
      }
      
      // Role-based filtering
      if (user && user.role === USER_ROLES.STUDENT) {
        // Students only see approved events
        data = data.filter(event => event.status === 'APPROVED');
        console.log('👤 After role filter (STUDENT):', data.length, 'events');
      }
      
      // Time-based filtering
      const now = new Date();
      if (filters.timeFilter === 'ACTIVE') {
        data = data.filter(event => 
          new Date(event.startDate) <= now && new Date(event.endDate) >= now
        );
        console.log('⏰ After ACTIVE time filter:', data.length, 'events');
      } else if (filters.timeFilter === 'FUTURE') {
        data = data.filter(event => 
          new Date(event.startDate) > now
        );
        console.log('⏰ After FUTURE time filter:', data.length, 'events');
      } else if (filters.timeFilter === 'COMPLETED') {
        data = data.filter(event => 
          new Date(event.endDate) < now
        );
        console.log('⏰ After COMPLETED time filter:', data.length, 'events');
      }
      
      // Sort events: active/future first, then completed at bottom
      data = data.sort((a, b) => {
        const aEnded = new Date(a.endDate) < now;
        const bEnded = new Date(b.endDate) < now;
        
        if (aEnded && !bEnded) return 1;
        if (!aEnded && bEnded) return -1;

        const aTimestamp = new Date(a.createdAt || a.startDate || 0).getTime();
        const bTimestamp = new Date(b.createdAt || b.startDate || 0).getTime();
        return bTimestamp - aTimestamp;
      });
      
      console.log('🎨 Final events to display:', data.length, 'events');
      setEvents(data);
    } catch (error) {
      console.error('❌ Failed to load events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.type, filters.universityId, filters.timeFilter, user]);

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleAdminDelete = async (eventId) => {
    if (!window.confirm('⚠️ Admin Action: Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      await eventService.deleteEvent(eventId);
      setEvents(events.filter(e => e.eventId !== eventId));
    } catch (error) {
      alert('Failed to delete event: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAdminCancel = async (eventId) => {
    if (!window.confirm('⚠️ Admin Action: Are you sure you want to cancel this event?')) {
      return;
    }
    
    try {
      await eventService.cancelEvent(eventId);
      loadEvents(); // Reload to get updated status
    } catch (error) {
      alert('Failed to cancel event: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredEvents = events.filter(event => {
    // Only apply search filter if search term is not empty
    if (!filters.search) return true;
    return event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
           event.description.toLowerCase().includes(filters.search.toLowerCase());
  });

  return (
    <Container className="py-4" style={{ marginTop: '100px' }}>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>📅 Events</h2>
            {user && (
              <Button as={Link} to="/events/new" variant="primary">
                Create Event
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Filters - Enhanced */}
      <Card className="mb-4" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <Card.Body>
          <h5 className="mb-3">🔍 Filters</h5>
          <Row className="g-3">
            {user && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPERVISOR) && (
              <Col md={3}>
                <Form.Label style={{ fontWeight: '600', fontSize: '0.95rem' }}>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  style={{ border: '2px solid #dee2e6', borderRadius: '0.5rem' }}
                >
                  <option value="">All Statuses</option>
                  <option value={EVENT_STATUS.APPROVED}>✅ Approved</option>
                  <option value={EVENT_STATUS.PENDING}>⏳ Pending</option>
                  <option value={EVENT_STATUS.REJECTED}>❌ Rejected</option>
                  <option value={EVENT_STATUS.CANCELLED}>🚫 Cancelled</option>
                </Form.Select>
              </Col>
            )}
            <Col md={3}>
              <Form.Label style={{ fontWeight: '600', fontSize: '0.95rem' }}>University</Form.Label>
              {/* University filter uses dropdown selection, NOT user's registered university */}
              <Form.Select
                value={filters.universityId}
                onChange={(e) => setFilters({ ...filters, universityId: e.target.value })}
                style={{ border: '2px solid #dee2e6', borderRadius: '0.5rem' }}
              >
                <option value="">All Universities</option>
                {universities.map(uni => (
                  <option key={uni.universityId} value={uni.universityId}>
                    {uni.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label style={{ fontWeight: '600', fontSize: '0.95rem' }}>Time</Form.Label>
              <Form.Select
                value={filters.timeFilter}
                onChange={(e) => setFilters({ ...filters, timeFilter: e.target.value })}
                style={{ border: '2px solid #dee2e6', borderRadius: '0.5rem' }}
              >
                <option value="ALL">All Events</option>
                <option value="ACTIVE">🟢 Active Now</option>
                <option value="FUTURE">🔮 Future Events</option>
                <option value="COMPLETED">✅ Completed</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label style={{ fontWeight: '600', fontSize: '0.95rem' }}>Type</Form.Label>
              <Form.Select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                style={{ border: '2px solid #dee2e6', borderRadius: '0.5rem' }}
              >
                <option value="">All Types</option>
                <option value="Workshop">🛠️ Workshop</option>
                <option value="Seminar">📚 Seminar</option>
                <option value="Conference">🎤 Conference</option>
                <option value="Meetup">🤝 Meetup</option>
              </Form.Select>
            </Col>
            <Col md={user && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPERVISOR) ? 3 : 6}>
              <Form.Label style={{ fontWeight: '600', fontSize: '0.95rem' }}>Search</Form.Label>
              <Form.Control
                type="text"
                placeholder="🔎 Search events by title or description..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={{ border: '2px solid #dee2e6', borderRadius: '0.5rem' }}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredEvents.length > 0 ? (
        <Row className="g-3">
          {filteredEvents.map(event => (
            <Col xs={12} sm={6} lg={4} key={event.eventId}>
              <Card className="h-100" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-color)' }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-1">
                    <Badge bg={getStatusVariant(event.status)} style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                      {event.status}
                    </Badge>
                    <Badge bg="secondary">{event.type}</Badge>
                    {new Date(event.endDate) < new Date() && (
                      <Badge bg="dark" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                        Event Completed
                      </Badge>
                    )}
                  </div>
                  <Card.Title style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>{event.title}</Card.Title>
                  <Card.Text style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{truncateText(event.description, 100)}</Card.Text>
                  <div className="mb-3">
                    <div className="text-muted small">
                      📍 <strong>{event.location}</strong>
                    </div>
                    <div className="text-muted small">
                      🕒 {formatDate(event.startDate)}
                    </div>
                    <div className="text-muted small">
                      👤 By: <strong>{event.creator?.name}</strong>
                    </div>
                  </div>
                  <div className="d-flex gap-2 flex-column">
                    <Button 
                      as={Link} 
                      to={`/events/${event.eventId}`} 
                      variant="outline-primary" 
                      size="sm"
                      style={{ fontWeight: '600' }}
                    >
                      📖 View Details
                    </Button>
                    {user && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPERVISOR) && event.reportCount > 0 && (
                      <Badge bg="warning" className="text-center" style={{ fontSize: '0.75rem', padding: '0.25rem' }}>
                        🚨 {event.reportCount} Report{event.reportCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {/* Admin can delete or cancel any event */}
                    <div className="d-flex gap-2">
                      {user && user.role === USER_ROLES.ADMIN && (
                        <>
                          {event.status === 'APPROVED' && (
                            <Button 
                              size="sm" 
                              variant="warning"
                              onClick={() => handleAdminCancel(event.eventId)}
                              title="Cancel event (Admin)"
                              style={{ fontWeight: '600' }}
                            >
                              🚫
                            </Button>
                          )}
                          {(event.status === 'PENDING' || event.status === 'REJECTED') && (
                            <Button 
                              size="sm" 
                              variant="danger"
                              onClick={() => handleAdminDelete(event.eventId)}
                              title="Delete event (Admin)"
                              style={{ fontWeight: '600' }}
                            >
                              🗑️
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-0">No events found</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Events;
