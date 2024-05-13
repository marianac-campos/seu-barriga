const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/accounts';
let user;

beforeAll(async () => {
  const res = await app.services.user.save({
    name: 'Demi Lovato',
    email: `${Date.now()}@email.com`,
    password: 'passwordsecret',
  });

  user = { ...res[0] };
});

it('should insert a account with success', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ name: 'John Doe', user_id: user.id })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', 'John Doe');
    });
});

it('should to list all accounts', () => {
  return app.db('accounts').insert({ name: 'Acc List', user_id: user.id })
    .then(() => request(app).get(MAIN_ROUTE))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

it('should to return a account by id', () => {
  return app.db('accounts')
    .insert({ name: 'Acc Id', user_id: user.id }, ['id'])
    .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user_id', user.id);
      expect(res.body).toHaveProperty('name', 'Acc Id');
    });
});
