import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Badge, ButtonGroup, Button, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import gamificationService from '../services/gamificationService';
import { formatPoints, getBadgeColor } from '../utils/helpers';
import { LEADERBOARD_SCOPES, LEADERBOARD_TYPES } from '../utils/constants';

const Leaderboard = () => {
  const { user } = useAuth();
  const { leaderboardUpdated } = useWebSocket();
  const [scope, setScope] = useState(LEADERBOARD_SCOPES.GLOBAL);
  const [type, setType] = useState(LEADERBOARD_TYPES.MEMBERS);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const universityId = scope === LEADERBOARD_SCOPES.UNIVERSITY ? user?.universityId : null;
      const data = await gamificationService.getLeaderboard(scope, type, universityId);
      const rankings = data?.rankings || [];
      setLeaderboardData(Array.isArray(rankings) ? rankings : []);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  }, [scope, type, user?.universityId]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Auto-refresh leaderboard when WebSocket update received
  useEffect(() => {
    if (leaderboardUpdated) {
      loadLeaderboard();
    }
  }, [leaderboardUpdated, loadLeaderboard]);

  return (
    <Container className="py-4" style={{ marginTop: '100px' }}>
      <Row className="mb-4">
        <Col>
          <h2>🏆 Leaderboard</h2>
          <p className="text-muted">See top contributors and events</p>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Form.Label>Leaderboard Type</Form.Label>
              <ButtonGroup className="w-100">
                <Button
                  variant={type === LEADERBOARD_TYPES.MEMBERS ? 'primary' : 'outline-primary'}
                  onClick={() => setType(LEADERBOARD_TYPES.MEMBERS)}
                >
                  👥 Members
                </Button>
                <Button
                  variant={type === LEADERBOARD_TYPES.EVENTS ? 'primary' : 'outline-primary'}
                  onClick={() => setType(LEADERBOARD_TYPES.EVENTS)}
                >
                  📅 Events
                </Button>
              </ButtonGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Form.Label>Scope</Form.Label>
              <ButtonGroup className="w-100">
                <Button
                  variant={scope === LEADERBOARD_SCOPES.UNIVERSITY ? 'success' : 'outline-success'}
                  onClick={() => setScope(LEADERBOARD_SCOPES.UNIVERSITY)}
                  disabled={!user}
                >
                  🏫 My University
                </Button>
                <Button
                  variant={scope === LEADERBOARD_SCOPES.GLOBAL ? 'success' : 'outline-success'}
                  onClick={() => setScope(LEADERBOARD_SCOPES.GLOBAL)}
                >
                  🌍 Global
                </Button>
              </ButtonGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Leaderboard Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            {type === LEADERBOARD_TYPES.MEMBERS ? '👥 Top Members' : '📅 Top Events'}
            {' - '}
            {scope === LEADERBOARD_SCOPES.UNIVERSITY ? 'University' : 'Global'}
          </h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : leaderboardData.length > 0 ? (
            <Table hover responsive>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Rank</th>
                  {type === LEADERBOARD_TYPES.MEMBERS ? (
                    <>
                      <th>Name</th>
                      <th>University</th>
                      <th>Badge</th>
                      <th className="text-end">Points</th>
                    </>
                  ) : (
                    <>
                      <th>Event Title</th>
                      <th>Organizer</th>
                      <th>Type</th>
                      <th className="text-end">Participants</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((item, index) => (
                  <tr key={type === LEADERBOARD_TYPES.MEMBERS ? `member-${item.userId || index}` : `event-${item.eventId || index}`}>
                    <td>
                      <h4 className="mb-0 text-muted">#{index + 1}</h4>
                    </td>
                    {type === LEADERBOARD_TYPES.MEMBERS ? (
                      <>
                        <td>
                          <strong>{item.name}</strong>
                          {user && item.userId === user.userId && (
                            <Badge bg="info" className="ms-2">You</Badge>
                          )}
                        </td>
                        <td>{item.university?.name}</td>
                        <td>
                          {item.currentBadge && (
                            <Badge bg={getBadgeColor(item.currentBadge.name)}>
                              {item.currentBadge.name}
                            </Badge>
                          )}
                        </td>
                        <td className="text-end">
                          <Badge bg="primary" pill>{formatPoints(item.points)} pts</Badge>
                        </td>
                      </>
                    ) : (
                      <>
                        <td><strong>{item.title}</strong></td>
                        <td>{item.creator?.name}</td>
                        <td><Badge bg="secondary">{item.type}</Badge></td>
                        <td className="text-end">
                          <Badge bg="success" pill>{item.participants?.length || 0}</Badge>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5 text-muted">
              No data available
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Leaderboard;
