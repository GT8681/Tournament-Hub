const {getStandingsService,getAllPublicTournaments}= require('./Tournament.service');

const Tournament = require('./Tournament.schema');
const Match = require('../match/Match.schema');
const Team = require('../team/Team.schema'); 


/**
 * Gestisce la richiesta HTTP per ottenere tutti i tornei pubblici
 */
exports.getPublicTournaments = async (req, res) => {
  try {
    // Chiamiamo il service che abbiamo creato nello Step 1
    const tournaments = await getAllPublicTournaments();
    
    // Rispondiamo al frontend con lo stato 200 (OK) e l'array dei tornei
    return res.status(200).json(tournaments);
  } catch (error) {
    console.error("Errore nel controller getPublicTournaments:", error);
    
    // Rispondiamo con un errore generico del server in caso di problemi
    return res.status(500).json({ 
      message: "Si è verificato un errore nel recupero dei tornei pubblici." 
    });
  }
};

// 🆕 1. PRENDERE SOLO I TORNEI DELL'UTENTE LOGGATO
exports.getTournaments = async (req, res) => {
  try {
    
    const tournaments = await Tournament.find({ userId: req.user.id }).populate('teams');
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero dei tornei', error: error.message });
  }
};

exports.createTournament = async (req, res) => {
  try {
    const { name, localTeams } = req.body;
    const userId = req.user.id;
    const teamsArray = Array.isArray(localTeams) ? localTeams : [];

    if (teamsArray.length === 0) {
      return res.status(400).json({ message: "Inserisci almeno due squadre per creare il torneo!" });
    }

    // Creiamo il torneo
    const newTournament = new Tournament({
      name,
      userId,
      teams: []
    });
    const savedTournament = await newTournament.save();

    const teamIds = [];

    for (let teamName of teamsArray) {
      if (!teamName) continue; 
      
      const newTeam = new Team({
        name: teamName.trim(), // Rimuove spazi vuoti inutili
        tournamentId: savedTournament._id,
        userId: userId
      });
      const savedTeam = await newTeam.save();
      teamIds.push(savedTeam._id);
    }

    // Aggiorniamo il torneo con gli ID delle squadre collegate
    savedTournament.teams = teamIds;
    await savedTournament.save();

    res.status(201).json({ message: "Torneo creato con successo!", tournament: savedTournament });

  } catch (error) {
    console.error("Errore creazione torneo:", error);
    res.status(500).json({ message: "Errore durante la creazione", error: error.message });
  }
};


exports.getTournamentById = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔥 Recupera il torneo e sviluppa l'array di ID in oggetti squadra reali
    const tournament = await Tournament.findById(id).populate('teams');

    if (!tournament) {
      return res.status(404).json({ message: "Torneo non trovato" });
    }

    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// @desc    Ottieni la classifica in tempo reale di un torneo

exports.getTournamentStandings = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const standings = await getStandingsService(tournamentId);

    res.status(200).json(standings);
  } catch (error) {
    if (error.message === 'TOURNAMENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Torneo non trovato' });
    }
    res.status(500).json({ message: 'Errore durante il calcolo della classifica', error: error.message });
  }
};

// @desc    Reset di un torneo (cancella tutti i match)

exports.resetTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    await resetTournamentService(tournamentId);
    res.status(200).json({ message: 'Torneo resettato con successo. Tutti i match sono stati eliminati.' });

  } catch (error) {
    if (error.message === 'TOURNAMENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Torneo non trovato' });
    }
    res.status(500).json({ message: 'Errore durante il reset del torneo', error: error.message });
  }
};


exports.deleteTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const userId = req.user.id; 

    // 1. Verifichiamo che il torneo esista e appartenga a questo utente
    const tournament = await Tournament.findOne({ _id: tournamentId, userId });
    if (!tournament) {
      return res.status(404).json({ message: "Torneo non trovato o non autorizzato." });
    }

    // 2. 🔥 PULIZIA A CASCATA: Elimina i match e i team collegati a questo torneo
    await Match.deleteMany({ tournament: tournamentId });
    await Team.deleteMany({ tournamentId: tournamentId });

    // 3. Elimina il torneo vero e proprio
    await Tournament.findByIdAndDelete(tournamentId);

    res.status(200).json({ message: "Torneo e tutti i dati associati eliminati con successo!" });
  } catch (error) {
    console.error("Errore cancellazione torneo:", error);
    res.status(500).json({ message: "Errore durante l'eliminazione", error: error.message });
  }
};


exports.updateTournamentStatus = async (req, res) => {
  try {
      const { tournamentId } = req.params;
      const { status } = req.body;

      // Aggiorna il campo status nel database
      const updatedTournament = await Tournament.findByIdAndUpdate(
          tournamentId,
          { status: status },
          { new: true } // Restituisce il documento aggiornato
      );

      if (!updatedTournament) {
          return res.status(404).json({ message: "Torneo non trovato." });
      }

      return res.status(200).json({ 
          message: "Stato torneo aggiornato con successo!", 
          tournament: updatedTournament 
      });
  } catch (error) {
      console.error("Errore updateTournamentStatus:", error);
      return res.status(500).json({ message: "Errore interno del server.", error: error.message });
  }
};

