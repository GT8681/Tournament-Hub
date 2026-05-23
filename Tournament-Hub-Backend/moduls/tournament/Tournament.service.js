const Tournament = require('./Tournament.schema.js');
const Match = require('../match/Match.schema.js'); 


exports.createTournamentService = async (tournamentData) => {
  const { name, teams } = tournamentData;

  // Controllo di business: servono almeno 4 squadre per il girone
  if (!teams || teams.length < 4) {
    throw new Error('INSUFFICIENT_TEAMS');
  }

  // Crea il torneo nel DB
  return await Tournament.create({
    name,
    teams
  });
};

exports.getTournamentByIdService = async (id) => {
  // Recupera il torneo e trasforma gli ID delle squadre nei dati reali
  const tournament = await Tournament.findById(id).populate('teams');
  
  if (!tournament) {
    throw new Error('TOURNAMENT_NOT_FOUND');
  }
  
  return tournament;
};



// @desc    Calcola la classifica in tempo reale di un torneo
exports.getStandingsService = async (tournamentId) => {
  // 1. Recupera il torneo e popola le squadre per avere i loro nomi
  const tournament = await Tournament.findById(tournamentId).populate('teams');
  if (!tournament) {
    throw new Error('TOURNAMENT_NOT_FOUND');
  }

  // 2. Inizializza la struttura della classifica per ogni squadra
  const standings = {};
  tournament.teams.forEach(team => {
    standings[team._id] = {
      teamId: team._id,
      name: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    };
  });

  // 3. Recupera solo i match già terminati di questo torneo
  const finishedMatches = await Match.find({ tournament: tournamentId, status: 'FINITA' });

  // 4. Cicla sui match per aggiornare le statistiche di ogni squadra
  finishedMatches.forEach(match => {
    const home = standings[match.teamHome];
    const away = standings[match.teamAway];

    if (!home || !away) return; // Controllo di sicurezza

    home.played += 1;
    away.played += 1;
    
    home.goalsFor += match.scoreHome;
    home.goalsAgainst += match.scoreAway;
    away.goalsFor += match.scoreAway;
    away.goalsAgainst += match.scoreHome;

    // Assegnazione dei punti in base al risultato
    if (match.scoreHome > match.scoreAway) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (match.scoreHome < match.scoreAway) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }

    // Ricalcola la differenza reti
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  });

  // 5. Trasforma l'oggetto in un array e ordinalo per punti (e differenza reti in caso di parità)
  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return b.goalDifference - a.goalDifference;
  });
};


// 🔄 1. RESET DEL TORNEO: Cancella tutti i match associati
exports.resetTournamentService = async (tournamentId) => {

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new Error('TOURNAMENT_NOT_FOUND');
  }
  // Cancella tutti i match legati a questo torneo
  await Match.deleteMany({ tournament: tournamentId });

  return tournament;
};

// 🗑️ ELIMINAZIONE COMPLETA BLINDATA
exports.deleteTournamentCompleteService = async (tournamentId) => {
  // .trim() rimuove spazi vuoti o invii accidentali presi da Postman o dal frontend
  const cleanId = tournamentId.trim(); 
  
  console.log("⚙️ Servizio: Tento la cancellazione diretta per ID pulito:", cleanId);

  // 1. Cancella i match associati
  await Match.deleteMany({ tournament: cleanId });

  // 2. Cancella il torneo e restituisce il documento eliminato (se esisteva)
  const deletedTournament = await Tournament.findByIdAndDelete(cleanId);
  
  // 3. Se non ha cancellato nulla, significa che l'ID non esisteva nel DB
  if (!deletedTournament) {
    throw new Error('TOURNAMENT_NOT_FOUND');
  }

  console.log("✅ Servizio: Torneo e match eliminati con successo dal DB!");
  return { message: 'Torneo e match associati eliminati con successo' };
};