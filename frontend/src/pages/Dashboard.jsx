import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge as BSBadge, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import eventService from '../services/eventService';
import blogService from '../services/blogService';
import gamificationService from '../services/gamificationService';
import notificationService from '../services/notificationService';
import userService from '../services/userService';
import BadgeModal from '../components/common/BadgeModal';
import { formatDate, formatPoints, getBadgeColor, getTimeAgo } from '../utils/helpers';
import { USER_ROLES } from '../utils/constants';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const { badgeEarned, dashboardUpdated, clearBadgeNotification } = useWebSocket();
  const [myEvents, setMyEvents] = useState([]);
  const [myBlogs, setMyBlogs] = useState([]);
  const [topMembers, setTopMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState({ events: 0, blogs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh dashboard when WebSocket update received
  useEffect(() => {
    if (dashboardUpdated) {
      loadDashboardData();
    }
  }, [dashboardUpdated]);

  const loadDashboardData = async () => {
    console.log('=== DASHBOARD DEBUG START ===');
    console.log('Current user object:', user);
    console.log('User role:', user?.role);
    console.log('User role type:', typeof user?.role);
    console.log('Is Admin?', user?.role === USER_ROLES.ADMIN);
    console.log('Is Supervisor?', user?.role === USER_ROLES.SUPERVISOR);
    console.log('Is Student?', user?.role === USER_ROLES.STUDENT);
    
    try {
      let resolvedUser = user;
      if (user?.userId) {
        const refreshedUser = await userService.getCurrentUser();
        if (refreshedUser) {
          const normalizedUser = {
            ...refreshedUser,
            universityId: refreshedUser.university?.universityId ?? refreshedUser.universityId,
            universityName: refreshedUser.university?.name ?? refreshedUser.universityName,
            currentBadgeName: refreshedUser.currentBadge?.name ?? refreshedUser.currentBadgeName
          };
          updateUser({ ...user, ...normalizedUser, token: user?.token });
          resolvedUser = { ...user, ...normalizedUser };
        }
      }

      // Load user's events
      console.log('Fetching my events from API...');
      const events = await eventService.getMyEvents();
      // Sort by newest first and limit to 3
      const sortedEvents = Array.isArray(events) ? events.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ).slice(0, 3) : [];
      setMyEvents(sortedEvents);

      // Load user's blogs
      const blogs = await blogService.getMyBlogs();
      // Sort by newest first and limit to 3
      const sortedBlogs = Array.isArray(blogs) ? blogs.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      ).slice(0, 3) : [];
      setMyBlogs(sortedBlogs);

      // Load top 3 members for leaderboard snippet
      const members = await gamificationService.getTopMembers(
        'UNIVERSITY',
        resolvedUser?.universityId,
        3
      );
      setTopMembers(Array.isArray(members) ? members : []);

      // Load recent notifications (limit to 3)
      const notifs = await notificationService.getNotifications();
      const sortedNotifs = Array.isArray(notifs) ? notifs.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      ).slice(0, 3) : [];
      setNotifications(sortedNotifs);

      // Load pending approvals for supervisors
      if (resolvedUser?.role === USER_ROLES.SUPERVISOR || resolvedUser?.role === USER_ROLES.ADMIN) {
        const [pendingEvents, pendingBlogs] = await Promise.all([
          eventService.getAllEvents({ status: 'PENDING' }),
          blogService.getPendingBlogs()
        ]);
        setPendingApprovals({
          events: Array.isArray(pendingEvents) ? pendingEvents.length : 0,
          blogs: Array.isArray(pendingBlogs) ? pendingBlogs.length : 0
        });
      }
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      // Set empty arrays on error
      setMyEvents([]);
      setMyBlogs([]);
      setTopMembers([]);
      setNotifications([]);
    } finally {
      setLoading(false);
      console.log('=== DASHBOARD DEBUG END ===');
      console.log('Final myEvents state:', myEvents);
      console.log('Final myBlogs state:', myBlogs);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4 dashboard-page" style={{ marginTop: '100px' }}>
      {/* Badge Earned Modal */}
      <BadgeModal
        badge={badgeEarned}
        show={!!badgeEarned}
        onHide={clearBadgeNotification}
      />

      {/* Welcome Section with Role Badge */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '700' }}>Welcome back, {user.name}! 👋</h2>
              <div className="d-flex align-items-center gap-2">
                <p className="text-muted mb-0" style={{ fontSize: '1.125rem' }}>{user.universityName}</p>
                <BSBadge 
                  bg={user.role === USER_ROLES.ADMIN ? 'danger' : user.role === USER_ROLES.SUPERVISOR ? 'warning' : 'primary'}
                  style={{ fontSize: '0.9rem', fontWeight: '600', padding: '0.5rem 1rem' }}
                >
                  {user.role === USER_ROLES.ADMIN ? '🛡️ Admin' : user.role === USER_ROLES.SUPERVISOR ? '👨‍🏫 Supervisor' : '👨‍🎓 Student'}
                </BSBadge>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="h-100 text-center">
            <Card.Body>
              <div className="display-6 mb-2">🏆</div>
              <h3 className="mb-0">{formatPoints(user.points)}</h3>
              <p className="text-muted mb-0">Total Points</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="h-100 text-center">
            <Card.Body>
              <div className="display-6 mb-2">🎖️</div>
              <h3 className="mb-0">
                <BSBadge bg={getBadgeColor(user.currentBadgeName)}>
                  {user.currentBadgeName || 'Newcomer'}
                </BSBadge>
              </h3>
              <p className="text-muted mb-0">Current Badge</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="h-100 text-center">
            <Card.Body>
              <div className="display-6 mb-2">📅</div>
              <h3 className="mb-0">{myEvents.length}</h3>
              <p className="text-muted mb-0">My Events</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="h-100 text-center">
            <Card.Body>
              <div className="display-6 mb-2">📝</div>
              <h3 className="mb-0">{myBlogs.length}</h3>
              <p className="text-muted mb-0">My Blogs</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Supervisor/Admin Pending Approvals - Enhanced Visibility */}
      {(user.role === USER_ROLES.SUPERVISOR || user.role === USER_ROLES.ADMIN) && (
        <>
          <div className="mb-3">
            <h4 style={{ fontWeight: '700', color: 'var(--warning-color)' }}>👨‍🏫 {user.role === USER_ROLES.ADMIN ? 'Admin' : 'Supervisor'} Dashboard</h4>
          </div>
          <Row className="g-4 mb-4">
            <Col md={6}>
              <Card className="border-warning" style={{ 
                borderWidth: '3px', 
                boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',
                background: 'linear-gradient(135deg, #ffffff 0%, #fff9e6 100%)'
              }}>
                <Card.Body>
                  <h5 style={{ fontWeight: '700', marginBottom: '1rem' }}>⏳ Pending Event Approvals</h5>
                  <h2 style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--warning-color)', marginBottom: '1rem' }}>
                    {pendingApprovals.events}
                  </h2>
                  <Button 
                    as={Link} 
                    to="/events/approvals" 
                    variant="warning" 
                    style={{ fontWeight: '600', padding: '0.625rem 1.25rem' }}
                  >
                    📋 Review Events
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-warning" style={{ 
                borderWidth: '3px', 
                boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',
                background: 'linear-gradient(135deg, #ffffff 0%, #fff9e6 100%)'
              }}>
                <Card.Body>
                  <h5 style={{ fontWeight: '700', marginBottom: '1rem' }}>⏳ Pending Blog Approvals</h5>
                  <h2 style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--warning-color)', marginBottom: '1rem' }}>
                    {pendingApprovals.blogs}
                  </h2>
                  <Button 
                    as={Link} 
                    to="/blogs/approvals" 
                    variant="warning"
                    style={{ fontWeight: '600', padding: '0.625rem 1.25rem' }}
                  >
                    📋 Review Blogs
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      <Row className="g-3">
        {/* My Recent Events */}
        <Col xs={12} lg={6}>
            <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', border: 'none', borderRadius: '1rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <Card.Header style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-color)', padding: '1rem' }}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0" style={{ fontWeight: '700' }}>📅 My Recent Events</h5>
                <Button as={Link} to="/my-events" variant="link" size="sm" style={{ fontWeight: '600' }}>
                  View All ({myEvents.length})
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {myEvents.length > 0 ? (
                <ListGroup variant="flush">
                  {myEvents.map(event => (
                    <ListGroup.Item 
                      key={event.eventId} 
                      as={Link}
                      to={`/events/${event.eventId}`}
                      className="list-group-item-action hover-card"
                      style={{ 
                        padding: '1rem', 
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '1.05rem' }}>{event.title}</strong>
                          <div className="text-muted small mt-1">
                            📍 {event.location} • {formatDate(event.startDate)}
                          </div>
                        </div>
                        <BSBadge 
                          bg={event.status === 'APPROVED' ? 'success' : event.status === 'PENDING' ? 'warning' : 'danger'}
                          style={{ fontSize: '0.85rem', fontWeight: '600', padding: '0.5rem 0.75rem' }}
                        >
                          {event.status}
                        </BSBadge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-4">
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem', opacity: '0.3' }}>📅</div>
                  <p className="text-muted mb-3">No events created yet</p>
                  <Button as={Link} to="/events/new" variant="primary" size="sm">
                    Create Your First Event
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* My Recent Blogs */}
        <Col xs={12} lg={6}>
            <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', border: 'none', borderRadius: '1rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <Card.Header style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-color)', padding: '1rem' }}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0" style={{ fontWeight: '700' }}>📝 My Recent Blogs</h5>
                <Button as={Link} to="/my-blogs" variant="link" size="sm" style={{ fontWeight: '600' }}>
                  View All ({myBlogs.length})
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {myBlogs.length > 0 ? (
                <ListGroup variant="flush">
                  {myBlogs.map(blog => (
                    <ListGroup.Item 
                      key={blog.blogId} 
                      as={Link}
                      to={`/blogs/${blog.blogId}`}
                      className="list-group-item-action hover-card"
                      style={{ 
                        padding: '1rem', 
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '1.05rem' }}>{blog.title}</strong>
                          <div className="text-muted small mt-1">
                            <BSBadge bg="info" className="me-2">{blog.category}</BSBadge>
                            {blog.isGlobal && <BSBadge bg="secondary">🌍 Global</BSBadge>}
                          </div>
                        </div>
                        <BSBadge 
                          bg={blog.status === 'APPROVED' ? 'success' : blog.status === 'PENDING' ? 'warning' : 'danger'}
                          style={{ fontSize: '0.85rem', fontWeight: '600', padding: '0.5rem 0.75rem' }}
                        >
                          {blog.status}
                        </BSBadge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-4">
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem', opacity: '0.3' }}>📝</div>
                  <p className="text-muted mb-3">No blogs created yet</p>
                  <Button as={Link} to="/blogs/new" variant="success" size="sm">
                    Create Your First Blog
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Leaderboard Snippet */}
        <Col xs={12} lg={6}>
            <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', border: 'none', borderRadius: '1rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <Card.Header style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-color)', padding: '1rem' }}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0" style={{ fontWeight: '700' }}>🏆 Top Contributors</h5>
                <Button as={Link} to="/leaderboard" variant="link" size="sm" style={{ fontWeight: '600' }}>
                  View Full Leaderboard
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {topMembers && topMembers.length > 0 ? topMembers.map((member, index) => (
                <div key={member.userId} className="d-flex align-items-center mb-3 hover-card" style={{ cursor: 'pointer', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                  <div className="me-3">
                    <h4 className="text-muted mb-0">#{index + 1}</h4>
                  </div>
                  <div className="flex-grow-1">
                    <strong>{member.name}</strong>
                    {member.currentBadge && (
                      <div className="small">
                        <BSBadge bg={getBadgeColor(member.currentBadge.name)}>
                          {member.currentBadge.name}
                        </BSBadge>
                      </div>
                    )}
                  </div>
                  <div>
                    <BSBadge bg="primary" pill>{member.points} pts</BSBadge>
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted">No data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Notifications */}
        <Col xs={12} lg={6}>
            <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', border: 'none', borderRadius: '1rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <Card.Header style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-color)', padding: '1rem' }}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0" style={{ fontWeight: '700' }}>🔔 Recent Notifications</h5>
                <Button as={Link} to="/notifications" variant="link" size="sm" style={{ fontWeight: '600' }}>
                  View All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {notifications.length > 0 ? (
                <ListGroup variant="flush">
                  {notifications.map(notif => (
                    <ListGroup.Item key={notif.notificationId} className="hover-card" style={{ cursor: 'pointer' }}>
                      <div className="d-flex align-items-start">
                        <div className="me-2">{notif.type === 'BADGE_EARNED' ? '🏆' : '🔔'}</div>
                        <div className="flex-grow-1">
                          <div className={!notif.isRead ? 'fw-bold' : ''}>{notif.message}</div>
                          <div className="text-muted small">{getTimeAgo(notif.createdAt)}</div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted text-center">No notifications</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Container>
  );
};

export default Dashboard;
