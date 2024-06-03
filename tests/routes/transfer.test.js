const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transfers';
const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDEsIm5hbWUiOiJGaXJzdCBVc2VyIiwiZW1haWwiOiJ1c2VyXzAxQGVtYWlsLmNvbSJ9.50VNk_CVDnG_oNH5GYC9JWv28GiKdcUSLLRtFjhMnf4';

beforeAll(() => {
  return app.db.seed.run();
});

it('should list only user transfers', () => {
  return request(app).get(MAIN_ROUTE).set('Authorization', TOKEN)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe('First Transfer');
    });
});

describe('When to save an valid transfer...', () => {
  let transferId;
  let income;
  let outcome;

  it('should return status 201 and transfer data', () => {
    return request(app).post(MAIN_ROUTE)
      .set('Authorization', TOKEN)
      .send({ description: 'Regular Transfer', user_id: 10001, acc_ori_id: 10001, acc_dest_id: 10002, date: new Date(), amount: 176 })
      .then(async (res) => {
        expect(res.status).toBe(201);
        expect(res.body[0].description).toBe('Regular Transfer');

        transferId = res.body[0].id;
      });
  });

  it('equivalent transactions should have been generated', () => {
    return app.db('transactions').where({ transfer_id: transferId }).orderBy('amount')
      .then((transactions) => {
        expect(transactions).toHaveLength(2);

        [outcome, income] = transactions;
      });
  });

  it('incoming transaction should be negative', () => {
    expect(outcome.type).toBe('O');
    expect(outcome.amount).toBe('-176.00');
    expect(outcome.description).toBe('Transfer To Account #10002');
    expect(outcome.acc_id).toBe(10001);
  });

  it('the incoming transaction should be positive', () => {
    expect(income.type).toBe('I');
    expect(income.amount).toBe('176.00');
    expect(income.description).toBe('Transfer From Account #10001');
    expect(income.acc_id).toBe(10002);
  });

  it('both should reference the transfer that originated them', () => {
    expect(income.transfer_id).toBe(transferId);
    expect(outcome.transfer_id).toBe(transferId);
  });

  it('both should return status like true', () => {
    expect(income.status).toBe(true);
    expect(outcome.status).toBe(true);
  });
});

describe('When trying to save an invalid transfer', () => {
  const testTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('Authorization', TOKEN)
      .send({
        description: 'Regular Transfer',
        user_id: 10001,
        acc_ori_id: 10001,
        acc_dest_id: 10002,
        date: new Date(),
        amount: 176,
        ...newData,
      })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', errorMessage);
      });
  };

  it('should not be inserted without description', () => testTemplate({ description: undefined }, 'Description is a mandatory attribute!'));
  it('should not be inserted without amount', () => testTemplate({ amount: null }, 'Amount is a mandatory attribute!'));
  it('should not be inserted without date', () => testTemplate({ date: null }, 'Date is a mandatory attribute!'));
  it('should not be inserted without origin account', () => testTemplate({ acc_ori_id: null }, 'Origin account is a mandatory attribute!'));
  it('should not be inserted without destiny account', () => testTemplate({ acc_dest_id: null }, 'Destiny account is a mandatory attribute!'));
  it('should not be insert if the origin and destination accounts are the same', () => testTemplate({ acc_dest_id: 10001 }, 'The origin and destination account must not be the same!'));

  it('should not insert if the accounts belong to another user', () => testTemplate({ acc_dest_id: 10003 }, 'Account belongs to another user'));
});

it('should return a transfer by id', () => {
  return request(app).get(`${MAIN_ROUTE}/10001`).set('Authorization', TOKEN)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('First Transfer');
    });
});

describe('When to update an valid transfer...', () => {
  let transferId;
  let income;
  let outcome;

  it('should return status 200 and transfer data', () => {
    return request(app).put(`${MAIN_ROUTE}/10001`)
      .set('Authorization', TOKEN)
      .send({
        description: 'Update Transfer',
        user_id: 10001,
        acc_ori_id: 10001,
        acc_dest_id: 10002,
        date: new Date(),
        amount: 500,
      })
      .then(async (res) => {
        expect(res.status).toBe(200);
        expect(res.body.description).toBe('Update Transfer');
        expect(res.body.amount).toBe('500.00');

        transferId = res.body.id;
      });
  });

  it('equivalent transactions should have been generated', () => {
    return app.db('transactions').where({ transfer_id: transferId }).orderBy('amount')
      .then((transactions) => {
        expect(transactions).toHaveLength(2);

        [outcome, income] = transactions;
      });
  });

  it('incoming transaction should be negative', () => {
    expect(outcome.type).toBe('O');
    expect(outcome.amount).toBe('-500.00');
    expect(outcome.description).toBe('Transfer To Account #10002');
    expect(outcome.acc_id).toBe(10001);
  });

  it('incoming transaction should be positive', () => {
    expect(income.type).toBe('I');
    expect(income.amount).toBe('500.00');
    expect(income.description).toBe('Transfer From Account #10001');
    expect(income.acc_id).toBe(10002);
  });

  it('both should reference the transfer that originated them', () => {
    expect(income.transfer_id).toBe(transferId);
    expect(outcome.transfer_id).toBe(transferId);
  });
});

describe('When to update an invalid transfer...', () => {
  const testTemplate = (newData, errorMessage) => {
    return request(app).put(`${MAIN_ROUTE}/10001`)
      .set('Authorization', TOKEN)
      .send({
        description: 'Regular Transfer',
        user_id: 10001,
        acc_ori_id: 10001,
        acc_dest_id: 10002,
        date: new Date(),
        amount: 176,
        ...newData,
      })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', errorMessage);
      });
  };

  it('should not be inserted without description', () => testTemplate({ description: undefined }, 'Description is a mandatory attribute!'));
  it('should not be inserted without amount', () => testTemplate({ amount: null }, 'Amount is a mandatory attribute!'));
  it('should not be inserted without date', () => testTemplate({ date: null }, 'Date is a mandatory attribute!'));
  it('should not be inserted without origin account', () => testTemplate({ acc_ori_id: null }, 'Origin account is a mandatory attribute!'));
  it('should not be inserted without destiny account', () => testTemplate({ acc_dest_id: null }, 'Destiny account is a mandatory attribute!'));
  it('should not be insert if the origin and destination accounts are the same', () => testTemplate({ acc_dest_id: 10001 }, 'The origin and destination account must not be the same!'));

  it('should not insert if the accounts belong to another user', () => testTemplate({ acc_dest_id: 10003 }, 'Account belongs to another user'));
});

describe('When removing a transfer...', () => {
  it('should return status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10001`)
      .set('Authorization', TOKEN)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  it('the record should have been removed from the bank', () => {
    return app.db('transfers').where({ id: 10001 })
      .then((res) => {
        expect(res).toHaveLength(0);
      });
  });

  it('associated transactions should have been removed', () => {
    return app.db('transactions').where({ transfer_id: 10001 })
      .then((res) => {
        expect(res).toHaveLength(0);
      });
  });
});

it('should not to delete a transfer other user', () => {
  return request(app).delete(`${MAIN_ROUTE}/10002`)
    .set('Authorization', TOKEN)
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'You are not allowed to do this');
    });
});
