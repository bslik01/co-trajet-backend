// test/admin.test.js
const request = require('supertest');
const { expect } = require('chai');
const { app } = require('./test_helper');
const User = require('../src/models/User.model');

describe('API de Gestion Administrateur', () => {
  let adminToken;
  let passengerToken;
  let passengerId;
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

  beforeEach(async () => {
    // Connexion de l'admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.DEFAULT_ADMIN_EMAIL, motDePasse: process.env.DEFAULT_ADMIN_PASSWORD });
    adminToken = adminRes.body.token;

    // Création d'un passager qui soumet une demande
    const passengerRes = await request(app)
      .post('/api/auth/register')
      .send({ nom: 'Applicant User', email: 'applicant@test.com', motDePasse: 'password123' });
    passengerToken = passengerRes.body.token;
    passengerId = passengerRes.body.user.id;

    await request(app)
      .post('/api/users/become-chauffeur')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send(applicationData);
  });

  it('devrait permettre à un admin de lister les demandes en attente', async () => {
    const res = await request(app)
      .get('/api/admin/chauffeur-requests')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body.requests).to.be.an('array').with.lengthOf(1);
    expect(res.body.requests[0]._id).to.equal(passengerId);
    expect(res.body.requests[0].chauffeurProfile.requestStatus).to.equal('pending');
  });

  it('devrait permettre à un admin de rejeter un document et passer le statut à "needs_revision"', async () => {
    const reviewData = {
      documentPath: 'identityDocuments.idCard',
      status: 'rejected',
      reason: 'La photo est floue.'
    };

    const res = await request(app)
      .put(`/api/admin/chauffeur-requests/${passengerId}/documents`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(reviewData);
    
    expect(res.statusCode).to.equal(200);

    const userInDb = await User.findById(passengerId);
    expect(userInDb.chauffeurProfile.requestStatus).to.equal('needs_revision');
    expect(userInDb.chauffeurProfile.identityDocuments.idCard.status).to.equal('rejected');
    expect(userInDb.chauffeurProfile.identityDocuments.idCard.rejectionReason).to.equal('La photo est floue.');
  });
  
  it('devrait empêcher l\'activation si tous les documents ne sont pas approuvés', async () => {
    // Approuver seulement un document
    await request(app)
      .put(`/api/admin/chauffeur-requests/${passengerId}/documents`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ documentPath: 'identityDocuments.idCard', status: 'approved' });

    const res = await request(app)
      .put(`/api/admin/chauffeur-requests/${passengerId}/activate`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).to.equal(400);
    expect(res.body.message).to.contain('Tous les documents doivent être approuvés');
  });

  it('devrait permettre à un admin d\'activer un profil chauffeur une fois tous les documents approuvés', async () => {
    // Approuver tous les documents un par un
    const documentsToApprove = [
      'identityDocuments.idCard', 'identityDocuments.driverLicense', 'identityDocuments.profilePicture',
      'vehicleDocuments.vehicleRegistration', 'vehicleDocuments.technicalInspection', 'vehicleDocuments.insuranceCertificate',
      'vehicleDocuments.vehiclePictureFront', 'vehicleDocuments.vehiclePictureSide'
    ];
    for (const docPath of documentsToApprove) {
      await request(app)
        .put(`/api/admin/chauffeur-requests/${passengerId}/documents`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ documentPath: docPath, status: 'approved' });
    }

    // Activer le profil
    const res = await request(app)
      .put(`/api/admin/chauffeur-requests/${passengerId}/activate`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).to.equal(200);
    expect(res.body.message).to.equal('Profil chauffeur activé avec succès.');

    const userInDb = await User.findById(passengerId);
    expect(userInDb.role).to.equal('chauffeur');
    expect(userInDb.isChauffeurVerified).to.be.true;
    expect(userInDb.chauffeurProfile.requestStatus).to.equal('approved');
  });
});