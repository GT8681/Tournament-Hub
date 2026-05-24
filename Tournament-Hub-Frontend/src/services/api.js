import axios from 'axios';

// 1. Creiamo l'istanza con l'URL di base del tuo server
const API = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// 2. 🔥 INTERCEPTOR ROBUSTO CON LOG DI CONTROLLO
API.interceptors.request.use((config) => {
  // Recuperiamo il token (controlla se nel tuo progetto si chiama esattamente 'token')
  const token = localStorage.getItem('token'); 
  
  if (token) {
    // Inseriamo il token nel formato standard Bearer
    config.headers.Authorization = `Bearer ${token}`;
    console.log("🔑 Token iniettato correttamente nella richiesta:", config.url);
  } else {
    console.warn("⚠️ Attenzione: Nessun token trovato nel localStorage per la rotta:", config.url);
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ==========================================
// 🔐 1. ROTTE DI AUTENTICAZIONE (authRoutes)
// ==========================================
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (userData) => API.post('/auth/register', userData);


// ==========================================
// 🏆 2. ROTTE TORNEI (tournamentRoutes)
// ==========================================
// Corrisponde a: POST /api/tournaments
export const createTournament = (tournamentData) => API.post('/tournaments', tournamentData);

// Corrisponde a: GET /api/tournaments/:id
export const getTournamentDetails = (id) => API.get(`/tournaments/${id}`);

// Corrisponde a: DELETE /api/tournaments/:id
export const deleteTournament = (id) => API.delete(`/tournaments/${id}`);

// Corrisponde a: GET /api/tournaments/:tournamentId/standings
export const getStandings = (tournamentId) => API.get(`/tournaments/${tournamentId}/standings`);

// Corrisponde a: POST /api/tournaments/:tournamentId/reset
export const resetTournament = (tournamentId) => API.post(`/tournaments/${tournamentId}/reset`);

export const getTournaments = () => API.get('/tournaments'); // Legge i tornei dell'utente loggato


// ==========================================
// 🏃‍♂️ 3. ROTTE SQUADRE (teamRoutes)
// ==========================================
// Corrisponde a: GET /api/teams (Legge TUTTE le squadre)
//export const getTeams = () => API.get('/teams');
export const getTeams = () => API.get('/teams'); // Legge le squadre di un torneo specifico

// Corrisponde a: POST /api/teams (Crea una squadra)
export const createTeam = (teamData) => API.post('/teams', teamData);


// ==========================================
// 🗓️ 4. ROTTE MATCH (matchRoutes)
// ==========================================
// Corrisponde a: GET /api/matches/tournament/:tournamentId (Prende i match del torneo)
export const getMatches = (tournamentId) => API.get(`/matches/tournament/${tournamentId}`);

// Corrisponde a: POST /api/matches/generate/:tournamentId (Genera il calendario)
export const generateCalendar = (tournamentId) => API.post(`/matches/generate/${tournamentId}`);

// Corrisponde a: PUT /api/matches/:matchId/score (Aggiorna il risultato)
export const updateMatchResult = (matchId, scoreData) => API.put(`/matches/${matchId}/score`, scoreData);

export default API;

