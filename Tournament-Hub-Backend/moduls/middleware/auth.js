const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;
  const JWT_SECRET = process.env.JWT_SECRET;
  // 1. Controlliamo se il token è presente negli header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Estraiamo la stringa pulita del token
      token = req.headers.authorization.split(' ')[1];

      // 2. Decodifichiamo il token usando la TUA chiave segreta
      // 🔥 IMPORTANTE: Assicurati che process.env.JWT_SECRET sia lo stesso del login!
      const decoded = jwt.verify(token, JWT_SECRET);


      // 3. 🔥 IL TRUCCO ANCORA PIÙ SICURO:
      // Impostiamo req.user mappando sia id che _id per evitare l'errore undefined
      req.user = {
        id: decoded.id || decoded._id || decoded.userId
      };

      // Se l'ID non è stato estratto in nessun modo, blocchiamo subito prima di mandarlo al torneo
      if (!req.user.id) {
     
        return res.status(401).json({ message: 'Token malformato. ID utente non trovato.' });
      }

      return next(); // Splendido, andiamo al controller del torneo!

    } catch (error) {
      console.error("❌ Errore durante la verifica del JWT:", error.message);
      return res.status(401).json({ message: 'Token non valido o scaduto.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Utente non autenticato. Token mancante.' });
  }
};

module.exports = protect; // Controlla se esporti così o con { protect }