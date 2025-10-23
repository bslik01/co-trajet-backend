// test/chauffeur_flow.test.js
const request = require('supertest');
const { expect } = require('chai');
const { app } = require('./test_helper');
const User = require('../src/models/User.model');

describe('Flux de Demande Chauffeur', () => {
  let passengerToken;
  let passengerId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nom: 'Future Chauffeur', email: 'passenger@test.com', motDePasse: 'password123' });
    passengerToken = res.body.token;
    passengerId = res.body.user.id;
  });

  it('devrait permettre à un passager de soumettre une demande complète pour devenir chauffeur', async () => {
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

    const res = await request(app)
      .post('/api/users/become-chauffeur')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send(applicationData);
    
    expect(res.statusCode).to.equal(200);
    expect(res.body.message).to.equal('Demande soumise avec succès. Elle sera examinée prochainement.');
    
    // Vérifier en base de données que les informations sont bien enregistrées
    const userInDb = await User.findById(passengerId);
    expect(userInDb.chauffeurProfile.requestStatus).to.equal('pending');
    expect(userInDb.chauffeurProfile.vehicleDetails.make).to.equal('Toyota');
    expect(userInDb.chauffeurProfile.identityDocuments.idCard.url).to.equal('http://cloudinary.com/idcard.jpg');
    expect(userInDb.chauffeurProfile.identityDocuments.idCard.status).to.equal('pending');
  });

  it('ne devrait pas permettre de soumettre une demande si l\'utilisateur est déjà un chauffeur vérifié', async () => {
    // Mettre à jour manuellement l'utilisateur pour simuler un chauffeur vérifié
    await User.findByIdAndUpdate(passengerId, { $set: { isChauffeurVerified: true } });
    
    const res = await request(app)
      .post('/api/users/become-chauffeur')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({}); // Les données n'importent pas

    expect(res.statusCode).to.equal(400);
    expect(res.body.message).to.equal('Vous êtes déjà un chauffeur vérifié.');
  });
});
