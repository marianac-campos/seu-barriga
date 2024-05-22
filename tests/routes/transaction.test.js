const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transactions';
let user;
let user2;
let accUser;
let accUser2;

beforeAll(async () => {
  await app.db('transactions').del();
  await app.db('accounts').del();
  await app.db('users').del();

  const users = await app.db('users').insert([
    { name: 'User #1', email: 'user@email.com', password: '$2a$10$WRkRYEUgs0hg1ZgPW5A0Due3YJR4cKVM8sG6qHhf7tjzvEeziOuXO' },
    { name: 'User #2', email: 'user2@email.com', password: '$2a$10$WRkRYEUgs0hg1ZgPW5A0Due3YJR4cKVM8sG6qHhf7tjzvEeziOuXO' },
  ], '*');

  [user, user2] = users;
  delete user.password;

  user.token = jwt.encode(user, 'Segredo!');

  const accs = await app.db('accounts').insert([
    { name: 'Acc #1', user_id: user.id },
    { name: 'Acc #2', user_id: user2.id },
  ], '*');

  [accUser, accUser2] = accs;
});

it('should list only user transactions', () => {
  return app.db('transactions').insert([
    { description: 'T1', date: new Date(), amount: 100, type: 'I', acc_id: accUser.id },
    { description: 'T2', date: new Date(), amount: 450, type: 'I', acc_id: accUser2.id },
  ]).then(() => request(app).get(MAIN_ROUTE).set('Authorization', `Bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe('T1');
    });
});

it('should insert a trasaction with success', () => {
  return request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ description: 'New T', date: new Date(), amount: 176, type: 'I', acc_id: accUser2.id })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body[0].acc_id).toBe(accUser2.id);
      expect(res.body[0].amount).toBe('176.00');
    });
});

it('transações de entrada devem ser positivas', () => {
  return request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ description: 'New T', date: new Date(), amount: -176, type: 'I', acc_id: accUser2.id })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body[0].acc_id).toBe(accUser2.id);
      expect(res.body[0].amount).toBe('176.00');
    });
});

it('transações de entrada devem ser negativas', () => {
  return request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ description: 'New T', date: new Date(), amount: 176, type: 'O', acc_id: accUser2.id })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body[0].acc_id).toBe(accUser2.id);
      expect(res.body[0].amount).toBe('-176.00');
    });
});

describe('inserir transação inválida', () => {
  const testTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ description: 'New T', date: new Date(), amount: 176, type: 'O', acc_id: accUser.id, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', errorMessage);
      });
  };

  it('não deve criar transação sem descrição', () => testTemplate({ description: undefined }, 'Description is a mandatory attribute!'));
  it('não deve criar transação sem data', () => testTemplate({ date: null }, 'Date is a mandatory attribute!'));
  it('não deve criar transação sem valor', () => testTemplate({ amount: null }, 'Amount is a mandatory attribute!'));
  it('não deve criar transação sem conta', () => testTemplate({ acc_id: null }, 'AccountID is a mandatory attribute!'));
  it('não deve criar transação sem tipo', () => testTemplate({ type: null }, 'Type is a mandatory attribute!'));
  it('não deve criar transação com tipo inválido', () => testTemplate({ type: 'L' }, 'Invalid Type!'));
});

it('should return a transaction by id', () => {
  return app.db('transactions')
    .insert(
      { description: 'New T', date: new Date(), amount: 235, type: 'I', acc_id: accUser.id },
      ['id'],
    )
    .then((res) => request(app).get(`${MAIN_ROUTE}/${res[0].id}`)
      .set('Authorization', `Bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('description', 'New T');
    });
});

it('should to update a transaction with success', () => {
  return app.db('transactions')
    .insert({ description: 'Update T', date: new Date(), amount: 235, type: 'I', acc_id: accUser.id }, ['id'])
    .then((res) => request(app).put(`${MAIN_ROUTE}/${res[0].id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ description: 'Update T' }))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('description', 'Update T');
    });
});

it('should to delete a transaction with success', () => {
  return app.db('transactions')
    .insert({ description: 'Delete T', date: new Date(), amount: 235, type: 'I', acc_id: accUser.id }, ['id'])
    .then((res) => request(app).delete(`${MAIN_ROUTE}/${res[0].id}`)
      .set('Authorization', `Bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(204);
    });
});

it('should not to delete a transaction other user', () => {
  return app.db('transactions')
    .insert({ description: 'Delete T', date: new Date(), amount: 235, type: 'I', acc_id: accUser2.id }, ['id'])
    .then((res) => request(app).delete(`${MAIN_ROUTE}/${res[0].id}`)
      .set('Authorization', `Bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'You are not allowed to do this');
    });
});
