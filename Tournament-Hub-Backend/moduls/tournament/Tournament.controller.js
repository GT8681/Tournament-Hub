const { createTournamentService,
  getTournamentByIdService,
  getStandingsService,
  deleteTournamentCompleteService,
  resetTournamentService }
  = require('./Tournament.service');
const Tournament = require('./Tournament.schema');
const Match = require('../match/Match.schema');
const Team = require('../team/Team.schema'); // 🔥 Assicurati che il percorso verso il tuo Team schema sia corretto!


// 🆕 1. PRENDERE SOLO I TORNEI DELL'UTENTE LOGGATO
exports.getTournaments = async (req, res) => {
  try {
    // req.user.id viene iniettato automaticamente dal middleware di autenticazione
    const tournaments = await Tournament.find({ userId: req.user.id }).populate('teams');
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero dei tornei', error: error.message });
  }
};

// 🆕 2. CREARE UN TORNEO ASSOCIANDOLO ALL'UTENTE
exports.createTournament = async (req, res) => {
  try {
    // 1. Prendiamo il nome del torneo e l'array di stringhe (i nomi scritti a mano) dal frontend
    const { name, teams } = req.body; 
    
    if (!req.user) {
      return res.status(401).json({ message: 'Non autorizzato.' });
    }
    const userId = req.user.id;

    // 2. 🔥 IL TRUCCO DELLE SQUADRE: Trasformiamo i nomi in veri ID di database
    const teamIds = [];

    if (teams && teams.length > 0) {
      for (let teamName of teams) {
        // Creiamo fisicamente la squadra nel database associandola anche all'utente
        const newTeam = new Team({
          name: teamName,
          userId: userId
        });
        const savedTeam = await newTeam.save();
        
        // Salviamo l'ID generato da MongoDB nell'array dei tornei
        teamIds.push(savedTeam._id);
      }
    }

    // 3. Creiamo il torneo usando gli ID reali appena generati!
    const newTournament = new Tournament({
      name,
      teams: teamIds, // Ora Mongoose riceve i veri ObjectId e non fallisce più il Cast!
      userId
    });

    await newTournament.save();
    
    res.status(201).json(newTournament);
  } catch (error) {
    console.error("Errore creazione torneo:", error);
    res.status(400).json({ message: 'Errore nella creazione del torneo', error: error.message });
  }
};

exports.getTournamentById = async (req, res) => {
  try {
    const tournament = await getTournamentByIdService(req.params.id);
    res.status(200).json(tournament);
  } catch (error) {
    if (error.message === 'TOURNAMENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Torneo non trovato' });
    }
    res.status(500).json({ message: 'Errore del server durante il recupero del torneo', error: error.message });
  }
};



// @desc    Ottieni la classifica in tempo reale di un torneo
// @route   GET /api/tournaments/:tournamentId/standings
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
// @route   POST /api/tournaments/:tournamentId/reset
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


// @desc    Elimina un torneo e tutti i suoi match (Versione di Test Diretta)
exports.deleteTournamentComplete = async (req, res) => {
  try {
    // 1. Intercettiamo l'ID in ogni modo possibile per sicurezza
    const tournamentId = req.params.id || req.params.tournamentId;


    if (!tournamentId) {
      return res.status(400).json({ message: "ID del torneo mancante nei parametri della richiesta" });
    }

    const cleanId = tournamentId.trim();

    // 2. Proviamo a cancellare direttamente i match
    const matchDeleteResult = await Match.deleteMany({ tournament: cleanId });


    // 3. Proviamo a cancellare direttamente il torneo
    const deletedTournament = await Tournament.findByIdAndDelete(cleanId);


    // 4. Se il database restituisce null, significa che quell'ID non esisteva nel DB
    if (!deletedTournament) {

      return res.status(404).json({ message: "Torneo non trovato nel database" });
    }


    return res.status(200).json({
      message: 'Torneo e match associati eliminati con successo direttamente dal controller',
      deletedTournament
    });

  } catch (error) {
    console.error("💥 CRASH NEL CONTROLLER DIRETTO:", error);
    return res.status(500).json({
      message: "Errore interno durante la cancellazione",
      error: error.message
    });
  }
};

