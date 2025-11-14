// src/routes/me.routes.js
const express = require('express');
const router = express.Router();
const meController = require('../controllers/me.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Mon Compte
 *   description: Endpoints relatifs à l'utilisateur actuellement authentifié (préfixe /api/me).
 */

/**
 * @swagger
 * /api/me/dashboard:
 *   get:
 *     summary: Récupérer les données agrégées pour le tableau de bord personnel
 *     tags: [Mon Compte]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Un objet contenant les réservations à venir, les annonces publiées et l'historique des trajets.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 upcomingReservations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 myPublishedTrips:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trip'
 *                 history:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trip'
 *       401:
 *         description: Non autorisé.
 */
router.get('/dashboard', meController.getDashboardData);

module.exports = router;