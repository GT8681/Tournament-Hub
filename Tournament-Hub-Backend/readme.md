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
