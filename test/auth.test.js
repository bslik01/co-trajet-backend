// test/auth.test.js
const request = require('supertest');
const { expect } = require('chai');
const { app } = require('./test_helper'); // Importe l'app Express et configure la DB de test

describe('Auth API', () => {
  const userCredentials = {
    nom: 'Test User',
    email: 'test@example.com',
    motDePasse: 'password123',
  };

  const adminCredentials = {
    nom: process.env.DEFAULT_ADMIN_NOM,
    email: process.env.DEFAULT_ADMIN_EMAIL,
    motDePasse: process.env.DEFAULT_ADMIN_PASSWORD,
  };
  
  beforeEach(async () => {
    // Connecter l'admin par défaut (qui est créé par test_helper)
    const resAdmin = await request(app)
      .post('/api/auth/login')
      .send({ email: adminCredentials.email, motDePasse: adminCredentials.motDePasse });
  });

  // Test d'inscription
  it('devrait permettre à un utilisateur de s\'inscrire', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userCredentials);

    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property('token');
    expect(res.body.user).to.have.property('email', userCredentials.email);
    expect(res.body.user).to.have.property('role', 'passager');
    expect(res.body.user).to.have.property('isChauffeurVerified', false);
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
    expect(res.body).to.have.property('token');
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
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: adminCredentials.email, motDePasse: adminCredentials.motDePasse });

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('token');
    expect(res.body.user).to.have.property('email', adminCredentials.email);
    expect(res.body.user).to.have.property('role', 'admin');
  });
});
