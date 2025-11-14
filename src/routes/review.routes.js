// src/routes/review.routes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth.middleware');
const { createReviewValidation } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Avis
 *   description: Gestion des avis et notations entre utilisateurs.
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Laisser un avis sur un utilisateur après un trajet terminé
 *     tags: [Avis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tripId, recipientId, rating]
 *             properties:
 *               tripId:
 *                 type: string
 *                 description: L'ID du trajet concerné.
 *               recipientId:
 *                 type: string
 *                 description: L'ID de l'utilisateur qui reçoit l'avis.
 *               rating:
 *                 type: integer
 *                 description: La note de 1 à 5.
 *                 example: 5
 *               comment:
 *                 type: string
 *                 description: Un commentaire optionnel.
 *                 example: "Excellent conducteur, très prudent !"
 *     responses:
 *       201:
 *         description: Avis créé avec succès.
 *       400:
 *         description: Données invalides ou avis déjà laissé pour ce trajet.
 *       403:
 *         description: L'utilisateur n'a pas le droit de laisser cet avis (trajet non terminé, pas un participant, etc.).
 */
router.post('/', auth, createReviewValidation, reviewController.createReview);

module.exports = router;