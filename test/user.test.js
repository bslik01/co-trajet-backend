// test/user.test.js
const request = require('supertest');
const { expect } = require('chai');
const { app } = require('./test_helper');
const User = require('../src/models/User.model');

describe('User API', () => {
  let userToken, userId, adminToken, adminId;
  const userData = { nom: 'Passenger User', email: 'passenger@test.com', motDePasse: 'password123' };
  const chauffeurRequestData = {
    permisConduireUrl: 'http://docs.com/permis.jpg',
    carteGriseUrl: 'http://docs.com/carte.pdf',
  };

  beforeEach(async () => {
    // Créer un utilisateur standard
    const resUser = await request(app).post('/api/auth/register').send(userData);
    userToken = resUser.body.token;
    userId = resUser.body.user.id;

    // Connecter l'admin par défaut (qui est créé par test_helper)
    const resAdmin = await request(app)
      .post('/api/auth/login')
      .send({
        email: process.env.DEFAULT_ADMIN_EMAIL,
        motDePasse: process.env.DEFAULT_ADMIN_PASSWORD,
      });
    adminToken = resAdmin.body.token;
    adminId = resAdmin.body.user.id;
  });

  it('devrait récupérer le profil de l\'utilisateur connecté', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body.user).to.have.property('email', userData.email);
    expect(res.body.user).to.not.have.property('motDePasseHash');
  });

  it('ne devrait pas récupérer le profil si non authentifié', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.statusCode).to.equal(401);
  });

  it('devrait permettre à un passager de soumettre une demande de statut chauffeur', async () => {
    const res = await request(app)
      .put('/api/users/become-chauffeur')
      .set('Authorization', `Bearer ${userToken}`)
      .send(chauffeurRequestData);

    expect(res.statusCode).to.equal(200);
    expect(res.body.message).to.include('Demande de statut chauffeur soumise avec succès.');
    expect(res.body.user.chauffeurRequestStatus).to.equal('pending');
    expect(res.body.user.permisConduireUrl).to.equal(chauffeurRequestData.permisConduireUrl);
  });

  it('ne devrait pas permettre à un passager de soumettre une demande avec des URLs invalides', async () => {
    const res = await request(app)
      .put('/api/users/become-chauffeur')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ permisConduireUrl: 'invalid-url', carteGriseUrl: 'invalid-url' });

    expect(res.statusCode).to.equal(400);
    expect(res.body.errors).to.be.an('array');
  });

  it('devrait permettre à l\'admin de voir les demandes de chauffeur en attente', async () => {
    // Un passager soumet une demande
    await request(app)
      .put('/api/users/become-chauffeur')
      .set('Authorization', `Bearer ${userToken}`)
      .send(chauffeurRequestData);

    const res = await request(app)
      .get('/api/admin/chauffeur-requests')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body.requests).to.be.an('array').with.lengthOf(1);
    expect(res.body.requests[0]).to.have.property('email', userData.email);
    expect(res.body.requests[0]).to.have.property('chauffeurRequestStatus', 'pending');
  });

  it('devrait permettre à l\'admin d\'approuver une demande de chauffeur', async () => {
    // Un passager soumet une demande
    await request(app)
      .put('/api/users/become-chauffeur')
      .set('Authorization', `Bearer ${userToken}`)
      .send(chauffeurRequestData);

    const res = await request(app)
      .put(`/api/admin/chauffeur-requests/${userId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body.message).to.include('a été approuvé.');
    expect(res.body.user.role).to.equal('chauffeur');
    expect(res.body.user.isChauffeurVerified).to.be.true;
    expect(res.body.user.chauffeurRequestStatus).to.equal('approved');
  });

  it('devrait permettre à l\'admin de rejeter une demande de chauffeur', async () => {
    // Un passager soumet une demande
    await request(app)
      .put('/api/users/become-chauffeur')
      .set('Authorization', `Bearer ${userToken}`)
      .send(chauffeurRequestData);

    const rejectMessage = 'Documents illisibles.';
    const res = await request(app)
      .put(`/api/admin/chauffeur-requests/${userId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ chauffeurRequestMessage: rejectMessage });

    expect(res.statusCode).to.equal(200);
    expect(res.body.message).to.include('a été rejetée.');
    expect(res.body.user.role).to.equal('passager'); // Le rôle reste passager
    expect(res.body.user.isChauffeurVerified).to.be.false;
    expect(res.body.user.chauffeurRequestStatus).to.equal('rejected');
    expect(res.body.user.chauffeurRequestMessage).to.equal(rejectMessage);
  });
});
