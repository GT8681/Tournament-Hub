import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';

function App() {
  const [user, setUser] = useState(null);

  // Al caricamento dell'app, controlliamo se c'è già un utente salvato nel browser
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
          <Route path="/" element={<Home />} />

          {/* Se l'utente è già loggato, lo reindirizziamo direttamente alla Dashboard */}
          <Route
            path="/login"
            element={!user ? <Login onLoginSuccess={setUser} /> : <Navigate to="/dashboard" />}
          />

          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/dashboard" />} />

          {/* ROTTA PROTETTA: Se non è loggato, viene rispedito al Login */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

