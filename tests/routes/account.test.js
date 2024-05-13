const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/accounts';
let user;

beforeAll(() => {
  const res = app.services.user.save({
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
