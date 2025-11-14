// src/models/Conversation.model.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  trip: { // La conversation est toujours liée à un trajet
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  participants: [{ // Les IDs du conducteur et du passager
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  lastMessageAt: { // Pour trier les conversations par la plus récente
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Un index unique pour s'assurer qu'il n'y a qu'une seule conversation par trajet
// entre un ensemble unique de participants.
conversationSchema.index({ trip: 1, participants: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
