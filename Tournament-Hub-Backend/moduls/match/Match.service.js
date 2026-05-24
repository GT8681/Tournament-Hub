const Match = require('./Match.schema.js');
const Tournament = require('../tournament/Tournament.schema.js');
const Team = require('../team/Team.schema.js'); 

exports.generateCalendarService = async (tournamentId) => {
    // 1. Verifica che il torneo esista
    const existingMatches = await Match.findOne({ tournament: tournamentId });
    if (existingMatches) {
      throw new Error('CALENDAR_ALREADY_GENERATED');
    }
   // COMMENTIAMO O SPOSTIAMO QUESTO BLOCCO PER IL TESTING:
   // Se vuoi poter rigenerare sempre il calendario durante i test, commenta queste righe:
   /*
   if (tournament.status !== 'PROGRAMMATO') {
     throw new Error('CALENDAR_ALREADY_GENERATED');
   }
   */
 
   // MODIFICA CRUCIALE: Importa e prendi TUTTE le squadre dal database generale
   // Nota: Assicurati che in cima a questo file (o dentro la funzione) sia importato il modello Team 
   // (es. const Team = require('../team/Team.schema'); o come si chiama il tuo modello)
   
   let teams = await Team.find({}); 
   const numTeams = teams.length;
 
   if (numTeams < 2) {
     throw new Error('NON_CI_SONO_ABBASTANZA_SQUADRE');
   }

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
    if(match.status === 'FINITA') {
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
  return await Match.find({})
    .populate('teamHome', 'name logo')
    .populate('teamAway', 'name logo')
    .sort({ round: 1 }); // Ordina i match per giornata (round 1, round 2...)
};
