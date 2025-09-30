# Backend de l'Application "Co-Trajet"

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)![Mocha](https://img.shields.io/badge/Mocha-8D6748?style=for-the-badge&logo=mocha&logoColor=white)

Ce dépôt contient le code source du backend pour **Co-Trajet**, une application de covoiturage moderne. L'API est développée avec Node.js et Express, utilise MongoDB comme base de données, et est sécurisée par un système d'authentification JWT avec une gestion fine des rôles (Passager, Chauffeur, Admin).

Le projet met un accent particulier sur la qualité du code, la maintenabilité et la robustesse, avec une suite de tests automatisés couvrant les fonctionnalités critiques.

## Table des Matières

- [Fonctionnalités Clés](#fonctionnalités-clés)
- [Architecture et Technologies](#architecture-et-technologies)
- [Structure du Projet](#structure-du-projet)
- [Démarrage Rapide](#démarrage-rapide)
  - [Prérequis](#prérequis)
  - [Installation](#installation)
  - [Lancement du Serveur](#lancement-du-serveur)
- [Variables d'Environnement](#variables-denvironnement)
- [Documentation de l'API](#documentation-de-lapi)
- [Tests Automatisés](#tests-automatisés)
- [Roadmap (Fonctionnalités Futures)](#roadmap-fonctionnalités-futures)
- [Licence](#licence)

## Fonctionnalités Clés

- **Gestion des Utilisateurs :** Inscription et connexion sécurisées.
- **Système de Rôles :** Permissions distinctes pour `Passager`, `Chauffeur`, et `Admin`.
- **Validation des Chauffeurs :** Un processus de validation géré par un administrateur pour garantir la confiance et la sécurité.
- **Gestion des Trajets :** Publication de nouveaux trajets par les chauffeurs vérifiés.
- **Recherche de Trajets :** API de recherche flexible avec filtres (villes, date).
- **API RESTful Sécurisée :** Authentification par token JWT pour protéger les routes sensibles.
- **Validation des Données :** Validation robuste des entrées pour prévenir les erreurs et les injections.
- **Tests Automatisés :** Suite de tests d'intégration pour assurer la fiabilité de l'API.

## Architecture et Technologies

- **Framework :** [Express.js](https://expressjs.com/)
- **Base de Données :** [MongoDB](https://www.mongodb.com/) avec [Mongoose](https://mongoosejs.com/) comme ODM
- **Authentification :** JSON Web Tokens ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken))
- **Sécurité :** Hachage des mots de passe avec [bcrypt.js](https://github.com/dcodeIO/bcrypt.js)
- **Validation :** [express-validator](https://express-validator.github.io/docs/)
- **Gestion des Variables d'Environnement :** [dotenv](https://github.com/motdotla/dotenv)
- **Framework de Test :** [Mocha](https://mochajs.org/)
- **Bibliothèque d'Assertions :** [Chai](https://www.chaijs.com/)
- **Tests HTTP :** [Supertest](https://github.com/visionmedia/supertest)

## Structure du Projet

```
co-trajet-backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Configuration de la connexion MongoDB
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── trip.controller.js
│   │   └── user.controller.js    # Logique métier des routes
│   ├── middleware/
│   │   ├── auth.middleware.js    # Vérification du token JWT
│   │   ├── authorizeRoles.middleware.js # Vérification des rôles
│   │   └── validation.js         # Règles de validation des entrées
│   ├── models/
│   │   ├── User.model.js
│   │   └── Trip.model.js         # Schémas Mongoose
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── trip.routes.js
│   │   └── user.routes.js        # Définition des endpoints de l'API
│   ├── utils/
│   │   └── createDefaultAdmin.js # Script pour créer l'admin par défaut
│   └── app.js                    # Point d'entrée de l'application Express
├── test/
│   ├── auth.test.js
│   ├── trip.test.js
│   ├── user.test.js
│   └── test_helper.js            # Configuration et nettoyage de la DB de test
├── .env.example                  # Fichier d'exemple pour les variables d'environnement
├── .gitignore
├── package.json
└── README.md
```

## Démarrage Rapide

Suivez ces étapes pour configurer et lancer le projet en local.

### Prérequis

- [Node.js](https://nodejs.org/) (version 14.x ou supérieure)
- npm ou [yarn](https://yarnpkg.com/)
- Une instance de [MongoDB](https://www.mongodb.com/) en cours d'exécution (localement ou via Atlas).

### Installation

1.  **Cloner le dépôt :**
    ```bash
    git clone https://github.com/bslik01/co-trajet-backend.git
    cd co-trajet-backend
    ```

2.  **Installer les dépendances :**
    ```bash
    npm install
    ```

3.  **Configurer les variables d'environnement :**
    Créez un fichier `.env` à la racine du projet en copiant le modèle `.env.example` et remplissez les valeurs.
    ```bash
    cp .env.example .env
    ```
    Modifiez ensuite le fichier `.env` avec vos propres configurations.

### Lancement du Serveur

-   **En mode développement :**
    ```bash
    npm run dev  # Si vous avez configuré nodemon
    ```

-   **En mode production :**
    ```bash
    npm start
    ```

Le serveur devrait démarrer sur le port défini dans votre fichier `.env` (par défaut `5000`).

## Variables d'Environnement

Le fichier `.env` est crucial pour le bon fonctionnement de l'application.

```ini
# Port du serveur
PORT=5000

# URI de connexion à la base de données de développement
MONGO_URI=mongodb://localhost:2717/cotrajet

# URI de connexion à la base de données de test (pour `npm test`)
MONGO_URI_TEST=mongodb://localhost:27017/cotrajet_test

# Clé secrète pour signer les tokens JWT (TRÈS IMPORTANT : utilisez une chaîne longue et aléatoire)
JWT_SECRET=votre_secret_jwt_tres_long_et_complexe

# Identifiants pour l'administrateur par défaut (créé au premier lancement)
DEFAULT_ADMIN_EMAIL=admin@cotrajet.com
DEFAULT_ADMIN_PASSWORD=ChangezCeMotDePasse!
DEFAULT_ADMIN_NOM=Administrateur Co-Trajet
```

## Documentation de l'API

L'API est structurée par modules. Voici les principaux endpoints disponibles :

<details>
<summary><strong>Authentification (`/api/auth`)</strong></summary>

| Méthode | Route              | Accès  | Description                                |
| :------ | :----------------- | :----- | :----------------------------------------- |
| `POST`  | `/register`        | Public | Inscription d'un nouvel utilisateur.       |
| `POST`  | `/login`           | Public | Connexion d'un utilisateur et obtention d'un JWT. |

</details>

<details>
<summary><strong>Utilisateurs (`/api/users`)</strong></summary>

| Méthode | Route                  | Accès          | Description                                           |
| :------ | :--------------------- | :------------- | :---------------------------------------------------- |
| `GET`   | `/me`                  | Privé (Connecté) | Récupère le profil de l'utilisateur authentifié.      |
| `PUT`   | `/become-chauffeur`    | Privé (Passager) | Soumet une demande pour devenir chauffeur avec les documents requis. |

</details>

<details>
<summary><strong>Trajets (`/api/trips`)</strong></summary>

| Méthode | Route              | Accès                   | Description                                             |
| :------ | :----------------- | :---------------------- | :------------------------------------------------------ |
| `POST`  | `/`                | Privé (Chauffeur Vérifié) | Publie une nouvelle offre de trajet.                  |
| `GET`   | `/`                | Public                  | Recherche les trajets disponibles avec des filtres (villeDepart, villeArrivee, dateDepart). |
| `GET`   | `/:id`             | Public                  | Récupère les détails d'un trajet spécifique par son ID. |

</details>

<details>
<summary><strong>Administration (`/api/admin`)</strong></summary>

| Méthode | Route                               | Accès         | Description                                        |
| :------ | :---------------------------------- | :------------ | :------------------------------------------------- |
| `GET`   | `/chauffeur-requests`               | Privé (Admin) | Liste toutes les demandes de chauffeur en attente. |
| `PUT`   | `/chauffeur-requests/:id/approve`   | Privé (Admin) | Approuve la demande de statut chauffeur d'un utilisateur. |
| `PUT`   | `/chauffeur-requests/:id/reject`    | Privé (Admin) | Rejette la demande de statut chauffeur d'un utilisateur. |

</details>

## Tests Automatisés

Le projet inclut une suite de tests d'intégration pour garantir la stabilité et la non-régression de l'API.

Pour lancer les tests, assurez-vous d'avoir configuré votre `MONGO_URI_TEST` dans le fichier `.env`.

```bash
npm test
```

Cette commande exécutera tous les fichiers de test dans le dossier `/test` à l'aide de Mocha. Les tests utilisent une base de données séparée qui est nettoyée avant chaque exécution.

## Roadmap (Fonctionnalités Futures)

-   [ ] **Système de Réservation :** Permettre aux passagers de réserver des places.
-   [ ] **Notifications :** Notifications en temps réel (ex: demande de réservation, confirmation, rappel de trajet).
-   [ ] **Messagerie Interne :** Un chat entre chauffeurs et passagers.
-   [ ] **Système de Notation :** Évaluation des chauffeurs et des passagers après un trajet.
-   [ ] **Intégration de Paiement :** Gestion des transactions via une passerelle de paiement.
-   [ ] **Déploiement :** Mise en place d'un pipeline CI/CD pour un déploiement sur une plateforme cloud (Heroku, AWS, etc.).

## Licence

Ce projet est distribué sous la licence MIT. Voir le fichier `LICENSE` pour plus de détails.