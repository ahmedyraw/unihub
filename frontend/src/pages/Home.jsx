import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/home/HeroSection';
import FeatureCard from '../components/home/FeatureCard';
import EventCard from '../components/home/EventCard';
import OpportunityCard from '../components/home/OpportunityCard';
import LeaderboardPreview from '../components/home/LeaderboardPreview';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Mock data for upcoming events
  const upcomingEvents = [
    {
      category: 'Workshop',
      title: 'Web Development Bootcamp',
      date: 'Jan 15, 2026',
      time: '10:00 AM',
      location: 'Engineering Hall',
      attendees: 45
    },
    {
      category: 'Seminar',
      title: 'AI & Machine Learning Trends',
      date: 'Jan 18, 2026',
      time: '2:00 PM',
      location: 'Science Building',
      attendees: 78
    },
    {
      category: 'Competition',
      title: 'Hackathon 2026',
      date: 'Jan 20, 2026',
      time: '9:00 AM',
      location: 'Tech Hub',
      attendees: 120
    }
  ];

  // Mock data for opportunities
  const latestOpportunities = [
    {
      type: 'Internship',
      title: 'Software Engineering Intern',
      organization: 'Tech Innovations Inc.',
      location: 'Remote',
      postedTime: '2 hours ago'
    },
    {
      type: 'Part-time',
      title: 'Campus Ambassador',
      organization: 'EdTech Startup',
      location: 'On-site',
      postedTime: '5 hours ago'
    },
    {
      type: 'Research',
      title: 'AI Research Assistant',
      organization: 'University Lab',
      location: 'Hybrid',
      postedTime: '1 day ago'
    }
  ];

  // Mock data for top contributors
  const topContributors = [
    { name: 'Ahmed Hassan', points: 2450 },
    { name: 'Sarah Johnson', points: 2180 },
    { name: 'Mohamed Ali', points: 1990 }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <HeroSection />

      {/* Empowering University Communities Section */}
      <section className="section-empowering">
        <Container>
          <div className="section-header text-center">
            <h2 className="section-title">Empowering University Communities</h2>
            <p className="section-subtitle">
              Connect with peers, discover opportunities, and grow together in your academic journey
            </p>
          </div>
        </Container>
      </section>

      {/* Key Features Section */}
      <section className="section-features">
        <Container>
          <Row className="g-4">
            <Col md={6} lg={3}>
              <FeatureCard
                icon="📅"
                title="Events & Activities"
                description="Create and participate in university events. Earn points as organizer, volunteer, or attendee."
                delay={0}
              />
            </Col>
            <Col md={6} lg={3}>
              <FeatureCard
                icon="📝"
                title="Blogs & Opportunities"
                description="Share articles, internships, and job opportunities with your peers and community."
                delay={100}
              />
            </Col>
            <Col md={6} lg={3}>
              <FeatureCard
                icon="🏆"
                title="Points & Badges"
                description="Earn points for contributions and unlock achievement badges as you level up."
                delay={200}
              />
            </Col>
            <Col md={6} lg={3}>
              <FeatureCard
                icon="📊"
                title="University Leaderboards"
                description="Compete with peers and see top contributors across different universities."
                delay={300}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Powerful Features Section */}
      <section className="section-powerful-features">
        <Container>
          <div className="section-header text-center">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">
              Everything you need to engage, collaborate, and succeed
            </p>
          </div>
          <Row className="g-4">
            <Col md={6}>
              <div className="feature-box" style={{ animationDelay: '0ms' }}>
                <div className="feature-box-icon">📅</div>
                <h3 className="feature-box-title">Event Management</h3>
                <p className="feature-box-description">
                  Create, manage, and participate in university events. Track attendance,
                  manage volunteers, and earn points for every contribution.
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div className="feature-box" style={{ animationDelay: '100ms' }}>
                <div className="feature-box-icon">📝</div>
                <h3 className="feature-box-title">Blog & Opportunity Publishing</h3>
                <p className="feature-box-description">
                  Share knowledge, post internships, and publish job opportunities.
                  Help your peers discover valuable resources and grow together.
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div className="feature-box" style={{ animationDelay: '200ms' }}>
                <div className="feature-box-icon">🎮</div>
                <h3 className="feature-box-title">Gamification System</h3>
                <p className="feature-box-description">
                  Engage with a comprehensive points and badges system. Level up,
                  unlock achievements, and showcase your contributions.
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div className="feature-box" style={{ animationDelay: '300ms' }}>
                <div className="feature-box-icon">👥</div>
                <h3 className="feature-box-title">Role-based Dashboards</h3>
                <p className="feature-box-description">
                  Tailored dashboards for students, supervisors, and admins.
                  Each role gets the tools they need to succeed.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Upcoming Events Section */}
      <section className="section-events">
        <Container>
          <div className="section-header-with-action">
            <h2 className="section-title">Upcoming Events</h2>
            <Button
              as={Link}
              to="/events"
              variant="outline-primary"
              className="view-all-btn"
            >
              View All
            </Button>
          </div>
          <Row className="g-4 mt-1">
            {upcomingEvents.map((event, index) => (
              <Col md={6} lg={4} key={index}>
                <EventCard {...event} delay={index * 100} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Latest Opportunities Section */}
      <section className="section-opportunities">
        <Container>
          <div className="section-header-with-action">
            <h2 className="section-title">Latest Opportunities</h2>
            <Button
              as={Link}
              to="/blogs"
              variant="outline-primary"
              className="view-all-btn"
            >
              View All
            </Button>
          </div>
          <Row className="g-4 mt-1">
            {latestOpportunities.map((opportunity, index) => (
              <Col md={6} lg={4} key={index}>
                <OpportunityCard {...opportunity} delay={index * 100} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Top Contributors Section */}
      <section className="section-leaderboard">
        <Container>
          <div className="section-header text-center">
            <h2 className="section-title">Top Contributors</h2>
            <p className="section-subtitle">
              Celebrating our most active community members
            </p>
          </div>
          <Row className="justify-content-center">
            <Col lg={8}>
              <LeaderboardPreview contributors={topContributors} />
              <div className="text-center mt-4">
                <Button
                  as={Link}
                  to="/leaderboard"
                  variant="primary"
                  size="lg"
                  className="view-leaderboard-btn"
                >
                  View Full Leaderboard
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="section-cta">
        <Container>
          <div className="cta-content text-center">
            <h2 className="cta-title">Join Your University Community Today</h2>
            <p className="cta-description">
              Start your journey towards academic excellence and community engagement
            </p>
            <div className="cta-buttons">
              <Button
                as={Link}
                to="/register"
                variant="light"
                size="lg"
                className="cta-btn-primary"
              >
                Register Now
              </Button>
              <Button
                as={Link}
                to="/login"
                variant="outline-light"
                size="lg"
                className="cta-btn-secondary"
              >
                Login
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;
