const request = require('supertest');
const app = require('../server'); 
const db = require('../config/db.config');

beforeAll(async () => {
  await db.sequelize.sync({ force: true }); 
});

describe('Identity Checkpoint Tests', () => {
  it('should accept an identity with new email and phone', async () => {
    const res = await request(app).post('/identify').send({
      email: "stealth@user.com",
      phoneNumber: "9991112222"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.contact.primaryContactId).toBeDefined();
    expect(res.body.contact.emails).toContain("stealth@user.com");
    expect(res.body.contact.phoneNumbers).toContain("9991112222");
  });

  it('should link identities if phone matches existing contact', async () => {
    await request(app).post('/identify').send({
      email: "shadow@domain.com",
      phoneNumber: "9991112222"
    });

    const res = await request(app).post('/identify').send({
      email: "shadow@domain.com",
      phoneNumber: "9991112222"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.contact.emails).toContain("shadow@domain.com");
    expect(res.body.contact.phoneNumbers).toContain("9991112222");
    expect(res.body.contact.secondaryContactIds.length).toBeGreaterThanOrEqual(1);
  });

  it('should reject completely missing input fields', async () => {
    const res = await request(app).post('/identify').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid identity signature.");
  });
});

afterAll(async () => {
  await db.sequelize.close();
});