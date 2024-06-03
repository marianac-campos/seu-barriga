const request = require('supertest');
const moment = require('moment');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/balances';
const ROUTE_TRANSACTION = '/v1/transactions';
const ROUTE_TRANSFER = '/v1/transfers';
const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxMDEsIm5hbWUiOiJUaGlyZCBVc2VyIiwiZW1haWwiOiJ1c2VyXzAzQGVtYWlsLmNvbSJ9.UHdKMsRiKWvqn--CKrgB9jlJsuh9FvcnVmfo4Jtnozw';

beforeAll(() => {
  return app.db.seed.run();
});

describe('Ao calcular o saldo do usuário...', () => {
  it('deve retornar apenas as contas com alguma transação', () => {
    return request(app).get(MAIN_ROUTE).set('Authorization', TOKEN)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
      });
  });

  it('deve adicionar valores de entrada', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .set('Authorization', TOKEN)
      .send({
        description: 'T1',
        date: new Date(),
        amount: 100,
        type: 'I',
        acc_id: 10101,
        status: true,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE).set('Authorization', TOKEN)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(10101);
            expect(res.body[0].sum).toBe('100.00');
          });
      });
  });

  it('deve subtrair valores de saída', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .set('Authorization', TOKEN)
      .send({
        description: 'T1',
        date: new Date(),
        amount: 200,
        type: 'O',
        acc_id: 10101,
        status: true,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE).set('Authorization', TOKEN)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(10101);
            expect(res.body[0].sum).toBe('-100.00');
          });
      });
  });

  it('não deve considerar transação pendente', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .set('Authorization', TOKEN)
      .send({
        description: 'T1',
        date: new Date(),
        amount: 200,
        type: 'O',
        acc_id: 10101,
        status: false,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE).set('Authorization', TOKEN)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(10101);
            expect(res.body[0].sum).toBe('-100.00');
          });
      });
  });

  it('não deve considerar saldo de contas distintas', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .set('Authorization', TOKEN)
      .send({
        description: 'T1',
        date: new Date(),
        amount: 50,
        type: 'I',
        acc_id: 10102,
        status: true,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE).set('Authorization', TOKEN)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10101);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(10102);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });

  it('não deve considerar contas de outros usuários', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .set('Authorization', TOKEN)
      .send({
        description: 'T1',
        date: new Date(),
        amount: 200,
        type: 'I',
        acc_id: 10103,
        status: true,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE).set('Authorization', TOKEN)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10101);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(10102);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });

  it('deve considerar transação passada', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .set('Authorization', TOKEN)
      .send({
        description: 'T1',
        date: moment().subtract({ days: 5 }),
        amount: 250,
        type: 'I',
        acc_id: 10101,
        status: true,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE).set('Authorization', TOKEN)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10101);
            expect(res.body[0].sum).toBe('150.00');
            expect(res.body[1].id).toBe(10102);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });

  it('não deve considerar transação futura', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .set('Authorization', TOKEN)
      .send({
        description: 'T1',
        date: moment().add({ days: 5 }),
        amount: 250,
        type: 'I',
        acc_id: 10101,
        status: true,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE).set('Authorization', TOKEN)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10101);
            expect(res.body[0].sum).toBe('150.00');
            expect(res.body[1].id).toBe(10102);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });

  it('deve considerar transferências', () => {
    return request(app).post(ROUTE_TRANSFER)
      .set('Authorization', TOKEN)
      .send({
        description: 'T1',
        date: new Date(),
        amount: 250,
        acc_ori_id: 10101,
        acc_dest_id: 10102,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE).set('Authorization', TOKEN)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10101);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(10102);
            expect(res.body[1].sum).toBe('300.00');
          });
      });
  });
});
