import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Navbar, Badge, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPublicTournaments } from '../services/api';

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [publicTournaments, setPublicTournaments] = useState([]);
    const [loading, setLoading] = useState(false);



    const savedUser = localStorage.getItem('user');
    const isLoggedIn = savedUser ? true : false;

    // Dati mockati per la sezione Top Players (in futuro potrai collegarli al backend)
    const topPlayers = [
        { id: 1, name: "Alessandro Rossi", team: "FC Internazionale", goals: 12, Role: "Attaccante", mvp: 4 },
        { id: 2, name: "Marco Bianchi", team: "Milan Club", goals: 9, Role: "Centrocampista", mvp: 3 },
        { id: 3, name: "Luca Verdi", team: "Juventus Academy", goals: 8, Role: "Ala Destra", mvp: 5 }
    ];

    const loadPublicTournaments = async () => {
        setLoading(true);
        try {
            const response = await getPublicTournaments();
            const dataGrezzi = response.data || response;
            const dataArray = Array.isArray(dataGrezzi)
                ? dataGrezzi
                : (dataGrezzi.tournaments || dataGrezzi.data || []);
            setPublicTournaments(dataArray);
        } catch (error) {
            console.error("Errore nel caricamento dei tornei pubblici:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPublicTournaments();
        if (window.history.state && window.history.state.usr) {
            window.history.replaceState({}, document.title);
        }
    }, []);

    const getStatusBadge = (status) => {
        switch (status?.toUpperCase()) {
            case 'IN CORSO':
                return <Badge bg="success" className="px-3 py-2 text-uppercase fw-bold rounded-pill shadow-sm">Live 🟢</Badge>;
            case 'FINITO':
                return <Badge bg="secondary" className="px-3 py-2 text-uppercase fw-bold rounded-pill">Concluso 🏁</Badge>;
            default:
                return <Badge bg="warning" text="dark" className="px-3 py-2 text-uppercase fw-bold rounded-pill shadow-sm">Programmato ⏳</Badge>;
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f9fa' }}>

            {/* 1️⃣ NAVBAR MODERNA */}
            <Navbar bg="dark" variant="dark" expand="lg" className="py-3 sticky-top shadow" style={{ borderBottom: '4px solid #00d6fd' }}>
                <Container>
                    <Navbar.Brand className="fw-extrabold fs-3 d-flex align-items-center gap-2" style={{ cursor: 'pointer', letterSpacing: '0.5px', fontWeight: 800 }} onClick={() => navigate('/')}>
                        <span style={{ color: '#00d6fd' }}>🏆</span> TOURNAMENT<span style={{ color: '#00d6fd' }}>HUB</span>
                    </Navbar.Brand>
                    <div className="d-flex gap-3">
                        {isLoggedIn ? (
                            <Button variant="info" className="fw-bold text-dark px-4 rounded-pill shadow-sm" onClick={() => navigate('/dashboard')}>
                                Pannello Gestore ⚙️
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline-light" className="fw-bold px-4 rounded-pill" onClick={() => navigate('/login')}>Accedi</Button>
                                <Button variant="info" className="fw-bold text-dark px-4 rounded-pill shadow-sm" onClick={() => navigate('/register')}>Registrati</Button>
                            </>
                        )}
                    </div>
                </Container>
            </Navbar>

            {/* 2️⃣ HERO SECTION SPORTIVA */}
            <div className="text-white text-center py-5 d-flex align-items-center" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                minHeight: '45vh',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '60%', height: '200%', background: 'rgba(0, 214, 253, 0.03)', transform: 'rotate(-30deg)', pointerEvents: 'none' }}></div>

                <Container style={{ position: 'relative', zIndex: 2 }}>
                    <Badge bg="info" text="dark" className="mb-3 px-3 py-2 fw-bold text-uppercase rounded-pill">Scouting & Digital Tournament Platform</Badge>
                    <h1 className="display-4 fw-black mb-3" style={{ letterSpacing: '-1px', fontWeight: 800 }}>
                        Il Calcio d'Inizio della tua <span style={{ color: '#00d6fd' }}>Carriera</span>
                    </h1>
                    <p className="lead mx-auto mb-4 text-white-50" style={{ maxWidth: '700px', fontSize: '1.25rem' }}>
                        Gestisci i tuoi tornei con precisione matematica e metti in mostra il talento. La combinazione perfetta tra organizzazione eventi e scouting digitale.
                    </p>
                    {!isLoggedIn && (
                        <div className="d-flex justify-content-center gap-3">
                            <Button variant="info" size="lg" className="fw-bold text-dark px-5 py-3 rounded-pill shadow" onClick={() => navigate('/register')}>
                                Crea il tuo Profilo 🚀
                            </Button>
                        </div>
                    )}
                </Container>
            </div>

            {/* 3️⃣ COUNTER STATISTICHE FLAT */}
            <div className="bg-white py-4 shadow-sm border-bottom">
                <Container>
                    <Row className="text-center g-3">
                        <Col xs={4} md={4}>
                            <h3 className="fw-extrabold text-dark m-0" style={{ fontWeight: 800, color: '#0f172a' }}>+40</h3>
                            <small className="text-muted text-uppercase fw-bold tracking-wider" style={{ fontSize: '11px' }}>Club Registrati</small>
                        </Col>
                        <Col xs={4} md={4} className="border-start border-end">
                            <h3 className="fw-extrabold text-info m-0" style={{ fontWeight: 800 }}>+180</h3>
                            <small className="text-muted text-uppercase fw-bold tracking-wider" style={{ fontSize: '11px' }}>Match Disputati</small>
                        </Col>
                        <Col xs={4} md={4}>
                            <h3 className="fw-extrabold text-dark m-0" style={{ fontWeight: 800 }}>+450</h3>
                            <small className="text-muted text-uppercase fw-bold tracking-wider" style={{ fontSize: '11px' }}>Gol Segnati</small>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* 4️⃣ VETRINA TORNEI ATTIVI */}
            <Container className="py-5">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
                    <div>
                        <h2 className="fw-bold text-dark m-0 d-flex align-items-center gap-2" style={{ fontWeight: 700 }}>
                            🏟️ Competizioni Live & Programmate
                        </h2>
                        <p className="text-muted m-0 small d-none d-sm-block">Seleziona un evento per consultare i calendari, i tabelloni e le classifiche aggiornate.</p>
                    </div>
                    <Button variant="outline-dark" size="sm" className="fw-bold rounded-pill px-3" onClick={loadPublicTournaments}>
                        Aggiorna Risultati 🔄
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="info" style={{ width: '3rem', height: '3rem' }} />
                        <p className="text-muted mt-3 fw-semibold">Caricamento tabelloni in corso...</p>
                    </div>
                ) : publicTournaments.length === 0 ? (
                    <Row className="justify-content-center my-4">
                        <Col md={7} className="text-center py-5 bg-white rounded-4 shadow-sm border border-dashed">
                            <span className="fs-1">⚽</span>
                            <h4 className="fw-bold text-secondary mt-3">Nessuna competizione attiva</h4>
                            <p className="text-muted small m-0">Al momento i campi sono liberi. Accedi come gestore per inaugurare il primo torneo stagionale!</p>
                        </Col>
                    </Row>
                ) : (
                    <Row className="g-4">
                        {publicTournaments.map((t) => (
                            <Col md={4} key={t._id}>
                                <Card className="h-100 border-0 shadow-sm bg-white" style={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                    <div style={{ height: '6px', background: 'linear-gradient(90deg, #00d6fd, #0284c7)' }}></div>
                                    <Card.Body className="p-4 d-flex flex-column justify-content-between">
                                        <div>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                {getStatusBadge(t.status)}
                                                <small className="text-muted fw-bold bg-light px-2 py-1 rounded">Gara ID: {t._id ? t._id.substring(t._id.length - 6) : 'N/A'}</small>
                                            </div>

                                            <Card.Title className="fw-bold text-dark fs-3 mb-2 text-truncate" style={{ fontWeight: 700 }} title={t.name}>
                                                {t.name}
                                            </Card.Title>

                                            <div className="bg-light rounded-3 p-3 my-3 border border-light">
                                                <div className="d-flex justify-content-between text-secondary mb-1 small">
                                                    <span>🛡️ Club Iscritti:</span>
                                                    <span className="fw-bold text-dark">{t.teams?.length || t.localTeams?.length || 0} Squadre</span>
                                                </div>
                                                <div className="d-flex justify-content-between text-secondary small">
                                                    <span>🏆 Formula:</span>
                                                    <span className="fw-bold text-dark text-uppercase small">Girone All'Italiana</span>
                                                </div>
                                                <div className="d-flex justify-content-between text-secondary mt-2 pt-2 border-top small">
                                                    <span>👤 Organizzatore:</span>
                                                    <span
                                                        className="fw-semibold text-dark text-truncate ms-2"
                                                        style={{ maxWidth: '160px' }}
                                                        title={typeof t.userId === 'object' ? t.userId?.email : 'Organizzatore Torneo'}
                                                    >
                                                        {typeof t.userId === 'object' && t.userId?.email ? t.userId.email : 'Admin Hub'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="dark"
                                            className="w-100 fw-bold py-2.5 mt-2 shadow-sm rounded-pill d-flex align-items-center justify-content-center gap-2"
                                            style={{ backgroundColor: '#1e293b', border: 'none' }}
                                            onClick={() => navigate('/dashboard', { state: { tournament: t } })}
                                        >
                                            Visualizza Live Hub 📊
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>

            {/* 5️⃣ NUOVA SEZIONE: SCOUTING & TOP PLAYERS */}
            <div className="bg-light py-5 border-top border-bottom">
                <Container>
                    <div className="mb-4 text-center text-md-start">
                        <Badge bg="dark" className="px-3 py-2 text-uppercase mb-2 rounded-pill">Scouting Radar 🌟</Badge>
                        <h2 className="fw-bold text-dark m-0" style={{ fontWeight: 700 }}>Top Performance della Settimana</h2>
                        <p className="text-muted small">I profili in cima alle classifiche di rendimento osservati dai nostri partner.</p>
                    </div>

                    <Row className="g-4">
                        {topPlayers.map((player) => (
                            <Col md={4} key={player.id}>
                                <Card className="border-0 shadow-sm bg-white p-3 text-center" style={{ borderRadius: '16px' }}>
                                    <Card.Body>
                                        <div className="mx-auto bg-info text-dark rounded-circle d-flex align-items-center justify-content-center mb-3 fw-bold shadow-sm" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                                            🏃‍♂️
                                        </div>
                                        <h5 className="fw-bold text-dark mb-1">{player.name}</h5>
                                        <p className="text-muted small bg-light d-inline-block px-3 py-0.5 rounded-pill fw-semibold mb-3">{player.Role}</p>

                                        <div className="d-flex justify-content-around border-top pt-3 mt-2">
                                            <div>
                                                <small className="text-muted d-block small text-uppercase fw-bold">Gol</small>
                                                <span className="fs-5 fw-bold text-dark">{player.goals} ⚽</span>
                                            </div>
                                            <div className="border-start"></div>
                                            <div>
                                                <small className="text-muted d-block small text-uppercase fw-bold">MVP</small>
                                                <span className="fs-5 fw-bold text-primary">{player.mvp} ⭐</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-2 text-muted small bg-light p-2 rounded-3 text-truncate">
                                            Club: <strong>{player.team}</strong>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>

            {/* 6️⃣ NUOVA SEZIONE: CALL TO ACTION REGISTRAZIONE ATLETI */}
            <Container className="py-5 text-center">
                <Card className="border-0 shadow-sm text-white py-5 px-4 rounded-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-10%', bottom: '-20%', width: '30%', height: '150%', background: 'rgba(0, 214, 253, 0.04)', transform: 'rotate(45deg)', pointerEvents: 'none' }}></div>
                    <Card.Body style={{ position: 'relative', zIndex: 2 }}>
                        <h2 className="fw-black mb-3" style={{ fontWeight: 800 }}>Sei un calciatore? Entra nel Radar del Professionismo</h2>
                        <p className="mx-auto mb-4 text-white-50" style={{ maxWidth: '600px' }}>
                            Iscriviti, traccia le tue presenze, i tuoi gol e i tuoi voti nei tornei ufficiali. Costruisci il tuo passaporto digitale sportivo visionabile da osservatori e societa.
                        </p>
                        <Button variant="info" size="lg" className="fw-bold text-dark px-5 py-3 rounded-pill shadow" onClick={() => navigate('/register')}>
                            Inizia lo Scouting Ora ⚡
                        </Button>
                    </Card.Body>
                </Card>
            </Container>

            {/* 7️⃣ SEZIONE FUNZIONALITÀ APPLICAZIONE */}
            <div className="bg-white border-top py-5 shadow-inner">
                <Container>
                    <Row className="g-4 text-center">
                        <Col md={4}>
                            <div className="p-3">
                                <div className="fs-1 mb-2 text-info">🗓️</div>
                                <h5 className="fw-bold text-dark">Algoritmo Calendari</h5>
                                <p className="text-muted small m-0">Generazione automatica delle giornate di scontro (Formula Round-Robin) bilanciata in un click.</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="p-3">
                                <div className="fs-1 mb-2 text-info">📊</div>
                                <h5 className="fw-bold text-dark">Classifiche Dinamiche</h5>
                                <p className="text-muted small m-0">I punti vittoria, pareggio e le posizioni matematiche vengono calcolati all'istante al salvataggio dei gol.</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="p-3">
                                <div className="fs-1 mb-2 text-info">🔐</div>
                                <h5 className="fw-bold text-dark">Accesso Riservato</h5>
                                <p className="text-muted small m-0">Gli spettatori leggono i risultati pubblicamente in tempo reale, mentre solo l'organizzatore ha le chiavi di modifica.</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* 8️⃣ FOOTER */}
            <footer className="bg-dark text-white-50 text-center py-4 mt-auto border-top border-secondary" style={{ backgroundColor: '#0f172a' }}>
                <Container>
                    <small>© 2026 TOURNAMENTHUB — Il software gestionale definitivo per ASD, Leghe Indipendenti e Tornei Aziendali.</small>
                </Container>
            </footer>
        </div>
    );
};

export default Home;