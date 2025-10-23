# Backend de l'Application "Co-Trajet"

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)![Mocha](https://img.shields.io/badge/Mocha-8D6748?style=for-the-badge&logo=mocha&logoColor=white)

Ce dépôt contient le code source de l'API backend pour **Co-Trajet**, une application de covoiturage conçue autour de la confiance et de la sécurité. Développée avec Node.js/Express et MongoDB, cette API RESTful met en œuvre un système de vérification de chauffeur multi-niveaux, une gestion fine des rôles, et une architecture de gestion de fichiers sécurisée via Cloudinary.

Le projet met un accent particulier sur la qualité du code, la maintenabilité et la robustesse, avec une suite complète de tests d'intégration pour assurer la fiabilité de chaque endpoint.

## Table des Matières

- [Vision et Fonctionnalités Clés](#vision-et-fonctionnalités-clés)
- [Architecture et Technologies](#architecture-et-technologies)
- [Structure du Projet](#structure-du-projet)
- [Démarrage Rapide](#démarrage-rapide)
  - [Prérequis](#prérequis)
  - [Installation](#installation)
  - [Lancement du Serveur](#lancement-du-serveur)
- [Variables d'Environnement](#variables-denvironnement)
- [Documentation de l'API](#documentation-de-lapi)
- [Tests Automatisés](#tests-automatisés)
- [Prochaines Étapes](#prochaines-étapes)
- [Licence](#licence)

## Vision et Fonctionnalités Clés

La mission de Co-Trajet est de construire la plateforme de covoiturage la plus fiable du marché, où la sécurité et la confiance sont au cœur de l'expérience.

-   **Système de Confiance Avancé :**
    -   **Vérification de Chauffeur Multi-Documents :** Processus de validation professionnel exigeant CNI, permis de conduire, carte grise, assurance, etc.
    -   **Validation Granulaire :** Les administrateurs peuvent approuver ou rejeter chaque document individuellement, offrant un feedback précis aux candidats.
    -   **Gestion Sécurisée des Fichiers :** Utilisation de signatures sécurisées pour l'upload direct vers **Cloudinary**, garantissant que les documents sensibles ne transitent jamais par notre serveur.

-   **Gestion des Trajets et Réservations :**
    -   Publication, modification et annulation de trajets pour les chauffeurs vérifiés.
    -   Système de réservation de places avec mise à jour en temps réel de la disponibilité.
    -   Consultation des trajets réservés pour les passagers et des listes de passagers pour les chauffeurs.

-   **API RESTful Sécurisée :**
    -   Authentification par token JWT.
    -   Gestion des rôles (`Passager`, `Chauffeur`, `Admin`) avec des middlewares d'autorisation.
    -   Validation et sanitization des entrées pour se prémunir contre les vulnérabilités courantes.

## Architecture et Technologies

-   **Framework :** [Express.js](https://expressjs.com/)
-   **Base de Données :** [MongoDB](https://www.mongodb.com/) avec [Mongoose](https://mongoosejs.com/) comme ODM
-   **Stockage de Fichiers :** [Cloudinary](https://cloudinary.com/) (pour les documents de vérification)
-   **Authentification :** JSON Web Tokens ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken))
-   **Sécurité :** Hachage des mots de passe avec [bcrypt.js](https://github.com/dcodeIO/bcrypt.js)
-   **Validation :** [express-validator](https://express-validator.github.io/docs/)
-   **Gestion des Variables d'Environnement :** [dotenv](https://github.com/motdotla/dotenv)
-   **Framework de Test :** [Mocha](https://mochajs.org/) & [Chai](https://www.chaijs.com/)
-   **Tests HTTP :** [Supertest](https://github.com/visionmedia/supertest)

## Structure du Projet

```
co-trajet-backend/
├── src/
│   ├── config/
│   │   ├── cloudinary.js         # Configuration de Cloudinary
│   │   └── db.js                 # Configuration de MongoDB
│   ├── controllers/
│   │   ├── admin.controller.js   # Logique des actions de l'admin
│   │   ├── auth.controller.js
│   │   ├── trip.controller.js
│   │   ├── upload.controller.js  # Logique de signature d'upload
│   │   └── user.controller.js
│   ├── middleware/               # ...
│   ├── models/
│   │   ├── Booking.model.js
│   │   ├── Trip.model.js
│   │   └── User.model.js         # Modèle utilisateur avec profil chauffeur détaillé
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── trip.routes.js
│   │   ├── upload.routes.js
│   │   └── user.routes.js
│   ├── utils/                    # ...
│   └── app.js                    # Point d'entrée de l'application
├── test/
│   ├── admin.test.js
│   ├── auth.test.js
│   ├── chauffeur_flow.test.js
│   ├── trip.test.js
│   ├── upload.test.js
│   └── test_helper.js
├── .env
├── package.json
└── README.md
```

## Démarrage Rapide

### Prérequis

-   [Node.js](https://nodejs.org/) (v16.x ou supérieure)
-   Un compte [Cloudinary](https://cloudinary.com/) (le plan gratuit est suffisant pour démarrer)
-   Une instance de [MongoDB](https://www.mongodb.com/) en cours d'exécution.

### Installation

1.  **Cloner le dépôt :**
    ```bash
    git clone https://github.com/votre-nom-utilisateur/co-trajet-backend.git
    cd co-trajet-backend
    ```

2.  **Installer les dépendances :**
    ```bash
    npm install
    ```

3.  **Configurer les variables d'environnement :**
    Créez un fichier `.env` qui contiendra les variables d'envirnnment du projet.
    ```bash
    touch .env
    ```

### Lancement du Serveur

```bash
npm start
```
Le serveur démarrera sur le port défini dans votre fichier `.env` (par défaut `5000`).

## Variables d'Environnement

Le fichier `.env` est crucial. Assurez-vous de configurer toutes les clés.

```ini
# --- Application ---
PORT=5000

# --- MongoDB ---
MONGO_URI=mongodb://localhost:27017/cotrajet
MONGO_URI_TEST=mongodb://localhost:27017/cotrajet_test

# --- Sécurité ---
JWT_SECRET=votre_secret_jwt_tres_long_et_complexe

# --- Admin par Défaut ---
DEFAULT_ADMIN_EMAIL=admin@cotrajet.com
DEFAULT_ADMIN_PASSWORD=ChangezCeMotDePasse!
DEFAULT_ADMIN_NOM=admin

# --- Cloudinary ---
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

## Documentation de l'API

L'API est structurée pour suivre les meilleures pratiques RESTful.

<details>
<summary><strong>Authentification (`/api/auth`) & Uploads (`/api/uploads`)</strong></summary>

| Méthode | Route                       | Accès  | Description                                                         |
| :------ | :-------------------------- | :----- | :------------------------------------------------------------------ |
| `POST`  | `/auth/register`            | Public | Inscription d'un nouvel utilisateur.                                |
| `POST`  | `/auth/login`               | Public | Connexion et obtention d'un JWT.                                    |
| `POST`  | `/uploads/generate-signature`| Privé  | Génère une signature sécurisée pour un upload direct vers Cloudinary. |

</details>

<details>
<summary><strong>Utilisateurs & Demande Chauffeur (`/api/users`)</strong></summary>

| Méthode | Route                  | Accès          | Description                                           |
| :------ | :--------------------- | :------------- | :---------------------------------------------------- |
| `GET`   | `/me`                  | Privé          | Récupère le profil de l'utilisateur authentifié.      |
| `POST`  | `/become-chauffeur`    | Privé (Passager) | Soumet le dossier de candidature chauffeur complet.   |
| `GET`   | `/me/trips`            | Privé (Chauffeur)| Liste les trajets publiés par le chauffeur connecté.   |
| `GET`   | `/me/bookings`         | Privé          | Liste les réservations effectuées par l'utilisateur.     |

</details>

<details>
<summary><strong>Trajets & Réservations (`/api/trips`)</strong></summary>

| Méthode | Route              | Accès                   | Description                                             |
| :------ | :----------------- | :---------------------- | :------------------------------------------------------ |
| `POST`  | `/`                | Privé (Chauffeur Vérifié) | Publie une nouvelle offre de trajet.                  |
| `GET`   | `/`                | Public                  | Recherche les trajets disponibles.                     |
| `GET`   | `/:id`             | Privé                   | Récupère les détails d'un trajet spécifique.          |
| `POST`  | `/:id/book`        | Privé                   | Réserve une ou plusieurs places sur un trajet.         |
| `GET`   | `/:id/passengers`  | Privé (Chauffeur du trajet)| Liste les passagers ayant réservé sur ce trajet.       |
| `PUT`   | `/:id`             | Privé (Chauffeur du trajet)| Modifie un trajet (si aucune réservation).           |
| `DELETE`| `/:id`             | Privé (Chauffeur du trajet)| Annule un trajet et ses réservations associées.        |

</details>

<details>
<summary><strong>Administration (`/api/admin`)</strong></summary>

| Méthode | Route                               | Accès         | Description                                        |
| :------ | :---------------------------------- | :------------ | :------------------------------------------------- |
| `GET`   | `/chauffeur-requests`               | Privé (Admin) | Liste toutes les demandes chauffeur en attente/révision. |
| `PUT`   | `/chauffeur-requests/:userId/documents`| Privé (Admin) | Approuve ou rejette un document spécifique.        |
| `PUT`   | `/chauffeur-requests/:userId/activate` | Privé (Admin) | Active le profil chauffeur après validation complète. |

</details>

## Tests Automatisés

Le projet est couvert par une suite de tests d'intégration complète pour valider chaque aspect de l'API, du flux d'authentification au processus de vérification de chauffeur.

Pour lancer la suite de tests, exécutez :
```bash
npm test
```
Les tests utilisent une base de données dédiée (`MONGO_URI_TEST`) qui est automatiquement nettoyée avant chaque exécution pour garantir l'isolement et la fiabilité.

## Licence

Ce projet est distribué sous la licence MIT. Voir le fichier `LICENSE` pour plus de détails.