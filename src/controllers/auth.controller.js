// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { validationResult } = require('express-validator');
const notificationService = require('../services/notification.service');

// Helper pour générer les tokens
const generateTokens = (user) => {
  const accessTokenPayload = {
    user: { id: user.id, role: user.role, isChauffeurVerified: user.isChauffeurVerified },
  };
  const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

  const refreshTokenPayload = {
    user: { id: user.id },
  };
  const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nom, email, motDePasse } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Un utilisateur avec cet e-mail existe déjà.' });
    }

    user = new User({ nom, email });

    const salt = await bcrypt.genSalt(10);
    user.motDePasseHash = await bcrypt.hash(motDePasse, salt);

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;

    await user.save();

    notificationService.sendWelcomeEmail(user);

    res.status(201).json({
      message: 'Inscription réussie.',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erreur d\'inscription:', error.message);
    res.status(500).send('Erreur Serveur');
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, motDePasse } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasseHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Connexion réussie.',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erreur de connexion:', error.message);
    res.status(500).send('Erreur Serveur');
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token manquant.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.user.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Refresh token invalide ou révoqué.' });
    }

    const { accessToken: newAccessToken } = generateTokens(user);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: 'Refresh token invalide ou expiré.' });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = undefined; // Utiliser undefined pour que Mongoose supprime le champ
      await user.save();
    }
    res.json({ message: 'Déconnexion réussie.' });
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    res.status(500).send('Erreur Serveur');
  }
};