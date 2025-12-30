import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';
import './LeaderboardPreview.css';

const LeaderboardPreview = ({ contributors = [] }) => {
    const getBadgeInfo = (rank) => {
        switch (rank) {
            case 1:
                return {
                    level: 'Gold',
                    icon: <FaTrophy />,
                    color: '#FFD700',
                    bg: 'warning'
                };
            case 2:
                return {
                    level: 'Silver',
                    icon: <FaMedal />,
                    color: '#C0C0C0',
                    bg: 'secondary'
                };
            case 3:
                return {
                    level: 'Bronze',
                    icon: <FaAward />,
                    color: '#CD7F32',
                    bg: 'danger'
                };
            default:
                return {
                    level: '',
                    icon: null,
                    color: '',
                    bg: 'primary'
                };
        }
    };

    const getAvatarColor = (rank) => {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        ];
        return colors[rank - 1] || colors[0];
    };

    return (
        <div className="leaderboard-preview">
            {contributors.map((contributor, index) => {
                const rank = index + 1;
                const badgeInfo = getBadgeInfo(rank);

                return (
                    <Card
                        key={index}
                        className={`leaderboard-item rank-${rank}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <Card.Body className="d-flex align-items-center">
                            <div className="rank-number" style={{ color: badgeInfo.color }}>
                                #{rank}
                            </div>
                            <div
                                className="contributor-avatar"
                                style={{ background: getAvatarColor(rank) }}
                            >
                                {contributor.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="contributor-info flex-grow-1">
                                <div className="contributor-name">{contributor.name}</div>
                                <Badge bg={badgeInfo.bg} className="badge-level">
                                    {badgeInfo.icon && <span className="badge-icon">{badgeInfo.icon}</span>}
                                    {badgeInfo.level}
                                </Badge>
                            </div>
                            <div className="contributor-points">
                                <div className="points-value">{contributor.points}</div>
                                <div className="points-label">points</div>
                            </div>
                        </Card.Body>
                    </Card>
                );
            })}
        </div>
    );
};

export default LeaderboardPreview;
