exports.seed = (knex) => {
  return knex('transactions').del()
    .then(() => knex('transfers').del())
    .then(() => knex('accounts').del())
    .then(() => knex('users').del())
    .then(() => knex('users').insert([
      { id: 10001, name: 'First User', email: 'user_01@email.com', password: '$2a$10$WRkRYEUgs0hg1ZgPW5A0Due3YJR4cKVM8sG6qHhf7tjzvEeziOuXO' },
      { id: 10002, name: 'Second User ', email: 'user_02@email.com', password: '$2a$10$WRkRYEUgs0hg1ZgPW5A0Due3YJR4cKVM8sG6qHhf7tjzvEeziOuXO' },
    ]))
    .then(() => knex('accounts').insert([
      { id: 10001, name: 'First Account O.', user_id: 10001 },
      { id: 10002, name: 'First Account D.', user_id: 10001 },
      { id: 10003, name: 'Second Account O.', user_id: 10002 },
      { id: 10004, name: 'Second Account D.', user_id: 10002 },
    ]))
    .then(() => knex('transfers').insert([
      { id: 10001, description: 'First Transfer', user_id: 10001, acc_ori_id: 10001, acc_dest_id: 10002, amount: 100, date: new Date() },
      { id: 10002, description: 'Second Transfer', user_id: 10002, acc_ori_id: 10003, acc_dest_id: 10004, amount: 100, date: new Date() },
    ]))
    .then(() => knex('transactions').insert([
      { id: 10001, description: 'Transfer from First Account O. ', date: new Date(), amount: 100, type: 'I', acc_id: 10002, transfer_id: 10001 },
      { id: 10002, description: 'Transfer from First Account D. ', date: new Date(), amount: -100, type: 'O', acc_id: 10001, transfer_id: 10001 },
      { id: 10003, description: 'Transfer from Second Account O. ', date: new Date(), amount: 100, type: 'I', acc_id: 10004, transfer_id: 10002 },
      { id: 10004, description: 'Transfer from Second Account D. ', date: new Date(), amount: -100, type: 'O', acc_id: 10003, transfer_id: 10002 },
    ]));
};
