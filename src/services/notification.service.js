// src/services/notification.service.js
const transporter = require('../config/mailer');

class NotificationService {
  /**
   * Méthode générique pour envoyer un email.
   * @param {string} to - L'adresse email du destinataire.
   * @param {string} subject - Le sujet de l'email.
   * @param {string} html - Le contenu HTML de l'email.
   */
  async sendEmail(to, subject, html) {
    // Ne pas envoyer d'email en environnement de test pour ne pas polluer et ralentir les tests
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: to,
        subject: subject,
        html: html,
      });
      console.log(`Email envoyé avec succès à ${to}`);
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email à ${to}:`, error);
    }
  }

  sendWelcomeEmail(user) {
    const subject = 'Bienvenue sur Co-Trajet !';
    const html = `<h1>Bonjour ${user.nom},</h1><p>Nous sommes ravis de vous compter parmi nous. Commencez à planifier vos trajets dès maintenant !</p>`;
    this.sendEmail(user.email, subject, html);
  }

  sendBookingConfirmation(passenger, driver, trip) {
    // TODO: Implémenter la logique
  }
  
  sendDriverApplicationNoticeToAdmin(applicant) {
    // TODO: Implémenter la logique
  }
  
  sendDriverStatusUpdate(user, isApproved, reason = '') {
    const subject = `Mise à jour de votre statut de chauffeur`;
    let html;
    if (isApproved) {
      html = `<h1>Félicitations ${user.nom},</h1><p>Votre profil de chauffeur a été approuvé ! Vous pouvez maintenant publier des trajets.</p><p>Connectez-vous à votre compte pour commencer.</p>`;
    } else {
      html = `<h1>Bonjour ${user.nom},</h1><p>Après examen, votre demande de statut chauffeur nécessite une révision.</p><p><b>Motif :</b> ${reason}</p><p>Veuillez vous connecter à votre profil pour soumettre à nouveau les documents requis.</p>`;
    }
    this.sendEmail(user.email, subject, html);
  }
}

// Exporte une instance unique du service
module.exports = new NotificationService();
