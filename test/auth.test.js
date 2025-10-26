// test/auth.test.js
const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const { app } = require('./test_helper');
const User = require('../src/models/User.model');
const notificationService = require('../src/services/notification.service');

describe('API d\'Authentification Avancée', () => {
  let sendWelcomeEmailStub;
  const userCredentials = { nom: 'Test User', email: 'test@example.com', motDePasse: 'password123' };

  beforeEach(() => {
    // Crée un "stub" pour la méthode d'envoi d'email afin d'éviter de réels envois pendant les tests
    sendWelcomeEmailStub = sinon.stub(notificationService, 'sendWelcomeEmail');
  });

  afterEach(() => {
    // Restaure la méthode originale après chaque test
    sendWelcomeEmailStub.restore();
  });

  // Tests de tokens: L'inscription, la connexion, le rafraîchissement de token et la déconnexion
  it('devrait retourner un accessToken et un refreshToken à l\'inscription', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userCredentials);
      
    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property('accessToken');
    expect(res.body).to.have.property('refreshToken');
    
    const userInDb = await User.findOne({ email: userCredentials.email });
    expect(userInDb.refreshToken).to.equal(res.body.refreshToken);
  });

  it('devrait appeler le service de notification à l\'inscription', async () => {
    await request(app)
      .post('/api/auth/register')
      .send(userCredentials);
      
    // Vérifie que notre stub a été appelé exactement une fois
    expect(sendWelcomeEmailStub.calledOnce).to.be.true;
  });

  it('devrait retourner un accessToken et un refreshToken à la connexion', async () => {
    await request(app).post('/api/auth/register').send(userCredentials); // Crée l'utilisateur
    
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userCredentials.email, motDePasse: userCredentials.motDePasse });
      
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('accessToken');
    expect(res.body).to.have.property('refreshToken');
  });

  it('devrait générer un nouvel accessToken avec un refreshToken valide', async () => {
    const loginRes = await request(app).post('/api/auth/register').send(userCredentials);
    const refreshToken = loginRes.body.refreshToken;
    
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });
      
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('accessToken');
  });

  it('ne devrait pas générer de token avec un refreshToken invalide ou expiré', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'untokeninvalide' });
      
    expect(res.statusCode).to.equal(403);
  });

  it('devrait effacer le refreshToken de la base de données lors de la déconnexion', async () => {
    const loginRes = await request(app).post('/api/auth/register').send(userCredentials);
    const accessToken = loginRes.body.accessToken;
    const userId = loginRes.body.user.id;
    
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
      
    expect(res.statusCode).to.equal(200);
    
    const userInDb = await User.findById(userId);
    expect(userInDb.refreshToken).to.be.undefined;
  });

  // Test d'inscription
  it('devrait permettre à un utilisateur de s\'inscrire', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userCredentials);

    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property('accessToken');
    expect(res.body.user).to.have.property('email', userCredentials.email);
    expect(res.body.user).to.have.property('role', 'passager');
    expect(res.body.user).to.not.have.property('motDePasseHash'); // Ne devrait pas renvoyer le hash
  });

  it('ne devrait pas permettre à un utilisateur de s\'inscrire avec un e-mail existant', async () => {
    // Inscrivez l'utilisateur une première fois
    await request(app).post('/api/auth/register').send(userCredentials);

    // Tentez une deuxième inscription avec le même e-mail
    const res = await request(app)
      .post('/api/auth/register')
      .send(userCredentials);

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property('message', 'Un utilisateur avec cet e-mail existe déjà.');
  });

  it('ne devrait pas permettre l\'inscription avec des données invalides', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nom: 'Invalid', email: 'invalid-email', motDePasse: 'short' }); // Email invalide, mdp trop court

    expect(res.statusCode).to.equal(400);
    expect(res.body.errors).to.be.an('array');
    expect(res.body.errors.length).to.be.greaterThan(0);
  });

  // Test de connexion
  it('devrait permettre à un utilisateur de se connecter', async () => {
    // Inscription préalable
    await request(app).post('/api/auth/register').send(userCredentials);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userCredentials.email, motDePasse: userCredentials.motDePasse });

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('accessToken');
    expect(res.body.user).to.have.property('email', userCredentials.email);
    expect(res.body.user).to.have.property('role', 'passager');
  });

  it('ne devrait pas permettre la connexion avec des identifiants incorrects', async () => {
    await request(app).post('/api/auth/register').send(userCredentials); // Inscription
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userCredentials.email, motDePasse: 'wrongpassword' });

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property('message', 'Identifiants invalides.');
  });

  it('devrait créer l\'admin par défaut si aucun admin n\'existe', async () => {
    // Le test_helper vide la DB avant chaque test.
    // L'admin par défaut est créé au démarrage de l'app si `connectDB().then(() => { createDefaultAdmin(); });`
    // Pour ce test, il faut s'assurer que createDefaultAdmin est appelé *après* le nettoyage.
    // Ou, comme l'app est importée une fois, il faudrait simuler le démarrage de l'app.
    // Pour l'instant, on se base sur le fait que test_helper nettoie et createDefaultAdmin est appelé.
    // Plus simple : on essaie de se connecter avec l'admin par défaut.
    const res = await request(app).post('/api/auth/login').send({
      email: process.env.DEFAULT_ADMIN_EMAIL, motDePasse: process.env.DEFAULT_ADMIN_PASSWORD,
    });

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('accessToken');
    expect(res.body.user).to.have.property('email', process.env.DEFAULT_ADMIN_EMAIL);
    expect(res.body.user).to.have.property('role', 'admin');
  });
});
