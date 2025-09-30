// src/utils/createDefaultAdmin.js
const bcrypt = require('bcryptjs');
const User = require('../models/User.model'); // Assurez-vous que le chemin est correct

const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
    const adminNom = process.env.DEFAULT_ADMIN_NOM;

    if (!adminEmail || !adminPassword || !adminNom) {
      console.warn('ATTENTION: Les variables d\'environnement pour l\'admin par défaut ne sont pas définies. L\'admin ne sera pas créé.');
      return;
    }

    // Vérifier si un utilisateur avec le rôle 'admin' existe déjà
    let adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser) {
      // Vérifier si l'email de l'admin par défaut est déjà pris par un autre rôle
      let existingUser = await User.findOne({ email: adminEmail });
      if (existingUser) {
        console.warn(`Un utilisateur avec l'email ${adminEmail} existe déjà (ID: ${existingUser._id}, Rôle: ${existingUser.role}). L'admin par défaut ne sera pas créé pour éviter un conflit.`);
        return;
      }

      // Si aucun admin n'existe, en créer un
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      adminUser = new User({
        nom: adminNom,
        email: adminEmail,
        motDePasseHash: hashedPassword,
        role: 'admin',
        isChauffeurVerified: true // Un admin n'est pas un chauffeur, mais pour éviter des validations inutiles, on peut le marquer comme "vérifié" si le champ est utilisé ailleurs. Ou simplement l'ignorer pour les admins.
      });

      await adminUser.save();
      // console.log('Admin par défaut créé avec succès !');
      // console.log(`Email: ${adminEmail}`);
      // console.log(`Mot de passe: ${adminPassword}`); // **NOTE: Ne pas afficher en production**
    } 
    // else {
    //   console.log('Un admin existe déjà dans la base de données. Pas de création d\'admin par défaut.');
    // }
  } catch (error) {
    console.error(`Erreur lors de la vérification/création de l'admin par défaut : ${error.message}`);
  }
};

module.exports = createDefaultAdmin;
