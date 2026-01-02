import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, NavDropdown, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { USER_ROLES } from '../../utils/constants';
import notificationService from '../../services/notificationService';
import chatService from '../../services/chatService';
import { useWebSocket } from '../../hooks/useWebSocket';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notificationReceived } = useWebSocket();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      loadUnreadChatsCount();
    }
  }, [user]);

  // Update unread count when new notification is received
  useEffect(() => {
    if (notificationReceived && user) {
      loadUnreadCount();
      loadUnreadChatsCount();
    }
  }, [notificationReceived, user]);

  // Listen for notification read events
  useEffect(() => {
    const handleNotificationRead = () => {
      if (user) {
        loadUnreadCount();
      }
    };

    const handleChatRead = () => {
      if (user) {
        loadUnreadChatsCount();
      }
    };

    window.addEventListener('notificationRead', handleNotificationRead);
    window.addEventListener('chatRead', handleChatRead);
    return () => {
      window.removeEventListener('notificationRead', handleNotificationRead);
      window.removeEventListener('chatRead', handleChatRead);
    };
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const loadUnreadChatsCount = async () => {
    try {
      const conversations = await chatService.getConversations();
      const unreadCount = conversations.filter(conv => conv.unreadCount > 0).length;
      setUnreadChatsCount(unreadCount);
    } catch (error) {
      console.error('Failed to load unread chats count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BSNavbar
      variant={theme === 'light' ? 'light' : 'dark'}
      expand="lg"
      fixed="top"
      className={`navbar-theme ${scrolled ? 'scrolled' : ''}`}
    >
      <Container>
        <BSNavbar.Brand as={Link} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          🎓 UniHub
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!isAuthenticated() && <Nav.Link as={Link} to="/">Home</Nav.Link>}
            <Nav.Link as={Link} to="/events">Events</Nav.Link>
            <Nav.Link as={Link} to="/blogs">Blogs</Nav.Link>
            <Nav.Link as={Link} to="/leaderboard">Leaderboard</Nav.Link>
            {isAuthenticated() && <Nav.Link as={Link} to="/badges">Badges</Nav.Link>}
            {isAuthenticated() && (
              <Nav.Link as={Link} to="/chat" className="position-relative d-flex align-items-center">
                Chat
                {unreadChatsCount > 0 && (
                  <Badge bg="danger" pill className="ms-2" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
                    {unreadChatsCount}
                  </Badge>
                )}
              </Nav.Link>
            )}
          </Nav>

          <Nav>
            {isAuthenticated() ? (
              <>
                <Nav.Link as={Link} to="/notifications" className="position-relative">
                  Notifications
                  {unreadCount > 0 && (
                    <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                      {unreadCount}
                    </Badge>
                  )}
                </Nav.Link>

                <Button
                  onClick={toggleTheme}
                  variant="link"
                  className="theme-toggle nav-link"
                  title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </Button>

                <NavDropdown
                  title={`👤 ${user.name}`}
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/dashboard">
                    Dashboard
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to={`/profile/${user.userId}`}>
                    Profile
                  </NavDropdown.Item>
                  
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/my-events">
                    My Events
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/my-blogs">
                    My Blogs
                  </NavDropdown.Item>
                  
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/participation-requests">
                    My Participation Requests
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/my-event-requests">
                    Event Participation Requests
                  </NavDropdown.Item>

                  {(user.role === USER_ROLES.SUPERVISOR || user.role === USER_ROLES.ADMIN) && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Item as={Link} to="/events/approvals">
                        Event Approvals
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/blogs/approvals">
                        Blog Approvals
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/reports">
                        Reports
                      </NavDropdown.Item>
                    </>
                  )}

                  {user.role === USER_ROLES.ADMIN && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Item as={Link} to="/admin/users">
                        Manage Users
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/universities">
                        Manage Universities
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/analytics">
                        Analytics
                      </NavDropdown.Item>
                    </>
                  )}

                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/settings">
                    Settings
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Button
                  onClick={toggleTheme}
                  variant="link"
                  className="theme-toggle nav-link"
                  title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </Button>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  className="me-2"
                >
                  Login
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="primary"
                >
                  Register
                </Button>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
