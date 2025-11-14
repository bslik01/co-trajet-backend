// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorizeRoles.middleware');
const { idParamValidation } = require('../middleware/validation');

router.use(auth, authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Administration
 *   description: Endpoints réservés aux administrateurs pour la gestion de la plateforme.
 */

/**
 * @swagger
 * /api/admin/chauffeur-requests:
 *   get:
 *     summary: Lister les candidatures de chauffeur en attente ou en révision
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Une liste de candidatures.
 *       403:
 *         description: L'utilisateur n'est pas un administrateur.
 */
router.get('/chauffeur-requests', adminController.getChauffeurRequests);

/**
 * @swagger
 * /api/admin/chauffeur-requests/{userId}/documents:
 *   put:
 *     summary: Examiner (Approuver/Rejeter) un document spécifique d'une candidature
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [documentPath, status]
 *             properties:
 *               documentPath:
 *                 type: string
 *                 description: "Chemin du document, ex: 'identityDocuments.idCard'"
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               reason:
 *                 type: string
 *                 description: "Motif obligatoire si le statut est 'rejected'"
 *     responses:
 *       200:
 *         description: Statut du document mis à jour.
 *       400:
 *         description: Paramètres manquants ou invalides.
 */
router.put('/chauffeur-requests/:userId/documents', idParamValidation, adminController.reviewDocument);

/**
 * @swagger
 * /api/admin/chauffeur-requests/{userId}/activate:
 *   put:
 *     summary: Activer le profil chauffeur d'un utilisateur après validation de tous les documents
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profil chauffeur activé avec succès.
 *       400:
 *         description: Impossible d'activer, tous les documents ne sont pas approuvés.
 */
router.put('/chauffeur-requests/:userId/activate', idParamValidation, adminController.activateChauffeurProfile);

// Exemple d'accès à l'admin par défaut
router.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur le tableau de bord administrateur!', user: req.user });
});

module.exports = router;
