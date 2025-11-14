// src/routes/upload.routes.js
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const auth = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Gestion des uploads de fichiers.
 */

/**
 * @swagger
 * /api/uploads/generate-signature:
 *   post:
 *     summary: Générer une signature sécurisée pour un upload direct vers Cloudinary
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Signature et paramètres nécessaires pour l'upload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 signature:
 *                   type: string
 *                 timestamp:
 *                   type: integer
 *                 apiKey:
 *                   type: string
 *                 cloudName:
 *                   type: string
 *                 folder:
 *                   type: string
 *       401:
 *         description: Non autorisé.
 */
router.post('/generate-signature', auth, uploadController.generateSignature);

module.exports = router;