import axios from 'axios';


const API_URL = import .meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 1. Creiamo l'istanza con l'URL di base del tuo server
const API = axios.create({
  baseURL: API_URL, 
});

// 2. 🔥 INTERCEPTOR ROBUSTO CON LOG DI CONTROLLO
API.interceptors.request.use((config) => {
  // Recuperiamo il token (controlla se nel tuo progetto si chiama esattamente 'token')
  const token = localStorage.getItem('token'); 
  
  if (token) {
    // Inseriamo il token nel formato standard Bearer
    config.headers.Authorization = `Bearer ${token}`;
    
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
export const loginUser = (credentials) => API.post('/api/auth/login', credentials);
export const registerUser = (userData) => API.post('/api/auth/register', userData);


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


export const getTeamsByTournamentService = async (tournamentId) => {
  // Fa la chiamata alla rotta specifica passando l'ID del torneo attivo
  return await API.get(`/teams/tournament/${tournamentId}`); 
};

// Nel tuo api.js del frontend
export const createTournamentService = async (tournamentData) => {
  // Passiamo direttamente l'intero oggetto che contiene { name, localTeams }
  return await API.post('/tournaments', tournamentData); 
};

// Nel tuo api.js del frontend
export const deleteTournamentService = async (tournamentId) => {
  return await API.delete(`/tournaments/${tournamentId}`); 
};

export const getPublicTournaments = async () => {

  try {
    const response = await API.get('/tournaments/public'); // Chiamata alla rotta per i tornei pubblici
    return response.data; // Restituisce l'array dei tornei al componente che lo chiama
  } catch (error) {
    console.error("Errore nel servizio api durante il recupero dei tornei pubblici:", error);
    throw error;
  }
};

export const updateTournamentStatus = (tournamentId, status) => API.put(`/tournaments/${tournamentId}`, { status });


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
export const updateMatchResult = (matchId, scoreData) => API.put(`/matches/${matchId}`, scoreData);

export default API;

