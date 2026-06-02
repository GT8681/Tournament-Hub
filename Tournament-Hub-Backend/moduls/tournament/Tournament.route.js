const express = require('express');
const router = express.Router();
const {
  createTournament,
  getTournamentById,
  getTournamentStandings,
  resetTournament,
  getTournaments,
  deleteTournament,
  getPublicTournaments,
  updateTournamentStatus
} = require('./Tournament.controller.js'); // Verifica il percorso esatto
const protect = require('../middleware/auth.js');

router.get('/public', getPublicTournaments);


// Rotta per la classifica (GET /api/tournaments/:tournamentId/standings)
router.get('/:tournamentId/standings', getTournamentStandings);

// Rotta per il reset (POST /api/tournaments/:tournamentId/reset)
router.post('/:tournamentId/reset', resetTournament);

// Rotta per recuperare un singolo torneo (GET /api/tournaments/:id)
router.get('/:id', getTournamentById);

// Rotta per recuperare tutti i tornei (GET /api/tournaments) e per creare un nuovo torneo (POST /api/tournaments)
router.route('/')
  .get(protect, getTournaments)      // Solo gli utenti loggati vedono i LORO tornei
  .post(protect, createTournament);  // Solo gli utenti loggati possono creare un torneo

// rotta per eliminare un torneo (DELETE /api/tournaments/:tournamentId)
router.delete('/:tournamentId', protect, deleteTournament);

// Rotta per aggiornare lo stato del torneo (es. impostarlo come FINITO)
router.put('/:tournamentId', protect, updateTournamentStatus);


module.exports = router;





