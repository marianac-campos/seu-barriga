const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/accounts';
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

it('should insert a account with success', () => {
  return request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ name: 'John Doe', user_id: user.id })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', 'John Doe');
    });
});

it('should return an error when name is not defined', () => {
  return request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ user_id: user.id })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Name is a mandatory attribute!');
    });
});

it('should to list all accounts', () => {
  return app.db('accounts').insert({ name: 'Acc List', user_id: user.id })
    .then(() => request(app).get(MAIN_ROUTE)
      .set('Authorization', `Bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

it('should to return a account by id with success', () => {
  return app.db('accounts')
    .insert({ name: 'Acc Id', user_id: user.id }, ['id'])
    .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('Authorization', `Bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user_id', user.id);
      expect(res.body).toHaveProperty('name', 'Acc Id');
    });
});

it('should to update a account with success', () => {
  return app.db('accounts')
    .insert({ name: 'Acc Update', user_id: user.id }, ['id'])
    .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ name: 'Acc Updated' }))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Acc Updated');
    });
});

it('should to delete a account with success', () => {
  return app.db('accounts')
    .insert({ name: 'Acc Delete', user_id: user.id }, ['id'])
    .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('Authorization', `Bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(204);
    });
});
