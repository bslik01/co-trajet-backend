// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User.model'); // Pour récupérer l'utilisateur si besoin (optionnel, le JWT est suffisant pour les infos basiques)

const auth = async (req, res, next) => {
  // 1. Récupérer le token de l'en-tête
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Aucun token, autorisation refusée.' });
  }

  // Le format est généralement "Bearer TOKEN", donc on split pour obtenir le token seul
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7, authHeader.length) : authHeader;

  if (!token) {
    return res.status(401).json({ message: 'Aucun token, autorisation refusée.' });
  }

  try {
    // 2. Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attacher l'utilisateur à la requête
    // Le payload du JWT contient déjà req.user, donc on peut directement l'utiliser.
    // Pas besoin de refaire un appel à la DB pour le MVP, sauf si on a besoin de toutes les données du User.
    req.user = decoded.user; // `decoded.user` contient `{ id, role, isChauffeurVerified }`

    next(); // Passer au middleware ou à la route suivante

  } catch (error) {
    console.error('Erreur de vérification du token:', error.message);
    res.status(401).json({ message: 'Token non valide.' });
  }
};

module.exports = auth;
