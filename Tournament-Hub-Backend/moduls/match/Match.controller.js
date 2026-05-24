const { generateCalendarService, updateMatchResultService,getMatchesByTournamentService} = require('../match/Match.service.js');

// @desc    Genera il calendario delle partite per un torneo e lo avvia
// @route   POST /api/matches/generate/:tournamentId
exports.generateCalendar = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    const matches = await generateCalendarService(tournamentId);
    
    res.status(201).json({
      message: 'Calendario generato con successo. Il torneo è ora IN CORSO!',
      count: matches.length,
      matches
    });
  } catch (error) {
    if (error.message === 'TOURNAMENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Torneo non trovato' });
    }
    if (error.message === 'CALENDAR_ALREADY_GENERATED') {
      return res.status(400).json({ message: 'Il calendario di questo torneo è già stato generato o il torneo è già attivo' });
    }
    res.status(500).json({ message: 'Errore del server durante la generazione del calendario', error: error.message });
  }
};



// @desc    Aggiorna il risultato di una partita
// @route   PUT /api/matches/:matchId/score
exports.updateMatchResult = async (req, res) => {
  try {
    const { matchId } = req.params;
    // 1. 🔥 Recuperiamo anche lo status inviato dal frontend
    const { scoreHome, scoreAway, status } = req.body;

    // Controlla che i voti siano numeri validi e non vuoti
    if (scoreHome === undefined || scoreAway === undefined) {
      return res.status(400).onSubmit({ message: 'I gol di casa e trasferta sono obbligatori' });
    }

    // 2. 🔥 Passiamo lo status come terzo argomento al servizio
    const updatedMatch = await updateMatchResultService(matchId, scoreHome, scoreAway, status);
    res.status(200).json({
      message: 'Risultato aggiornato con successo!',
      match: updatedMatch
    });
  } catch (error) {
    if (error.message === 'MATCH_NOT_FOUND') {
      return res.status(404).json({ message: 'Partita non trovata' });
    }
    if (error.message === 'MATCH_ALREADY_FINISHED') {
      return res.status(400).json({ message: 'Il risultato di questa partita è già stato aggiornato e la partita è finita' });
    }
    res.status(500).json({ message: 'Errore del server durante l\'aggiornamento del match', error: error.message });
  }
}


// @desc    Ottieni i match di un torneo
// @route   GET /api/matches/tournament/:tournamentId
exports.getMatchesByTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const matches = await getMatchesByTournamentService(tournamentId);
    
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Errore durante il recupero dei match', error: error.message });
  }
};
