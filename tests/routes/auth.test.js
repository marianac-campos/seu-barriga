const request = require('supertest');
const app = require('../../src/app');

const EMAIL = `${Date.now()}@gmail.com`;
const PASSWORD = '123456';
const MAIN_ROUTE = '/auth/signin';

it('should create an user via signup', () => {
  return request(app).post('/auth/signup').send({ name: 'Walter White', email: EMAIL, password: PASSWORD })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', 'Walter White');
      expect(res.body).toHaveProperty('email', EMAIL);
      expect(res.body).not.toHaveProperty('password');
    });
});

it('should authenticate the user and return the token', () => {
  return request(app).post(MAIN_ROUTE).send({ email: EMAIL, password: PASSWORD })
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
});

it('should not authenticate the user with the wrong password', () => {
  return request(app).post(MAIN_ROUTE).send({ email: EMAIL, password: '1234' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid login and/or password');
    });
});

it('should not authenticate user that does not exist', () => {
  return request(app).post(MAIN_ROUTE).send({ email: 'email@email.com', password: PASSWORD })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid login and/or password');
    });
});

it('should not access a protected route without token', () => {
  return request(app).get('/users')
    .then((res) => {
      expect(res.status).toBe(401);
    });
});
