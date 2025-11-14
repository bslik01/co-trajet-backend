// src/models/Review.model.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  author: { // Celui qui écrit l'avis
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: { // Celui qui reçoit l'avis
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: { // Note sur 5
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500,
  },
}, {
  timestamps: true,
});

// Un auteur ne peut laisser qu'un seul avis pour un destinataire sur un trajet donné.
// Cela empêche un passager de noter plusieurs fois le même conducteur pour le même voyage.
reviewSchema.index({ trip: 1, author: 1, recipient: 1 }, { unique: true });

// Index pour retrouver facilement tous les avis d'un utilisateur
reviewSchema.index({ recipient: 1 });

module.exports = mongoose.model('Review', reviewSchema);
