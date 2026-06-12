import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const AccessDeniedModal = ({ show, onHide, tournamentName }) => {
    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            centered
            contentClassName="custom-modal-dark border-warning-subtle"
        >
            <Modal.Header closeButton closeVariant="white" className="border-0 pb-0">
                <Modal.Title className="text-uppercase fw-black fs-5  text-dark  tracking-wide">
                    🔒 Accesso Negato
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body className=" text-dark -50 py-3">
                <p className="mb-1">
                    Non puoi visualizzare il live hub di 
                    <strong className="text-warning mx-1">{tournamentName || "questo torneo"}</strong> 
                    perché non l'hai creato tu. Solo il proprietario può accedere alla gestione live.
                </p>
            </Modal.Body>
            
            <Modal.Footer className="border-0 pt-0">
                <Button 
                    className="btn-modal-login text-uppercase fw-bold small px-4 py-2 w-100"
                    onClick={onHide}
                >
                    Ho Capito
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AccessDeniedModal;
