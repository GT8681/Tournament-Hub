const { generateCalendarService, updateMatchResultService,getMatchesByTournamentService} = require('../match/Match.service.js');
const Match = require('./Match.schema');
const Tournament = require('../tournament/Tournament.schema');



// @desc    Genera il calendario delle partite per un torneo e lo avvia
// @route   POST /api/matches/generate/:tournamentId

exports.generateCalendar = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    await Match.deleteMany({ tournament: tournamentId });
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament || !tournament.teams || tournament.teams.length === 0) {
      return res.status(404).json({ message: "Torneo non trovato o senza squadre iscritte." });
    }

    const teams = tournament.teams;
    const generatedMatches = [];
  
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const newMatch = new Match({
          tournament: tournamentId,
          teamHome: teams[i],
          teamAway: teams[j],
          status: 'DA_GIOCARE',
          scoreHome: 0,
          scoreAway: 0
        });
        generatedMatches.push(await newMatch.save());
      }
    }
    const populatedMatches = await Match.find({ tournament: tournamentId })
      .populate('teamHome', 'name')
      .populate('teamAway', 'name');

    res.status(201).json({ 
      message: "Calendario creato con successo!", 
      matches: populatedMatches 
    });
  } catch (error) {
    console.error("Errore generazione calendario:", error);
    res.status(500).json({ message: "Errore durante la generazione", error: error.message });
  }
};



// @desc    Aggiorna il risultato di una partita
// @route   PUT /api/matches/:matchId/score
exports.updateMatchResult = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { scoreHome, scoreAway, status } = req.body;

    // Aggiorna il match usando l'ID
    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      { scoreHome, scoreAway, status },
      { new: true } // 👈 Questo parametro serve a restituire il documento modificato
    );

    if (!updatedMatch) {
      return res.status(404).json({ message: "Match non trovato" });
    }

    res.status(200).json({ message: "Risultato aggiornato!", match: updatedMatch });
  } catch (error) {
    res.status(500).json({ message: "Errore durante l'aggiornamento", error: error.message });
  }
};



exports.getMatchesByTournament = async (req, res) => {
  try {
    // 1. Prendi il tournamentId dai parametri dell'URL (/api/matches/tournament/:tournamentId)
    const { tournamentId } = req.params;

    // 2. 🔥 LA QUERY CORRETTA: Filtra solo i match di questo torneo e popola i dati dei team
    const matches = await Match.find({ tournament: tournamentId })
      .populate('teamHome','name')
      .populate('teamAway','name')
      .exec();

    // 3. Rispondi al frontend con l'array filtrato
    res.status(200).json(matches);
  } catch (error) {
    console.error("Errore recupero match filtrati:", error);
    res.status(500).json({ 
      message: "Errore durante il recupero dei match", 
      error: error.message 
    });
  }
};