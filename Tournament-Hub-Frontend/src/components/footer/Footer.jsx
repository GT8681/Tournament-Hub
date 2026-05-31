import React from 'react';
import { Container, Row, Col, Form, Button,Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="text-white pt-5 pb-4 mt-auto" style={{ 
            backgroundColor: '#0f172a', 
            borderTop: '4px solid #1e293b',
            fontFamily: '"Segoe UI", Roboto, sans-serif' 
        }}>
            <Container>
                <Row className="g-4">
                    
                    {/* COLONNA 1: LOGO E DESCRIZIONE */}
                    <Col lg={4} md={6}>
                        <h5 className="fw-extrabold text-uppercase mb-3 d-flex align-items-center gap-2" style={{ letterSpacing: '0.5px' }}>
                            <span style={{ color: '#00d6fd' }}>🏆</span> TOURNAMENT<span style={{ color: '#00d6fd' }}>HUB</span>
                        </h5>
                        <p className="small lh-lg" style={{ maxWidth: '320px' }}>
                            La piattaforma digitale definitiva per la gestione di tornei sportivi, calendari automatici e scouting atletico. Trasformiamo lo sport dilettantistico in un'esperienza da professionisti.
                        </p>
                        <div className="d-flex gap-2 mt-3">
                            {/* Icone social mockup con cerchiati */}
                            <Button variant="outline-light" size="sm" className="rounded-circle border-secondary " style={{ width: '36px', height: '36px', padding: '0' }}>📸</Button>
                            <Button variant="outline-light" size="sm" className="rounded-circle border-secondary " style={{ width: '36px', height: '36px', padding: '0' }}>🎵</Button>
                            <Button variant="outline-light" size="sm" className="rounded-circle border-secondary " style={{ width: '36px', height: '36px', padding: '0' }}>💼</Button>
                        </div>
                    </Col>

                    {/* COLONNA 2: LINK RAPIDI */}
                    <Col lg={2} md={6} xs={6}>
                        <h6 className="text-uppercase fw-bold mb-3 tracking-wider small" style={{ color: '#00d6fd' }}>Navigazione</h6>
                        <ul className="list-unstyled d-flex flex-column gap-2 small">
                            <li>
                                <span className="text-decoration-none bg-transparent border-0 p-0 text-start hover-white" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => navigate('/')}>
                                    Home Pubblica
                                </span>
                            </li>
                            <li>
                                <span className="text-decoration-none bg-transparent border-0 p-0 text-start hover-white" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => navigate('/dashboard')}>
                                    Pannello Gestore
                                </span>
                            </li>
                            <li>
                                <span className="text-decoration-none bg-transparent border-0 p-0 text-start hover-white" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => navigate('/login')}>
                                    Accedi Area Riservata
                                </span>
                            </li>
                        </ul>
                    </Col>

                    {/* COLONNA 3: SUPPORTO / CONTATTI */}
                    <Col lg={2} md={6} xs={6}>
                        <h6 className="text-uppercase fw-bold mb-3 tracking-wider small" style={{ color: '#00d6fd' }}>Supporto</h6>
                        <ul className="list-unstyled d-flex flex-column gap-2 small ">
                            <li>📧 info@tournamenthub.com</li>
                            <li>📞 +39 02 1234567</li>
                            <li>📍 Milano, Italia</li>
                            <li className="mt-1">
                                <Badge bg="secondary" className="bg-opacity-25 text-info fw-normal rounded-pill">Status: Online 🟢</Badge>
                            </li>
                        </ul>
                    </Col>

                    {/* COLONNA 4: NEWSLETTER / SCOUT RADAR */}
                    <Col lg={4} md={6}>
                        <h6 className="text-uppercase fw-bold mb-3 tracking-wider small" style={{ color: '#00d6fd' }}>Rimani Aggiornato</h6>
                        <p className="small mb-3">
                            Ricevi notifiche sull'apertura di nuovi tornei nella tua zona o sui radar di scouting attivi.
                        </p>
                        <Form onSubmit={(e) => { e.preventDefault(); alert("📨 Iscrizione finta effettuata!"); }} className="d-flex gap-2">
                            <Form.Control
                                type="email"
                                placeholder="La tua email..."
                                className="bg-dark text-white border-secondary rounded-pill px-3 small shadow-none"
                                style={{ fontSize: '14px', border: '1px solid #334155' }}
                                required
                            />
                            <Button variant="info" type="submit" className="fw-bold text-white rounded-pill px-3 btn-sm shadow-sm">
                                Unisciti
                            </Button>
                        </Form>
                    </Col>

                </Row>

                {/* LINEA SEPARATRICE INFERIORE */}
                <hr className="my-4" style={{ borderColor: '#1e293b' }} />

                {/* COPYRIGHT & NOTE LEGALI */}
                <Row className="align-items-center small g-2">
                    <Col md={6} className="text-center text-md-start">
                        <span>© 2026 TOURNAMENTHUB. Tutti i diritti riservati.</span>
                    </Col>
                    <Col md={6} className="text-center text-md-end">
                        <span className="me-3 hover-white" style={{ cursor: 'pointer' }}>Privacy Policy</span>
                        <span className="hover-white" style={{ cursor: 'pointer' }}>Termini di Servizio</span>
                    </Col>
                </Row>
            </Container>

            {/* Sottile tocco CSS inline per gestire l'effetto hover sui testi senza file CSS esterni */}
            <style>{`
                .hover-white:hover {
                    color: #fff !important;
                }
            `}</style>
        </footer>
    );
};

export default Footer;
