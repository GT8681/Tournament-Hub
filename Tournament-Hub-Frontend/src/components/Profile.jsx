import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const navigate = useNavigate();

    // 🚀 RECUPERO LOCALE: Leggiamo l'utente salvato nel browser durante il login/finto login
    const savedUser = localStorage.getItem('user');
    const userData = savedUser ? JSON.parse(savedUser) : null;

    // Se per qualche motivo l'utente non è loggato in locale, lo rimandiamo indietro
    if (!userData) {
        return (
            <Container className="mt-5 text-center text-white">
                <h4>Nessun utente autenticato localmente.</h4>
                <Button variant="danger" className="mt-3" onClick={() => navigate('/login')}>
                    Vai al Login
                </Button>
            </Container>
        );
    }

    // Funzione di Logout (pulisce il browser e resetta l'app)
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Ricarichiamo la pagina o usiamo una funzione globale per resettare lo stato di App.jsx
        window.location.href = '/login'; 
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    {/* Card Profilo scura coordinata al tuo foglio di stile */}
                    <Card className="border-0 player-card-horizontal p-4" style={{ height: 'auto' }}>
                        <div className="text-center mb-4">
                            {/* Avatar con l'iniziale del nome */}
                            <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center mx-auto mb-3 shadow" 
                                 style={{ width: '80px', height: '80px', fontSize: '2rem', fontWeight: 'bold' }}>
                                {userData.name? userData.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            
                            <h3 className="text-dark fw-bold text-uppercase tracking-wide mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                {userData.name || 'Utente Gestore'}
                            </h3>
                            
                            <span className="badge bg-dark bg-opacity-75 text-dark-50 border border-secondary border-opacity-25 px-3 py-1.5 text-uppercase font-monospace" style={{ fontSize: '0.7rem' }}>
                                🛡️ Amministratore Locale
                            </span>
                        </div>

                        <hr className="border-secondary opacity-25 my-4" />

                        {/* Dettagli letti dal localStorage */}
                        <div className="mb-4">
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-dark-50 small text-uppercase">Username</span>
                                <span className="text-dark fw-semibold font-monospace">{userData.name || 'N/D'}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-dark-50 small text-uppercase">Email</span>
                                <span className="text-dark fw-semibold font-monospace">{userData.email || 'N/D'}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-dark-50 small text-uppercase">Stato Sessione</span>
                                <span className="text-success fw-bold font-monospace">Attiva (Local)</span>
                            </div>
                        </div>

                        {/* Pulsanti di Azione */}
                        <div className="d-flex flex-column gap-2 mt-4">
                            <Button 
                                className="btn-action-details-horizontal w-100 fw-bold text-uppercase py-2 rounded-3 small"
                                onClick={() => navigate('/')}
                            >
                                🏠 Torna alla Home
                            </Button>
                            
                            <Button 
                                variant="danger" 
                                className="w-100 fw-bold text-uppercase py-2 rounded-3 small btn-modal-login"
                                onClick={handleLogout}
                            >
                                🚪 Disconnetti Account
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;
