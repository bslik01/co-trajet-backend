// src/controllers/trip.controller.js
const Trip = require('../models/Trip.model');
const User = require('../models/User.model');
const Booking = require('../models/Booking.model');
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

// @desc    Réserver une place sur un trajet
// @route   POST /api/trips/:id/book
// @access  Private
exports.bookTrip = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { seatsBooked } = req.body;
  const tripId = req.params.id;
  const passengerId = req.user.id; // ID du passager depuis le token JWT

  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trajet non trouvé.' });
    }

    // Vérification 1: L'utilisateur ne peut pas réserver son propre trajet
    if (trip.conducteur.toString() === passengerId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas réserver une place sur votre propre trajet.' });
    }
    
    // Vérification 2: Le trajet est-il dans le futur ?
    if (new Date(trip.dateDepart) < new Date()) {
      return res.status(400).json({ message: 'Ce trajet est déjà passé.' });
    }

    // Vérification 3: Y a-t-il assez de places ?
    if (trip.placesDisponibles < seatsBooked) {
      return res.status(400).json({ message: `Il ne reste que ${trip.placesDisponibles} places disponibles.` });
    }

    // Vérification 4: L'utilisateur a-t-il déjà réservé ?
    const existingBooking = await Booking.findOne({ trip: tripId, passenger: passengerId });
    if (existingBooking) {
      return res.status(400).json({ message: 'Vous avez déjà une réservation pour ce trajet.' });
    }

    // Tout est bon, on crée la réservation
    const newBooking = new Booking({
      trip: tripId,
      passenger: passengerId,
      seatsBooked,
    });

    await newBooking.save();

    // Mettre à jour les places disponibles sur le trajet
    trip.placesDisponibles -= seatsBooked;
    await trip.save();

    res.status(201).json({ message: 'Réservation confirmée avec succès.', booking: newBooking });

  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Trajet non trouvé.' });
    }
    res.status(500).send('Erreur Serveur');
  }
};

// @desc    Obtenir les passagers d'un trajet
// @route   GET /api/trips/:id/passengers
// @access  Private (Chauffeur du trajet)
exports.getTripPassengers = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trajet non trouvé.' });
    }
    
    // Seul le conducteur du trajet peut voir les passagers
    if (trip.conducteur.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé. Vous n\'êtes pas le chauffeur de ce trajet.' });
    }

    const bookings = await Booking.find({ trip: req.params.id })
      .populate('passenger', 'nom email'); // Récupérer le nom et l'email du passager

    res.json({ message: 'Passagers du trajet.', passengers: bookings });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur Serveur');
  }
};

// @desc    Modifier un trajet
// @route   PUT /api/trips/:id
// @access  Private (Chauffeur du trajet)
exports.updateTrip = async (req, res) => {
  // La validation peut être la même que pour la création
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trajet non trouvé.' });
    }

    // Vérifier que c'est bien le chauffeur qui modifie
    if (trip.conducteur.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    // Empêcher la modification si des réservations existent déjà (logique simplifiée pour le MVP)
    const bookings = await Booking.find({ trip: req.params.id });
    if (bookings.length > 0) {
      return res.status(400).json({ message: 'Impossible de modifier un trajet avec des réservations existantes.' });
    }

    // Mettre à jour les champs
    trip = await Trip.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json({ message: 'Trajet mis à jour.', trip });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur Serveur');
  }
};

// @desc    Supprimer un trajet
// @route   DELETE /api/trips/:id
// @access  Private (Chauffeur du trajet)
exports.deleteTrip = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trajet non trouvé.' });
    }

    if (trip.conducteur.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    // Logique d'annulation : supprimer le trajet ET les réservations associées
    await Booking.deleteMany({ trip: req.params.id });
    await Trip.findByIdAndRemove(req.params.id);

    // TODO: Envoyer des notifications aux passagers
    
    res.json({ message: 'Trajet et réservations associées supprimés.' });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur Serveur');
  }
};