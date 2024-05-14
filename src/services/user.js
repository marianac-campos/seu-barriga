const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = (filter = {}) => {
    return app.db('users').where(filter).select();
  };

  const save = async (user) => {
    const { name, email, password } = user;

    if (!name) throw new ValidationError('Name is a mandatory attribute!');
    if (!email) throw new ValidationError('Email is a mandatory attribute!');
    if (!password) throw new ValidationError('Password is a mandatory attribute!');

    const userDb = await findAll({ email });

    if (userDb && userDb.length > 0) throw new ValidationError('User already created!');

    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
