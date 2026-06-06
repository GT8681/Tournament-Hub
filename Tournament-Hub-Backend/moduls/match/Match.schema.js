const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  teamHome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  teamAway: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  scoreHome: {
    type: Number,
    default: 0
  },
  scoreAway: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['DA_GIOCARE', 'FINITA'],
    default: 'DA_GIOCARE'
  },
  round:{
    type: Number,
    required: false
  },
  date: {
    type: Date,
    required: false
  },
  scores:[{
    playerName:{type:String, required:true},
      team:{type: mongoose.Schema.Types.ObjectId, ref: 'Team', required:true},
  }]
}, { timestamps: true });

module.exports = mongoose.model('Match', MatchSchema);
