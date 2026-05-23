const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Il nome della squadra è obbligatorio'],
    unique: true,
    trim: true
  },
  logo: {
    type: String,
    default: 'https://via.placeholder.com/150'
  }
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);
