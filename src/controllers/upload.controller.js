// src/controllers/upload.controller.js
const cloudinary = require('../config/cloudinary');

// @desc    Générer une signature pour l'upload direct vers Cloudinary
// @route   POST /api/uploads/generate-signature
// @access  Private
exports.generateSignature = (req, res) => {
  const timestamp = Math.round((new Date).getTime() / 1000);

  try {
    // Les paramètres que vous voulez signer. Le frontend DOIT envoyer exactement les mêmes
    // paramètres (sauf api_key et signature) lors de l'upload.
    const params_to_sign = {
      timestamp: timestamp,
      // Exemple : forcer l'upload dans un dossier spécifique
      folder: 'co-trajet_documents' 
    };

    const signature = cloudinary.utils.api_sign_request(
      params_to_sign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature: signature,
      timestamp: timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: 'co-trajet_documents' // Renvoyer le dossier pour que le frontend l'utilise
    });

  } catch (error) {
    console.error('Erreur de génération de signature Cloudinary :', error);
    res.status(500).send('Erreur Serveur');
  }
};
