// src/controllers/conversation.controller.js
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const Trip = require('../models/Trip.model');
const Booking = require('../models/Booking.model');

// @desc    Obtenir ou créer une conversation liée à un trajet
// @route   GET /api/conversations/trip/:tripId
// @access  Private
exports.getConversationByTrip = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trajet non trouvé.' });

    // Sécurité : L'utilisateur doit être soit le conducteur, soit un passager avec une réservation confirmée
    const isDriver = trip.conducteur.toString() === userId;
    const booking = await Booking.findOne({ trip: tripId, passenger: userId, status: 'confirmed' });
    const isConfirmedPassenger = !!booking;

    if (!isDriver && !isConfirmedPassenger) {
      return res.status(403).json({ message: 'Accès non autorisé à cette conversation.' });
    }

    const driverId = trip.conducteur;
    // Pour ce MVP, la conversation est toujours entre le passager et le conducteur.
    // Une V2 pourrait permettre des conversations de groupe.
    const participants = [userId, driverId.toString()].sort(); // Toujours trier pour garantir l'unicité

    let conversation = await Conversation.findOne({ trip: tripId, participants: participants });

    // Si la conversation n'existe pas, la créer
    if (!conversation) {
      conversation = new Conversation({
        trip: tripId,
        participants: participants,
      });
      await conversation.save();
    }

    res.json({ conversation });

  } catch (error) {
    console.error("Erreur de récupération de la conversation:", error);
    res.status(500).send("Erreur Serveur");
  }
};

// @desc    Obtenir tous les messages d'une conversation
// @route   GET /api/conversations/:conversationId/messages
// @access  Private
exports.getMessages = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user.id;

    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: 'Conversation non trouvée.' });

        // Sécurité : L'utilisateur doit faire partie des participants
        if (!conversation.participants.map(p => p.toString()).includes(userId)) {
            return res.status(403).json({ message: 'Accès non autorisé à cette conversation.' });
        }

        const messages = await Message.find({ conversation: conversationId })
            .sort({ createdAt: 'asc' }) // Du plus ancien au plus récent
            .populate('sender', 'nom');

        res.json({ messages });
    } catch (error) {
        console.error("Erreur de récupération des messages:", error);
        res.status(500).send("Erreur Serveur");
    }
};

// @desc    Envoyer un message dans une conversation
// @route   POST /api/conversations/:conversationId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;
  const senderId = req.user.id;

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Le contenu du message ne peut pas être vide.' });
  }

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation non trouvée.' });

    if (!conversation.participants.map(p => p.toString()).includes(senderId)) {
      return res.status(403).json({ message: 'Vous ne pouvez pas envoyer de message dans cette conversation.' });
    }

    const newMessage = new Message({
      conversation: conversationId,
      sender: senderId,
      content: content.trim(),
    });
    
    await newMessage.save();
    
    // Mettre à jour la date du dernier message dans la conversation
    conversation.lastMessageAt = new Date();
    await conversation.save();
    
    const populatedMessage = await newMessage.populate('sender', 'nom');

    // TODO: Envoyer une notification (push ou email) au(x) destinataire(s)

    res.status(201).json({ message: 'Message envoyé.', newMessage: populatedMessage });

  } catch (error) {
    console.error("Erreur d'envoi du message:", error);
    res.status(500).send("Erreur Serveur");
  }
};
