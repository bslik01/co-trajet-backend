// src/controllers/me.controller.js
const Trip = require('../models/Trip.model');
const Booking = require('../models/Booking.model');

// @desc    Obtenir toutes les données pour le tableau de bord de l'utilisateur
// @route   GET /api/me/dashboard
// @access  Private
exports.getDashboardData = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. "Mes Réservations" (Passager) - Trajets à venir
    const myBookings = await Booking.find({ passenger: userId, status: 'confirmed' })
      .populate({
        path: 'trip',
        match: { status: 'scheduled' }, // Ne récupérer que les trajets à venir
        populate: { path: 'conducteur', select: 'nom' }
      })
      .sort({ 'trip.dateDepart': 1 });
      
    // Filtrer les réservations dont le trajet est null (car il n'était pas 'scheduled')
    const upcomingReservations = myBookings.filter(b => b.trip !== null);

    // 2. "Mes Annonces" (Conducteur) - Trajets à venir
    const myPublishedTrips = await Trip.find({ conducteur: userId, status: 'scheduled' })
      .sort({ dateDepart: 1 });
    // Pour chaque trajet, on pourrait aussi compter les réservations
    // (Optimisation pour plus tard, pour ne pas faire N+1 requêtes)

    // 3. "Mon Historique" - Trajets passés (en tant que passager OU conducteur)
    const myPastTripsAsDriver = await Trip.find({ conducteur: userId, status: 'completed' });
    
    const myPastBookings = await Booking.find({ passenger: userId, status: 'confirmed' })
      .populate({
        path: 'trip',
        match: { status: 'completed' },
        populate: { path: 'conducteur', select: 'nom' }
      });
    const myPastTripsAsPassenger = myPastBookings.filter(b => b.trip !== null).map(b => b.trip);
    
    // Combiner et trier l'historique
    const history = [...myPastTripsAsDriver, ...myPastTripsAsPassenger]
      .sort((a, b) => new Date(b.dateDepart) - new Date(a.dateDepart)); // Du plus récent au plus ancien

    res.json({
      upcomingReservations, // Onglet "Mes Voyages"
      myPublishedTrips,     // Onglet "Mes Annonces"
      history,              // Onglet "Historique"
    });

  } catch (error) {
    console.error('Erreur de récupération des données du tableau de bord:', error);
    res.status(500).send('Erreur Serveur');
  }
};