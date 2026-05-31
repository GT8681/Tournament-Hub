gestore-tornei-backend/
├── config/
│   └── db.js          <-- Configurazione connessione MongoDB
├── models/
│   ├── Team.js        <-- Il modello che abbiamo scritto prima
│   ├── Tournament.js  <-- Il modello del torneo
│   └── Match.js       <-- Il modello delle partite
├── controllers/       <-- Logica delle rotte (es. calcolo classifica)
├── routes/            <-- Definizione degli endpoint API
├── .env               <-- Variabili d'ambiente (PORT, MONGO_URI)
└── server.js          <-- Entry point dell'applicazione




# 🏟️ TournamentHub

**TournamentHub** è una web application full-stack progettata per semplificare la vita ad organizzatori di eventi sportivi, gestori di ASD e società dilettantistiche. La piattaforma permette di creare tornei di calcio dedicati, registrare le squadre partecipanti, generare calendari di match d'andata e ritorno in modalità automatica e aggiornare i risultati in tempo reale calcolando istantaneamente la classifica live.

L'applicazione offre un'interfaccia pubblica (Home) per consentire ad appassionati e atleti di monitorare le competizioni e un pannello amministrativo protetto (Dashboard) per la gestione completa a cascata del database.

---

## 🚀 Funzionalità Principali

### 🌐 Area Pubblica (Home)
* **Vetrina Competizioni:** Visualizzazione in tempo reale dei tornei attivi estratti dal database.
* **Adattabilità Utente:** Switch dinamico delle informazioni in base allo stato di autenticazione dell'utente (Session Storage / LocalStorage).
* **Navigazione Ottimizzata:** Navbar fluida con link contestuali (il link "Home" scompare in automatico quando ci si trova sulla landing page per migliorare la UX).

### ⚙️ Pannello Organizzatore (Dashboard Protetta)
* **Multi-Torneo Hub:** Visualizzazione a griglia di tutte le competizioni create dal gestore con badge di stato e funzioni di eliminazione sicura a cascata.
* **Creazione Rapida:** Modulo di iscrizione torneo con aggiunta dinamica e rimozione a Badge delle squadre partecipanti prima del salvataggio nel DB.
* **Algoritmo Calendari:** Generazione automatica delle giornate di scontro diretto bilanciando i match tra casa e trasferta con un solo click.
* **Classifiche Live:** Modale interattivo per l'inserimento dei punteggi definitivi dei singoli match con ricalcolo automatico immediato dei punti in classifica.

---

## 🛠️ Stack Tecnologico

### Frontend
* **React (Vite):** Framework reattivo per la strutturazione dell'interfaccia utente basata su componenti.
* **React Router DOM:** Gestione delle rotte dell'applicazione, protezione dei percorsi privati e tracciamento della posizione tramite `useLocation`.
* **React Bootstrap:** Griglie, tabelle, modali e componenti stilizzati con logiche responsive Mobile-First.
* **Axios / API Service:** Centralizzazione delle richieste HTTP verso i servizi backend.

### Backend & Database (Architettura di Riferimento)
* **Node.js & Express:** Ambiente di runtime e framework per l'esposizione delle API RESTful.
* **MongoDB & Mongoose:** Database non relazionale e Object Modeling per la gestione degli schemi di Tornei, Squadre, Match e Classifiche con logica relazionale integrata.

---

## 📁 Struttura Cartelle del Frontend

```text
src/
├── components/
│   └── Navbar.jsx           # Barra di navigazione globale contestuale
├── pages/
│   ├── Home.jsx             # Vetrina pubblica dei tornei attivi
│   ├── Dashboard.jsx        # Hub amministrativo per la gestione delle leghe
│   ├── Login.jsx            # Schermata di autenticazione utente
│   └── Register.jsx         # Schermata di registrazione nuove ASD
├── services/
│   └── api.js               # Connettore e chiamate axios verso il backend
├── App.jsx                  # State management centralizzato e router
└── main.jsx                 # Entry point dell'applicazione
