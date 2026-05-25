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
    getTeams,
    getMatches,
    getStandings,
    generateCalendar,
    updateMatchResult,
    createTournament,
    createTeam,
    getTournaments
} from '../services/api';

const Dashboard = () => {
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
    // Stato per l'elenco dei nomi delle squadre che stai scrivendo a mano
    const [localTeams, setLocalTeams] = useState([]);
    // Stato per il testo scritto nell'input della singola squadra in quel momento
    const [singleTeamName, setSingleTeamName] = useState('');


    // STATI MODAL RISULTATI
    const [showModal, setShowModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [inputScoreHome, setInputScoreHome] = useState(0);
    const [inputScoreAway, setInputScoreAway] = useState(0);



    useEffect(() => {
        // Se non c'è un torneo selezionato, non fare nulla
        if (!tournamentId) return;

        const loadDashboardData = async () => {
            try {
                setLoading(true);
                setError('');

                // Carichiamo tutto in parallelo in un colpo solo per massima fluidità
                await Promise.all([
                    fetchTournamentData('teams'),
                    fetchTournamentData('matches'),
                    fetchTournamentData('standings')
                ]);

            } catch (err) {
                console.error("Errore nel caricamento iniziale:", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();

        // 👈 IMPORTANTE: Gira SOLO quando cambia il torneo, non quando aggiorni i gol!
    }, [tournamentId]);




    // Aggiunge la squadra scritta alla lista locale
    const handleAddTeamToList = (e) => {
        e.preventDefault(); // Impedisce al form di ricaricare la pagina
        if (!singleTeamName.trim()) return;

        // Aggiungiamo il nome scritto all'array delle squadre locali
        setLocalTeams([...localTeams, singleTeamName.trim()]);
        // Svuotiamo l'input per permetterti di scriverne un'altra
        setSingleTeamName('');
    };




    // Se sbagli a scrivere, ti permette di cancellare una squadra dalla lista cliccando su una "X"
    const handleRemoveTeamFromList = (indexToRemove) => {
        setLocalTeams(localTeams.filter((_, index) => index !== indexToRemove));
    };




    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!tournamentName.trim()) return alert("Inserisci il nome del torneo!");

        // Controllo di sicurezza: un torneo ha bisogno di almeno 4 squadre per generare un calendario
        if (localTeams.length < 4) {
            return alert(`Inserisci almeno 4 squadre! Attualmente ne hai aggiunte: ${localTeams.length}`);
        }

        setLoading(true);
        try {
            // 🔥 Spediamo al backend il nome del torneo e l'array di stringhe dei nomi delle squadre
            await createTournament({
                name: tournamentName,
                teams: localTeams // Es: ["Inter", "Milan", "Juventus", "Napoli"]
            });

            // Reset totali dopo il successo
            setTournamentName('');
            setLocalTeams([]);
            setShowCreateForm(false);
            await loadUserTournaments(); // Ricarica la griglia dell'Hub
            alert("🏆 Torneo creato con successo con tutte le sue squadre!");
        } catch (err) {
            alert("Errore durante la creazione: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };





    // ==========================================
    // CARICAMENTO INIZIALE: TORNEI DELL'UTENTE
    // ==========================================
    const loadUserTournaments = async () => {
        setLoading(true);
        try {
            const response = await getTournaments();
            const dataArray = Array.isArray(response.data) ? response.data : (response.data.tournaments || response.data.data || []);
            setMyTournaments(dataArray);
        } catch (err) {
            console.error("Errore nel caricamento dei tornei:", err);
            setError("Impossibile caricare l'elenco dei tuoi tornei.");
        } finally {
            setLoading(false);
        }
    };




    // Carica anche tutte le squadre generali per i controlli di validazione
    const loadGlobalTeams = async () => {
        try {
            const response = await getTeams();
            const dataArray = Array.isArray(response.data) ? response.data : (response.data.teams || response.data.data || []);
            setTeams(dataArray);
        } catch (err) {
            console.error("Errore caricamento squadre globali:", err);
        }
    };



    useEffect(() => {
        loadUserTournaments();
        loadGlobalTeams();
    }, []);




    // ==========================================
    // REPERIMENTO DATI DEL TORNEO SELEZIONATO
    // ==========================================
    const fetchTournamentData = async (section) => {
        if (!tournamentId) return;
        setLoading(true);
        setError('');
        try {
            if (section === 'teams') {
                const response = await getTeams(); // Qui puoi filtrare le squadre del torneo se necessario
                const dataArray = Array.isArray(response.data) ? response.data : (response.data.teams || response.data.data || []);
                setTeams(dataArray);
            } else if (section === 'matches') {
                // Usiamo la funzione GET per leggere, non quella per creare!
                const response = await getMatches(tournamentId);
                console.log("Dati match ricevuti dal backend:", response.data);

                let dataArray = [];
                if (Array.isArray(response.data)) {
                    dataArray = response.data;
                } else if (response.data && Array.isArray(response.data.matches)) {
                    dataArray = response.data.matches;
                } else if (response.data && Array.isArray(response.data.data)) {
                    dataArray = response.data.data;
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
            // Carica solo la sezione attualmente attiva per il nuovo torneo
            fetchTournamentData(activeSection);
        }
    }, [tournamentId]); // 👈 Ascolta SOLO il cambio del torneo, non la sezione!

    // ==========================================
    // AZIONI GESTIONALI
    // ==========================================
    const handleGenerateCalendar = async () => {
        if (!tournamentId) return;
        setLoading(true);
        setError('');
        setMatches([]); // Pulisce la lista dei match per mostrare lo spinner durante la generazione
        try {
            await generateCalendar(tournamentId);
            alert("🎉 Calendario generato con successo!");

            // Cambiando solo la sezione, lo useEffect si accorgerà della modifica 
            // e chiamerà AUTOMATICAMENTE fetchTournamentData('matches') una volta sola.
            setActiveSection('matches');

        } catch (err) {
            setError(err.response?.data?.message || "Il calendario è già stato generato");
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
                            variant={showCreateForm ? "outline-secondary" : "dark"}
                            className="fw-bold px-4 py-2 shadow-sm"
                            onClick={() => setShowCreateForm(!showCreateForm)}
                        >
                            {showCreateForm ? '← Torna alla Lista' : '+ Nuovo Torneo'}
                        </Button>
                    </div>

                    {error && <Alert variant="danger" className="text-center fw-bold">{error}</Alert>}

                    {showCreateForm ? (
                        /* PANNELLO DI CREAZIONE */
                        <Row className="justify-content-center">
                            <Col md={6}>
                                <Card className="border-0 shadow-sm p-4 rounded-3 bg-white border">
                                    <Card.Body>
                                        <h3 className="fw-bold text-center mb-4">Inizia Nuova Competizione</h3>

                                        {/* FORM PRINCIPALE DEL TORNEO */}
                                        <Form onSubmit={handleFormSubmit}>

                                            {/* 1. Nome del Torneo */}
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

                                            {/* 2. Input per Inserire una Squadra alla volta */}
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold text-secondary text-uppercase small">Aggiungi Squadra Participantì</Form.Label>
                                                <div className="d-flex gap-2">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Scrivi nome club (es. Milan)"
                                                        value={singleTeamName}
                                                        onChange={(e) => setSingleTeamName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            // Se premi Invio dentro questo input, aggiunge la squadra senza fare il submit del torneo
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

                                            {/* 3. Lista Visiva delle Squadre Aggiunte da te */}
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
                                                                        className="text-danger fw-bold cursor-pointer"
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

                                            {/* 4. Pulsantone Finale di Attivazione Torneo */}
                                            <Button type="submit" variant="dark" size="lg" className="w-100 fw-bold" disabled={loading}>
                                                {loading ? 'Registrazione in corso...' : 'Conferma e Attiva Torneo 🚀'}
                                            </Button>

                                        </Form>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    ) : (
                        /* GRIGLIA COMPETIZIONI ATTIVE */
                        <Row className="g-4">
                            {myTournaments.length === 0 ? (
                                <Col xs={12} className="text-center py-5 bg-light rounded-3 border border-dashed">
                                    <p className="text-muted fs-5 m-0">Nessun evento sportivo attivo nel tuo profilo. Clicca su "+ Nuovo Torneo".</p>
                                </Col>
                            ) : (
                                myTournaments.map((t) => (
                                    <Col md={4} key={t._id}>
                                        <Card className="h-100 border-0 shadow-sm card-tournament border" style={{ borderRadius: '12px' }}>
                                            <Card.Body className="p-4 d-flex flex-column justify-content-between">
                                                <div>
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <Badge bg={t.status === 'PROGRAMMATO' ? 'warning' : 'success'} text={t.status === 'PROGRAMMATO' ? 'dark' : 'white'} className="fw-bold">
                                                            {t.status}
                                                        </Badge>
                                                        <span className="text-muted small fw-bold">ID: {t._id.substring(18)}</span>
                                                    </div>
                                                    <Card.Title className="fw-bold text-dark fs-4 mb-2">{t.name}</Card.Title>
                                                    <Card.Text className="text-muted small mb-0">⚽ {t.teams?.length || 0} Club partecipanti</Card.Text>
                                                </div>
                                                <Button
                                                    variant="outline-dark"
                                                    className="w-100 mt-4 fw-bold"
                                                    onClick={() => {
                                                        setTournamentId(t._id);
                                                        setTournamentName(t.name);
                                                        setActiveSection('teams');
                                                    }}
                                                >
                                                    Entra nella Gestione ⚙️
                                                </Button>
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
                    {/* Top Banner Torneo */}
                    <Card className="mb-4 bg-white border shadow-sm" style={{ borderRadius: '12px' }}>
                        <Card.Body className="d-flex justify-content-between align-items-center p-4">
                            <div>
                                <Badge bg="dark" className="mb-2 text-uppercase fw-bold">Torneo Selezionato</Badge>
                                <h2 className="fw-bold m-0 text-dark">🏆 {tournamentName}</h2>
                            </div>
                            <Button variant="outline-danger" className="fw-bold px-3" onClick={() => { setTournamentId(''); setTournamentName(''); }}>
                                ↩ Torna all'Hub
                            </Button>
                        </Card.Body>
                    </Card>

                    {/* Sotto-Navigazione Interna */}
                    <Row className="g-2 mb-4">
                        <Col><Button variant={activeSection === 'teams' ? 'dark' : 'outline-dark'} className="w-100 fw-bold py-2" onClick={() => setActiveSection('teams')}>🏃‍♂️ Club Iscritti</Button></Col>
                        <Col><Button variant={activeSection === 'matches' ? 'dark' : 'outline-dark'} className="w-100 fw-bold py-2" onClick={() => { setActiveSection('matches'); fetchTournamentData('matches'); }}>📅 Calendario Match</Button></Col>
                        <Col><Button variant={activeSection === 'standings' ? 'dark' : 'outline-dark'} className="w-100 fw-bold py-2" onClick={() => { setActiveSection('standings'); fetchTournamentData('standings') }}>📊 Classifica Live</Button></Col>
                    </Row>

                    {error && <Alert variant="danger" className="fw-bold text-center mb-4">{error}</Alert>}

                    {loading && (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="dark" />
                            <p className="text-muted mt-2 small">Sincronizzazione database...</p>
                        </div>
                    )}

                    {/* SCHERMATE DELLE SEZIONI */}
                    {!loading && (
                        <Card className="bg-light border p-4 rounded-3 shadow-sm" style={{ minHeight: '350px' }}>
                            <Card.Body className="p-0">

                                {/* TABELLE LEGA */}
                                {activeSection === 'teams' && (
                                    <div>
                                        <h4 className="fw-bold mb-3 text-dark">Squadre Partecipanti</h4>
                                        <Table responsive hover className="bg-white rounded shadow-sm m-0">
                                            <thead className="table-dark">
                                                <tr><th>Nome Club</th><th>Allenatore</th></tr>
                                            </thead>
                                            <tbody>
                                                {teams.map((t) => (
                                                    <tr key={t._id}>
                                                        <td className="fw-bold text-secondary">{t.name}</td>
                                                        <td className="text-muted">{t.coach || 'Mister'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
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

                                                        {/* 1. Squadra in Casa */}
                                                        <div className="fw-bold text-end text-dark" style={{ width: '35%' }}>
                                                            {match.teamHome?.name || match.teamHome?.nome || (typeof match.teamHome === 'string' ? match.teamHome : 'Squadra')}
                                                        </div>

                                                        {/* Badge del Risultato / VS (Lascialo così com'è) */}
                                                        <Badge bg={match.status === 'FINITA' ? 'dark' : 'secondary'} className="mx-2">
                                                            {match.status === 'FINITA' ? `${match.scoreHome} - ${match.scoreAway}` : 'VS'}
                                                        </Badge>

                                                        {/* 2. Squadra Ospite */}
                                                        <div className="fw-bold text-start text-dark" style={{ width: '35%' }}>
                                                            {match.teamAway?.name || match.teamAway?.nome || (typeof match.teamAway === 'string' ? match.teamAway : 'Squadra')}
                                                        </div>

                                                        {/* Bottone per modificare il risultato */}
                                                        <Button variant="light" size="sm" className="border shadow-sm" onClick={() => openEditModal(match)}>
                                                            ✏️
                                                        </Button>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        )}
                                    </div>
                                )}

                                {/* CLASSIFICA STRUTTURATA SUL SERVICE BACKEND */}
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



