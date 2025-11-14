// src/controllers/review.controller.js
const Review = require('../models/Review.model');
const Trip = require('../models/Trip.model');
const Booking = require('../models/Booking.model');
const User = require('../models/User.model');
const { validationResult } = require('express-validator');

// @desc    Créer un nouvel avis
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { tripId, recipientId, rating, comment } = req.body;
  const authorId = req.user.id;

  try {
    // --- LOGIQUE DE VALIDATION COMPLEXE ---

    // 1. Le trajet doit exister et être "terminé"
    const trip = await Trip.findById(tripId);
    if (!trip || trip.status !== 'completed') {
      return res.status(403).json({ message: "Vous ne pouvez laisser un avis que pour un trajet terminé." });
    }

    // 2. L'auteur ne peut pas s'auto-évaluer
    if (authorId === recipientId) {
      return res.status(403).json({ message: "Vous ne pouvez pas laisser d'avis sur vous-même." });
    }

    // 3. Le destinataire doit être soit le passager, soit le conducteur
    const isAuthorPassenger = await Booking.findOne({ trip: tripId, passenger: authorId });
    const isAuthorDriver = trip.conducteur.toString() === authorId;
    const isRecipientPassenger = await Booking.findOne({ trip: tripId, passenger: recipientId });
    const isRecipientDriver = trip.conducteur.toString() === recipientId;

    // Scénario 1 : Le passager note le conducteur
    const passengerRatingDriver = isAuthorPassenger && isRecipientDriver;
    // Scénario 2 : Le conducteur note un passager
    const driverRatingPassenger = isAuthorDriver && isRecipientPassenger;

    if (!passengerRatingDriver && !driverRatingPassenger) {
      return res.status(403).json({ message: "Vous n'avez pas participé à ce trajet avec cet utilisateur." });
    }
    
    // 4. Vérifier si un avis n'a pas déjà été laissé
    const existingReview = await Review.findOne({ trip: tripId, author: authorId, recipient: recipientId });
    if (existingReview) {
      return res.status(400).json({ message: "Vous avez déjà laissé un avis pour cet utilisateur sur ce trajet." });
    }

    // --- FIN DE LA VALIDATION ---

    const newReview = new Review({
      trip: tripId,
      author: authorId,
      recipient: recipientId,
      rating,
      comment,
    });

    await newReview.save();

    // Mettre à jour la note moyenne du destinataire
    await User.recalculateRating(recipientId);

    res.status(201).json({ message: 'Avis enregistré avec succès.', review: newReview });

  } catch (error) {
    console.error("Erreur lors de la création de l'avis:", error);
    res.status(500).send("Erreur Serveur");
  }
};

// @desc    Obtenir les avis reçus par un utilisateur
// @route   GET /api/users/:userId/reviews
// @access  Public
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ recipient: req.params.userId })
            .sort({ createdAt: -1 })
            .populate('author', 'nom'); // Récupérer le nom de l'auteur de l'avis

        res.json({ reviews });
    } catch (error) {
        console.error("Erreur de récupération des avis:", error);
        res.status(500).send("Erreur Serveur");
    }
};
