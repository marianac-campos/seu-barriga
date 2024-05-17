const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/users';
const email = `${Date.now()}@email.com`;
let user;

beforeAll(async () => {
  const res = await app.services.user.save({
    name: 'Demi Lovato',
    email: `${Date.now()}@email.com`,
    password: 'passwordsecret',
  });

  user = { ...res[0] };
  user.token = jwt.encode(user, 'Segredo!');
});

it('should to list all users', () => {
  return request(app).get(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

it('should insert a user with success', () => {
  return request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ name: 'John Doe', email, password: '1234' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', 'John Doe');
      expect(res.body).not.toHaveProperty('password');
    });
});

it('should need to cryptocrated the password', async () => {
  const res = await request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ name: 'John Doe', email, password: '1234' });

  const result = await app.services.user.findOne(res.body.id);

  expect(result.password).not.toBe('1234');
});

it('should return an error when name is not defined', () => {
  return request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ email, password: '1234' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Name is a mandatory attribute!');
    });
});

it('should return an error when email is not defined', () => {
  return request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ name: 'John Doe', password: '1234' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email is a mandatory attribute!');
    });
});

it('should return an error when password is not defined', () => {
  return request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ name: 'John Doe', email })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Password is a mandatory attribute!');
    });
});

it('should return an error when user already created', () => {
  return request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ name: 'John Doe', email, password: '1234' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User already created!');
    });
});
