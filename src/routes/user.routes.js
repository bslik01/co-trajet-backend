// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const reviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorizeRoles.middleware');
const { idParamValidation } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Gestion des profils utilisateurs et actions spécifiques.
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtenir le profil de l'utilisateur actuellement connecté
 *     tags: [Mon Compte]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du profil de l'utilisateur.
 *       401:
 *         description: Non autorisé.
 */
router.get('/me', auth, userController.getMe);

/**
 * @swagger
 * /api/users/become-chauffeur:
 *   post:
 *     summary: Soumettre ou mettre à jour une candidature pour devenir chauffeur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                identityDocuments:
 *                  type: object
 *                vehicleDetails:
 *                  type: object
 *                vehicleDocuments:
 *                  type: object
 *     responses:
 *       200:
 *         description: Candidature soumise avec succès.
 *       400:
 *         description: L'utilisateur est déjà un chauffeur vérifié.
 */
router.post('/become-chauffeur', auth, userController.submitChauffeurApplication);

/**
 * @swagger
 * /api/users/me/trips:
 *   get:
 *     summary: Obtenir les trajets publiés par le chauffeur connecté
 *     tags: [Mon Compte]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Une liste des trajets publiés par l'utilisateur.
 *       403:
 *         description: L'utilisateur n'est pas un chauffeur.
 */
router.get('/me/trips', auth, authorize('chauffeur'), userController.getMyTrips);

/**
 * @swagger
 * /api/users/me/bookings:
 *   get:
 *     summary: Obtenir les réservations effectuées par l'utilisateur connecté
 *     tags: [Mon Compte]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Une liste des réservations de l'utilisateur.
 */
router.get('/me/bookings', auth, userController.getMyBookings);

/**
 * @swagger
 * /api/users/{userId}/reviews:
 *   get:
 *     summary: Obtenir les avis reçus par un utilisateur spécifique
 *     tags: [Utilisateurs, Avis]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Une liste des avis reçus par l'utilisateur.
 */
router.get('/:userId/reviews', idParamValidation, reviewController.getUserReviews);

module.exports = router;