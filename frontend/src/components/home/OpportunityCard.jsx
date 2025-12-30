import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { FaBuilding, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import './OpportunityCard.css';

const OpportunityCard = ({
    type,
    title,
    organization,
    location,
    postedTime,
    delay = 0
}) => {
    const getTypeBadgeVariant = (type) => {
        switch (type?.toLowerCase()) {
            case 'internship':
                return 'info';
            case 'part-time':
                return 'success';
            case 'research':
                return 'warning';
            case 'full-time':
                return 'primary';
            default:
                return 'secondary';
        }
    };

    return (
        <Card className="opportunity-card" style={{ animationDelay: `${delay}ms` }}>
            <Card.Body>
                <Badge bg={getTypeBadgeVariant(type)} className="opportunity-type mb-3">
                    {type}
                </Badge>
                <Card.Title className="opportunity-title">{title}</Card.Title>
                <div className="opportunity-details">
                    <div className="opportunity-detail-item">
                        <FaBuilding className="detail-icon" />
                        <span>{organization}</span>
                    </div>
                    <div className="opportunity-detail-item">
                        <FaMapMarkerAlt className="detail-icon" />
                        <span>{location}</span>
                    </div>
                    <div className="opportunity-detail-item">
                        <FaClock className="detail-icon" />
                        <span className="text-muted">{postedTime}</span>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default OpportunityCard;
