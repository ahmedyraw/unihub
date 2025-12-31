import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, ListGroup, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import userService from '../services/userService';
import eventService from '../services/eventService';
import blogService from '../services/blogService';
import gamificationService from '../services/gamificationService';
import { formatDate, formatPoints, getBadgeColor, getStatusVariant } from '../utils/helpers';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { leaderboardUpdated } = useWebSocket();
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  const [events, setEvents] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, [id]);

  // Reload rank when leaderboard updates
  useEffect(() => {
    if (leaderboardUpdated) {
      loadRank();
    }
  }, [leaderboardUpdated, id]);

  const loadProfileData = async () => {
    try {
      const userData = await userService.getUserById(id);
      setUser(userData);

      // Load user's rank
      try {
        const rankData = await gamificationService.getUserRank(id, 'GLOBAL');
        setRank(rankData.rank);
      } catch (err) {
        console.error('Failed to load rank:', err);
      }

      // Load user's badges and events only if viewing own profile
      if (currentUser && currentUser.userId.toString() === id) {
        const badgesData = await gamificationService.getMyBadges();
        setBadges(badgesData.earnedBadges || []);

        const eventsData = await eventService.getMyEvents();
        setEvents(Array.isArray(eventsData) ? eventsData.slice(0, 5) : []);

        const blogsData = await blogService.getMyBlogs();
        setBlogs(Array.isArray(blogsData) ? blogsData.slice(0, 5) : []);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRank = async () => {
    try {
      const rankData = await gamificationService.getUserRank(id, 'GLOBAL');
      setRank(rankData.rank);
    } catch (err) {
      console.error('Failed to load rank:', err);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-4">
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted">User not found</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const isOwnProfile = currentUser && currentUser.userId.toString() === id;

  return (
    <Container className="py-4">
      {/* User Info Card */}
      <Card className="mb-4">
        <Card.Body>
          <div className="text-center">
            <div className="display-1 mb-3">👤</div>
            <h2>{user.name}</h2>
            <p className="text-muted">{user.email}</p>
            <Badge bg={
              user.role === 'ADMIN' ? 'danger' :
              user.role === 'SUPERVISOR' ? 'warning' : 'primary'
            } className="mb-2">
              {user.role}
            </Badge>
            <div className="mt-3">
              <h4 className="mb-3">{formatPoints(user.points)} Points</h4>
              <div className="d-flex justify-content-center gap-2">
                {rank && (
                  <Badge bg="info" className="fs-6">
                    🏆 Rank #{rank}
                  </Badge>
                )}
                {user.currentBadge && (
                  <Badge bg={getBadgeColor(user.currentBadge.name)} className="fs-6">
                    🏆 {user.currentBadge.name}
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-muted mt-2">{user.university?.name}</p>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {/* Earned Badges */}
        {isOwnProfile && (
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">🏆 Earned Badges</h5>
              </Card.Header>
              <Card.Body>
                {badges.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {badges.map(userBadge => (
                      <Badge 
                        key={userBadge.badge.badgeId}
                        bg={getBadgeColor(userBadge.badge.name)}
                        className="p-2"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {userBadge.badge.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center py-3">No badges earned yet</p>
                )}
                <div className="text-center mt-3">
                  <Button as={Link} to="/badges" variant="outline-primary" size="sm">
                    View All Badges
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Recent Activity */}
        {isOwnProfile && (
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">📊 Stats</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-around text-center">
                  <div>
                    <h3>{events.length}</h3>
                    <p className="text-muted mb-0 small">Events</p>
                  </div>
                  <div>
                    <h3>{blogs.length}</h3>
                    <p className="text-muted mb-0 small">Blogs</p>
                  </div>
                  <div>
                    <h3>{badges.length}</h3>
                    <p className="text-muted mb-0 small">Badges</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Recent Events (Own Profile Only) */}
        {isOwnProfile && events.length > 0 && (
          <Col md={6}>
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">📅 Recent Events</h5>
                  <Button as={Link} to="/my-events" variant="link" size="sm">
                    View All
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {events.map(event => (
                    <ListGroup.Item 
                      key={event.eventId}
                      as={Link}
                      to={`/events/${event.eventId}`}
                      className="d-flex justify-content-between align-items-center"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <span>{event.title}</span>
                      <Badge bg={getStatusVariant(event.status)}>{event.status}</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Recent Blogs (Own Profile Only) */}
        {isOwnProfile && blogs.length > 0 && (
          <Col md={6}>
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">📝 Recent Blogs</h5>
                  <Button as={Link} to="/my-blogs" variant="link" size="sm">
                    View All
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {blogs.map(blog => (
                    <ListGroup.Item 
                      key={blog.blogId}
                      as={Link}
                      to={`/blogs/${blog.blogId}`}
                      className="d-flex justify-content-between align-items-center"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <span>{blog.title}</span>
                      <Badge bg={getStatusVariant(blog.status)}>{blog.status}</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Profile;
