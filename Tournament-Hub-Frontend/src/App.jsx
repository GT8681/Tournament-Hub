import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';

function App() {
  // 🏆 STATO UNICO E REALE: Conterrà i tornei scaricati dal database via API
  const [tournaments, setTournaments] = useState([]);

  // Funzione per aggiornare lo stato globale dei tornei (usata dalla Dashboard dopo le chiamate API)
  const handleTournamentsUpdate = (updatedTournaments) => {
    setTournaments(updatedTournaments);
  };

  // Stato dell'utente con controllo iniziale su localStorage
  const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

  // Al caricamento dell'app, sincronizziamo l'utente se presente nel browser
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Funzione per gestire il Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container bg-light min-vh-100">
        {/* Passiamo l'utente e la funzione di logout alla Navbar */}
        <Navbar user={user} onLogout={handleLogout} />

        <Routes>
          {/* 🏠 HOME: Riceve la lista dei tornei reali da mostrare in vetrina */}
          <Route
            path="/"
            element={<Home tournaments={tournaments} />}
          />

          {/* 🏟️ DASHBOARD: Passiamo la funzione onTournamentsUpdate per aggiornare lo stato globale con i dati del DB */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard onTournamentsUpdate={handleTournamentsUpdate} /> : <Navigate to="/login" />} 
          />

          {/* Se l'utente è già loggato, lo reindirizziamo direttamente alla Dashboard se prova ad andare su /login */}
          <Route
            path="/login"
            element={!user ? <Login onLoginSuccess={setUser} /> : <Navigate to="/dashboard" />}
          />

          {/* Se l'utente è già loggato, lo reindirizziamo direttamente alla Dashboard se prova ad andare su /register */}
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/dashboard" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
