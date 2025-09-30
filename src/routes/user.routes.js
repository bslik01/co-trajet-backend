// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorizeRoles.middleware');
const { requestChauffeurValidation, idParamValidation } = require('../middleware/validation');

// @route   GET /api/users/me
// @desc    Obtenir le profil de l'utilisateur connecté
// @access  Private
router.get('/me', auth, userController.getMe);

// @route   PUT /api/users/become-chauffeur
// @desc    Soumettre une demande pour devenir chauffeur
// @access  Private (Passager)
router.put('/become-chauffeur', auth, authorize('passager'), requestChauffeurValidation, userController.requestChauffeurStatus);

module.exports = router;
