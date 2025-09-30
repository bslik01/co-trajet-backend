require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const tripRoutes = require('./routes/trip.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const createDefaultAdmin = require('./utils/createDefaultAdmin');

const app = express();

// 1. Connecter à la base de données et créer l'admin par défaut
connectDB().then(() => {
  createDefaultAdmin();
});

// 2. Middlewares
app.use(express.json());

// 3. Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('API Co-Trajet Backend fonctionne!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

module.exports = app;