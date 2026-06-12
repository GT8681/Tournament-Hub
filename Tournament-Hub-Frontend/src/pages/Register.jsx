import React, { useState } from 'react';
import { Container, Card, Form, Button, Toast, ToastContainer,Nav } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import './Login.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' o 'danger'
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowToast(false);

    try {
      await registerUser({ name, email, password });

      setToastType('success');
      setToastMessage('Registrazione completata con successo! Ti stiamo trasferendo al login...');
      setShowToast(true);

      setTimeout(() => {
        navigate('/login');
      }, 4000);

    } catch (err) {
      setToastType('danger');
      if (err.response && err.response.data && err.response.data.message) {
        setToastMessage(err.response.data.message);
      } else {
        setToastMessage('Errore durante la registrazione. Riprova.');
      }
      setShowToast(true);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center login-wrapper">

      {/* TOAST DINAMICO (Verde per successo, Rosso per errore) */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
        <Toast
          bg={toastType}
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className={`me-auto text-${toastType}`}>
              {toastType === 'success' ? '🚀 Successo' : '⚠️ Errore'}
            </strong>
            <small>Ora</small>
          </Toast.Header>
          <Toast.Body className="text-white fw-semibold">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Card className="shadow-lg p-4 login-card border-0">
        <Card.Body>
          <div className="text-center mb-4">
            <span className="login-icon">📝</span>
            <h2 className="fw-bold mt-2 text-dark">Crea Account</h2>
            <p className="text-muted small">Registrati per gestire i tuoi tornei e calciatori</p>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicName">
              <Form.Label className="fw-semibold custom-label">Nome Completo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Inserisci il tuo nome..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="custom-input"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label className="fw-semibold custom-label">Indirizzo Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="esempio@scout.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="custom-input"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formBasicPassword">
              <Form.Label className="fw-semibold custom-label">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Scegli una password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="custom-input"
                required
              />
            </Form.Group>

            <Button variant="warning" type="submit" className="w-100 fw-bold py-2 btn-login shadow-sm">
              REGISTRATI
            </Button>
            <div className='text-center mt-3 bg-primary rounded-3 py-1 fw-bold'>

              <Nav.Link as={Link} to="/" state={null}>HOME</Nav.Link>
            </div>
          </Form>

          <div className="text-center mt-4">
            <span className="small text-muted">Hai già un account? </span>
            <Link to="/login" className="small text-decoration-none fw-bold text-warning">
              Accedi qui
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;