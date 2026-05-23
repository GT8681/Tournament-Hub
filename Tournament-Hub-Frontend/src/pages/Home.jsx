import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">

      {/* Sezione Hero (Ex Jumbotron) */}
      <div className="bg-dark text-white text-center py-5 shadow">
        <Container className="py-5">
          <h1 className="display-3 fw-bold mb-3">
            Tournament<span className="text-warning">Hub</span>
          </h1>
          <p className="lead text-secondary mx-auto mb-4" style={{ maxWidth: '700px' }}>
            La piattaforma definitiva per gestire i tuoi tornei di calcio e far emergere i futuri talenti con il nostro sistema di scouting avanzato.
          </p>
          <div className="d-sm-flex justify-content-sm-center gap-3">
            <Button as={Link} to="/login" variant="warning" size="lg" className="fw-bold shadow-sm px-4">
              Accedi alla Piattaforma
            </Button>
            <Button variant="outline-light" size="lg" className="px-4">
              Scopri di più
            </Button>
          </div>
        </Container>
      </div>

      {/* Griglia delle Funzionalità con i componenti Card */}
      <Container className="my-5">
        <Row className="g-4">

          <Col md={4}>
            <Card className="h-100 shadow-sm border-light text-center p-3">
              <Card.Body>
                <div className="display-5 mb-3 text-warning">🏆</div>
                <Card.Title className="fw-bold fs-4">Tornei Live</Card.Title>
                <Card.Text className="text-muted">
                  Genera calendari, inserisci i risultati e aggiorna le classifiche in tempo reale.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm border-light text-center p-3">
              <Card.Body>
                <div className="display-5 mb-3 text-warning">🔍</div>
                <Card.Title className="fw-bold fs-4">Scouting</Card.Title>
                <Card.Text className="text-muted">
                  Monitora le prestazioni dei singoli calciatori per aiutarli a emergere nel professionismo.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm border-light text-center p-3">
              <Card.Body>
                <div className="display-5 mb-3 text-warning">⚡</div>
                <Card.Title className="fw-bold fs-4">Statistiche</Card.Title>
                <Card.Text className="text-muted">
                  Analizza i dati di ogni partita per avere una panoramica completa sulla crescita dei club.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

        </Row>
      </Container>

    </div>
  );
};

export default Home;


