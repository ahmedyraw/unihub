import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Button, Badge, Row, Col, Alert, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import reportService from '../services/reportService';
import participationRequestService from '../services/participationRequestService';
import { formatDate, getStatusVariant, getRoleVariant } from '../utils/helpers';
import { PARTICIPANT_ROLES, PARTICIPANT_POINTS } from '../utils/constants';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [userRequest, setUserRequest] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(PARTICIPANT_ROLES.ATTENDEE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportingEvent, setReportingEvent] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadEventDetails();
  }, [id]);

  const loadEventDetails = async () => {
    try {
      const eventData = await eventService.getEventById(id);
      setEvent(eventData);

      try {
        const participantsData = await eventService.getEventParticipants(id);
        setParticipants(Array.isArray(participantsData) ? participantsData : []);
      } catch (participantsError) {
        console.warn('Failed to load participants:', participantsError);
        setParticipants([]);
      }

      // Load user's request status if logged in
      if (user) {
        try {
          const requests = await participationRequestService.getMyRequests();
          const eventRequest = requests.find(r => r.eventId === parseInt(id) && r.status === 'PENDING');
          setUserRequest(eventRequest || null);
        } catch (err) {
          console.warn('Failed to load user requests:', err);
        }
        
        // Check if user has already reported (only for supervisors/admins)
        if (user.role === 'SUPERVISOR' || user.role === 'ADMIN') {
          try {
            const reports = await reportService.getEventReports({ eventId: id });
            const userReport = reports.find(r => r.reportedBy?.userId === user.userId || r.reportedBy?.email === user.email);
            setHasReported(!!userReport);
          } catch (err) {
            setHasReported(false);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load event details:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    setError('');
    try {
      await participationRequestService.submitRequest(id, selectedRole);
      setSuccess(`Request submitted successfully! The event organizer will review your request.`);
      setShowJoinModal(false);
      loadEventDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleLeaveEvent = async () => {
    setError('');
    try {
      await eventService.leaveEvent(id);
      setSuccess('You have left the event.');
      setShowLeaveModal(false);
      loadEventDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave event');
    }
  };

  const handleReportEvent = async () => {
    if (!reportReason.trim()) {
      setError('Please provide a reason for reporting');
      return;
    }
    
    setReportingEvent(true);
    setError('');
    try {
      await reportService.reportEvent(id, reportReason);
      setSuccess('Event reported successfully. Our team will review it.');
      setShowReportModal(false);
      setReportReason('');
      setHasReported(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('You have already reported this event.');
        setHasReported(true);
      } else {
        setError(err.response?.data?.message || 'Failed to report event');
      }
    } finally {
      setReportingEvent(false);
    }
  };

  const handleCancelEvent = async () => {
    try {
      await eventService.cancelEvent(id);
      setSuccess('Event cancelled successfully');
      setShowCancelModal(false);
      loadEventDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel event');
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await eventService.deleteEvent(id);
      setSuccess('Event deleted successfully');
      setTimeout(() => window.location.href = '/#/events', 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" />
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Event not found</Alert>
      </Container>
    );
  }

  const isCompleted = new Date(event.endDate) < new Date();
  const canReportEvent = user && (event.status === 'PENDING' || event.status === 'APPROVED') && !isCompleted;

  return (
    <Container className="py-4">
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row>
        <Col md={8}>
          <Card className="mb-4" style={{ position: 'relative', overflow: 'hidden' }}>
            {event.reportCount > 0 && (
              <div style={{
                position: 'absolute',
                bottom: '5px',
                right: '5px',
                width: '28px',
                height: '28px',
                backgroundColor: '#dc3545',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '700',
                zIndex: 10,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {event.reportCount}
              </div>
            )}
            <Card.Header>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h3 className="mb-0">{event.title}</h3>
                  {isCompleted && (
                    <Badge bg="dark" className="mt-2">
                      Event Completed
                    </Badge>
                  )}
                </div>
                <Badge bg={getStatusVariant(event.status)}>{event.status}</Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Badge bg="secondary">{event.type}</Badge>
              </div>
              <p className="lead">{event.description}</p>
              <hr style={{ borderColor: 'var(--border-color)', opacity: 1 }} />
              <Row className="mb-3">
                <Col md={12}>
                  <strong>University:</strong><br />
                  <span style={{ color: 'var(--text-primary)' }}>{event.university?.name || 'N/A'}</span>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Location:</strong><br />
                  <span style={{ color: 'var(--text-primary)' }}>{event.location}</span>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Organizer:</strong><br />
                  <span style={{ color: 'var(--text-primary)' }}>{event.creator?.name}</span>
                </Col>
              </Row>
              
              {/* Timeline */}
              <div className="mb-3">
                <strong>Event Timeline:</strong>
                <div className="mt-3" style={{ position: 'relative', padding: '10px 30px 70px 30px', maxWidth: '90%', margin: '0 auto' }}>
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '30px',
                    right: '30px',
                    height: '8px',
                    backgroundColor: 'var(--border-color)',
                    borderRadius: '4px'
                  }}>
                    {(() => {
                      const now = new Date();
                      const start = new Date(event.startDate);
                      const end = new Date(event.endDate);
                      const total = end - start;
                      const elapsed = now - start;
                      const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
                      
                      return (
                        <div style={{
                          position: 'absolute',
                          left: '0',
                          top: '0',
                          height: '100%',
                          width: `${progress}%`,
                          backgroundColor: progress >= 100 ? '#6c757d' : progress > 0 ? '#28a745' : 'transparent',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }} />
                      );
                    })()}
                  </div>
                  
                  <div style={{ position: 'absolute', left: '30px', top: '10px', transform: 'translateY(-50%)' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#0d6efd',
                      borderRadius: '50%',
                      border: '3px solid var(--bg-primary)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      fontWeight: '600'
                    }}>
                      <strong>Start</strong><br />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '400' }}>
                        {formatDate(event.startDate)}
                      </span>
                    </div>
                  </div>
                  
                  {(() => {
                    const now = new Date();
                    const start = new Date(event.startDate);
                    const end = new Date(event.endDate);
                    const total = end - start;
                    const elapsed = now - start;
                    const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
                    
                    if (progress > 0 && progress < 100) {
                      return (
                        <div style={{ position: 'absolute', left: `calc(30px + ${progress}% * (100% - 60px) / 100%)`, top: '10px', transform: 'translate(-50%, -50%)' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#28a745',
                            borderRadius: '50%',
                            border: '3px solid var(--bg-primary)',
                            boxShadow: '0 2px 8px rgba(40, 167, 69, 0.5)',
                            animation: 'pulse 2s infinite'
                          }} />
                          <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            whiteSpace: 'nowrap',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: '#28a745'
                          }}>
                            Now
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  <div style={{ position: 'absolute', right: '30px', top: '10px', transform: 'translateY(-50%)' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#dc3545',
                      borderRadius: '50%',
                      border: '3px solid var(--bg-primary)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      fontWeight: '600'
                    }}>
                      <strong>End</strong><br />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '400' }}>
                        {formatDate(event.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <style>{`
                @keyframes pulse {
                  0%, 100% { box-shadow: 0 2px 8px rgba(40, 167, 69, 0.5); }
                  50% { box-shadow: 0 2px 16px rgba(40, 167, 69, 0.8); }
                }
              `}</style>
              
              {(event.maxOrganizers || event.maxVolunteers || event.maxAttendees) && (
                <>
                  <hr style={{ borderColor: 'var(--border-color)', opacity: 1 }} />
                  <h5 className="mb-3">Event Capacity</h5>
                  <Row>
                    {event.maxOrganizers && (
                      <Col md={4}>
                        <strong>Organizers:</strong><br />
                        <span style={{ color: 'var(--text-primary)' }}>{participants.filter(p => p.role === 'ORGANIZER').length} / {event.maxOrganizers}</span>
                        <div className="small text-muted">({event.organizerPoints} pts)</div>
                      </Col>
                    )}
                    {event.maxVolunteers && (
                      <Col md={4}>
                        <strong>Volunteers:</strong><br />
                        <span style={{ color: 'var(--text-primary)' }}>{participants.filter(p => p.role === 'VOLUNTEER').length} / {event.maxVolunteers}</span>
                        <div className="small text-muted">({event.volunteerPoints} pts)</div>
                      </Col>
                    )}
                    {event.maxAttendees && (
                      <Col md={4}>
                        <strong>Attendees:</strong><br />
                        <span style={{ color: 'var(--text-primary)' }}>{participants.filter(p => p.role === 'ATTENDEE').length} / {event.maxAttendees}</span>
                        <div className="small text-muted">({event.attendeePoints} pts)</div>
                      </Col>
                    )}
                  </Row>
                </>
              )}
            </Card.Body>
          </Card>

          {user && event.status === 'APPROVED' && (
            <>
              {/* Check if user is already participating */}
              {participants.some(p => p.user.userId === user.userId) ? (
                <Card className="mb-3 border-success">
                  <Card.Body>
                    <h5>✅ You are participating in this event</h5>
                    <p>Role: <Badge bg={getRoleVariant(participants.find(p => p.user.userId === user.userId)?.role)}>
                      {participants.find(p => p.user.userId === user.userId)?.role}
                    </Badge></p>
                    <Button variant="danger" size="sm" onClick={() => setShowLeaveModal(true)}>
                      Leave Event
                    </Button>
                  </Card.Body>
                </Card>
              ) : userRequest ? (
                <Card className="mb-3 border-warning">
                  <Card.Body>
                    <h5>⏳ Request Pending</h5>
                    <p>You have requested to join as: <Badge bg="warning">{userRequest.requestedRole}</Badge></p>
                    <p className="text-muted small mb-0">The event organizer will review your request.</p>
                  </Card.Body>
                </Card>
              ) : (
                <Card className="mb-3">
                  <Card.Body>
                    <h5>Request to Join This Event</h5>
                    <p>Submit a request to participate and the organizer will approve it!</p>
                    <div className="d-flex gap-2 flex-wrap">
                      {(!event.maxOrganizers || participants.filter(p => p.role === 'ORGANIZER').length < event.maxOrganizers) && (
                        <Button 
                          variant="danger" 
                          onClick={() => { setSelectedRole(PARTICIPANT_ROLES.ORGANIZER); setShowJoinModal(true); }}
                        >
                          Organizer ({event.organizerPoints} pts)
                        </Button>
                      )}
                      {(!event.maxVolunteers || participants.filter(p => p.role === 'VOLUNTEER').length < event.maxVolunteers) && (
                        <Button 
                          variant="success" 
                          onClick={() => { setSelectedRole(PARTICIPANT_ROLES.VOLUNTEER); setShowJoinModal(true); }}
                        >
                          Volunteer ({event.volunteerPoints} pts)
                        </Button>
                      )}
                      {(!event.maxAttendees || participants.filter(p => p.role === 'ATTENDEE').length < event.maxAttendees) && (
                        <Button 
                          variant="info" 
                          onClick={() => { setSelectedRole(PARTICIPANT_ROLES.ATTENDEE); setShowJoinModal(true); }}
                        >
                          Attendee ({event.attendeePoints} pts)
                        </Button>
                      )}
                    </div>
                    {event.maxOrganizers && participants.filter(p => p.role === 'ORGANIZER').length >= event.maxOrganizers &&
                     event.maxVolunteers && participants.filter(p => p.role === 'VOLUNTEER').length >= event.maxVolunteers &&
                     event.maxAttendees && participants.filter(p => p.role === 'ATTENDEE').length >= event.maxAttendees && (
                      <Alert variant="warning" className="mt-3 mb-0">
                        All roles are fully booked
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              )}
            </>
          )}

          {canReportEvent && (
            <Card className="mb-3">
              <Card.Body>
                <h5>Report This Event</h5>
                <p className="text-muted small">If you find this event inappropriate or violates community guidelines</p>
                <Button variant="warning" size="sm" onClick={() => setShowReportModal(true)} disabled={hasReported}>
                  {hasReported ? 'Already Reported' : 'Report Event'}
                </Button>
              </Card.Body>
            </Card>
          )}

          {/* Admin Actions */}
          {user && user.role === 'ADMIN' && event.status !== 'CANCELLED' && (
            <Card>
              <Card.Body>
                <h5>Admin Actions</h5>
                <div className="d-flex gap-2 flex-wrap">
                  {event.status === 'APPROVED' && (
                    <Button variant="warning" size="sm" onClick={() => setShowCancelModal(true)}>
                      Cancel Event
                    </Button>
                  )}
                  {(event.status === 'PENDING' || event.status === 'REJECTED') && (
                    <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                      Delete Event
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Participants ({participants.length})</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {participants.map(p => (
                <div key={p.participantId} className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ color: 'var(--text-primary)' }}>{p.user.name}</span>
                  <Badge bg={getRoleVariant(p.role)}>{p.role}</Badge>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showJoinModal} onHide={() => setShowJoinModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <Modal.Title style={{ color: 'var(--text-primary)' }}>Request to Join Event</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          <p>You are requesting to join as: <Badge bg={getRoleVariant(selectedRole)}>{selectedRole}</Badge></p>
          <p>You will earn <strong style={{ color: 'var(--text-primary)' }}>{event?.[`${selectedRole.toLowerCase()}Points`] || PARTICIPANT_POINTS[selectedRole]} points</strong> once approved!</p>
          <Alert variant="info" className="mb-0" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: 'var(--text-primary)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
            The event organizer will review your request before you can participate.
          </Alert>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <Button variant="secondary" onClick={() => setShowJoinModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleJoinEvent}>Submit Request</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showLeaveModal} onHide={() => setShowLeaveModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <Modal.Title style={{ color: 'var(--text-primary)' }}>⚠️ Leave Event</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          <Alert variant="warning" style={{ backgroundColor: 'rgba(255, 193, 7, 0.15)', color: 'var(--text-primary)', borderColor: 'rgba(255, 193, 7, 0.3)' }}>
            <strong>Warning:</strong> You will be penalized 2x the points you earned from this event!
          </Alert>
          <p>Are you sure you want to leave this event?</p>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <Button variant="secondary" onClick={() => setShowLeaveModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLeaveEvent}>
            Leave Event
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showReportModal} onHide={() => setShowReportModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <Modal.Title style={{ color: 'var(--text-primary)' }}>Report Event</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          <Form.Group>
            <Form.Label style={{ color: 'var(--text-primary)' }}>Reason for reporting</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please explain why you are reporting this event..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleReportEvent}
            disabled={reportingEvent}
          >
            {reportingEvent ? 'Reporting...' : 'Submit Report'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <Modal.Title style={{ color: 'var(--text-primary)' }}>Cancel Event</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          <p>Are you sure you want to cancel this event?</p>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>Cancel</Button>
          <Button variant="warning" onClick={handleCancelEvent}>Cancel Event</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <Modal.Title style={{ color: 'var(--text-primary)' }}>Delete Event</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          <p>Are you sure you want to delete this event? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteEvent}>Delete Event</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EventDetails;
