import React from 'react';

const StandingsTable = () => {
  // Dati finti temporanei per vedere l'effetto grafico
  const mockStandings = [
    { teamId: '1', name: 'Inter Milan', played: 1, won: 1, points: 3, goalDifference: 2 },
    { teamId: '2', name: 'AC Milan', played: 1, won: 0, points: 0, goalDifference: -2 }
  ];

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-primary text-white fw-bold">
        📊 Classifica Torneo
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 text-center">
          <thead className="table-light">
            <tr>
              <th>Pos</th>
              <th className="text-start">Club</th>
              <th>G</th>
              <th>V</th>
              <th>DR</th>
              <th className="fw-bold text-primary">Pt</th>
            </tr>
          </thead>
          <tbody>
            {mockStandings.map((team, index) => (
              <tr key={team.teamId}>
                <td className="fw-bold">{index + 1}</td>
                <td className="text-start fw-bold">{team.name}</td>
                <td>{team.played}</td>
                <td>{team.won}</td>
                <td>{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</td>
                <td className="fw-bold text-primary">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StandingsTable;