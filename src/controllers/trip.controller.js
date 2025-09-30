// src/controllers/trip.controller.js
const Trip = require('../models/Trip.model');
const User = require('../models/User.model'); // Pour "populer" les infos du conducteur
const { validationResult } = require('express-validator');

// @desc    Créer un nouveau trajet
// @route   POST /api/trips
// @access  Private (Chauffeur vérifié)
exports.createTrip = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // L'ID du conducteur est tiré du token JWT (req.user.id)
  const conducteur = req.user.id;
  const { villeDepart, villeArrivee, dateDepart, placesDisponibles, prix } = req.body;

  try {
    const newTrip = new Trip({
      conducteur,
      villeDepart,
      villeArrivee,
      dateDepart,
      placesDisponibles,
      prix,
    });

    const trip = await newTrip.save();
    res.status(201).json({ message: 'Trajet créé avec succès.', trip });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur Serveur');
  }
};

// @desc    Rechercher des trajets
// @route   GET /api/trips
// @access  Public
exports.getTrips = async (req, res) => {
  const { villeDepart, villeArrivee, dateDepart } = req.query;
  const query = {};

  if (villeDepart) {
    query.villeDepart = { $regex: new RegExp(villeDepart, 'i') }; // Recherche insensible à la casse
  }
  if (villeArrivee) {
    query.villeArrivee = { $regex: new RegExp(villeArrivee, 'i') };
  }
  if (dateDepart) {
    // Pour une recherche par date, nous devons gérer les plages
    // Cela suppose que dateDepart est une date au format YYYY-MM-DD
    const startOfDay = new Date(dateDepart);
    startOfDay.setUTCHours(0, 0, 0, 0); // Début du jour en UTC

    const endOfDay = new Date(dateDepart);
    endOfDay.setUTCHours(23, 59, 59, 999); // Fin du jour en UTC

    query.dateDepart = { $gte: startOfDay, $lte: endOfDay };
  }

  // S'assurer que les trajets sont dans le futur
  query.dateDepart = { ...query.dateDepart, $gte: new Date() };

  try {
    // Trouve les trajets et "popule" les informations du conducteur
    const trips = await Trip.find(query)
      .populate('conducteur', 'nom email') // Seulement le nom et l'email du conducteur
      .sort('dateDepart'); // Tri par date de départ ascendante

    res.json({ message: 'Trajets trouvés.', trips });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur Serveur');
  }
};

// @desc    Obtenir les détails d'un trajet spécifique
// @route   GET /api/trips/:id
// @access  Public
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('conducteur', 'nom email isChauffeurVerified');

    if (!trip) {
      return res.status(404).json({ message: 'Trajet non trouvé.' });
    }

    res.json({ message: 'Détails du trajet.', trip });

  } catch (error) {
    console.error(error.message);
    // Vérifier si l'ID n'est pas un ObjectId valide
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Trajet non trouvé.' });
    }
    res.status(500).send('Erreur Serveur');
  }
};
