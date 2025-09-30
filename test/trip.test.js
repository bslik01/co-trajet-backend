// test/trip.test.js
const request = require('supertest');
const { expect } = require('chai');
const { app } = require('./test_helper');
const User = require('../src/models/User.model');
const Trip = require('../src/models/Trip.model');

describe('Trip API', () => {
  let resChauffeur, chauffeurToken, chauffeurId, passagerToken;
  const chauffeurData = { nom: 'Chauffeur Test', email: 'chauffeur@test.com', motDePasse: 'password123' };
  const passagerData = { nom: 'Passager Test', email: 'passager@test.com', motDePasse: 'password123' };
  const adminCredentials = {
    email: process.env.DEFAULT_ADMIN_EMAIL,
    motDePasse: process.env.DEFAULT_ADMIN_PASSWORD,
  };
  const tripData = {
    villeDepart: 'Douala',
    villeArrivee: 'Yaoundé',
    dateDepart: new Date(Date.now() + 86400000 * 2).toISOString(), // Dans 2 jours
    placesDisponibles: 3,
    prix: 5000,
  };

  beforeEach(async () => {
    // Créer un utilisateur qui deviendra chauffeur
    resChauffeur = await request(app).post('/api/auth/register').send(chauffeurData);
    chauffeurToken = resChauffeur.body.token;
    chauffeurId = resChauffeur.body.user.id;

    // Créer un passager
    const resPassager = await request(app).post('/api/auth/register').send(passagerData);
    passagerToken = resPassager.body.token;

    // Connecter l'admin et approuver la demande du chauffeur
    const resAdmin = await request(app).post('/api/auth/login').send(adminCredentials);
    const adminToken = resAdmin.body.token;

    await request(app)
      .put('/api/users/become-chauffeur')
      .set('Authorization', `Bearer ${chauffeurToken}`)
      .send({ permisConduireUrl: 'http://a.com/p.jpg', carteGriseUrl: 'http://a.com/c.pdf' });

    await request(app)
      .put(`/api/admin/chauffeur-requests/${chauffeurId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Connexion en tant que chauffeur
    resChauffeur = await request(app).post('/api/auth/login').send({email: chauffeurData.email, motDePasse: chauffeurData.motDePasse});
    chauffeurToken = resChauffeur.body.token;
  });

  it('devrait permettre à un chauffeur vérifié de créer un trajet', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${chauffeurToken}`)
      .send(tripData);

    expect(res.statusCode).to.equal(201);
    expect(res.body.trip).to.have.property('villeDepart', tripData.villeDepart);
    expect(res.body.trip).to.have.property('conducteur', chauffeurId);
  });

  it('ne devrait pas permettre à un passager de créer un trajet', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${passagerToken}`)
      .send(tripData);

    expect(res.statusCode).to.equal(403);
    expect(res.body).to.have.property('message', "Accès non autorisé : rôle insuffisant.");
  });

  it('ne devrait pas permettre de créer un trajet avec des données invalides', async () => {
    const invalidTripData = { ...tripData, placesDisponibles: 0, prix: -100 }; // Places invalides, prix négatif
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${chauffeurToken}`)
      .send(invalidTripData);

    expect(res.statusCode).to.equal(400);
    expect(res.body.errors).to.be.an('array').with.lengthOf(2);
  });

  it('devrait récupérer une liste de trajets', async () => {
    // Créer un trajet pour le test
    await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${chauffeurToken}`)
      .send(tripData);

    const res = await request(app).get('/api/trips');

    expect(res.statusCode).to.equal(200);
    expect(res.body.trips).to.be.an('array').with.lengthOf(1);
    expect(res.body.trips[0]).to.have.property('villeDepart', tripData.villeDepart);
    expect(res.body.trips[0]).to.have.property('conducteur');
    expect(res.body.trips[0].conducteur).to.have.property('nom', chauffeurData.nom); // Populated
  });

  it('devrait récupérer un trajet par son ID', async () => {
    // Créer un trajet
    const createRes = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${chauffeurToken}`)
      .send(tripData);
    const tripId = createRes.body.trip._id;

    const res = await request(app).get(`/api/trips/${tripId}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body.trip).to.have.property('_id', tripId);
    expect(res.body.trip).to.have.property('villeDepart', tripData.villeDepart);
    expect(res.body.trip).to.have.property('conducteur');
    expect(res.body.trip.conducteur).to.have.property('nom', chauffeurData.nom);
  });

  it('ne devrait pas récupérer un trajet avec un ID inexistant', async () => {
    const res = await request(app).get('/api/trips/60c72b2f9b1f8c1b3c8e4d5f'); // ID bidon valide format
    expect(res.statusCode).to.equal(404);
    expect(res.body).to.have.property('message', 'Trajet non trouvé.');
  });

  it('devrait filtrer les trajets par ville de départ et d\'arrivée', async () => {
    await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${chauffeurToken}`)
      .send(tripData); // Douala -> Yaoundé

    const trip2Data = {
      ...tripData,
      villeDepart: 'Yaoundé',
      villeArrivee: 'Douala',
      dateDepart: new Date(Date.now() + 86400000 * 3).toISOString(), // Un jour après le premier
    };
    await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${chauffeurToken}`)
      .send(trip2Data); // Yaoundé -> Douala

    const res = await request(app).get(`/api/trips?villeDepart=${tripData.villeDepart}&villeArrivee=${tripData.villeArrivee}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body.trips).to.be.an('array').with.lengthOf(1);
    expect(res.body.trips[0]).to.have.property('villeDepart', tripData.villeDepart);
    expect(res.body.trips[0]).to.have.property('villeArrivee', tripData.villeArrivee);
  });

  it('devrait filtrer les trajets par date de départ', async () => {
    const specificDate = new Date(Date.now() + 86400000 * 5); // Dans 5 jours
    const tripDateFormatted = specificDate.toISOString().split('T')[0]; // YYYY-MM-DD

    const tripOnSpecificDate = {
      ...tripData,
      dateDepart: specificDate.toISOString(),
    };
    await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${chauffeurToken}`)
      .send(tripOnSpecificDate);

    // Un autre trajet pour une date différente
    await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${chauffeurToken}`)
      .send({ ...tripData, dateDepart: new Date(Date.now() + 86400000 * 6).toISOString() });

    const res = await request(app).get(`/api/trips?dateDepart=${tripDateFormatted}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body.trips).to.be.an('array').with.lengthOf(1);
    const retrievedDate = new Date(res.body.trips[0].dateDepart);
    expect(retrievedDate.toISOString().split('T')[0]).to.equal(tripDateFormatted);
  });

  it('ne devrait pas retourner les trajets passés', async () => {
    const pastTripData = {
      ...tripData,
      dateDepart: new Date(Date.now() - 86400000).toISOString(), // Hier
    };
    await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${chauffeurToken}`)
      .send(pastTripData);

    const res = await request(app).get('/api/trips');

    expect(res.statusCode).to.equal(200);
    expect(res.body.trips).to.be.an('array').with.lengthOf(0); // Le trajet passé ne doit pas apparaître
  });
});
