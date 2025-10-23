// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorizeRoles.middleware');
const { idParamValidation } = require('../middleware/validation'); // Si vous avez une validation pour les ID Mongo

// Toutes les routes ici nécessitent d'être admin
router.use(auth, authorize('admin'));

// @route   GET /api/admin/chauffeur-requests
// @desc    Obtenir toutes les demandes de chauffeur en attente
router.get('/chauffeur-requests', adminController.getChauffeurRequests);

// @route   PUT /api/admin/chauffeur-requests/:userId/documents
// @desc    Examiner (Approuver/Rejeter) un document
router.put('/chauffeur-requests/:userId/documents', idParamValidation, adminController.reviewDocument);

// @route   PUT /api/admin/chauffeur-requests/:userId/activate
// @desc    Activer le profil d'un chauffeur après vérification
router.put('/chauffeur-requests/:userId/activate', idParamValidation, adminController.activateChauffeurProfile);

// Exemple d'accès à l'admin par défaut
router.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur le tableau de bord administrateur!', user: req.user });
});

module.exports = router;
