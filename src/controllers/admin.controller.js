// src/controllers/admin.controller.js
const User = require('../models/User.model');

// @desc    Obtenir toutes les demandes de chauffeur en attente ou en révision
// @route   GET /api/admin/chauffeur-requests
// @access  Private (Admin)
exports.getChauffeurRequests = async (req, res) => {
  try {
    const requests = await User.find({ 
      'chauffeurProfile.requestStatus': { $in: ['pending', 'needs_revision'] } 
    }).select('-motDePasseHash');
    res.json({ requests });
  } catch (error) {
    console.error('Erreur de récupération des demandes chauffeur:', error);
    res.status(500).send('Erreur Serveur');
  }
};

// @desc    Examiner (Approuver/Rejeter) un document spécifique
// @route   PUT /api/admin/chauffeur-requests/:userId/documents
// @access  Private (Admin)
exports.reviewDocument = async (req, res) => {
  const { userId } = req.params;
  const { documentPath, status, reason } = req.body; // ex: documentPath: 'identityDocuments.idCard'

  if (!documentPath || !status || (status === 'rejected' && !reason)) {
    return res.status(400).json({ message: 'documentPath, status, et reason (si rejet) sont requis.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    // Mise à jour de la propriété imbriquée dans le profil chauffeur
    const update = {
      [`chauffeurProfile.${documentPath}.status`]: status,
      [`chauffeurProfile.${documentPath}.rejectionReason`]: status === 'rejected' ? reason : '',
    };

    // Si on rejette au moins un document, le statut global de la demande passe en "needs_revision"
    if (status === 'rejected') {
      update['chauffeurProfile.requestStatus'] = 'needs_revision';
    }
    
    await User.updateOne({ _id: userId }, { $set: update });
    const updatedUser = await User.findById(userId).select('-motDePasseHash'); // Renvoyer l'utilisateur mis à jour

    res.json({ message: 'Statut du document mis à jour.', user: updatedUser });

  } catch (error) {
    console.error('Erreur de mise à jour du document:', error);
    res.status(500).send('Erreur Serveur');
  }
};

// @desc    Activer le profil complet d'un chauffeur
// @route   PUT /api/admin/chauffeur-requests/:userId/activate
// @access  Private (Admin)
exports.activateChauffeurProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    // Vérification finale : tous les documents requis doivent être approuvés
    const profile = user.chauffeurProfile;
    const allDocs = [
      profile.identityDocuments.idCard,
      profile.identityDocuments.driverLicense,
      profile.identityDocuments.profilePicture,
      profile.vehicleDocuments.vehicleRegistration,
      profile.vehicleDocuments.technicalInspection,
      profile.vehicleDocuments.insuranceCertificate,
      profile.vehicleDocuments.vehiclePictureFront,
      profile.vehicleDocuments.vehiclePictureSide,
    ];

    const allDocsApproved = allDocs.every(doc => doc.status === 'approved');

    if (!allDocsApproved) {
      return res.status(400).json({ message: 'Tous les documents doivent être approuvés avant l\'activation du profil.' });
    }

    user.role = 'chauffeur';
    user.isChauffeurVerified = true;
    user.chauffeurProfile.requestStatus = 'approved';
    await user.save();

    const updatedUser = await User.findById(userId).select('-motDePasseHash');

    // TODO: Envoyer un email de confirmation au nouveau chauffeur

    res.json({ message: 'Profil chauffeur activé avec succès.', user: updatedUser });

  } catch (error) {
    console.error('Erreur d\'activation du profil chauffeur:', error);
    res.status(500).send('Erreur Serveur');
  }
};