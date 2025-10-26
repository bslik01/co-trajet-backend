// src/config/mailer.js
const nodemailer = require('nodemailer');

// Crée un transporteur réutilisable
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  // secure: false, // true pour le port 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Vérifie la connexion au démarrage (optionnel mais recommandé)
transporter.verify()
  .then(() => console.log('Connecté au service SMTP avec succès.'))
  .catch(err => console.error('Erreur de connexion au service SMTP:', err));

module.exports = transporter;
