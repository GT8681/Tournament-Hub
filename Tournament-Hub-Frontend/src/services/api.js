import axios from 'axios';

// Configurazione dell'istanza Axios puntata sul tuo backend Express
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Intercettore per attaccare il Token JWT in automatico se presente
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ⬇️ FUNZIONI DI AUTENTICAZIONE (Devono essere qui dentro!)
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (userData) => API.post('/auth/register', userData);

// Funzioni pronte all'uso per dialogare con le rotte del torneo
export const getTournamentDetails = (id) => API.get(`/tournaments/${id}`);
export const getStandings = (id) => API.get(`/tournaments/${id}/standings`);
export const updateMatchResult = (matchId, scoreHome, scoreAway) => 
  API.put(`/matches/${matchId}`, { scoreHome, scoreAway });
export const resetTournament = (id) => API.post(`/tournaments/${id}/reset`);

export default API;