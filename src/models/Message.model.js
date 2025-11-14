// src/models/Message.model.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: { // Qui a envoyé le message
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  // Le statut 'read' pourra être ajouté dans une V2
}, {
  timestamps: true,
});

module.exports = mongoose.model('Message', messageSchema);
