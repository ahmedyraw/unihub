import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-main">
      <Container>
        <Row className="footer-content">
          {/* Brand Section */}
          <Col lg={4} md={6} className="mb-4 mb-lg-0">
            <div className="footer-brand">
              <h5 className="footer-logo">🎓 UniHub</h5>
              <p className="footer-description">
                Empowering university communities through engagement, collaboration, and growth.
                Connect with peers and achieve excellence together.
              </p>
            </div>
          </Col>

          {/* Quick Links */}
          <Col lg={2} md={6} sm={6} className="mb-4 mb-lg-0">
            <h6 className="footer-heading">Quick Links</h6>
            <ul className="footer-links">
              <li><Link to="/">About</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/blogs">Blogs</Link></li>
              <li><Link to="/leaderboard">Leaderboard</Link></li>
            </ul>
          </Col>

          {/* Resources */}
          <Col lg={2} md={6} sm={6} className="mb-4 mb-lg-0">
            <h6 className="footer-heading">Resources</h6>
            <ul className="footer-links">
              <li><Link to="/">Features</Link></li>
              <li><Link to="/">FAQ</Link></li>
              <li><Link to="/">Contact</Link></li>
              <li><Link to="/">Support</Link></li>
            </ul>
          </Col>

          {/* Legal */}
          <Col lg={2} md={6} sm={6} className="mb-4 mb-lg-0">
            <h6 className="footer-heading">Legal</h6>
            <ul className="footer-links">
              <li><Link to="/">Privacy Policy</Link></li>
              <li><Link to="/">Terms of Service</Link></li>
              <li><Link to="/">Cookie Policy</Link></li>
              <li><Link to="/">Guidelines</Link></li>
            </ul>
          </Col>

          {/* Social */}
          <Col lg={2} md={6} sm={6}>
            <h6 className="footer-heading">Follow Us</h6>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" title="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" title="Twitter">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" title="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" title="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </Col>
        </Row>

        {/* Copyright */}
        <Row className="footer-bottom">
          <Col className="text-center">
            <p className="copyright-text">
              © 2025 UniHub. All rights reserved. Built with ❤️ for university communities.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
