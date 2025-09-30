// test/test_helper.js
require('dotenv').config({ path: './.env' }); // S'assurer que les variables d'environnement sont chargées

const mongoose = require('mongoose');
const app = require('../src/app'); // Importez votre application Express
const User = require('../src/models/User.model');
const Trip = require('../src/models/Trip.model');
const createDefaultAdmin = require('../src/utils/createDefaultAdmin');

// Définir la base de données de test
const MONGO_URI_TEST = process.env.MONGO_URI_TEST;

// Se connecter à la base de données avant tous les tests
before(async () => {
  try {
    await mongoose.createConnection(MONGO_URI_TEST);
    console.log(`Connecté à la base de données de test: ${MONGO_URI_TEST}`);
  } catch (error) {
    console.error(`Erreur de connexion à la base de données de test: ${error.message}`);
    process.exit(1); // Quitte si la connexion échoue
  }
});

// Nettoyer la base de données avant chaque test pour s'assurer de l'isolement
beforeEach(async () => {
  // Supprimer toutes les collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  // On pourrait aussi insérer des données de test ici si nécessaire pour certains scénarios
  createDefaultAdmin();
});

// Déconnecter de la base de données après tous les tests
after(async () => {
  await mongoose.connection.close();
  console.log('Déconnecté de la base de données de test.');
});

module.exports = { app }; // Exporter l'application Express pour Supertest
