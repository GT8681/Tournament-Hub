import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert,Nav} from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false); // ⬅️ NUOVO: Stato per il successo del login

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const response = await loginUser({ email, password });

      // 1. Salviamo i dati nel localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // 2. Attiviamo il messaggio verde a schermo
      setSuccess(true);

      // 3. Aspettiamo 1.5 secondi per mostrare il messaggio, poi aggiorniamo lo stato e navighiamo
      setTimeout(() => {
        onLoginSuccess(response.data.user);
        navigate('/dashboard');
      }, 4000);

    } catch (err) {
      console.error("❌ Errore intercettato nel Login:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Email o password errati. Riprova.');
      }
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center login-wrapper" style={{ minHeight: '85vh' }}>
      <Card className="shadow-lg p-4 login-card border-0" style={{ width: '100%', maxWidth: '400px' }}>
        <Card.Body>
          <div className="text-center mb-4">
            <span className="login-icon" style={{ fontSize: '2.5rem' }}>⚽</span>
            <h2 className="fw-bold mt-2 text-dark">BENVENUTO</h2>
            <p className="text-muted small">Accedi a TournamentHub per gestire il tuo scout</p>
          </div>

          {/* 🚨 MESSAGGIO DI ERRORE (Rosso) */}
          {error && (
            <Alert variant="danger" className="py-2 small text-center fw-semibold shadow-sm">
              ⚠️ {error}
            </Alert>
          )}

          {/* ✅ MESSAGGIO DI SUCCESSO (Verde) */}
          {success && (
            <Alert variant="success" className="py-2 small text-center fw-semibold shadow-sm animate__animated animate__fadeIn">
              🚀 Accesso effettuato! Ti stiamo trasferendo alla tua DASHBOARD
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label className="fw-semibold custom-label text-secondary small">Indirizzo Email</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="gianni.toscano@icloud.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="custom-input py-2"
                required
                disabled={success} // Disabilita l'input se il login è andato a buon fine
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formBasicPassword">
              <Form.Label className="fw-semibold custom-label text-secondary small">Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="custom-input py-2"
                required
                disabled={success} // Disabilita l'input se il login è andato a buon fine
              />
            </Form.Group>

            {/* Disabilitiamo il bottone e cambiamo il testo se sta caricando il reindirizzamento */}
            <Button 
              variant="warning" 
              type="submit" 
              className="w-100 fw-bold py-2 btn-login text-dark shadow-sm" 
              style={{ backgroundColor: '#e2e600', border: 'none' }}
              disabled={success}
            >
              {success ? 'Caricamento...' : 'Accedi'}
            </Button>
            <div className='text-center mt-3 bg-primary rounded-3 py-1 fw-bold '>

                 <Nav.Link as={Link} to="/" state={null}>HOME</Nav.Link>
            </div>
           
          </Form>

          <div className="text-center mt-4">
            <span className="small text-muted">Non hai un account? </span>
            <Link to="/register" className="small text-decoration-none fw-bold text-warning">
              Registrati ora
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;