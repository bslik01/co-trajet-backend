// src/routes/trip.routes.js
const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const auth = require('../middleware/auth.middleware'); // Middleware d'authentification
const authorize = require('../middleware/authorizeRoles.middleware'); // Middleware d'autorisation
const { createTripValidation, searchTripsValidation } = require('../middleware/validation');

// @route   POST /api/trips
// @desc    Créer un nouveau trajet
// @access  Private (Chauffeur vérifié)
router.post('/', auth, authorize('chauffeur'), createTripValidation, tripController.createTrip);

// @route   GET /api/trips
// @desc    Rechercher des trajets (filtrés par ville/date)
// @access  Public (pas besoin d'être connecté)
router.get('/', searchTripsValidation, tripController.getTrips);

// @route   GET /api/trips/:id
// @desc    Obtenir les détails d'un trajet spécifique
// @access  Public
router.get('/:id', tripController.getTripById);

module.exports = router;
