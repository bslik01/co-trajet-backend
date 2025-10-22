// src/models/Booking.model.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  seatsBooked: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed',
  },
}, {
  timestamps: true,
});

// Assurer qu'un passager ne peut réserver qu'une seule fois par trajet
bookingSchema.index({ trip: 1, passenger: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
