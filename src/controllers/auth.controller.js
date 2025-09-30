// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { validationResult } = require('express-validator'); // Pour récupérer les erreurs de validation

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  // Vérifie les erreurs de validation du corps de la requête
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nom, email, motDePasse } = req.body;

  try {
    // Vérifie si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Un utilisateur avec cet e-mail existe déjà.' });
    }

    // Crée un nouvel utilisateur (rôle 'passager' par défaut)
    user = new User({
      nom,
      email,
      motDePasseHash: motDePasse, // Sera haché avant la sauvegarde
    });

    // Hachage du mot de passe
    const salt = await bcrypt.genSalt(10);
    user.motDePasseHash = await bcrypt.hash(motDePasse, salt);

    await user.save();

    // Génère un JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        isChauffeurVerified: user.isChauffeurVerified
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, { expiresIn: '1h' }, // Token expire en 1 heure
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          message: 'Inscription réussie.',
          token,
          user: {
            id: user.id,
            nom: user.nom,
            email: user.email,
            role: user.role,
            isChauffeurVerified: user.isChauffeurVerified,
            chauffeurRequestStatus: user.chauffeurRequestStatus
          },
        });
      }
    );

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur Serveur');
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  // Vérifie les erreurs de validation du corps de la requête
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, motDePasse } = req.body;

  try {
    // Vérifie si l'utilisateur existe
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    // Compare le mot de passe fourni avec le mot de passe haché
    const isMatch = await bcrypt.compare(motDePasse, user.motDePasseHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    // Génère un JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        isChauffeurVerified: user.isChauffeurVerified
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, { expiresIn: '1h' }, // Token expire en 1 heure
      (err, token) => {
        if (err) throw err;
        res.json({
          message: 'Connexion réussie.',
          token,
          user: {
            id: user.id,
            nom: user.nom,
            email: user.email,
            role: user.role,
            isChauffeurVerified: user.isChauffeurVerified,
            chauffeurRequestStatus: user.chauffeurRequestStatus
          },
        });
      }
    );

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur Serveur');
  }
};
