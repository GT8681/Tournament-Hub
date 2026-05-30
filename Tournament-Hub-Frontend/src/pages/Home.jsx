import React from 'react';
import { Container, Row, Col, Button, Card, Navbar, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Home = ({ tournaments = [] }) => {
    const navigate = useNavigate();
    
    // Controlliamo se c'è un utente loggato nel browser per gestire i bottoni
    const savedUser = localStorage.getItem('user');
    const isLoggedIn = savedUser ? true : false;

    return (
        <div className="bg-light" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
            
            {/* 🌐 NAVBAR PRINCIPALE */}
            <Navbar bg="dark" variant="dark" className="py-3 shadow-sm" style={{ borderBottom: '3px solid #0d6efd' }}>
                <Container>
                    <Navbar.Brand className="fw-bold fs-3 d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                        ⚽ <span style={{ color: '#0d6efd' }}>TOURNAMENT</span>HUB
                    </Navbar.Brand>
                    <div className="d-flex gap-2">
                        {/* SWITCH NAVBAR: Se loggato mostra la plancia, altrimenti i tasti d'accesso */}
                        {isLoggedIn ? (
                            <>
                            
                            <Button variant="primary" className="fw-bold px-3 shadow-sm" onClick={() => navigate('/dashboard')}>
                                Pannello di Controllo ⚙️
                            </Button>
                            
                         </>
                        ) : (
                            <>
                                <Button variant="outline-light" className="fw-bold px-3" onClick={() => navigate('/login')}>
                                    Accedi
                                </Button>
                                <Button variant="primary" className="fw-bold px-3" onClick={() => navigate('/register')}>
                                    Registrati
                                </Button>
                            </>
                        )}
                    </div>
                </Container>
            </Navbar>

            {/* 🟢 BANNER DELLE NEWS / MATCH IN EVIDENZA */}
            <div className="bg-secondary text-white py-2 overflow-hidden shadow-sm" style={{ minHeight: '40px', fontSize: '0.9rem' }}>
                <Container className="d-flex justify-content-around fw-bold flex-wrap gap-3">
                    <span className="text-warning">● STATO REVENUE PLATFORM:</span>
                    <div>🚀 +120 ASD Registrate questo mese</div>
                    <div>🔥 Oltre 4.000 atleti connessi</div>
                    <div>🏆 24 Nuovi Tornei pubblicati oggi</div>
                </Container>
            </div>

            {/* 🚀 HERO SECTION (VETRINA GENERALE) */}
            <div 
                className="text-white text-center d-flex align-items-center shadow" 
                style={{ 
                    background: 'linear-gradient(rgba(16, 20, 28, 0.85), rgba(24, 32, 46, 0.95)), url("https://images.unsplash.com/photo-1508098682722-e99c43a406b2?ixlib=rb-4.0.3") center/cover no-repeat',
                    padding: '90px 0',
                    borderBottom: '6px solid #0d6efd'
                }}
            >
                <Container>
                    <Row className="justify-content-center">
                        <Col md={10} lg={8}>
                            <Badge bg="danger" className="mb-3 px-3 py-2 fw-bold text-uppercase fs-6 shadow-sm tracking-wider">
                                La Piattaforma per i tuoi Eventi Sportivi 🌟
                            </Badge>
                            <h1 className="display-4 fw-bold mb-3 text-white text-uppercase" style={{ letterSpacing: '-1px' }}>
                                Organizza, Vendi e Gestisci <br/>i tuoi <span style={{ color: '#0d6efd' }}>Tornei di Calcio</span>
                            </h1>
                            <p className="lead opacity-95 mb-4 fs-5 text-light-50">
                                Trasforma la gestione dei tuoi eventi sportivi. Crea gironi competitivi, automatizza la vendita delle iscrizioni per i club e offri classifiche e calendari live in tempo reale a giocatori, tifosi e osservatori.
                            </p>
                            
                            <div className="d-flex justify-content-center gap-3">
                                {/* SWITCH BOTTONE HERO PRINCIPALE */}
                                {isLoggedIn ? (
                                    <Button 
                                        variant="primary" 
                                        size="lg" 
                                        className="fw-bold px-5 py-3 shadow-sm fs-4" 
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Ritorna ai tuoi Eventi Attivi →
                                    </Button>
                                ) : (
                                    <div className="d-flex gap-3">
                                        <Button 
                                            variant="primary" 
                                            size="lg" 
                                            className="fw-bold px-4 py-3 shadow-sm fs-5" 
                                            onClick={() => navigate('/login')}
                                        >
                                            Inizia a Organizzare 🚀
                                        </Button>
                                        <Button 
                                            variant="outline-light" 
                                            size="lg" 
                                            className="px-4 py-3 fs-5" 
                                            onClick={() => navigate('/register')}
                                        >
                                            Crea un Account Società
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* 🏆 📅 SEZIONE DINAMICA: VETRINA TORNEI REALI DAL DATABASE */}
            <Container className="py-5 my-3 flex-grow-1">
                <div className="text-center mb-5">
                    <Badge bg="primary" className="text-uppercase px-3 py-2 mb-2">Vetrina Competizioni</Badge>
                    <h2 className="fw-bold text-dark text-uppercase m-0">Tornei ed Eventi Disponibili</h2>
                    <p className="text-muted mt-2 fs-5">Scopri i tornei ufficiali attivi sulla piattaforma creati dai nostri organizzatori.</p>
                </div>

                <Row className="g-4">
                    {tournaments.length > 0 ? (
                        tournaments.map((tournament) => (
                            <Col key={tournament._id} xs={12} md={6} lg={4}>
                                <Card className="h-100 border-0 shadow-sm border" style={{ borderRadius: '12px' }}>
                                    <Card.Body className="p-4 d-flex flex-column justify-content-between">
                                        <div>
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <Badge bg={tournament.status === 'PROGRAMMATO' ? 'warning' : 'success'} text={tournament.status === 'PROGRAMMATO' ? 'dark' : 'white'} className="fw-bold">
                                                    {tournament.status || 'ATTIVO'}
                                                </Badge>
                                              
                                            </div>

                                            <Card.Title className="fw-bold text-dark fs-4 mb-2">{tournament.name}</Card.Title>
                                            <Card.Text className="text-muted small mb-0">
                                                ⚽ {tournament.teams?.length || tournament.localTeams?.length || 0} Club Partecipanti
                                            </Card.Text>
                                        </div>
                                        
                                        <Button 
                                            variant="outline-primary" 
                                            className="fw-bold mt-4 w-100" 
                                            onClick={() => {
                                                if (isLoggedIn) {
                                                    navigate('/dashboard');
                                                } else {
                                                    alert("Accedi per visualizzare i dettagli completi, i calendari e la classifica live di questo torneo!");
                                                    navigate('/login');
                                                }
                                            }}
                                        >
                                            Visualizza Torneo Live →
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <Col xs={12} className="text-center py-5 bg-white rounded border shadow-sm">
                            <div className="fs-3 text-muted fw-bold">⚠️ Nessun torneo presente al momento.</div>
                            <p className="text-muted m-0 mt-2">Accedi al tuo account organizzatore per lanciare la tua prima competizione ufficiale!</p>
                        </Col>
                    )}
                </Row>
            </Container>

            {/* 📊 SEZIONE PILASTRI FUNZIONALI DELLA PIATTAFORMA */}
            <div className="bg-white py-5 border-top border-bottom shadow-sm">
                <Container>
                    <h3 className="text-center fw-bold text-uppercase mb-5 text-dark">Perché scegliere la nostra suite organizzativa?</h3>
                    <Row className="g-4">
                        <Col md={4}>
                            <Card className="h-100 border-0 text-center p-2">
                                <Card.Body>
                                    <div className="fs-1 mb-2">💰</div>
                                    <Card.Title className="fw-bold text-dark">Monetizzazione Semplice</Card.Title>
                                    <Card.Text className="text-muted">
                                        Raccogli le quote di iscrizione delle squadre partecipanti e monitora i pagamenti direttamente dal tuo pannello di controllo.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="h-100 border-0 text-center p-2">
                                <Card.Body>
                                    <div className="fs-1 mb-2">🗓️</div>
                                    <Card.Title className="fw-bold text-dark">Algoritmo Calendari</Card.Title>
                                    <Card.Text className="text-muted">
                                        Basta fogli di calcolo fatti a mano. Il sistema genera i turni d'andata e ritorno bilanciando in automatico i campi di gara.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="h-100 border-0 text-center p-2">
                                <Card.Body>
                                    <div className="fs-1 mb-2">📈</div>
                                    <Card.Title className="fw-bold text-dark">Classifiche Live</Card.Title>
                                    <Card.Text className="text-muted">
                                        I gestori aggiornano i gol del match e l'app ricalcola istantaneamente punti, vittorie, e posizioni visibili a todo il pubblico.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* 📋 FOOTER */}
            <footer className="text-center py-4 text-muted bg-black mt-auto border-top border-secondary">
                <Container>
                    <p className="m-0 small text-light opacity-50 fw-bold">
                        © 2026 TOURNAMENTHUB - Il software gestionale definitivo per ASD e Organizzatori di Eventi Sportivi.
                    </p>
                </Container>
            </footer>

        </div>
    );
};

export default Home;
