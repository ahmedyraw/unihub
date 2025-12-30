import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge as BSBadge, ProgressBar, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import gamificationService from '../services/gamificationService';
import { formatPoints, getBadgeColor, calculateBadgeProgress } from '../utils/helpers';

const Badges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      if (user) {
        const data = await gamificationService.getMyBadges();
        setBadges(data.allBadges || []);
        setEarnedBadges(data.earnedBadges || []);
        setCurrentPoints(data.currentPoints || 0);
      } else {
        // For non-authenticated users, fetch all badges
        const allBadges = await gamificationService.getAllBadges();
        setBadges(Array.isArray(allBadges) ? allBadges : []);
        setEarnedBadges([]);
        setCurrentPoints(0);
      }
    } catch (error) {
      console.error('Failed to load badges:', error);
      setBadges([]);
      setEarnedBadges([]);
      setCurrentPoints(0);
    } finally {
      setLoading(false);
    }
  };

  const isBadgeEarned = (badge) => {
    if (!user) return false;
    return currentPoints >= badge.pointsThreshold;
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
    <Container className="py-4" style={{ marginTop: '100px' }}>
      <Row className="mb-4">
        <Col>
          <h2>🏆 Badges</h2>
          <p className="text-muted">
            {user ? 'Earn points to unlock achievement badges' : 'Register to start earning badges!'}
          </p>
          {user && (
            <div className="alert alert-info">
              <strong>Your Progress:</strong> {formatPoints(currentPoints)} points earned
            </div>
          )}
        </Col>
      </Row>

      <Row className="g-4">
        {badges.map((badge) => {
          const earned = isBadgeEarned(badge);
          const progress = calculateBadgeProgress(currentPoints, badge.pointsThreshold);
          
          return (
            <Col md={6} lg={4} key={badge.badgeId}>
              <Card className={`h-100 ${earned ? 'border-success' : 'border-secondary'}`}>
                <Card.Body>
                  <div className="text-center mb-3">
                    <div 
                      className={`badge bg-${getBadgeColor(badge.name)} fs-1 p-4 rounded-circle ${!earned && 'opacity-50'}`}
                      style={{ width: '100px', height: '100px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {earned ? '🏆' : '🔒'}
                    </div>
                  </div>
                  
                  <h5 className="text-center mb-2">{badge.name}</h5>
                  <p className="text-center text-muted small mb-3">{badge.description}</p>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Points Required:</span>
                      <strong>{formatPoints(badge.pointsThreshold)}</strong>
                    </div>
                    {user && (
                      <>
                        <ProgressBar 
                          now={progress} 
                          variant={earned ? 'success' : 'primary'}
                          label={`${progress}%`}
                        />
                      </>
                    )}
                  </div>
                  
                  <div className="text-center">
                    {earned ? (
                      <BSBadge bg="success" className="px-3 py-2">
                        ✓ Earned
                      </BSBadge>
                    ) : (
                      <BSBadge bg="secondary" className="px-3 py-2">
                        🔒 Locked
                      </BSBadge>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {!user && (
        <Row className="mt-4">
          <Col>
            <Card className="bg-light">
              <Card.Body className="text-center">
                <h5>Want to earn badges?</h5>
                <p className="text-muted mb-3">
                  Register now to start participating and unlocking achievements!
                </p>
                <Button variant="primary" href="/register">
                  Register Now
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Badges;
