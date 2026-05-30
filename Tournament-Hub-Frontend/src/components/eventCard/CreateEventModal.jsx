import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const CreateEventModal = ({ show, handleClose, onCreate }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'Torneo Calcio a 5',
        date: '',
        location: '',
        price: '',
        maxTeams: '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Passiamo i dati al componente padre per fare la chiamata API
        onCreate(formData);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton bg="dark" className="text-dark">
                <Modal.Title className="fw-bold">🏆 Configura Nuovo Evento Sportivo</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="p-4">
                    <Row className="g-3">
                        <Col md={8}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-muted small">Nome dell'Evento</Form.Label>
                                <Form.Control type="text" name="title" placeholder="Es: Winter Cup Taranto 2026" required onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-muted small">Tipo di Competizione</Form.Label>
                                <Form.Select name="type" onChange={handleChange}>
                                    <option value="Torneo Calcio a 5">Torneo Calcio a 5</option>
                                    <option value="Torneo Calcio a 7">Torneo Calcio a 7</option>
                                    <option value="Campionato Calcio a 11">Campionato Calcio a 11</option>
                                    <option value="Provini / Open Day Scouting">Provini / Open Day Scouting</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-muted small">Centro Sportivo / Indirizzo</Form.Label>
                                <Form.Control type="text" name="location" placeholder="Es: Centro Sportivo San Siro, Milano" required onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-muted small">Data Inizio</Form.Label>
                                <Form.Control type="date" name="date" required onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-muted small">Prezzo Iscrizione (€)</Form.Label>
                                <Form.Control type="number" name="price" placeholder="0 = Gratis" required onChange={handleChange} />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-muted small">Numero Massimo Squadre</Form.Label>
                                <Form.Control type="number" name="maxTeams" placeholder="Es: 16" required onChange={handleChange} />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-muted small">Regolamento o Descrizione Aggiuntiva</Form.Label>
                                <Form.Control as="textarea" rows={3} name="description" placeholder="Inserisci info su premi, arbitri o requisiti di iscrizione..." onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleClose}>Annulla</Button>
                    <Button variant="primary" type="submit" className="fw-bold px-4">Pubblica Evento 🚀</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CreateEventModal;
