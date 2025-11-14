// src/routes/conversation.routes.js
const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const auth = require('../middleware/auth.middleware');
const { idParamValidation } = require('../middleware/validation'); // Si vous avez une validation pour les ID

// Toutes les routes de conversation nécessitent une authentification
router.use(auth);

// @route   GET /api/conversations/trip/:tripId
// @desc    Obtenir/créer la conversation pour un trajet
router.get('/trip/:tripId', conversationController.getConversationByTrip);

// @route   GET /api/conversations/:conversationId/messages
// @desc    Obtenir les messages d'une conversation
router.get('/:conversationId/messages', conversationController.getMessages);

// @route   POST /api/conversations/:conversationId/messages
// @desc    Envoyer un message
router.post('/:conversationId/messages', conversationController.sendMessage);

module.exports = router;
