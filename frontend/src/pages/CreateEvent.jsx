import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import adminService from '../services/adminService';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    type: 'Workshop',
    universityId: '', // University ID for the event (dropdown selection)
    maxOrganizers: '',
    maxVolunteers: '',
    maxAttendees: '',
    organizerPoints: 50,
    volunteerPoints: 20,
    attendeePoints: 10,
    creatorParticipates: false,
    creatorRole: 'ATTENDEE'
  });
  const [universities, setUniversities] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      const data = await adminService.getUniversities();
      setUniversities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load universities:', error);
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
    setLoading(true);

    // Client-side validation
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    if (new Date(formData.startDate) <= new Date()) {
      setError('Start date must be in the future');
      setLoading(false);
      return;
    }

    try {
      // Prepare data - convert empty strings to null for optional numeric fields
      const eventData = {
        ...formData,
        universityId: formData.universityId ? parseInt(formData.universityId) : null,
        maxOrganizers: formData.maxOrganizers ? parseInt(formData.maxOrganizers) : null,
        maxVolunteers: formData.maxVolunteers ? parseInt(formData.maxVolunteers) : null,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        organizerPoints: parseInt(formData.organizerPoints),
        volunteerPoints: parseInt(formData.volunteerPoints),
        attendeePoints: parseInt(formData.attendeePoints)
      };
      
      console.log('Creating event with universityId:', eventData.universityId);
      await eventService.createEvent(eventData);
      navigate('/my-events');
    } catch (err) {
      // Display backend error message or generic error
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        // Validation errors
        const errorMessages = Object.values(err.response.data.errors).join(', ');
        setError(errorMessages);
      } else {
        setError('Failed to create event. Please check all fields and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card.Header>
          <h3>📅 Create New Event</h3>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Event Title *</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                minLength={3}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>University *</Form.Label>
              <Form.Select
                name="universityId"
                value={formData.universityId}
                onChange={handleChange}
                required
              >
                <option value="">Select a university...</option>
                {universities.map(uni => (
                  <option key={uni.universityId} value={uni.universityId}>
                    {uni.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Select the university where this event will take place
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location (Venue) *</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Main Auditorium, Building A"
              />
              <Form.Text className="text-muted">
                Specific venue or building at the selected university
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Event Type *</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Conference">Conference</option>
                <option value="Meetup">Meetup</option>
                <option value="Competition">Competition</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date & Time *</Form.Label>
              <Form.Control
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date & Time *</Form.Label>
              <Form.Control
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <hr className="my-4" />
            <h5 className="mb-3">🎯 Capacity Limits (Optional)</h5>
            <p className="text-muted small">Leave empty for unlimited capacity</p>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Max Organizers</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxOrganizers"
                    value={formData.maxOrganizers}
                    onChange={handleChange}
                    min="0"
                    placeholder="Unlimited"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Max Volunteers</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxVolunteers"
                    value={formData.maxVolunteers}
                    onChange={handleChange}
                    min="0"
                    placeholder="Unlimited"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Max Attendees</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxAttendees"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                    min="0"
                    placeholder="Unlimited"
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4" />
            <h5 className="mb-3">👤 Your Participation</h5>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="I want to participate in this event"
                checked={formData.creatorParticipates}
                onChange={(e) => setFormData({ ...formData, creatorParticipates: e.target.checked })}
              />
            </Form.Group>

            {formData.creatorParticipates && (
              <Form.Group className="mb-3">
                <Form.Label>Participation Role</Form.Label>
                <Form.Select
                  name="creatorRole"
                  value={formData.creatorRole}
                  onChange={handleChange}
                >
                  <option value="ORGANIZER">Organizer</option>
                  <option value="VOLUNTEER">Volunteer</option>
                  <option value="ATTENDEE">Attendee</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  You won't receive points until the event is approved
                </Form.Text>
              </Form.Group>
            )}

            <div className="d-flex gap-2">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateEvent;
