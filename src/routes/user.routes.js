// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorizeRoles.middleware');

// @route   GET /api/users/me
// @desc    Obtenir le profil de l'utilisateur connecté
// @access  Private
router.get('/me', auth, userController.getMe);

// @route   PUT /api/users/become-chauffeur
// @desc    Soumettre une demande pour devenir chauffeur
// @access  Private (Passager)
// @route   POST /api/users/become-chauffeur
router.post('/become-chauffeur', auth, authorize('passager'), userController.submitChauffeurApplication);

// @route   GET /api/users/me/trips
// @desc    Obtenir les trajets de l'utilisateur connecté
// @access  Private (Chauffeur)
router.get('/me/trips', auth, authorize('chauffeur'), userController.getMyTrips);

// @route   GET /api/users/me/bookings
// @desc    Obtenir les réservations de l'utilisateur connecté
// @access  Private
router.get('/me/bookings', auth, userController.getMyBookings);

module.exports = router;
