// src/routes/trip.routes.js
const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorizeRoles.middleware');
const { createTripValidation, searchTripsValidation, bookTripValidation, idParamValidation } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Trajets
 *   description: API pour la gestion des trajets et des réservations.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Trip:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         conducteur:
 *           type: string
 *         villeDepart:
 *           type: string
 *         villeArrivee:
 *           type: string
 *         dateDepart:
 *           type: string
 *           format: date-time
 *         placesDisponibles:
 *           type: integer
 *         prix:
 *           type: number
 *         status:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *     Booking:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         trip:
 *           $ref: '#/components/schemas/Trip'
 *         passenger:
 *           type: string
 *         seatsBooked:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [confirmed, cancelled]
 */

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Créer une nouvelle offre de trajet
 *     tags: [Trajets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [villeDepart, villeArrivee, dateDepart, placesDisponibles, prix]
 *             properties:
 *               villeDepart:
 *                 type: string
 *               villeArrivee:
 *                 type: string
 *               dateDepart:
 *                 type: string
 *                 format: date-time
 *               placesDisponibles:
 *                 type: integer
 *               prix:
 *                 type: number
 *     responses:
 *       201:
 *         description: Trajet créé avec succès.
 *       403:
 *         description: L'utilisateur n'est pas un chauffeur vérifié.
 *
 *   get:
 *     summary: Rechercher des trajets disponibles
 *     tags: [Trajets]
 *     parameters:
 *       - in: query
 *         name: villeDepart
 *         schema:
 *           type: string
 *       - in: query
 *         name: villeArrivee
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateDepart
 *         schema:
 *           type: string
 *           format: date
 *           description: "Format YYYY-MM-DD"
 *     responses:
 *       200:
 *         description: Une liste de trajets correspondants.
 */
router.post('/', auth, authorize('chauffeur'), createTripValidation, tripController.createTrip);
router.get('/', searchTripsValidation, tripController.getTrips);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Obtenir les détails d'un trajet spécifique
 *     tags: [Trajets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du trajet.
 *       401:
 *         description: Non autorisé (utilisateur non connecté).
 *       404:
 *         description: Trajet non trouvé.
 *
 *   put:
 *     summary: Modifier un de ses trajets publiés
 *     tags: [Trajets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Champs du trajet à mettre à jour.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trip'
 *     responses:
 *       200:
 *         description: Trajet mis à jour.
 *       403:
 *         description: L'utilisateur n'est pas le conducteur de ce trajet.
 *       400:
 *         description: Impossible de modifier un trajet ayant déjà des réservations.
 *
 *   delete:
 *     summary: Annuler un de ses trajets publiés
 *     tags: [Trajets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trajet annulé avec succès.
 *       403:
 *         description: L'utilisateur n'est pas le conducteur de ce trajet.
 */
router.get('/:id', auth, idParamValidation, tripController.getTripById);
router.put('/:id', auth, idParamValidation, createTripValidation, tripController.updateTrip);
router.delete('/:id', auth, idParamValidation, tripController.deleteTrip);

/**
 * @swagger
 * /api/trips/{id}/book:
 *   post:
 *     summary: Réserver une ou plusieurs places sur un trajet
 *     tags: [Trajets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [seatsBooked]
 *             properties:
 *               seatsBooked:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Réservation confirmée.
 *       400:
 *         description: Mauvaise requête (plus de places, déjà réservé, etc.).
 */
router.post('/:id/book', auth, idParamValidation, bookTripValidation, tripController.bookTrip);

/**
 * @swagger
 * /api/trips/{id}/passengers:
 *   get:
 *     summary: Obtenir la liste des passagers pour un de ses trajets
 *     tags: [Trajets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Une liste de réservations avec les informations des passagers.
 *       403:
 *         description: L'utilisateur n'est pas le conducteur de ce trajet.
 */
router.get('/:id/passengers', auth, idParamValidation, tripController.getTripPassengers);

module.exports = router;