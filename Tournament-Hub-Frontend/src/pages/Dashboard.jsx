import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
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
    deleteTournamentService,
    updateTournamentStatus
} from '../services/api';

// Funzione helper fuori dal componente per ripulire gli ID
const cleanCreatorId = (id) => {
    if (!id) return '';
    return typeof id === 'object' ? (id._id || id.id || '').toString() : id.toString();
};

const Dashboard = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentUserId = currentUser?._id || currentUser?.id;
    // Stato per la modale di blocco accesso non autorizzato
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    // Stato per la modale di celebrazione creazione torneo
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    // Stati per la modale di conferma eliminazione torneo
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [tournamentToDelete, setTournamentToDelete] = useState(null); // Salverà { id, name }
    // stato per modale di conferma calendario generato
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    // Stato per la modale di errore (es. nome torneo duplicato)
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    // stato per inserimento squadre minimo 3
    const [showMinTeamsModal, setShowMinTeamsModal] = useState(false);
    // Stati per la modale del vincitore del torneo
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [tournamentWinner, setTournamentWinner] = useState(null);
    // Stati per il tabellino/scheda della singola squadra
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [selectedTeamData, setSelectedTeamData] = useState(null);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateTeamName, setDuplicateTeamName] = useState('');
    // Stati per l'inserimento dei marcatori nella modale dei punteggi
    const [homeScorersInput, setHomeScorersInput] = useState([]);
    const [awayScorersInput, setAwayScorersInput] = useState([]);




    // ==========================================
    // STATI GESTIONE HUB (MULTI-TORNEO)
    // ==========================================
    const [myTournaments, setMyTournaments] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [tournamentId, setTournamentId] = useState('');
    const [tournamentName, setTournamentName] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(false);

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



    useEffect(() => {
        // Controlliamo se siamo arrivati dalla Home con un torneo nello stato della navigazione
        if (location.state && location.state.tournament) {
            const t = location.state.tournament;

            // 🔐 CONTROLLO DI SICUREZZA:
            const creatorData = t.userId || t.owner || t.creator;
            const torneoCreatorId = typeof creatorData === 'object' ? (creatorData?._id || creatorData?.id) : creatorData;

            const stringCreator = torneoCreatorId?.toString().trim().toLowerCase();
            const stringLoggato = currentUserId?.toString().trim().toLowerCase();

            // Se l'ID non coincide, attiviamo la modale grafica invece del brutto alert
            if (stringCreator !== stringLoggato) {
                setTournamentId('');
                setTournamentName('');
                setShowSecurityModal(true); // 🔥 FACCIO APRIRE LA MODALE MODERNA
                return;
            }

            // Se invece sei tu il creatore, ti fa entrare normalmente
            setTournamentId(t._id);
            setTournamentName(t.name);
            setActiveSection('teams');
        }

        return () => {
            if (window.history.state && window.history.state.usr) {
                window.history.replaceState({}, document.title);
            }
        };
    }, [location.state, currentUserId]); // Rimosso navigate da qui perché lo useremo al click del tasto




    // ==========================================
    // CARICAMENTO INIZIALE: TORNEI NELL'HUB
    // ==========================================
    const loadUserTournaments = async () => {
        setLoading(true);
        try {
            const response = await getTournaments();
            const dataArray = Array.isArray(response.data)
                ? response.data
                : (response.data?.tournaments || response.data?.data || []);

            const filtered = dataArray.filter(t => {
                const creatorId = t.userId || t.owner || t.creator;
                if (!creatorId || !currentUserId) return false;
                const cleanCreatorId = creatorId._id || creatorId;
                return cleanCreatorId.toString() === currentUserId.toString();
            });

            setMyTournaments([...filtered]);
        } catch (err) {
            console.error("Errore nel caricamento dei tornei:", err);
            setError("Impossibile caricare l'elenco dei tuoi tornei.");
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        loadUserTournaments();
    }, [refreshTrigger]);



    // ==========================================
    // REPERIMENTO DATI FILTRATI DEL TORNEO
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
            // Scarichiamo subito i dati fondamentali all'avvio del torneo
            fetchTournamentData('matches');
            fetchTournamentData('teams');
            fetchTournamentData('standings');
        }
    }, [tournamentId]);


    const handleAddTeamToList = (e) => {
        e.preventDefault();

        const cleanedName = singleTeamName.trim();
        if (!cleanedName) return;

        // Controlliamo se la squadra esiste già nell'elenco locale (case-insensitive)
        const isDuplicate = localTeams.some(
            (team) => (typeof team === 'object' ? team.name : team).toLowerCase() === cleanedName.toLowerCase()
        );

        if (isDuplicate) {
            // Se è un duplicato, salviamo il nome, apriamo la modale e blocchiamo l'inserimento
            setDuplicateTeamName(cleanedName);
            setShowDuplicateModal(true);
            return;
        }

        // Se è pulito, lo aggiungiamo normalmente come facevi prima
        setLocalTeams([...localTeams, cleanedName]);
        setSingleTeamName('');
    };



    const handleRemoveTeamFromList = (indexToRemove) => {
        setLocalTeams(localTeams.filter((_, index) => index !== indexToRemove));
    };



    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (localTeams.length < 3) {
            setErrorMessage("Per creare un torneo sono necessarie almeno 3 squadre. Aggiungi più club alla lista prima di procedere.");
            setShowMinTeamsModal(true); // 🔥 ATTIVIAMO LA MODALE GRAFICA DI ERRORE
            return;
        }

        try {
            setLoading(true);
            const tournamentData = {
                name: tournamentName,
                localTeams: localTeams
            };

            const response = await createTournament(tournamentData);

            if (response.status === 201) {
                // 🔥 Sostituito il vecchio alert con la modale grafica!
                setShowSuccessModal(true);

                const nuovoTorneoCreato = response.data?.tournament || response.data?.data || response.data;

                const torneoMock = {
                    _id: nuovoTorneoCreato?._id || Date.now().toString(),
                    name: tournamentName,
                    teams: localTeams,
                    status: 'PROGRAMMATO',
                    userId: currentUserId
                };

                setMyTournaments(prev => [torneoMock, ...prev]);
                // Lasciamo valorizzato temporaneamente il nome se vogliamo mostrarlo nella modale, 
                // lo svuoteremo quando l'utente chiude la modale.
                setLocalTeams([]);
                setShowCreateForm(false);
                setTournamentId('');
                setRefreshTrigger(prev => !prev);
            }

        } catch (error) {
            console.error("❌ Errore durante la creazione:", error);

            // Estraiamo il messaggio d'errore dal server o ne usiamo uno di fallback
            const serverMessage = error.response?.data?.message || error.message;

            // Se il server risponde con un errore di duplicato (es. codice 400 o 409 o testo specifico)
            if (serverMessage.toLowerCase().includes('duplicate') || serverMessage.toLowerCase().includes('esiste già')) {
                setErrorMessage(`Il nome del torneo "${tournamentName}" è già stato utilizzato. Scegli un nome unico per la tua competizione!`);
            } else {
                setErrorMessage(serverMessage || "Si è verificato un problema durante la creazione del torneo. Riprova più tardi.");
            }

            // 🔥 ATTIVIAMO LA MODALE GRAFICA DI ERRORE
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }

    };

    const handleGenerateCalendar = async () => {
        if (!tournamentId) return;
        setLoading(true);
        setError('');
        setMatches([]);
        try {
            await generateCalendar(tournamentId);
            setShowCalendarModal(true);
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

        setHomeScorersInput(new Array(match.scoreHome || 0).fill(''));
        setAwayScorersInput(new Array(match.scoreAway || 0).fill(''));
        setShowModal(true);

    };



    


    const handleSaveResult = async () => {
        if (!selectedMatch) return;
        setShowModal(false);
        setLoading(true);
        
        try {
            const scorersPayload = [];
            const homeTeamId = selectedMatch.teamHome?._id || selectedMatch.teamHome;
            const awayTeamId = selectedMatch.teamAway?._id || selectedMatch.teamAway;
    
            // Impacchettamento dei marcatori
            homeScorersInput.forEach(name => {
                if (name && name.trim() !== '') {
                    scorersPayload.push({ playerName: name.trim(), team: homeTeamId });
                }
            });
    
            awayScorersInput.forEach(name => {
                if (name && name.trim() !== '') {
                    scorersPayload.push({ playerName: name.trim(), team: awayTeamId });
                }
            });
    
            // Chiamata al servizio (che ora colpirà l'URL corretto senza /score)
            await updateMatchResult(selectedMatch._id, {
                scoreHome: Number(inputScoreHome),
                scoreAway: Number(inputScoreAway),
                status: 'FINITA',
                scores: scorersPayload // Sincronizzato con la proprietà del DB
            });
    
            // Reset input modale inserimento
            setHomeScorersInput([]);
            setAwayScorersInput([]);
    
            // Rinfreschiamo i dati con le tue funzioni
            await fetchTournamentData('matches');
            await fetchTournamentData('standings');
            await fetchTournamentData('teams');
    
            // Controllo automatico vincitore con un piccolo timeout per gli stati
            setTimeout(() => {
                if (matches && matches.length > 0) {
                    const pendingMatches = matches.filter(m => m._id !== selectedMatch._id && m.status !== 'FINITA');
    
                    if (pendingMatches.length === 0) {
                        if (standings && standings.length > 0) {
                            const winner = standings[0]; 
                            
                            const winnerName = typeof winner.team === 'object' ? winner.team?.name : winner.team;
                            const winnerLogo = typeof winner.team === 'object' ? winner.team?.logo : null;
    
                            setTournamentWinner({
                                name: winnerName || 'Squadra Campione',
                                points: winner.points || 0,
                                logo: winnerLogo
                            });
                            
                            setShowWinnerModal(true);
                        }
                    }
                }
            }, 600);
    
        } catch (err) {
            console.error("Errore salvataggio:", err);
        } finally {
            setLoading(false);
        }
    };
    



   





    
    // 1. Questa funzione si attiva quando si clicca sull'icona del cestino nelle card
    const triggerDeleteConfirmation = (tId, tName) => {
        setTournamentToDelete({ id: tId, name: tName });
        setShowDeleteModal(true);
    };


    // 2. Questa viene eseguita SOLO se l'utente conferma dalla modale grafica
    const handleConfirmDelete = async () => {
        if (!tournamentToDelete) return;

        const { id: tId, name: tName } = tournamentToDelete;
        setShowDeleteModal(false); // Chiudiamo subito la modale grafica
        setLoading(true);

        try {
            // Ottimizzazione ottimistica: togliamo subito il torneo dalla lista visibile
            setMyTournaments(prev => prev.filter(t => t._id !== tId));
            if (tournamentId === tId) {
                setTournamentId('');
            }

            await deleteTournamentService(tId);

            // Ripuliamo lo stato del torneo selezionato se era quello eliminato
            setTeams([]);
            setMatches([]);
            setStandings([]);
            setRefreshTrigger(prev => !prev);
        } catch (err) {
            console.error("Errore durante l'eliminazione:", err);
            alert("Impossibile eliminare il torneo dal server: " + (err.response?.data?.message || err.message));
            loadUserTournaments(); // Ricarichiamo la lista reale in caso di errore
        } finally {
            setLoading(false);
            setTournamentToDelete(null);
        }
    };


    const handleTeamClick = (teamName) => {
        // Controllo di sicurezza iniziale sugli array
        if (!matches || matches.length === 0 || !teamName) return;

        let totalGoalsFor = 0;
        let totalGoalsAgainst = 0;
        const allScorers = [];

        try {
            // 1. Filtriamo solo i match FINITI della squadra
            const teamMatches = matches.filter(m => {
                if (!m) return false;
                const isPlayed = m.status === 'FINITA';
                if (!isPlayed) return false;

                const homeName = typeof m.teamHome === 'object' ? m.teamHome?.name : m.teamHome;
                const awayName = typeof m.teamAway === 'object' ? m.teamAway?.name : m.teamAway;

                return homeName === teamName || awayName === teamName;
            });

            // 2. Calcoliamo Trend, Gol e Raccogliamo i Marcatori personali
            const trend = teamMatches.slice(-5).map(m => {
                const homeName = typeof m.teamHome === 'object' ? m.teamHome?.name : m.teamHome;
                const isHome = homeName === teamName;

                const goalsFatti = Number(m.scoreHome) || 0;
                const goalsSubiti = Number(m.scoreAway) || 0;

                // Somma dei gol fatti e subiti in base alla posizione (Casa/Trasferta)
                totalGoalsFor += isHome ? goalsFatti : goalsSubiti;
                totalGoalsAgainst += isHome ? goalsSubiti : goalsFatti;

                // 🔥 RACCOLTA MARCATORI CON CONTROLLI DI SICUREZZA ANTICRASH
                if (m.scores && Array.isArray(m.scores) && m.scores.length > 0) {
                    m.scores.forEach(scorer => {
                        if (!scorer) return;

                        // Estraiamo il nome del team del marcatore in modo sicuro
                        const scorerTeamName = typeof scorer.team === 'object' ? scorer.team?.name : null;
                        const scorerTeamId = typeof scorer.team === 'string' ? scorer.team : scorer.team?._id;

                        // Estraiamo l'ID corrente del nostro team (casa o trasferta)
                        const currentTeamId = isHome
                            ? (typeof m.teamHome === 'object' ? m.teamHome?._id : m.teamHome)
                            : (typeof m.teamAway === 'object' ? m.teamAway?._id : m.teamAway);

                        // Se combacia il nome o l'ID, salviamo il marcatore
                        if ((scorerTeamName && scorerTeamName === teamName) || (scorerTeamId && currentTeamId && scorerTeamId === currentTeamId)) {
                            if (scorer.playerName) {
                                allScorers.push(scorer.playerName);
                            }
                        }
                    });
                }

                if (goalsFatti > goalsSubiti) return isHome ? { label: 'V', color: '#22c55e' } : { label: 'S', color: '#ef4444' };
                if (goalsFatti === goalsSubiti) return { label: 'P', color: '#94a3b8' };
                return isHome ? { label: 'S', color: '#ef4444' } : { label: 'V', color: '#22c55e' };
            });

            // 3. Salviamo tutto nello stato, inclusi i marcatori estratti!
            setSelectedTeamData({
                name: teamName,
                matches: teamMatches,
                trend: trend,
                golFatti: totalGoalsFor,
                golSubiti: totalGoalsAgainst,
                marcatori: allScorers
            });
            setShowTeamModal(true);

        } catch (error) {
            console.error("Errore critico nel calcolo del tabellino:", error);
            // Fallback di sicurezza: apre comunque la modale mostrando i dati parziali senza far crashare la pagina
            setSelectedTeamData({
                name: teamName,
                matches: [],
                trend: [],
                golFatti: 0,
                golSubiti: 0,
                marcatori: []
            });
            setShowTeamModal(true);
        }
    };
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>

            {/* TOP BAR DI SERVIZIO */}
            <div className="bg-dark text-white px-4 py-2 d-flex justify-content-between align-items-center shadow-sm" style={{ borderBottom: '3px solid #00d6fd' }}>
                <span className="fw-bold text-uppercase tracking-wider fs-6">
                    <span style={{ color: '#00d6fd' }}>🛡️</span> Admin Console
                </span>
                <Button variant="outline-light" size="sm" className="rounded-pill fw-bold px-3" onClick={() => navigate('/')}>
                    ← Torna al Sito Pubblico
                </Button>
            </div>

            <div className="container py-5">
                {/* 1️⃣ LIVELLO HUB: SE NON C'È UN TORNEO SELEZIONATO */}
                {!tournamentId ? (
                    <div>
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-5 pb-3 border-bottom">
                            <div>
                                <h1 className="fw-extrabold text-dark m-0" style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                                    🏟️ I Tuoi Eventi Sportivi
                                </h1>
                                <p className="text-muted m-0">Benvenuto nella tua cabina di regia. Qui puoi creare, modificare e lanciare i tuoi tornei ufficiali.</p>
                            </div>
                            <Button
                                variant={showCreateForm ? "dark" : "info"}
                                className={`fw-bold px-4 py-2.5 rounded-pill shadow-sm ${!showCreateForm && 'text-dark'}`}
                                onClick={() => setShowCreateForm(!showCreateForm)}
                            >
                                {showCreateForm ? '🕵️ Visualizza i Tuoi Tornei' : '➕ Configura Nuovo Torneo'}
                            </Button>
                        </div>

                        {error && <Alert variant="danger" className="text-center fw-bold shadow-sm rounded-3">{error}</Alert>}

                        {showCreateForm ? (
                            <Row className="justify-content-center">
                                <Col md={8} lg={6}>
                                    <Card className="border-0 shadow p-4 rounded-4 bg-white">
                                        <Card.Body>
                                            <div className="text-center mb-4">
                                                <span className="fs-1">🏆</span>
                                                <h3 className="fw-bold mt-2 text-dark">Inaugura Competizione</h3>
                                                <p className="text-muted small">Inserisci il nome e compila i club per far elaborare i calendari al sistema.</p>
                                            </div>
                                            <Form onSubmit={handleFormSubmit}>
                                                <Form.Group className="mb-4" controlId="newTourName">
                                                    <Form.Label className="fw-bold text-secondary text-uppercase small">Nome del Torneo</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        size="lg"
                                                        className="border-2 rounded-3"
                                                        placeholder="Es. Summer Cup 2026"
                                                        value={tournamentName}
                                                        onChange={(e) => setTournamentName(e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold text-secondary text-uppercase small">Iscrivi Squadra</Form.Label>
                                                    <div className="d-flex gap-2">
                                                        <Form.Control
                                                            type="text"
                                                            className="rounded-3"
                                                            placeholder="Nome del club (es. Inter)"
                                                            value={singleTeamName}
                                                            onChange={(e) => setSingleTeamName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    handleAddTeamToList(e);
                                                                }
                                                            }}
                                                        />
                                                        <Button variant="dark" className="px-3 rounded-3 fw-bold" type="button" onClick={handleAddTeamToList}>
                                                            + Inserisci
                                                        </Button>
                                                    </div>
                                                </Form.Group>

                                                <div className="mb-4">
                                                    <Form.Label className="fw-bold text-secondary text-uppercase small d-block">
                                                        Tabellone Iscritti Provvisori ({localTeams.length})
                                                    </Form.Label>
                                                    <div className="border border-2 rounded-3 p-3 bg-light" style={{ minHeight: '100px', maxHeight: '200px', overflowY: 'auto' }}>
                                                        {localTeams.length === 0 ? (
                                                            <p className="text-muted small m-0 text-center py-3 italic">Nessun club registrato. Digita un nome e clicca su "+ Inserisci".</p>
                                                        ) : (
                                                            <div className="d-flex flex-wrap gap-2">
                                                                {localTeams.map((team, index) => (
                                                                    <Badge
                                                                        key={index}
                                                                        bg="white"
                                                                        text="dark"
                                                                        className="border p-2 fs-6 d-flex align-items-center gap-2 shadow-sm rounded-pill animate-fade-in"
                                                                    >
                                                                        ⚽ {team}
                                                                        <span
                                                                            className="text-danger fw-bold ms-1"
                                                                            style={{ cursor: 'pointer', fontSize: '18px', lineHeight: '10px' }}
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

                                                <Button type="submit" variant="dark" size="lg" className="w-100 fw-bold rounded-pill py-3 shadow" style={{ backgroundColor: '#1e293b', border: 'none' }} disabled={loading}>
                                                    {loading ? 'Elaborazione server...' : 'Inaugura e Attiva Torneo Provvisorio 🚀'}
                                                </Button>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        ) : (
                            <Row className="g-4">
                                {myTournaments.length === 0 ? (
                                    <Col xs={12} className="text-center py-5 bg-white rounded-4 border shadow-sm border-dashed">
                                        <span className="fs-1 text-muted">📋</span>
                                        <p className="text-muted fs-5 mt-2 mb-0 fw-semibold">Il tuo garage eventi è vuoto.</p>
                                        <p className="text-muted small">Inizia cliccando sul tasto "+ Configura Nuovo Torneo" in alto a destra.</p>
                                    </Col>
                                ) : (
                                    myTournaments.map((t) => (
                                        <Col md={6} lg={4} key={t._id}>
                                            <Card className="h-100 border-0 shadow-sm position-relative hover-top bg-white" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)' }}>
                                                <div style={{ height: '4px', backgroundColor: t.status === 'PROGRAMMATO' ? '#f59e0b' : '#10b981' }}></div>
                                                <Card.Body className="p-4 d-flex flex-column justify-content-between">
                                                    <div>
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <Badge bg={t.status === 'PROGRAMMATO' ? 'warning' : 'success'} text={t.status === 'PROGRAMMATO' ? 'dark' : 'white'} className="fw-bold px-2.5 py-1.5 rounded-pill text-uppercase tracking-wider small">
                                                                {t.status || 'ATTIVO'}
                                                            </Badge>
                                                        </div>

                                                        <Card.Title className="fw-bold text-dark fs-4 mb-2 text-truncate">{t.name}</Card.Title>
                                                        <Card.Text className="text-secondary bg-light d-inline-block px-3 py-1 rounded-pill small fw-semibold">
                                                            🛡️ {t.teams?.length || t.localTeams?.length || 0} Club Partecipanti
                                                        </Card.Text>
                                                    </div>

                                                    <div className="d-flex gap-2 mt-4 pt-2 border-top">
                                                        <Button
                                                            variant="dark"
                                                            className="fw-bold flex-grow-1 rounded-pill py-2 d-flex align-items-center justify-content-center gap-1"
                                                            style={{ backgroundColor: '#1e293b' }}
                                                            onClick={() => {
                                                                const creatorId = t.userId?._id || t.userId || t.owner || t.creator;
                                                                if (cleanCreatorId(creatorId) !== currentUserId?.toString()) {
                                                                    alert("⛔ Non hai i permessi per modificare questo torneo! Solo l'organizzatore può accedere alla gestione.");
                                                                    return;
                                                                }
                                                                setTournamentId(t._id);
                                                                setTournamentName(t.name);
                                                                setActiveSection('teams');
                                                            }}
                                                        >
                                                            Gestisci ⚙️
                                                        </Button>

                                                        <Button
                                                            variant="outline-danger"
                                                            className="rounded-circle p-2 d-flex align-items-center justify-content-center shadow-inner"
                                                            style={{ width: '40px', height: '40px' }}
                                                            title="Elimina Torneo"
                                                            onClick={() => triggerDeleteConfirmation(t._id, t.name)}
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
                    /* 2️⃣ LIVELLO GESTIONE SINGOLO TORNEO SELEZIONATO */
                    <div>
                        {/* INTESTAZIONE TORNEO FOCUS */}
                        <Card className="mb-4 bg-dark text-white border-0 shadow" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                            <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center p-4 gap-3">
                                <div>
                                    <Badge bg="info" text="dark" className="mb-2 text-uppercase fw-bold tracking-wide rounded-pill px-3 py-1">Pannello Direttivo Live</Badge>
                                    <h2 className="fw-black m-0 text-white d-flex align-items-center gap-2" style={{ fontWeight: 800 }}>🏆 {tournamentName}</h2>
                                </div>
                                <Button
                                    variant="outline-light"
                                    className="fw-bold px-4 rounded-pill shadow-sm"
                                    onClick={() => { setTournamentId(''); setTournamentName(''); setTeams([]); setMatches([]); setStandings([]); }}
                                >
                                    ↩ Chiudi ed Esci all'Hub
                                </Button>
                            </Card.Body>
                        </Card>

                        {/* MENU NAVIGAZIONE INTERNA IN STILE TABS MODERNE */}
                        <Row className="g-2 mb-4 bg-white p-2 rounded-4 shadow-sm border mx-0">
                            <Col xs={12} sm={4}>
                                <Button
                                    variant={activeSection === 'teams' ? 'dark' : 'light'}
                                    className={`w-100 fw-bold py-2.5 rounded-3 border-0 transition-all ${activeSection !== 'teams' && 'text-secondary'}`}
                                    onClick={() => setActiveSection('teams')}
                                >
                                    🏃‍♂️ Iscritti Squadre
                                </Button>
                            </Col>
                            <Col xs={12} sm={4}>
                                <Button
                                    variant={activeSection === 'matches' ? 'dark' : 'light'}
                                    className={`w-100 fw-bold py-2.5 rounded-3 border-0 transition-all ${activeSection !== 'matches' && 'text-secondary'}`}
                                    onClick={() => setActiveSection('matches')}
                                >
                                    📅 Calendario Gare
                                </Button>
                            </Col>
                            <Col xs={12} sm={4}>
                                <Button
                                    variant={activeSection === 'standings' ? 'dark' : 'light'}
                                    className={`w-100 fw-bold py-2.5 rounded-3 border-0 transition-all ${activeSection !== 'standings' && 'text-secondary'}`}
                                    onClick={() => setActiveSection('standings')}
                                >
                                    📊 Classifica Aggiornata
                                </Button>
                            </Col>
                        </Row>

                        {error && <Alert variant="danger" className="fw-bold text-center mb-4 shadow-sm rounded-3">{error}</Alert>}

                        {loading && (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="info" style={{ width: '2.5rem', height: '2.5rem' }} />
                                <p className="text-muted mt-2 small fw-semibold">Allineamento database in corso...</p>
                            </div>
                        )}

                        {!loading && (
                            <div className="bg-white border rounded-4 p-4 shadow-sm" style={{ minHeight: '350px' }}>

                                {/* SEZIONE 1: SQUADRE */}
                                {activeSection === 'teams' && (
                                    <div>
                                        <h4 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">🛡️ Club Registrati alla Competizione</h4>
                                        <p className="text-muted small mb-4">Questa è la lista ufficiale dei club partecipanti a questa edizione. Clicca su un club per visualizzare il suo tabellino.</p>
                                        <Row className="g-3">
                                            {teams && teams.length > 0 ? (
                                                teams.map((team, idx) => {
                                                    // Estraiamo in sicurezza il nome della squadra, sia che sia un oggetto o una stringa
                                                    const currentTeamName = typeof team === 'object' ? team.name : team;

                                                    return (
                                                        <Col xs={6} md={4} lg={3} key={team._id || idx}>
                                                            <Card
                                                                className="border shadow-sm rounded-3 text-center p-3 bg-light transition-all"
                                                                style={{
                                                                    cursor: 'pointer',
                                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                                }}
                                                                onClick={() => handleTeamClick(currentTeamName)}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                                                    e.currentTarget.style.boxShadow = '0 .5rem 1rem rgba(0,0,0,.15)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'none';
                                                                    e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                                                                }}
                                                            >
                                                                <span className="fw-bold text-primary fs-6 text-truncate">⚽ {currentTeamName}</span>
                                                            </Card>
                                                        </Col>
                                                    );
                                                })
                                            ) : (
                                                <Col xs={12} className="text-center py-4">
                                                    <p className="text-muted text-center m-0">Nessuna squadra iscritta a questo torneo.</p>
                                                </Col>
                                            )}
                                        </Row>
                                    </div>
                                )}


                                {/* SEZIONE 2: MATCH / CALENDARIO */}
                                {activeSection === 'matches' && (
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                                            <div>
                                                <h4 className="fw-bold m-0 text-dark">Gare Ufficiali Torneo</h4>
                                                <p className="text-muted small m-0">Assegna i risultati per far calcolare i punti.</p>
                                            </div>
                                            <Button variant="outline-dark" size="sm" className="fw-bold rounded-pill px-3 shadow-sm" onClick={handleGenerateCalendar}>
                                                🔄 Rigenera Intero Calendario
                                            </Button>
                                        </div>
                                        {matches.length === 0 ? (
                                            <div className="text-center py-5 border border-dashed rounded-3 bg-light">
                                                <p className="text-muted fw-semibold m-0">Calendario vuoto o non ancora generato.</p>
                                                <Button variant="dark" size="sm" className="mt-3 fw-bold rounded-pill px-4" onClick={handleGenerateCalendar}>
                                                    Genera Turni Automatici 📅
                                                </Button>
                                            </div>
                                        ) : (
                                            <ListGroup variant="flush" className="rounded-3 border overflow-hidden shadow-sm">
                                                {matches.map((match) => (
                                                    <ListGroup.Item key={match._id} className="d-flex justify-content-between align-items-center py-3 px-3 px-md-4 bg-white border-bottom align-middle match-item">
                                                        <div className="fw-bold text-end text-dark text-truncate fs-6" style={{ width: '38%' }}>
                                                            {match.teamHome?.name || match.teamHome?.nome || (typeof match.teamHome === 'string' ? match.teamHome : 'Squadra')}
                                                        </div>
                                                        <div className="text-center" style={{ width: '24%' }}>
                                                            <Badge
                                                                bg={match.status === 'FINITA' ? 'dark' : 'light'}
                                                                text={match.status === 'FINITA' ? 'white' : 'dark'}
                                                                className={`px-3 py-2 fs-6 rounded-3 cursor-pointer border ${match.status !== 'FINITA' && 'text-muted'}`}
                                                                style={{ minWidth: '70px', letterSpacing: '1px' }}
                                                                onClick={() => openEditModal(match)}
                                                            >
                                                                {match.status === 'FINITA' ? `${match.scoreHome} - ${match.scoreAway}` : 'VS'}
                                                            </Badge>
                                                        </div>
                                                        <div className="fw-bold text-start text-dark text-truncate fs-6" style={{ width: '38%' }}>
                                                            {match.teamAway?.name || match.teamAway?.nome || (typeof match.teamAway === 'string' ? match.teamAway : 'Squadra')}
                                                        </div>
                                                        <Button variant="outline-secondary" size="sm" className="ms-2 rounded-circle border-0 p-1" onClick={() => openEditModal(match)} title="Inserisci Punteggio">
                                                            ✏️
                                                        </Button>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        )}
                                    </div>
                                )}

                                {/* SEZIONE 3: CLASSIFICA */}
                                {activeSection === 'standings' && (
                                    <div>
                                        <h4 className="fw-bold mb-1 text-dark">Classifica Dinamica Aggiornata</h4>
                                        <p className="text-muted small mb-4">Variazione matematica basata sui gol inseriti nel tabellone gare.</p>
                                        <Table responsive borderless className="align-middle rounded-3 overflow-hidden border m-0 shadow-sm">
                                            <thead style={{ backgroundColor: '#1e293b', color: '#fff' }}>
                                                <tr>
                                                    <th className="py-3 text-center" style={{ width: '70px' }}>Rank</th>
                                                    <th className="py-3">Club</th>
                                                    <th className="py-3 text-center" style={{ width: '120px' }}>Punti Totali</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {standings.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="3" className="text-muted text-center py-4 bg-light italic">
                                                            Nessuna partita registrata. Compila i risultati nel tabellone gare per muovere la classifica.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    standings.map((row, index) => (
                                                        <tr key={row.teamId || index} className="border-bottom bg-white">
                                                            <td className="text-center py-3 fw-bold text-secondary">
                                                                {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : `${index + 1}°`}
                                                            </td>
                                                            <td className="fw-bold text-dark fs-6">{row.name}</td>
                                                            <td className="text-center py-3">
                                                                <Badge bg="primary" className="fs-6 px-3 py-2 rounded-pill shadow-sm" style={{ backgroundColor: '#0284c7' }}>
                                                                    {row.points} PT
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                )}
            </div>


            {/* 🔐 MODAL GRAFICA DI SICUREZZA*/}
            <Modal
                show={showSecurityModal}
                onHide={() => {
                    setShowSecurityModal(false);
                    navigate('/');
                }}
                backdrop="static" // Impedisce di chiuderla cliccando fuori
                keyboard={false}  // Impedisce di chiuderla premendo ESC
                centered
                className="rounded-4 overflow-hidden"
            >
                <Modal.Body className="p-5 text-center bg-white" style={{ borderRadius: '16px' }}>
                    <div className="mb-4">
                        <span className="display-1 text-warning">🛡️</span>
                    </div>
                    <h3 className="fw-extrabold text-dark mb-2" style={{ fontWeight: 800 }}>
                        Modalità Lettura Attiva
                    </h3>
                    <p className="text-muted mx-auto mb-4" style={{ maxWidth: '340px', fontSize: '15px', lineHeight: '1.6' }}>
                        Questo torneo appartiene a un altro organizzatore. Puoi consultare i match e la classifica in tempo reale direttamente nella <strong>Home Pubblica</strong>.
                    </p>
                    <Button
                        variant="dark"
                        className="fw-bold px-5 py-2.5 rounded-pill shadow-sm text-uppercase tracking-wider"
                        style={{ backgroundColor: '#1e293b', border: 'none', fontSize: '13px' }}
                        onClick={() => {
                            setShowSecurityModal(false);
                            navigate('/'); // Riporta l'utente a casa in modo pulito
                        }}
                    >
                        Torna alla Home Pubblica ↩
                    </Button>
                </Modal.Body>
            </Modal>




            {/* 🎉 MODAL GRAFICA DI CELEBRAZIONE CREAZIONE TORNEO */}
            <Modal
                show={showSuccessModal}
                onHide={() => {
                    setShowSuccessModal(false);
                    setTournamentName(''); // Svuotiamo il nome del torneo solo alla chiusura
                }}
                centered
                className="rounded-4 overflow-hidden shadow-lg animate-fade-in"
            >
                <Modal.Body className="p-5 text-center text-white" style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    borderRadius: '16px'
                }}>
                    <div className="mb-4 animate-bounce" style={{ fontSize: '70px', filter: 'drop-shadow(0 0 15px rgba(0,214,253,0.4))' }}>
                        🏆
                    </div>
                    <h3 className="fw-black mb-2 text-uppercase tracking-wide" style={{ fontWeight: 800, color: '#00d6fd' }}>
                        Competizione Inaugurata!
                    </h3>
                    <p className="text-white-50 mx-auto mb-4" style={{ maxWidth: '320px', fontSize: '15px' }}>
                        Il torneo <strong>"{tournamentName}"</strong> è stato registrato con successo sui nostri server. I calendari ufficiali sono pronti per essere elaborati.
                    </p>
                    <Button
                        variant="info"
                        className="fw-bold px-5 py-2.5 rounded-pill shadow text-dark text-uppercase tracking-wider w-100"
                        style={{ fontSize: '13px' }}
                        onClick={() => {
                            setShowSuccessModal(false);
                            setTournamentName('');
                            // Restiamo nell'hub così l'utente vede il nuovo torneo in cima alla lista pronto da cliccare!
                        }}
                    >
                        Accedi al mio Garage Eventi ⚡
                    </Button>
                </Modal.Body>
            </Modal>




            {/* ⚠️ MODAL GRAFICA DI CONFERMA CANCELLAZIONE TORNEO */}
            <Modal
                show={showDeleteModal}
                onHide={() => { setShowDeleteModal(false); setTournamentToDelete(null); }}
                centered
                className="rounded-4 overflow-hidden"
            >
                <Modal.Body className="p-5 text-center bg-white" style={{ borderRadius: '16px' }}>
                    <div className="mb-4 text-danger animate-pulse" style={{ fontSize: '65px' }}>
                        ⚠️
                    </div>
                    <h3 className="fw-extrabold text-dark mb-2" style={{ fontWeight: 800 }}>
                        Eliminare il Torneo?
                    </h3>
                    <p className="text-muted mx-auto mb-4" style={{ maxWidth: '340px', fontSize: '15px', lineHeight: '1.6' }}>
                        Stai per eliminare definitivamente il torneo <strong className="text-dark">"{tournamentToDelete?.name}"</strong>.
                        Questa azione cancellerà tutti i club enters, i calendari generati e le classifiche associate senza possibilità di recupero.
                    </p>
                    <div className="d-flex gap-3 justify-content-center">
                        <Button
                            variant="light"
                            className="fw-bold px-4 py-2.5 rounded-pill text-secondary border w-50"
                            style={{ fontSize: '13px' }}
                            onClick={() => { setShowDeleteModal(false); setTournamentToDelete(null); }}
                        >
                            No, Annulla
                        </Button>
                        <Button
                            variant="danger"
                            className="fw-bold px-4 py-2.5 rounded-pill text-white w-50 shadow-sm text-uppercase tracking-wider"
                            style={{ backgroundColor: '#dc2626', border: 'none', fontSize: '12px' }}
                            onClick={handleConfirmDelete}
                        >
                            Sì, Elimina 🗑️
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>







            {/* MODAL INSERIMENTO GOAL / RISULTATO */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered className="rounded-4 overflow-hidden">
                <Modal.Header closeButton className="bg-dark text-white border-0 py-3">
                    <Modal.Title className="fw-bold fs-5">✍️ Referto Gara Ufficiale</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 bg-light">
                    {selectedMatch && (
                        <Form>
                            <Row className="align-items-center text-center g-3">
                                <Col xs={5}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-dark fs-6 text-truncate d-block mb-2">{selectedMatch.teamHome?.name}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            size="lg"
                                            className="text-center fw-black border-2 rounded-3 shadow-sm"
                                            style={{ fontWeight: 800, fontSize: '1.5rem' }}
                                            min="0"
                                            value={inputScoreHome}
                                            onChange={(e) => setInputScoreHome(e.target.value)}
                                        />
                                        <small className="text-muted mt-1 d-block fw-semibold">Reti Casa</small>
                                    </Form.Group>
                                </Col>
                                <Col xs={2} className="fw-bold fs-2 text-muted mt-2">:</Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-dark fs-6 text-truncate d-block mb-2">{selectedMatch.teamAway?.name}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            size="lg"
                                            className="text-center fw-black border-2 rounded-3 shadow-sm"
                                            style={{ fontWeight: 800, fontSize: '1.5rem' }}
                                            min="0"
                                            value={inputScoreAway}
                                            onChange={(e) => setInputScoreAway(e.target.value)}
                                        />
                                        <small className="text-muted mt-1 d-block fw-semibold">Reti Fuori</small>
                                    </Form.Group>
                                </Col>


                                {/* Sezione dinamica Marcatori */}
                                <div className="mt-4 border-top pt-3">
                                    <h6 className="fw-bold text-dark text-center mb-3">⚽ Chi ha segnato?</h6>
                                    <div className="row">
                                        {/* Marcatori Squadra Casa */}
                                        <div className="col-6 border-end">
                                            <span className="small text-muted d-block mb-2 text-center fw-bold">
                                                Marcatori {typeof selectedMatch?.teamHome === 'object' ? selectedMatch.teamHome?.name : 'Casa'}
                                            </span>
                                            {Array.from({ length: Number(inputScoreHome) || 0 }).map((_, i) => (
                                                <input
                                                    key={`home-scorer-${i}`}
                                                    type="text"
                                                    className="form-control form-control-sm mb-2 rounded-2 shadow-sm"
                                                    placeholder={`Autore Gol ${i + 1}`}
                                                    value={homeScorersInput[i] || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setHomeScorersInput(prev => {
                                                            const updated = [...prev];
                                                            updated[i] = val;
                                                            return updated;
                                                        });
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        {/* Marcatori Squadra Trasferta */}
                                        <div className="col-6">
                                            <span className="small text-muted d-block mb-2 text-center fw-bold">
                                                Marcatori {typeof selectedMatch?.teamAway === 'object' ? selectedMatch.teamAway?.name : 'Trasferta'}
                                            </span>
                                            {Array.from({ length: Number(inputScoreAway) || 0 }).map((_, i) => (
                                                <input
                                                    key={`away-scorer-${i}`}
                                                    type="text"
                                                    className="form-control form-control-sm mb-2 rounded-2 shadow-sm"
                                                    placeholder={`Autore Gol ${i + 1}`}
                                                    value={awayScorersInput[i] || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setAwayScorersInput(prev => {
                                                            const updated = [...prev];
                                                            updated[i] = val;
                                                            return updated;
                                                        });
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>


                            </Row>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light border-0 justify-content-center pb-4 pt-0">
                    <Button variant="outline-secondary" className="rounded-pill px-4 fw-bold" onClick={() => setShowModal(false)}>Annulla</Button>
                    <Button variant="dark" className="fw-bold px-4 rounded-pill shadow-sm" onClick={handleSaveResult} style={{ backgroundColor: '#1e293b', border: 'none' }}>
                        Omologa Risultato ⚽
                    </Button>
                </Modal.Footer>
            </Modal>



            {/* 🎉 MODAL GRAFICA DI CELEBRAZIONE CREAZIONE TORNEO */}
            <Modal
                show={showCalendarModal}
                onHide={() => {
                    setShowCalendarModal(false);

                }}
                centered
                className="rounded-4 overflow-hidden shadow-lg animate-fade-in"
            >
                <Modal.Body className="p-5 text-center text-white" style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    borderRadius: '16px'
                }}>
                    <div className="mb-4 animate-bounce" style={{ fontSize: '70px', filter: 'drop-shadow(0 0 15px rgba(0,214,253,0.4))' }}>
                        🏆
                    </div>
                    <h3 className="fw-black mb-2 text-uppercase tracking-wide" style={{ fontWeight: 800, color: '#00d6fd' }}>
                        CALENDARIO GENERATO!
                    </h3>
                    <p className="text-white-50 mx-auto mb-4" style={{ maxWidth: '320px', fontSize: '15px' }}>
                        I turni ufficiali del torneo <strong>"{tournamentName}"</strong> sono stati generati con successo. Ora puoi inserire i risultati delle gare e vedere la classifica prendere forma!
                    </p>
                    <Button
                        variant="info"
                        className="fw-bold px-5 py-2.5 rounded-pill shadow text-dark text-uppercase tracking-wider w-100"
                        style={{ fontSize: '13px' }}
                        onClick={() => {
                            setShowCalendarModal(false);
                        }}
                    >
                        CHIUDI
                    </Button>
                </Modal.Body>
            </Modal>


            {/* ❌ MODAL GRAFICA DI ERRORE CREAZIONE / DUPLICATI */}
            <Modal
                show={showErrorModal}
                onHide={() => setShowErrorModal(false)}
                centered
                className="rounded-4 overflow-hidden"
            >
                <Modal.Body className="p-5 text-center bg-white" style={{ borderRadius: '16px' }}>
                    <div className="mb-4 text-danger animate-pulse" style={{ fontSize: '65px' }}>
                        🛑
                    </div>
                    <h3 className="fw-extrabold text-dark mb-2" style={{ fontWeight: 800 }}>
                        NOME DEL TORNEO GIA' IN USO
                    </h3>
                    <p className="text-muted mx-auto mb-4" style={{ maxWidth: '340px', fontSize: '15px', lineHeight: '1.6' }}>
                        {errorMessage}
                    </p>
                    <Button
                        variant="danger"
                        className="fw-bold px-5 py-2.5 rounded-pill text-white shadow-sm text-uppercase tracking-wider"
                        style={{ backgroundColor: '#dc2626', border: 'none', fontSize: '13px' }}
                        onClick={() => setShowErrorModal(false)}
                    >
                        Modifica Nome ✏️
                    </Button>
                </Modal.Body>
            </Modal>

            {/* ❌ MODAL GRAFICA DI ERRORE min 3 squadre */}
            <Modal
                show={showMinTeamsModal}
                onHide={() => setShowMinTeamsModal(false)}
                centered
                className="rounded-4 overflow-hidden"
            >
                <Modal.Body className="p-5 text-center bg-white" style={{ borderRadius: '16px' }}>
                    <div className="mb-4 text-danger animate-pulse" style={{ fontSize: '65px' }}>
                        🛑
                    </div>
                    <h3 className="fw-extrabold text-dark mb-2" style={{ fontWeight: 800 }}>
                        Attenzione devi inserire almeni 3 squadre... grazie
                    </h3>
                    <p className="text-muted mx-auto mb-4" style={{ maxWidth: '340px', fontSize: '15px', lineHeight: '1.6' }}>
                        {errorMessage}
                    </p>
                    <Button
                        variant="danger"
                        className="fw-bold px-5 py-2.5 rounded-pill text-white shadow-sm text-uppercase tracking-wider"
                        style={{ backgroundColor: '#dc2626', border: 'none', fontSize: '13px' }}
                        onClick={() => setShowMinTeamsModal(false)}
                    >
                        Inserisci squadra✏️
                    </Button>
                </Modal.Body>
            </Modal>


                       {/* 🏆 MODAL TRIONFO VINCITORE TORNEO */}
                       <Modal 
                show={showWinnerModal} 
                onHide={() => setShowWinnerModal(false)} 
                centered 
                backdrop="static" // Impedisce di chiuderla cliccando fuori, costringe a godersi il trionfo!
                className="rounded-4 overflow-hidden"
            >
                <Modal.Body className="p-5 bg-dark text-white text-center" style={{ borderRadius: '16px', border: '3px solid #eab308' }}>
                    
                    {/* Effetto Corona / Trofeo */}
                    <div className="mb-3 animate-bounce" style={{ fontSize: '70px' }}>
                        👑
                    </div>
                    
                    <h2 className="fw-black text-uppercase tracking-wider text-warning mb-1" style={{ fontWeight: 900, fontSize: '28px' }}>
                        Campioni del Torneo!
                    </h2>
                    <p className="text-white-50 small text-uppercase tracking-widest mb-4" style={{ fontSize: '11px' }}>
                        Classifica Finale Conclusa
                    </p>

                    {/* Box Squadra Vincitrice */}
                    <div className="bg-black bg-opacity-40 p-4 rounded-4 mb-4 border border-warning border-opacity-20 shadow-lg">
                        {tournamentWinner?.logo && (
                            <img 
                                src={tournamentWinner.logo} 
                                alt="Logo Campione" 
                                className="img-fluid mb-3 rounded-circle border border-warning p-1" 
                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            />
                        )}
                        <h3 className="fw-bold text-white text-uppercase m-0 tracking-wide">
                            {tournamentWinner?.name || 'Squadra Campione'}
                        </h3>
                        <span className="badge bg-warning text-dark fw-black font-monospace mt-2 px-3 py-1.5 rounded-pill" style={{ fontSize: '14px' }}>
                            🥇 {tournamentWinner?.points || 0} Punti
                        </span>
                    </div>

                    <p className="text-muted small px-3 mb-4">
                        Il calendario è stato completato con successo. Tutte le partite sono state disputate e i risultati sono ufficiali.
                    </p>

                    {/* Tasto per chiudere */}
                    <Button 
                        variant="warning" 
                        className="fw-bold w-100 py-2.5 rounded-pill text-uppercase tracking-wider shadow"
                        style={{ backgroundColor: '#eab308', border: 'none', color: '#000', fontSize: '13px' }}
                        onClick={() => setShowWinnerModal(false)}
                    >
                        Chiudi e Festeggia 🍾
                    </Button>
                </Modal.Body>
            </Modal>


            {/* 🛡️ MODAL TABELLINO / SCHEDA COMPLETA SQUADRA */}
            <Modal
                show={showTeamModal}
                onHide={() => setShowTeamModal(false)}
                centered
                className="rounded-4 overflow-hidden"
            >
                <Modal.Body className="p-4 bg-dark text-white" style={{ borderRadius: '16px' }}>

                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-2">
                        <h4 className="fw-black text-uppercase tracking-wide m-0" style={{ color: '#00d6fd', fontWeight: 800 }}>
                            🛡️ {selectedTeamData?.name}
                        </h4>
                        <Button
                            variant="close"
                            text="white"
                            onClick={() => setShowTeamModal(false)}
                            style={{ filter: 'invert(1)' }}
                        />
                    </div>

                    {/* STATO FORMA (TREND) */}
                    <div className="mb-3 bg-black bg-opacity-20 p-3 rounded-3 text-center">
                        <span className="text-white-50 small d-block mb-2 text-uppercase fw-bold tracking-wider" style={{ fontSize: '11px' }}>
                            Stato Forma (Ultime Gare)
                        </span>
                        <div className="d-flex gap-2 justify-content-center">
                            {!selectedTeamData?.trend || selectedTeamData.trend.length === 0 ? (
                                <span className="text-muted small">Nessun match disputato</span>
                            ) : (
                                selectedTeamData.trend.map((t, idx) => (
                                    <span
                                        key={idx}
                                        className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white shadow-sm"
                                        style={{ width: '28px', height: '28px', backgroundColor: t.color, fontSize: '12px' }}
                                    >
                                        {t.label}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>

                    {/* GOAL FATTI E SUBITI */}
                    <div className="row g-2 mb-3">
                        <div className="col-6">
                            <div className="p-2 rounded-3 text-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                <span className="text-success small d-block text-uppercase fw-bold" style={{ fontSize: '10px' }}>Gol Fatti ⚽</span>
                                <h3 className="fw-bold text-success m-0 mt-1">{selectedTeamData?.golFatti || 0}</h3>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="p-2 rounded-3 text-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                <span className="text-danger small d-block text-uppercase fw-bold" style={{ fontSize: '10px' }}>Gol Subiti 🥅</span>
                                <h3 className="fw-bold text-danger m-0 mt-1">{selectedTeamData?.golSubiti || 0}</h3>
                            </div>
                        </div>
                    </div>

                    {/* 🔥 NUOVA SEZIONE: ELENCO DEI MARCATORI REALI DELLA SQUADRA */}
                    <div className="mb-4 bg-black bg-opacity-10 p-2.5 rounded-3 border border-secondary border-opacity-20">
                        <span className="text-info small d-block mb-2 text-uppercase fw-bold tracking-wider" style={{ fontSize: '11px' }}>
                            Lista Marcatori Club
                        </span>
                        <div className="d-flex flex-wrap gap-1.5 justify-content-start">
                            {!selectedTeamData?.marcatori || selectedTeamData.marcatori.length === 0 ? (
                                <span className="text-muted small italic">Nessun marcatore registrato</span>
                            ) : (
                                selectedTeamData.marcatori.map((player, idx) => (
                                    <span key={idx} className="badge bg-secondary bg-opacity-50 text-white font-monospace px-2 py-1.5 rounded-2 small">
                                        ⚽ {player}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RISULTATI SUL CAMPO */}
                    <h6 className="text-white-50 text-uppercase tracking-wider small mb-2 fw-bold" style={{ fontSize: '11px' }}>
                        Risultati sul Campo
                    </h6>
                    <div className="overflow-auto pe-1" style={{ maxHeight: '180px' }}>
                        {selectedTeamData?.matches && selectedTeamData.matches.length > 0 ? (
                            selectedTeamData.matches.map((m, idx) => {
                                const displayHome = typeof m.teamHome === 'object' ? m.teamHome?.name : m.teamHome;
                                const displayAway = typeof m.teamAway === 'object' ? m.teamAway?.name : m.teamAway;
                                const isHome = displayHome === selectedTeamData.name;

                                return (
                                    <div key={idx} className="d-flex justify-content-between align-items-center p-2 mb-2 rounded bg-secondary bg-opacity-10 border-start border-3 border-info small">
                                        <div className="text-truncate" style={{ maxWidth: '75%' }}>
                                            <span className={isHome ? "fw-bold text-white" : "text-white-50"}>
                                                {displayHome}
                                            </span>
                                            <span className="mx-2 text-muted">vs</span>
                                            <span className={!isHome ? "fw-bold text-white" : "text-white-50"}>
                                                {displayAway}
                                            </span>
                                        </div>
                                        <span className="badge bg-light text-dark fw-bold font-monospace px-2 py-1.5" style={{ fontSize: '13px' }}>
                                            {m.scoreHome} - {m.scoreAway}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-muted text-center my-3 small">
                                Nessun match completato in questo torneo.
                            </p>
                        )}
                    </div>

                    <Button
                        variant="outline-info"
                        className="w-100 rounded-pill fw-bold mt-4 py-2 text-uppercase tracking-wider btn-sm"
                        onClick={() => setShowTeamModal(false)}
                    >
                        Chiudi Tabellino
                    </Button>
                </Modal.Body>
            </Modal>



            {/* ⚠️ MODAL ERRORE: SQUADRA DUPLICATA */}
            <Modal
                show={showDuplicateModal}
                onHide={() => setShowDuplicateModal(false)}
                centered
                className="rounded-4 overflow-hidden"
            >
                <Modal.Body className="p-4 bg-dark text-white text-center" style={{ borderRadius: '16px', border: '2px solid #ef4444' }}>
                    <div className="mb-3 animate-pulse" style={{ fontSize: '60px' }}>
                        ⚠️
                    </div>
                    <h4 className="fw-black text-uppercase tracking-wide text-danger mb-2" style={{ fontWeight: 800 }}>
                        Squadra Già Presente!
                    </h4>
                    <p className="text-white-50 small mx-auto mb-4" style={{ maxWidth: '300px' }}>
                        Non puoi inserire due club con lo stesso nome nello stesso torneo. Il club <strong className="text-white">"{duplicateTeamName}"</strong> è già registrato nella lista.
                    </p>
                    <Button
                        variant="danger"
                        className="fw-bold px-5 py-2 rounded-pill w-100 text-uppercase tracking-wider shadow-sm"
                        style={{ backgroundColor: '#ef4444', border: 'none', fontSize: '13px' }}
                        onClick={() => setShowDuplicateModal(false)}
                    >
                        Ho Capito, Modifica ✍️
                    </Button>
                </Modal.Body>
            </Modal>

        </div>
    );
};

export default Dashboard;
