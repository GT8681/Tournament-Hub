const express = require('express');
const router = express.Router();
// Importiamo il controller appena creato
const authController = require('../controller/authController');

// Rotta per la registrazione -> delega al controller
router.post('/register', authController.register);

// Rotta per il login -> delega al controller
router.post('/login', authController.login);

module.exports = router;