// src/middleware/validation.js (MIS À JOUR)
const { body, query, param } = require('express-validator');

exports.registerValidation = [
  body('nom', 'Le nom est requis').not().isEmpty(),
  body('email', 'Veuillez inclure une adresse e-mail valide').isEmail(),
  body('motDePasse', 'Le mot de passe doit contenir au moins 8 caractères').isLength({ min: 8 })
];

exports.loginValidation = [
  body('email', 'Veuillez inclure une adresse e-mail valide').isEmail(),
  body('motDePasse', 'Le mot de passe est requis').not().isEmpty()
];

exports.createTripValidation = [
  body('villeDepart', 'La ville de départ est requise').not().isEmpty(),
  body('villeArrivee', 'La ville d\'arrivée est requise').not().isEmpty(),
  body('dateDepart', 'La date de départ est requise et doit être une date valide').isISO8601().toDate(),
  body('placesDisponibles', 'Le nombre de places doit être un entier positif').isInt({ min: 1 }),
  body('prix', 'Le prix doit être un nombre positif').isFloat({ min: 0 })
];

// Pour la recherche, les paramètres sont optionnels mais si présents, ils doivent être valides
exports.searchTripsValidation = [
  query('dateDepart', 'La date de départ doit être au format YYYY-MM-DD si fournie').optional().isISO8601().toDate(),
  query('villeDepart', 'La ville de départ ne doit pas être vide si fournie').optional().not().isEmpty(),
  query('villeArrivee', 'La ville d\'arrivée ne doit pas être vide si fournie').optional().not().isEmpty(),
];

exports.requestChauffeurValidation = [
  body('permisConduireUrl', 'L\'URL du permis de conduire est requise').not().isEmpty(),
  body('carteGriseUrl', 'L\'URL de la carte grise est requise').not().isEmpty(),
  // Optionnellement, vérifier que les URLs sont valides
  body('permisConduireUrl', 'L\'URL du permis de conduire doit être une URL valide').isURL(),
  body('carteGriseUrl', 'L\'URL de la carte grise doit être une URL valide').isURL(),
];

exports.rejectChauffeurValidation = [
  // Le message est optionnel
  body('chauffeurRequestMessage', 'Le message de rejet doit être une chaîne de caractères').optional().isString().trim()
];

// Validation pour l'ID dans les paramètres de route (peut être générique)
exports.idParamValidation = [
  param('id', 'L\'ID fourni n\'est pas valide').isMongoId(),
];
