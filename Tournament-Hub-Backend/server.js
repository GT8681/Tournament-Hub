require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db'); 

// Importa le rotte
const teamRoutes = require('./moduls/team/Team.route');
const tournamentRoutes = require('./moduls/tournament/Tournament.route');
const matchRoutes = require('./moduls/match/Match.route');
const authRoutes = require('./moduls/routes/auth.js');

// Configura dotenv e connessione al database


connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Usa le rotte
app.use('/api/teams', teamRoutes);
app.use('/tournaments', tournamentRoutes);
app.use('/api/matches', matchRoutes);

// Middleware per le rotte di autenticazione
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});
