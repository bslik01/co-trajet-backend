// src/routes/me.routes.js
const express = require('express');
const router = express.Router();
const meController = require('../controllers/me.controller');
const auth = require('../middleware/auth.middleware');

// Toutes les routes ici sont pour l'utilisateur authentifié
router.use(auth);

// @route   GET /api/me/dashboard
router.get('/dashboard', meController.getDashboardData);

module.exports = router;