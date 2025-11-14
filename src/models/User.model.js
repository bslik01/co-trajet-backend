// src/models/User.model.js
const mongoose = require('mongoose');

// Sous-schéma réutilisable pour chaque document
const documentStatusSchema = new mongoose.Schema({
  url: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['not_submitted', 'pending', 'approved', 'rejected'], default: 'not_submitted' },
  rejectionReason: { type: String, trim: true, default: '' },
}, { _id: false });

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
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez utiliser une adresse e-mail valide']
  },
  motDePasseHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['passager', 'chauffeur', 'admin'],
    default: 'passager'
  },
  isChauffeurVerified: {
    type: Boolean,
    default: false
  },

  refreshToken: { type: String },

  chauffeurProfile: {
    requestStatus: {
      type: String,
      enum: ['none', 'pending', 'needs_revision', 'approved', 'rejected'],
      default: 'none'
    },
    
    identityDocuments: {
      idCard: { type: documentStatusSchema, default: () => ({}) },
      driverLicense: { type: documentStatusSchema, default: () => ({}) },
      profilePicture: { type: documentStatusSchema, default: () => ({}) },
    },

    vehicleDetails: {
      make: { type: String, trim: true, default: '' },
      model: { type: String, trim: true, default: '' },
      year: { type: Number, min: 1990 },
      color: { type: String, trim: true, default: '' },
      licensePlate: { type: String, trim: true, uppercase: true, default: '' },
    },

    vehicleDocuments: {
      vehicleRegistration: { type: documentStatusSchema, default: () => ({}) },
      technicalInspection: { type: documentStatusSchema, default: () => ({}) },
      insuranceCertificate: { type: documentStatusSchema, default: () => ({}) },
      vehiclePictureFront: { type: documentStatusSchema, default: () => ({}) },
      vehiclePictureSide: { type: documentStatusSchema, default: () => ({}) },
    },

    submittedAt: { type: Date }
  },
  
  reviewStats: {
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
}, { 
  timestamps: true 
});

// Méthode statique pour recalculer la note moyenne d'un utilisateur
// C'est une bonne pratique de centraliser cette logique ici.
userSchema.statics.recalculateRating = async function(userId) {
  const Review = mongoose.model('Review'); // Évite les problèmes d'import circulaire

  const stats = await Review.aggregate([
    {
      $match: { recipient: userId } // Ne considérer que les avis reçus par cet utilisateur
    },
    {
      $group: {
        _id: '$recipient',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  let update = {
    'reviewStats.averageRating': 0,
    'reviewStats.reviewCount': 0
  };

  if (stats.length > 0) {
    update = {
      'reviewStats.averageRating': stats[0].averageRating,
      'reviewStats.reviewCount': stats[0].reviewCount
    };
  }

  await this.updateOne({ _id: userId }, { $set: update });
};

module.exports = mongoose.model('User', userSchema);