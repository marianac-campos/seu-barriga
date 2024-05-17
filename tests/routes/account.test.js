const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/accounts';
let user;
let user2;

beforeEach(async () => {
  const res = await app.services.user.save({
    name: 'Demi Lovato',
    email: `${Date.now()}@email.com`,
    password: 'passwordsecret',
  });

  user = { ...res[0] };
  user.token = jwt.encode(user, 'Segredo!');

  const res2 = await app.services.user.save({
    name: 'Selena Gomez',
    email: `${Date.now()}@email.com`,
    password: 'passwordsecret',
  });

  user2 = { ...res2[0] };
});

it('should insert a account with success', () => {
  return request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ name: 'John Doe' })
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

it('should return an error if name is duplicated', () => {
  return app.db('accounts')
    .insert([{ name: 'Acc Create', user_id: user.id }])
    .then(() => request(app).post(MAIN_ROUTE).send({ name: 'Acc Create' })
      .set('Authorization', `Bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'An account with that name already exists');
    });
});

it('should only list user accounts', () => {
  return app.db('accounts')
    .insert([{ name: 'Acc List #1', user_id: user.id }, { name: 'Acc List #2', user_id: user2.id }])
    .then(() => request(app).get(MAIN_ROUTE)
      .set('Authorization', `Bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('name', 'Acc List #1');
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

it('should not return account que nao pertence', () => {
  return app.db('accounts')
    .insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
    .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('Authorization', `Bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'You are not allowed to do this');
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

it('nao deve alterar a conta de outro usuário', () => {
  return app.db('accounts')
    .insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
    .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ name: 'Acc Updated' }))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'You are not allowed to do this');
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

it('nao deve deletar a conta de outro usuário', () => {
  return app.db('accounts')
    .insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
    .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('Authorization', `Bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'You are not allowed to do this');
    });
});
