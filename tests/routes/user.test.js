const request = require('supertest');
const app = require('../../src/app');

it('should to list all users', () => {
  return request(app).get('/users')
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

it('should insert a user with success', () => {
  const email = `${Date.now()}@email.com`;
  return request(app).post('/users')
    .send({ name: 'New User', email, password: '1234' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', 'New User');
    });
});
