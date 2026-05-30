const express = require('express');
const router = express.Router();
const { createTeam, getAllTeams,getTeamsByTournament} = require('../team/Team.controller.js');


router.route('/')
  .post(createTeam)   // POST /api/teams -> Crea
  .get(getAllTeams)   // GET /api/teams  -> Leggi tutte
 
  // Prova a scriverlo senza verifyToken per vedere se si riaccende!
router.get('/tournament/:tournamentId', getTeamsByTournament);

module.exports = router;
