// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller'); // Le contrôleur user gère aussi les actions admin sur les users
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorizeRoles.middleware');
const { idParamValidation, rejectChauffeurValidation } = require('../middleware/validation');

// Toutes les routes ici nécessitent d'être admin
router.use(auth, authorize('admin'));

// @route   GET /api/admin/chauffeur-requests
// @desc    Obtenir toutes les demandes de chauffeur en attente
// @access  Private (Admin)
router.get('/chauffeur-requests', userController.getChauffeurRequests);

// @route   PUT /api/admin/chauffeur-requests/:id/approve
// @desc    Approuver une demande de chauffeur
// @access  Private (Admin)
router.put('/chauffeur-requests/:id/approve', idParamValidation, userController.approveChauffeurRequest);

// @route   PUT /api/admin/chauffeur-requests/:id/reject
// @desc    Rejeter une demande de chauffeur
// @access  Private (Admin)
router.put('/chauffeur-requests/:id/reject', idParamValidation, rejectChauffeurValidation, userController.rejectChauffeurRequest);


// Exemple d'accès à l'admin par défaut
router.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur le tableau de bord administrateur!', user: req.user });
});

module.exports = router;
