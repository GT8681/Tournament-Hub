import React from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';

const EventCard = ({ event, onManage, isOwner }) => {
    const { title, type, date, location, price, maxTeams, registeredTeams, status } = event;
    const availableSlots = maxTeams - registeredTeams;

    return (
        <Card className="shadow-sm h-100 border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            {/* Badge di Stato sopra la card */}
            <div className="position-absolute top-0 end-0 m-3" style={{ zIndex: 10 }}>
                <Badge bg={status === 'Aperte' ? 'success' : 'danger'} className="px-3 py-2 fw-bold">
                    Iscrizioni {status}
                </Badge>
            </div>

            <Card.Body className="p-4 d-flex flex-column">
                <span className="text-primary fw-bold text-uppercase small mb-1">⚽ {type}</span>
                <Card.Title className="fw-bold fs-4 text-dark mb-3">{title}</Card.Title>
                
                <Row className="g-2 text-muted small mb-4">
                    <Col xs={12}>📍 <strong>Luogo:</strong> {location}</Col>
                    <Col xs={6}>📅 <strong>Data:</strong> {date}</Col>
                    <Col xs={6}>💰 <strong>Quota:</strong> {price === 0 ? 'Gratis' : `${price}€`}</Col>
                </Row>

                {/* Barra di riempimento posti per le squadre */}
                <div className="mb-4 mt-auto">
                    <div className="d-flex justify-content-between text-muted small mb-1">
                        <span>Squadre Iscritte: <strong>{registeredTeams}/{maxTeams}</strong></span>
                        <span className={availableSlots <= 2 ? "text-danger fw-bold" : ""}>
                            {availableSlots === 0 ? 'Tutto Esaurito' : `Solo ${availableSlots} posti rimasti`}
                        </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                        <div 
                            className={`progress-bar ${status === 'Aperte' ? 'bg-success' : 'bg-secondary'}`} 
                            role="progressbar" 
                            style={{ width: `${(registeredTeams / maxTeams) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Bottone Dinamico */}
                {isOwner ? (
                    <Button variant="dark" className="w-100 fw-bold mt-2" onClick={onManage}>
                        Gestisci Evento ⚙️
                    </Button>
                ) : (
                    <Button variant="primary" className="w-100 fw-bold mt-2" disabled={status !== 'Aperte'}>
                        {status === 'Aperte' ? 'Invia Richiesta Iscrizione 🚀' : 'Iscrizioni Chiuse'}
                    </Button>
                )}
            </Card.Body>
        </Card>
    );
};

export default EventCard;
