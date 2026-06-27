                                                     # Tournament-Hub

 
# 🏆 TournamentHub - Front-End

**TournamentHub** è una piattaforma web premium progettata per la gestione digitale di tornei calcistici e per lo scouting di atleti. L'applicazione permette agli organizzatori (ASD, leghe indipendenti, tornei aziendali) di configurare eventi, gestire squadre e aggiornare i risultati in tempo reale, offrendo al contempo una vetrina pubblica per osservatori e calciatori in cerca di visibilità.

-----------------------------------------------------------------------------------------------------------------------------------------

## 🚀 Funzionalità Principali

* **Pannello Gestore Privato:** Dashboard riservata agli organizzatori per la gestione dinamica di match, calendari e popopolamento dei dati.
* **Algoritmo Generazione Calendari:** Generazione automatica dei turni e delle giornate di scontro basata sulla formula del girone all'italiana (Round-Robin).
* **Classifiche Dinamiche:** Calcolo istantaneo di punti vittoria, pareggi, sconfitte e posizioni in classifica al salvataggio dei risultati.
* **Sistema di Controllo Accessi (Anti-Tampering):** Interfaccia pubblica sicura che permette agli spettatori di consultare i dati in tempo reale, bloccando i tentativi di modifica o visualizzazione degli hub di gestione tramite modali di sicurezza se il torneo non appartiene all'utente loggato.
* **Scouting Radar:** Sezione dedicata alle statistiche individuali dei calciatori (Gol, MVP) per creare un passaporto sportivo digitale.
* **Profilo Locale Fallback:** Gestione del profilo utente sincronizzata via `localStorage` per garantire l'operatività dell'interfaccia anche in configurazioni di backend isolate.

----------------------------------------------------------------------------------------------------------------------------------------

## 🛠️ Tech Stack

Il frontend è sviluppato utilizzando le seguenti tecnologie:

* **Framework Principale:** React 18 (Vite come build tool)
* **Interfaccia & Layout:** Bootstrap 5 & React-Bootstrap
* **Navigazione & Rotte:** React Router DOM v6
* **Comunicazione API:** Axios
* **Stile:** CSS3 Custom (Tema Premium Dark / Sportivo)
* **Ambiente di Sviluppo:** Linux

------------------------------------------------------------------------------------------------------------------------------------------

## 📂 Struttura delle Cartelle Principali

```text
src/
├── components/
│   ├── footer/
│   │   └── Footer.jsx
│   ├── AccessDeniedModal.jsx    # Modale di blocco permessi tornei
│   ├── Navbar.jsx               # Navbar globale dinamica
│   └── Profile.jsx              # Pagina Gestione Profilo (Local-first)
├── pages/
│   ├── Dashboard.jsx            # Pannello di controllo del torneo
│   ├── Home.jsx                 # Vetrina pubblica dei tornei e scouting
│   ├── Login.jsx                # Autenticazione Gestore
│   └── Register.jsx             # Registrazione Account
├── services/
│   └── api.js                   # Configurazione Axios e chiamate endpoint
├── App.jsx                      # Router centrale e stati globali
└── main.jsx


Link al Progetto:
- FrontEnd(Live Vercell) : tournament-hub-ten.vercel.app
- BackEnd(API su Render) : https://tournament-hub-backend-cbuk.onrender.com/
