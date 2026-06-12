import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const MyNavbar = ({ user, onLogout }) => {
    const navigate = useNavigate();
    // Verifichiamo se l'utente è loggato (usando la prop passata da App.jsx)
    const isLoggedIn = !!user; 

    return (
        <Navbar 
            bg="dark" 
            variant="dark" 
            expand="lg" 
            className="py-3 sticky-top shadow" 
            style={{ 
                backgroundColor: '#161922 !important', // Sfondo antracite coerente
                borderBottom: '3px solid #dc3545'      // Sfumatura/bordo rosso premium al posto del ciano
            }}
        >
            <Container className="d-flex justify-content-between align-items-center">
                {/* BRAND LOGO */}
                <Navbar.Brand 
                    className="fw-bold fs-3 d-flex align-items-center gap-2 m-0" 
                    style={{ cursor: 'pointer', letterSpacing: '0.5px', fontWeight: 800 }} 
                    onClick={() => navigate('/')}
                >
                    <span style={{ color: '#dc3545' }}>🏆</span> TOURNAMENT<span style={{ color: '#dc3545' }}>HUB</span>
                </Navbar.Brand>

                {/* 🚀 BOTTONI ALLINEATI CORRETTAMENTE */}
                {/* Rimosso mt-3 che spaccava l'allineamento verticale della barra */}
                <div className="d-flex align-items-center gap-2">
                    {isLoggedIn ? (
                        <>
                            {/* Bottone Gestore stile scuro coordinato */}
                            <Button 
                                className="btn-action-details-horizontal fw-bold text-uppercase px-3 py-1.5 small rounded-3" 
                                onClick={() => navigate('/dashboard')}
                            >
                                ⚙️ Gestore
                            </Button>
                            
                            {/* Bottone Profilo stile outline chiaro */}
                            <Button
                                variant="outline-light"
                                className="fw-bold text-uppercase px-3 py-1.5 small rounded-3"
                                style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}
                                onClick={() => navigate('/profile')}
                            >
                                👤 Profilo
                            </Button>

                            {/* Bottone Logout (Opzionale ma comodissimo averlo in Navbar) */}
                            <Button
                                variant="link"
                                className="text-white-50 text-decoration-none small fw-bold text-uppercase ps-2"
                                onClick={onLogout}
                            >
                                Esci
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline-light" className="fw-bold px-3 py-1.5 small rounded-3" onClick={() => navigate('/login')}>Accedi</Button>
                            <Button className="btn-modal-login fw-bold text-uppercase px-3 py-1.5 small rounded-3" onClick={() => navigate('/register')}>Registrati</Button>
                        </>
                    )}
                </div>
            </Container>
        </Navbar>
    );
};

export default MyNavbar;
