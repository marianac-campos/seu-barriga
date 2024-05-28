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

describe('Ao salvar uma transferência válida...', () => {
  let transferId;
  let income;
  let outcome;

  it('Deve retornar o status 201 e os dados de transferência', () => {
    return request(app).post(MAIN_ROUTE)
      .set('Authorization', TOKEN)
      .send({ description: 'Regular Transfer', user_id: 10001, acc_ori_id: 10001, acc_dest_id: 10002, date: new Date(), amount: 176 })
      .then(async (res) => {
        expect(res.status).toBe(201);
        expect(res.body[0].description).toBe('Regular Transfer');

        transferId = res.body[0].id;
      });
  });

  it('as transações equivalentes devem ter sido geradas', () => {
    return app.db('transactions').where({ transfer_id: transferId }).orderBy('amount')
      .then((transactions) => {
        expect(transactions).toHaveLength(2);

        [outcome, income] = transactions;
      });
  });

  it('a transação de saída deve ser negativa', () => {
    expect(outcome.type).toBe('O');
    expect(outcome.amount).toBe('-176.00');
    expect(outcome.description).toBe('Transfer To Account #10002');
    expect(outcome.acc_id).toBe(10001);
  });

  it('a transação de entrada deve ser positiva', () => {
    expect(income.type).toBe('I');
    expect(income.amount).toBe('176.00');
    expect(income.description).toBe('Transfer From Account #10001');
    expect(income.acc_id).toBe(10002);
  });

  it('ambas devem referenciar a transferência que as originou', () => {
    expect(income.transfer_id).toBe(transferId);
    expect(outcome.transfer_id).toBe(transferId);
  });
});

describe('Ao tentar salvar uma transferência inválida', () => {
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

  it('não deve inserir sem descrição', () => testTemplate({ description: undefined }, 'Description is a mandatory attribute!'));
  it('não deve inserir sem valor', () => testTemplate({ amount: null }, 'Amount is a mandatory attribute!'));
  it('não deve inserir sem data', () => testTemplate({ date: null }, 'Date is a mandatory attribute!'));
  it('não deve inserir sem conta de origem', () => testTemplate({ acc_ori_id: null }, 'Origin account is a mandatory attribute!'));
  it('não deve inserir sem conta de destino', () => testTemplate({ acc_dest_id: null }, 'Destiny account is a mandatory attribute!'));
  it('não deve inserir se as contas de origem e destino forem a mesma', () => testTemplate({ acc_dest_id: 10001 }, 'The origin and destination account must not be the same!'));

  it('não deve inserir se as contas pertencerem a outro usuário', () => testTemplate({ acc_dest_id: 10003 }, 'Account belongs to another user'));
});

it('deve retornar uma transferência por id', () => {
  return request(app).get(`${MAIN_ROUTE}/10001`).set('Authorization', TOKEN)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('First Transfer');
    });
});

describe('Ao atualizar uma transferência válida...', () => {
  let transferId;
  let income;
  let outcome;

  it('Deve retornar o status 200 e os dados de transferência', () => {
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

  it('as transações equivalentes devem ter sido geradas', () => {
    return app.db('transactions').where({ transfer_id: transferId }).orderBy('amount')
      .then((transactions) => {
        expect(transactions).toHaveLength(2);

        [outcome, income] = transactions;
      });
  });

  it('a transação de saída deve ser negativa', () => {
    expect(outcome.type).toBe('O');
    expect(outcome.amount).toBe('-500.00');
    expect(outcome.description).toBe('Transfer To Account #10002');
    expect(outcome.acc_id).toBe(10001);
  });

  it('a transação de entrada deve ser positiva', () => {
    expect(income.type).toBe('I');
    expect(income.amount).toBe('500.00');
    expect(income.description).toBe('Transfer From Account #10001');
    expect(income.acc_id).toBe(10002);
  });

  it('ambas devem referenciar a transferência que as originou', () => {
    expect(income.transfer_id).toBe(transferId);
    expect(outcome.transfer_id).toBe(transferId);
  });
});

describe('Ao tentar atualizar uma transferência inválida', () => {
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

  it('não deve inserir sem descrição', () => testTemplate({ description: undefined }, 'Description is a mandatory attribute!'));
  it('não deve inserir sem valor', () => testTemplate({ amount: null }, 'Amount is a mandatory attribute!'));
  it('não deve inserir sem data', () => testTemplate({ date: null }, 'Date is a mandatory attribute!'));
  it('não deve inserir sem conta de origem', () => testTemplate({ acc_ori_id: null }, 'Origin account is a mandatory attribute!'));
  it('não deve inserir sem conta de destino', () => testTemplate({ acc_dest_id: null }, 'Destiny account is a mandatory attribute!'));
  it('não deve inserir se as contas de origem e destino forem a mesma', () => testTemplate({ acc_dest_id: 10001 }, 'The origin and destination account must not be the same!'));

  it('não deve inserir se as contas pertencerem a outro usuário', () => testTemplate({ acc_dest_id: 10003 }, 'Account belongs to another user'));
});

describe('Ao remover uma transferência', () => {
  it('deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10001`)
      .set('Authorization', TOKEN)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  it('o registro deve ter sido removido do banco', () => {
    return app.db('transfers').where({ id: 10001 })
      .then((res) => {
        expect(res).toHaveLength(0);
      });
  });

  it('as transações associadas devem ter sido removidas', () => {
    return app.db('transactions').where({ transfer_id: 10001 })
      .then((res) => {
        expect(res).toHaveLength(0);
      });
  });
});

it('should not to delete a transaction other user', () => {
  return request(app).delete(`${MAIN_ROUTE}/10002`)
    .set('Authorization', TOKEN)
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'You are not allowed to do this');
    });
});
