// src/routes/conversation.routes.js
const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Messagerie
 *   description: Gestion des conversations et messages entre utilisateurs.
 */

/**
 * @swagger
 * /api/conversations/trip/{tripId}:
 *   get:
 *     summary: Récupérer ou créer une conversation pour un trajet spécifique
 *     tags: [Messagerie]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID du trajet.
 *     responses:
 *       200:
 *         description: Conversation trouvée ou créée.
 *       403:
 *         description: L'utilisateur n'est pas un participant confirmé de ce trajet.
 *       404:
 *         description: Trajet non trouvé.
 */
router.get('/trip/:tripId', conversationController.getConversationByTrip);

/**
 * @swagger
 * /api/conversations/{conversationId}/messages:
 *   get:
 *     summary: Obtenir tous les messages d'une conversation
 *     tags: [Messagerie]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des messages de la conversation.
 *       403:
 *         description: L'utilisateur ne fait pas partie de cette conversation.
 *
 *   post:
 *     summary: Envoyer un message dans une conversation
 *     tags: [Messagerie]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Bonjour, où se trouve le point de RDV exact ?"
 *     responses:
 *       201:
 *         description: Message envoyé avec succès.
 *       403:
 *         description: L'utilisateur ne fait pas partie de cette conversation.
 */
router.get('/:conversationId/messages', conversationController.getMessages);
router.post('/:conversationId/messages', conversationController.sendMessage);

module.exports = router;