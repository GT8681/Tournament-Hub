const Team = require('../team/Team.schema.js');

exports.createTeamService = async (teamData) => {
  const { name, logo } = teamData;

  // Controlla se la squadra esiste già
  const teamExists = await Team.findOne({ name });
  if (teamExists) {
    throw new Error('TEAM_EXISTS'); // Lanciamo un errore specifico
  }

  // Crea e restituisce la squadra
  return await Team.create({ name, logo });
};

exports.getAllTeamsService = async () => {
  // Recupera le squadre ordinate per nome
  return await Team.find().sort({ name: 1 });
};
