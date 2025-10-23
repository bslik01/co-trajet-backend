// src/routes/upload.routes.js
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const auth = require('../middleware/auth.middleware');

// @route   POST /api/uploads/generate-signature
// @desc    Génère une signature sécurisée pour l'upload direct vers Cloudinary
// @access  Private
router.post('/generate-signature', auth, uploadController.generateSignature);

module.exports = router;