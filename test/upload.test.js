// test/upload.test.js
const request = require('supertest');
const { expect } = require('chai');
const { app } = require('./test_helper');

describe('API d\'Upload', () => {
  let userToken;

  beforeEach(async () => {
    // Créer un utilisateur et obtenir son token pour les tests
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nom: 'Uploader', email: 'uploader@test.com', motDePasse: 'password123' });
    userToken = res.body.accessToken;
  });

  it('devrait générer une signature Cloudinary pour un utilisateur authentifié', async () => {
    const res = await request(app)
      .post('/api/uploads/generate-signature')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('signature').that.is.a('string');
    expect(res.body).to.have.property('timestamp').that.is.a('number');
    expect(res.body).to.have.property('apiKey', process.env.CLOUDINARY_API_KEY);
    expect(res.body).to.have.property('cloudName', process.env.CLOUDINARY_CLOUD_NAME);
  });

  it('ne devrait pas générer de signature pour un utilisateur non authentifié', async () => {
    const res = await request(app)
      .post('/api/uploads/generate-signature');

    expect(res.statusCode).to.equal(401);
  });
});