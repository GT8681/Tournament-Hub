const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL);
    console.log(`MongoDB Connesso con successo: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Errore di connessione a MongoDB: ${error.message}`);
    process.exit(1); // Chiude l'applicazione in caso di errore grave
  }
};

module.exports = connectDB;
