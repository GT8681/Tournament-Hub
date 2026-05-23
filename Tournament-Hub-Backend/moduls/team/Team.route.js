const express = require('express');
const router = express.Router();
const { createTeam, getAllTeams } = require('../team/Team.controller.js');


router.route('/')
  .post(createTeam)   // POST /api/teams -> Crea
  .get(getAllTeams);  // GET /api/teams  -> Leggi tutte

module.exports = router;
