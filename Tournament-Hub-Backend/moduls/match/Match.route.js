const express = require('express');
const router = express.Router();
const { generateCalendar,updateMatchResult, getMatchesByTournament } = require('../match/Match.controller.js');

// POST /api/matches/generate/:tournamentId
router.post('/generate/:tournamentId', generateCalendar);

// PUT /api/matches/:matchId/score
router.put('/:matchId/score',updateMatchResult);

//GET /api/matches/tournament/:tournamentId
router.get('/tournament/:tournamentId',getMatchesByTournament);



module.exports = router;