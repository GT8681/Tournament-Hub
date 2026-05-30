const express = require('express');
const router = express.Router();
const {
  createTournament,
  getTournamentById,
  getTournamentStandings,
  resetTournament,
  deleteTournamentComplete,
  getTournaments,
  deleteTournament
} = require('./Tournament.controller.js'); // Verifica il percorso esatto
const  protect  = require('../middleware/auth.js');

// 1. Rotta per creare un torneo (POST /api/tournaments)
//router.post('/', createTournament);

// 2. Rotta per la classifica (GET /api/tournaments/:tournamentId/standings)
router.get('/:tournamentId/standings', getTournamentStandings);

// 3. Rotta per il reset (POST /api/tournaments/:tournamentId/reset)
router.post('/:tournamentId/reset', resetTournament);

// 4. Rotta per recuperare un singolo torneo (GET /api/tournaments/:id)
router.get('/:id', getTournamentById);
router.route('/')
  .get(protect, getTournaments)      // Solo gli utenti loggati vedono i LORO tornei
  .post(protect, createTournament);  // Solo gli utenti loggati possono creare un torneo

  router.delete('/:tournamentId',protect,deleteTournament);

module.exports = router;





