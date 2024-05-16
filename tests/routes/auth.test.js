const request = require('supertest');
const app = require('../../src/app');

const EMAIL = `${Date.now()}@gmail.com`;
const PASSWORD = '123456';
const MAIN_ROUTE = '/auth/signin';

it('should authenticate the user and return the token', () => {
  return app.services.user.save({ name: 'Walter White', email: EMAIL, password: PASSWORD })
    .then(() => request(app).post(MAIN_ROUTE).send({ email: EMAIL, password: PASSWORD }))
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
