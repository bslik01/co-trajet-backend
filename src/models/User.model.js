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

  // --- SECTION PROFIL CHAUFFEUR RENFORCÉE ---
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
      make: { type: String, trim: true, default: '' },       // Marque
      model: { type: String, trim: true, default: '' },      // Modèle
      year: { type: Number, min: 1990 },
      color: { type: String, trim: true, default: '' },
      licensePlate: { type: String, trim: true, uppercase: true, default: '' }, // Immatriculation
    },

    vehicleDocuments: {
      vehicleRegistration: { type: documentStatusSchema, default: () => ({}) }, // Carte Grise
      technicalInspection: { type: documentStatusSchema, default: () => ({}) }, // Visite Technique
      insuranceCertificate: { type: documentStatusSchema, default: () => ({}) }, // Attestation d'Assurance
      vehiclePictureFront: { type: documentStatusSchema, default: () => ({}) },    // Photo avant
      vehiclePictureSide: { type: documentStatusSchema, default: () => ({}) },     // Photo côté
    },

    submittedAt: { type: Date }
  },
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
