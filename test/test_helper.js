// test/test_helper.js
require('dotenv').config({ path: './.env' });

const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const Trip = require('../src/models/Trip.model');
const Booking = require('../src/models/Booking.model');
// Il est crucial d'importer app APRÈS dotenv pour que les variables d'env soient chargées.
const app = require('../src/app');

const MONGO_URI_TEST = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/cotrajet_test';

// Connexion avant tous les tests
before(async () => {
  await mongoose.createConnection(MONGO_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Nettoyage avant chaque test
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  // Créer l'admin par défaut pour chaque test isolé
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
  const salt = await require('bcryptjs').genSalt(10);
  const hashedPassword = await require('bcryptjs').hash(adminPassword, salt);
  await new User({
    nom: process.env.DEFAULT_ADMIN_NOM,
    email: process.env.DEFAULT_ADMIN_EMAIL,
    motDePasseHash: hashedPassword,
    role: 'admin',
    isChauffeurVerified: true,
  }).save();
});

// Déconnexion après tous les tests
after(async () => {
  await mongoose.connection.close();
});

// Exporter l'application pour Supertest
module.exports = { app };