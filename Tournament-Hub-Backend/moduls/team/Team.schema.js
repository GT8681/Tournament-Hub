const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  logo: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },

  // 🔥 FONDAMENTALE: Ogni squadra deve memorizzare a quale torneo appartiene!
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);
