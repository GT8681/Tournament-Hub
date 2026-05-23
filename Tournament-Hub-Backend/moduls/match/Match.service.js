const Match = require('./Match.schema.js');
const Tournament = require('../tournament/Tournament.schema.js');

exports.generateCalendarService = async (tournamentId) => {
  // 1. Recupera il torneo e controlla che esista
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new Error('TOURNAMENT_NOT_FOUND');
  }

  // Se il torneo è già iniziato o finito, non rigenerare il calendario
  if (tournament.status !== 'PROGRAMMATO') {
    throw new Error('CALENDAR_ALREADY_GENERATED');
  }

  // Creiamo una copia dell'array degli ID delle squadre
  let teams = [...tournament.teams];
  const numTeams = teams.length;

  // Se il numero di squadre è dispari, l'algoritmo classico richiederebbe un "riposo".
  // Per ora assumiamo che siano pari (4, 6, 8 squadre) come test.
  
  const rounds = numTeams - 1; // Numero di giornate necessarie (es. 4 squadre = 3 giornate)
  const matchesPerRound = numTeams / 2; // Partite per giornata (es. 4 squadre = 2 partite a giornata)

  const createdMatches = [];

  // 2. Algoritmo di generazione turni
  for (let round = 1; round <= rounds; round++) {
    for (let i = 0; i < matchesPerRound; i++) {
      const home = teams[i];
      const away = teams[numTeams - 1 - i];

      // Alterniamo casa e trasferta per non far giocare sempre una squadra in casa
      const teamHome = round % 2 === 0 ? home : away;
      const teamAway = round % 2 === 0 ? away : home;

      // Prepariamo l'oggetto del match per MongoDB
      const matchData = {
        tournament: tournamentId,
        teamHome,
        teamAway,
        round,
        status: 'DA_GIOCARE',
        scoreHome: 0,
        scoreAway: 0
      };

      createdMatches.push(matchData);
    }

    // Rotazione delle squadre (esclusa la prima che rimane fissa in posizione 0)
    // Questo è il segreto dell'algoritmo di Berger
    teams.splice(1, 0, teams.pop());
  }

  // 3. Salva massivamente tutte le partite nel Database
  const savedMatches = await Match.insertMany(createdMatches);

  // 4. Aggiorna lo stato del torneo in 'IN_CORSO'
  tournament.status = 'IN_CORSO';
  await tournament.save();

  return savedMatches;
};

// @desc    Aggiorna il risultato di una partita
exports.updateMatchResultService = async (matchId, scoreHome, scoreAway) => {
    // 1. Cerca la partita nel database
    const match = await Match.findById(matchId);
    if (!match) {
      throw new Error('MATCH_NOT_FOUND');
    }
    if(match.statu === 'FINITA') {
      throw new Error('MATCH_ALREADY_FINISHED');

    }
  
    // 2. Aggiorna i gol e lo stato
    match.scoreHome = scoreHome;
    match.scoreAway = scoreAway;
    match.status = 'FINITA'; // La partita è ufficialmente conclusa!
  
    // 3. Salva le modifiche nel DB
    return await match.save();
  };
  

  // @desc    Ottieni tutti i match di un torneo specifico
exports.getMatchesByTournamentService = async (tournamentId) => {
  // Cerchiamo i match del torneo e popoliamo i dettagli di teamHome e teamAway
  return await Match.find({ tournament: tournamentId })
    .populate('teamHome', 'name logo')
    .populate('teamAway', 'name logo')
    .sort({ round: 1 }); // Ordina i match per giornata (round 1, round 2...)
};
