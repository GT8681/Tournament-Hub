import React, { useState, useEffect } from 'react';
import {
    Button,
    Card,
    Table,
    Spinner,
    Alert,
    Form,
    Row,
    Col,
    Badge,
    ListGroup,
    Modal
} from 'react-bootstrap';
import {
    getMatches,
    getStandings,
    generateCalendar,
    updateMatchResult,
    getTournaments,
    getTeamsByTournamentService,
    createTournament,
    deleteTournamentService
} from '../services/api';

const Dashboard = ({ onTournamentsUpdate }) => {
    // ==========================================
    // STATI GESTIONE HUB (MULTI-TORNEO)
    // ==========================================
    const [myTournaments, setMyTournaments] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [tournamentId, setTournamentId] = useState('');
    const [tournamentName, setTournamentName] = useState('');

    // ==========================================
    // STATI SEZIONI INTERNE TORNEO
    // ==========================================
    const [activeSection, setActiveSection] = useState('teams');
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Stati per la creazione del torneo a mano
    const [localTeams, setLocalTeams] = useState([]);
    const [singleTeamName, setSingleTeamName] = useState('');

    // STATI MODAL RISULTATI
    const [showModal, setShowModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [inputScoreHome, setInputScoreHome] = useState(0);
    const [inputScoreAway, setInputScoreAway] = useState(0);

    // ==========================================
    // CARICAMENTO INIZIALE: TORNEI NELL'HUB
    // ==========================================
    const loadUserTournaments = async () => {
        setLoading(true);
        try {
            const response = await getTournaments();
            const dataArray = Array.isArray(response.data) ? response.data : (response.data.tournaments || response.data.data || []);
            setMyTournaments(dataArray);
            
            // 🔄 CONDIVISIONE CON LA HOME: Passiamo i tornei veri ad App.jsx così la Home li vede!
            if (onTournamentsUpdate) {
                onTournamentsUpdate(dataArray);
            }
        } catch (err) {
            console.error("Errore nel caricamento dei tornei:", err);
            setError("Impossibile caricare l'elenco dei tuoi tornei.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserTournaments();
    }, []);

    // ==========================================
    // 🎯 REPERIMENTO DATI FILTRATI DEL TORNEO SELEZIONATO
    // ==========================================
    const fetchTournamentData = async (section) => {
        if (!tournamentId) return;
        setLoading(true);
        setError('');
        try {
            if (section === 'teams') {
                const response = await getTeamsByTournamentService(tournamentId);
                setTeams(response.data || []);
            } else if (section === 'matches') {
                const response = await getMatches(tournamentId);
                let dataArray = [];
                if (Array.isArray(response.data)) {
                    dataArray = response.data;
                } else if (response.data && Array.isArray(response.data.matches)) {
                    dataArray = response.data.matches;
                }
                setMatches(dataArray);
            } else if (section === 'standings') {
                const response = await getStandings(tournamentId);
                const dataArray = Array.isArray(response.data) ? response.data : (response.data.standings || response.data.data || []);
                setStandings(dataArray);
            }
        } catch (err) {
            console.error(`Errore caricamento ${section}:`, err);
            setError(`Impossibile recuperare i dati della sezione ${section}.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tournamentId) {
            fetchTournamentData(activeSection);
        }
    }, [tournamentId, activeSection]);

    // ==========================================
    // AZIONI FORM CREAZIONE TORNEO
    // ==========================================
    const handleAddTeamToList = (e) => {
        e.preventDefault();
        if (!singleTeamName.trim()) return;
        setLocalTeams([...localTeams, singleTeamName.trim()]);
        setSingleTeamName('');
    };

    const handleRemoveTeamFromList = (indexToRemove) => {
        setLocalTeams(localTeams.filter((_, index) => index !== indexToRemove));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (localTeams.length < 2) {
            alert("Devi inserire almeno due squadre prima di inviare!");
            return;
        }

        try {
            const tournamentData = {
                name: tournamentName,
                localTeams: localTeams
            };

            const response = await createTournament(tournamentData);

            if (response.status === 201) {
                alert("🏆 Torneo creato con successo con le sue squadre dedicate!");
                setTournamentName('');
                setLocalTeams([]);
                setShowCreateForm(false);

                // Ricarica e aggiorna l'hub globale
                await loadUserTournaments();
            }
        } catch (error) {
            console.error("❌ Errore durante l'invio del torneo:", error);
            alert("Errore durante la creazione: " + (error.response?.data?.message || error.message));
        }
    };

    // ==========================================
    // GESTIONE MATCH E RISULTATI
    // ==========================================
    const handleGenerateCalendar = async () => {
        if (!tournamentId) return;
        setLoading(true);
        setError('');
        setMatches([]);
        try {
            await generateCalendar(tournamentId);
            alert("🎉 Calendario generato con successo!");
            setActiveSection('matches');
            fetchTournamentData('matches');
        } catch (err) {
            setError(err.response?.data?.message || "Il calendario è già stato generato o errore server");
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (match) => {
        setSelectedMatch(match);
        setInputScoreHome(match.scoreHome || 0);
        setInputScoreAway(match.scoreAway || 0);
        setShowModal(true);
    };

    const handleSaveResult = async () => {
        if (!selectedMatch) return;
        setShowModal(false);
        setLoading(true);
        try {
            await updateMatchResult(selectedMatch._id, {
                scoreHome: Number(inputScoreHome),
                scoreAway: Number(inputScoreAway),
                status: 'FINITA'
            });
            await fetchTournamentData('matches');
            await fetchTournamentData('standings');
        } catch (err) {
            console.error(err);
            alert("Errore nel salvataggio del punteggio.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTournament = async (tId, tName) => {
        const confirmDelete = window.confirm(`⚠️ Sei sicuro di voler eliminare definitivamente il torneo "${tName}"? Verranno cancellate anche tutte le squadre e le partite associate!`);
        if (!confirmDelete) return;

        try {
            setLoading(true);
            await deleteTournamentService(tId);
            alert("🗑️ Torneo eliminato con successo!");
            await loadUserTournaments();
        } catch (err) {
            console.error("Errore durante l'eliminazione del torneo:", err);
            alert("Impossibile eliminare il torneo: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5" style={{ minHeight: '85vh' }}>

            {/* 1️⃣ LIVELLO HUB: SE NON C'È UN TORNEO SELEZIONATO */}
            {!tournamentId ? (
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
                        <div>
                            <h1 className="fw-bold text-dark m-0">🏟️ Management Eventi Sportivi</h1>
                            <p className="text-muted m-0">Pannello di controllo del Gestore. Crea e amministra le tue competizioni.</p>
                        </div>
                        <Button
                            variant={showCreateForm ? "outline-secondary" : "primary"}
                            className="fw-bold px-4 py-2 shadow-sm"
                            onClick={() => setShowCreateForm(!showCreateForm)}
                        >
                            {showCreateForm ? '← Torna alla Lista' : '+ Nuovo Torneo'}
                        </Button>
                    </div>

                    {error && <Alert variant="danger" className="text-center fw-bold">{error}</Alert>}

                    {showCreateForm ? (
                        <Row className="justify-content-center">
                            <Col md={6}>
                                <Card className="border-0 shadow-sm p-4 rounded-3 bg-white border">
                                    <Card.Body>
                                        <h3 className="fw-bold text-center mb-4">Inizia Nuova Competizione</h3>
                                        <Form onSubmit={handleFormSubmit}>
                                            <Form.Group className="mb-4" controlId="newTourName">
                                                <Form.Label className="fw-bold text-secondary text-uppercase small">Nome del Torneo</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    size="lg"
                                                    placeholder="Es. Champions League 2026"
                                                    value={tournamentName}
                                                    onChange={(e) => setTournamentName(e.target.value)}
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold text-secondary text-uppercase small">Aggiungi Squadra Partecipante</Form.Label>
                                                <div className="d-flex gap-2">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Scrivi nome club (es. Milan)"
                                                        value={singleTeamName}
                                                        onChange={(e) => setSingleTeamName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleAddTeamToList(e);
                                                            }
                                                        }}
                                                    />
                                                    <Button variant="dark" type="button" onClick={handleAddTeamToList}>
                                                        + Aggiungi
                                                    </Button>
                                                </div>
                                            </Form.Group>

                                            <div className="mb-4">
                                                <Form.Label className="fw-bold text-secondary text-uppercase small d-block">
                                                    Lista Club Iscritti ({localTeams.length})
                                                </Form.Label>
                                                <div className="border rounded p-3 bg-light" style={{ minHeight: '80px', maxHeight: '200px', overflowY: 'auto' }}>
                                                    {localTeams.length === 0 ? (
                                                        <p className="text-muted small m-0 text-center py-2">Nessuna squadra inserita. Scrivi un nome sopra e clicca su "+ Aggiungi".</p>
                                                    ) : (
                                                        <div className="d-flex flex-wrap gap-2">
                                                            {localTeams.map((team, index) => (
                                                                <Badge
                                                                    key={index}
                                                                    bg="white"
                                                                    text="dark"
                                                                    className="border p-2 fs-6 d-flex align-items-center gap-2 shadow-sm rounded-pill"
                                                                >
                                                                    {team}
                                                                    <span
                                                                        className="text-danger fw-bold"
                                                                        style={{ cursor: 'pointer', padding: '0 4px' }}
                                                                        onClick={() => handleRemoveTeamFromList(index)}
                                                                    >
                                                                        ×
                                                                    </span>
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <Button type="submit" variant="primary" size="lg" className="w-100 fw-bold" disabled={loading}>
                                                {loading ? 'Registrazione in corso...' : 'Conferma e Attiva Torneo 🚀'}
                                            </Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    ) : (
                        <Row className="g-4">
                            {myTournaments.length === 0 ? (
                                <Col xs={12} className="text-center py-5 bg-light rounded-3 border border-dashed">
                                    <p className="text-muted fs-5 m-0">Nessun evento sportivo attivo nel tuo profilo. Clicca su "+ Nuovo Torneo".</p>
                                </Col>
                            ) : (
                                myTournaments.map((t) => (
                                    <Col md={4} key={t._id}>
                                        <Card className="h-100 border-0 shadow-sm border" style={{ borderRadius: '12px' }}>
                                            <Card.Body className="p-4 d-flex flex-column justify-content-between">
                                                <div>
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <Badge bg={t.status === 'PROGRAMMATO' ? 'warning' : 'success'} text={t.status === 'PROGRAMMATO' ? 'dark' : 'white'} className="fw-bold">
                                                            {t.status || 'ATTIVO'}
                                                        </Badge>
                                                    </div>

                                                    <Card.Title className="fw-bold text-dark fs-4 mb-2">{t.name}</Card.Title>
                                                    <Card.Text className="text-muted small mb-0">⚽ {t.teams?.length || t.localTeams?.length || 0} Club partecipanti</Card.Text>
                                                </div>
                                                <div className="d-flex gap-2 mt-4">
                                                    <Button
                                                        variant="outline-dark"
                                                        className="fw-bold flex-grow-1"
                                                        onClick={() => {
                                                            setTournamentId(t._id);
                                                            setTournamentName(t.name);
                                                            setActiveSection('teams');
                                                        }}
                                                    >
                                                        Entra ⚙️
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        className="px-3"
                                                        title="Elimina Torneo"
                                                        onClick={() => handleDeleteTournament(t._id, t.name)}
                                                    >
                                                        🗑️
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))
                            )}
                        </Row>
                    )}
                </div>
            ) : (
                /* 2️⃣ LIVELLO GESTIONE SINGOLO TORNEO DEL GESTORE */
                <div>
                    <Card className="mb-4 bg-white border shadow-sm" style={{ borderRadius: '12px' }}>
                        <Card.Body className="d-flex justify-content-between align-items-center p-4">
                            <div>
                                <Badge bg="dark" className="mb-2 text-uppercase fw-bold">Torneo Selezionato</Badge>
                                <h2 className="fw-bold m-0 text-dark">🏆 {tournamentName}</h2>
                            </div>
                            <Button variant="outline-danger" className="fw-bold px-3" onClick={() => { setTournamentId(''); setTournamentName(''); setTeams([]); setMatches([]); setStandings([]); }}>
                                ↩ Torna all'Hub
                            </Button>
                        </Card.Body>
                    </Card>

                    <Row className="g-2 mb-4">
                        <Col><Button variant={activeSection === 'teams' ? 'dark' : 'outline-dark'} className="w-100 fw-bold py-2" onClick={() => setActiveSection('teams')}>🏃‍♂️ Club Iscritti</Button></Col>
                        <Col><Button variant={activeSection === 'matches' ? 'dark' : 'outline-dark'} className="w-100 fw-bold py-2" onClick={() => setActiveSection('matches')}>📅 Calendario Match</Button></Col>
                        <Col><Button variant={activeSection === 'standings' ? 'dark' : 'outline-dark'} className="w-100 fw-bold py-2" onClick={() => setActiveSection('standings')}>📊 Classifica Live</Button></Col>
                    </Row>

                    {error && <Alert variant="danger" className="fw-bold text-center mb-4">{error}</Alert>}

                    {loading && (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="dark" />
                            <p className="text-muted mt-2 small">Sincronizzazione database...</p>
                        </div>
                    )}

                    {!loading && (
                        <Card className="bg-light border p-4 rounded-3 shadow-sm" style={{ minHeight: '350px' }}>
                            <Card.Body className="p-0">

                                {/* TABELLA CLUB FILTRATI */}
                                {activeSection === 'teams' && (
                                    <div className="p-4 bg-white rounded shadow-sm border">
                                        <h4 className="fw-bold mb-4 text-dark">🛡️ Club Iscritti a questa Competizione</h4>
                                        <div className="row">
                                            {teams && teams.length > 0 ? (
                                                teams.map((team, idx) => (
                                                    <div key={team._id || idx} className="col-md-3 mb-3">
                                                        <div className="card p-3 text-center shadow-sm fw-bold border bg-light">
                                                            ⚽ {typeof team === 'object' ? team.name : team}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted text-center py-3">Nessuna squadra iscritta a questo torneo.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* SCHERMATA MATCH */}
                                {activeSection === 'matches' && (
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h4 className="fw-bold m-0 text-dark">Gare Ufficiali Torneo</h4>
                                            <Button variant="dark" size="sm" className="fw-bold" onClick={handleGenerateCalendar}>+ Genera Giornata</Button>
                                        </div>
                                        {matches.length === 0 ? (
                                            <p className="text-muted text-center py-4 bg-white rounded shadow-sm">Nessun match presente. Clicca "+ Genera Giornata".</p>
                                        ) : (
                                            <ListGroup variant="flush" className="rounded shadow-sm overflow-hidden">
                                                {matches.map((match) => (
                                                    <ListGroup.Item key={match._id} className="d-flex justify-content-between align-items-center py-3 px-4 bg-white border-bottom">
                                                        <div className="fw-bold text-end text-dark" style={{ width: '35%' }}>
                                                            {match.teamHome?.name || match.teamHome?.nome || (typeof match.teamHome === 'string' ? match.teamHome : 'Squadra')}
                                                        </div>
                                                        <Badge bg={match.status === 'FINITA' ? 'dark' : 'secondary'} className="mx-2">
                                                            {match.status === 'FINITA' ? `${match.scoreHome} - ${match.scoreAway}` : 'VS'}
                                                        </Badge>
                                                        <div className="fw-bold text-start text-dark" style={{ width: '35%' }}>
                                                            {match.teamAway?.name || match.teamAway?.nome || (typeof match.teamAway === 'string' ? match.teamAway : 'Squadra')}
                                                        </div>
                                                        <Button variant="light" size="sm" className="border shadow-sm" onClick={() => openEditModal(match)}>
                                                            ✏️
                                                        </Button>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        )}
                                    </div>
                                )}

                                {/* CLASSIFICA LIVE */}
                                {activeSection === 'standings' && (
                                    <div>
                                        <h4 className="fw-bold mb-3 text-dark">Classifica Live Competizione</h4>
                                        <Table responsive striped hover className="bg-white rounded shadow-sm m-0">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th style={{ width: '70px' }}>Pos</th>
                                                    <th>Squadra</th>
                                                    <th className="text-center" style={{ width: '100px' }}>Punti (PT)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {standings.length === 0 ? (
                                                    <tr><td colSpan="3" className="text-muted text-center py-3">Nessun match disputato. Aggiorna i risultati per vedere i punti.</td></tr>
                                                ) : (
                                                    standings.map((row, index) => (
                                                        <tr key={row.teamId || index}>
                                                            <td className="fw-bold text-secondary">{index + 1}</td>
                                                            <td className="fw-bold text-dark">{row.name}</td>
                                                            <td className="text-center fw-bold text-primary fs-5">{row.points}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}

                            </Card.Body>
                        </Card>
                    )}
                </div>
            )}

            {/* MODAL EDIT PUNTEGGIO */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title className="fw-bold fs-5">Inserisci Risultato Definitivo</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedMatch && (
                        <Form>
                            <Row className="align-items-center text-center">
                                <Col>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-truncate w-100">{selectedMatch.teamHome?.name}</Form.Label>
                                        <Form.Control type="number" size="lg" className="text-center fw-bold" min="0" value={inputScoreHome} onChange={(e) => setInputScoreHome(e.target.value)} />
                                    </Form.Group>
                                </Col>
                                <Col xs={2} className="fw-bold fs-3 text-muted mt-4">:</Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-truncate w-100">{selectedMatch.teamAway?.name}</Form.Label>
                                        <Form.Control type="number" size="lg" className="text-center fw-bold" min="0" value={inputScoreAway} onChange={(e) => setInputScoreAway(e.target.value)} />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 justify-content-center pt-0">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Annulla</Button>
                    <Button variant="dark" className="fw-bold px-4" onClick={handleSaveResult}>Salva Gara ⚽</Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default Dashboard;
