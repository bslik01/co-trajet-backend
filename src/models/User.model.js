// src/models/User.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez utiliser une adresse e-mail valide'] // Validation Regex
  },
  motDePasseHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['passager', 'chauffeur', 'admin'],
    default: 'passager',
    required: true
  },
  isChauffeurVerified: {
    type: Boolean,
    default: false
  },
  chauffeurRequestStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  chauffeurRequestMessage: {
    type: String,
    trim: true
  },
  permisConduireUrl: {
    type: String,
    trim: true
  },
  carteGriseUrl: {
    type: String,
    trim: true
  },
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

module.exports = mongoose.model('User', userSchema);
