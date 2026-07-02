const { generateCalendarService, updateMatchResultService,getMatchesByTournamentService} = require('../match/Match.service.js');
const Match = require('./Match.schema');
const Tournament = require('../tournament/Tournament.schema');



// @desc    Genera il calendario delle partite per un torneo e lo avvia
// @route   POST /api/matches/generate/:tournamentId

exports.generateCalendar = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    // 1. Cancella i match vecchi di questo torneo
    await Match.deleteMany({ tournament: tournamentId });
    
    // 2. Recupera il torneo
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament || !tournament.teams || tournament.teams.length === 0) {
      return res.status(404).json({ message: "Torneo non trovato o senza squadre iscritte." });
    }

    let teams = [...tournament.teams];
    
    // Se le squadre sono dispari, aggiungiamo un elemento "RIPOSO" per far quadrare i turni
    if (teams.length % 2 !== 0) {
      teams.push("RIPOSO");
    }

    const numSquadre = teams.length;
    const giornateAndata = numSquadre - 1; // Numero di giornate del girone d'andata
    const matchesToSave = [];

    // Algoritmo di Berger (Round Robin) per distribuire le giornate in modo reale
    for (let giornata = 0; giornata < giornateAndata; giornata++) {
      for (let i = 0; i < numSquadre / 2; i++) {
        const casaIndex = (giornata + i) % (numSquadre - 1);
        let trasfertaIndex = (numSquadre - 1 - i + giornata) % (numSquadre - 1);

        // La prima squadra rimane fissa, le altre ruotano
        if (i === 0) {
          trasfertaIndex = numSquadre - 1;
        }

        const teamCasa = teams[casaIndex];
        const teamTrasferta = teams[trasfertaIndex];

        // Saltiamo l'inserimento se una delle due squadre è il "RIPOSO"
        if (teamCasa === "RIPOSO" || teamTrasferta === "RIPOSO") {
          continue;
        }

        // Calcoliamo i numeri reali delle giornate (partendo da 1)
        const numeroGiornataAndata = giornata + 1;
        const numeroGiornataRitorno = numeroGiornataAndata + giornateAndata;

        // Alterniamo casa/fuori casa ad ogni giornata per non far giocare una squadra sempre in casa
        const invertiFattore = giornata % 2 === 0;
        const finaleCasa = invertiFattore ? teamCasa : teamTrasferta;
        const finaleTrasferta = invertiFattore ? teamTrasferta : teamCasa;

        // 3. Genera il Match d'Andata
        matchesToSave.push(new Match({
          tournament: tournamentId,
          teamHome: finaleCasa,
          teamAway: finaleTrasferta,
          status: 'DA_GIOCARE',
          scoreHome: 0,
          scoreAway: 0,
          round: numeroGiornataAndata // Esempio: Giornata 1, 2, 3...
        }));

        // 4. Genera il Match di Ritorno (A parti invertite e spostato nella seconda metà del torneo)
        matchesToSave.push(new Match({
          tournament: tournamentId,
          teamHome: finaleTrasferta, // Invertito!
          teamAway: finaleCasa,      // Invertito!
          status: 'DA_GIOCARE',
          scoreHome: 0,
          scoreAway: 0,
          round: numeroGiornataRitorno // Esempio: Giornata 4, 5, 6...
        }));
      }
    }

    // Salviamo tutti i match nel database in un colpo solo (molto più veloce)
    await Match.insertMany(matchesToSave);

    // 5. Recupera i match appena creati popolando i nomi delle squadre
    const populatedMatches = await Match.find({ tournament: tournamentId })
      .sort({ round: 1 }) // Li ordina dal primo turno all'ultimo
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




exports.updateMatchResult = async (req, res) => {
  const { id } = req.params;
  
  try {
      // Estraiamo sia scores che scorers per sicurezza
      const { scoreHome, scoreAway, status, scores, scorers } = req.body;
      
      // Se il frontend ha mandato 'scorers', lo assegniamo a dataScores
      const dataScores = scores || scorers || [];

      const updatedMatch = await Match.findByIdAndUpdate(
          id,
          { 
              scoreHome, 
              scoreAway, 
              status, 
              scores: dataScores // 🛡️ Usiamo l'array valorizzato sicuro
          },
          { new: true }
      ).populate('teamHome teamAway');

      if (!updatedMatch) {
          return res.status(404).json({ message: "Match non trovato" });
      }

      res.json({
          message: "Risultato aggiornato!",
          match: updatedMatch
      });

  } catch (error) {
      console.error("Errore backend:", error);
      res.status(500).json({ message: "Errore interno" });
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