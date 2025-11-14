// src/jobs/tripStatusUpdater.js
const cron = require('node-cron');
const Trip = require('../models/Trip.model');

// Ce job s'exécutera toutes les heures.
// Syntaxe cron : 'minute heure jour-du-mois mois jour-de-la-semaine'
// '0 * * * *' -> à la minute 0 de chaque heure.
const scheduleTripCompletionJob = () => {
  cron.schedule('0 * * * *', async () => {
    console.log(`[Job Runner] Exécution de la mise à jour du statut des trajets - ${new Date().toISOString()}`);
    try {
      const now = new Date();
      // On considère un trajet comme "terminé" 2 heures après son départ.
      // C'est une estimation, vous pouvez l'ajuster.
      const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));

      const result = await Trip.updateMany(
        {
          status: 'scheduled',
          dateDepart: { $lte: twoHoursAgo } // $lte = Less Than or Equal to
        },
        { $set: { status: 'completed' } }
      );

      if (result.modifiedCount > 0) {
        console.log(`[Job Runner] ${result.modifiedCount} trajets ont été marqués comme terminés.`);
      }
    } catch (error) {
      console.error('[Job Runner] Erreur lors de la mise à jour du statut des trajets:', error);
    }
  });
};

module.exports = scheduleTripCompletionJob;