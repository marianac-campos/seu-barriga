exports.seed = (knex) => {
  return knex('users').insert([
    { id: 10101, name: 'Third User', email: 'user_03@email.com', password: '$2a$10$WRkRYEUgs0hg1ZgPW5A0Due3YJR4cKVM8sG6qHhf7tjzvEeziOuXO' },
    { id: 10102, name: 'Forty User ', email: 'user_04@email.com', password: '$2a$10$WRkRYEUgs0hg1ZgPW5A0Due3YJR4cKVM8sG6qHhf7tjzvEeziOuXO' },
  ])
    .then(() => knex('accounts').insert([
      { id: 10101, name: 'Account Main Balance', user_id: 10101 },
      { id: 10102, name: 'Account Secondary Balance', user_id: 10101 },
      { id: 10103, name: 'Account Alternative 1', user_id: 10102 },
      { id: 10104, name: 'Second Alternative 2', user_id: 10102 },
    ]));
};
