const { createTeamService, getAllTeamsService } = require('../team/Team.service.js');
const Team = require('./Team.schema'); // Assicurati che il percorso sia corretto

exports.createTeam = async (req, res) => {
  try {
    const newTeam = await createTeamService(req.body);
    res.status(201).json(newTeam);
  } catch (error) {
    if (error.message === 'TEAM_EXISTS') {
      return res.status(400).json({ message: 'Una squadra con questo nome esiste già' });
    }
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await getAllTeamsService();
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};



// Nel tuo Team.controller.js del backend
exports.getTeamsByTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params; // Prende l'ID passato nell'URL dal frontend
    // 🔥 IL FILTRO REALE: Dobbiamo cercare solo i team che hanno quel tournamentId!
    const teams = await Team.find({ tournamentId: tournamentId });
    res.status(200).json(teams);
  } catch (error) {
    console.error("❌ Errore getTeamsByTournament:", error);
    res.status(500).json({ message: error.message });
  }
};

