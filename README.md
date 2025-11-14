
# Backend de l'Application "Co-Trajet"

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

Ce dépôt contient le code source de l'API backend pour **Co-Trajet**, une plateforme de covoiturage complète conçue pour la confiance, la communication et la maîtrise de l'expérience utilisateur. Au-delà d'un simple outil transactionnel, cette API propulse une véritable communauté en intégrant un système de réputation, une messagerie interne et un tableau de bord centralisé.

Développée avec Node.js/Express, MongoDB et documentée via Swagger, cette API RESTful est la fondation robuste d'une expérience de covoiturage sûre et intuitive.

## Table des Matières

- [Vision et Fonctionnalités Clés](#vision-et-fonctionnalités-clés)
- [Architecture et Technologies](#architecture-et-technologies)
- [Démarrage Rapide](#démarrage-rapide)
- [Variables d'Environnement](#variables-denvironnement)
- [Documentation de l'API](#documentation-de-lapi)
- [Tests Automatisés](#tests-automatisés)
- [Prochaines Étapes](#prochaines-étapes)
- [Licence](#licence)

## Vision et Fonctionnalités Clés

La mission de Co-Trajet est de transformer la réservation de trajets en une expérience communautaire complète, où chaque utilisateur se sent en sécurité, informé et en contrôle.

-   **Confiance et Réputation (Sprint 3) :**
    -   **Système d'Avis et de Notation :** Les utilisateurs peuvent s'évaluer mutuellement (note de 1 à 5 et commentaire) après un trajet terminé.
    -   **Réputation Agrégée :** La note moyenne et le nombre d'avis sont affichés sur le profil public des utilisateurs, construisant une réputation tangible.
    -   **Vérification de Chauffeur Avancée :** Un processus de validation multi-documents rigoureux (CNI, permis, assurance...) assure la fiabilité des conducteurs.

-   **Communication Fluide (Sprint 3) :**
    -   **Messagerie Interne :** Une messagerie sécurisée est créée pour chaque réservation confirmée, permettant au passager et au conducteur de finaliser les détails logistiques (lieu de RDV, etc.) en toute confidentialité.

-   **Maîtrise et Gestion (Sprint 3) :**
    -   **Tableau de Bord Centralisé :** Un espace unique où les utilisateurs peuvent consulter leurs voyages à venir (en tant que passager), leurs annonces publiées (en tant que conducteur) et leur historique complet.
    -   **Cycle de Vie Automatisé des Trajets :** Un `job scheduler` met à jour le statut des trajets (de "prévu" à "terminé"), débloquant ainsi la possibilité de laisser des avis.

-   **Système de Réservation Complet (Sprint 2) :**
    -   Réservation de places avec décrémentation de la disponibilité en temps réel.
    -   Gestion des passagers pour les chauffeurs.

-   **API RESTful Sécurisée et Professionnelle :**
    -   **Authentification Avancée :** Utilisation d'un système de **Access Tokens** (courte durée) et **Refresh Tokens** (longue durée) pour une sécurité et une expérience utilisateur optimales.
    -   Gestion fine des rôles (`Passager`, `Chauffeur`, `Admin`).
    -   **Documentation Interactive :** Une documentation complète de l'API est générée et accessible via **Swagger UI**.

## Architecture et Technologies

-   **Framework :** [Express.js](https://expressjs.com/)
-   **Base de Données :** [MongoDB](https://www.mongodb.com/) avec [Mongoose](https://mongoosejs.com/)
-   **Authentification :** JSON Web Tokens ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken))
-   **Tâches Planifiées :** [node-cron](https://github.com/node-cron/node-cron) (pour la mise à jour des statuts de trajets)
-   **Notifications :** [Nodemailer](https://nodemailer.com/)
-   **Documentation API :** [Swagger](https://swagger.io/) (`swagger-ui-express`, `swagger-jsdoc`)
-   **Stockage de Fichiers :** Architecture compatible avec [Cloudinary](https://cloudinary.com/)
-   **Tests :** [Mocha](https://mochajs.org/), [Chai](https://www.chaijs.com/), [Supertest](https://github.com/visionmedia/supertest), [Sinon](https://sinonjs.org/) (pour le mocking)

## Démarrage Rapide
*(La procédure reste la même)*

## Variables d'Environnement

Le fichier `.env` est crucial. Assurez-vous de configurer toutes les clés, y compris les nouvelles pour les tokens et les emails.

```ini
# --- Application ---
PORT=5000

# --- MongoDB ---
MONGO_URI=mongodb://localhost:27017/cotrajet
MONGO_URI_TEST=mongodb://localhost:27017/cotrajet_test

# --- Sécurité & Tokens ---
JWT_SECRET=votre_secret_jwt_court_pour_access
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=votre_secret_jwt_tres_long_pour_refresh
JWT_REFRESH_EXPIRES_IN=7d

# --- Admin par Défaut ---
DEFAULT_ADMIN_EMAIL=admin@cotrajet.com
DEFAULT_ADMIN_PASSWORD=ChangezCeMotDePasse!
DEFAULT_ADMIN_NOM=Administrateur Co-Trajet

# --- Cloudinary ---
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# --- Service Email ---
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=votre_user_mailtrap
EMAIL_PASS=votre_pass_mailtrap
EMAIL_FROM="Co-Trajet" <no-reply@cotrajet.com>
```

## Documentation de l'API

Une documentation complète, interactive et toujours à jour est disponible lorsque le serveur est en cours d'exécution.

**Rendez-vous sur : `http://localhost:5000/api-docs`**

Vous y trouverez la liste de tous les endpoints, leurs paramètres, les schémas de données et la possibilité de les tester directement depuis votre navigateur.

## Tests Automatisés

Le projet est couvert par une suite de tests d'intégration complète qui valide chaque aspect de l'API.

Pour lancer la suite de tests, exécutez :
```bash
npm test
```
Les tests couvrent désormais le système de refresh tokens, la logique de création d'avis, les autorisations de la messagerie et les données retournées par le tableau de bord.

## Prochaines Étapes

Avec une base communautaire et transactionnelle solide, les prochaines étapes se concentrent sur l'amélioration de l'expérience en temps réel et la préparation au déploiement à grande échelle.

-   [ ] **Sécurité & Opérations :** Finaliser la préparation à la production en intégrant `helmet`, `express-rate-limit`, un logger `winston` et un middleware d'erreur global.
-   [ ] **Temps Réel :** Remplacer le *polling* de la messagerie par une solution **WebSockets** (avec `socket.io`) pour une communication instantanée.
-   [ ] **Paiement :** Intégrer une solution de paiement (Mobile Money) pour sécuriser les transactions.
-   [ ] **Déploiement :** Conteneuriser l'application avec Docker et mettre en place un pipeline CI/CD via GitHub Actions pour un déploiement automatisé.

## Licence

Ce projet est distribué sous la licence MIT. Voir le fichier `LICENSE` pour plus de détails.