import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import { getPublicTournaments } from './services/api';




function App() {

  // 🏆 STATO UNICO E REALE: Conterrà i tornei scaricati dal database via API
  const [tournaments, setTournaments] = useState([]);
  // Stato dell'utente con controllo iniziale su localStorage
  const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);


  // Funzione per aggiornare lo stato globale dei tornei (usata dalla Dashboard dopo le chiamate API)
  const handleTournamentsUpdate = (updatedTournaments) => {
    setTournaments(updatedTournaments);
  };


  // 2. Creiamo la funzione per caricare i tornei usando il servizio pubblico
  // 🌍 Funzione per scaricare i tornei di tutti gli utenti dal database
  const loadGlobalTournaments = async () => {
    try {
      // 🚀 Chiamiamo il servizio che usa l'istanza 'api' di axios
      const data = await getPublicTournaments();

      // 🔍 DEBUG: Controlliamo cosa arriva esattamente dal backend
      console.log("Dati ricevuti dal servizio api:", data);

      if (Array.isArray(data)) {
        // Se il backend restituisce direttamente l'array, lo salviamo
        setTournaments(data);
      } else if (data && Array.isArray(data.tournaments)) {
        // Se l'array è avvolto in un oggetto { tournaments: [...] }
        setTournaments(data.tournaments);
      } else {
        // Fail-safe: se il formato è inaspettato, mettiamo un array vuoto per non far crashare .map()
        setTournaments([]);
      }
    } catch (error) {
      console.error("Impossibile caricare i tornei in Home:", error);
      setTournaments([]); // Evita il crash anche in caso di errore di rete
    }
  };





  // Al caricamento dell'app, sincronizziamo l'utente se presente nel browser
  useEffect(() => {
    loadGlobalTournaments();
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
          {/* Home pubblica */}
          <Route path="/" element={<Home tournaments={tournaments} />} />

          {/* 🎯 LA TUA DASHBOARD: Accetta sia l'accesso normale, sia l'accesso a un torneo specifico tramite /:id */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard/> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/:id"
            element={user ? <Dashboard onTournamentsUpdate={handleTournamentsUpdate} /> : <Navigate to="/login" />}
          />

          <Route path="/login" element={!user ? <Login onLoginSuccess={setUser} /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        </Routes>
    </div>
    </Router >
  );
}

export default App;
