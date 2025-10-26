// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Co-Trajet',
      version: '1.0.0',
      description: 'Documentation de l\'API RESTful pour l\'application de covoiturage Co-Trajet. Cette API gère les utilisateurs, les trajets, les réservations et un système de vérification de chauffeur avancé.',
      contact: {
        name: 'Support Co-Trajet',
        email: 'support@cotrajet.com',
      },
    },
    servers: [
      { 
        url: 'http://localhost:5000',
        description: 'Serveur de développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez le token JWT. Exemple: Bearer eyJhbGciOiJI...',
        }
      }
    },
    security: [{ bearerAuth: [] }] // Applique l'authentification JWT à tous les endpoints par défaut
  },
  apis: ['./src/routes/*.js'], // Chemin vers les fichiers contenant les annotations
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
