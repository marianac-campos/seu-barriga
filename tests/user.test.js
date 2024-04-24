const request = require('supertest');
const app = require('../src/app');

it('should to list all users', () => {
  return request(app).get('/users')
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('name', 'John Doe');
    });
});

it('should insert a user with success', () => {
  return request(app).post('/users')
    .send({ name: 'New User', email: 'newuser@email.com' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', 'New User');
    });
});
