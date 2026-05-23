import React from 'react';
import { Navbar as BootNavbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout(); // Svuota lo stato globale e il localStorage
    navigate('/'); // Riporta l'utente alla Home pubblica
  };

  return (
    <BootNavbar bg="dark" variant="dark" expand="lg" className="shadow px-3">
      <Container fluid>
        <BootNavbar.Brand as={Link} to="/" className="fw-bold fs-4">
          ⚽ Tournament<span className="text-warning">Hub</span>
        </BootNavbar.Brand>
        
        <BootNavbar.Toggle aria-controls="navbar-tournament" />
        
        <BootNavbar.Collapse id="navbar-tournament">
          <Nav className="ms-auto align-items-center gap-3">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            
            {/* Se l'utente è loggato mostriamo i link privati e il Logout */}
            {user ? (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <span className="text-secondary small">
                  Ciao, <strong className="text-warning">{user.name}</strong>
                </span>
                <Button variant="outline-danger" size="sm" onClick={handleLogoutClick} className="fw-bold px-3">
                  Esci
                </Button>
              </>
            ) : (
              // Se non è loggato mostriamo il classico tasto Accedi
              <Nav.Link as={Link} to="/login" className="btn btn-warning text-red fw-bold px-3 btn-sm">
                Accedi
              </Nav.Link>
            )}
          </Nav>
        </BootNavbar.Collapse>
      </Container>
    </BootNavbar>
  );
};

export default Navbar;