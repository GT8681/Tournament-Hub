import React from 'react';
import StandingsTable from '../components/StandingsTable';
import MatchRow from '../components/MatchRow';

const Dashboard = () => {
  return (
    <main className="container my-5">
    
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold text-dark">🏆 Gestione Torneo Live</h2>
          <p className="text-muted">Monitora i match, inserisci i risultati in tempo reale e analizza le statistiche dei club.</p>
        </div>
      </div>

      {/* GRIGLIA A DUE COLONNE */}
      <div className="row g-4">
        
        {/* Colonna Sinistra: Lista Partite */}
        <div className="col-md-7">
          <h4 className="fw-bold text-secondary mb-3">⚽ Calendario Match </h4>
          <MatchRow />
          <MatchRow />
        </div>

        
        <div className="col-md-5">
          <h4 className="fw-bold text-secondary mb-3">📊 Situazione Classifica</h4>
          <StandingsTable />
        </div>

      </div>
    </main>
  );
};

export default Dashboard;