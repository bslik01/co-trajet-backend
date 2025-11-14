// src/app.js
require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const tripRoutes = require('./routes/trip.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');
const createDefaultAdmin = require('./utils/createDefaultAdmin');
const scheduleTripCompletionJob = require('./jobs/tripStatusUpdater'); // Importer le job
const meRoutes = require('./routes/me.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();

// Connexion à la base de données
connectDB().then(() => {
  createDefaultAdmin();
});

// --- LANCER LES JOBS PLANIFIÉS ---
scheduleTripCompletionJob();

// Middlewares
app.use(express.json());

// Route pour la documentation API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes de l'application
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/me', meRoutes);
app.use('/api/reviews', reviewRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('API Co-Trajet Backend fonctionne! Allez sur /api-docs pour la documentation.');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

// Exporter l'application pour les tests
module.exports = app;