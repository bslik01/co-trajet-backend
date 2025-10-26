// test/trip.test.js
const request = require('supertest');
const { expect } = require('chai');
const { app } = require('./test_helper');
const Trip = require('../src/models/Trip.model');

describe('API des Trajets', () => {
  let chauffeurToken, chauffeurId, passagerToken;
  const tripData = {
    villeDepart: 'Douala',
    villeArrivee: 'Yaoundé',
    dateDepart: new Date(Date.now() + 86400000 * 2).toISOString(),
    placesDisponibles: 3,
    prix: 5000,
  };

  // Le beforeEach simule maintenant le flux complet d'approbation d'un chauffeur.
  beforeEach(async () => {
    // 1. Connexion de l'admin
    const adminRes = await request(app).post('/api/auth/login').send({
      email: process.env.DEFAULT_ADMIN_EMAIL, motDePasse: process.env.DEFAULT_ADMIN_PASSWORD,
    });
    const adminToken = adminRes.body.accessToken;

    // 2. Création du futur chauffeur et du passager
    let chauffeurRes = await request(app).post('/api/auth/register').send({
      nom: 'Chauffeur Approuvé', email: 'chauffeur@test.com', motDePasse: 'password123',
    });
    chauffeurToken = chauffeurRes.body.accessToken;
    chauffeurId = chauffeurRes.body.user.id;
    
    const passagerRes = await request(app).post('/api/auth/register').send({
      nom: 'Simple Passager', email: 'passager@test.com', motDePasse: 'password123',
    });
    passagerToken = passagerRes.body.accessToken;

    // 3. Le futur chauffeur soumet sa demande
    const applicationData = {
      identityDocuments: {
        idCard: { url: 'http://cloudinary.com/idcard.jpg' },
        driverLicense: { url: 'http://cloudinary.com/license.jpg' },
        profilePicture: { url: 'http://cloudinary.com/profile.jpg' },
      },
      vehicleDetails: {
        make: 'Toyota',
        model: 'Yaris',
        year: 2020,
        color: 'Grise',
        licensePlate: 'LT 123 AB',
      },
      vehicleDocuments: {
        vehicleRegistration: { url: 'http://cloudinary.com/registration.jpg' },
        technicalInspection: { url: 'http://cloudinary.com/inspection.jpg' },
        insuranceCertificate: { url: 'http://cloudinary.com/insurance.jpg' },
        vehiclePictureFront: { url: 'http://cloudinary.com/front.jpg' },
        vehiclePictureSide: { url: 'http://cloudinary.com/side.jpg' },
      },
    };
    await request(app).post('/api/users/become-chauffeur').set('Authorization', `Bearer ${chauffeurToken}`).send(applicationData);

    // 4. L'admin approuve tous les documents et active le profil
    const documentsToApprove = [
      'identityDocuments.idCard', 'identityDocuments.driverLicense', 'identityDocuments.profilePicture',
      'vehicleDocuments.vehicleRegistration', 'vehicleDocuments.technicalInspection', 'vehicleDocuments.insuranceCertificate',
      'vehicleDocuments.vehiclePictureFront', 'vehicleDocuments.vehiclePictureSide'
    ];
    for (const docPath of documentsToApprove) {
      await request(app).put(`/api/admin/chauffeur-requests/${chauffeurId}/documents`)
        .set('Authorization', `Bearer ${adminToken}`).send({ documentPath: docPath, status: 'approved' });
    }
    let r = await request(app).put(`/api/admin/chauffeur-requests/${chauffeurId}/activate`).set('Authorization', `Bearer ${adminToken}`);

    // 5. Connexion du chauffeur validé
    chauffeurRes = await request(app).post('/api/auth/login').send({
      email: 'chauffeur@test.com', motDePasse: 'password123',
    });
    chauffeurToken = chauffeurRes.body.accessToken;
  });

  it('devrait permettre à un chauffeur vérifié de créer un trajet', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${chauffeurToken}`)
      .send(tripData);

    expect(res.statusCode).to.equal(201);
    expect(res.body.trip).to.have.property('villeDepart', tripData.villeDepart);
  });

  it('ne devrait pas permettre à un simple passager de créer un trajet', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${passagerToken}`)
      .send(tripData);

    expect(res.statusCode).to.equal(403);
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
    expect(res.body.trips[0].conducteur).to.have.property('nom', 'Chauffeur Approuvé');
  });

  it('devrait récupérer un trajet par son ID', async () => {
    // Créer un trajet
    const createRes = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${chauffeurToken}`)
      .send(tripData);
    const tripId = createRes.body.trip._id;

    const res = await request(app)
      .get(`/api/trips/${tripId}`)
      .set('Authorization', `Bearer ${passagerToken}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body.trip).to.have.property('_id', tripId);
    expect(res.body.trip).to.have.property('villeDepart', tripData.villeDepart);
    expect(res.body.trip).to.have.property('conducteur');
    expect(res.body.trip.conducteur).to.have.property('nom', 'Chauffeur Approuvé');
  });

  it('ne devrait pas récupérer un trajet avec un ID inexistant', async () => {
    const res = await request(app)
      .get('/api/trips/60c72b2f9b1f8c1b3c8e4d5f') // ID bidon valide format
      .set('Authorization', `Bearer ${passagerToken}`);
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
