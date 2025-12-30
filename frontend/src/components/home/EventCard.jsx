import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import './EventCard.css';

const EventCard = ({
    category,
    title,
    date,
    time,
    location,
    attendees,
    delay = 0
}) => {
    return (
        <Card className="event-card" style={{ animationDelay: `${delay}ms` }}>
            <Card.Body>
                <Badge bg="primary" className="event-category mb-3">
                    {category}
                </Badge>
                <Card.Title className="event-title">{title}</Card.Title>
                <div className="event-details">
                    <div className="event-detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <span>{date}</span>
                    </div>
                    <div className="event-detail-item">
                        <FaClock className="detail-icon" />
                        <span>{time}</span>
                    </div>
                    <div className="event-detail-item">
                        <FaMapMarkerAlt className="detail-icon" />
                        <span>{location}</span>
                    </div>
                    <div className="event-detail-item">
                        <FaUsers className="detail-icon" />
                        <span>{attendees} attending</span>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default EventCard;
