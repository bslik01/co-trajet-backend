// src/models/Trip.model.js
const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  conducteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Référence au modèle User
    required: true
  },
  villeDepart: {
    type: String,
    required: true,
    trim: true
  },
  villeArrivee: {
    type: String,
    required: true,
    trim: true
  },
  dateDepart: {
    type: Date,
    required: true
  },
  placesDisponibles: {
    type: Number,
    required: true,
    min: [1, 'Le nombre de places disponibles doit être au moins 1.']
  },
  prix: {
    type: Number,
    required: true,
    min: [0, 'Le prix ne peut pas être négatif.']
  },
}, {
  timestamps: true // Ajoute createdAt et updatedAt
});

// Ajoutez un index composé pour optimiser la recherche de trajets
tripSchema.index({ villeDepart: 1, villeArrivee: 1, dateDepart: 1 });

module.exports = mongoose.model('Trip', tripSchema);
