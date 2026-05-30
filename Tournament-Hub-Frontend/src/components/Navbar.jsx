import React from 'react';
import { Navbar as BootNavbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    onLogout(); // Svuota lo stato globale e il localStorage
    navigate('/'); // Riporta l'utente alla Home pubblica
  };

  return (
    <BootNavbar bg="dark" variant="dark" expand="lg" className="shadow px-3">
      <Container fluid>
      
        
        <BootNavbar.Toggle aria-controls="navbar-tournament" />
        
        <BootNavbar.Collapse id="navbar-tournament">
          <Nav className="ms-auto align-items-center gap-3">
            
            {/* Il link Home sparisce se sei già sulla Home */}
            {location.pathname !== '/' && (
              <Nav.Link as={Link} to="/">Home</Nav.Link>
            )}
            
            {/* Mostriamo la Dashboard e il Logout SOLO se l'utente è loggato */}
            {user && (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <span className="text-secondary small">
                  Ciao, <strong className="text-warning">{user.name}</strong>
                </span>
                <Button variant="outline-danger" size="sm" onClick={handleLogoutClick} className="fw-bold px-3">
                  Esci
                </Button>
              </>
            )}
            
          </Nav>
        </BootNavbar.Collapse>
      </Container>
    </BootNavbar>
  );
};

export default Navbar;
