import React from 'react';
import { Card } from 'react-bootstrap';
import './FeatureCard.css';

const FeatureCard = ({ icon, title, description, delay = 0 }) => {
    return (
        <Card className="feature-card" style={{ animationDelay: `${delay}ms` }}>
            <Card.Body className="text-center">
                <div className="feature-icon">{icon}</div>
                <Card.Title className="feature-title">{title}</Card.Title>
                <Card.Text className="feature-description">{description}</Card.Text>
            </Card.Body>
        </Card>
    );
};

export default FeatureCard;
