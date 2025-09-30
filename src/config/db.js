// src/config/db.js (MODIFIÉ)
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // connect() retourne une promesse, donc on peut l'attendre directement
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connexion à MongoDB réussie !');
    return true; // Indique que la connexion est réussie
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB : ${error.message}`);
    process.exit(1);
    // throw error; // Pourrait aussi lancer l'erreur pour que l'appelant la gère
  }
};

module.exports = connectDB;
