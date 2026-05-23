const { createTeamService, getAllTeamsService } = require('../team/Team.service.js');

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
