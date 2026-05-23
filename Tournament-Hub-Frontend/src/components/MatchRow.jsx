import React from 'react';

const MatchRow = () => {
  // Dati finti temporanei di una partita per vedere il risultato estetico
  const mockMatch = {
    _id: '101',
    homeTeam: { name: 'Inter Milan' },
    awayTeam: { name: 'AC Milan' },
    scoreHome: 0,
    scoreAway: 0,
    status: 'DA_INIZIARE' // Può essere 'DA_INIZIARE' o 'TERMINATA'
  };

  return (
    <div className="card mb-3 border-0 shadow-sm custom-match-card">
      <div className="card-body py-3">
        <div className="row align-items-center text-center">
          
          {/* Squadra di Casa */}
          <div className="col-4 text-end fw-bold text-truncate">
            {mockMatch.homeTeam.name}
          </div>

          {/* Risultato / Input Gol */}
          <div className="col-4 d-flex justify-content-center align-items-center gap-2">
            <input 
              type="number" 
              className="form-control text-center fw-bold px-1" 
              style={{ width: '45px', height: '38px', fontSize: '1.1rem' }}
              placeholder="-"
              min="0"
              disabled={mockMatch.status === 'TERMINATA'}
            />
            <span className="fw-bold text-muted">:</span>
            <input 
              type="number" 
              className="form-control text-center fw-bold px-1" 
              style={{ width: '45px', height: '38px', fontSize: '1.1rem' }}
              placeholder="-"
              min="0"
              disabled={mockMatch.status === 'TERMINATA'}
            />
          </div>

          {/* Squadra Ospite */}
          <div className="col-4 text-start fw-bold text-truncate">
            {mockMatch.awayTeam.name}
          </div>

        </div>

        {/* Riga inferiore per Azioni e Badge */}
        <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
          <span className={`badge ${mockMatch.status === 'TERMINATA' ? 'bg-secondary' : 'bg-success'}`}>
            {mockMatch.status === 'TERMINATA' ? 'Terminata' : 'Da giocare'}
          </span>
          
          {mockMatch.status !== 'TERMINATA' && (
            <button className="btn btn-sm btn-primary fw-bold px-3">
              Salva Risultato
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchRow;