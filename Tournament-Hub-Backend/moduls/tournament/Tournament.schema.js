const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Il nome del torneo è obbligatorio'],
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['PROGRAMMATO', 'IN_CORSO', 'TERMINATO'],
    default: 'PROGRAMMATO'
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Tournament', TournamentSchema);
