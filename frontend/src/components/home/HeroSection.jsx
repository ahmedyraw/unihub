import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <div className="hero-section">
      <Container>
        <Row className="align-items-center min-vh-75">
          <Col lg={6} className="hero-content">
            <div className="hero-label">
              <span className="label-text">University Engagement Platform</span>
            </div>
            <h1 className="hero-title">
              Connect. Participate. <span className="highlight">Get Rewarded.</span>
            </h1>
            <p className="hero-description">
              Join your university community, participate in events, share knowledge through blogs,
              and earn points to climb the leaderboard. Your engagement matters.
            </p>
            <div className="hero-buttons">
              <Button 
                as={Link} 
                to="/register" 
                variant="primary" 
                size="lg" 
                className="btn-get-started"
              >
                Get Started
              </Button>
              <Button 
                as={Link} 
                to="/events" 
                variant="outline-primary" 
                size="lg"
                className="btn-explore"
              >
                Explore Events
              </Button>
            </div>
          </Col>
          <Col lg={6} className="hero-image-container">
            <div className="hero-image-wrapper">
              <div className="floating-card card-1">
                <div className="card-icon">📅</div>
                <div className="card-text">200+ Events</div>
              </div>
              <div className="floating-card card-2">
                <div className="card-icon">🏆</div>
                <div className="card-text">Top Contributors</div>
              </div>
              <div className="floating-card card-3">
                <div className="card-icon">📝</div>
                <div className="card-text">Share Ideas</div>
              </div>
              <div className="hero-illustration">
                <div className="illustration-circle circle-1"></div>
                <div className="illustration-circle circle-2"></div>
                <div className="illustration-circle circle-3"></div>
                <div className="illustration-center">
                  <span className="center-emoji">🎓</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HeroSection;
