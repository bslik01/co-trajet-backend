const User = require('../models/User.model');
const Trip = require('../models/Trip.model');
const Booking = require('../models/Booking.model');
const { validationResult } = require('express-validator');

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-motDePasseHash');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.json({ message: 'Profil utilisateur.', user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur Serveur');
  }
};

// @desc    Soumettre ou Mettre à jour la demande pour devenir chauffeur
// @route   POST /api/users/become-chauffeur
// @access  Private (Passager)
exports.submitChauffeurApplication = async (req, res) => {
  // Le frontend envoie un objet contenant les sous-objets mis à jour
  const { identityDocuments, vehicleDetails, vehicleDocuments } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    if (user.isChauffeurVerified) {
      return res.status(400).json({ message: 'Vous êtes déjà un chauffeur vérifié.' });
    }
    
    // Initialise le profil si c'est la première demande
    if (!user.chauffeurProfile || user.chauffeurProfile.requestStatus === 'none' || user.chauffeurProfile.requestStatus === 'rejected') {
       user.chauffeurProfile = { requestStatus: 'pending' };
    } else {
      // Repasse en 'pending' si c'était en 'needs_revision'
      user.chauffeurProfile.requestStatus = 'pending';
    }

    user.chauffeurProfile.submittedAt = new Date();

    // Mise à jour des détails textuels du véhicule
    if (vehicleDetails) {
        user.chauffeurProfile.vehicleDetails = { ...user.chauffeurProfile.vehicleDetails, ...vehicleDetails };
    }
    
    // Mise à jour des URLs des documents et réinitialisation de leur statut à 'pending'
    const updateDocument = (docPath, data) => {
      // Exemple: docPath = 'identityDocuments.idCard'
      if (data && data.url) {
        const pathParts = docPath.split('.'); // ['identityDocuments', 'idCard']
        let currentLevel = user.chauffeurProfile;
        for (let i = 0; i < pathParts.length - 1; i++) {
            currentLevel = currentLevel[pathParts[i]];
        }
        const finalKey = pathParts[pathParts.length - 1];
        
        currentLevel[finalKey] = {
            url: data.url,
            status: 'pending',
            rejectionReason: ''
        };
      }
    };
    
    // Itérer sur les documents fournis dans la requête pour les mettre à jour
    if (identityDocuments) {
        for (const key in identityDocuments) {
            updateDocument(`identityDocuments.${key}`, identityDocuments[key]);
        }
    }
    if (vehicleDocuments) {
        for (const key in vehicleDocuments) {
            updateDocument(`vehicleDocuments.${key}`, vehicleDocuments[key]);
        }
    }

    await user.save();
    
    const updatedUser = await User.findById(req.user.id).select('-motDePasseHash');

    // TODO: Envoyer un email à l'admin pour l'informer d'une nouvelle demande

    res.json({ message: 'Demande soumise avec succès. Elle sera examinée prochainement.', user: updatedUser });
  
  } catch (error) {
    console.error('Erreur de soumission de la demande chauffeur :', error.message);
    res.status(500).send('Erreur Serveur');
  }
};

// @desc    Obtenir les trajets publiés par l'utilisateur connecté
// @route   GET /api/users/me/trips
// @access  Private (Chauffeur)
exports.getMyTrips = async (req, res) => {
  try {
    // req.user.id est l'ID du chauffeur connecté
    const trips = await Trip.find({ conducteur: req.user.id }).sort({ dateDepart: -1 }); // Tri du plus récent au plus ancien
    res.json({ message: 'Vos trajets publiés.', trips });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur Serveur');
  }
};

// @desc    Obtenir les réservations de l'utilisateur connecté
// @route   GET /api/users/me/bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ passenger: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'trip',
        populate: {
          path: 'conducteur',
          select: 'nom email' // Pour afficher les infos du conducteur dans la réservation
        }
      });
    
    res.json({ message: 'Vos réservations.', bookings });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur Serveur');
  }
};
