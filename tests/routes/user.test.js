const request = require('supertest');
const app = require('../../src/app');

const email = `${Date.now()}@email.com`;

it('should to list all users', () => {
  return request(app).get('/users')
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

it('should insert a user with success', () => {
  return request(app).post('/users')
    .send({ name: 'John Doe', email, password: '1234' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', 'John Doe');
    });
});

it('should return an error when name is not defined', () => {
  return request(app).post('/users')
    .send({ email, password: '1234' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Name is a mandatory attribute!');
    });
});

it('should return an error when email is not defined', () => {
  return request(app).post('/users')
    .send({ name: 'John Doe', password: '1234' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email is a mandatory attribute!');
    });
});

it('should return an error when password is not defined', () => {
  return request(app).post('/users')
    .send({ name: 'John Doe', email })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Password is a mandatory attribute!');
    });
});

it('should insert a user with success', () => {
  return request(app).post('/users')
    .send({ name: 'John Doe', email, password: '1234' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User already created!');
    });
});
