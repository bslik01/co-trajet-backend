// src/routes/trip.routes.js
const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const auth = require('../middleware/auth.middleware'); // Middleware d'authentification
const authorize = require('../middleware/authorizeRoles.middleware'); // Middleware d'autorisation
const { createTripValidation, searchTripsValidation, bookTripValidation } = require('../middleware/validation');

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
router.get('/:id', auth, tripController.getTripById);

// @route   POST /api/trips/:id/book
// @desc    Réserver une place sur un trajet
// @access  Private
router.post('/:id/book', auth, bookTripValidation, tripController.bookTrip);

// @route   GET /api/trips/:id/passengers
// @desc    Voir les passagers d'un trajet
// @access  Private (Chauffeur)
router.get('/:id/passengers', auth, tripController.getTripPassengers);

// @route   PUT /api/trips/:id
// @desc    Modifier un trajet
// @access  Private (Chauffeur)
router.put('/:id', auth, createTripValidation, tripController.updateTrip); // Réutilise la validation de création

// @route   DELETE /api/trips/:id
// @desc    Supprimer un trajet
// @access  Private (Chauffeur)
router.delete('/:id', auth, tripController.deleteTrip);

module.exports = router;
