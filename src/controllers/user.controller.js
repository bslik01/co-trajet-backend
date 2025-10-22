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

// @desc    Demander le statut de chauffeur
// @route   PUT /api/users/become-chauffeur
// @access  Private (Passager)
exports.requestChauffeurStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { permisConduireUrl, carteGriseUrl } = req.body;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    if (user.role === 'chauffeur' && user.isChauffeurVerified) {
      return res.status(400).json({ message: 'Vous êtes déjà un chauffeur vérifié.' });
    }
    if (user.chauffeurRequestStatus === 'pending') {
      return res.status(400).json({ message: 'Votre demande de chauffeur est déjà en attente de validation.' });
    }

    user.permisConduireUrl = permisConduireUrl;
    user.carteGriseUrl = carteGriseUrl;
    user.chauffeurRequestStatus = 'pending';
    user.chauffeurRequestMessage = '';

    await user.save();

    const userObj = user.toObject();
    delete userObj.motDePasseHash;

    res.json({
      message: 'Demande de statut chauffeur soumise avec succès. En attente de validation.',
      user: userObj
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur Serveur');
  }
};

// @desc    Obtenir toutes les demandes de chauffeur en attente
// @route   GET /api/admin/chauffeur-requests
// @access  Private (Admin)
exports.getChauffeurRequests = async (req, res) => {
  try {
    const requests = await User.find({ chauffeurRequestStatus: 'pending' }).select('-motDePasseHash');
    res.json({ message: 'Demandes de chauffeurs en attente.', requests });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur Serveur');
  }
};

// @desc    Valider/Approuver une demande de chauffeur
// @route   PUT /api/admin/chauffeur-requests/:id/approve
// @access  Private (Admin)
exports.approveChauffeurRequest = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    if (user.chauffeurRequestStatus !== 'pending') {
      return res.status(400).json({ message: 'Cette demande n\'est pas en attente de validation.' });
    }

    user.role = 'chauffeur';
    user.isChauffeurVerified = true;
    user.chauffeurRequestStatus = 'approved';
    user.chauffeurRequestMessage = 'Votre demande a été approuvée.';

    await user.save();

    const userObj = user.toObject();
    delete userObj.motDePasseHash;

    res.json({
      message: `Le chauffeur ${user.nom} a été approuvé.`,
      user: userObj
    });

  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.status(500).send('Erreur Serveur');
  }
};

// @desc    Rejeter une demande de chauffeur
// @route   PUT /api/admin/chauffeur-requests/:id/reject
// @access  Private (Admin)
exports.rejectChauffeurRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { chauffeurRequestMessage } = req.body;

  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    if (user.chauffeurRequestStatus !== 'pending') {
      return res.status(400).json({ message: 'Cette demande n\'est pas en attente de validation.' });
    }

    user.isChauffeurVerified = false;
    user.chauffeurRequestStatus = 'rejected';
    user.chauffeurRequestMessage = chauffeurRequestMessage || 'Votre demande a été rejetée.';

    await user.save();

    const userObj = user.toObject();
    delete userObj.motDePasseHash;

    res.json({
      message: `La demande du chauffeur ${user.nom} a été rejetée.`,
      user: userObj
    });

  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
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
